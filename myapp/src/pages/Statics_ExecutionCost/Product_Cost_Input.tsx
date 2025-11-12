// src/components/ProductCostInput.tsx
import React, { useEffect, useState } from "react";
import DropdownMenuSearchable from "../../components/dropdown_menu_searchable";
import FormRow from "../../components/formRow";
import PATHS from "../../hooks/path";
import LayoutInput from "../../layout/layout_input";

// ======================
// === MOCK DATA ========
// ======================
const MOCK_PRODUCTS = [
  {
    id: "1",
    code: "TN01",
    tensp:
      "Lò than 11-1.26 lò chống giá xích chiều dài lò than: 72 m. Các yếu tố TT bằng chiều dài 80 m. Chiều dày vỉa: 9.77 m . Tỷ lệ đá kẹp 23% có trải lưới thép nóc.",
    maNhom: "DL",
    tenNhom: "Đào lò",
    donViTinh: "mét",
  },
  {
    id: "2",
    code: "KD01",
    tensp:
      "Lò than 11-1.26 lò chống giá xích chiều dài lò than: 72 m. Các yếu tố TT bằng chiều dài 80 m. Chiều dày vỉa: 9.77 m . Tỷ lệ đá kẹp 23% có trải lưới thép nóc.",
    maNhom: "L1",
    tenNhom: "Khai thác",
    donViTinh: "tấn",
  },
  {
    id: "3",
    code: "EBH52",
    tensp:
      "Lò than 11-1.26 lò chống giá xích chiều dài lò than: 72 m. Các yếu tố TT bằng chiều dài 80 m. Chiều dày vỉa: 9.77 m . Tỷ lệ đá kẹp 23% có trải lưới thép nóc.",
    maNhom: "L2",
    tenNhom: "Hầm lò",
    donViTinh: "mét",
  },
];

const productOptions = MOCK_PRODUCTS.map((p) => ({
  value: p.id,
  label: p.code,
}));

const DVT_OPTIONS = [
  { value: "mét", label: "mét" },
  { value: "tấn", label: "tấn" },
  { value: "cái", label: "cái" },
];

const TY_LE_DA_KEP_OPTIONS = [
  { value: "10% ≤ Ckep ≤ 20%", label: "10% ≤ Ckep ≤ 20%", heSo: "1.15" },
  { value: "Ckep ≥ 20%", label: "Ckep ≥ 20%", heSo: "1.2" },
];

const MANG_TRUOT_OPTIONS = [
  { value: "MTD", label: "Máng trượt đồng" },
  { value: "MTINOX", label: "Máng trượt inox" },
  { value: "", label: "Không sử dụng" },
];

// ======================
// === INTERFACES =======
// ======================
interface ProductInfo {
  tensanpham: string;
  maNhom: string;
  tenNhom: string;
  donViTinh: string;
}

interface PlanRow {
  id: number;
  startDate: string;
  endDate: string;
  sanLuong: string; // raw
}

// MOCK dữ liệu chi tiết theo ID (có thể thay bằng API sau)
const MOCK_DETAIL_DATA: Record<string, any> = {
  "1": {
    productId: "1",
    donViTinh: "mét",
    chiTiet: [
      { startDate: "2025-01-01", endDate: "2025-01-31", sanLuong: 1500 },
      { startDate: "2025-02-01", endDate: "2025-02-28", sanLuong: 1800 },
    ],
  },
  "2": {
    productId: "2",
    donViTinh: "tấn",
    chiTiet: [
      { startDate: "2025-01-01", endDate: "2025-01-31", sanLuong: 1500 },
      { startDate: "2025-02-01", endDate: "2025-02-28", sanLuong: 1800 },
    ],
  },
  "3": {
    productId: "3",
    donViTinh: "mét",
    chiTiet: [
      { startDate: "2025-01-01", endDate: "2025-01-31", sanLuong: 1500 },
      { startDate: "2025-02-01", endDate: "2025-02-28", sanLuong: 1800 },
    ],
  },
};

// ======================
// === UTILS ============
// ======================
const formatNumber = (v: string): string =>
  !v ? "" : parseInt(v, 10).toLocaleString("vi-VN");
const parseNumber = (v: string): string => v.replace(/\./g, "");

// ======================
// === COMPONENT ========
// ======================
const ProductCostInput: React.FC<{
  id?: string; // <-- THÊM ID
  onClose?: () => void;
  onSuccess?: () => void;
}> = ({ id, onClose, onSuccess }) => {
  // === State ===
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    tensanpham: "",
    maNhom: "",
    tenNhom: "",
    donViTinh: "",
  });
  const [selectedDVT, setSelectedDVT] = useState<string>("");
  const [tyLeDaKep, setTyLeDaKep] = useState<string>("");
  const [heSoDieuChinh, setHeSoDieuChinh] = useState<string>("");
  const [suDungMangTruot, setSuDungMangTruot] = useState<string>("");
  const [planRows, setPlanRows] = useState<PlanRow[]>([
    { id: Date.now(), startDate: "", endDate: "", sanLuong: "" },
  ]);

  // === Load dữ liệu khi có ID (chỉnh sửa) ===
  useEffect(() => {
    if (id && MOCK_DETAIL_DATA[id]) {
      const data = MOCK_DETAIL_DATA[id];

      setSelectedProductId(data.productId);
      setSelectedDVT(data.donViTinh);
      setTyLeDaKep(data.tyLeDaKep);
      setHeSoDieuChinh(data.heSoDieuChinh);
      setSuDungMangTruot(data.suDungMangTruot);

      // Map chi tiết kế hoạch
      const rows = data.chiTiet.map((item: any) => ({
        id: Date.now() + Math.random(),
        startDate: item.startDate,
        endDate: item.endDate,
        sanLuong: item.sanLuong.toString(),
      }));
      setPlanRows(
        rows.length > 0
          ? rows
          : [{ id: Date.now(), startDate: "", endDate: "", sanLuong: "" }]
      );
    } else {
      // Reset về trạng thái tạo mới
      setSelectedProductId("");
      setSelectedDVT("");
      setTyLeDaKep("");
      setHeSoDieuChinh("");
      setSuDungMangTruot("");
      setPlanRows([
        { id: Date.now(), startDate: "", endDate: "", sanLuong: "" },
      ]);
    }
  }, [id]);

  // === Khi chọn sản phẩm → fill info ===
  useEffect(() => {
    if (selectedProductId) {
      const p = MOCK_PRODUCTS.find((x) => x.id === selectedProductId);
      if (p) {
        setProductInfo({
          tensanpham: p.tensp,
          maNhom: p.maNhom,
          tenNhom: p.tenNhom,
          donViTinh: p.donViTinh,
        });
        // Chỉ tự động set DVT nếu đang tạo mới (không phải edit)
        if (!id) {
          setSelectedDVT(p.donViTinh);
        }
      }
    } else {
      setProductInfo({ maNhom: "", tenNhom: "", donViTinh: "" });
    }
    // reset các field phụ khi đổi sản phẩm (trừ trường hợp đang load từ ID)
    if (!id) {
      setTyLeDaKep("");
      setHeSoDieuChinh("");
    }
  }, [selectedProductId, id]);

  // === Khi chọn tỷ lệ đã kẹp → tự fill hệ số ===
  useEffect(() => {
    const item = TY_LE_DA_KEP_OPTIONS.find((x) => x.value === tyLeDaKep);
    setHeSoDieuChinh(item?.heSo || "");
  }, [tyLeDaKep]);

  // === FormRow handlers ===
  const handleRowChange = (idx: number, field: keyof PlanRow, val: any) => {
    setPlanRows((rows) =>
      rows.map((r, i) => (i === idx ? { ...r, [field]: val } : r))
    );
  };
  const handleSanLuongChange = (idx: number, formatted: string) => {
    const raw = parseNumber(formatted);
    if (/^\d*$/.test(raw)) handleRowChange(idx, "sanLuong", raw);
  };
  const addRow = () =>
    setPlanRows((r) => [
      ...r,
      { id: Date.now(), startDate: "", endDate: "", sanLuong: "" },
    ]);
  const removeRow = (idx: number) => {
    if (planRows.length > 1) setPlanRows((r) => r.filter((_, i) => i !== idx));
  };

  // === Validation ===
  const validate = (): string | null => {
    if (!selectedProductId) return "Vui lòng chọn Mã sản phẩm!";
    if (!selectedDVT) return "Vui lòng chọn Đơn vị tính!";
    if (!tyLeDaKep) return "Vui lòng chọn Tỷ lệ đã kẹp!";
    if (!suDungMangTruot) return "Vui lòng chọn Sử dụng máng trượt!";

    for (let i = 0; i < planRows.length; i++) {
      const r = planRows[i];
      if (!r.startDate) return `Chưa chọn thời gian bắt đầu!`;
      if (!r.endDate) return `Chưa chọn thời gian kết thúc!`;
      if (!r.sanLuong || parseFloat(r.sanLuong) < 0)
        return `Sản lượng phải ≥ 0!`;
      if (new Date(r.startDate) >= new Date(r.endDate))
        return `Thời gian bắt đầu phải < thời gian kết thúc!`;

      // trùng khoảng thời gian
      for (let j = 0; j < planRows.length; j++) {
        if (i === j) continue;
        const o = planRows[j];
        if (
          new Date(r.startDate) < new Date(o.endDate) &&
          new Date(r.endDate) > new Date(o.startDate)
        )
          return `Dòng ${i + 1} và dòng ${j + 1}: Khoảng thời gian bị trùng!`;
      }
    }
    return null;
  };

  // === Submit ===
  const handleSubmit = () => {
    const err = validate();
    if (err) {
      alert("Lỗi: " + err);
      return;
    }

    const payload = {
      id: id || undefined, // giữ lại id nếu đang sửa
      productId: selectedProductId,
      donViTinh: selectedDVT,
      tyLeDaKep,
      heSoDieuChinh,
      suDungMangTruot: suDungMangTruot || null,
      chiTiet: planRows.map((r) => ({
        startDate: r.startDate,
        endDate: r.endDate,
        sanLuong: parseFloat(r.sanLuong),
      })),
    };
    console.log("Payload:", payload);
    alert(
      id
        ? "Cập nhật kế hoạch thành công!"
        : "Tạo mới chi phí kế hoạch ban đầu thành công!"
    );
    onSuccess?.();
    onClose?.();
  };

  // === FormRow data ===
  const formRowData = planRows.map((row, idx) => [
    {
      label: "Thời gian bắt đầu",
      type: "date" as const,
      placeholder: "dd/mm/yyyy",
      value: row.startDate ? new Date(row.startDate) : null,
      onChange: (d: Date | null) =>
        handleRowChange(idx, "startDate", d?.toISOString().split("T")[0] || ""),
    },
    {
      label: "Thời gian kết thúc",
      type: "date" as const,
      placeholder: "dd/mm/yyyy",
      value: row.endDate ? new Date(row.endDate) : null,
      onChange: (d: Date | null) =>
        handleRowChange(idx, "endDate", d?.toISOString().split("T")[0] || ""),
    },
    {
      label: "Sản lượng",
      type: "text" as const,
      placeholder: "0",
      value: formatNumber(row.sanLuong),
      onChange: (v: string) => handleSanLuongChange(idx, v),
      inputProps: { style: { textAlign: "right" } },
    },
  ]);

  // === LayoutInput fields ===
  const fields = [
    { type: "custom1" as const },
    { type: "custom2" as const },
    { type: "custom3" as const },
  ];

  return (
    <LayoutInput
      title01="Thống kê vận hành / Chi phí kế hoạch ban đầu"
      title={
        id
          ? "Chỉnh sửa chi phí kế hoạch ban đầu"
          : "Tạo mới chi phí kế hoạch ban đầu"
      }
      fields={fields}
      onSubmit={handleSubmit}
      closePath={PATHS.REPAIRS_COST.LIST}
      onClose={onClose}
      formRowComponent={
        <FormRow
          title="Sản lượng kế hoạch"
          rows={formRowData}
          onAdd={addRow}
          onRemove={removeRow}
          showRemove={planRows.length > 1}
        />
      }
    >
      {/* Dòng 1: Mã sản phẩm + Đơn vị tính */}
      <div className="custom1" style={{ display: "flex", gap: "16px" }}>
        <div style={{ flex: 1 }}>
          <label>Mã sản phẩm</label>
          <DropdownMenuSearchable
            options={productOptions}
            value={selectedProductId}
            onChange={setSelectedProductId}
            placeholder="Chọn mã sản phẩm"
          />
        </div>
        <div style={{ width: "200px" }}>
          <label>ĐVT</label>
          <DropdownMenuSearchable
            options={DVT_OPTIONS}
            value={selectedDVT}
            onChange={setSelectedDVT}
            placeholder="Chọn ĐVT"
          />
        </div>
      </div>

      <div className="custom2" style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>
          <label>Tên sản phẩm</label>
          <input
            type="text"
            className="input-text"
            value={productInfo.tensanpham}
            readOnly
            style={{ backgroundColor: "#f1f2f5" }}
          />
        </div>
      </div>

      <div className="custom3" style={{ display: "flex", gap: "16px" }}>
        <div style={{ flex: 1 }}>
          <label>Tên nhóm CĐSX</label>
          <input
            type="text"
            className="input-text"
            value={productInfo.tenNhom}
            readOnly
            style={{ backgroundColor: "#f1f2f5" }}
          />
        </div>
        <div style={{ width: "200px" }}>
          <label>Mã nhóm CĐSX</label>
          <input
            type="text"
            className="input-text"
            value={productInfo.maNhom}
            readOnly
            style={{ backgroundColor: "#f1f2f5" }}
          />
        </div>
      </div>

      {/* Dòng 3: Tỷ lệ đã kẹp + Hệ số (cùng tỉ lệ như dòng 2) */}
      {/* <div className="custom3" style={{ display: "flex", gap: "16px" }}>
        <div style={{ flex: 1 }}>
          <label>Tỷ lệ đá kẹp (Ckep)</label>
          <DropdownMenuSearchable
            options={TY_LE_DA_KEP_OPTIONS.map((x) => ({
              value: x.value,
              label: x.label,
            }))}
            value={tyLeDaKep}
            onChange={setTyLeDaKep}
            placeholder="Placeholder"
          />
        </div>
        <div style={{ width: "200px" }}>
          <label>Hệ số điều chỉnh định mức</label>
          <input
            type="text"
            className="input-text"
            value={heSoDieuChinh}
            readOnly
            style={{ backgroundColor: "#f1f2f5", textAlign: "right" }}
          />
        </div>
      </div> */}

      {/* Dòng 4: Sử dụng máng trượt (full) */}
      {/* <div className="custom4">
        <label>Sử dụng máng trượt</label>
        <DropdownMenuSearchable
          options={MANG_TRUOT_OPTIONS}
          value={suDungMangTruot}
          onChange={setSuDungMangTruot}
          placeholder="Placeholder"
        />
      </div> */}
    </LayoutInput>
  );
};

export default ProductCostInput;
