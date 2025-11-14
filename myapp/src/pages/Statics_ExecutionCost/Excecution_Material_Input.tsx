import { Calendar, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import "../../components/dropdown_menu_searchable.css";
import "../../components/transactionselector.css";
import PATHS from "../../hooks/path";
import "../../layout/layout_input.css";

// ==================
// === DỮ LIỆU MẪU ===
// ==================
const MOCK_DATA = {
  plans: [
    {
      id: 1,
      productCode: "TN01",
      productName:
        "Lò than 11-1.26 lò chống giá xích chiều dài lò than: 72 m. Các yếu tố TT bằng chiều dài 80 m. Chiều dày vỉa: 9.77 m . Tỷ lệ đá kẹp 23% có trải lưới thép nóc.",
      maNhom: "DL",
      sanluong: 1000,
      thoigian: "1/1/2025-30/1/2025",
      chiphi: 500000000,
    },
    {
      id: 2,
      productCode: "KD01",
      productName:
        "Lò than 11-1.26 lò chống giá xích chiều dài lò than: 72 m. Các yếu tố TT bằng chiều dài 80 m. Chiều dày vỉa: 9.77 m . Tỷ lệ đá kẹp 23% có trải lưới thép nóc.",
      maNhom: "L1",
      sanluong: 2000,
      thoigian: "1/2/2025-28/2/2025",
      chiphi: 800000000,
    },
    {
      id: 3,
      productCode: "EBH52",
      productName:
        "Lò than 11-1.26 lò chống giá xích chiều dài lò than: 72 m. Các yếu tố TT bằng chiều dài 80 m. Chiều dày vỉa: 9.77 m . Tỷ lệ đá kẹp 23% có trải lưới thép nóc.",
      maNhom: "L2",
      sanluong: 1500,
      thoigian: "1/3/2025-31/3/2025",
      chiphi: 600000000,
    },
  ],
  products: {
    TN01: {
      id: "sp1",
      code: "TN01",
      tensp:
        "Lò than 11-1.26 lò chống giá xích chiều dài lò than: 72 m. Các yếu tố TT bằng chiều dài 80 m. Chiều dày vỉa: 9.77 m . Tỷ lệ đá kẹp 23% có trải lưới thép nóc.",
      maNhom: "NCD-01",
      tenNhom: "Nhóm công đoạn Đào lò",
      donViTinh: "mét",
      sanLuong: 120,
    },
    KD01: {
      id: "sp2",
      code: "KD01",
      tensp:
        "Lò than 11-1.26 lò chống giá xích chiều dài lò than: 72 m. Các yếu tố TT bằng chiều dài 80 m. Chiều dày vỉa: 9.77 m . Tỷ lệ đá kẹp 23% có trải lưới thép nóc.",
      maNhom: "NCD-02",
      tenNhom: "Nhóm công đoạn Khai thác",
      donViTinh: "tấn",
      sanLuong: 500,
    },
    EBH52: {
      id: "sp3",
      code: "EBH52",
      tensp:
        "Lò than 11-1.26 lò chống giá xích chiều dài lò than: 72 m. Các yếu tố TT bằng chiều dài 80 m. Chiều dày vỉa: 9.77 m . Tỷ lệ đá kẹp 23% có trải lưới thép nóc.",
      maNhom: "NCD-03",
      tenNhom: "Nhóm công đoạn Khai thác than",
      donViTinh: "tấn",
      sanLuong: 800,
    },
  },
  materialDetails: {
    "vl-th-1-202501": {
      thoigianbatdau: "1/1/2025",
      thoigianketthuc: "30/1/2025",
    },
    "vl-th-1-202502": {
      thoigianbatdau: "1/2/2025",
      thoigianketthuc: "28/2/2025",
    },
  },
};

const MOCK_EQUIPMENT = [
  {
    id: "tb1",
    code: "SGB-620/110",
    tenVatTu: "Vì chống SGB",
    donViTinh: "bộ",
    donGia: 120000,
  },
  {
    id: "tb2",
    code: "MB-250/090",
    tenVatTu: "Máy bơm",
    donViTinh: "cái",
    donGia: 85000,
  },
  {
    id: "tb3",
    code: "TR-150/050",
    tenVatTu: "Thép ray",
    donViTinh: "mét",
    donGia: 210000,
  },
  {
    id: "tb4",
    code: "SGB-320/100",
    tenVatTu: "Vì chống SGB 320",
    donViTinh: "bộ",
    donGia: 120000,
  },
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
  soLuong: string;
  thanhTien: number;
}

const DEFAULT_EMPTY_PRODUCT: ProductData = {
  id: "",
  maNhom: "",
  tenNhom: "",
  donViTinh: "",
  sanLuong: "",
};

interface Props {
  onClose?: () => void;
  selectedId?: number;
  subRowId?: string;
  isEditMode?: boolean;
}

// === COMPONENT ===
export default function ExecutionMaterialInput({
  onClose,
  selectedId,
  subRowId,
  isEditMode = false,
}: Props) {
  const navigate = useNavigate();
  const closePath = PATHS.REPAIRS_COST.LIST;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productData, setProductData] = useState<ProductData>(
    DEFAULT_EMPTY_PRODUCT
  );

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>(
    []
  );
  const [equipmentRows, setEquipmentRows] = useState<EquipmentRow[]>([]);

  // === Helper functions ===
  const unformatNumber = (value: string): string => {
    return value.replace(/\./g, "");
  };

  const formatNumber = (value: string): string => {
    if (!value) return "";
    const numberValue = parseInt(value, 10);
    if (isNaN(numberValue)) {
      return "";
    }
    return numberValue.toLocaleString("vi-VN");
  };

  // === Tự động FILL DỮ LIỆU KHI CÓ selectedId ===
  useEffect(() => {
    if (selectedId) {
      const row = MOCK_DATA.plans.find((r) => r.id === selectedId);
      if (row) {
        const product = MOCK_DATA.products[row.productCode];
        if (product) {
          setProductData({
            id: product.id,
            maNhom: row.maNhom,
            tenNhom: product.tenNhom,
            donViTinh: product.donViTinh,
            sanLuong: row.sanluong.toString(),
          });
        }
        console.log("subRowId:", subRowId);
        const saved = MOCK_DATA.materialDetails?.[subRowId];
        console.log("Saved material detail:", saved);
        if (saved) {
          setStartDate(
            new Date(saved.thoigianbatdau.split("/").reverse().join("-"))
          );
          setEndDate(
            new Date(saved.thoigianketthuc.split("/").reverse().join("-"))
          );
        }
      }
    }
  }, [selectedId, subRowId]);

  // === Xử lý sự kiện ===
  const handleClose = () => {
    onClose?.();
    if (!onClose && closePath) navigate(closePath);
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

  const handleEquipmentRowChange = (
    index: number,
    field: keyof EquipmentRow,
    value: string
  ) => {
    const newRows = [...equipmentRows];

    if (field === "soLuong") {
      const rawValue = unformatNumber(value);

      if (!/^\d*$/.test(rawValue)) {
        return;
      }

      newRows[index].soLuong = rawValue;

      const soLuongNum = parseFloat(rawValue) || 0;
      const donGiaNum = newRows[index].donGia;
      newRows[index].thanhTien = soLuongNum * donGiaNum;
    } else {
      (newRows[index] as any)[field] = value;
    }

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
      startDate,
      endDate,
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
          Thống kê vận hành / Chi phí vật liệu thực hiện
        </div>
        <div className="line"></div>
        <div className="header02">
          {isEditMode ? "Chỉnh sửa" : "Tạo mới"} chi phí vật liệu thực hiện
        </div>
      </div>

      {/* BODY CUỘN DỌC */}
      <div className="layout-input-body">
        {/* Dòng đầu tiên: Thời gian bắt đầu và Thời gian kết thúc */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "20px",
            position: "sticky",
            left: 0,
            width: "95%",
          }}
        >
          <div style={{ flex: 1 }}>
            <label>Thời gian bắt đầu</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="input-text"
                value={startDate ? startDate.toLocaleDateString("vi-VN") : ""}
                readOnly
                disabled
                style={{ backgroundColor: "#f1f2f5" }}
              />
              <Calendar
                size={16}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#999",
                }}
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label>Thời gian kết thúc</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="input-text"
                value={endDate ? endDate.toLocaleDateString("vi-VN") : ""}
                readOnly
                disabled
                style={{ backgroundColor: "#f1f2f5" }}
              />
              <Calendar
                size={16}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#999",
                }}
              />
            </div>
          </div>
        </div>

        {/* === DIV "SIÊU STICKY" BỌC CẢ 3 HÀNG === */}
        <div
          className="sticky-header-group"
          style={{
            position: "sticky",
            left: "0",
            zIndex: 1002,
            background: "#f1f2f5",
            paddingTop: "5px",
          }}
        >
          {/* 1. Hàng Mã sản phẩm và Tên sản phẩm */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "nowrap",
              alignItems: "flex-end",
              overflowX: "auto",
              minWidth: "700px",
              width: "95%",
            }}
          >
            <div
              className="input-row"
              style={{ marginBottom: "20px", flex: 1 }}
            >
              <label>Mã sản phẩm</label>
              <input
                type="text"
                className="input-text"
                value={
                  productData.id
                    ? MOCK_DATA.products[
                        productData.id === "sp1"
                          ? "TN01"
                          : productData.id === "sp2"
                            ? "KD01"
                            : "EBH52"
                      ]?.code || ""
                    : ""
                }
                disabled
                style={{ backgroundColor: "#f1f2f5" }}
                placeholder="Chọn Mã sản phẩm..."
              />
            </div>
            <div
              className="input-row"
              style={{ marginBottom: "20px", flex: 1 }}
            >
              <label>Tên sản phẩm</label>
              <input
                type="text"
                className="input-text"
                value={
                  productData.id
                    ? MOCK_DATA.products[
                        productData.id === "sp1"
                          ? "TN01"
                          : productData.id === "sp2"
                            ? "KD01"
                            : "EBH52"
                      ]?.tensp || ""
                    : ""
                }
                disabled
                style={{ backgroundColor: "#f1f2f5" }}
                placeholder="Chọn Mã sản phẩm..."
              />
            </div>
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
              overflowX: "auto",
              minWidth: "700px",
            }}
          >
            <div
              className="input-row"
              style={{ width: "150px", marginBottom: 0, top: "0px" }}
            >
              <label>Mã nhóm CĐSX</label>
              <input
                type="text"
                className="input-text"
                value={productData.maNhom}
                readOnly
                style={{ backgroundColor: "#f1f2f5" }}
              />
            </div>
            <div
              className="input-row"
              style={{ width: "220px", marginBottom: 0, top: "0px" }}
            >
              <label>Nhóm CĐSX</label>
              <input
                type="text"
                className="input-text"
                value={productData.tenNhom}
                readOnly
                style={{ backgroundColor: "#f1f2f5" }}
              />
            </div>
            <div
              className="input-row"
              style={{ width: "150px", marginBottom: 0, top: "0px" }}
            >
              <label>Sản lượng</label>
              <input
                type="text"
                className="input-text"
                value={productData.sanLuong}
                readOnly
                style={{ backgroundColor: "#f1f2f5" }}
              />
            </div>
            <div
              className="input-row"
              style={{ width: "150px", marginBottom: 0, top: "0px" }}
            >
              <label>ĐVT</label>
              <input
                type="text"
                className="input-text"
                value={productData.donViTinh}
                disabled
                style={{ backgroundColor: "#f1f2f5" }}
                placeholder="Chọn ĐVT..."
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
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />
          </div>
        </div>
        {/* === KẾT THÚC DIV "SIÊU STICKY" === */}

        {/* === 📽 BẮT ĐẦU NỘI DUNG CUỘN 📽 === */}
        <div style={{ width: "97%", maxHeight: 400, overflowY: "auto" }}>
          {equipmentRows.map((row, index) => (
            <div
              key={row.id}
              style={{
                display: "flex",
                gap: 16,
                width: "max-content",
                flexWrap: "wrap",
                marginBottom: 20,
                borderBottom: "1px dashed #ccc",
                paddingBottom: 12,
              }}
            >
              {/* Field 1: Mã vật tư (Readonly) */}
              <div
                className="input-row"
                style={{ width: "120px", margin: "0" }}
              >
                <label
                  htmlFor={`maThietBi-${index}`}
                  style={{
                    textAlign: "center",
                    height: "30px",
                  }}
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
              <div
                className="input-row"
                style={{ width: "150px", margin: "0" }}
              >
                <label
                  htmlFor={`tenVatTu-${index}`}
                  style={{
                    textAlign: "center",
                    height: "30px",
                  }}
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
              <div className="input-row" style={{ width: "80px", margin: "0" }}>
                <label
                  htmlFor={`donViTinh-${index}`}
                  style={{
                    textAlign: "center",
                    height: "30px",
                  }}
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

              {/* Field 4: Số lượng */}
              <div
                className="input-row"
                style={{ width: "100px", margin: "0" }}
              >
                <label
                  htmlFor={`soLuong-${index}`}
                  style={{
                    textAlign: "center",
                    height: "30px",
                  }}
                >
                  Số lượng
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    inputMode="numeric"
                    id={`soLuong-${index}`}
                    className="input-text"
                    value={formatNumber(row.soLuong)}
                    onChange={(e) =>
                      handleEquipmentRowChange(index, "soLuong", e.target.value)
                    }
                    autoComplete="off"
                    style={{ textAlign: "right" }}
                  />
                  <span className="tooltip-text">
                    {formatNumber(row.soLuong) || "Chưa nhập"}
                  </span>
                </div>
              </div>

              {/* Field 5: Đơn giá (Readonly) */}
              <div
                className="input-row"
                style={{ width: "120px", margin: "0" }}
              >
                <label
                  htmlFor={`donGia-${index}`}
                  style={{
                    textAlign: "center",
                    height: "30px",
                  }}
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
                    style={{
                      width: "100%",
                      backgroundColor: "#f1f2f5",
                      textAlign: "right",
                    }}
                  />
                  <span className="tooltip-text">
                    {row.donGia.toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>

              {/* Field 6: Thành tiền (Readonly, Calculated) */}
              <div
                className="input-row"
                style={{ width: "130px", margin: "0" }}
              >
                <label
                  htmlFor={`thanhTien-${index}`}
                  style={{
                    textAlign: "center",
                    height: "30px",
                  }}
                >
                  Chi phí vật liệu thực hiện
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`thanhTien-${index}`}
                    className="input-text"
                    value={row.thanhTien.toLocaleString("vi-VN")}
                    readOnly
                    style={{
                      width: "100%",
                      backgroundColor: "#f1f2f5",
                      textAlign: "right",
                    }}
                  />
                  <span className="tooltip-text">
                    {row.thanhTien.toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>

              {/* Field 7: Nút Xóa */}
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
        {/* === 📼 KẾT THÚC NỘI DUNG CUỘN 📼 === */}
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
