import { X } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import PATHS from "../../hooks/path";
import { useApi } from "../../hooks/useFetchData";
import "../../layout/layout_input.css";
import FormRow from "../../components/formRow";
import React from "react";

// === Định nghĩa interface cho dữ liệu (Giữ nguyên) ===
interface EquipmentListItem { id: string; code: string; }
interface EquipmentCost { startDate: string; endDate: string; costType: number; amount: number; }
interface EquipmentDetail { id: string; code: string; name: string; unitOfMeasureName: string; costs: EquipmentCost[]; }
interface EquipmentRowData {
  equipmentId: string; tenThietbi: string; donViTinh: string; dongiadiennang: number; monthlyElectricityCost: string; averageMonthlyTunnelProduction: string; dinhmucdiennang: string; chiphidiennang: string;
}
interface PostPayload {
  equipmentId: string; monthlyElectricityCost: number; averageMonthlyTunnelProduction: number; startDate: string; endDate: string;
}

// 1. Cập nhật Props
interface ElectricRailsInputProps {
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
    if (!value) return ""; const parts = value.split(","); const integerPart = parts[0]; const decimalPart = parts[1];
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    if (value.endsWith(",")) { return formattedInteger + ","; }
    if (decimalPart !== undefined) { return formattedInteger + "," + decimalPart; }
    return formattedInteger;
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

export default function ElectricRailsInput({ onClose, onSuccess }: ElectricRailsInputProps) {
  const navigate = useNavigate();
  const closePath = PATHS.ELECTRIC_RAILS.LIST;

  // === Gọi API ===
  const { data: equipmentListData = [] } = useApi<EquipmentListItem>(
    "/api/catalog/equipment?pageIndex=1&pageSize=10000"
  );
  const { postData, loading: isSubmitting } = useApi<PostPayload>(
    "/api/pricing/electricityunitpriceequipment"
  );
  const { fetchById: getEquipmentDetail, loading: isLoadingRows } =
    useApi<EquipmentDetail>("/api/catalog/equipment");

  // === State ===
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const [equipmentRows, setEquipmentRows] = useState<EquipmentRowData[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // === Memoized Options cho Dropdown ===
  const equipmentOptions = useMemo(() => {
    return equipmentListData.map((eq) => ({ value: eq.id, label: eq.code, }));
  }, [equipmentListData]);

  // === Xử lý sự kiện ===
  const handleClose = () => {
    onClose?.();
    if (!onClose && closePath) navigate(closePath);
  };

  const handleSelectChange = async (selected: any) => { /* Logic chọn thiết bị giữ nguyên */
    const newSelectedIds = selected ? selected.map((s: any) => s.value) : [];
    const existingRowsMap = new Map<string, EquipmentRowData>();
    equipmentRows.forEach(row => { existingRowsMap.set(row.equipmentId, row); });
    const idsToFetch = newSelectedIds.filter((id: string) => !existingRowsMap.has(id));
    let newFetchedRows: EquipmentRowData[] = [];
    if (idsToFetch.length > 0) {
      try {
        const detailPromises = idsToFetch.map((id: string) => getEquipmentDetail(id));
        const detailedEquipments = await Promise.all(detailPromises);
        
        const validEquipments = detailedEquipments.filter( (eq): eq is EquipmentDetail => eq !== null );

        newFetchedRows = validEquipments.map((eq): EquipmentRowData => {
          const electricCostObj = eq.costs ? eq.costs.find((c) => c.costType === 2) : null;
          const donGia = electricCostObj ? electricCostObj.amount : 0;

          return {
            equipmentId: eq.id,
            tenThietbi: eq.name || "N/A",
            donViTinh: eq.unitOfMeasureName || "N/A",
            dongiadiennang: donGia,
            monthlyElectricityCost: "",
            averageMonthlyTunnelProduction: "",
            dinhmucdiennang: "0",
            chiphidiennang: "0",
          };
        });
      } catch (error) { console.error("Lỗi khi tải chi tiết thiết bị:", error); }
    }
    const finalRows = newSelectedIds.map((id: string) => {
      return existingRowsMap.get(id) || newFetchedRows.find(r => r.equipmentId === id);
    }).filter((r: any): r is EquipmentRowData => r !== undefined); 

    setSelectedEquipmentIds(newSelectedIds);
    setEquipmentRows(finalRows);
  };

  // ✅ LOGIC SỬA ĐỔI: Chặn dấu chấm trong input
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
    const updatedRow = { ...newRows[index], [field]: cleanValue };
    const calculatedRow = calculateRow(updatedRow);
    newRows[index] = calculatedRow;
    setEquipmentRows(newRows);
  };

  const handleRemoveEquipmentRow = (indexToRemove: number) => {
    const rowToRemove = equipmentRows[indexToRemove];
    const newRows = equipmentRows.filter((_, index) => index !== indexToRemove);
    setEquipmentRows(newRows);
    setSelectedEquipmentIds(prev => prev.filter(id => id !== rowToRemove.equipmentId));
  };

  // ====== CẬP NHẬT: handleSubmit (LOGIC SỬA ĐÚNG) ======
  const handleSubmit = async () => {
    // 1. Validation
    if (!startDate) return alert("⚠️ Vui lòng chọn Ngày bắt đầu!");
    if (!endDate) return alert("⚠️ Vui lòng chọn Ngày kết thúc!");
    if (startDate > endDate) return alert("⚠️ Ngày kết thúc không được nhỏ hơn Ngày bắt đầu!");
    if (equipmentRows.length === 0) return alert("⚠️ Vui lòng chọn ít nhất một thiết bị!");

    // 2. Tạo Payload
    const submitPromises = equipmentRows.map((row) => {
      const payload: PostPayload = {
        equipmentId: row.equipmentId,
        monthlyElectricityCost: parseLocalFloat(row.monthlyElectricityCost),
        averageMonthlyTunnelProduction: parseLocalFloat(row.averageMonthlyTunnelProduction),
        startDate: startDate!.toISOString(),
        endDate: endDate!.toISOString(),
      };
      return postData(payload, undefined); // Không dùng callback thứ hai
    });

    // 3. ĐÓNG FORM NGAY LẬP TỨC
    handleClose(); 

    try {
      // 4. CHẠY API VÀ CHỜ THÀNH CÔNG
      await Promise.all(submitPromises); 

      // 5. RELOAD DỮ LIỆU VÀ CHỜ NEXT TICK
      if (onSuccess) {
          await onSuccess(); 
      };
      await new Promise(resolve => setTimeout(resolve, 0));

      // 6. HIỆN ALERT THÀNH CÔNG
      alert("✅ Tạo đơn giá điện năng thành công!");

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
        
        alert(`❌ TẠO THẤT BẠI: ${errorMessage}`);
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
  const selectedOptions = useMemo(() => {
    return equipmentOptions.filter((opt) =>
        selectedEquipmentIds.includes(opt.value)
    );
}, [equipmentOptions, selectedEquipmentIds]);
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
        <div className="header02">Tạo mới Đơn giá và định mức điện năng</div>
      </div>

      <div className="layout-input-body">
        {/* Header Sticky chứa Date & Select */}
        <div className="header2" style={{ position: "fixed", zIndex: 9999999, backgroundColor: "#f1f2f5", width: "755px" }}>
          
          {/* Hàng Ngày Tháng */}
          <div className="custom7" key="c7" style={{ marginBottom: "10px", marginTop: "0px" }}>
            <div className="date-row-slot"> <FormRow rows={dateRowData} /> </div>
          </div>

          {/* Dropdown Mã thiết bị */}
          <div className="input-row">
            <label style={{ marginTop: "10px" }}>Mã thiết bị</label>
            <Select isMulti options={equipmentOptions} value={selectedOptions} onChange={handleSelectChange} className="transaction-select-wrapper" classNamePrefix="transaction-select" placeholder="Chọn Mã thiết bị" isDisabled={isLoadingRows} menuPortalTarget={document.body} styles={{ menuPortal: (provided) => ({ ...provided, zIndex: 9999999 }), }} />
          </div>
        </div>

        <div style={{ marginTop: "180px", width: "100%", maxHeight: "400px", minHeight: "100px", overflowY: "auto" }}>
          {/* Loading indicator */}
          {isLoadingRows && equipmentRows.length === 0 && (
             <div style={{ textAlign: "center", padding: "20px" }}> Đang tải dữ liệu thiết bị... </div>
          )}

          {equipmentRows.map((row, index) => (
            <div key={row.equipmentId} style={{ display: "flex", gap: "16px", width: "125%", flexWrap: "wrap", marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px dashed #ccc", }}>
              {/* 1. Tên thiết bị */}
              <div className="input-row" style={{ width: "120px", marginBottom: "21px" }}>
                <label htmlFor={`tenThietbi-${index}`} style={{ display: "flex", textAlign: "center", height: "30px", alignItems: "center", justifyContent: "center" }}> Tên thiết bị </label>
                <div className="tooltip-wrapper">
                  <input type="text" id={`tenThietbi-${index}`} className="input-text" value={row.tenThietbi} readOnly style={{ width: "100%", backgroundColor: "#f1f2f5" }} />
                  <span className="tooltip-text">{row.tenThietbi}</span>
                </div>
              </div>

              {/* 2. Đơn giá điện năng */}
              <div className="input-row" style={{ width: "130px", marginBottom: "21px" }}>
                <label htmlFor={`dongiadiennang-${index}`} style={{ display: "flex", textAlign: "center", height: "30px", alignItems: "center", justifyContent: "center" }}> Đơn giá điện năng </label>
                <div className="tooltip-wrapper">
                  <input type="text" id={`dongiadiennang-${index}`} className="input-text" value={row.dongiadiennang.toLocaleString("vi-VN")} readOnly style={{ width: "100%", backgroundColor: "#f1f2f5" }} />
                  <span className="tooltip-text"> {row.dongiadiennang.toLocaleString("vi-VN")} </span>
                </div>
              </div>

              {/* 3. Đơn vị tính */}
              <div className="input-row" style={{ width: "80px", marginBottom: "21px" }}>
                <label htmlFor={`donViTinh-${index}`} style={{ display: "flex", textAlign: "center", height: "30px", alignItems: "center", justifyContent: "center" }}> ĐVT </label>
                <div className="tooltip-wrapper">
                  <input type="text" id={`donViTinh-${index}`} className="input-text" value={row.donViTinh} readOnly style={{ width: "100%", backgroundColor: "#f1f2f5" }} />
                  <span className="tooltip-text">{row.donViTinh}</span>
                </div>
              </div>

              {/* 4. Điện năng tiêu thụ (EDITABLE - FORMATTED) */}
              <div className="input-row" style={{ width: "120px" }}>
                <label htmlFor={`monthlyElectricityCost-${index}`} style={{ textAlign: "center", height: "30px" }}> Điện năng <br /> tiêu thụ/tháng </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`monthlyElectricityCost-${index}`}
                    placeholder="Nhập điện năng"
                    className="input-text"
                    value={formatInputDisplay(row.monthlyElectricityCost)}
                    onChange={(e) => handleRowChange(index, "monthlyElectricityCost", e.target.value)}
                    autoComplete="off"
                  />
                  <span className="tooltip-text"> {formatInputDisplay(row.monthlyElectricityCost) || "Chưa nhập"} </span>
                </div>
              </div>

              {/* 5. Sản lượng (EDITABLE - FORMATTED) */}
              <div className="input-row" style={{ width: "120px" }}>
                <label htmlFor={`averageMonthlyTunnelProduction-${index}`} style={{ textAlign: "center", height: "30px" }}> Sản lượng <br /> mét lò bình quân </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`averageMonthlyTunnelProduction-${index}`}
                    placeholder="Nhập sản lượng"
                    className="input-text"
                    value={formatInputDisplay(row.averageMonthlyTunnelProduction)}
                    onChange={(e) => handleRowChange(index, "averageMonthlyTunnelProduction", e.target.value)}
                    autoComplete="off"
                  />
                  <span className="tooltip-text"> {formatInputDisplay(row.averageMonthlyTunnelProduction) || "Chưa nhập"} </span>
                </div>
              </div>

              {/* 6. Định mức điện năng */}
              <div className="input-row" style={{ width: "100px", marginBottom: "21px" }}>
                <label htmlFor={`dinhmucdiennang-${index}`} style={{ textAlign: "center", height: "30px" }}> Định mức <br /> điện năng </label>
                <div className="tooltip-wrapper">
                  <input type="text" id={`dinhmucdiennang-${index}`} className="input-text" value={row.dinhmucdiennang} readOnly style={{ width: "100%", backgroundColor: "#f1f2f5" }} />
                  <span className="tooltip-text">{row.dinhmucdiennang}</span>
                </div>
              </div>

              {/* 7. Chi phí điện năng */}
              <div className="input-row" style={{ width: "100px", marginBottom: "21px" }}>
                <label htmlFor={`chiphidiennang-${index}`} style={{ textAlign: "center", height: "30px" }}> Chi phí <br /> điện năng </label>
                <div className="tooltip-wrapper">
                  <input type="text" id={`chiphidiennang-${index}`} className="input-text" value={row.chiphidiennang} readOnly style={{ width: "100%", backgroundColor: "#f1f2f5" }} />
                  <span className="tooltip-text">{row.chiphidiennang}</span>
                </div>
              </div>

              {/* Nút Xóa */}
              <button type="button" className="row-remove-button" title="Xóa hàng này" onClick={() => handleRemoveEquipmentRow(index)} > <X size={16} /> </button>
            </div>
          ))}

          {!isLoadingRows && equipmentRows.length === 0 && (
            <div style={{ textAlign: "center", padding: "20px", color: "#888" }}>
              {/* Trống */}
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
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
        </button>
      </div>
    </div>
  );
}