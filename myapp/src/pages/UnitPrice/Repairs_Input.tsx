// THAY ĐỔI: Thêm 'useMemo'
import React, { useEffect, useState, useMemo } from "react";
import LayoutInput from "../../layout/layout_input";
// Import TransactionRow GỐC (không có materialId)
import TransactionSelector, {
  type TransactionRow as ImportedTransactionRow,
} from "../../components/transactionselector";
import PATHS from "../../hooks/path";
import { useApi } from "../../hooks/useFetchData";
import DropdownMenuSearchable from "../../components/dropdown_menu_searchable";
import FormRow from "../../components/formRow";

// 1. Cập nhật Props (Đảm bảo onSuccess có thể là Promise<void> | void)
interface RepairsInputProps {
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // SỬA: Thêm Promise<void> | void
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

export default function RepairsInput({
  onClose,
  onSuccess,
}: RepairsInputProps) {

  // ====== CÁC HÀM TIỆN ÍCH (Giữ nguyên) ======
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
  const postPath = "/api/pricing/slideunitprice";
  // SỬA: Đặt autoFetch=false để kiểm soát việc post
  const { postData, loading: saving, error: saveError } = useApi(postPath, { autoFetch: false });

  // API GET Dropdowns (SỬA: Đặt autoFetch=false)
  const { fetchData: fetchProcesses, data: processes, loading: ld2 } = useApi<Process>("/api/process/processgroup?pageIndex=1&pageSize=10000", { autoFetch: false });
  const { fetchData: fetchPassports, data: passports, loading: ld3 } = useApi<Passport>("/api/product/passport?pageIndex=1&pageSize=10000", { autoFetch: false });
  const { fetchData: fetchHardness, data: hardness, loading: ld4 } = useApi<Hardness>("/api/product/hardness?pageIndex=1&pageSize=10000", { autoFetch: false });
  const { fetchData: fetchAssignmentCodes, data: assignmentData, loading: ld7 } = useApi<any>("/api/catalog/assignmentcode?pageIndex=1&pageSize=10000", { autoFetch: false });
  const { fetchData: fetchMaterials, data: materialsData, loading: ld8 } = useApi<any>("/api/catalog/material?pageIndex=1&pageSize=10000", { autoFetch: false });

  // 6. ====== State ======
  const [selectedProcess, setSelectedProcess] = useState<string>("");
  const [selectedPassport, setSelectedPassport] = useState<string>("");
  const [selectedHardness, setSelectedHardness] = useState<string>("");
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [rows, setRows] = useState<LocalTransactionRow[]>([]);

  // State ngày tháng
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // 7. ====== Load dropdowns ======
  const [isInitialLoading, setIsInitialLoading] = useState(true); // THÊM state loading
  useEffect(() => {
    const fetchAllData = async () => {
      setIsInitialLoading(true); // START
      try {
        await Promise.allSettled([
          fetchProcesses(),
          fetchPassports(),
          fetchHardness(),
          fetchAssignmentCodes(),
          fetchMaterials(),
        ]);
      } catch (error) {
        console.error("Lỗi không mong đợi:", error);
      } finally {
        setIsInitialLoading(false); // END
      }
    };
    fetchAllData();
  }, [fetchProcesses, fetchPassports, fetchHardness, fetchAssignmentCodes, fetchMaterials]);

  // Helper: Trích xuất Materials
  const allMaterials: Material[] = useMemo(() => {
    if (!materialsData) return [];
    if (Array.isArray(materialsData) && materialsData.length > 0 && materialsData[0] && materialsData[0].items) {
      return materialsData[0].items;
    }
    if (Array.isArray(materialsData)) return materialsData;
    return [];
  }, [materialsData]);

  // 8. ====== Map options (Giữ nguyên) ======
  const processOptions: DropdownOption[] = processes?.map((p) => ({ value: p.id, label: p.name })) || [];
  const passportOptions: DropdownOption[] = passports?.map((p) => ({ value: p.id, label: p.name })) || [];
  const hardnessOptions: DropdownOption[] = hardness?.map((h) => ({ value: h.id, label: h.value })) || [];

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

  // 9. ====== TransactionSelector Handlers (Giữ nguyên) ======
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

  // 10. ====== Handle Submit (Áp dụng logic UnitsInput.tsx) ======
  const handleSubmit = async (data: Record<string, string>) => {
    const code = data["Mã định mức máng trượt"]?.trim() || "";

    // Validation cơ bản
    if (!code) return alert("⚠️ Vui lòng nhập Mã định mức máng trượt!");
    if (!selectedProcess) return alert("⚠️ Vui lòng chọn Nhóm công đoạn sản xuất!");
    if (!selectedPassport) return alert("⚠️ Vui lòng chọn Hộ chiếu!");
    if (!selectedHardness) return alert("⚠️ Vui lòng chọn Độ kiên cố!");
    if (rows.length === 0) return alert("⚠️ Vui lòng chọn ít nhất một Mã giao khoán!");

    // Validation Ngày tháng
    if (!startDate) return alert("⚠️ Vui lòng chọn Ngày bắt đầu!");
    if (!endDate) return alert("⚠️ Vui lòng chọn Ngày kết thúc!");
    if (startDate > endDate) return alert("⚠️ Ngày kết thúc không được nhỏ hơn Ngày bắt đầu!");

    // Validation Dữ liệu bảng
    for (const row of rows) {
      const quantity = parseLocalFloat(row.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        return alert(`⚠️ Vui lòng nhập Số lượng hợp lệ cho Vật tư "${row.assetCode}"!`);
      }
    }

    // Tạo payload
    const payload = {
      code,
      processGroupId: selectedProcess,
      passportId: selectedPassport,
      hardnessId: selectedHardness,
      // Bổ sung Date vào payload (format ISO string theo mẫu JSON)
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      costs: rows.map((row) => ({
        assignmentCodeId: row.assignmentCodeId,
        materialId: row.materialId,
        quantity: parseLocalFloat(row.quantity),
      })),
    };

    console.log("📤 POST payload:", payload);

    // 1. ĐÓNG FORM NGAY LẬP TỨC
    onClose?.();

    try {
        // 2. CHỜ API VÀ RELOAD HOÀN TẤT
        await Promise.all([
            postData(payload, undefined),
        ]);
        // Thêm một độ trễ nhỏ để đảm bảo UI kịp cập nhật
        await new Promise(r => setTimeout(r, 0));
        await onSuccess?.();
        
        // 4. HIỆN ALERT
        alert("✅ Tạo đơn giá máng trượt thành công!");

    } catch (e) {
        // 5. Bắt lỗi (Vì form đã đóng, alert lỗi ra ngoài)
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        alert("❌ Đã xảy ra lỗi. Vui lòng kiểm tra lại dữ liệu.");
    }
  };

  // 11. ====== Fields ======
  const fields = [
    { type: "custom7" as const }, // Vị trí cho ngày tháng
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

  const isLoading = ld2 || ld3 || ld4 || ld7 || ld8 || saving || isInitialLoading; // THÊM isInitialLoading
  const anyError = saveError;

  // Data hiển thị cho bảng
  const displayRows = useMemo(() => {
    return rows.map((row) => ({
      ...row,
      unitPrice: formatLocalFloat(row.unitPrice),
      total: formatLocalFloat(row.total),
      quantity: formatForInput(row.quantity),
    }));
  }, [rows]);

  // Data cho FormRow (Ngày tháng)
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
      title01="Đơn giá và định mức / Đơn giá và định mức Máng trượt"
      title="Tạo mới Đơn giá và định mức Máng trượt"
      fields={fields}
      onSubmit={handleSubmit}
      closePath={PATHS.REPAIRS.LIST}
      onClose={onClose}
      initialData={{
        "Mã định mức máng trượt": "",
      }}
      // Loại bỏ hiển thị loading/error nội bộ vì form đóng ngay lập tức
    >
      {/* 12. Render Custom Fields */}
      
      {/* Render hàng ngày tháng vào custom7 */}
      <div className="custom7" key="c7">
        <div className="date-row-slot">
          <FormRow rows={dateRowData} />
        </div>
      </div>

      <div className="custom2" key="c2">
        <DropdownMenuSearchable
          label="Nhóm công đoạn sản xuất"
          options={processOptions}
          value={selectedProcess}
          onChange={setSelectedProcess}
          placeholder="Chọn nhóm công đoạn sản xuất"
          isDisabled={ld2 || isInitialLoading} // Dùng isInitialLoading
        />
      </div>
      <div className="custom3" key="c3">
        <DropdownMenuSearchable
          label="Hộ chiếu, Sđ, Sc"
          options={passportOptions}
          value={selectedPassport}
          onChange={setSelectedPassport}
          placeholder="Chọn hộ chiếu"
          isDisabled={ld3 || isInitialLoading}
        />
      </div>
      <div className="custom4" key="c4">
        <DropdownMenuSearchable
          label="Độ kiên cố đá/ than (f)"
          options={hardnessOptions}
          value={selectedHardness}
          onChange={setSelectedHardness}
          placeholder="Chọn độ kiên cố"
          isDisabled={ld4 || isInitialLoading}
        />
      </div>

      {/* 13. Render TransactionSelector */}
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