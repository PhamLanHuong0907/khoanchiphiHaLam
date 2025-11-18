import { X } from "lucide-react";
import { useMemo, useState} from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select"; // Import react-select
import "../../components/transactionselector.css"; // Import CSS (NƠI CHỨA TOOLTIP VÀ NÚT XÓA)
import PATHS from "../../hooks/path"; // Import PATHS
import { useApi } from "../../hooks/useFetchData"; // Import hook API
import "../../layout/layout_input.css";
import FormRow from "../../components/formRow";

// === Định nghĩa interface cho dữ liệu ===

// Interface cho API GET /api/catalog/equipment (CHỈ LẤY DANH SÁCH)
interface EquipmentListItem {
  id: string;
  code: string;
}

// Interface cho mảng costs lồng nhau
interface EquipmentCost {
  startDate: string;
  endDate: string;
  costType: number;
  amount: number;
}

// Interface cho API GET /api/catalog/equipment/{id} (DỮ LIỆU CHI TIẾT)
interface EquipmentDetail {
  id: string;
  code: string;
  name: string;
  unitOfMeasureId: string;
  unitOfMeasureName: string;
  costs: EquipmentCost[];
}

// Dữ liệu cho mỗi hàng THIẾT BỊ hiển thị trên UI
interface EquipmentRowData {
  equipmentId: string;
  tenThietbi: string;
  donViTinh: string;
  dongiadiennang: number;
  // Lưu chuỗi để xử lý input có dấu chấm (vd: "1.000")
  monthlyElectricityCost: string; 
  averageMonthlyTunnelProduction: string;
  dinhmucdiennang: string;
  chiphidiennang: string;
}

// Interface cho payload chính gửi đi
interface PostPayload {
  equipmentId: string;
  monthlyElectricityCost: number;
  averageMonthlyTunnelProduction: number;
  startDate: string; // Thêm Date
  endDate: string;   // Thêm Date
}
// === KẾT THÚC THAY ĐỔI ===

export default function ElectricRailsInput({
  onClose,
}: {
  onClose?: () => void;
}) {
  const navigate = useNavigate();
  const closePath = PATHS.ELECTRIC_RAILS.LIST;

  // ====== CÁC HÀM TIỆN ÍCH ĐỊNH DẠNG SỐ ======
  
  /**
   * Chuyển đổi chuỗi (VD: "1.234,5") sang số (1234.5) để tính toán
   */
  const parseLocalFloat = (str: string | undefined | null): number => {
    if (!str) return 0;
    // Xóa dấu chấm (hàng nghìn), thay dấu phẩy (thập phân) bằng chấm
    const cleanStr = str.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanStr || "0");
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

    // Tách phần nguyên và phần thập phân
    const parts = value.split(",");
    const integerPart = parts[0];
    const decimalPart = parts[1];

    // Chỉ định dạng phần nguyên bằng dấu chấm (1234 -> 1.234)
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // Ghép lại
    if (value.endsWith(",")) {
      return formattedInteger + ",";
    }
    if (decimalPart !== undefined) {
      return formattedInteger + "," + decimalPart;
    }
    return formattedInteger;
  };

  // === Gọi API ===
  // 1. API GET cho dropdown (Tự động chạy khi mount)
  const { data: equipmentListData = [] } = useApi<EquipmentListItem>(
    "/api/catalog/equipment?pageIndex=1&pageSize=10000"
  );

  // 2. API POST (Dùng để submit)
  const { postData, loading: isSubmitting } = useApi<PostPayload>(
    "/api/pricing/electricityunitpriceequipment"
  );

  // 3. API GET BY ID (Dùng để lấy chi tiết khi chọn)
  const { fetchById: getEquipmentDetail, loading: isLoadingRows } =
    useApi<EquipmentDetail>("/api/catalog/equipment"); // Base path

  // === State ===
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
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

  // === Xử lý sự kiện ===

  const handleClose = () => {
    onClose?.();
    if (!onClose && closePath) navigate(closePath);
  };

  // === LOGIC CHỌN THIẾT BỊ (ĐÃ SỬA ĐỂ KHÔNG MẤT DỮ LIỆU CŨ) ===
  const handleSelectChange = async (selected: any) => {
    const newSelectedIds = selected ? selected.map((s: any) => s.value) : [];
    
    // 1. Tạo Map từ các hàng hiện có để bảo toàn dữ liệu
    const existingRowsMap = new Map<string, EquipmentRowData>();
    equipmentRows.forEach(row => {
      existingRowsMap.set(row.equipmentId, row);
    });

    // 2. Xác định các ID mới cần fetch dữ liệu
    const idsToFetch = newSelectedIds.filter((id: string) => !existingRowsMap.has(id));

    let newFetchedRows: EquipmentRowData[] = [];

    // 3. Fetch dữ liệu cho các ID mới (nếu có)
    if (idsToFetch.length > 0) {
      try {
        const detailPromises = idsToFetch.map((id: string) => getEquipmentDetail(id));
        const detailedEquipments = await Promise.all(detailPromises);
        
        const validEquipments = detailedEquipments.filter(
          (eq): eq is EquipmentDetail => eq !== null
        );

        newFetchedRows = validEquipments.map((eq): EquipmentRowData => {
          const electricCostObj = eq.costs
            ? eq.costs.find((c) => c.costType === 2)
            : null;
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
      } catch (error) {
        console.error("Lỗi khi tải chi tiết thiết bị:", error);
      }
    }

    // 4. Hợp nhất: Lấy hàng cũ (nếu có) hoặc hàng mới fetch, theo thứ tự selection
    const finalRows = newSelectedIds.map((id: string) => {
      return existingRowsMap.get(id) || newFetchedRows.find(r => r.equipmentId === id);
    }).filter((r: any): r is EquipmentRowData => r !== undefined); // Lọc undefined để an toàn

    setSelectedEquipmentIds(newSelectedIds);
    setEquipmentRows(finalRows);
  };

  // Khi người dùng nhập liệu vào một hàng (ĐÃ SỬA FORMAT)
  const handleRowChange = (
    index: number,
    field: keyof EquipmentRowData,
    value: string
  ) => {
    let cleanValue = value;

    // Xử lý format cho input số
    if (field === "monthlyElectricityCost" || field === "averageMonthlyTunnelProduction") {
       // Chặn nhập ký tự không hợp lệ, chỉ cho số và dấu phẩy
       cleanValue = value.replace(/\./g, ""); // Xóa dấu chấm hiển thị
       if (!/^[0-9]*(,[0-9]*)?$/.test(cleanValue)) {
          return;
       }
    }

    const newRows = [...equipmentRows];
    const updatedRow = { ...newRows[index], [field]: cleanValue };

    // Logic tính toán (Sử dụng parseLocalFloat)
    const donGia = updatedRow.dongiadiennang || 0;
    const dienNangTieuThu = parseLocalFloat(updatedRow.monthlyElectricityCost);
    const sanLuong = parseLocalFloat(updatedRow.averageMonthlyTunnelProduction);

    let dinhMuc = 0;
    if (sanLuong !== 0) dinhMuc = dienNangTieuThu / sanLuong;
    const chiPhi = dinhMuc * donGia;

    // Cập nhật kết quả tính toán (Format hiển thị)
    updatedRow.dinhmucdiennang = formatLocalFloat(dinhMuc);
    updatedRow.chiphidiennang = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(chiPhi); // Chi phí dùng dấu chấm

    newRows[index] = updatedRow;
    setEquipmentRows(newRows);
  };

  // Khi người dùng nhấn nút "Xác nhận"
  const handleSubmit = async () => {
    // Validation Date
    if (!startDate) return alert("⚠️ Vui lòng chọn Ngày bắt đầu!");
    if (!endDate) return alert("⚠️ Vui lòng chọn Ngày kết thúc!");
    if (startDate > endDate) return alert("⚠️ Ngày kết thúc không được nhỏ hơn Ngày bắt đầu!");
    
    if (equipmentRows.length === 0) return alert("⚠️ Vui lòng chọn ít nhất một thiết bị!");

    const submitPromises = equipmentRows.map((row) => {
      // Validation Row Data
      const cost = parseLocalFloat(row.monthlyElectricityCost);
      const prod = parseLocalFloat(row.averageMonthlyTunnelProduction);
      
      // (Có thể thêm validation check > 0 ở đây nếu cần)

      const payload: PostPayload = {
        equipmentId: row.equipmentId,
        monthlyElectricityCost: cost,
        averageMonthlyTunnelProduction: prod,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
      console.log("Posting payload:", payload);
      return postData(payload); 
    });

    try {
      await Promise.all(submitPromises);
      alert("📤 Đã gửi đơn giá điện năng thành công");
      onClose?.(); // Gọi callback onSuccess nếu có trong Props (code cũ không có, nhưng nên thêm)
      if (!onClose && closePath) navigate(closePath);
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu (ít nhất 1 request thất bại):", error);
    }
  };

  // Hàm xóa hàng
  const handleRemoveEquipmentRow = (indexToRemove: number) => {
    const rowToRemove = equipmentRows[indexToRemove];
    const newRows = equipmentRows.filter((_, index) => index !== indexToRemove);
    setEquipmentRows(newRows);
    // Cập nhật lại cả selectedIds để đồng bộ với Dropdown
    setSelectedEquipmentIds(prev => prev.filter(id => id !== rowToRemove.equipmentId));
  };

  const selectedOptions = equipmentOptions.filter((opt) =>
    selectedEquipmentIds.includes(opt.value)
  );

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
        <div className="header02">Tạo mới Đơn giá và định mức điện năng</div>
      </div>

      <div className="layout-input-body">
        {/* Header Sticky chứa Date & Select */}
        <div className="header2" style={{ position: "fixed", zIndex: 9999999, backgroundColor: "#f1f2f5", width: "755px" }}>
          
          {/* Hàng Ngày Tháng */}
          <div className="custom7" key="c7" style={{ marginBottom: "10px" }}>
            <div className="date-row-slot">
              <FormRow rows={dateRowData} />
            </div>
          </div>

          {/* Dropdown Mã thiết bị */}
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
              isDisabled={isLoadingRows}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (provided) => ({ ...provided, zIndex: 9999999 }),
              }}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: "230px", // Tăng margin top để tránh bị che
            width: "100%",
            maxHeight: "400px",
            minHeight: "100px",
            overflowY: "auto"
          }}
        >
          {/* Loading indicator */}
          {isLoadingRows && equipmentRows.length === 0 && (
             <div style={{ textAlign: "center", padding: "20px" }}>
               Đang tải dữ liệu thiết bị...
             </div>
          )}

          {equipmentRows.map((row, index) => (
            <div
              key={row.equipmentId}
              style={{
                display: "flex",
                gap: "16px",
                width: "125%",
                flexWrap: "wrap",
                marginBottom: "20px",
                paddingBottom: "20px",
                borderBottom: "1px dashed #ccc",
              }}
            >
              {/* 1. Tên thiết bị */}
              <div className="input-row" style={{ width: "120px", marginBottom: "21px" }}>
                <label
                  htmlFor={`tenThietbi-${index}`}
                  style={{ display: "flex", textAlign: "center", height: "30px", alignItems: "center", justifyContent: "center" }}
                >
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

              {/* 2. Đơn giá điện năng */}
              <div className="input-row" style={{ width: "130px", marginBottom: "21px" }}>
                <label
                  htmlFor={`dongiadiennang-${index}`}
                  style={{ display: "flex", textAlign: "center", height: "30px", alignItems: "center", justifyContent: "center" }}
                >
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
                  <span className="tooltip-text">
                    {row.dongiadiennang.toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>

              {/* 3. Đơn vị tính */}
              <div className="input-row" style={{ width: "80px", marginBottom: "21px" }}>
                <label
                  htmlFor={`donViTinh-${index}`}
                  style={{ display: "flex", textAlign: "center", height: "30px", alignItems: "center", justifyContent: "center" }}
                >
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

              {/* 4. Điện năng tiêu thụ (EDITABLE - FORMATTED) */}
              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`monthlyElectricityCost-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  Điện năng <br /> tiêu thụ/tháng
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text" // Đổi thành text để hiện dấu chấm
                    id={`monthlyElectricityCost-${index}`}
                    placeholder="Nhập điện năng"
                    className="input-text"
                    // Sử dụng hàm formatInputDisplay
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

              {/* 5. Sản lượng (EDITABLE - FORMATTED) */}
              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`averageMonthlyTunnelProduction-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  Sản lượng <br /> mét lò bình quân
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text" // Đổi thành text
                    id={`averageMonthlyTunnelProduction-${index}`}
                    placeholder="Nhập sản lượng"
                    className="input-text"
                    // Sử dụng hàm formatInputDisplay
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

              {/* 6. Định mức điện năng */}
              <div className="input-row" style={{ width: "100px", marginBottom: "21px" }}>
                <label
                  htmlFor={`dinhmucdiennang-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  Định mức <br /> điện năng
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

              {/* 7. Chi phí điện năng */}
              <div className="input-row" style={{ width: "100px", marginBottom: "21px" }}>
                <label
                  htmlFor={`chiphidiennang-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  Chi phí <br /> điện năng
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

              {/* Nút Xóa */}
              <button
                type="button"
                className="row-remove-button"
                title="Xóa hàng này"
                onClick={() => handleRemoveEquipmentRow(index)}
              >
                <X size={16} />
              </button>
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