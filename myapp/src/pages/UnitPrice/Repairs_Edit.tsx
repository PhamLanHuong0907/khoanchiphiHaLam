import React, { useEffect, useState, useMemo } from "react";
import LayoutInput from "../../layout/layout_input";
// Import TransactionRow GỐC (không có materialId)
import TransactionSelector, {
type TransactionRow as ImportedTransactionRow,
} 
from "../../components/transactionselector";
import PATHS from "../../hooks/path";
import { useApi } from "../../hooks/useFetchData";
import DropdownMenuSearchable from "../../components/dropdown_menu_searchable";

// 1. Cập nhật Props: Thêm 'id'
interface Repairs_EditProps {
 id: string; // ID của bản ghi cần chỉnh sửa
 onClose?: () => void;
 onSuccess?: () => void;
}

// 2. Interface (Chung)
interface DropdownOption {
 value: string;
 label: string;
 data?: any; // Để lưu trữ thông tin bổ sung
}

// 3. Interfaces (API Payloads)
interface Process {
 id: string;
 name: string;
}
interface Passport {
 id: string;
 name: string;
}
interface Hardness {
 id: string;
 value: string;
}
interface AssignmentCode {
 id: string;
 code: string;
 name: string;
}
interface Material {
 id: string;
 code: string;
 name: string;
 assigmentCodeId: string;
 costAmmount: number;
}

// 4. Interface (State nội bộ)
interface LocalTransactionRow extends ImportedTransactionRow {
 materialId: string;
 assignmentCodeId: string; // <-- ID của Mã giao khoán
}

// 5. Interface (GET by ID Payload)
// Khớp với JSON 'result' bạn cung cấp
interface RepairsUnitPriceRecord {
 id: string;
 code: string;
 name: string;
 materialCost: Array<{
 assignmentCodeId: string;
 assignmentCode: string;
 costs: Array<{
   materialId: string;
   materialCode: string;
   materialName: string;
   cost: number;
   quantity: number;
   totalPrice: number;
   unitOfMeasureName: string;
  }>;
 }>;
}

export default function RepairsEdit({
 id,
 onClose,
 onSuccess,
}: Repairs_EditProps) {

// ====== BẮT ĐẦU SỬA ĐỔI 1: Thêm 2 HÀM TIỆN ÍCH ======
/**
 * (ĐỊNH MỨC) Chuyển đổi chuỗi (VD: "123,4") sang số (123.4)
 */
 const parseLocalFloat = (str: string | undefined | null): number => {
  if (!str) return 0;
  // 1. Xóa tất cả dấu chấm (ngăn cách hàng nghìn)
  // 2. Thay dấu phẩy (thập phân) bằng dấu chấm
  const cleanStr = str.replace(/\./g, "").replace(',', '.');
  return parseFloat(cleanStr || "0");
 };

/**
 * (ĐƠN GIÁ/THÀNH TIỀN) Chuyển đổi số (VD: 100000) thành chuỗi ("100.000")
 */
const formatNumberForDisplay = (value: number | undefined | null): string => {
if (value === null || value === undefined) return "0"; 
return new Intl.NumberFormat('de-DE').format(value);
};
// ====== KẾT THÚC SỬA ĐỔI 1 ======


 // 6. ====== API setup ======
 const basePath = "/api/pricing/slideunitprice";

 // Hook để lấy 'fetchById' (dùng basePath)
 const { fetchById, error: fetchByIdError } = useApi(basePath, {
  autoFetch: false,
 });

 // Hook để PUT (dùng đường dẫn đầy đủ)
 const putPath = `${basePath}`;
 const {
  putData,
  loading: saving,
  error: saveError,
 } = useApi(putPath, {
  autoFetch: false,
 });

 // API GET Dropdowns (Giống file Input)
 const {
  fetchData: fetchProcesses,
  data: processes,
  loading: ld2,
 } = useApi<Process>("/api/process/processgroup?pageIndex=1&pageSize=10000");
 const {
  fetchData: fetchPassports,
  data: passports,
  loading: ld3,
 } = useApi<Passport>("/api/product/passport?pageIndex=1&pageSize=10000");
 const {
  fetchData: fetchHardness,
  data: hardness,
  loading: ld4,
 } = useApi<Hardness>("/api/product/hardness?pageIndex=1&pageSize=10000");
 const {
  fetchData: fetchAssignmentCodes,
  data: assignmentData,
  loading: ld7,
 } = useApi<any>("/api/catalog/assignmentcode?pageIndex=1&pageSize=10000");
 const {
  fetchData: fetchMaterials,
  data: materialsData,
  loading: ld8,
 } = useApi<any>("/api/catalog/material?pageIndex=1&pageSize=10000");

 // 7. ====== State ======
 const [selectedProcess, setSelectedProcess] = useState<string>("");
 const [selectedPassport, setSelectedPassport] = useState<string>("");
 const [selectedHardness, setSelectedHardness] = useState<string>("");
 const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
// State `rows` lưu SỐ THÔ (number) cho unitPrice/total
 const [rows, setRows] = useState<LocalTransactionRow[]>([]);

 // State cho việc tải dữ liệu
 const [isDropdownLoading, setIsDropdownLoading] = useState(true);
 const [isRecordLoading, setIsRecordLoading] = useState(true);
 const [record, setRecord] = useState<RepairsUnitPriceRecord | null>(null);

 // 8. ====== Load dropdowns ======
 useEffect(() => {
  const fetchAllData = async () => {
   setIsDropdownLoading(true);
   try {
    // Chỉ fetch các API có trong file Input
    await Promise.allSettled([
     fetchProcesses(),
     fetchPassports(),
     fetchHardness(),
     fetchAssignmentCodes(),
     fetchMaterials(),
    ]);
   } catch (error) {
    console.error("Lỗi không mong đợi khi tải dropdowns:", error);
   } finally {
    setIsDropdownLoading(false);
   }
  };
  fetchAllData();
 }, [
  fetchProcesses,
  fetchPassports,
  fetchHardness,
  fetchAssignmentCodes,
  fetchMaterials,
 ]);

 // 9. ====== Load bản ghi ======
 useEffect(() => {
  if (!id) {
   setIsRecordLoading(false);
   return;
  }
  const loadRecord = async () => {
   setIsRecordLoading(true);
   try {
    const data = await fetchById(id); // useFetchData đã xử lý {result: ...}
    if (data) {
     setRecord(data as RepairsUnitPriceRecord);
    } else {
     console.error("Không tìm thấy bản ghi với ID:", id);
    }
   } catch (err) {
    console.error("Lỗi khi tải bản ghi:", err);
   } finally {
    setIsRecordLoading(false);
   }
  };
  loadRecord();
 }, [id, fetchById]);


 // 10. ====== Map options / data (useMemo) ======
 // (Giống file Input, đã fix lỗi)
 const allMaterials: Material[] = useMemo(() => {
  if (!materialsData) return [];
  if (
   Array.isArray(materialsData) &&
   materialsData.length > 0 &&
   materialsData[0] &&
   materialsData[0].items
  ) {
   return materialsData[0].items;
  }
  if (Array.isArray(materialsData)) return materialsData;
  return [];
 }, [materialsData]);

 // Bọc useMemo để fix lỗi vòng lặp (tương tự file Edit trước)
 const processOptions: DropdownOption[] = useMemo(
  () => processes?.map((p) => ({ value: p.id, label: p.name })) || [],
  [processes]
 );
 const passportOptions: DropdownOption[] = useMemo(
  () => passports?.map((p) => ({ value: p.id, label: p.name })) || [],
  [passports]
 );
 const hardnessOptions: DropdownOption[] = useMemo(
  () => hardness?.map((h) => ({ value: h.id, label: h.value })) || [],
  [hardness]
 );

 // (Giống file Input, đã fix lỗi)
 const assignmentCodeOptions: DropdownOption[] = useMemo(() => {
  if (!assignmentData) return [];
  if (
   Array.isArray(assignmentData) &&
   assignmentData.length > 0 &&
   assignmentData[0] &&
   assignmentData[0].items
  ) {
   return assignmentData[0].items.map((a: AssignmentCode) => ({
    value: a.id,
    label: a.code,
   }));
  }
  if (Array.isArray(assignmentData)) {
   return assignmentData.map((a: AssignmentCode) => ({
    value: a.id,
    label: a.code,
   }));
  }
  return [];
 }, [assignmentData]);

 // (Giống file Input, đã fix lỗi)
 const assignmentCodeMap = useMemo(() => {
  if (!assignmentData) return new Map<string, string>();
  let codesArray: AssignmentCode[] = [];
  if (
   Array.isArray(assignmentData) &&
   assignmentData.length > 0 &&
   assignmentData[0] &&
   assignmentData[0].items
  ) {
   codesArray = assignmentData[0].items;
  } else if (Array.isArray(assignmentData)) {
   codesArray = assignmentData;
  }
  return new Map<string, string>(
   codesArray.map((a: AssignmentCode) => [a.id, a.code])
  );
 }, [assignmentData]);


 // 11A. ====== Populate Dropdowns & Rows ======
 useEffect(() => {
  // Chờ tất cả dữ liệu (record VÀ dropdowns) sẵn sàng
  if (
   !record ||
   isDropdownLoading ||
   !allMaterials.length ||
   !assignmentCodeMap.size ||
   !processOptions.length ||
   !passportOptions.length ||
   !hardnessOptions.length
  ) {
   return;
  }

  console.log("Populating form (Dropdowns & Rows) với dữ liệu:", record);

  // === PHẦN 1: Xử lý Dropdowns từ 'record.name' ===
  const findIdByLabel = (
   options: DropdownOption[],
   label: string
  ): string => {
   if (!label) return "";
   const normalizedLabel = label.toLowerCase().trim();

   let found = options.find(
    (opt) => opt.label.toLowerCase().trim() === normalizedLabel
   );
   if (found) return found.value;

   found = options.find((opt) =>
    normalizedLabel.includes(opt.label.toLowerCase().trim())
   );
   if (found) return found.value;

   found = options.find((opt) =>
    opt.label.toLowerCase().trim().includes(normalizedLabel)
   );
   if (found) return found.value;

   console.warn(`Không tìm thấy ID cho label: "${label}"`);
   return "";
  };

  // "Đào lò, H/c 1A; Sđ=6.4; Sc=5.1, f ≤ 2, ..."
  const parseName = (name: string) => {
   const parts = name.split(",").map((p) => p.trim());
   return {
    process: parts[0] || "", // "Đào lò"
    passport: parts[1] || "", // "H/c 1A; Sđ=6.4; Sc=5.1"
    hardness: parts[2] || "", // "f ≤ 2"
   };
  };

  const labels = parseName(record.name);

  // 1. Điền state cho các dropdown
  setSelectedProcess(findIdByLabel(processOptions, labels.process));
  setSelectedPassport(findIdByLabel(passportOptions, labels.passport));
  setSelectedHardness(findIdByLabel(hardnessOptions, labels.hardness));
  
  // === PHẦN 2: Xử lý Bảng (TransactionSelector) ===
  const newRows: LocalTransactionRow[] = [];
  const newSelectedCodes: string[] = [];

  if (Array.isArray(record.materialCost)) {
   record.materialCost.forEach((mgk) => {
    if (!newSelectedCodes.includes(mgk.assignmentCodeId)) {
     newSelectedCodes.push(mgk.assignmentCodeId);
    }

    if (Array.isArray(mgk.costs)) {
     mgk.costs.forEach((cost) => {
      const unitPrice = cost.cost || 0;
// ====== BẮT ĐẦU SỬA ĐỔI 2: Định dạng (,) cho 'quantity' khi GET ======
// Chuyển số (123.4) thành chuỗi ("123,4")
      const quantityString = String(cost.quantity || "0").replace('.', ',');
// Dùng parseLocalFloat (hàm mới) để tính toán
      const quantityNumber = parseLocalFloat(quantityString); 
      const total = isNaN(quantityNumber)
       ? 0
       : quantityNumber * unitPrice;

      newRows.push({
       id: `r${Date.now()}-${mgk.assignmentCodeId}-${cost.materialId}`,
       code: mgk.assignmentCode,
       assignmentCodeId: mgk.assignmentCodeId,
       materialId: cost.materialId,
       assetCode: cost.materialCode,
       unitPrice: unitPrice, // <-- Lưu SỐ THÔ (number)
       quantity: quantityString, // <-- Lưu CHUỖI CÓ DẤU PHẨY (string)
       total: total, // <-- Lưu SỐ THÔ (number)
      });
// ====== KẾT THÚC SỬA ĐỔI 2 ======
     });
    }
   });
  }

  setRows(newRows);
  setSelectedCodes(newSelectedCodes);
 }, [
  record,
  isDropdownLoading,
  allMaterials,
  assignmentCodeMap,
  processOptions, 
  passportOptions, 
  hardnessOptions,
 ]); 

 // 12. ====== TransactionSelector Handlers ======
 // (Hàm này không thay đổi, nó lưu SỐ THÔ (number) vào state)
 const handleSelectChange = (newSelectedIds: string[]) => {
  setSelectedCodes(newSelectedIds); 

  if (!allMaterials || !assignmentCodeMap.size) return;

  const oldRows = [...rows];
  const newRows: LocalTransactionRow[] = [];

  newSelectedIds.forEach((codeId) => {
   const assignmentCodeValue = assignmentCodeMap.get(codeId) || codeId;

   const materialsForThisCode = allMaterials.filter(
    (m) => m.assigmentCodeId === codeId
   );

   materialsForThisCode.forEach((material) => {
    const existingRow = oldRows.find(
     (r) =>
      r.assignmentCodeId === codeId && r.materialId === material.id
    );

    if (existingRow) {
     existingRow.code = assignmentCodeValue;
     newRows.push(existingRow);
    } else {
     newRows.push({
      id: `r${Date.now()}-${codeId}-${material.id}`,
      code: assignmentCodeValue, 
      assignmentCodeId: codeId, 
      materialId: material.id,
      assetCode: material.code, 
      unitPrice: material.costAmmount || 0, // <-- Lưu SỐ THÔ (number)
      quantity: "0", // <-- Lưu CHUỖI (string)
      total: 0, // <-- Lưu SỐ THÔ (number)
     });
    }
   });
  });

  setRows(newRows);
 };

// ====== BẮT ĐẦU SỬA ĐỔI 3: Cập nhật handleRowChange (cho Định mức) ======
 const handleRowChange = (
  id: string,
  field: keyof ImportedTransactionRow,
  value: string
 ) => {
  // Chỉ áp dụng logic cho trường 'quantity' (Định mức)
  if (field !== "quantity") return;

  const rawValue = value;

  // 1. CHẶN DẤU CHẤM: Xóa tất cả dấu chấm ('.') theo yêu cầu
  const cleanValue = rawValue.replace(/\./g, "");

  // 2. KIỂM TRA HỢP LỆ:
  // Chỉ cho phép (số) hoặc (số + 1 dấu phẩy + số)
  if (!/^[0-9]*(,[0-9]*)?$/.test(cleanValue)) {
   return; // Nếu nhập không hợp lệ (vd: "12,3,4" hoặc "abc"), thì không cập nhật
  }

  // 3. 'cleanValue' bây giờ là hợp lệ (vd: "1234,5" hoặc "123" hoặc "123,")
  // Tiến hành cập nhật state
  setRows((prevRows) =>
   prevRows.map((row) => {
    if (row.id === id) {
     // 4. Cập nhật state 'quantity' với giá trị chuỗi (vd: "1234,5")
     const updatedRow = { ...row, quantity: cleanValue };

     // 5. Tính toán 'total' dùng hàm parse mới
     const quantityNumber = parseLocalFloat(cleanValue); // Dùng hàm parse mới
     const unitPrice = updatedRow.unitPrice ?? 0;
     updatedRow.total = isNaN(quantityNumber)
      ? 0
      : quantityNumber * unitPrice; // <-- 'total' vẫn là SỐ THÔ (number)
     return updatedRow;
    }
    return row;
   })
  );
 };
// ====== KẾT THÚC SỬA ĐỔI 3 ======

 const handleRemoveRow = (id: string) => {
  setRows((prevRows) => prevRows.filter(row => row.id !== id));
 };


 // 13. ====== Handle Submit (Chuyển sang PUT) ======
 const handleSubmit = async (data: Record<string, string>) => {
  const code = data["Mã định mức máng trượt"]?.trim() || "";

  // Validation (Giữ nguyên)
  if (!code) return alert("⚠️ Vui lòng nhập Mã định mức máng trượt!");
  if (!selectedProcess)
   return alert("⚠️ Vui lòng chọn Nhóm công đoạn sản xuất!");
  if (!selectedPassport) return alert("⚠️ Vui lòng chọn Hộ chiếu!");
  if (!selectedHardness) return alert("⚠️ Vui lòng chọn Độ kiên cố!");
  if (rows.length === 0)
   return alert("⚠️ Vui lòng chọn ít nhất một Mã giao khoán!");

// ====== BẮT ĐẦU SỬA ĐỔI 4: Cập nhật Validation (cho Định mức) ======
  for (const row of rows) {
   const quantity = parseLocalFloat(row.quantity); // <-- SỬA: Dùng hàm parse mới
   if (isNaN(quantity) || quantity <= 0) {
    const mgkLabel = row.code;
    return alert(
     `⚠️ Vui lòng nhập Số lượng (Định mức) hợp lệ cho Vật tư "${row.assetCode}" (MGK: ${mgkLabel})!`
    );
   }
  }
// ====== KẾT THÚC SỬA ĐỔI 4 ======

  // Tạo payload (Theo mẫu PUT JSON)
  const payload = {
   id: id, // <-- THÊM ID VÀO PAYLOAD
   code,
   processGroupId: selectedProcess,
   passportId: selectedPassport,
   hardnessId: selectedHardness,
   costs: rows.map((row) => ({
    assignmentCodeId: row.assignmentCodeId,
    materialId: row.materialId,
// ====== BẮT ĐẦU SỬA ĐỔI 5: Cập nhật Payload (cho Định mức) ======
    quantity: parseLocalFloat(row.quantity), // <-- SỬA: Dùng hàm parse mới
// ====== KẾT THÚC SỬA ĐỔI 5 ======
   })),
  };

  console.log("📤 PUT payload:", payload);

  // Dùng putData
  await putData(payload, () => {
   console.log("✅ Cập nhật đơn giá máng trượt thành công!");
   onSuccess?.();
   onClose?.();
  });
 };

 // 14. ====== Fields (LayoutInput) ======
 const fields = [
  {
   label: "Mã định mức máng trượt",
   type: "text" as const,
   placeholder: "Nhập mã định mức máng trượt",
  },
  { type: "custom2" as const },
  { type: "custom3" as const },
  { type: "custom4" as const },
  { label: "", type: "customTransactionSelector" as const },
 ];

 // Chỉ loading khi 'saving' (submit)
 const isLoading = saving;
 // Lỗi bao gồm lỗi save HOẶC lỗi fetch
 const anyError = saveError || fetchByIdError;

 // 15. ====== Render ======
 
 // Tính 'initialData' bằng useMemo để fix lỗi race condition
 const computedInitialData = useMemo(() => {
  return {
   "Mã định mức máng trượt": record?.code || ""
  };
 }, [record]);


// ====== BẮT ĐẦU SỬA ĐỔI 6: Tạo 'displayRows' (cho Đơn giá/Thành tiền) ======
// 'displayRows' này sẽ chuyển đổi 'unitPrice' và 'total' (là SỐ THÔ)
// thành CHUỖI ĐÃ ĐỊNH DẠNG ("100.000")
const displayRows = useMemo(() => {
return rows.map(row => ({
...row,
// Chuyển đổi SỐ THÔ (number) -> CHUỖI ĐỊNH DẠNG (string)
unitPrice: formatNumberForDisplay(row.unitPrice),
total: formatNumberForDisplay(row.total),
}));
}, [rows]); // Tự động tính toán lại khi 'rows' thay đổi
// ====== KẾT THÚC SỬA ĐỔI 6 ======


 return (
  <LayoutInput
   // THAY ĐỔI: Cập nhật tiêu đề
   title01="Đơn giá và định mức / Đơn giá và định mức Máng trượt"
   title="Cập nhật Đơn giá và định mức Máng trượt"
   fields={fields}
   onSubmit={handleSubmit}
   closePath={PATHS.REPAIRS.LIST}
   onClose={onClose}
   
   // Dùng computedInitialData và key
   initialData={computedInitialData}
   key={record?.id} 
   
   isLoading={isLoading}
   error={anyError}
  >
   {/* 16. Render Dropdowns (Giống file Input) */}

   <div className="custom2" key="c2">
    <DropdownMenuSearchable
     label="Nhóm công đoạn sản xuất"
     options={processOptions}
     value={selectedProcess}
     onChange={setSelectedProcess}
     placeholder="Chọn nhóm công đoạn sản xuất"
     isDisabled={ld2}
    />
   </div>
   <div className="custom3" key="c3">
    <DropdownMenuSearchable
     label="Hộ chiếu, Sđ, Sc"
     options={passportOptions}
     value={selectedPassport}
     onChange={setSelectedPassport}
     placeholder="Chọn hộ chiếu"
     isDisabled={ld3}
    />
   </div>
   <div className="custom4" key="c4">
    <DropdownMenuSearchable
     label="Độ kiên cố đá/ than (f)"
     options={hardnessOptions}
     value={selectedHardness}
     onChange={setSelectedHardness}
    placeholder="Chọn độ kiên cố"
     isDisabled={ld4}
    />
   </div>
   
   {/* ====== BẮT ĐẦU SỬA ĐỔI 7: Truyền 'displayRows' ====== */}
   <TransactionSelector
    label="Mã giao khoán"
    className="customTransactionSelector"
    options={assignmentCodeOptions} // Dropdown dùng code
    selectedCodes={selectedCodes}
    
// SỬA: Truyền 'displayRows' (đã định dạng) thay vì 'rows' (số thô)
 rows={displayRows as any} 
    
    onSelectChange={handleSelectChange}
    onRowChange={handleRowChange}
    onRemoveRow={handleRemoveRow}
   />
{/* ====== KẾT THÚC SỬA ĐỔI 7 ====== */}
  </LayoutInput>
 );
}