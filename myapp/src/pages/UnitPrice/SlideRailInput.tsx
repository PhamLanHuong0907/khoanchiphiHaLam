/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Select from "react-select"; // Import react-select
import { useApi } from "../../hooks/useFetchData"; // Import hook API
import PATHS from "../../hooks/path"; // Import PATHS
import "../../layout/layout_input.css";
import "../../components/transactionselector.css"; // Import CSS (NƠI BẠN VỪA THÊM CSS TOOLTIP VÀ NÚT XÓA)

// === Định nghĩa interface cho dữ liệu ===

// ... (Các interface Equipment, Part, PartRowData, CostItem, PostPayload giữ nguyên) ...
interface Equipment {
  id: string;
  code: string;
  name: string;
  unitOfMeasureId: string;
  unitOfMeasureName: string;
}
interface Part {
  id: string;
  code: string;
  name: string;
  unitOfMeasureId: string;
  unitOfMeasureName: string;
  equipmentId: string;
  equipmentCode: string;
  costAmmount: number;
}
interface PartRowData {
  partId: string;
  equipmentId: string;
  tenPhuTung: string;
  donGiaVatTu: number;
  donViTinh: string;
  dinhMucThoiGian: string;
  soLuongVatTu: string;
  sanLuongMetLo: string;
  dinhMucVatTuSCTX: string;
  chiPhiVatTuSCTX: string;
}
interface CostItem {
  equipmentId: string;
  partId: string;
  quantity: number;
  replacementTimeStandard: number;
  averageMonthlyTunnelProduction: number;
}
interface PostPayload {
  costs: CostItem[];
}
// === KẾT THÚC THAY ĐỔI ===

export default function SlideRailsInput({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const closePath = PATHS.SLIDE_RAILS.LIST;

  // === Gọi API ===
  const { data: equipmentData = [] } = useApi<Equipment>(
    "/api/catalog/equipment"
  );
  const { data: allPartsData = [] } = useApi<Part>("/api/catalog/part");

  const { postData, loading: isSubmitting } = useApi<PostPayload>(
    "/api/pricing/maintainunitpriceequipment"
  );

  // === State ===
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const [partRows, setPartRows] = useState<PartRowData[]>([]);

  // === Memoized Options cho Dropdown ===
  const equipmentOptions = useMemo(() => {
    return equipmentData.map((eq) => ({
      value: eq.id,
      label: eq.code,
    }));
  }, [equipmentData]);

  // === Xử lý sự kiện ===
  // ... (handleClose, handleSelectChange, handleRowChange giữ nguyên) ...
  const handleClose = () => {
    onClose?.();
    if (!onClose && closePath) navigate(closePath);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectChange = (selected: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newSelectedIds = selected ? selected.map((s: any) => s.value) : [];
    setSelectedEquipmentIds(newSelectedIds);
    const newRows = allPartsData
      .filter((part) => newSelectedIds.includes(part.equipmentId))
      .map(
        (part): PartRowData => ({
          partId: part.id,
          equipmentId: part.equipmentId,
          tenPhuTung: part.name,
          donGiaVatTu: part.costAmmount || 0,
          donViTinh: part.unitOfMeasureName || "Cái",
          dinhMucThoiGian: "",
          soLuongVatTu: "",
          sanLuongMetLo: "",
          dinhMucVatTuSCTX: "0",
          chiPhiVatTuSCTX: "0",
        })
      );
    setPartRows(newRows);
  };

  const handleRowChange = (
    index: number,
    field: keyof PartRowData,
    value: string
  ) => {
    const newRows = [...partRows];
    const updatedRow = { ...newRows[index], [field]: value };
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
    setPartRows(newRows);
  };

  const handleSubmit = async () => {
    const costItems: CostItem[] = partRows.map((row) => ({
      equipmentId: row.equipmentId,
      partId: row.partId,
      quantity: parseFloat(row.soLuongVatTu) || 0,
      replacementTimeStandard: parseFloat(row.dinhMucThoiGian) || 0,
      averageMonthlyTunnelProduction: parseFloat(row.sanLuongMetLo) || 0,
    }));
    const payload: PostPayload = {
      costs: costItems,
    };
    try {
      await postData(payload, () => {
        console.log("📤 Đã gửi thành công:", payload);
        handleClose();
      });
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu:", error);
    }
  };

  // === THÊM MỚI: HÀM XÓA HÀNG ===
  const handleRemoveRow = (indexToRemove: number) => {
    // Lọc ra mảng mới, loại bỏ hàng có 'indexToRemove'
    const newRows = partRows.filter((_, index) => index !== indexToRemove);
    // Cập nhật lại state
    setPartRows(newRows);
  };
  // === KẾT THÚC THÊM MỚI ===

  // ... (selectedOptions giữ nguyên) ...
  const selectedOptions = equipmentOptions.filter((opt) =>
    selectedEquipmentIds.includes(opt.value)
  );

  return (
    <div
      className="layout-input-container"
      style={{ position: "relative", zIndex: 10000, height: "auto" }}
    >
      {/* ... (Phần header và dropdown Select giữ nguyên) ... */}
      <button className="close-btn" onClick={handleClose} title="Đóng">
        <X size={16} />
      </button>

      <div className="layout-input-header">
        <div className="header01">
          Đơn giá và định mức / Đơn giá và định mức SCTX
        </div>
        <div className="line"></div>
        <div className="header02">Tạo mới Đơn giá và định mức SCTX</div>
      </div>

      <div className="layout-input-body">
        <div className="input-row" style={{ position: "fixed" }}>
          <label>Mã thiết bị</label>
          <Select
            isMulti
            options={equipmentOptions}
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

        <div
          style={{
            marginTop: "80px",
            width: "100%",
            maxHeight: "400px",
            overflowY: "auto",
          }}
        >
          {partRows.map((row, index) => (
            <div
              key={row.partId}
              style={{
                display: "flex",
                gap: "16px",
                width: "135%", // Giữ nguyên layout của bạn
                flexWrap: "wrap",
                marginBottom: "20px",
                paddingBottom: "20px",
                borderBottom: "1px dashed #ccc",
              }}
            >
              {/* ... (Toàn bộ 8 div 'input-row' chứa input và tooltip) ... */}
              {/* (Giữ nguyên không thay đổi) */}
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
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      value={(row as any)[item.name]}
                      readOnly
                      style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                    />
                    <span className="tooltip-text">
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any
                      {(row as any)[item.name]}
                    </span>
                  </div>
                </div>
              ))}
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
              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`dinhMucThoiGian-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
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
                  <span className="tooltip-text">{row.dinhMucThoiGian || "Chưa nhập"}</span>
                </div>
              </div>
              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`soLuongVatTu-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
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
                  <span className="tooltip-text">{row.soLuongVatTu || "Chưa nhập"}</span>
                </div>
              </div>
              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`sanLuongMetLo-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
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
                  <span className="tooltip-text">{row.sanLuongMetLo || "Chưa nhập"}</span>
                </div>
              </div>
              <div
                className="input-row"
                style={{ width: "100px", marginBottom: "21px" }}
              >
                <label
                  htmlFor={`dinhMucVatTuSCTX-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
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
              <div
                className="input-row"
                style={{ width: "100px", marginBottom: "21px" }}
              >
                <label
                  htmlFor={`chiPhiVatTuSCTX-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
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
              
              {/* === THÊM MỚI: NÚT XÓA HÀNG === */}
              <button
                type="button"
                className="row-remove-button" // Sử dụng class CSS mới
                title="Xóa hàng này"
                onClick={() => handleRemoveRow(index)} // Gọi hàm xóa
              >
                <X size={16} />
              </button>
              {/* === KẾT THÚC THÊM MỚI === */}

            </div>
          ))}
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