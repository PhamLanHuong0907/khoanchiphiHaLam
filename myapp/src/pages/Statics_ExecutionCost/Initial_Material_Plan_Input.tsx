import { Calendar, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DropdownMenuSearchable from "../../components/dropdown_menu_searchable";
import "../../components/dropdown_menu_searchable.css";
import "../../components/transactionselector.css";
import PATHS from "../../hooks/path";
import "../../layout/layout_input.css";

// ==================
// === NGUỒN MOCK ===
// ==================
const MOCK_DATA = {
  plans: [
    {
      id: 1,
      productCode: "TN01",
      maNhom: "DL",
      sanluong: 1000,
      thoigian: "1/1/2025-30/1/2025",
      chiphi: 500000000,
      tyLeDaKep: "10% ≤ Ckep ≤ 20%",
      mangTruot: "MTD",
      unitPriceId: "dg1",
    },
    {
      id: 2,
      productCode: "KD01",
      maNhom: "L1",
      sanluong: 2000,
      thoigian: "1/2/2025-28/2/2025",
      chiphi: 800000000,
      tyLeDaKep: "Ckep ≥ 20%",
      mangTruot: "MTINOX",
      unitPriceId: "dg2",
    },
    {
      id: 3,
      productCode: "EBH52",
      maNhom: "L2",
      sanluong: 1500,
      thoigian: "1/3/2025-31/3/2025",
      chiphi: 600000000,
      tyLeDaKep: "10% ≤ Ckep ≤ 20%",
      mangTruot: "",
      unitPriceId: "dg3",
    },
  ],
  products: {
    TN01: {
      id: "sp1",
      code: "TN01",
      maNhom: "NCD-01",
      tenNhom: "Nhóm công đoạn Đào lò",
      donViTinh: "mét",
      sanLuong: 120,
    },
    KD01: {
      id: "sp2",
      code: "KD01",
      maNhom: "NCD-02",
      tenNhom: "Nhóm công đoạn Khai thác",
      donViTinh: "tấn",
      sanLuong: 500,
    },
    EBH52: {
      id: "sp3",
      code: "EBH52",
      maNhom: "NCD-03",
      tenNhom: "Nhóm công đoạn Khai thác than",
      donViTinh: "tấn",
      sanLuong: 800,
    },
  },
  unitPrices: [
    { id: "dg1", code: "DL1" },
    { id: "dg2", code: "DL2" },
    { id: "dg3", code: "DL3" },
    { id: "dg4", code: "KT1" },
    { id: "dg5", code: "KT2" },
  ],
};

const TY_LE_DA_KEP_OPTIONS = [
  { value: "10% ≤ Ckep ≤ 20%", label: "10% ≤ Ckep ≤ 20%", heSo: "1.15" },
  { value: "Ckep ≥ 20%", label: "Ckep ≥ 20%", heSo: "1.2" },
];

const MANG_TRUOT_OPTIONS = [
  { value: "MTD", label: "Máng trượt đồng" },
  { value: "MTINOX", label: "Máng trượt inox" },
  { value: "", label: "Không sử dụng" },
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
  isEditMode?: boolean;
}

// === COMPONENT ===
export default function InitialMaterialPlanInput({
  onClose,
  selectedId,
  isEditMode = false,
}: Props) {
  const navigate = useNavigate();
  const closePath = PATHS.REPAIRS_COST.LIST;

  const [tyLeDaKep, setTyLeDaKep] = useState<string>("");
  const [heSoDieuChinh, setHeSoDieuChinh] = useState<string>("");
  const [suDungMangTruot, setSuDungMangTruot] = useState<string>("");
  const [selectedUnitPriceId, setSelectedUnitPriceId] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productData, setProductData] = useState<ProductData>(
    DEFAULT_EMPTY_PRODUCT
  );

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // === TỰ ĐỘNG FILL DỮ LIỆU KHI CÓ selectedId ===
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

        // Parse thoigian
        const [startStr, endStr] = row.thoigian.split("-");
        if (startStr && endStr) {
          const startParts = startStr.split("/").map(Number);
          const endParts = endStr.split("/").map(Number);
          setStartDate(
            new Date(startParts[2], startParts[1] - 1, startParts[0])
          );
          setEndDate(new Date(endParts[2], endParts[1] - 1, endParts[0]));
        }

        // Fill các trường khác
        setTyLeDaKep(row.tyLeDaKep || "");
        setSuDungMangTruot(row.mangTruot || "");
        setSelectedUnitPriceId(row.unitPriceId || "");
      }
    }
  }, [selectedId]);

  // Tự động fill hệ số khi chọn tỷ lệ đá kẹp
  useEffect(() => {
    const item = TY_LE_DA_KEP_OPTIONS.find((x) => x.value === tyLeDaKep);
    setHeSoDieuChinh(item?.heSo || "");
  }, [tyLeDaKep]);

  // === XỬ LÝ SỰ KIỆN ===
  const handleClose = () => {
    onClose?.();
    if (!onClose && closePath) navigate(closePath);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    console.log("Dữ liệu gửi đi:", {
      product: productData,
      tyLeDaKep,
      heSoDieuChinh,
      suDungMangTruot,
      unitPriceId: selectedUnitPriceId,
      startDate,
      endDate,
    });
    setTimeout(() => {
      setIsSubmitting(false);
      handleClose();
    }, 500);
  };

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
        <div className="header01">Thống kê vận hành / Kế hoạch sản xuất</div>
        <div className="line"></div>
        <div className="header02">
          {isEditMode ? "Chỉnh sửa" : "Tạo mới"} chi phí vật liệu kế hoạch
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
          {/* 1. Hàng Mã sản phẩm */}
          <div className="input-row" style={{ marginBottom: "20px" }}>
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

          {/* 2. Hàng ngang thông tin sản phẩm */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "nowrap",
              alignItems: "flex-end",
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

          {/* 3. Các trường input */}
          <div style={{ marginTop: "24px" }} className="input-row">
            {/* Dòng 3: Chọn đơn giá */}
            <div className="input-row" style={{ marginBottom: "20px" }}>
              <label>Mã định mức vật liệu</label>
              <DropdownMenuSearchable
                options={MOCK_DATA.unitPrices.map((up) => ({
                  value: up.id,
                  label: up.code,
                }))}
                value={selectedUnitPriceId}
                onChange={setSelectedUnitPriceId}
                placeholder="Chọn mã định mức vật liệu"
              />
            </div>

            {/* Dòng 2: Sử dụng máng trượt */}
            <div className="input-row" style={{ marginBottom: "20px" }}>
              <label>Sử dụng máng trượt</label>
              <DropdownMenuSearchable
                options={MANG_TRUOT_OPTIONS}
                value={suDungMangTruot}
                onChange={setSuDungMangTruot}
                placeholder="Chọn loại máng trượt"
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "16px",
                marginBottom: "16px",
                alignItems: "flex-end",
              }}
            >
              <div className="input-row" style={{ flex: 1, margin: 0 }}>
                <label>Tỷ lệ đá kẹp (Ckep)</label>
                <DropdownMenuSearchable
                  options={TY_LE_DA_KEP_OPTIONS.map((x) => ({
                    value: x.value,
                    label: x.label,
                  }))}
                  value={tyLeDaKep}
                  onChange={setTyLeDaKep}
                  placeholder="Chọn tỷ lệ đá kẹp"
                />
              </div>
              <div className="input-row" style={{ width: "200px", margin: 0 }}>
                <label>Hệ số điều chỉnh định mức</label>
                <input
                  type="text"
                  className="input-text"
                  value={heSoDieuChinh}
                  readOnly
                  style={{ backgroundColor: "#f1f2f5" }}
                />
              </div>
            </div>
          </div>
        </div>
        {/* === KẾT THÚC DIV "SIÊU STICKY" === */}
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
