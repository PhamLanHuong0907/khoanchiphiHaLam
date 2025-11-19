import { X } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import PATHS from "../../hooks/path";
import { useApi } from "../../hooks/useFetchData";
import "../../layout/layout_input.css";
import FormRow from "../../components/formRow";
import React from "react";

// === Định nghĩa interface cho dữ liệu ===
interface EquipmentListItem { id: string; code: string; }
interface EquipmentCost { startDate: string; endDate: string; costType: number; amount: number; }
interface EquipmentDetail { id: string; code: string; name: string; unitOfMeasureName: string; costs: EquipmentCost[]; }
interface EquipmentRowData {
  equipmentId: string; tenThietbi: string; donViTinh: string; dongiadiennang: number; monthlyElectricityCost: string; averageMonthlyTunnelProduction: string; dinhmucdiennang: string; chiphidiennang: string;
}

// Interface cho API GET by ID
interface ElectricPriceRecord {
    id: string;
    equipmentId: string;
    equipmentCode: string;
    equipmentName: string;
    unitOfMeasureName: string;
    equipmentElectricityCost: string;
    monthlyElectricityCost: string;
    averageMonthlyTunnelProduction: string;
    startDate: string;
    endDate: string;
}

// Interface cho Payload POST/PUT
interface Payload {
  id: string; // THÊM ID VÀO PAYLOAD PUT
  equipmentId: string; monthlyElectricityCost: number; averageMonthlyTunnelProduction: number; startDate: string; endDate: string;
}


// 1. Cập nhật Props
interface ElectricRailsEditProps {
  id: string; // THÊM ID
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; 
}

// ====== CÁC HÀM TIỆN ÍCH ĐỊNH DẠNG SỐ (GIỮ NGUYÊN) ======
const parseLocalFloat = (str: string | undefined | null): number => {
    if (!str) return 0; const cleanStr = str.replace(/\./g, "").replace(",", "."); return parseFloat(cleanStr || "0");
};
const formatLocalFloat = (value: number | undefined | null): string => {
    if (value === null || value === undefined) return "0"; return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2, }).format(value);
};
const formatInputDisplay = (value: string | undefined | null): string => {
    if (!value) return ""; 
    const cleanValue = value.replace(/\./g, ""); // Đảm bảo không có dấu chấm trong chuỗi thô
    const parts = cleanValue.split(","); 
    const integerPart = parts[0]; 
    const decimalPart = parts[1];
    // Định dạng lại phần nguyên với dấu chấm
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    if (value.endsWith(",")) { return formattedInteger + ","; }
    if (decimalPart !== undefined) { return formattedInteger + "," + decimalPart; }
    return formattedInteger;
};
// SỬA: Hàm chuyển API string (1000.5) sang chuỗi input (1000,5)
const formatApiString = (str: string | undefined | null): string => {
    if (!str) return "";
    return String(str).replace('.', ',');
};
const parseApiString = (str: string | undefined | null): number => {
    if (!str) return 0;
    // Xóa dấu chấm (nghìn), thay dấu phẩy (thập phân) bằng dấu chấm
    const cleanStr = String(str).replace(/\./g, "").replace(',', '.'); 
    return parseFloat(cleanStr || "0");
};


// === Hàm tính toán (Giữ nguyên) ===
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
    chiphidiennang: new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(chiPhi),
  };
};

export default function ElectricRailsEdit({ id, onClose, onSuccess }: ElectricRailsEditProps) { // SỬA: Nhận id
  const navigate = useNavigate();
  const closePath = PATHS.ELECTRIC_RAILS.LIST;

  // === Gọi API ===
  const basePath = "/api/pricing/electricityunitpriceequipment";
  // SỬA: Hook PUT
  const { putData, loading: isSubmitting } = useApi<Payload>(basePath, { autoFetch: false });
  // SỬA: Hook GET by ID
  const { fetchById: getRecordDetail, loading: isRecordLoading, error: recordError } = useApi<ElectricPriceRecord>(basePath, { autoFetch: false });
  // Hook GET chi tiết thiết bị (để lấy đơn giá)
  const { fetchById: getEquipmentDetail, loading: isLoadingEquipmentDetail } =
    useApi<EquipmentDetail>("/api/catalog/equipment", { autoFetch: false });

  // === State ===
  const [record, setRecord] = useState<ElectricPriceRecord | null>(null); // State lưu bản ghi cũ
  const [equipmentRows, setEquipmentRows] = useState<EquipmentRowData[]>([]); // Chỉ có 1 hàng trong edit
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // === Load dữ liệu cũ (Record) ===
  useEffect(() => {
    if (!id) return;
    const loadRecord = async () => {
        try {
            const data = await getRecordDetail(id);
            if (data) {
                setRecord(data);
                
                // 1. Set Ngày tháng
                if (data.startDate) setStartDate(new Date(data.startDate));
                if (data.endDate) setEndDate(new Date(data.endDate));

                // 2. Fetch chi tiết thiết bị để lấy Đơn giá điện năng
                const equipmentDetail = await getEquipmentDetail(data.equipmentId);
                
                if (equipmentDetail) {
                    const electricCostObj = equipmentDetail.costs ? equipmentDetail.costs.find((c) => c.costType === 2) : null;
                    // Đơn giá điện năng từ EquipmentDetail (number)
                    const donGia = electricCostObj ? electricCostObj.amount : parseApiString(data.equipmentElectricityCost);

                    // Chuỗi input (dạng "1000,5")
                    const monthlyCostStr = formatApiString(data.monthlyElectricityCost);
                    const productionStr = formatApiString(data.averageMonthlyTunnelProduction);
                    
                    const newRow: EquipmentRowData = {
                        equipmentId: data.equipmentId,
                        tenThietbi: data.equipmentName || "N/A",
                        donViTinh: data.unitOfMeasureName || "N/A",
                        dongiadiennang: donGia, // number
                        monthlyElectricityCost: monthlyCostStr, // string
                        averageMonthlyTunnelProduction: productionStr, // string
                        dinhmucdiennang: "0",
                        chiphidiennang: "0",
                    };
                    
                    const calculatedRow = calculateRow(newRow);
                    setEquipmentRows([calculatedRow]);
                } else {
                    console.error("Không tìm thấy chi tiết thiết bị cho ID:", data.equipmentId);
                }
            }
        } catch (e) {
            console.error("Lỗi khi tải bản ghi chi tiết:", e);
        }
    };
    loadRecord();
  }, [id, getRecordDetail, getEquipmentDetail]);

  // === Xử lý sự kiện ===
  const handleClose = () => {
    onClose?.();
    if (!onClose && closePath) navigate(closePath);
  };

  const handleRowChange = (
    index: number,
    field: keyof EquipmentRowData,
    value: string
  ) => {
    let cleanValue = value;

    if (field === "monthlyElectricityCost" || field === "averageMonthlyTunnelProduction") {
       // 1. Xóa dấu chấm (. - ký tự không hợp lệ)
       cleanValue = value.replace(/\./g, ""); 
       
       // 2. Chặn nếu có ký tự không phải số hoặc dấu phẩy
       if (!/^[0-9]*(,[0-9]*)?$/.test(cleanValue)) { return; }
    }

    const newRows = [...equipmentRows];
    // SỬA: Luôn dùng index 0 vì chỉ có 1 hàng
    const updatedRow = { ...newRows[0], [field]: cleanValue };
    const calculatedRow = calculateRow(updatedRow);
    newRows[0] = calculatedRow;
    setEquipmentRows(newRows);
  };

  // HÀNH ĐỘNG XÓA HÀNG KHÔNG CẦN THIẾT TRONG CHẾ ĐỘ EDIT (CHỈ CÓ 1 HÀNG)
  // const handleRemoveEquipmentRow = (indexToRemove: number) => { /* ... */ };

  // ====== CẬP NHẬT: handleSubmit (PUT) ======
  const handleSubmit = async () => {
    // 1. Validation
    if (!id) return alert("❌ Thiếu ID để cập nhật!");
    if (!startDate) return alert("⚠️ Vui lòng chọn Ngày bắt đầu!");
    if (!endDate) return alert("⚠️ Vui lòng chọn Ngày kết thúc!");
    if (startDate > endDate) return alert("⚠️ Ngày kết thúc không được nhỏ hơn Ngày bắt đầu!");
    if (equipmentRows.length === 0) return alert("⚠️ Thiếu dữ liệu thiết bị!");
    
    const row = equipmentRows[0];
    const monthlyCost = parseLocalFloat(row.monthlyElectricityCost);
    const production = parseLocalFloat(row.averageMonthlyTunnelProduction);
    
    if (monthlyCost <= 0) return alert("⚠️ Vui lòng nhập Điện năng tiêu thụ hợp lệ (> 0)!");
    if (production <= 0) return alert("⚠️ Vui lòng nhập Sản lượng đào lò hợp lệ (> 0)!");

    // 2. Tạo Payload
    const payload: Payload = {
        id: id,
        equipmentId: row.equipmentId,
        monthlyElectricityCost: monthlyCost,
        averageMonthlyTunnelProduction: production,
        startDate: startDate!.toISOString(),
        endDate: endDate!.toISOString(),
    };

    // 3. ĐÓNG FORM NGAY LẬP TỨC
    handleClose(); 

    try {
      // 4. CHẠY API VÀ CHỜ THÀNH CÔNG
      await putData(payload, undefined); 

      // 5. RELOAD DỮ LIỆU VÀ CHỜ NEXT TICK
      if (onSuccess) {
          await onSuccess(); 
      };
      await new Promise(resolve => setTimeout(resolve, 0));

      // 6. HIỆN ALERT THÀNH CÔNG
      alert("✅ Cập nhật đơn giá điện năng thành công!");

    } catch (e: any) {
        // 7. BẮT LỖI và alert thất bại
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        
        let errorMessage = "Đã xảy ra lỗi không xác định.";

        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            
            if (detail.includes("đã tồn tại") || detail.includes("duplicate")) {
                errorMessage = "Dữ liệu đơn giá đã tồn tại trong khoảng thời gian này!";
            } else if (detail.includes("HTTP error") || detail.includes("network")) {
                errorMessage = "Yêu cầu đến máy chủ thất bại. Vui lòng kiểm tra kết nối mạng.";
            } else {
                errorMessage = `Lỗi nghiệp vụ: ${detail}`;
            }
        }
        
        alert(`❌ CẬP NHẬT THẤT BẠI: ${errorMessage}`);
    }
  };

  // Data cho FormRow ngày tháng
  const dateRowData = useMemo(
    () => [
      [
        { type: "date" as const, label: "Ngày bắt đầu", value: startDate, onChange: setStartDate, placeholder: "Chọn ngày bắt đầu", },
        { type: "date" as const, label: "Ngày kết thúc", value: endDate, onChange: setEndDate, placeholder: "Chọn ngày kết thúc", },
      ],
    ], [startDate, endDate]
  );
  
  // SỬA: Hiển thị loading khi đang tải record hoặc đang submit
  const isLoading = isRecordLoading || isLoadingEquipmentDetail || isSubmitting;
  
  // Lấy ra hàng đầu tiên để render
  const rowToRender = equipmentRows[0];
  const equipmentCode = record?.equipmentCode || (rowToRender?.equipmentId && "Đang tải...");

  return (
    <div className="layout-input-container" style={{ position: "relative", zIndex: 10000, height: "auto" }}>
      <button className="close-btn" onClick={handleClose} title="Đóng">
        <X size={16} />
      </button>

      <div className="layout-input-header">
        <div className="header01">
          Đơn giá và định mức / Đơn giá và định mức điện năng
        </div>
        <div className="line"></div>
        <div className="header02">Cập nhật Đơn giá và định mức điện năng</div>
      </div>
      
      {/* SỬA: Hiển thị lỗi khi load record */}
      {recordError && <div className="text-red-500 p-4">{recordError}</div>}

      <div className="layout-input-body">
        {/* Header Sticky chứa Date & Mã thiết bị (Đã được load) */}
        <div className="header2" style={{ position: "fixed", zIndex: 9999999, backgroundColor: "#f1f2f5", width: "755px" }}>
          
          {/* Hàng Ngày Tháng */}
          <div className="custom7" key="c7" style={{ marginBottom: "10px", marginTop: "0px" }}>
            <div className="date-row-slot"> <FormRow rows={dateRowData} /> </div>
          </div>

          {/* HIỂN THỊ Mã thiết bị (Read-only) */}
          <div className="input-row">
            <label style={{ marginTop: "10px" }}>Mã thiết bị</label>
            <input 
                type="text" 
                className="input-text" 
                value={equipmentCode || "N/A"} 
                readOnly 
                style={{ backgroundColor: "#f1f2f5" }}
                disabled={isLoading}
            />
          </div>
        </div>

        <div style={{ marginTop: "180px", width: "100%", maxHeight: "400px", minHeight: "100px", overflowY: "auto" }}>
          {/* Loading indicator */}
          {isLoading && !rowToRender && (
             <div style={{ textAlign: "center", padding: "20px" }}> </div>
          )}

          {rowToRender && (
            // SỬA: Chỉ render 1 hàng
            <div key={rowToRender.equipmentId} style={{ display: "flex", gap: "16px", width: "114%", flexWrap: "wrap", marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px dashed #ccc", }}>
              {/* 1. Tên thiết bị */}
              <div className="input-row" style={{ width: "120px", marginBottom: "21px" }}>
                <label htmlFor={`tenThietbi`} style={{ display: "flex", textAlign: "center", height: "30px", alignItems: "center", justifyContent: "center" }}> Tên thiết bị </label>
                <div className="tooltip-wrapper">
                  <input type="text" id={`tenThietbi`} className="input-text" value={rowToRender.tenThietbi} readOnly style={{ width: "100%", backgroundColor: "#f1f2f5" }} />
                  <span className="tooltip-text">{rowToRender.tenThietbi}</span>
                </div>
              </div>

              {/* 2. Đơn giá điện năng */}
              <div className="input-row" style={{ width: "130px", marginBottom: "21px" }}>
                <label htmlFor={`dongiadiennang`} style={{ display: "flex", textAlign: "center", height: "30px", alignItems: "center", justifyContent: "center" }}> Đơn giá điện năng </label>
                <div className="tooltip-wrapper">
                  <input type="text" id={`dongiadiennang`} className="input-text" value={rowToRender.dongiadiennang.toLocaleString("vi-VN")} readOnly style={{ width: "100%", backgroundColor: "#f1f2f5" }} />
                  <span className="tooltip-text"> {rowToRender.dongiadiennang.toLocaleString("vi-VN")} </span>
                </div>
              </div>

              {/* 3. Đơn vị tính */}
              <div className="input-row" style={{ width: "80px", marginBottom: "21px" }}>
                <label htmlFor={`donViTinh`} style={{ display: "flex", textAlign: "center", height: "30px", alignItems: "center", justifyContent: "center" }}> ĐVT </label>
                <div className="tooltip-wrapper">
                  <input type="text" id={`donViTinh`} className="input-text" value={rowToRender.donViTinh} readOnly style={{ width: "100%", backgroundColor: "#f1f2f5" }} />
                  <span className="tooltip-text">{rowToRender.donViTinh}</span>
                </div>
              </div>

              {/* 4. Điện năng tiêu thụ (EDITABLE - FORMATTED) */}
              <div className="input-row" style={{ width: "120px" }}>
                <label htmlFor={`monthlyElectricityCost`} style={{ textAlign: "center", height: "30px" }}> Điện năng <br /> tiêu thụ/tháng </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`monthlyElectricityCost`}
                    placeholder="Nhập điện năng"
                    className="input-text"
                    value={formatInputDisplay(rowToRender.monthlyElectricityCost)}
                    onChange={(e) => handleRowChange(0, "monthlyElectricityCost", e.target.value)}
                    autoComplete="off"
                    disabled={isLoading}
                  />
                  <span className="tooltip-text"> {formatInputDisplay(rowToRender.monthlyElectricityCost) || "Chưa nhập"} </span>
                </div>
              </div>

              {/* 5. Sản lượng (EDITABLE - FORMATTED) */}
              <div className="input-row" style={{ width: "120px" }}>
                <label htmlFor={`averageMonthlyTunnelProduction`} style={{ textAlign: "center", height: "30px" }}> Sản lượng <br /> mét lò bình quân </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`averageMonthlyTunnelProduction`}
                    placeholder="Nhập sản lượng"
                    className="input-text"
                    value={formatInputDisplay(rowToRender.averageMonthlyTunnelProduction)}
                    onChange={(e) => handleRowChange(0, "averageMonthlyTunnelProduction", e.target.value)}
                    autoComplete="off"
                    disabled={isLoading}
                  />
                  <span className="tooltip-text"> {formatInputDisplay(rowToRender.averageMonthlyTunnelProduction) || "Chưa nhập"} </span>
                </div>
              </div>

              {/* 6. Định mức điện năng */}
              <div className="input-row" style={{ width: "100px", marginBottom: "21px" }}>
                <label htmlFor={`dinhmucdiennang`} style={{ textAlign: "center", height: "30px" }}> Định mức <br /> điện năng </label>
                <div className="tooltip-wrapper">
                  <input type="text" id={`dinhmucdiennang`} className="input-text" value={rowToRender.dinhmucdiennang} readOnly style={{ width: "100%", backgroundColor: "#f1f2f5" }} />
                  <span className="tooltip-text">{rowToRender.dinhmucdiennang}</span>
                </div>
              </div>

              {/* 7. Chi phí điện năng */}
              <div className="input-row" style={{ width: "100px", marginBottom: "21px" }}>
                <label htmlFor={`chiphidiennang`} style={{ textAlign: "center", height: "30px" }}> Chi phí <br /> điện năng </label>
                <div className="tooltip-wrapper">
                  <input type="text" id={`chiphidiennang`} className="input-text" value={rowToRender.chiphidiennang} readOnly style={{ width: "100%", backgroundColor: "#f1f2f5" }} />
                  <span className="tooltip-text">{rowToRender.chiphidiennang}</span>
                </div>
              </div>

              {/* Nút Xóa (Đã loại bỏ) */}
            </div>
          )}

          {!isLoading && !rowToRender && !recordError && (
            <div style={{ textAlign: "center", padding: "20px", color: "#888" }}>
              Không tìm thấy dữ liệu cũ.
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="layout-input-footer">
        <button className="btn-cancel" onClick={handleClose}> Hủy </button>
        <button
          className="btn-confirm"
          onClick={handleSubmit}
          disabled={!rowToRender || isLoading} // Disable nếu đang tải hoặc không có dữ liệu
        >
          {isSubmitting ? "Xác nhận" : "Xác nhận"}
        </button>
      </div>
    </div>
  );
}