import React, { useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Select from "react-select"; // Dùng cho CHỌN NHIỀU (Thiết bị)
import DropdownMenuSearchable from "../../components/dropdown_menu_searchable"; // Dùng cho CHỌN MỘT (Sản phẩm)
import PATHS from "../../hooks/path";
import "../../layout/layout_input.css"; // CSS chung
import "../../components/transactionselector.css"; // CSS cho tooltip, nút xóa
import "../../components/dropdown_menu_searchable.css"; // CSS cho dropdown chọn 1

// ==================
// === DỮ LIỆU MẪU ===
// ==================

// 1. Dữ liệu mẫu cho SẢN PHẨM (Chọn 1)
const MOCK_PRODUCTS = [
  {
    id: "sp1",
    code: "SP-KLC-001",
    maNhom: "NCD-01",
    tenNhom: "Nhóm công đoạn Đào lò",
    donViTinh: "mét",
  },
  {
    id: "sp2",
    code: "SP-KTC-002",
    maNhom: "NCD-02",
    tenNhom: "Nhóm công đoạn Khai thác",
    donViTinh: "tấn",
  },
];

// Options cho dropdown sản phẩm
const productOptions = MOCK_PRODUCTS.map((p) => ({
  value: p.id,
  label: p.code,
}));

// 2. Dữ liệu mẫu cho THIẾT BỊ (Chọn nhiều)
const MOCK_EQUIPMENT = [
  { id: "tb1", code: "SGB-620/110", donGia: 120000 },
  { id: "tb2", code: "MB-250/090", donGia: 85000 },
  { id: "tb3", code: "TR-150/050", donGia: 210000 },
];

// Options cho dropdown thiết bị
const equipmentOptions = MOCK_EQUIPMENT.map((e) => ({
  value: e.id,
  label: e.code,
}));

// ==================
// === INTERFACES ===
// ==================

// Dữ liệu cho hàng SẢN PHẨM (chỉ 1 hàng)
interface ProductData {
  id: string;
  maNhom: string;
  tenNhom: string;
  donViTinh: string;
  sanLuong: string; // Người dùng tự nhập
}

// Dữ liệu cho mỗi hàng THIẾT BỊ
interface EquipmentRow {
  id: string;
  maThietBi: string;
  donGia: number;
  soLuong: string;
  k1: string;
  k2: string;
  k3: string;
  k4: string;
  k5: string;
  k6: string;
  k7: string;
}

// === COMPONENT ===

export default function RepairsCostInput({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  // Sửa closePath theo yêu cầu ban đầu của file
  const closePath = PATHS.REPAIRS_COST.LIST;

  // --- State cho Sản phẩm (Chọn 1) ---
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productData, setProductData] = useState<ProductData | null>(null);

  // --- State cho Thiết bị (Chọn nhiều) ---
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const [equipmentRows, setEquipmentRows] = useState<EquipmentRow[]>([]);

  // === Xử lý sự kiện ===

  const handleClose = () => {
    onClose?.();
    if (!onClose && closePath) navigate(closePath);
  };

  // 1. Khi chọn SẢN PHẨM (Chọn 1)
  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const product = MOCK_PRODUCTS.find((p) => p.id === productId);

    if (product) {
      setProductData({
        id: product.id,
        maNhom: product.maNhom,
        tenNhom: product.tenNhom,
        donViTinh: product.donViTinh,
        sanLuong: "", // Reset sản lượng khi chọn lại
      });
    } else {
      setProductData(null);
    }
  };

  // Khi nhập SẢN LƯỢNG cho sản phẩm
  const handleProductQuantityChange = (value: string) => {
    if (productData) {
      setProductData((prev) => ({ ...prev!, sanLuong: value }));
    }
  };

  // 2. Khi chọn THIẾT BỊ (Chọn nhiều)
  const handleEquipmentSelectChange = (selected: any) => {
    const newSelectedIds = selected ? selected.map((s: any) => s.value) : [];
    setSelectedEquipmentIds(newSelectedIds);

    // Tạo danh sách hàng mới, giữ lại dữ liệu đã nhập nếu hàng đó vẫn được chọn
    const newRows = newSelectedIds.map((id: string) => {
      // 1. Kiểm tra xem hàng đã tồn tại trong state chưa
      const existingRow = equipmentRows.find((r) => r.id === id);
      if (existingRow) return existingRow;

      // 2. Nếu là hàng mới, tạo từ dữ liệu mẫu
      const equipment = MOCK_EQUIPMENT.find((e) => e.id === id);
      return {
        id: id,
        maThietBi: equipment?.code || "N/A",
        donGia: equipment?.donGia || 0,
        soLuong: "",
        k1: "", k2: "", k3: "", k4: "", k5: "", k6: "", k7: "",
      };
    });

    setEquipmentRows(newRows);
  };

  // Khi nhập liệu vào một hàng THIẾT BỊ
  const handleEquipmentRowChange = (
    index: number,
    field: keyof EquipmentRow,
    value: string
  ) => {
    const newRows = [...equipmentRows];
    // Cập nhật giá trị
    (newRows[index] as any)[field] = value;
    setEquipmentRows(newRows);
  };

  // Khi xóa một hàng THIẾT BỊ
  const handleRemoveEquipmentRow = (indexToRemove: number) => {
    // Lọc ra mảng hàng mới
    const newRows = equipmentRows.filter((_, index) => index !== indexToRemove);
    setEquipmentRows(newRows);

    // Đồng bộ lại state của dropdown react-select
    const newSelectedIds = newRows.map((r) => r.id);
    setSelectedEquipmentIds(newSelectedIds);
  };

  // 3. Khi NHẤN SUBMIT
  const handleSubmit = () => {
    // In ra console để kiểm tra (tùy chọn)
    console.log("Dữ liệu gửi đi:", {
      product: productData,
      equipments: equipmentRows,
    });
    
    // Yêu cầu: Submit xong thì trở về closePath
    handleClose();
  };

  // Lấy các options đang được chọn cho react-select (Thiết bị)
  const selectedEquipmentOptions = equipmentOptions.filter((opt) =>
    selectedEquipmentIds.includes(opt.value)
  );

  /**
   * Helper component để render một ô input/label nhỏ trên hàng ngang
   */
  const MiniInputField = ({
    label,
    value,
    onChange,
    readOnly = false,
    width = "100px",
    type = "text",
  }: {
    label: React.ReactNode;
    value: string | number;
    onChange?: (value: string) => void;
    readOnly?: boolean;
    width?: string;
    type?: string;
  }) => (
    <div className="input-row" style={{ width: width, marginBottom: 0 }}>
      <label style={{ height: "30px", textAlign: "left", display: "block" }}>
        {label}
      </label>
      <div className="tooltip-wrapper" style={{ width: "100%" }}>
        <input
          type={type}
          className="input-text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          style={{ 
            width: "100%", 
            backgroundColor: readOnly ? "#f1f2f5" : "#fff",
            textAlign: type === 'number' ? 'right' : 'left'
          }}
          autoComplete="off"
        />
        <span className="tooltip-text">{value}</span>
      </div>
    </div>
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
        <div className="header01">Chi phí sửa chữa</div>
        <div className="line"></div>
        <div className="header02">Tạo mới Chi phí sửa chữa</div>
      </div>

      {/* BODY CUỘN */}
      <div className="layout-input-body">
        
        {/* === PHẦN 1: SẢN PHẨM (CHỌN 1) === */}
        <div className="input-row" style={{ zIndex: 1002 }}>
          <label>Mã sản phẩm</label>
          <DropdownMenuSearchable
            options={productOptions}
            value={selectedProductId || ""}
            onChange={handleProductSelect}
            placeholder="Chọn Mã sản phẩm..."
          />
        </div>

        {/* Hàng ngang thông tin sản phẩm */}
        {productData && (
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              alignItems: "flex-end",
              marginBottom: "20px",
              paddingBottom: "20px",
              borderBottom: "1px solid #ccc",
            }}
          >
            <MiniInputField
              label="Mã nhóm CĐSX"
              value={productData.maNhom}
              readOnly
              width="150px"
            />
            <MiniInputField
              label="Nhóm CĐSX"
              value={productData.tenNhom}
              readOnly
              width="250px"
            />
            <MiniInputField
              label="Sản lượng"
              value={productData.sanLuong}
              onChange={handleProductQuantityChange}
              width="100px"
              type="number"
            />
            <MiniInputField
              label="ĐVT"
              value={productData.donViTinh}
              readOnly
              width="80px"
            />
          </div>
        )}

        {/* === PHẦN 2: THIẾT BỊ (CHỌN NHIỀU) === */}
        <div className="input-row" style={{ zIndex: 1001 }}>
          <label>Mã thiết bị</label>
          <Select
            isMulti
            options={equipmentOptions}
            value={selectedEquipmentOptions}
            onChange={handleEquipmentSelectChange}
            className="transaction-select-wrapper"
            classNamePrefix="transaction-select"
            placeholder="Chọn Mã thiết bị"
            // Props để đảm bảo menu nổi lên trên
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 })
            }}
          />
        </div>

        {/* Khu vực cuộn chứa các hàng thiết bị */}
        <div
          style={{
            width: "100%",
            maxHeight: "300px", // Giới hạn chiều cao
            overflowY: "auto",
            minHeight: "100px",
          }}
        >
          {equipmentRows.map((row, index) => (
            <div
              key={row.id}
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap", // Cho phép xuống dòng nếu không đủ
                alignItems: "flex-end", // Căn các ô input và nút xóa
                marginBottom: "10px",
                paddingBottom: "10px",
                borderBottom: "1px dashed #ccc",
              }}
            >
              {/* Các trường dữ liệu cho thiết bị */}
              <MiniInputField
                label="Mã thiết bị"
                value={row.maThietBi}
                readOnly
                width="100px"
              />
              <MiniInputField
                label="Đơn giá"
                value={row.donGia.toLocaleString("vi-VN")}
                readOnly
                width="100px"
              />
              <MiniInputField
                label="Số lượng"
                value={row.soLuong}
                onChange={(val) => handleEquipmentRowChange(index, "soLuong", val)}
                width="70px"
                type="number"
              />
              <MiniInputField
                label="K1"
                value={row.k1}
                onChange={(val) => handleEquipmentRowChange(index, "k1", val)}
                width="45px" type="number"
              />
              <MiniInputField
                label="K2"
                value={row.k2}
                onChange={(val) => handleEquipmentRowChange(index, "k2", val)}
                width="45px" type="number"
              />
              <MiniInputField
                label="K3"
                value={row.k3}
                onChange={(val) => handleEquipmentRowChange(index, "k3", val)}
                width="45px" type="number"
              />
              <MiniInputField
                label="K4"
                value={row.k4}
                onChange={(val) => handleEquipmentRowChange(index, "k4", val)}
                width="45px" type="number"
              />
              <MiniInputField
                label="K5"
                value={row.k5}
                onChange={(val) => handleEquipmentRowChange(index, "k5", val)}
                width="45px" type="number"
              />
              <MiniInputField
                label="K6"
                value={row.k6}
                onChange={(val) => handleEquipmentRowChange(index, "k6", val)}
                width="45px" type="number"
              />
              <MiniInputField
                label="K7"
                value={row.k7}
                onChange={(val) => handleEquipmentRowChange(index, "k7", val)}
                width="45px" type="number"
              />

              {/* Nút xóa hàng (Sử dụng CSS từ transactionselector.css) */}
              <button
                type="button"
                className="row-remove-button"
                title="Xóa hàng này"
                onClick={() => handleRemoveEquipmentRow(index)}
                style={{ marginTop: 0 }} // Ghi đè margin-top
              >
                <X size={16} />
              </button>
            </div>
          ))}

          {/* Hiển thị khi không có hàng nào */}
          {equipmentRows.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "#888",
              }}
            >
              (Vui lòng chọn Mã thiết bị)
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
        >
          Xác nhận
        </button>
      </div>
    </div>
  );
}