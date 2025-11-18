import { useEffect, useState, useMemo } from "react";
import LayoutInput from "../../layout/layout_input";
// Import TransactionRow GỐC (không có materialId)
import TransactionSelector, {
  type TransactionRow as ImportedTransactionRow,
} from "../../components/transactionselector";
// BỔ SUNG: Import FormRow
import FormRow from "../../components/formRow";
import PATHS from "../../hooks/path";
import { useApi } from "../../hooks/useFetchData";
import DropdownMenuSearchable from "../../components/dropdown_menu_searchable";

// 1. Cập nhật Props
interface Materials_Ingredient_InputProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

// 2. Interface (Chung)
interface DropdownOption {
  value: string;
  label: string;
  data?: any;
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
  assigmentCodeId: string;
  costAmmount: number;
}

// 4. Interface (State nội bộ)
interface LocalTransactionRow extends ImportedTransactionRow {
  materialId: string;
  assignmentCodeId: string;
}

export default function Materials_Ingredient_Input({
  onClose,
  onSuccess,
}: Materials_Ingredient_InputProps) {
  
  // ====== Cập nhật Hàm Tiện Ích ======
  const formatLocalFloat = (num: number | undefined | null): string => {
    if (num === null || num === undefined) return "0";
    return new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 4,
    }).format(num);
  };

  const parseLocalFloat = (str: string | undefined | null): number => {
    if (!str) return 0;
    const cleanStr = String(str).replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanStr || "0");
  };

  const formatForInput = (str: string | undefined | null): string => {
    if (str === null || str === undefined) return "";
    if (str === "") return "";
    const parts = String(str).split(",");
    const intPart = parts[0].replace(/[^0-9]/g, "");
    const formattedInt = new Intl.NumberFormat("de-DE").format(
      Number(intPart) || 0
    );
    if (parts.length === 1) {
      return formattedInt;
    }
    return formattedInt + "," + parts[1];
  };

  // 5. ====== API setup ======
  const postPath = "/api/pricing/materialunitprice";
  const {
    postData,
    loading: saving,
    error: saveError,
  } = useApi(postPath);

  // API GET Dropdowns
  const { fetchData: fetchProcesses, data: processes, loading: ld2 } = useApi<Process>("/api/process/productionprocess?pageIndex=1&pageSize=1000");
  const { fetchData: fetchPassports, data: passports, loading: ld3 } = useApi<Passport>("/api/product/passport?pageIndex=1&pageSize=1000");
  const { fetchData: fetchHardness, data: hardness, loading: ld4 } = useApi<Hardness>("/api/product/hardness?pageIndex=1&pageSize=1000");
  const { fetchData: fetchInsertItems, data: insertItems, loading: ld5 } = useApi<InsertItem>("/api/product/insertitem?pageIndex=1&pageSize=1000");
  const { fetchData: fetchSupportSteps, data: supportSteps, loading: ld6 } = useApi<SupportStep>("/api/product/supportstep?pageIndex=1&pageSize=1000");
  const { fetchData: fetchAssignmentCodes, data: assignmentData, loading: ld7 } = useApi<any>("/api/catalog/assignmentcode?pageIndex=1&pageSize=1000");
  const { fetchData: fetchMaterials, data: materialsData, loading: ld8 } = useApi<any>("/api/catalog/material?pageIndex=1&pageSize=1000");

  // 6. ====== State ======
  const [selectedProcess, setSelectedProcess] = useState<string>("");
  const [selectedPassport, setSelectedPassport] = useState<string>("");
  const [selectedHardness, setSelectedHardness] = useState<string>("");
  const [selectedInsertItem, setSelectedInsertItem] = useState<string>("");
  const [selectedSupportStep, setSelectedSupportStep] = useState<string>("");
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [rows, setRows] = useState<LocalTransactionRow[]>([]);

  // BỔ SUNG: State cho hàng ngày tháng
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // 7. ====== Load dropdowns ======
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  useEffect(() => {
    const fetchAllData = async () => {
      setIsInitialLoading(true);
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
        console.error("Lỗi không mong đợi:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchAllData();
  }, [fetchProcesses, fetchPassports, fetchHardness, fetchInsertItems, fetchSupportSteps, fetchAssignmentCodes, fetchMaterials]);

  const allMaterials: Material[] = useMemo(() => {
    if (!materialsData) return [];
    if (Array.isArray(materialsData) && materialsData.length > 0 && materialsData[0] && materialsData[0].items) {
      return materialsData[0].items;
    }
    if (Array.isArray(materialsData)) return materialsData;
    return [];
  }, [materialsData]);

  // 8. ====== Map options ======
  const processOptions: DropdownOption[] = processes?.map((p) => ({ value: p.id, label: p.name })) || [];
  const passportOptions: DropdownOption[] = passports?.map((p) => ({ value: p.id, label: p.name })) || [];
  const hardnessOptions: DropdownOption[] = hardness?.map((h) => ({ value: h.id, label: h.value })) || [];
  const insertItemOptions: DropdownOption[] = insertItems?.map((i) => ({ value: i.id, label: i.value })) || [];
  const supportStepOptions: DropdownOption[] = supportSteps?.map((s) => ({ value: s.id, label: s.value })) || [];

  const assignmentCodeOptions: DropdownOption[] = useMemo(() => {
    if (!assignmentData) return [];
    if (Array.isArray(assignmentData) && assignmentData.length > 0 && assignmentData[0] && assignmentData[0].items) {
      return assignmentData[0].items.map((a: AssignmentCode) => ({ value: a.id, label: a.code }));
    }
    if (Array.isArray(assignmentData)) {
      return assignmentData.map((a: AssignmentCode) => ({ value: a.id, label: a.code }));
    }
    return [];
  }, [assignmentData]);

  // 9. ====== TransactionSelector Handlers ======
  const handleSelectChange = (newSelectedIds: string[]) => {
    setSelectedCodes(newSelectedIds);

    if (!allMaterials || !assignmentData) return;

    let codesArray: AssignmentCode[] = [];
    if (Array.isArray(assignmentData) && assignmentData.length > 0 && assignmentData[0] && assignmentData[0].items) {
      codesArray = assignmentData[0].items;
    } else if (Array.isArray(assignmentData)) {
      codesArray = assignmentData;
    }

    const assignmentCodeMap = new Map<string, string>(
      codesArray.map((a: AssignmentCode) => [a.id, a.code])
    );

    const oldRows = [...rows];
    const newRows: LocalTransactionRow[] = [];

    newSelectedIds.forEach((codeId) => {
      const assignmentCodeValue = assignmentCodeMap.get(codeId) || codeId;
      const materialsForThisCode = allMaterials.filter((m) => m.assigmentCodeId === codeId);

      materialsForThisCode.forEach((material) => {
        const existingRow = oldRows.find((r) => r.assignmentCodeId === codeId && r.materialId === material.id);
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

  const handleRowChange = (id: string, field: keyof ImportedTransactionRow, value: string) => {
    if (field !== "quantity") return;
    const cleanValue = value.replace(/\./g, "");
    if (!/^[0-9]*(,[0-9]*)?$/.test(cleanValue)) return;

    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, quantity: cleanValue };
          const quantityNumber = parseLocalFloat(cleanValue);
          const unitPrice = updatedRow.unitPrice ?? 0;
          updatedRow.total = isNaN(quantityNumber) ? 0 : quantityNumber * unitPrice;
          return updatedRow;
        }
        return row;
      })
    );
  };

  const handleRemoveRow = (id: string) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  // 10. ====== Handle Submit (SỬA ĐỔI: THÊM DATE VÀO PAYLOAD) ======
  const handleSubmit = async (data: Record<string, string>) => {
    const code = data["Mã định mức vật liệu"]?.trim() || "";

    // Validation
    if (!code) return alert("⚠️ Vui lòng nhập Mã định mức vật liệu!");
    if (!selectedProcess) return alert("⚠️ Vui lòng chọn Công đoạn!");
    if (!selectedPassport) return alert("⚠️ Vui lòng chọn Hộ chiếu!");
    if (!selectedHardness) return alert("⚠️ Vui lòng chọn Độ kiên cố!");
    if (!selectedInsertItem) return alert("⚠️ Vui lòng chọn Chèn!");
    if (!selectedSupportStep) return alert("⚠️ Vui lòng chọn Bước chống!");
    if (rows.length === 0) return alert("⚠️ Vui lòng chọn ít nhất một Mã giao khoán!");

    // Validation cho ngày tháng
    if (!startDate) return alert("⚠️ Vui lòng chọn Ngày bắt đầu!");
    if (!endDate) return alert("⚠️ Vui lòng chọn Ngày kết thúc!");
    if (startDate > endDate) return alert("⚠️ Ngày kết thúc không được nhỏ hơn Ngày bắt đầu!");

    for (const row of rows) {
      const quantity = parseLocalFloat(row.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        return alert(`⚠️ Vui lòng nhập Số lượng hợp lệ cho Vật tư "${row.assetCode}"!`);
      }
    }

    // ====== CẬP NHẬT PAYLOAD ======
    const payload = {
      code,
      processId: selectedProcess,
      passportId: selectedPassport,
      hardnessId: selectedHardness,
      insertItemId: selectedInsertItem,
      supportStepId: selectedSupportStep,
      // Bổ sung startDate và endDate (format ISO string)
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      costs: rows.map((row) => ({
        assignmentCodeId: row.assignmentCodeId,
        materialId: row.materialId,
        quantity: parseLocalFloat(row.quantity),
      })),
    };

    console.log("📤 POST payload:", payload);

    await postData(payload, () => {
      alert("✅ Tạo đơn giá vật liệu thành công!");
      onSuccess?.();
      onClose?.();
    });
  };

  // 11. ====== Fields ======
  const fields = [
    { type: "custom7" as const }, // Vị trí cho hàng ngày tháng
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

  const isLoading = ld2 || ld3 || ld4 || ld5 || ld6 || ld7 || ld8 || saving;
  const anyError = saveError;

  const displayRows = useMemo(() => {
    return rows.map((row) => ({
      ...row,
      unitPrice: formatLocalFloat(row.unitPrice),
      total: formatLocalFloat(row.total),
      quantity: formatForInput(row.quantity),
    }));
  }, [rows]);

  // Dữ liệu cho hàng Ngày bắt đầu / Ngày kết thúc
  const dateRowData = useMemo(
    () => [
      [
        {
          type: "date" as const,
          label: "Ngày bắt đầu",
          value: startDate,
          onChange: setStartDate,
          placeholder: "Chọn ngày bắt đầu",
        },
        {
          type: "date" as const,
          label: "Ngày kết thúc",
          value: endDate,
          onChange: setEndDate,
          placeholder: "Chọn ngày kết thúc",
        },
      ],
    ],
    [startDate, endDate]
  );

  return (
    <LayoutInput
      title01="Đơn giá và định mức / Đơn giá và định mức Vật liệu"
      title="Tạo mới Đơn giá và định mức Vật liệu"
      fields={fields}
      onSubmit={handleSubmit}
      closePath={PATHS.MATERIALS_INGREDIENT.LIST}
      onClose={onClose}
      initialData={{
        "Mã định mức vật liệu": "",
      }}
    >
      {/* Render Custom Fields */}
      
      {/* Render hàng ngày tháng vào vị trí custom7 */}
      <div className="custom7" key="c7">
        <div className="date-row-slot">
          <FormRow rows={dateRowData} />
        </div>
      </div>

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

      <TransactionSelector
        label="Mã giao khoán"
        className="customTransactionSelector"
        options={assignmentCodeOptions}
        selectedCodes={selectedCodes}
        rows={displayRows as any}
        onSelectChange={handleSelectChange}
        onRowChange={handleRowChange}
        onRemoveRow={handleRemoveRow}
      />
    </LayoutInput>
  );
}