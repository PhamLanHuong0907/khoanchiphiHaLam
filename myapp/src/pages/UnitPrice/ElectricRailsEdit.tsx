import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Select from "react-select"; // Import react-select
import { useApi } from "../../hooks/useFetchData"; // Import hook API
import PATHS from "../../hooks/path"; // Import PATHS
import "../../layout/layout_input.css";
import "../../components/transactionselector.css"; // Import CSS cho react-select
import FormRow from "../../components/formRow"; // Import FormRow cho Date

// === Định nghĩa interface cho dữ liệu ===

// 1. Interface cho API GET /api/catalog/equipment (CHỈ LẤY DANH SÁCH)
interface EquipmentListItem {
  id: string;
  code: string;
}

// 2. Interface cho dữ liệu GET từ /api/pricing/electricityunitpriceequipment/{id}
interface ElectricPriceRecord {
  id: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  unitOfMeasureName: string;
  equipmentElectricityCost: number;
  monthlyElectricityCost: number;
  averageMonthlyTunnelProduction: number;
  electricityConsumePerMetres: number;
  electricityCostPerMetres: number;
  // Thêm date
  startDate?: string;
  endDate?: string;
}

// 3. Dữ liệu cho mỗi hàng THIẾT BỊ hiển thị trên UI
interface EquipmentRowData {
  equipmentId: string;
  recordId: string;
  tenThietbi: string;
  donViTinh: string;
  dongiadiennang: number;
  // Lưu chuỗi để xử lý input có dấu chấm (vd: "1.000")
  monthlyElectricityCost: string; 
  averageMonthlyTunnelProduction: string;
  dinhmucdiennang: string;
  chiphidiennang: string;
}

// 4. Interface cho dữ liệu PUT payload
interface PutPayload {
  id: string;
  equipmentId: string;
  monthlyElectricityCost: number;
  averageMonthlyTunnelProduction: number;
  startDate: string; // Thêm date
  endDate: string;   // Thêm date
}

// Props cho component Edit
interface ElectricRailsEditProps {
  id: string; // ID của bản ghi giá (price record ID)
  onClose?: () => void;
}

export default function ElectricRailsEdit({ id, onClose }: ElectricRailsEditProps) {
  const navigate = useNavigate();
  const closePath = PATHS.ELECTRIC_RAILS.LIST;
  const basePath = "/api/pricing/electricityunitpriceequipment";

  // ====== CÁC HÀM TIỆN ÍCH ĐỊNH DẠNG SỐ ======

  /**
   * Chuyển đổi chuỗi (VD: "1.234,5") sang số (1234.5) để tính toán/submit
   */
  const parseLocalFloat = (str: string | undefined | null): number => {
    if (!str) return 0;
    const cleanStr = str.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanStr || "0");
  };

  /**
   * Chuyển đổi số từ API (1234.5) sang chuỗi nhập liệu ("1234,5")
   * Dùng khi load dữ liệu ban đầu
   */
  const formatLocalFloatInput = (num: number | undefined | null): string => {
    if (num === null || num === undefined) return "";
    return String(num).replace('.', ',');
  };

  /**
   * Định dạng số thành chuỗi hiển thị (VD: 1234.5 -> "1.234,5")
   * Dùng cho các trường Read-only (Định mức, Chi phí)
   */
  const formatLocalFloat = (value: number | undefined | null): string => {
    if (value === null || value === undefined) return "0";
    return new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 2,
    }).format(value);
  };

  /**
   * Định dạng Input khi người dùng gõ (VD: gõ "1000" -> hiện "1.000")
   */
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

  // === Gọi API ===
  const { data: equipmentListData = [] } = useApi<EquipmentListItem>(
    "/api/catalog/equipment?pageIndex=1&pageSize=10000"
  );

  const {
    fetchById,
    putData,
    loading: crudLoading,
  } = useApi<any>(basePath);

  // === State ===
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  const [equipmentRows, setEquipmentRows] = useState<EquipmentRowData[]>([]);
  
  // State ngày tháng
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // === Memoized Options cho Dropdown ===
  const equipmentOptions = useMemo(() => {
    return equipmentListData.map((eq) => ({
      value: eq.id,
      label: eq.code,
    }));
  }, [equipmentListData]);

  // === Tải dữ liệu khi component mount ===
  useEffect(() => {
    if (!id) {
      setIsLoadingData(false);
      return;
    }

    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const record = (await fetchById(id)) as ElectricPriceRecord | null;
        if (!record) {
          console.error("Không tìm thấy dữ liệu!");
          return;
        }

        // 1. Set Date
        if (record.startDate) setStartDate(new Date(record.startDate));
        if (record.endDate) setEndDate(new Date(record.endDate));

        // 2. Set dropdown (vô hiệu hóa)
        let selectedOpt = equipmentOptions.find(
          (opt) => opt.value === record.equipmentId
        );
        if (!selectedOpt) {
          selectedOpt = {
            value: record.equipmentId,
            label: record.equipmentCode,
          };
        }
        setSelectedOptions([selectedOpt]);

        // 3. Tạo HÀNG (row) duy nhất
        const singleRow: EquipmentRowData = {
          equipmentId: record.equipmentId,
          recordId: record.id,
          tenThietbi: record.equipmentName,
          donViTinh: record.unitOfMeasureName,
          dongiadiennang: record.equipmentElectricityCost,
          // Chuyển đổi số từ API thành chuỗi input (123.4 -> "123,4")
          monthlyElectricityCost: formatLocalFloatInput(record.monthlyElectricityCost),
          averageMonthlyTunnelProduction: formatLocalFloatInput(record.averageMonthlyTunnelProduction),
          // Các trường tính toán (Hiển thị)
          dinhmucdiennang: formatLocalFloat(record.electricityConsumePerMetres),
          chiphidiennang: new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(record.electricityCostPerMetres),
        };
        
        // Tính toán lại để đảm bảo đồng nhất
        const calculatedRow = calculateRow(singleRow);
        setEquipmentRows([calculatedRow]);

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Edit:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [id, fetchById, equipmentOptions]);

  // === Hàm tính toán ===
  const calculateRow = (row: EquipmentRowData): EquipmentRowData => {
    const donGia = row.dongiadiennang || 0;
    const dienNangTieuThu = parseLocalFloat(row.monthlyElectricityCost);
    const sanLuong = parseLocalFloat(row.averageMonthlyTunnelProduction);

    let dinhMuc = 0;
    if (sanLuong !== 0) dinhMuc = dienNangTieuThu / sanLuong;
    const chiPhi = dinhMuc * donGia;

    return {
      ...row,
      dinhmucdiennang: formatLocalFloat(dinhMuc),
      chiphidiennang: new Intl.NumberFormat("de-DE", {
         maximumFractionDigits: 0, // Chi phí không lấy số thập phân
         minimumFractionDigits: 0 
      }).format(chiPhi),
    };
  };

  // === Xử lý sự kiện ===

  const handleClose = () => {
    onClose?.();
    if (!onClose && closePath) navigate(closePath);
  };

  // Khi người dùng nhập liệu
  const handleRowChange = (
    index: number,
    field: keyof EquipmentRowData,
    value: string
  ) => {
    let cleanValue = value;

    // Xử lý format cho input số (chặn ký tự lạ, xóa dấu chấm)
    if (field === "monthlyElectricityCost" || field === "averageMonthlyTunnelProduction") {
       cleanValue = value.replace(/\./g, ""); // Xóa dấu chấm hiển thị
       if (!/^[0-9]*(,[0-9]*)?$/.test(cleanValue)) {
          return;
       }
    }

    const newRows = [...equipmentRows];
    const updatedRow = { ...newRows[index], [field]: cleanValue };

    // Tính toán lại hàng
    const calculatedRow = calculateRow(updatedRow);

    newRows[index] = calculatedRow;
    setEquipmentRows(newRows);
  };

  // Khi người dùng nhấn nút "Xác nhận"
  const handleSubmit = async () => {
    if (equipmentRows.length === 0) return;

    // Validation Date
    if (!startDate) return alert("⚠️ Vui lòng chọn Ngày bắt đầu!");
    if (!endDate) return alert("⚠️ Vui lòng chọn Ngày kết thúc!");
    if (startDate > endDate) return alert("⚠️ Ngày kết thúc không được nhỏ hơn Ngày bắt đầu!");
    
    const row = equipmentRows[0];

    const payload: PutPayload = {
      id: row.recordId,
      equipmentId: row.equipmentId,
      monthlyElectricityCost: parseLocalFloat(row.monthlyElectricityCost),
      averageMonthlyTunnelProduction: parseLocalFloat(row.averageMonthlyTunnelProduction),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    try {
      await putData(payload, () => {
        alert("📤 Cập nhật đơn giá điện năng thành công:");
        onClose?.(); // Gọi callback onSuccess
        if (!onClose && closePath) navigate(closePath);
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật dữ liệu:", error);
    }
  };

  // Data cho FormRow ngày tháng
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

  // === Render ===
  return (
    <div
      className="layout-input-container"
      style={{ position: "relative", zIndex: 10000, height: "auto" }}
    >
      <button className="close-btn" onClick={handleClose} title="Đóng">
        <X size={16} />
      </button>

      <div className="layout-input-header">
        <div className="header01">
          Đơn giá và định mức / Đơn giá và định mức điện năng
        </div>
        <div className="line"></div>
        <div className="header02">Chỉnh sửa Đơn giá và định mức điện năng</div>
      </div>

      <div className="layout-input-body">
        
        {/* Sticky Header: Date & Select */}
        <div className="header2" style={{ position: "fixed", zIndex: 9999999, backgroundColor: "#f1f2f5", width: "755px" }}>
          
          {/* Hàng Ngày Tháng */}
          <div className="custom7" key="c7" style={{ marginBottom: "10px" }}>
            <div className="date-row-slot">
              <FormRow rows={dateRowData} />
            </div>
          </div>

          {/* Dropdown Mã thiết bị (Disabled) */}
          <div className="input-row">
            <label style={{ marginTop: "10px" }}>Mã thiết bị</label>
            <Select
              isMulti
              options={equipmentOptions}
              value={selectedOptions}
              className="transaction-select-wrapper"
              classNamePrefix="transaction-select"
              placeholder="Chọn Mã thiết bị"
              isDisabled={true} // Vô hiệu hóa khi Edit
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
              }}
            />
          </div>
        </div>

        {/* Phần nội dung bảng (Scrollable) */}
        <div
          style={{
            marginTop: "230px", // Margin top để tránh bị che
            width: "100%",
            maxHeight: "400px",
            overflowY: "auto",
            minHeight: "100px",
          }}
        >
          {isLoadingData && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              Đang tải dữ liệu chỉnh sửa...
            </div>
          )}

          {!isLoadingData &&
            equipmentRows.map((row, index) => (
              <div
                key={row.equipmentId}
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
                {/* === CÁC TRƯỜNG READ-ONLY === */}
                <div className="input-row" style={{ width: "120px", marginBottom: "21px" }}>
                  <label htmlFor={`tenThietbi-${index}`} style={{ display: "flex", textAlign: "center", height: "30px", alignItems: "center", justifyContent: "center" }}>
                    Tên thiết bị
                  </label>
                  <div className="tooltip-wrapper">
                    <input
                      type="text"
                      id={`tenThietbi-${index}`}
                      className="input-text"
                      value={row.tenThietbi}
                      readOnly
                      style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                    />
                    <span className="tooltip-text">{row.tenThietbi}</span>
                  </div>
                </div>

                <div className="input-row" style={{ width: "100px", marginBottom: "21px" }}>
                  <label htmlFor={`dongiadiennang-${index}`} style={{ display: "flex", textAlign: "center", height: "30px", alignItems: "center", justifyContent: "center" }}>
                    Đơn giá điện năng
                  </label>
                  <div className="tooltip-wrapper">
                    <input
                      type="text"
                      id={`dongiadiennang-${index}`}
                      className="input-text"
                      value={row.dongiadiennang.toLocaleString("vi-VN")}
                      readOnly
                      style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                    />
                     <span className="tooltip-text">{row.dongiadiennang.toLocaleString("vi-VN")}</span>
                  </div>
                </div>

                <div className="input-row" style={{ width: "80px", marginBottom: "21px" }}>
                  <label htmlFor={`donViTinh-${index}`} style={{ display: "flex", textAlign: "center", height: "30px", alignItems: "center", justifyContent: "center" }}>
                    ĐVT
                  </label>
                  <div className="tooltip-wrapper">
                    <input
                      type="text"
                      id={`donViTinh-${index}`}
                      className="input-text"
                      value={row.donViTinh}
                      readOnly
                      style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                    />
                    <span className="tooltip-text">{row.donViTinh}</span>
                  </div>
                </div>

                {/* === CÁC TRƯỜNG EDITABLE (TEXT TYPE + FORMAT DISPLAY) === */}
                <div className="input-row" style={{ width: "120px" }}>
                  <label htmlFor={`monthlyElectricityCost-${index}`} style={{ textAlign: "center", height: "30px" }}>
                    Điện năng tiêu thụ/tháng
                  </label>
                  <div className="tooltip-wrapper">
                    <input
                      type="text" // Chuyển sang Text để hiển thị dấu chấm
                      id={`monthlyElectricityCost-${index}`}
                      placeholder="Nhập điện năng"
                      className="input-text"
                      // Format giá trị hiển thị
                      value={formatInputDisplay(row.monthlyElectricityCost)}
                      onChange={(e) =>
                        handleRowChange(index, "monthlyElectricityCost", e.target.value)
                      }
                      autoComplete="off"
                    />
                    <span className="tooltip-text">
                      {formatInputDisplay(row.monthlyElectricityCost) || "Chưa nhập"}
                    </span>
                  </div>
                </div>

                <div className="input-row" style={{ width: "120px" }}>
                  <label htmlFor={`averageMonthlyTunnelProduction-${index}`} style={{ textAlign: "center", height: "30px" }}>
                    Sản lượng mét lò BQ
                  </label>
                  <div className="tooltip-wrapper">
                    <input
                      type="text" // Chuyển sang Text
                      id={`averageMonthlyTunnelProduction-${index}`}
                      placeholder="Nhập sản lượng"
                      className="input-text"
                      // Format giá trị hiển thị
                      value={formatInputDisplay(row.averageMonthlyTunnelProduction)}
                      onChange={(e) =>
                        handleRowChange(index, "averageMonthlyTunnelProduction", e.target.value)
                      }
                      autoComplete="off"
                    />
                    <span className="tooltip-text">
                      {formatInputDisplay(row.averageMonthlyTunnelProduction) || "Chưa nhập"}
                    </span>
                  </div>
                </div>

                {/* === CÁC TRƯỜNG TÍNH TOÁN === */}
                <div className="input-row" style={{ width: "100px", marginBottom: "21px" }}>
                  <label htmlFor={`dinhmucdiennang-${index}`} style={{ textAlign: "center", height: "30px" }}>
                    Định mức điện năng
                  </label>
                  <div className="tooltip-wrapper">
                    <input
                      type="text"
                      id={`dinhmucdiennang-${index}`}
                      className="input-text"
                      value={row.dinhmucdiennang}
                      readOnly
                      style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                    />
                    <span className="tooltip-text">{row.dinhmucdiennang}</span>
                  </div>
                </div>

                <div className="input-row" style={{ width: "100px", marginBottom: "21px" }}>
                  <label htmlFor={`chiphidiennang-${index}`} style={{ textAlign: "center", height: "30px" }}>
                    Chi phí điện năng
                  </label>
                  <div className="tooltip-wrapper">
                    <input
                      type="text"
                      id={`chiphidiennang-${index}`}
                      className="input-text"
                      value={row.chiphidiennang}
                      readOnly
                      style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                    />
                    <span className="tooltip-text">{row.chiphidiennang}</span>
                  </div>
                </div>
              </div>
            ))}

          {!isLoadingData && equipmentRows.length === 0 && (
            <div style={{ textAlign: "center", padding: "20px", color: "#888" }}>
              Không tải được dữ liệu (ID: {id}).
            </div>
          )}
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
          disabled={crudLoading || isLoadingData}
        >
          {crudLoading ? "Đang xử lý..." : "Xác nhận"}
        </button>
      </div>
    </div>
  );
}