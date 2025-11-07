import React, { useEffect, useState, useMemo } from "react";
import LayoutInput from "../../layout/layout_input";
// Import TransactionRow GỐC (không có materialId)
import TransactionSelector, {
 type TransactionRow as ImportedTransactionRow,
} from "../../components/transactionselector";
import PATHS from "../../hooks/path";
import { useApi } from "../../hooks/useFetchData";
import DropdownMenuSearchable from "../../components/dropdown_menu_searchable";

// 1. Cập nhật Props: Thêm 'id'
interface Materials_Ingredient_EditProps {
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
interface InsertItem {
 id: string;
 value: string;
}
interface SupportStep {
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
 assigmentCodeId: string; // Tên này từ file Input (lẽ ra là assignmentCodeId)
 costAmmount: number;
}

// 4. Interface (State nội bộ)
// (rows state sẽ lưu 'unitPrice' và 'total' là NUMBER)
interface LocalTransactionRow extends ImportedTransactionRow {
 materialId: string;
 assignmentCodeId: string; // <-- ID của Mã giao khoán
}

// Interface này phải khớp với cấu trúc JSON (GET by ID) mà bạn cung cấp
interface MaterialUnitPriceRecord {
 id: string;
 code: string;
 name: string; // Dùng để parse ra các dropdown

 // Cấu trúc lồng nhau từ JSON (materialCost)
 materialCost: Array<{
  assignmentCodeId: string;
  assignmentCode: string; // "VLN"
  costs: Array<{
   materialId: string;
   materialCode: string; // "TN"
   materialName: string;
   cost: number; // Đây là unitPrice
   quantity: number;
   totalPrice: number;
   unitOfMeasureName: string;
  }>;
 }>;
}

export default function Materials_Ingredient_Edit({
 id,
 onClose,
 onSuccess,
}: Materials_Ingredient_EditProps) {

  // ====== BẮT ĐẦU SỬA ĐỔI 1: Cập nhật Hàm Tiện Ích ======
  /**
   * (INPUT/OUTPUT) Định dạng SỐ -> CHUỖI (vd: 1234.56 -> "1.234,56")
   * Yêu cầu: Dấu phẩy (,) thập phân, tối đa 4 số.
   */
  const formatLocalFloat = (num: number | undefined | null): string => {
    if (num === null || num === undefined) return "0";
    return new Intl.NumberFormat('vi-VN', { // 'vi-VN' dùng ',' thập phân
      maximumFractionDigits: 4,
    }).format(num);
  };
  
  /**
   * (INPUT - PARSE) Chuyển đổi CHUỖI (vd: "1.234,56") -> SỐ (1234.56)
   */
 const parseLocalFloat = (str: string | undefined | null): number => {
  if (!str) return 0;
  // 1. Xóa tất cả dấu chấm (ngăn cách hàng nghìn)
  // 2. Thay dấu phẩy (thập phân) bằng dấu chấm
  const cleanStr = String(str).replace(/\./g, "").replace(',', '.');
  return parseFloat(cleanStr || "0");
 };

  /**
   * (INPUT - HIỂN THỊ) Định dạng CHUỖI NHẬP (vd: "1234,5") -> CHUỖI HIỂN THỊ (vd: "1.234,5")
   * (Để thêm dấu chấm động khi gõ)
   */
  const formatForInput = (str: string | undefined | null): string => {
    if (str === null || str === undefined) return "";
    if (str === "") return ""; // Giữ lại giá trị rỗng
    
    // Tách phần nguyên và phần thập phân
    const parts = String(str).split(',');
    // Làm sạch phần nguyên (chỉ giữ số)
    const intPart = parts[0].replace(/[^0-9]/g, '');
    
    // Định dạng phần nguyên (thêm dấu '.')
    // Dùng 'de-DE' để đảm bảo không bị lỗi '1.000' -> '1' khi parse
    const formattedInt = new Intl.NumberFormat('de-DE').format(Number(intPart) || 0);

    // Nếu không có phần thập phân (ví dụ người dùng gõ "1234")
    if (parts.length === 1) {
      return formattedInt; // vd: "1.234"
    }
    
    // Nếu có phần thập phân (kể cả khi rỗng, vd: "123,")
    // parts[1] sẽ là "56" hoặc ""
    return formattedInt + ',' + parts[1]; // vd: "1.234,56" hoặc "1.234,"
  };

  /**
   * (INPUT - LOAD) Chuyển đổi SỐ (1234.56) sang CHUỖI NHẬP LIỆU ("1234,56")
   * (Chỉ thay thế dấu chấm bằng dấu phẩy)
   */
  const formatLocalFloatInput = (num: number | undefined | null): string => {
      if (num === null || num === undefined) return "";
      return String(num).replace('.', ',');
  };
  // ====== KẾT THÚC SỬA ĐỔI 1 ======


 // 5. ====== API setup ======
 const basePath = "/api/pricing/materialunitprice";

 const { fetchById, error: fetchByIdError } = useApi(basePath, {
  autoFetch: false,
 });
 const putPath = `${basePath}`;
 const {
  putData,
  loading: saving,
  error: saveError,
 } = useApi(putPath, {
  autoFetch: false,
 });

 // API GET Dropdowns
 const {
  fetchData: fetchProcesses,
  data: processes,
  loading: ld2,
 } = useApi<Process>("/api/process/productionprocess?pageIndex=1&pageSize=1000");
 const {
  fetchData: fetchPassports,
  data: passports,
  loading: ld3,
 } = useApi<Passport>("/api/product/passport?pageIndex=1&pageSize=1000");
 const {
  fetchData: fetchHardness,
  data: hardness,
  loading: ld4,
 } = useApi<Hardness>("/api/product/hardness?pageIndex=1&pageSize=1000");
 const {
  fetchData: fetchInsertItems,
  data: insertItems,
  loading: ld5,
 } = useApi<InsertItem>("/api/product/insertitem?pageIndex=1&pageSize=1000");
 const {
  fetchData: fetchSupportSteps,
  data: supportSteps,
  loading: ld6,
 } = useApi<SupportStep>("/api/product/supportstep?pageIndex=1&pageSize=1000");
const {
  fetchData: fetchAssignmentCodes,
  data: assignmentData,
  loading: ld7,
 } = useApi<any>("/api/catalog/assignmentcode?pageIndex=1&pageSize=1000");
 const {
  fetchData: fetchMaterials,
  data: materialsData,
  loading: ld8,
 } = useApi<any>("/api/catalog/material?pageIndex=1&pageSize=1000");

 // 6. ====== State ======
 const [selectedProcess, setSelectedProcess] = useState<string>("");
 const [selectedPassport, setSelectedPassport] = useState<string>("");
 const [selectedHardness, setSelectedHardness] = useState<string>("");
 const [selectedInsertItem, setSelectedInsertItem] = useState<string>("");
 const [selectedSupportStep, setSelectedSupportStep] = useState<string>("");
 const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
 const [rows, setRows] = useState<LocalTransactionRow[]>([]);
 const [isDropdownLoading, setIsDropdownLoading] = useState(true);
 const [isRecordLoading, setIsRecordLoading] = useState(true);
 const [record, setRecord] = useState<MaterialUnitPriceRecord | null>(null);
 const [isLoadingData, setIsLoadingData] = useState(true)
 // 7. ====== Load dropdowns (Giống file Input) ======
 useEffect(() => {
  const fetchAllData = async () => {
   setIsDropdownLoading(true);
   try {
    await Promise.allSettled([
     fetchProcesses(),
     fetchPassports(),
     fetchHardness(),
     fetchInsertItems(),
     fetchSupportSteps(),
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
  fetchInsertItems,
  fetchSupportSteps,
  fetchAssignmentCodes,
  fetchMaterials,
 ]);

 // 8. ====== Load bản ghi (Logic MỚI cho Edit) ======
 useEffect(() => {
  if (!id) {
   setIsRecordLoading(false);
   return;
  }

  const loadRecord = async () => {
  setIsLoadingData (true);
   try {
    const data = await fetchById(id);
    if (data) {
     setRecord(data as MaterialUnitPriceRecord);
    } else {
     console.error("Không tìm thấy bản ghi với ID:", id);
    }
   } catch (err) {
    console.error("Lỗi khi tải bản ghi:", err);
   } finally {
    setIsLoadingData(false);
   }
  };

  loadRecord();
 }, [id, fetchById]);

 // 9. ====== Map options / data (ĐÃ SỬA LỖI VÒNG LẶP) ======

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
 
 const insertItemOptions: DropdownOption[] = useMemo(
  () => insertItems?.map((i) => ({ value: i.id, label: i.value })) || [],
  [insertItems]
 );
 
 const supportStepOptions: DropdownOption[] = useMemo(
  () => supportSteps?.map((s) => ({ value: s.id, label: s.value })) || [],
  [supportSteps]
 );

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


 // 10B. ====== Populate Dropdowns & Rows (Cập nhật) ======
 useEffect(() => {
  if (
   !record ||
   isDropdownLoading ||
   !allMaterials.length ||
   !assignmentCodeMap.size ||
   !processOptions.length ||
   !passportOptions.length ||
   !hardnessOptions.length ||
   !insertItemOptions.length ||
   !supportStepOptions.length 
  ) {
   return;
  }

  console.log("Populating form (Dropdowns & Rows) với dữ liệu:", record);

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

  const parseName = (name: string) => {
   const parts = name.split(",").map((p) => p.trim());
   return {
    process: parts[0] || "", 
    passport: parts[1] || "", 
    insertItem: parts[2] || "", 
    supportStep: parts[3] || "", 
    hardness: parts[4] || "", 
   };
  };

  const labels = parseName(record.name);

  setSelectedProcess(findIdByLabel(processOptions, labels.process));
  setSelectedPassport(findIdByLabel(passportOptions, labels.passport));
  setSelectedHardness(findIdByLabel(hardnessOptions, labels.hardness));
  setSelectedInsertItem(findIdByLabel(insertItemOptions, labels.insertItem));
  setSelectedSupportStep(findIdByLabel(supportStepOptions, labels.supportStep));
  
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
            
            // ====== BẮT ĐẦU SỬA ĐỔI 2: Dùng formatLocalFloatInput khi GET ======
            // Chuyển SỐ (vd: 123.4) từ API thành CHUỖI (vd: "123,4")
      const quantityString = formatLocalFloatInput(cost.quantity);
            // ====== KẾT THÚC SỬA ĐỔI 2 ======

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
  insertItemOptions, 
  supportStepOptions,
 ]); 

 // 11. ====== TransactionSelector Handlers (Giống file Input) ======
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
  setRows((prevRows) => prevRows.filter((row) => row.id !== id));
 };


 // 1000. ====== Handle Submit (THAY ĐỔI: Dùng putData) ======
 const handleSubmit = async (data: Record<string, string>) => {
  const code = data["Mã định mức vật liệu"]?.trim() || "";

  // Validation (Giống file Input)
  if (!code) return alert("⚠️ Vui lòng nhập Mã định mức vật liệu!");
  if (!selectedProcess) return alert("⚠️ Vui lòng chọn Công đoạn!");
  if (!selectedPassport) return alert("⚠️ Vui lòng chọn Hộ chiếu!");
  if (!selectedHardness) return alert("⚠️ Vui lòng chọn Độ kiên cố!");
  if (!selectedInsertItem) return alert("⚠️ Vui lòng chọn Chèn!");
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

  const payload = {
   id: id, // <-- Thêm dòng này nếu API PUT yêu cầu
   code,
   processId: selectedProcess,
   passportId: selectedPassport,
   hardnessId: selectedHardness,
   insertItemId: selectedInsertItem,
   supportStepId: selectedSupportStep || null, // Gửi null nếu không chọn
   costs: rows.map((row) => ({
    assignmentCodeId: row.assignmentCodeId,
    materialId: row.materialId,
    // ====== BẮT ĐẦU SỬA ĐỔI 5: Cập nhật Payload (cho Định mức) ======
    quantity: parseLocalFloat(row.quantity), // <-- SỬA: Dùng hàm parse mới
    // ====== KẾT THÚC SỬA ĐỔI 5 ======
   })),
  };

  console.log("📤 PUT payload:", payload);

  await putData(payload, () => {
   console.log("✅ Cập nhật đơn giá vật liệu thành công!");
   onSuccess?.();
   onClose?.();
  });
 };

 // 11. ====== Fields (LayoutInput) ======
 const fields = [
  {
   label: "Mã định mức vật liệu",
   type: "text" as const,
   placeholder: "Nhập mã định mức dữ liệu",
  },
  { type: "custom2" as const },
  { type: "custom3" as const },
  { type: "custom4" as const },
  { type: "custom5" as const },
  { type: "custom6" as const },
  { label: "", type: "customTransactionSelector" as const },
 ];

 const isLoading = saving;
 const anyError = saveError || fetchByIdError;

 // 12. ====== Render ======
 
 const computedInitialData = useMemo(() => {
  return {
   "Mã định mức vật liệu": record?.code || ""
  };
 }, [record]); 


  // ====== BẮT ĐẦU SỬA ĐỔI 6: Cập nhật 'displayRows' ======
 const displayRows = useMemo(() => {
  return rows.map(row => ({
   ...row,
      // SỬA: Dùng formatLocalFloat (dấu phẩy ,)
   unitPrice: formatLocalFloat(row.unitPrice),
      // SỬA: Dùng formatLocalFloat (dấu phẩy ,)
   total: formatLocalFloat(row.total),
      // THÊM: Định dạng 'quantity' (là string "1234,5") thành "1.234,5"
      quantity: formatForInput(row.quantity),
  }));
 }, [rows]); // Tự động tính toán lại khi 'rows' thay đổi
 // ====== KẾT THÚC SỬA ĐỔI 6 ======


 return (
  <LayoutInput
   title01="Đơn giá và định mức / Đơn giá và định mức Vật liệu"
   title="Cập nhật Đơn giá và định mức Vật liệu"
   fields={fields}
   onSubmit={handleSubmit}
   closePath={PATHS.MATERIALS_INGREDIENT.LIST}
   onClose={onClose}
   initialData={computedInitialData}
   key={record?.id}
   isLoading={isLoading} 
   error={anyError} 
  >
   {/* 13. Render Dropdowns (Giống file Input) */}

   <div className="custom2" key="c2">
    <DropdownMenuSearchable
     label="Công đoạn"
     options={processOptions}
     value={selectedProcess}
     onChange={setSelectedProcess}
     placeholder="Chọn công đoạn"
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
   <div className="custom5" key="c5">
    <DropdownMenuSearchable
     label="Chèn"
     options={insertItemOptions}
     value={selectedInsertItem}
     onChange={setSelectedInsertItem}
source      placeholder="Chọn chèn..."
     isDisabled={ld5}
    />
   </div>
   <div className="custom6" key="c6">
    <DropdownMenuSearchable
     label="Bước chống"
     options={supportStepOptions}
     value={selectedSupportStep}
     onChange={setSelectedSupportStep}
     placeholder="Chọn bước chống"
     isDisabled={ld6} 
    />
   </div>

   {/* ====== BẮT ĐẦU SỬA ĐỔI 7: Truyền 'displayRows' ====== */}
   <TransactionSelector
    label="Mã giao khoán"
    className="customTransactionSelector"
    options={assignmentCodeOptions} 
    selectedCodes={selectedCodes}
    
        // SỬA: Truyền 'displayRows' (đã định dạng)
    rows={displayRows as any} 
    
    onSelectChange={handleSelectChange}
    onRowChange={handleRowChange}
    onRemoveRow={handleRemoveRow}
   />
   {/* ====== KẾT THÚC SỬA ĐỔI 7 ====== */}
  </LayoutInput>
 );
}