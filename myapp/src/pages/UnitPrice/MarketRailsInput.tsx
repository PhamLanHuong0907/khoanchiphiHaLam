import React, { useState, useMemo } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Select from "react-select"; // THAY ĐỔI: Dùng react-select
import PATHS from "../../hooks/path";
import "../../layout/layout_input.css";
// THÊM MỚI: Import CSS cho tooltip và nút xóa
import "../../components/transactionselector.css"; 

// === Định nghĩa interface (Cấu trúc lại cho giống file mẫu) ===

// Dữ liệu mock (tương đương 'allPartsData' từ API)
interface MarketData {
  id: string; // TB-001
  tenPhuTung: string;
  donGiaVatTu: number;
  donViTinh: string;
}

// Dữ liệu cho mỗi hàng (tương đương 'PartRowData')
interface MarketRowData {
  id: string; // Dùng làm key, và partId
  maThietBi: string; // Tương đương equipmentId
  tenPhuTung: string;
  donGiaVatTu: number;
  donViTinh: string;
  dinhMucThoiGian: string;
  soLuongVatTu: string;
  sanLuongMetLo: string;
  dinhMucVatTuSCTX: string;
  chiPhiVatTuSCTX: string;
}

// Dữ liệu để gửi đi (tương đương 'CostItem')
interface MarketCostItem {
  maThietBi: string;
  partId: string;
  quantity: number;
  replacementTimeStandard: number;
  averageMonthlyTunnelProduction: number;
}

// Payload gửi đi (tương đương 'PostPayload')
interface SubmitPayload {
  costs: MarketCostItem[];
}

// === Dữ liệu Mock (Chuyển đổi từ maThietBiOptions) ===
// Tương đương 'allPartsData'
const allMarketData: MarketData[] = [
  {
    id: "TB-001",
    tenPhuTung: "Ray trượt A",
    donGiaVatTu: 150000,
    donViTinh: "Mét",
  },
  {
    id: "TB-002",
    tenPhuTung: "Bánh xe B",
    donGiaVatTu: 75000,
    donViTinh: "Cái",
  },
  {
    id: "TB-003",
    tenPhuTung: "Cáp C",
    donGiaVatTu: 220000,
    donViTinh: "Cuộn",
  },
];

export default function MarketRailsInput({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const closePath = PATHS.MARKET_RAILS.LIST;

  // === State (Cấu trúc lại cho giống file mẫu) ===
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const [marketRows, setMarketRows] = useState<MarketRowData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // Giả lập loading

  // === Memoized Options cho Dropdown (Giống file mẫu) ===
  const marketOptions = useMemo(() => {
    return allMarketData.map((item) => ({
      value: item.id, // 'TB-001'
      label: item.id, // Hiển thị 'TB-001'
    }));
  }, []); // Dữ liệu mock là hằng số nên dependencies rỗng

  // === Xử lý sự kiện (Cấu trúc lại cho giống file mẫu) ===

  const handleClose = () => {
    onClose?.();
    if (!onClose && closePath) navigate(closePath);
  };

  // THAY ĐỔI: Hàm xử lý khi chọn từ react-select
  const handleSelectChange = (selected: any) => {
    const newSelectedIds = selected ? selected.map((s: any) => s.value) : [];
    setSelectedEquipmentIds(newSelectedIds);

    // Tạo các hàng mới dựa trên lựa chọn
    const newRows = allMarketData
      .filter((item) => newSelectedIds.includes(item.id))
      .map(
        (item): MarketRowData => ({
          id: item.id,
          maThietBi: item.id,
          tenPhuTung: item.tenPhuTung,
          donGiaVatTu: item.donGiaVatTu || 0,
          donViTinh: item.donViTinh || "Cái",
          dinhMucThoiGian: "",
          soLuongVatTu: "",
          sanLuongMetLo: "",
          dinhMucVatTuSCTX: "0",
          chiPhiVatTuSCTX: "0",
        })
      );
    setMarketRows(newRows);
  };

  // THAY ĐỔI: Hàm xử lý khi nhập liệu trên từng hàng
  const handleRowChange = (
    index: number,
    field: keyof MarketRowData,
    value: string
  ) => {
    const newRows = [...marketRows];
    const updatedRow = { ...newRows[index], [field]: value };

    // Tính toán lại
    const donGia = updatedRow.donGiaVatTu || 0;
    const dinhMucThoiGian = parseFloat(updatedRow.dinhMucThoiGian) || 0;
    const soLuongVatTu = parseFloat(updatedRow.soLuongVatTu) || 0;
    const sanLuongMetLo = parseFloat(updatedRow.sanLuongMetLo) || 0;

    let dinhMucVatTu = 0;
    if (sanLuongMetLo !== 0)
      dinhMucVatTu = (dinhMucThoiGian * soLuongVatTu) / sanLuongMetLo;
    const chiPhiVatTu = dinhMucVatTu * donGia;

    updatedRow.dinhMucVatTuSCTX = dinhMucVatTu.toLocaleString("vi-VN", {
      maximumFractionDigits: 2,
    });
    updatedRow.chiPhiVatTuSCTX = chiPhiVatTu.toLocaleString("vi-VN", {
      maximumFractionDigits: 2,
    });

    newRows[index] = updatedRow;
    setMarketRows(newRows);
  };

  // THÊM MỚI: Hàm xóa hàng (Giống file mẫu)
  const handleRemoveRow = (indexToRemove: number) => {
    const newRows = marketRows.filter((_, index) => index !== indexToRemove);
    setMarketRows(newRows);
  };

  // THAY ĐỔI: Hàm gửi dữ liệu
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const costItems: MarketCostItem[] = marketRows.map((row) => ({
      maThietBi: row.maThietBi,
      partId: row.id,
      quantity: parseFloat(row.soLuongVatTu) || 0,
      replacementTimeStandard: parseFloat(row.dinhMucThoiGian) || 0,
      averageMonthlyTunnelProduction: parseFloat(row.sanLuongMetLo) || 0,
    }));

    const payload: SubmitPayload = {
      costs: costItems,
    };

    try {
      // Giả lập gọi API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("📤 Đã gửi thành công:", payload);
      handleClose();
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lấy các options đang được chọn (Giống file mẫu)
  const selectedOptions = marketOptions.filter((opt) =>
    selectedEquipmentIds.includes(opt.value)
  );

  return (
    // THAY ĐỔI: Bỏ width/height cố định, set height: "auto"
    <div
      className="layout-input-container"
      style={{ position: "relative", zIndex: 10000, height: "auto" }}
    >
      <button className="close-btn" onClick={handleClose} title="Đóng">
        <X size={16} />
      </button>

      {/* Header giữ nguyên */}
      <div className="layout-input-header">
        <div className="header01">
          Đơn giá và định mức / Đơn giá và định mức SCTX
        </div>
        <div className="line"></div>
        <div className="header02">Tạo mới Đơn giá và định mức SCTX</div>
      </div>

      <div className="layout-input-body">
        {/* THAY ĐỔI: Dùng Select component giống file mẫu */}
        <div className="input-row" style={{ position: "fixed" }}>
          <label>Mã thiết bị</label>
          <Select
            isMulti
            options={marketOptions}
            value={selectedOptions}
            onChange={handleSelectChange}
            className="transaction-select-wrapper"
            classNamePrefix="transaction-select"
            placeholder="Chọn Mã thiết bị"
            styles={{
              menu: (provided) => ({ ...provided, zIndex: 9999 }),
            }}
          />
        </div>

        {/* THAY ĐỔI: Bọc danh sách hàng trong div cuộn */}
        <div
          style={{
            marginTop: "80px",
            width: "100%",
            maxHeight: "400px",
            overflowY: "auto",
          }}
        >
          {/* THAY ĐỔI: Map qua marketRows thay vì form tĩnh */}
          {marketRows.map((row, index) => (
            <div
              key={row.id} // Dùng id duy nhất làm key
              style={{
                display: "flex",
                gap: "16px",
                width: "135%", // Giống file mẫu
                flexWrap: "wrap",
                marginBottom: "20px",
                paddingBottom: "20px",
                borderBottom: "1px dashed #ccc",
              }}
            >
              {/* Các trường read-only (Tên, Đơn giá) */}
              {[
                { label: "Tên phụ tùng", name: "tenPhuTung" },
                { label: "Đơn giá vật tư", name: "donGiaVatTu" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="input-row"
                  style={{ width: "100px", marginBottom: "21px" }}
                >
                  <label
                    htmlFor={`${item.name}-${index}`}
                    style={{
                      display: "flex",
                      textAlign: "center",
                      height: "30px",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.label}
                  </label>
                  <div className="tooltip-wrapper">
                    <input
                      type="text"
                      id={`${item.name}-${index}`}
                      name={item.name}
                      className="input-text"
                      value={(row as any)[item.name]}
                      readOnly
                      style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                    />
                    <span className="tooltip-text">
                      {(row as any)[item.name]}
                    </span>
                  </div>
                </div>
              ))}

              {/* Trường read-only (ĐVT) */}
              {[
                { label: "ĐVT", name: "donViTinh" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="input-row"
                  style={{ width: "80px", marginBottom: "21px" }}
                >
                  <label
                    htmlFor={`${item.name}-${index}`}
                    style={{
                      display: "flex",
                      textAlign: "center",
                      height: "30px",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.label}
                  </label>
                  <div className="tooltip-wrapper">
                    <input
                      type="text"
                      id={`${item.name}-${index}`}
                      name={item.name}
                      className="input-text"
                      value={(row as any)[item.name]}
                      readOnly
                      style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                    />
                    <span className="tooltip-text">
                      {(row as any)[item.name]}
                    </span>
                  </div>
                </div>
              ))}

              {/* Trường nhập: Định mức thời gian */}
              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`dinhMucThoiGian-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  {/* Label giống file mẫu */}
                  Định mức thời gian thay thế tháng
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="number"
                    id={`dinhMucThoiGian-${index}`}
                    name="dinhMucThoiGian"
                    placeholder="Nhập định mức"
                    className="input-text"
                    value={row.dinhMucThoiGian}
                    onChange={(e) =>
                      handleRowChange(index, "dinhMucThoiGian", e.target.value)
                    }
                    autoComplete="off"
                  />
                  <span className="tooltip-text">
                    {row.dinhMucThoiGian || "Chưa nhập"}
                  </span>
                </div>
              </div>

              {/* Trường nhập: Số lượng vật tư */}
              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`soLuongVatTu-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  {/* Label giống file mẫu */}
                  Số lượng vật tư thay thế
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="number"
                    id={`soLuongVatTu-${index}`}
                    name="soLuongVatTu"
                    placeholder="Nhập số lượng"
                    className="input-text"
                    value={row.soLuongVatTu}
                    onChange={(e) =>
                      handleRowChange(index, "soLuongVatTu", e.target.value)
                    }
                    autoComplete="off"
                  />
                  <span className="tooltip-text">
                    {row.soLuongVatTu || "Chưa nhập"}
                  </span>
                </div>
              </div>

              {/* Trường nhập: Sản lượng */}
              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`sanLuongMetLo-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  {/* Label giống file mẫu */}
                  Sản lượng mét lò đào bình quân
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="number"
                    id={`sanLuongMetLo-${index}`}
                    name="sanLuongMetLo"
                    placeholder="Nhập sản lượng"
                    className="input-text"
                    value={row.sanLuongMetLo}
                    onChange={(e) =>
                      handleRowChange(index, "sanLuongMetLo", e.target.value)
                    }
                    autoComplete="off"
                  />
                  <span className="tooltip-text">
                    {row.sanLuongMetLo || "Chưa nhập"}
                  </span>
                </div>
              </div>

              {/* Trường tính toán: Định mức SCTX */}
              <div
                className="input-row"
                style={{ width: "100px", marginBottom: "21px" }}
              >
                <label
                  htmlFor={`dinhMucVatTuSCTX-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  {/* Label giống file mẫu */}
                  Định mức vật tư SCTX
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`dinhMucVatTuSCTX-${index}`}
                    name="dinhMucVatTuSCTX"
                    className="input-text"
                    value={row.dinhMucVatTuSCTX}
                    readOnly
                    style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                  />
                  <span className="tooltip-text">{row.dinhMucVatTuSCTX}</span>
                </div>
              </div>

              {/* Trường tính toán: Chi phí SCTX */}
              <div
                className="input-row"
                style={{ width: "100px", marginBottom: "21px" }}
              >
                <label
                  htmlFor={`chiPhiVatTuSCTX-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  {/* Label giống file mẫu */}
                  Chi phí vật tư SCTX
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`chiPhiVatTuSCTX-${index}`}
                    name="chiPhiVatTuSCTX"
                    className="input-text"
                    value={row.chiPhiVatTuSCTX}
                    readOnly
                    style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                  />
                  <span className="tooltip-text">{row.chiPhiVatTuSCTX}</span>
                </div>
              </div>

              {/* THÊM MỚI: Nút xóa hàng (Giống file mẫu) */}
              <button
                type="button"
                className="row-remove-button"
                title="Xóa hàng này"
                onClick={() => handleRemoveRow(index)}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer (Thêm xử lý isSubmitting) */}
      <div className="layout-input-footer">
        <button className="btn-cancel" onClick={handleClose}>
          Hủy
        </button>
        <button
          className="btn-confirm"
          onClick={handleSubmit}
          disabled={isSubmitting} // Thêm disabled
        >
          {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
        </button>
      </div>
    </div>
  );
}