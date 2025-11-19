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
// THÊM: Import FormRow để render Date Picker
import FormRow from "../../components/formRow";

// 1. Cập nhật Props: Thêm 'id' (Đảm bảo onSuccess có thể là Promise<void> | void)
interface RepairsEditProps {
  id: string; // ID của bản ghi cần chỉnh sửa
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

// 5. Interface (GET by ID Payload)
interface RepairsUnitPriceRecord {
  id: string;
  code: string;
  name: string;
  startDate: string; // THÊM: Ngày bắt đầu
  endDate: string; // THÊM: Ngày kết thúc
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
}: RepairsEditProps) {
  // ====== CÁC HÀM TIỆN ÍCH (ĐỒNG BỘ VỚI Repairs_Input.tsx) ======
  /**
   * Định dạng số (number) thành chuỗi có ngăn cách hàng nghìn (Việt Nam)
   * và giữ 4 chữ số thập phân (Ví dụ: 123.456,7890)
   */
  const formatLocalFloat = (num: number | undefined | null): string => {
    if (num === null || num === undefined) return "0";
    return new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 4,
    }).format(num);
  };

  /**
   * Chuyển đổi chuỗi (dạng VN: 123.456,78) sang số (number: 123456.78)
   */
  const parseLocalFloat = (str: string | undefined | null): number => {
    if (!str) return 0;
    // 1. Xóa tất cả dấu chấm (ngăn cách hàng nghìn)
    // 2. Thay dấu phẩy (thập phân) bằng dấu chấm
    const cleanStr = String(str).replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanStr || "0");
  };

  /**
   * Định dạng chuỗi (dạng VN: 1234,5) sang chuỗi hiển thị trong input
   * (Đức/VN: 1.234,5)
   */
  const formatForInput = (str: string | undefined | null): string => {
    if (str === null || str === undefined) return "";
    if (str === "") return "";

    // Xóa dấu chấm (ngăn cách hàng nghìn) để tránh parse lỗi
    const cleanStr = String(str).replace(/\./g, "");

    const parts = cleanStr.split(",");
    const intPart = parts[0].replace(/[^0-9]/g, ""); // Chỉ lấy phần số
    const formattedInt = new Intl.NumberFormat("de-DE").format(
      Number(intPart) || 0
    );

    if (parts.length === 1) {
      return formattedInt;
    }
    return formattedInt + "," + parts[1];
  };

  /**
   * Chuyển đổi số (VD: 100000) thành chuỗi ("100.000")
   * (Đồng bộ với logic formatLocalFloat nhưng bỏ phần thập phân)
   */
  const formatNumberForDisplay = (value: number | undefined | null): string => {
    if (value === null || value === undefined) return "0";
    return new Intl.NumberFormat("de-DE").format(value);
  };

  // 6. ====== API setup ======
  const basePath = "/api/pricing/slideunitprice";

  // Hook để lấy 'fetchById' (dùng basePath)
  const { fetchById, error: fetchByIdError } = useApi(basePath, {
    autoFetch: false,
  });

  // Hook để PUT (dùng đường dẫn đầy đủ)
  // SỬA: Đặt autoFetch=false để kiểm soát việc put
  const {
    putData,
    loading: saving,
    error: saveError,
  } = useApi(basePath, {
    autoFetch: false,
  });

  // API GET Dropdowns (SỬA: Đặt autoFetch=false)
  const {
    fetchData: fetchProcesses,
    data: processes,
    loading: ld2,
  } = useApi<Process>("/api/process/processgroup?pageIndex=1&pageSize=10000", { autoFetch: false });
  const {
    fetchData: fetchPassports,
    data: passports,
    loading: ld3,
  } = useApi<Passport>("/api/product/passport?pageIndex=1&pageSize=10000", { autoFetch: false });
  const {
    fetchData: fetchHardness,
    data: hardness,
    loading: ld4,
  } = useApi<Hardness>("/api/product/hardness?pageIndex=1&pageSize=10000", { autoFetch: false });
  const {
    fetchData: fetchAssignmentCodes,
    data: assignmentData,
    loading: ld7,
  } = useApi<any>("/api/catalog/assignmentcode?pageIndex=1&pageSize=10000", { autoFetch: false });
  const {
    fetchData: fetchMaterials,
    data: materialsData,
    loading: ld8,
  } = useApi<any>("/api/catalog/material?pageIndex=1&pageSize=10000", { autoFetch: false });

  // 7. ====== State ======
  const [selectedProcess, setSelectedProcess] = useState<string>("");
  const [selectedPassport, setSelectedPassport] = useState<string>("");
  const [selectedHardness, setSelectedHardness] = useState<string>("");
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  // State `rows` lưu SỐ THÔ (number) cho unitPrice/total
  const [rows, setRows] = useState<LocalTransactionRow[]>([]);
  // THÊM: State ngày tháng
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // State cho việc tải dữ liệu
  const [isDropdownLoading, setIsDropdownLoading] = useState(true);
  const [isRecordLoading, setIsRecordLoading] = useState(true);
  const [record, setRecord] = useState<RepairsUnitPriceRecord | null>(null);

  // 8. ====== Load dropdowns (Giữ nguyên) ======
  useEffect(() => {
    const fetchAllData = async () => {
      setIsDropdownLoading(true);
      try {
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

  // 9. ====== Load bản ghi (Giữ nguyên) ======
  useEffect(() => {
    if (!id) {
      setIsRecordLoading(false);
      return;
    }
    const loadRecord = async () => {
      setIsRecordLoading(true);
      try {
        const data = await fetchById(id);
        if (data) {
          setRecord(data as RepairsUnitPriceRecord);
          // THÊM: Điền state Ngày tháng
          if ((data as RepairsUnitPriceRecord).startDate) {
            setStartDate(new Date((data as RepairsUnitPriceRecord).startDate));
          }
          if ((data as RepairsUnitPriceRecord).endDate) {
            setEndDate(new Date((data as RepairsUnitPriceRecord).endDate));
          }
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

  // 10. ====== Map options / data (useMemo, useEffect) (Giữ nguyên) ======
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

  // 11. ====== Populate Dropdowns & Rows (Giữ nguyên) ======
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
            // Chuyển số (123.4) thành chuỗi ("123,4")
            const quantityString = String(cost.quantity || "0").replace(
              ".",
              ","
            );
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
  ]);

  // 12. ====== TransactionSelector Handlers (Giữ nguyên) ======
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
          (r) => r.assignmentCodeId === codeId && r.materialId === material.id
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

  const handleRowChange = (
    id: string,
    field: keyof ImportedTransactionRow,
    value: string
  ) => {
    if (field !== "quantity") return;

    const rawValue = value;
    const cleanValue = rawValue.replace(/\./g, "");

    if (!/^[0-9]*(,[0-9]*)?$/.test(cleanValue)) {
      return;
    }

    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, quantity: cleanValue };
          const quantityNumber = parseLocalFloat(cleanValue);
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

  // 13. ====== Handle Submit (Áp dụng logic UnitsEdit.tsx) ======
  const handleSubmit = async (data: Record<string, string>) => {
    const code = data["Mã định mức máng trượt"]?.trim() || "";

    // Validation
    if (!code) return alert("⚠️ Vui lòng nhập Mã định mức máng trượt!");
    if (!selectedProcess)
      return alert("⚠️ Vui lòng chọn Nhóm công đoạn sản xuất!");
    if (!selectedPassport) return alert("⚠️ Vui lòng chọn Hộ chiếu!");
    if (!selectedHardness) return alert("⚠️ Vui lòng chọn Độ kiên cố!");
    if (rows.length === 0)
      return alert("⚠️ Vui lòng chọn ít nhất một Mã giao khoán!");

    // THÊM: Validation Ngày tháng (Giống file Input)
    if (!startDate) return alert("⚠️ Vui lòng chọn Ngày bắt đầu!");
    if (!endDate) return alert("⚠️ Vui lòng chọn Ngày kết thúc!");
    if (startDate > endDate)
      return alert("⚠️ Ngày kết thúc không được nhỏ hơn Ngày bắt đầu!");

    // Validation Dữ liệu bảng
    for (const row of rows) {
      const quantity = parseLocalFloat(row.quantity);
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
      // THÊM: Ngày tháng
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      costs: rows.map((row) => ({
        assignmentCodeId: row.assignmentCodeId,
        materialId: row.materialId,
        quantity: parseLocalFloat(row.quantity),
      })),
    };

    console.log("📤 PUT payload:", payload);

    // 1. ĐÓNG FORM NGAY LẬP TỨC
    

    try {
     
      // 2. CHỜ API VÀ RELOAD HOÀN TẤT
      await Promise.all([
        putData(payload, undefined),
      ]);
      // Thêm một độ trễ nhỏ để đảm bảo UI kịp cập nhật
      await new Promise(r => setTimeout(r, 0));
      
        
      // 4. HIỆN ALERT
      alert("✅ Cập nhật đơn giá máng trượt thành công!");
        
    } catch (e) {
      // 5. Bắt lỗi (Vì form đã đóng, ta alert lỗi ra ngoài)
      console.error("Lỗi giao dịch sau khi đóng form:", e);
      alert("❌ Đã xảy ra lỗi. Vui lòng kiểm tra lại dữ liệu.");
    }
    onClose?.();
      await onSuccess?.();
  };

  // 14. ====== Fields (LayoutInput) ======
  const fields = [
    { type: "custom7" as const }, // THÊM: Vị trí cho ngày tháng
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

  // Loading
  const isLoading = saving || isRecordLoading || isDropdownLoading; // Thêm `isRecordLoading`, `isDropdownLoading`
  // Lỗi bao gồm lỗi save HOẶC lỗi fetch
  const anyError = saveError || fetchByIdError;

  // 15. ====== Render Data (useMemo) (Giữ nguyên) ======

  // Tính 'initialData' bằng useMemo
  const computedInitialData = useMemo(() => {
    return {
      "Mã định mức máng trượt": record?.code || "",
    };
  }, [record]);

  // Tạo 'displayRows' (cho Đơn giá/Thành tiền)
  const displayRows = useMemo(() => {
    return rows.map((row) => ({
      ...row,
      // Chuyển đổi SỐ THÔ (number) -> CHUỖI ĐỊNH DẠNG (string)
      unitPrice: formatLocalFloat(row.unitPrice),
      total: formatLocalFloat(row.total),
      quantity: formatForInput(row.quantity),
    }));
  }, [rows]);

  // THÊM: Data cho FormRow (Ngày tháng)
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
      title="Cập nhật Đơn giá và định mức Máng trượt"
      fields={fields}
      onSubmit={handleSubmit}
      closePath={PATHS.REPAIRS.LIST}
      onClose={onClose}
      initialData={computedInitialData}
      key={record?.id} // Quan trọng: Đặt key để LayoutInput reset khi record thay đổi
      isLoading={isLoading}
      error={anyError}
    >
      {/* THÊM: Render hàng ngày tháng vào custom7 */}
      <div className="custom7" key="c7">
        <div className="date-row-slot">
          <FormRow rows={dateRowData} />
        </div>
      </div>

      {/* Render Dropdowns */}
      <div className="custom2" key="c2">
        <DropdownMenuSearchable
          label="Nhóm công đoạn sản xuất"
          options={processOptions}
          value={selectedProcess}
          onChange={setSelectedProcess}
          placeholder="Chọn nhóm công đoạn sản xuất"
          isDisabled={ld2 || isDropdownLoading}
        />
      </div>
      <div className="custom3" key="c3">
        <DropdownMenuSearchable
          label="Hộ chiếu, Sđ, Sc"
          options={passportOptions}
          value={selectedPassport}
          onChange={setSelectedPassport}
          placeholder="Chọn hộ chiếu"
          isDisabled={ld3 || isDropdownLoading}
        />
      </div>
      <div className="custom4" key="c4">
        <DropdownMenuSearchable
          label="Độ kiên cố đá/ than (f)"
          options={hardnessOptions}
          value={selectedHardness}
          onChange={setSelectedHardness}
          placeholder="Chọn độ kiên cố"
          isDisabled={ld4 || isDropdownLoading}
        />
      </div>

      {/* Render TransactionSelector */}
      <TransactionSelector
        label="Mã giao khoán"
        className="customTransactionSelector"
        options={assignmentCodeOptions} // Dropdown dùng code
        selectedCodes={selectedCodes}
        // Truyền 'displayRows' (đã định dạng)
        rows={displayRows as any}
        onSelectChange={handleSelectChange}
        onRowChange={handleRowChange}
        onRemoveRow={handleRemoveRow}
      />
    </LayoutInput>
  );
}