import { useState } from "react";
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
    sanLuong: 120,
  },
  {
    id: "sp2",
    code: "SP-KTC-002",
    maNhom: "NCD-02",
    tenNhom: "Nhóm công đoạn Khai thác",
    donViTinh: "tấn",
    sanLuong: 500,
  },
];
const productOptions = MOCK_PRODUCTS.map((p) => ({
  value: p.id,
  label: p.code,
}));

const MOCK_DVT_OPTIONS = [
  { value: "mét", label: "mét" },
  { value: "tấn", label: "tấn" },
  { value: "bộ", label: "bộ" },
  { value: "cái", label: "cái" },
];

const MOCK_EQUIPMENT = [
  { id: "tb1", code: "SGB-620/110", tenVatTu: "Vì chống SGB", donViTinh: "bộ", donGia: 120000 },
  { id: "tb2", code: "MB-250/090", tenVatTu: "Máy bơm", donViTinh: "cái", donGia: 85000 },
  { id: "tb3", code: "TR-150/050", tenVatTu: "Thép ray", donViTinh: "mét", donGia: 210000 },
];
const equipmentOptions = MOCK_EQUIPMENT.map((e) => ({
  value: e.id,
  label: e.code,
}));

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
  tenVatTu: string;
  donViTinh: string;
  donGia: number;
  soLuong: string; // Sẽ lưu giá trị GỐC (ví dụ: "1000"), không phải "1.000"
  thanhTien: number;
}

const DEFAULT_EMPTY_PRODUCT: ProductData = {
  id: "",
  maNhom: "",
  tenNhom: "",
  donViTinh: "",
  sanLuong: "",
};

// === COMPONENT ===
export default function MaterialsCostInput({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const closePath = PATHS.REPAIRS_COST.LIST;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const [productData, setProductData] = useState<ProductData>(DEFAULT_EMPTY_PRODUCT);

  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const [equipmentRows, setEquipmentRows] = useState<EquipmentRow[]>([]);

  // === THAY ĐỔI 1: Thêm hàm helper định dạng số ===
  
  /**
   * Xóa tất cả dấu chấm (dấu phân cách hàng nghìn)
   * @param value Chuỗi đã format (ví dụ: "1.200.000")
   * @returns Chuỗi số gốc (ví dụ: "1200000")
   */
  const unformatNumber = (value: string): string => {
    return value.replace(/\./g, ""); // Xóa tất cả dấu chấm
  };

  /**
   * Thêm dấu chấm phân cách hàng nghìn
   * @param value Chuỗi số gốc (ví dụ: "1200000")
   * @returns Chuỗi đã format (ví dụ: "1.200.000")
   */
  const formatNumber = (value: string): string => {
    if (!value) return ""; // Trả về rỗng nếu giá trị là null/undefined/rỗng
    const numberValue = parseInt(value, 10);
    if (isNaN(numberValue)) {
      return ""; // Trả về rỗng nếu không phải là số
    }
    return numberValue.toLocaleString("vi-VN"); // "1000" -> "1.000"
  };

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
        sanLuong: product.sanLuong.toString(),
      });
    } else {
      setProductData(DEFAULT_EMPTY_PRODUCT);
    }
  };

  const handleProductDVTChange = (value: string) => {
    setProductData((prev) => ({ ...prev, donViTinh: value }));
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
        tenVatTu: equipment?.tenVatTu || "N/A",
        donViTinh: equipment?.donViTinh || "N/A",
        donGia: equipment?.donGia || 0,
        soLuong: "",
        thanhTien: 0,
      };
    });
    setEquipmentRows(newRows);
  };

  // === THAY ĐỔI 2: Cập nhật handleEquipmentRowChange ===
  const handleEquipmentRowChange = (
    index: number,
    field: keyof EquipmentRow,
    value: string // 'value' này là giá trị đã format từ input (ví dụ: "1.000")
  ) => {
    const newRows = [...equipmentRows];

    if (field === "soLuong") {
      const rawValue = unformatNumber(value); // "1.000" -> "1000"

      // Chỉ cho phép nhập số (và chuỗi rỗng)
      if (!/^\d*$/.test(rawValue)) {
        return; // Không cập nhật state nếu input không hợp lệ (ví dụ: "1.00a")
      }

      // 1. Cập nhật state 'soLuong' bằng giá trị GỐC (chưa format)
      newRows[index].soLuong = rawValue;

      // 2. Tính toán 'thanhTien' từ giá trị GỐC
      const soLuongNum = parseFloat(rawValue) || 0;
      const donGiaNum = newRows[index].donGia;
      newRows[index].thanhTien = soLuongNum * donGiaNum;

    } else {
      // Xử lý cho các trường khác (nếu có)
      (newRows[index] as any)[field] = value;
    }

    // 3. Cập nhật state
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
      // 'equipments' chứa 'soLuong' ở dạng gốc (ví dụ: "1000"),
      // là định dạng đúng để gửi lên server.
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
          Thống kê vận hành / Chi phí thực hiện / Chi phí SCTX thực hiện
        </div>
        <div className="line"></div>
        <div className="header02">Tạo mới Chi phí SCTX thực hiện</div>
      </div>

      {/* BODY CUỘN DỌC */}
      <div className="layout-input-body">

        {/* === DIV "SIÊU STICKY" BỌC CẢ 3 HÀNG === */}
        <div className="sticky-header-group" style={{
          position: "sticky",
          left: "0",
          zIndex: 1002,
          background: "#f1f2f5",
          paddingTop: "5px",
          borderBottom: "1px solid #ddd"
        }}>

          {/* 1. Hàng Mã sản phẩm */}
          <div className="input-row" style={{ marginBottom: "20px" }}>
            <label>Mã sản phẩm</label>
            <DropdownMenuSearchable
              options={productOptions}
              value={selectedProductId || ""}
              onChange={handleProductSelect}
              placeholder="Chọn Mã sản phẩm..."
            />
          </div>

          {/* 2. Hàng ngang thông tin sản phẩm */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "nowrap",
              alignItems: "flex-end",
              marginBottom: "20px",
              paddingBottom: "20px",
              borderBottom: "1px solid #ccc",
              overflowX: "auto",
              minWidth: "700px",
            }}
          >
            <div className="input-row" style={{ width: "150px", marginBottom: 0, top: "0px" }}>
              <label>Mã nhóm CĐSX</label>
              <input type="text" className="input-text" value={productData.maNhom} readOnly style={{ backgroundColor: "#f1f2f5" }} />
            </div>
            <div className="input-row" style={{ width: "220px", marginBottom: 0, top: "0px" }}>
              <label>Nhóm CĐSX</label>
              <input type="text" className="input-text" value={productData.tenNhom} readOnly style={{ backgroundColor: "#f1f2f5" }} />
            </div>

            {/* 'Sản lượng' là readOnly - Giữ nguyên */}
            <div className="input-row" style={{ width: "150px", marginBottom: 0, top: "0px" }}>
              <label>Sản lượng</label>
              <input
                type="text"
                className="input-text"
                value={productData.sanLuong} // Hiển thị số lượng đã get
                readOnly
                style={{ backgroundColor: "#f1f2f5" }}
              />
            </div>

            {/* 'ĐVT' là Dropdown - Giữ nguyên */}
            <div className="input-row" style={{ width: "150px", marginBottom: 0, top: "0px" }}>
              <label>ĐVT</label>
              <DropdownMenuSearchable
                options={MOCK_DVT_OPTIONS}
                value={productData.donViTinh}
                onChange={handleProductDVTChange}
                placeholder="Chọn ĐVT..."
                width="100%"
              />
            </div>
          </div>

          {/* 3. Hàng Mã vật tư, tài sản */}
          <div className="input-row" style={{ paddingBottom: "5px" }}>
            <label>Mã vật tư, tài sản</label>
            <Select
              isMulti
              options={equipmentOptions}
              value={selectedEquipmentOptions}
              onChange={handleEquipmentSelectChange}
              className="transaction-select-wrapper"
              classNamePrefix="transaction-select"
              placeholder="Chọn Mã vật tư, tài sản"
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 })
              }}
            />
          </div>

        </div>
        {/* === KẾT THÚC DIV "SIÊU STICKY" === */}


        {/* === 🔽 BẮT ĐẦU NỘI DUNG CUỘN 🔽 === */}
        <div style={{ marginTop: "20px" }}>
          {equipmentRows.map((row, index) => (
            <div
              key={row.id}
              style={{
                display: "flex",
                gap: "16px",
                width: "max-content",
                minWidth: "800px",
                flexWrap: "nowrap",
                marginBottom: "20px",
                paddingBottom: "0px",
                borderBottom: "1px dashed #ccc",
              }}
            >
              {/* Field 1: Mã vật tư (Readonly) */}
              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`maThietBi-${index}`}
                  style={{ textAlign: "center", height: "30px", marginBottom: '-5px' }}
                >
                  Mã vật tư, tài sản
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

              {/* Field 2: Tên vật tư (Readonly) */}
              <div className="input-row" style={{ width: "150px" }}>
                <label
                  htmlFor={`tenVatTu-${index}`}
                  style={{ textAlign: "center", height: "30px", marginBottom: '-5px' }}
                >
                  Tên vật tư
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`tenVatTu-${index}`}
                    className="input-text"
                    value={row.tenVatTu}
                    readOnly
                    style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                  />
                  <span className="tooltip-text">{row.tenVatTu}</span>
                </div>
              </div>

              {/* Field 3: Đơn vị tính (Readonly) */}
              <div className="input-row" style={{ width: "80px" }}>
                <label
                  htmlFor={`donViTinh-${index}`}
                  style={{ textAlign: "center", height: "30px", marginBottom: '-5px' }}
                >
                  Đơn vị tính
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

              {/* === THAY ĐỔI 3: Cập nhật Input 'Số lượng' === */}
              <div className="input-row" style={{ width: "100px" }}>
                <label
                  htmlFor={`soLuong-${index}`}
                  style={{ textAlign: "center", height: "30px", marginBottom: '-5px' }}
                >
                  Số lượng
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text" // Chuyển từ 'number' sang 'text'
                    inputMode="numeric" // Gợi ý bàn phím số
                    id={`soLuong-${index}`}
                    className="input-text"
                    value={formatNumber(row.soLuong)} // Hiển thị giá trị đã format
                    onChange={(e) =>
                      // Gửi giá trị đã format ("1.000") cho handler
                      handleEquipmentRowChange(index, "soLuong", e.target.value)
                    }
                    autoComplete="off"
                    style={{ textAlign: "right" }} // Căn lề phải cho số
                  />
                  <span className="tooltip-text">{formatNumber(row.soLuong) || "Chưa nhập"}</span>
                </div>
              </div>

              {/* Field 5: Đơn giá (Readonly) */}
              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`donGia-${index}`}
                  style={{ textAlign: "center", height: "30px", marginBottom: '-5px' }}
                >
                  Đơn giá
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`donGia-${index}`}
                    className="input-text"
                    // Hiển thị 'donGia' đã format
                    value={row.donGia.toLocaleString("vi-VN")}
                    readOnly
                    style={{ width: "100%", backgroundColor: "#f1f2f5", textAlign: "right" }}
                  />
                  <span className="tooltip-text">{row.donGia.toLocaleString("vi-VN")}</span>
                </div>
              </div>

              {/* Field 6: Thành tiền (Readonly, Calculated) */}
              <div className="input-row" style={{ width: "130px" }}>
                <label
                  htmlFor={`thanhTien-${index}`}
                  style={{ textAlign: "center", height: "30px", marginBottom: '-5px' }}
                >
                  Thành tiền
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`thanhTien-${index}`}
                    className="input-text"
                    // Hiển thị 'thanhTien' đã format
                    value={row.thanhTien.toLocaleString("vi-VN")}
                    readOnly
                    style={{ width: "100%", backgroundColor: "#f1f2f5", textAlign: "right" }}
                  />
                  <span className="tooltip-text">{row.thanhTien.toLocaleString("vi-VN")}</span>
                </div>
              </div>

              {/* Field 11: Nút Xóa */}
              <button
                type="button"
                className="row-remove-button"
                title="Xóa hàng này"
                style={{ marginTop: "32px" }}
                onClick={() => handleRemoveEquipmentRow(index)}
              >
                <X size={16} />
              </button>
            </div>
          ))}
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