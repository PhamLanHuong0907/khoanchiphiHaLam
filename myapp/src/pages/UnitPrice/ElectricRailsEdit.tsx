import  { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Select from "react-select"; // Import react-select
import { useApi } from "../../hooks/useFetchData"; // Import hook API
import PATHS from "../../hooks/path"; // Import PATHS
import "../../layout/layout_input.css";
import "../../components/transactionselector.css"; // Import CSS cho react-select

// === Định nghĩa interface cho dữ liệu ===

// 1. Interface cho API GET /api/catalog/equipment (CHỈ LẤY DANH SÁCH)
interface EquipmentListItem {
  id: string;
  code: string;
}

// 2. Interface cho dữ liệu GET từ /api/pricing/electricityunitpriceequipment/{id}
interface ElectricPriceRecord {
  id: string; // ID của bản ghi giá
  equipmentId: string;
  equipmentCode: string; // Dùng cho dropdown
  equipmentName: string;
  unitOfMeasureName: string;
  equipmentElectricityCost: number; // Đơn giá điện năng
  monthlyElectricityCost: number;
  averageMonthlyTunnelProduction: number;
  electricityConsumePerMetres: number;
  electricityCostPerMetres: number;
}

// 3. Dữ liệu cho mỗi hàng THIẾT BỊ hiển thị trên UI
// (Interface này phải giống hệt ElectricRailsInput.tsx)
interface EquipmentRowData {
  equipmentId: string; // ID của thiết bị
  recordId: string; // ID của bản ghi giá
  tenThietbi: string;
  donViTinh: string;
  dongiadiennang: number;
  monthlyElectricityCost: string;
  averageMonthlyTunnelProduction: string;
  dinhmucdiennang: string;
  chiphidiennang: string;
}

// 4. Interface cho dữ liệu PUT payload
interface PutPayload {
  id: string; // ID của bản ghi giá
  equipmentId: string;
  monthlyElectricityCost: number;
  averageMonthlyTunnelProduction: number;
}
// === KẾT THÚC THAY ĐỔI ===

// Props cho component Edit
interface ElectricRailsEditProps {
  id: string; // ID của bản ghi giá (price record ID)
  onClose?: () => void;
}

export default function ElectricRailsEdit({ id, onClose }: ElectricRailsEditProps) {
  const navigate = useNavigate();
  const closePath = PATHS.ELECTRIC_RAILS.LIST;
  const basePath = "/api/pricing/electricityunitpriceequipment";

  // === Gọi API ===
  // 1. API GET cho dropdown (Tự động chạy khi mount)
  // (Vẫn cần để hiển thị tên trong dropdown bị vô hiệu hóa)
  const { data: equipmentListData = [] } = useApi<EquipmentListItem>(
    "/api/catalog/equipment?pageIndex=1&pageSize=10000"
  );

  // 2. API (CRUD)
  const {
    fetchById,
    putData,
    loading: crudLoading, // Dùng chung state loading
  } = useApi<any>(basePath);

  // === State ===
  // State loading riêng cho việc tải dữ liệu ban đầu
  const [isLoadingData, setIsLoadingData] = useState(true);
  // State cho dropdown
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  // State cho các hàng (sẽ chỉ có 1 hàng)
  const [equipmentRows, setEquipmentRows] = useState<EquipmentRowData[]>([]);

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

        // 1. Set dropdown (vô hiệu hóa)
        // Tìm option trong list (nếu có)
        let selectedOpt = equipmentOptions.find(
          (opt) => opt.value === record.equipmentId
        );
        // Nếu không tìm thấy (do API list chưa tải xong), tạo 1 option giả
        if (!selectedOpt) {
          selectedOpt = {
            value: record.equipmentId,
            label: record.equipmentCode,
          };
        }
        setSelectedOptions([selectedOpt]);

        // 2. Tạo HÀNG (row) duy nhất
        const singleRow: EquipmentRowData = {
          equipmentId: record.equipmentId,
          recordId: record.id,
          tenThietbi: record.equipmentName,
          donViTinh: record.unitOfMeasureName,
          dongiadiennang: record.equipmentElectricityCost,
          monthlyElectricityCost: String(record.monthlyElectricityCost || ""),
          averageMonthlyTunnelProduction: String(
            record.averageMonthlyTunnelProduction || ""
          ),
          dinhmucdiennang: record.electricityConsumePerMetres.toLocaleString(
            "vi-VN"
          ),
          chiphidiennang: record.electricityCostPerMetres.toLocaleString(
            "vi-VN"
          ),
        };
        
        // Bắt đầu tính toán
        const calculatedRow = calculateRow(singleRow);
        setEquipmentRows([calculatedRow]); // Đặt vào mảng

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Edit:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [id, fetchById, equipmentOptions]); // Thêm equipmentOptions vào dependencies

  // === Hàm tính toán (Giống file Input) ===
  const calculateRow = (row: EquipmentRowData): EquipmentRowData => {
    const donGia = row.dongiadiennang || 0;
    const dienNangTieuThu = parseFloat(row.monthlyElectricityCost) || 0;
    const sanLuong = parseFloat(row.averageMonthlyTunnelProduction) || 0;

    let dinhMuc = 0;
    if (sanLuong !== 0) dinhMuc = dienNangTieuThu / sanLuong;
    const chiPhi = dinhMuc * donGia;

    return {
      ...row, // Trả về row mới
      dinhmucdiennang: dinhMuc.toLocaleString("vi-VN", {
        maximumFractionDigits: 2,
      }),
      chiphidiennang: chiPhi.toLocaleString("vi-VN", {
        maximumFractionDigits: 2,
      }),
    };
  };

  // === Xử lý sự kiện ===

  const handleClose = () => {
    onClose?.();
    if (!onClose && closePath) navigate(closePath);
  };

  // Khi người dùng nhập liệu vào một hàng (sẽ luôn là index 0)
  const handleRowChange = (
    index: number,
    field: keyof EquipmentRowData,
    value: string
  ) => {
    const newRows = [...equipmentRows];
    const updatedRow = { ...newRows[index], [field]: value };

    // Tính toán lại hàng
    const calculatedRow = calculateRow(updatedRow);

    newRows[index] = calculatedRow;
    setEquipmentRows(newRows);
  };

  // Khi người dùng nhấn nút "Xác nhận" (Gửi 1 request PUT)
  const handleSubmit = async () => {
    // Chỉ lấy hàng đầu tiên và duy nhất
    if (equipmentRows.length === 0) return;
    
    const row = equipmentRows[0];

    const payload: PutPayload = {
      id: row.recordId, // ID của bản ghi giá
      equipmentId: row.equipmentId,
      monthlyElectricityCost: parseFloat(row.monthlyElectricityCost) || 0,
      averageMonthlyTunnelProduction:
        parseFloat(row.averageMonthlyTunnelProduction) || 0,
    };

    try {
      await putData(payload, () => {
        console.log("📤 Cập nhật thành công:", payload);
        handleClose();
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật dữ liệu:", error);
    }
  };

  // === Render ===

  // Giữ nguyên JSX từ file Input
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
        {/* Field Mã thiết bị (REACT-SELECT) */}
        <div className="input-row" style={{ position: "fixed" }}>
          <label>Mã thiết bị</label>
          <Select
            isMulti // Giữ isMulti để UI giống hệt
            options={equipmentOptions}
            value={selectedOptions}
            // onChange={handleSelectChange} // Không cho change
            className="transaction-select-wrapper"
            classNamePrefix="transaction-select"
            placeholder="Chọn Mã thiết bị"
            isDisabled={true} // Vô hiệu hóa
            styles={{
              menu: (provided) => ({ ...provided, zIndex: 9999 }),
            }}
          />
        </div>

        {/* ============================================== */}
        {/* HIỂN THỊ HÀNG (SẼ CHỈ CÓ 1)        */}
        {/* ============================================== */}
        <div
          style={{
            marginTop: "80px",
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
            equipmentRows.map((row, index) => ( // map này sẽ chỉ chạy 1 lần
              <div
                key={row.equipmentId} // Dùng key duy nhất
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
                <div
                  className="input-row"
                  style={{ width: "120px", marginBottom: "21px" }}
                >
                  <label
                    htmlFor={`tenThietbi-${index}`}
                    style={{
                      display: "flex",
                      textAlign: "center",
                      height: "30px",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Tên thiết bị
                  </label>
                  <input
                    type="text"
                    id={`tenThietbi-${index}`}
                    name="tenThietbi"
                    className="input-text"
                    value={row.tenThietbi}
                    readOnly
                    style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                  />
                </div>

                <div
                  className="input-row"
                  style={{ width: "100px", marginBottom: "21px" }}
                >
                  <label
                    htmlFor={`dongiadiennang-${index}`}
                    style={{
                      display: "flex",
                      textAlign: "center",
                      height: "30px",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Đơn giá điện năng
                  </label>
                  <input
                    type="text"
                    id={`dongiadiennang-${index}`}
                    name="dongiadiennang"
                    className="input-text"
                    value={row.dongiadiennang.toLocaleString("vi-VN")}
                    readOnly
                    style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                  />
                </div>

                <div
                  className="input-row"
                  style={{ width: "80px", marginBottom: "21px" }}
                >
                  <label
                    htmlFor={`donViTinh-${index}`}
                    style={{
                      display: "flex",
                      textAlign: "center",
                      height: "30px",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ĐVT
                  </label>
                  <input
                    type="text"
                    id={`donViTinh-${index}`}
                    name="donViTinh"
                    className="input-text"
                    value={row.donViTinh}
                    readOnly
                    style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                  />
                </div>

                {/* === CÁC TRƯỜNG EDITABLE === */}
                <div className="input-row" style={{ width: "120px" }}>
                  <label
                    htmlFor={`monthlyElectricityCost-${index}`}
                    style={{ textAlign: "center", height: "30px" }}
                  >
                    Điện năng tiêu thụ/tháng
                  </label>
                  <input
                    type="number"
                    id={`monthlyElectricityCost-${index}`}
                    name="monthlyElectricityCost"
                    placeholder="Nhập điện năng"
                    className="input-text"
                    value={row.monthlyElectricityCost}
                    onChange={(e) =>
                      handleRowChange(
                        index,
                        "monthlyElectricityCost",
                        e.target.value
                      )
                    }
                    autoComplete="off"
                  />
                </div>

                <div className="input-row" style={{ width: "120px" }}>
                  <label
                    htmlFor={`averageMonthlyTunnelProduction-${index}`}
                    style={{ textAlign: "center", height: "30px" }}
                  >
                    Sản lượng mét lò BQ
                  </label>
                  <input
                    type="number"
                    id={`averageMonthlyTunnelProduction-${index}`}
                    name="averageMonthlyTunnelProduction"
                    placeholder="Nhập sản lượng"
                    className="input-text"
                    value={row.averageMonthlyTunnelProduction}
                    onChange={(e) =>
                      handleRowChange(
                        index,
                        "averageMonthlyTunnelProduction",
                        e.target.value
                      )
                    }
                    autoComplete="off"
                  />
                </div>

                {/* === CÁC TRƯỜNG TÍNH TOÁN === */}
                <div
                  className="input-row"
                  style={{ width: "100px", marginBottom: "21px" }}
                >
                  <label
                    htmlFor={`dinhmucdiennang-${index}`}
                    style={{ textAlign: "center", height: "30px" }}
                  >
                    Định mức điện năng
                  </label>
                  <input
                    type="text"
                    id={`dinhmucdiennang-${index}`}
                    name="dinhmucdiennang"
                    className="input-text"
                    value={row.dinhmucdiennang}
                    readOnly
                    style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                  />
                </div>
                <div
                  className="input-row"
                  style={{ width: "100px", marginBottom: "21px" }}
                >
                  <label
                    htmlFor={`chiphidiennang-${index}`}
                    style={{ textAlign: "center", height: "30px" }}
                  >
                    Chi phí điện năng
                  </label>
                  <input
                    type="text"
                    id={`chiphidiennang-${index}`}
                    name="chiphidiennang"
                    className="input-text"
                    value={row.chiphidiennang}
                    readOnly
                    style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                  />
                </div>
              </div>
            ))}

          {/* Hiển thị khi không có hàng nào và không loading */}
          {!isLoadingData && equipmentRows.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "#888",
              }}
            >
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
          disabled={crudLoading || isLoadingData} // Vô hiệu hóa khi đang PUT hoặc tải
        >
          {crudLoading ? "Đang xử lý..." : "Xác nhận"}
        </button>
      </div>
    </div>
  );
}