import React, { useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Select from "react-select"; // Dùng cho CHỌN NHIỀU (Thiết bị)
import DropdownMenuSearchable from "../../components/dropdown_menu_searchable"; // Dùng cho CHỌN MỘT
import PATHS from "../../hooks/path";
import "../../layout/layout_input.css"; //
import "../../components/transactionselector.css"; //
import "../../components/dropdown_menu_searchable.css"; //

// ==================
// === DỮ LIỆU MẪU ===
// ==================
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
const productOptions = MOCK_PRODUCTS.map((p) => ({
  value: p.id,
  label: p.code,
}));
const MOCK_EQUIPMENT = [
  { id: "tb1", code: "SGB-620/110", donGia: 120000 },
  { id: "tb2", code: "MB-250/090", donGia: 85000 },
  { id: "tb3", code: "TR-150/050", donGia: 210000 },
];
const equipmentOptions = MOCK_EQUIPMENT.map((e) => ({
  value: e.id,
  label: e.code,
}));
const MOCK_K_OPTIONS = [
  { value: "0.5", label: "0.5" },
  { value: "0.8", label: "0.8" },
  { value: "1.0", label: "1.0" },
  { value: "1.2", label: "1.2" },
  { value: "1.5", label: "1.5" },
];

// ==================
// === INTERFACES ===
// ==================
interface ProductData {
  id: string;
  maNhom: string;
  tenNhom: string;
  donViTinh: string;
  sanLuong: string; 
}
interface EquipmentRow {
  id: string;
  maThietBi: string;
  donGia: number;
  soLuong: string;
  k1: string; k2: string; k3: string; 
}

// === THAY ĐỔI 1: Giá trị ProductData rỗng mặc định ===
const DEFAULT_EMPTY_PRODUCT: ProductData = {
  id: "",
  maNhom: "",
  tenNhom: "",
  donViTinh: "",
  sanLuong: "",
};

// === COMPONENT ===
export default function Electric_PlanCostInput({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const closePath = PATHS.REPAIRS_COST.LIST; 

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  // === THAY ĐỔI 2: Khởi tạo state với giá trị mặc định, không phải null ===
  const [productData, setProductData] = useState<ProductData>(DEFAULT_EMPTY_PRODUCT);
  
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const [equipmentRows, setEquipmentRows] = useState<EquipmentRow[]>([]);

  // === Xử lý sự kiện ===
  const handleClose = () => {
    onClose?.();
    if (!onClose && closePath) navigate(closePath);
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const product = MOCK_PRODUCTS.find((p) => p.id === productId);
    if (product) {
      setProductData({
        id: product.id,
        maNhom: product.maNhom,
        tenNhom: product.tenNhom,
        donViTinh: product.donViTinh,
        sanLuong: "", // Reset sản lượng khi chọn
      });
    } else {
      // === THAY ĐỔI 3: Reset về rỗng thay vì null ===
      setProductData(DEFAULT_EMPTY_PRODUCT);
    }
  };

  const handleProductQuantityChange = (value: string) => {
    // === THAY ĐỔI 4: Bỏ kiểm tra if (productData) vì nó không bao giờ null ===
    setProductData((prev) => ({ ...prev, sanLuong: value }));
  };

  const handleEquipmentSelectChange = (selected: any) => {
    const newSelectedIds = selected ? selected.map((s: any) => s.value) : [];
    setSelectedEquipmentIds(newSelectedIds);
    const newRows = newSelectedIds.map((id: string) => {
      const existingRow = equipmentRows.find((r) => r.id === id);
      if (existingRow) return existingRow;
      const equipment = MOCK_EQUIPMENT.find((e) => e.id === id);
      return {
        id: id,
        maThietBi: equipment?.code || "N/A",
        donGia: equipment?.donGia || 0,
        soLuong: "",
        k1: "", k2: "", k3: "", 
      };
    });
    setEquipmentRows(newRows);
  };

  const handleEquipmentRowChange = (
    index: number,
    field: keyof EquipmentRow,
    value: string
  ) => {
    const newRows = [...equipmentRows];
    (newRows[index] as any)[field] = value;
    setEquipmentRows(newRows);
  };

  const handleRemoveEquipmentRow = (indexToRemove: number) => {
    const newRows = equipmentRows.filter((_, index) => index !== indexToRemove);
    setEquipmentRows(newRows);
    const newSelectedIds = newRows.map((r) => r.id);
    setSelectedEquipmentIds(newSelectedIds);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    console.log("Dữ liệu gửi đi:", {
      product: productData,
      equipments: equipmentRows,
    });
    setTimeout(() => {
      setIsSubmitting(false);
      handleClose(); 
    }, 500);
  };

  const selectedEquipmentOptions = equipmentOptions.filter((opt) =>
    selectedEquipmentIds.includes(opt.value)
  );

  // === RENDER ===
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
          Thống kê vận hành / Chi phí kế hoạch / Chi phí điện năng kế hoạch
        </div>
        <div className="line"></div>
        <div className="header02">Tạo mới Chi phí điện năng kế hoạch</div>
      </div>

      {/* BODY CUỘN DỌC */}
      <div className="layout-input-body">
        
        {/* === THAY ĐỔI 5: TẠO DIV "SIÊU STICKY" BỌC CẢ 3 HÀNG === */}
        <div className="sticky-header-group" style={{
          position: "sticky",
          left: "0",
          zIndex: 1002,
          background: "#f1f2f5",
          paddingTop: "5px",
          borderBottom: "1px solid #ddd" // Thêm đường viền để tách biệt
        }}>

          {/* 1. Hàng Mã sản phẩm (Đã bỏ sticky, zIndex, ...) */}
          <div className="input-row" style={{ marginBottom: "20px" }}>
            <label>Mã sản phẩm</label>
            <DropdownMenuSearchable
              options={productOptions}
              value={selectedProductId || ""}
              onChange={handleProductSelect}
              placeholder="Chọn Mã sản phẩm..."
            />
          </div>

          {/* 2. Hàng ngang thông tin sản phẩm (Đã bỏ sticky, zIndex, ...) */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "nowrap",
              alignItems: "flex-end",
              marginBottom: "20px",
              paddingBottom: "20px",
              borderBottom: "1px solid #ccc",
              overflowX: "auto", // Vẫn cho phép cuộn ngang nội bộ
              minWidth: "700px", 
              // ĐÃ BỎ: position, left, top, zIndex, background
            }}
          >
            <div className="input-row" style={{ width: "150px", marginBottom: 0, top: "0px" }}>
              <label>Mã nhóm CĐSX</label>
              <input type="text" className="input-text" value={productData.maNhom} readOnly style={{ backgroundColor: "#f1f2f5"}}/>
            </div>
            <div className="input-row" style={{ width: "220px", marginBottom: 0, top: "0px"  }}>
              <label>Nhóm CĐSX</label>
              <input type="text" className="input-text" value={productData.tenNhom} readOnly style={{ backgroundColor: "#f1f2f5" }}/>
            </div>
            <div className="input-row" style={{ width: "150px", marginBottom: 0, top: "0px"  }}>
              <label>Sản lượng</label>
              <input type="number" className="input-text" value={productData.sanLuong} onChange={(e) => handleProductQuantityChange(e.target.value)} />
            </div>
            <div className="input-row" style={{ width: "150px", marginBottom: 0, top: "0px"  }}>
              <label>ĐVT</label>
              <input type="text" className="input-text" value={productData.donViTinh} readOnly style={{ backgroundColor: "#f1f2f5" }}/>
            </div>
          </div>

          {/* 3. Hàng Mã thiết bị (Đã bỏ sticky, zIndex, ...) */}
          <div className="input-row" style={{ paddingBottom: "5px" }}>
            <label>Mã thiết bị</label>
            <Select
              isMulti
              options={equipmentOptions}
              value={selectedEquipmentOptions}
              onChange={handleEquipmentSelectChange}
              className="transaction-select-wrapper"
              classNamePrefix="transaction-select"
              placeholder="Chọn Mã thiết bị"
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 })
              }}
            />
          </div>

        </div>
        {/* === KẾT THÚC DIV "SIÊU STICKY" === */}


        {/* === 🔽 BẮT ĐẦU NỘI DUNG CUỘN 🔽 === */}
        {/* === THAY ĐỔI 6: Bỏ marginTop: "100px" === */}
        <div style={{ marginTop: "20px" }}>
          {equipmentRows.map((row, index) => (
            <div
              key={row.id}
              style={{
                display: "flex",
                gap: "16px",
                width: "145%", 
                flexWrap: "wrap", 
                marginBottom: "20px",
                paddingBottom: "0px",
                borderBottom: "1px dashed #ccc",
              }}
            >
              {/* Field 1: Mã thiết bị (Readonly Input) */}
              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`maThietBi-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  Mã thiết bị
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`maThietBi-${index}`}
                    className="input-text"
                    value={row.maThietBi}
                    readOnly
                    style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                  />
                  <span className="tooltip-text">{row.maThietBi}</span>
                </div>
              </div>

              {/* Field 2: Đơn giá (Readonly Input) */}
              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`donGia-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  Đơn giá
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`donGia-${index}`}
                    className="input-text"
                    value={row.donGia.toLocaleString("vi-VN")}
                    readOnly
                    style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                  />
                  <span className="tooltip-text">{row.donGia.toLocaleString("vi-VN")}</span>
                </div>
              </div>

              {/* Field 3: Số lượng (Number Input) */}
              <div className="input-row" style={{ width: "80px" }}>
                <label
                  htmlFor={`soLuong-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  Số lượng
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="number"
                    id={`soLuong-${index}`}
                    className="input-text"
                    value={row.soLuong}
                    onChange={(e) =>
                      handleEquipmentRowChange(index, "soLuong", e.target.value)
                    }
                    autoComplete="off"
                  />
                  <span className="tooltip-text">{row.soLuong || "Chưa nhập"}</span>
                </div>
              </div>

              {/* Field 4: K1 (Dropdown) */}
              <div className="input-row" style={{ width: "80px" }}>
                <label
                  htmlFor={`k1-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  K1
                </label>
                <div className="tooltip-wrapper">
                  <DropdownMenuSearchable
                    options={MOCK_K_OPTIONS}
                    value={row.k1}
                    onChange={(val) => handleEquipmentRowChange(index, "k1", val)}
                    placeholder="-"
                    width="100%"
                  />
                  <span className="tooltip-text">{row.k1 || "Chưa chọn"}</span>
                </div>
              </div>

              {/* Field 5: K2 (Dropdown) */}
              <div className="input-row" style={{ width: "80px" }}>
                <label
                  htmlFor={`k2-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  K2
                </label>
                <div className="tooltip-wrapper">
                  <DropdownMenuSearchable
                    options={MOCK_K_OPTIONS}
                    value={row.k2}
                    onChange={(val) => handleEquipmentRowChange(index, "k2", val)}
                    placeholder="-"
                    width="100%"
                  />
                  <span className="tooltip-text">{row.k2 || "Chưa chọn"}</span>
                </div>
              </div>

              {/* Field 6: K3 (Dropdown) */}
              <div className="input-row" style={{ width: "80px" }}>
                <label
                  htmlFor={`k3-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  K3
                </label>
                <div className="tooltip-wrapper">
                  <DropdownMenuSearchable
                    options={MOCK_K_OPTIONS}
                    value={row.k3}
                    onChange={(val) => handleEquipmentRowChange(index, "k3", val)}
                    placeholder="-"
                    width="100%"
                  />
                  <span className="tooltip-text">{row.k3 || "Chưa chọn"}</span>
                </div>
              </div>
              
              {/* Field 11: Nút Xóa */}
              <button
                type="button"
                className="row-remove-button" // Class này có margin-top: 42px từ transactionselector.css
                title="Xóa hàng này"
                onClick={() => handleRemoveEquipmentRow(index)}
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {/* === KẾT THÚC Bố cục hàng thiết bị MỚI === */}


          {equipmentRows.length === 0 && (
            <div style={{ textAlign: "center", padding: "20px", color: "#888" }}>
              (Vui lòng chọn Mã thiết bị)
            </div>
          )}
        </div>
        {/* === 🔼 KẾT THÚC NỘI DUNG CUỘN 🔼 === */}

      </div> 
      {/* Kết thúc layout-input-body */}

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