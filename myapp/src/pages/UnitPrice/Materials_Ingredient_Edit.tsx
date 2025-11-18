import { useEffect, useState, useMemo } from "react";
import LayoutInput from "../../layout/layout_input";
import TransactionSelector, {
  type TransactionRow as ImportedTransactionRow,
} from "../../components/transactionselector";
import PATHS from "../../hooks/path";
import { useApi } from "../../hooks/useFetchData";
import DropdownMenuSearchable from "../../components/dropdown_menu_searchable";
import FormRow from "../../components/formRow";

// 1. Cập nhật Props
interface Materials_Ingredient_EditProps {
  id: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

// 2. Interface
interface DropdownOption {
  value: string;
  label: string;
  data?: any;
}

// 3. Interfaces (API Payloads)
interface Process { id: string; name: string; }
interface Passport { id: string; name: string; }
interface Hardness { id: string; value: string; }
interface InsertItem { id: string; value: string; }
interface SupportStep { id: string; value: string; }
interface AssignmentCode { id: string; code: string; name: string; }
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

// ====== QUAN TRỌNG: Interface response từ API phải có startDate, endDate ======
interface MaterialUnitPriceRecord {
  id: string;
  code: string;
  name: string;
  startDate?: string; // Dữ liệu ngày bắt đầu từ API
  endDate?: string;   // Dữ liệu ngày kết thúc từ API
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

export default function Materials_Ingredient_Edit({
  id,
  onClose,
  onSuccess,
}: Materials_Ingredient_EditProps) {
  
  // ====== Hàm tiện ích ======
  const formatLocalFloat = (num: number | undefined | null): string => {
    if (num === null || num === undefined) return "0";
    return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 4 }).format(num);
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
    const formattedInt = new Intl.NumberFormat("de-DE").format(Number(intPart) || 0);
    return parts.length === 1 ? formattedInt : formattedInt + "," + parts[1];
  };

  const formatLocalFloatInput = (num: number | undefined | null): string => {
    if (num === null || num === undefined) return "";
    return String(num).replace(".", ",");
  };

  // 5. ====== API setup ======
  const basePath = "/api/pricing/materialunitprice";
  const { fetchById, error: fetchByIdError } = useApi(basePath, { autoFetch: false });
  const { putData, loading: saving, error: saveError } = useApi(basePath, { autoFetch: false });

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
  const [isDropdownLoading, setIsDropdownLoading] = useState(true);
  const [record, setRecord] = useState<MaterialUnitPriceRecord | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // State cho ngày tháng
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // 7. ====== Load dropdowns ======
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
      } finally {
        setIsDropdownLoading(false);
      }
    };
    fetchAllData();
  }, [fetchProcesses, fetchPassports, fetchHardness, fetchInsertItems, fetchSupportSteps, fetchAssignmentCodes, fetchMaterials]);

  // 8. ====== Load bản ghi ======
  useEffect(() => {
    if (!id) {
      setIsLoadingData(false);
      return;
    }
    const loadRecord = async () => {
      setIsLoadingData(true);
      try {
        const data = await fetchById(id);
        if (data) {
          setRecord(data as MaterialUnitPriceRecord);
        }
      } catch (err) {
        console.error("Lỗi khi tải bản ghi:", err);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadRecord();
  }, [id, fetchById]);

  // 9. ====== Map options ======
  const allMaterials: Material[] = useMemo(() => {
    if (!materialsData) return [];
    if (Array.isArray(materialsData) && materialsData.length > 0 && materialsData[0] && materialsData[0].items) return materialsData[0].items;
    if (Array.isArray(materialsData)) return materialsData;
    return [];
  }, [materialsData]);

  const processOptions: DropdownOption[] = useMemo(() => processes?.map((p) => ({ value: p.id, label: p.name })) || [], [processes]);
  const passportOptions: DropdownOption[] = useMemo(() => passports?.map((p) => ({ value: p.id, label: p.name })) || [], [passports]);
  const hardnessOptions: DropdownOption[] = useMemo(() => hardness?.map((h) => ({ value: h.id, label: h.value })) || [], [hardness]);
  const insertItemOptions: DropdownOption[] = useMemo(() => insertItems?.map((i) => ({ value: i.id, label: i.value })) || [], [insertItems]);
  const supportStepOptions: DropdownOption[] = useMemo(() => supportSteps?.map((s) => ({ value: s.id, label: s.value })) || [], [supportSteps]);

  const assignmentCodeOptions: DropdownOption[] = useMemo(() => {
    if (!assignmentData) return [];
    if (Array.isArray(assignmentData) && assignmentData.length > 0 && assignmentData[0]?.items) {
      return assignmentData[0].items.map((a: AssignmentCode) => ({ value: a.id, label: a.code }));
    }
    if (Array.isArray(assignmentData)) return assignmentData.map((a: AssignmentCode) => ({ value: a.id, label: a.code }));
    return [];
  }, [assignmentData]);

  const assignmentCodeMap = useMemo(() => {
    if (!assignmentData) return new Map<string, string>();
    let codesArray: AssignmentCode[] = [];
    if (Array.isArray(assignmentData) && assignmentData.length > 0 && assignmentData[0]?.items) codesArray = assignmentData[0].items;
    else if (Array.isArray(assignmentData)) codesArray = assignmentData;
    return new Map<string, string>(codesArray.map((a: AssignmentCode) => [a.id, a.code]));
  }, [assignmentData]);

  // 10. ====== Populate Data (Bao gồm cả Dropdowns và Date) ======
  useEffect(() => {
    // Chỉ chạy khi đã load xong record và dropdowns
    if (
      !record ||
      isDropdownLoading ||
      !allMaterials.length ||
      !assignmentCodeMap.size ||
      !processOptions.length ||
      !passportOptions.length
    ) {
      return;
    }

    console.log("Populating data for:", record);

    // ====== 1. SET NGÀY THÁNG TỪ BẢN GHI ======
    // Kiểm tra xem record có startDate/endDate không và set vào state
    if (record.startDate) {
      setStartDate(new Date(record.startDate));
    }
    if (record.endDate) {
      setEndDate(new Date(record.endDate));
    }

    // ====== 2. SET CÁC DROPDOWNS ======
    const findIdByLabel = (options: DropdownOption[], label: string): string => {
      if (!label) return "";
      const normalizedLabel = label.toLowerCase().trim();
      let found = options.find((opt) => opt.label.toLowerCase().trim() === normalizedLabel);
      if (!found) found = options.find((opt) => normalizedLabel.includes(opt.label.toLowerCase().trim()));
      if (!found) found = options.find((opt) => opt.label.toLowerCase().trim().includes(normalizedLabel));
      return found ? found.value : "";
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

    // ====== 3. SET BẢNG CHI TIẾT ======
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
            const quantityString = formatLocalFloatInput(cost.quantity);
            const quantityNumber = parseLocalFloat(quantityString);
            const total = isNaN(quantityNumber) ? 0 : quantityNumber * unitPrice;

            newRows.push({
              id: `r${Date.now()}-${mgk.assignmentCodeId}-${cost.materialId}`,
              code: mgk.assignmentCode,
              assignmentCodeId: mgk.assignmentCodeId,
              materialId: cost.materialId,
              assetCode: cost.materialCode,
              unitPrice: unitPrice,
              quantity: quantityString,
              total: total,
            });
          });
        }
      });
    }

    setRows(newRows);
    setSelectedCodes(newSelectedCodes);

  }, [record, isDropdownLoading, allMaterials, assignmentCodeMap, processOptions, passportOptions, hardnessOptions, insertItemOptions, supportStepOptions]);

  // 11. ====== Handlers ======
  const handleSelectChange = (newSelectedIds: string[]) => {
    setSelectedCodes(newSelectedIds);
    if (!allMaterials || !assignmentCodeMap.size) return;
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

    setRows((prevRows) => prevRows.map((row) => {
      if (row.id === id) {
        const quantityNumber = parseLocalFloat(cleanValue);
        const total = isNaN(quantityNumber) ? 0 : quantityNumber * (row.unitPrice || 0);
        return { ...row, quantity: cleanValue, total };
      }
      return row;
    }));
  };

  const handleRemoveRow = (id: string) => setRows((prevRows) => prevRows.filter((row) => row.id !== id));

  // 12. ====== Submit (PUT) ======
  const handleSubmit = async (data: Record<string, string>) => {
    const code = data["Mã định mức vật liệu"]?.trim() || "";
    if (!code) return alert("⚠️ Vui lòng nhập Mã định mức vật liệu!");
    if (!selectedProcess) return alert("⚠️ Vui lòng chọn Công đoạn!");
    if (!selectedPassport) return alert("⚠️ Vui lòng chọn Hộ chiếu!");
    if (!selectedHardness) return alert("⚠️ Vui lòng chọn Độ kiên cố!");
    if (!selectedInsertItem) return alert("⚠️ Vui lòng chọn Chèn!");
    if (rows.length === 0) return alert("⚠️ Vui lòng chọn ít nhất một Mã giao khoán!");
    if (!startDate) return alert("⚠️ Vui lòng chọn Ngày bắt đầu!");
    if (!endDate) return alert("⚠️ Vui lòng chọn Ngày kết thúc!");
    if (startDate > endDate) return alert("⚠️ Ngày kết thúc không được nhỏ hơn Ngày bắt đầu!");

    for (const row of rows) {
      const quantity = parseLocalFloat(row.quantity);
      if (isNaN(quantity) || quantity <= 0) return alert(`⚠️ Vui lòng nhập Số lượng hợp lệ cho Vật tư "${row.assetCode}"!`);
    }

    const payload = {
      id,
      code,
      processId: selectedProcess,
      passportId: selectedPassport,
      hardnessId: selectedHardness,
      insertItemId: selectedInsertItem,
      supportStepId: selectedSupportStep || null,
      startDate: startDate.toISOString(), // Gửi date
      endDate: endDate.toISOString(),     // Gửi date
      costs: rows.map((row) => ({
        assignmentCodeId: row.assignmentCodeId,
        materialId: row.materialId,
        quantity: parseLocalFloat(row.quantity),
      })),
    };

    console.log("📤 PUT payload:", payload);
    await putData(payload, () => {
      alert("✅ Cập nhật thành công!");
      onSuccess?.();
      onClose?.();
    });
  };

  // 13. ====== Render ======
  const fields = [
    { type: "custom7" as const },
    { label: "Mã định mức vật liệu", type: "text" as const, placeholder: "Nhập mã định mức dữ liệu" },
    { type: "custom2" as const },
    { type: "custom3" as const },
    { type: "custom4" as const },
    { type: "custom5" as const },
    { type: "custom6" as const },
    { label: "", type: "customTransactionSelector" as const },
  ];

  const displayRows = useMemo(() => rows.map((row) => ({
    ...row,
    unitPrice: formatLocalFloat(row.unitPrice),
    total: formatLocalFloat(row.total),
    quantity: formatForInput(row.quantity),
  })), [rows]);

  const dateRowData = useMemo(() => [[
    { type: "date" as const, label: "Ngày bắt đầu", value: startDate, onChange: setStartDate, placeholder: "Chọn ngày bắt đầu" },
    { type: "date" as const, label: "Ngày kết thúc", value: endDate, onChange: setEndDate, placeholder: "Chọn ngày kết thúc" },
  ]], [startDate, endDate]);

  const computedInitialData = useMemo(() => ({ "Mã định mức vật liệu": record?.code || "" }), [record]);

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
      isLoading={saving || isLoadingData} // Loading khi save hoặc load record
      error={saveError || fetchByIdError}
    >
      <div className="custom7" key="c7">
        <div className="date-row-slot">
          <FormRow rows={dateRowData} />
        </div>
      </div>
      <div className="custom2" key="c2">
        <DropdownMenuSearchable label="Công đoạn" options={processOptions} value={selectedProcess} onChange={setSelectedProcess} placeholder="Chọn công đoạn" isDisabled={ld2} />
      </div>
      <div className="custom3" key="c3">
        <DropdownMenuSearchable label="Hộ chiếu, Sđ, Sc" options={passportOptions} value={selectedPassport} onChange={setSelectedPassport} placeholder="Chọn hộ chiếu" isDisabled={ld3} />
      </div>
      <div className="custom4" key="c4">
        <DropdownMenuSearchable label="Độ kiên cố đá/ than (f)" options={hardnessOptions} value={selectedHardness} onChange={setSelectedHardness} placeholder="Chọn độ kiên cố" isDisabled={ld4} />
      </div>
      <div className="custom5" key="c5">
        <DropdownMenuSearchable label="Chèn" options={insertItemOptions} value={selectedInsertItem} onChange={setSelectedInsertItem} placeholder="Chọn chèn..." isDisabled={ld5} />
      </div>
      <div className="custom6" key="c6">
        <DropdownMenuSearchable label="Bước chống" options={supportStepOptions} value={selectedSupportStep} onChange={setSelectedSupportStep} placeholder="Chọn bước chống" isDisabled={ld6} />
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