/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DropdownMenu from "../../components/dropdown";
import "../../layout/layout_input.css";
import PATHS from "../../hooks/path";

interface MarketRailsFormData {
  maThietBi: string;
  tenPhuTung: string;
  donGiaVatTu: string;
  donViTinh: string;
  dinhMucThoiGian: string;
  soLuongVatTu: string;
  sanLuongMetLo: string;
  dinhMucVatTuSCTX: string;
  chiPhiVatTuSCTX: string;
}

const maThietBiOptions = [
  { label: "TB-001", path: "#", data: { tenPhuTung: "Ray trượt A", donGiaVatTu: "150000", donViTinh: "Mét" } },
  { label: "TB-002", path: "#", data: { tenPhuTung: "Bánh xe B", donGiaVatTu: "75000", donViTinh: "Cái" } },
  { label: "TB-003", path: "#", data: { tenPhuTung: "Cáp C", donGiaVatTu: "220000", donViTinh: "Cuộn" } },
];

export default function MarketRailsEdit({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const closePath = PATHS.MARKET_RAILS.LIST;

  const [formData, setFormData] = useState<MarketRailsFormData>({
    maThietBi: "",
    tenPhuTung: "",
    donGiaVatTu: "",
    donViTinh: "",
    dinhMucThoiGian: "",
    soLuongVatTu: "",
    sanLuongMetLo: "",
    dinhMucVatTuSCTX: "0",
    chiPhiVatTuSCTX: "0",
  });

  const handleMaThietBiSelect = (label: string) => {
    const selected = maThietBiOptions.find((opt) => opt.label === label);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        maThietBi: label,
        tenPhuTung: selected.data.tenPhuTung,
        donGiaVatTu: selected.data.donGiaVatTu,
        donViTinh: selected.data.donViTinh,
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const donGia = parseFloat(formData.donGiaVatTu) || 0;
    const dinhMucThoiGian = parseFloat(formData.dinhMucThoiGian) || 0;
    const soLuongVatTu = parseFloat(formData.soLuongVatTu) || 0;
    const sanLuongMetLo = parseFloat(formData.sanLuongMetLo) || 0;

    let dinhMucVatTu = 0;
    if (sanLuongMetLo !== 0) dinhMucVatTu = (dinhMucThoiGian * soLuongVatTu) / sanLuongMetLo;
    const chiPhiVatTu = dinhMucVatTu * donGia;

    setFormData((prev) => ({
      ...prev,
      dinhMucVatTuSCTX: dinhMucVatTu.toLocaleString("vi-VN", { maximumFractionDigits: 2 }),
      chiPhiVatTuSCTX: chiPhiVatTu.toLocaleString("vi-VN", { maximumFractionDigits: 2 }),
    }));
  }, [formData.dinhMucThoiGian, formData.soLuongVatTu, formData.sanLuongMetLo, formData.donGiaVatTu]);

  // ✅ Copy y hệt logic từ layout_input.tsx
  const handleClose = () => {
    onClose?.();
    if (!onClose && closePath) navigate(closePath);
  };

  const handleSubmit = () => {
    console.log("📤 Gửi dữ liệu form:", formData);
    onClose?.();
    if (!onClose && closePath) navigate(closePath);
  };

  return (
    <div className="layout-input-container" style={{ position: "relative", zIndex: 10000, height: "auto" }}>
      <button className="close-btn" onClick={handleClose} title="Đóng">
        <X size={16} />
      </button>

      <div className="layout-input-header">
        <div className="header01">Đơn giá và định mức / Đơn giá và định mức SCTX</div>
        <div className="line"></div>
        <div className="header02">Chỉnh sửa Đơn giá và định mức SCTX</div>
      </div>

      <div className="layout-input-body">
        <div className="input-row">
          <label>Mã thiết bị</label>
          <DropdownMenu
            icon={null}
            className={formData.maThietBi ? "dropdown-selected" : "dropdown-placeholder"}
            label={
              <div className="dropdown-label-box">
                {formData.maThietBi || "Chọn Mã thiết bị"}
                <ChevronDown className="dropdown-arrow" />
              </div>
            }
            items={maThietBiOptions}
            onSelect={handleMaThietBiSelect}
            width="100%"
            left="0px"
            top="100%"
            padding="0"
          />
        </div>


        {/* 3 cột: tên phụ tùng, đơn giá, đơn vị */}
        <div style={{ display: "flex", gap: "16px", width: "700px" }}>
          {[
            { label: "Tên phụ tùng", name: "tenPhuTung", Placeholder: "Tên phụ tùng" },
            { label: "Đơn giá vật tư", name: "donGiaVatTu", Placeholder: "Đơn giá vật tư" },
            { label: "Đơn vị tính", name: "donViTinh", Placeholder: "Đơn vị tính" },
          ].map((item) => (
            <div
              key={item.name}
              className="input-row"
              style={{ flex: 1, marginBottom: "21px" }}
            >
              <label htmlFor={item.name}>{item.label}</label>
              <input
                type="text"
                id={item.name}
                name={item.name}
                className="input-text"
                value={(formData as any)[item.name]}
                readOnly
                style={{ width: "100%", backgroundColor: "#f1f2f5" }}
              />
            </div>
          ))}
        </div>
          <div style={{ display: "flex", gap: "16px", width: "720px" }}>
        {/* Input các trường còn lại */}
        <div className="input-row">
          <label htmlFor="dinhMucThoiGian">Định mức thời gian thay thế</label>
          <input
            type="number"
            id="dinhMucThoiGian"
            name="dinhMucThoiGian"
            placeholder="Nhập định mức thời gian thay thế (tháng)"
            className="input-text"
            value={formData.dinhMucThoiGian}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>

        <div className="input-row">
          <label htmlFor="soLuongVatTu">Số lượng vật tư 1 lần thay thế</label>
          <input
            type="number"
            id="soLuongVatTu"
            name="soLuongVatTu"
            placeholder="Nhập số lượng vật tư (cái)"
            className="input-text"
            value={formData.soLuongVatTu}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>

        <div className="input-row">
          <label htmlFor="sanLuongMetLo">
            Sản lượng than bình quân tháng
          </label>
          <input
            type="number"
            id="sanLuongMetLo"
            name="sanLuongMetLo"
            placeholder="Nhập sản lượng than"
            className="input-text"
            value={formData.sanLuongMetLo}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
        </div>
        {/* 2 cột kết quả tính toán */}
        <div style={{ display: "flex", gap: "16px", width: "700px" }}>
          <div className="input-row" style={{ flex: 1, marginBottom: "21px" }}>
            <label htmlFor="dinhMucVatTuSCTX">
              Định mức vật tư SCTX cho 1 thiết bị/1000 tấn than NK
            </label>
            <input
              type="text"
              id="dinhMucVatTuSCTX"
              name="dinhMucVatTuSCTX"
              className="input-text"
              value={formData.dinhMucVatTuSCTX}
              readOnly
              style={{ width: "100%", backgroundColor: "#f1f2f5" }}
            />
          </div>
          <div className="input-row" style={{ flex: 1, marginBottom: "21px" }}>
            <label htmlFor="chiPhiVatTuSCTX">
              Chi phí vật tư SCTX cho 1 thiết bị/1 tấn than TNK
            </label>
            <input
              type="text"
              id="chiPhiVatTuSCTX"
              name="chiPhiVatTuSCTX"
              className="input-text"
              value={formData.chiPhiVatTuSCTX}
              readOnly
              style={{ width: "100%", backgroundColor: "#f1f2f5" }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="layout-input-footer">
        <button className="btn-cancel" onClick={handleClose}>Hủy</button>
        <button className="btn-confirm" onClick={handleSubmit}>Xác nhận</button>
      </div>
    </div>
  );
}
