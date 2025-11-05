import { useEffect, useState, useMemo } from "react";
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
  // 5. ====== API setup ======
  const basePath = "/api/pricing/materialunitprice";

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

  // API GET Dropdowns (Giống hệt file Input)
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
  // State cho dropdowns
  const [selectedProcess, setSelectedProcess] = useState<string>("");
  const [selectedPassport, setSelectedPassport] = useState<string>("");
  const [selectedHardness, setSelectedHardness] = useState<string>("");
  const [selectedInsertItem, setSelectedInsertItem] = useState<string>("");
  const [selectedSupportStep, setSelectedSupportStep] = useState<string>("");
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  // State cho bảng
  const [rows, setRows] = useState<LocalTransactionRow[]>([]);

  // State cho việc tải dữ liệu
  const [isDropdownLoading, setIsDropdownLoading] = useState(true);
  const [isRecordLoading, setIsRecordLoading] = useState(true);
  const [record, setRecord] = useState<MaterialUnitPriceRecord | null>(null);
  
  // ----- 🔽 THAY ĐỔI 1: Xóa state 'initialData' 🔽 -----
  // const [initialData, setInitialData] = useState({ "Mã định mức vật liệu": "" });
  // ----- 🔼 KẾT THÚC THAY ĐỔI 1 🔼 -----


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
      setIsRecordLoading(true);
      try {
        // fetchById sẽ trả về 'result' bên trong { success: true, result: ... }
        const data = await fetchById(id);
        if (data) {
          setRecord(data as MaterialUnitPriceRecord);
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

  // Bọc các options này trong useMemo để fix lỗi "Maximum update depth"
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

  
  // ----- 🔽 THAY ĐỔI 2: Xóa useEffect 10A 🔽 -----
  // 10A. ====== Populate 'code' (Mã định mức) ======
  // (ĐÃ XÓA - Sẽ được tính trực tiếp trong phần Render)
  // ----- 🔼 KẾT THÚC THAY ĐỔI 2 🔼 -----


  // 10B. ====== Populate Dropdowns & Rows (Cập nhật) ======
  useEffect(() => {
    // Chờ tất cả dữ liệu (record VÀ dropdowns) sẵn sàng
    if (
      !record ||
      isDropdownLoading ||
      !allMaterials.length ||
      !assignmentCodeMap.size ||
      !processOptions.length ||
      !passportOptions.length ||
      !hardnessOptions.length ||
      !insertItemOptions.length
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

    const parseName = (name: string) => {
      const parts = name.split(",").map((p) => p.trim());
      return {
        process: parts[0] || "", // "Đào lò than"
        passport: parts[1] || "", // "H/c 1.4; Sđ=5.6; Sc=4.5"
        insertItem: parts[2] || "", // "Chèn bê tông"
        hardness: parts[3] || "", // "2 < f ≤ 3"
      };
    };

    const labels = parseName(record.name);

    // 1. Điền state cho các dropdown
    setSelectedProcess(findIdByLabel(processOptions, labels.process));
    setSelectedPassport(findIdByLabel(passportOptions, labels.passport));
    setSelectedHardness(findIdByLabel(hardnessOptions, labels.hardness));
    setSelectedInsertItem(findIdByLabel(insertItemOptions, labels.insertItem));
    
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
            const quantityNumber = parseFloat(String(cost.quantity) || "0");
            const total = isNaN(quantityNumber)
              ? 0
              : quantityNumber * unitPrice;

            newRows.push({
              id: `r${Date.now()}-${mgk.assignmentCodeId}-${cost.materialId}`,
              code: mgk.assignmentCode,
              assignmentCodeId: mgk.assignmentCodeId,
              materialId: cost.materialId,
              assetCode: cost.materialCode,
              unitPrice: unitPrice,
              quantity: String(cost.quantity),
              total: total,
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
  ]); 

  // 11. ====== TransactionSelector Handlers (Giống file Input) ======
  // (Giữ nguyên không đổi)
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
            unitPrice: material.costAmmount || 0,
            quantity: "0",
            total: 0,
          });
        }
      });
    });

    setRows(newRows);
  };

  const handleRowChange = (
    id: string,
    field: keyof ImportedTransactionRow,
    value: string
  ) => {
    if (field !== "quantity") return;

    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, quantity: value };
          const quantityNumber = parseFloat(value || "0");
          const unitPrice = updatedRow.unitPrice ?? 0;
          updatedRow.total = isNaN(quantityNumber)
            ? 0
            : quantityNumber * unitPrice;
          return updatedRow;
        }
        return row;
      })
    );
  };

  const handleRemoveRow = (id: string) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };


  // 1000. ====== Handle Submit (THAY ĐỔI: Dùng putData) ======
  // (Giữ nguyên không đổi)
  const handleSubmit = async (data: Record<string, string>) => {
    const code = data["Mã định mức vật liệu"]?.trim() || "";

    // Validation (Giống file Input)
    if (!code) return alert("⚠️ Vui lòng nhập Mã định mức vật liệu!");
    if (!selectedProcess) return alert("⚠️ Vui lòng chọn Công đoạn!");
    if (!selectedPassport) return alert("⚠️ Vui lòng chọn Hộ chiếu!");
    if (!selectedHardness) return alert("⚠️ Vui lòng chọn Độ kiên cố!");
    if (!selectedInsertItem) return alert("⚠️ Vui lòng chọn Chèn!");
    // if (!selectedSupportStep) return alert("⚠️ Vui lòng chọn Bước chống!"); // Bỏ qua
    if (rows.length === 0)
      return alert("⚠️ Vui lòng chọn ít nhất một Mã giao khoán!");

    for (const row of rows) {
      const quantity = parseFloat(row.quantity || "0");
      if (isNaN(quantity) || quantity <= 0) {
        const mgkLabel = row.code;
        return alert(
          `⚠️ Vui lòng nhập Số lượng (Định mức) hợp lệ cho Vật tư "${row.assetCode}" (MGK: ${mgkLabel})!`
        );
      }
    }

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
        quantity: parseFloat(row.quantity || "0"),
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
  // (Giữ nguyên không đổi)
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

  // 'isLoading' giờ CHỈ LÀ 'saving' (khi bấm submit)
  const isLoading = saving;
  
  // 'anyError' là lỗi khi LƯU hoặc lỗi khi TẢI (fetchById)
  const anyError = saveError || fetchByIdError;

  // 12. ====== Render ======
  
  // ----- 🔽 THAY ĐỔI 3: Tính 'initialData' bằng useMemo 🔽 -----
  // Tính toán initialData trực tiếp từ 'record' state.
  // Bằng cách này, khi 'record' thay đổi, cả 'key' và 'initialData'
  // sẽ được cập nhật trong CÙNG MỘT LẦN RENDER.
  const computedInitialData = useMemo(() => {
    return {
      "Mã định mức vật liệu": record?.code || ""
    };
  }, [record]); // Chỉ tính toán lại khi 'record' thay đổi.
  // ----- 🔼 KẾT THÚC THAY ĐỔI 3 🔼 -----


  return (
    <LayoutInput
      title01="Đơn giá và định mức / Đơn giá và định mức Vật liệu"
      title="Cập nhật Đơn giá và định mức Vật liệu"
      fields={fields}
      onSubmit={handleSubmit}
      closePath={PATHS.MATERIALS_INGREDIENT.LIST}
      onClose={onClose}
      
      // ----- 🔽 THAY ĐỔI 4: Dùng 'computedInitialData' 🔽 -----
      initialData={computedInitialData}
      // ----- 🔼 KẾT THÚC THAY ĐỔI 4 🔼 -----
      
      // Thêm 'key' để ép LayoutInput render lại khi initialData thay đổi
      key={record?.id}
      isLoading={isLoading} // Chỉ loading khi 'saving'
      error={anyError} // Hiển thị lỗi nếu 'saveError' hoặc 'fetchByIdError'
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
          placeholder="Chọn chèn..."
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

      {/* 14. Render TransactionSelector (Giống file Input) */}
      <TransactionSelector
        label="Mã giao khoán"
        className="customTransactionSelector"
        options={assignmentCodeOptions} 
        selectedCodes={selectedCodes}
        rows={rows} 
        onSelectChange={handleSelectChange}
        onRowChange={handleRowChange}
        onRemoveRow={handleRemoveRow}
      />
    </LayoutInput>
  );
}