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
  ]); 

  // 12. ====== TransactionSelector Handlers ======
  // (Giữ nguyên không đổi từ file Input)
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

    for (const row of rows) {
      const quantity = parseFloat(row.quantity || "0");
      if (isNaN(quantity) || quantity <= 0) {
        const mgkLabel = row.code;
        return alert(
          `⚠️ Vui lòng nhập Số lượng (Định mức) hợp lệ cho Vật tư "${row.assetCode}" (MGK: ${mgkLabel})!`
        );
      }
    }

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
        quantity: parseFloat(row.quantity || "0"),
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
      
      {/* 17. Render TransactionSelector (Giống file Input) */}
      <TransactionSelector
        label="Mã giao khoán"
        className="customTransactionSelector"
        options={assignmentCodeOptions} // Dropdown dùng code
        selectedCodes={selectedCodes}
        rows={rows} // rows bây giờ có 'code' là "VLN" và 'assetCode' là "GT"
        onSelectChange={handleSelectChange}
        onRowChange={handleRowChange}
        onRemoveRow={handleRemoveRow}
      />
    </LayoutInput>
  );
}