import { useState, useMemo, useEffect } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { useApi } from "../../hooks/useFetchData";
import PATHS from "../../hooks/path";
import "../../layout/layout_input.css";
import "../../components/transactionselector.css";
import FormRow from "../../components/formRow";

// === Định nghĩa interface cho dữ liệu (Giữ nguyên) ===
interface Equipment {
  id: string;
  code: string;
  name: string;
  unitOfMeasureId: string;
  unitOfMeasureName: string;
}
interface Part {
  id: string;
  code: string;
  name: string;
  unitOfMeasureId: string;
  unitOfMeasureName: string;
  equipmentId: string;
  equipmentCode: string;
  costAmmount: number;
}
interface PartRowData {
  partId: string;
  equipmentId: string;
  tenPhuTung: string;
  donGiaVatTu: number; // Sẽ lưu SỐ THÔ (number)
  donViTinh: string;
  dinhMucThoiGian: string; // Sẽ lưu chuỗi (vd: "1234,5")
  soLuongVatTu: string; // Sẽ lưu chuỗi (vd: "1234,5")
  sanLuongMetLo: string; // Sẽ lưu chuỗi (vd: "1234,5")
  dinhMucVatTuSCTX: string; // Sẽ lưu chuỗi định dạng (vd: "123,45")
  chiPhiVatTuSCTX: string; // Sẽ lưu chuỗi định dạng (vd: "100.000")
}

// Interface chi tiết chi phí (trong mảng costs)
interface CostItem {
  partId: string;
  quantity: number;
  replacementTimeStandard: number;
  averageMonthlyTunnelProduction: number;
}

// Interface Payload (Mảng các object theo thiết bị)
interface EquipmentPayload {
  equipmentId: string;
  startDate: string;
  endDate: string;
  costs: CostItem[];
}

// 1. Cập nhật Props
interface RepairsInputProps {
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Sửa type
}

// ====== CÁC HÀM TIỆN ÍCH (DI CHUYỂN LÊN ĐÂY) ======
const parseLocalFloat = (str: string | undefined | null): number => {
  if (!str) return 0;
  const cleanStr = str.replace(/\./g, "").replace(",", ".");
  return parseFloat(cleanStr || "0");
};

const formatNumberForDisplay = (value: number | undefined | null): string => {
  if (value === null || value === undefined) return "0";
  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value);
};

const formatLocalFloat = (value: number | undefined | null): string => {
  if (value === null || value === undefined) return "0";
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 4,
  }).format(value);
};

const formatInputDisplay = (value: string | undefined | null): string => {
  if (!value) return "";
  const parts = value.split(",");
  const integerPart = parts[0];
  const decimalPart = parts[1];
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  if (value.endsWith(",")) {
    return formattedInteger + ",";
  }
  if (decimalPart !== undefined) {
    return formattedInteger + "," + decimalPart;
  }
  return formattedInteger;
};
// === Hàm helper tính toán ===
const calculateRowCosts = (row: PartRowData): PartRowData => {
  const donGia = row.donGiaVatTu || 0;
  const dinhMucThoiGian = parseLocalFloat(row.dinhMucThoiGian);
  const soLuongVatTu = parseLocalFloat(row.soLuongVatTu);
  const sanLuongMetLo = parseLocalFloat(row.sanLuongMetLo);

  let dinhMucVatTu = 0;
  if (sanLuongMetLo !== 0 && dinhMucThoiGian !== 0) {
    dinhMucVatTu = (soLuongVatTu / dinhMucThoiGian) / sanLuongMetLo;
  }

  const chiPhiVatTu = dinhMucVatTu * donGia;

  return {
    ...row,
    dinhMucVatTuSCTX: formatLocalFloat(dinhMucVatTu),
    chiPhiVatTuSCTX: formatNumberForDisplay(chiPhiVatTu),
  };
};

export default function SlideRailsInput({ onClose, onSuccess }: RepairsInputProps) {
  const navigate = useNavigate();
  const closePath = PATHS.SLIDE_RAILS.LIST;

  // === Gọi API ===
  const { data: equipmentData = [] } = useApi<Equipment>(
    "/api/catalog/equipment?pageIndex=1&pageSize=10000"
  );
  const { data: allPartsData = [] } = useApi<Part>(
    "/api/catalog/part?pageIndex=1&pageSize=10000"
  );

  const { postData, loading: isSubmitting } = useApi<EquipmentPayload[]>(
    "/api/pricing/maintainunitpriceequipment"
  );

  // === State ===
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const [partRows, setPartRows] = useState<PartRowData[]>([]);

  // BỔ SUNG: State ngày tháng
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // === Memoized Options cho Dropdown ===
  const equipmentOptions = useMemo(() => {
    return equipmentData.map((eq) => ({
      value: eq.id,
      label: eq.code,
    }));
  }, [equipmentData]);

  useEffect(() => {}, []); // Giữ nguyên useEffect trống

  // === Xử lý sự kiện ===
  const handleClose = () => {
    onClose?.();
    if (!onClose && closePath) navigate(closePath);
  };

  const handleSelectChange = (selected: any) => {
    // ... (Logic chọn thiết bị và lọc phụ tùng giữ nguyên)
    const newSelectedIds = selected ? selected.map((s: any) => s.value) : [];
    const oldRowsMap = new Map<string, PartRowData>();
    partRows.forEach((row) => {
      oldRowsMap.set(row.partId, row);
    });

    const newRows = allPartsData
      .filter((part) => newSelectedIds.includes(part.equipmentId))
      .map(
        (part): PartRowData => {
          const existingRowData = oldRowsMap.get(part.id);
          if (existingRowData) {
            return existingRowData;
          }
          const initialRow: PartRowData = {
            partId: part.id,
            equipmentId: part.equipmentId,
            tenPhuTung: part.name,
            donGiaVatTu: part.costAmmount || 0,
            donViTinh: part.unitOfMeasureName || "Cái",
            dinhMucThoiGian: "",
            soLuongVatTu: "",
            sanLuongMetLo: "",
            dinhMucVatTuSCTX: "0",
            chiPhiVatTuSCTX: "0",
          };
          return calculateRowCosts(initialRow);
        }
      );

    setSelectedEquipmentIds(newSelectedIds);
    setPartRows(newRows);
  };

  const handleRowChange = (
    index: number,
    field: keyof PartRowData,
    value: string
  ) => {
    const newRows = [...partRows];
    let cleanValue = value;

    if (
      field === "dinhMucThoiGian" ||
      field === "soLuongVatTu" ||
      field === "sanLuongMetLo"
    ) {
      cleanValue = value.replace(/\./g, "");
      if (!/^[0-9]*(,[0-9]*)?$/.test(cleanValue)) {
        return;
      }
    }

    const updatedRow = { ...newRows[index], [field]: cleanValue };
    newRows[index] = calculateRowCosts(updatedRow);
    setPartRows(newRows);
  };

  const handleRemoveRow = (indexToRemove: number) => {
    const newRows = partRows.filter((_, index) => index !== indexToRemove);
    setPartRows(newRows);
  };

  // ====== CẬP NHẬT: Data cho FormRow (Ngày tháng) ======
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

  // ====== CẬP NHẬT: handleSubmit (LOGIC SỬA ĐÚNG) ======
  const handleSubmit = async () => {
    // 1. Validation
    if (!startDate) return alert("⚠️ Vui lòng chọn Ngày bắt đầu!");
    if (!endDate) return alert("⚠️ Vui lòng chọn Ngày kết thúc!");
    if (startDate > endDate) return alert("⚠️ Ngày kết thúc không được nhỏ hơn Ngày bắt đầu!");
    if (partRows.length === 0) return alert("⚠️ Vui lòng chọn ít nhất một thiết bị!");

    // 2. Tạo Payload
    const groupedByEquipment = new Map<string, PartRowData[]>();
    partRows.forEach(row => {
      const existing = groupedByEquipment.get(row.equipmentId) || [];
      existing.push(row);
      groupedByEquipment.set(row.equipmentId, existing);
    });

    const payload: EquipmentPayload[] = Array.from(groupedByEquipment.entries()).map(([equipmentId, rows]) => ({
      equipmentId: equipmentId,
      startDate: startDate!.toISOString(),
      endDate: endDate!.toISOString(),
      costs: rows.map(row => ({
        partId: row.partId,
        quantity: parseLocalFloat(row.soLuongVatTu),
        replacementTimeStandard: parseLocalFloat(row.dinhMucThoiGian),
        averageMonthlyTunnelProduction: parseLocalFloat(row.sanLuongMetLo)
      }))
    }));

    console.log("📤 POST payload:", payload);

    // 3. ĐÓNG FORM NGAY LẬP TỨC
    handleClose(); 

    try {
        // 4. CHẠY API và CHỜ THÀNH CÔNG (Không dùng callback thứ hai)
        await postData(payload, undefined); 

        // 5. RELOAD DỮ LIỆU VÀ CHỜ NEXT TICK
        if (onSuccess) {
            await onSuccess(); 
        };
        await new Promise(resolve => setTimeout(resolve, 0));

        // 6. HIỆN ALERT THÀNH CÔNG
        alert("✅ Tạo đơn giá và định mức thành công!");

    } catch (e: any) {
        // 7. BẮT LỖI và alert thất bại
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        
        let errorMessage = "Đã xảy ra lỗi không xác định.";

        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            
            if (detail.includes("Mã đã tồn tại") || detail.includes("exists")) {
                errorMessage = "Dữ liệu đơn giá đã tồn tại trong khoảng thời gian này!";
            } else if (detail.includes("HTTP error") || detail.includes("network")) {
                errorMessage = "Yêu cầu đến máy chủ thất bại. Vui lòng kiểm tra kết nối mạng.";
            } else {
                errorMessage = `Lỗi nghiệp vụ: ${detail}`;
            }
        }
        
        // 8. HIỂN THỊ ALERT THẤT BẠI CHI TIẾT
        alert(`❌ TẠO THẤT BẠI: ${errorMessage}`);
    }
  };


  const selectedOptions = equipmentOptions.filter((opt) =>
    selectedEquipmentIds.includes(opt.value)
  );

  return (
    <div
      className="layout-input-container"
      style={{ position: "relative", zIndex: 10000, height: "auto" }}
    >
      {/* ... (Phần UI giữ nguyên) ... */}
      <button className="close-btn" onClick={handleClose} title="Đóng">
        <X size={16} />
      </button>

      <div className="layout-input-header">
        <div className="header01">
          Đơn giá và định mức / Đơn giá và định mức SCTX
        </div>
        <div className="line"></div>
        <div className="header02">Tạo mới Đơn giá và định mức SCTX</div>
      </div>

      <div className="layout-input-body">
        <div className="layout-input-header1" style={{ position: "fixed", zIndex: 9999999, backgroundColor: "#f1f2f5", width: "755px" }}>
          
          {/* BỔ SUNG: Hàng chọn ngày tháng */}
          <div className="date-row-slot" style={{ marginTop: "0px", marginBottom: "10px" }}>
            <FormRow rows={dateRowData} />
          </div>

          <div className="input-row">
            <label style={{ marginTop: "10px" }}>Mã thiết bị</label>
            <Select
              isMulti
              options={equipmentOptions}
              value={selectedOptions}
              onChange={handleSelectChange}
              className="transaction-select-wrapper"
              classNamePrefix="transaction-select"
              placeholder="Chọn Mã thiết bị"
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (provided) => ({ ...provided, zIndex: 999999 }),
              }}
            />
          </div>
        </div>
        
        <div
          style={{
            marginTop: "180px", // Tăng margin top để tránh bị che bởi header
            width: "100%",
            maxHeight: "400px",
          }}
        >
          {partRows.map((row, index) => (
            <div
              key={row.partId}
              style={{
                display: "flex",
                gap: "16px",
                width: "135%",
                flexWrap: "wrap",
                marginBottom: "20px",
                paddingBottom: "20px",
                borderBottom: "1px dashed #ccc",
              }}
            >
              {[
                { label: "Tên phụ tùng", name: "tenPhuTung" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="input-row"
                  style={{ width: "100px", marginBottom: "21px" }}
                >
                  {/* ... UI logic cho Tên phụ tùng ... */}
                  <label
                    htmlFor={`${item.name}-${index}`}
                    style={{
                      display: "flex",
                      textAlign: "center",
                      height: "30px",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.label}
                  </label>
                  <div className="tooltip-wrapper">
                    <input
                      type="text"
                      id={`${item.name}-${index}`}
                      name={item.name}
                      className="input-text"
                      value={(row as any)[item.name]}
                      readOnly
                      style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                    />
                    <span className="tooltip-text">
                      {(row as any)[item.name]}
                    </span>
                  </div>
                </div>
              ))}

              {/* Định dạng Đơn giá vật tư */}
              <div
                className="input-row"
                style={{ width: "100px", marginBottom: "21px" }}
              >
                {/* ... UI logic cho Đơn giá vật tư ... */}
                <label
                  htmlFor={`donGiaVatTu-${index}`}
                  style={{
                    display: "flex",
                    textAlign: "center",
                    height: "30px",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Đơn giá vật tư
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`donGiaVatTu-${index}`}
                    name="donGiaVatTu"
                    className="input-text"
                    value={formatNumberForDisplay(row.donGiaVatTu)}
                    readOnly
                    style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                  />
                  <span className="tooltip-text">
                    {formatNumberForDisplay(row.donGiaVatTu)}
                  </span>
                </div>
              </div>

              {[
                { label: "ĐVT", name: "donViTinh" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="input-row"
                  style={{ width: "80px", marginBottom: "21px" }}
                >
                  {/* ... UI logic cho ĐVT ... */}
                  <label
                    htmlFor={`${item.name}-${index}`}
                    style={{
                      display: "flex",
                      textAlign: "center",
                      height: "30px",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.label}
                  </label>
                  <div className="tooltip-wrapper">
                    <input
                      type="text"
                      id={`${item.name}-${index}`}
                      name={item.name}
                      className="input-text"
                      value={(row as any)[item.name]}
                      readOnly
                      style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                    />
                    <span className="tooltip-text">
                      {(row as any)[item.name]}
                    </span>
                  </div>
                </div>
              ))}

              {/* Các trường nhập liệu có format */}
              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`dinhMucThoiGian-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  Định mức thời gian thay thế (tháng)
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`dinhMucThoiGian-${index}`}
                    name="dinhMucThoiGian"
                    placeholder="Nhập định mức"
                    className="input-text"
                    value={formatInputDisplay(row.dinhMucThoiGian)}
                    onChange={(e) =>
                      handleRowChange(index, "dinhMucThoiGian", e.target.value)
                    }
                    autoComplete="off"
                  />
                  <span className="tooltip-text">
                    {formatInputDisplay(row.dinhMucThoiGian) || "Chưa nhập"}
                  </span>
                </div>
              </div>
              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`soLuongVatTu-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  Số lượng vật tư 1 lần thay thế
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`soLuongVatTu-${index}`}
                    name="soLuongVatTu"
                    placeholder="Nhập số lượng"
                    className="input-text"
                    value={formatInputDisplay(row.soLuongVatTu)}
                    onChange={(e) =>
                      handleRowChange(index, "soLuongVatTu", e.target.value)
                    }
                    autoComplete="off"
                  />
                  <span className="tooltip-text">
                    {formatInputDisplay(row.soLuongVatTu) || "Chưa nhập"}
                  </span>
                </div>
              </div>
              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`sanLuongMetLo-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  Sản lượng lò đào bình quân (m)
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`sanLuongMetLo-${index}`}
                    name="sanLuongMetLo"
                    placeholder="Nhập sản lượng"
                    className="input-text"
                    value={formatInputDisplay(row.sanLuongMetLo)}
                    onChange={(e) =>
                      handleRowChange(index, "sanLuongMetLo", e.target.value)
                    }
                    autoComplete="off"
                  />
                  <span className="tooltip-text">
                    {formatInputDisplay(row.sanLuongMetLo) || "Chưa nhập"}
                  </span>
                </div>
              </div>

              <div
                className="input-row"
                style={{ width: "100px", marginBottom: "21px" }}
              >
                <label
                  htmlFor={`dinhMucVatTuSCTX-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  Định mức vật tư SCTX
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`dinhMucVatTuSCTX-${index}`}
                    name="dinhMucVatTuSCTX"
                    className="input-text"
                    value={row.dinhMucVatTuSCTX}
                    readOnly
                    style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                  />
                  <span className="tooltip-text">{row.dinhMucVatTuSCTX}</span>
                </div>
              </div>
              <div
                className="input-row"
                style={{ width: "100px", marginBottom: "21px" }}
              >
                <label
                  htmlFor={`chiPhiVatTuSCTX-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  Chi phí vật tư SCTX
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`chiPhiVatTuSCTX-${index}`}
                    name="chiPhiVatTuSCTX"
                    className="input-text"
                    value={row.chiPhiVatTuSCTX}
                    readOnly
                    style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                  />
                  <span className="tooltip-text">{row.chiPhiVatTuSCTX}</span>
                </div>
              </div>

              <button
                type="button"
                className="row-remove-button"
                title="Xóa hàng này"
                onClick={() => handleRemoveRow(index)}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="layout-input-footer">
        <button className="btn-cancel" onClick={handleClose}>
          Hủy
        </button>
        <button
          className="btn-confirm"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
        </button>
      </div>
    </div>
  );
}