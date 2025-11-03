import React, { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react"; // Icon X đã được import
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { useApi } from "../../hooks/useFetchData";
import PATHS from "../../hooks/path";
import "../../layout/layout_input.css";
import "../../components/transactionselector.css"; // File CSS chứa .tooltip-wrapper và .row-remove-button

// === Định nghĩa interface cho dữ liệu ===

// Dữ liệu từ API /api/catalog/equipment
interface Equipment {
  id: string;
  code: string;
  name: string;
  unitOfMeasureId: string;
  unitOfMeasureName: string;
}

// Dữ liệu từ API /api/catalog/part
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

// Dữ liệu cho mỗi hàng phụ tùng hiển thị trên UI
interface PartRowData {
  id: string | null; // <-- THAY ĐỔI: ID của bản ghi maintainUnitPriceEquipment
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

// === Interface cho payload (PUT) ===
// <-- THAY ĐỔI: Cập nhật interface cho payload PUT
interface PartUnitPriceItem {
  id: string; // ID của bản ghi maintainUnitPriceEquipment
  partId: string;
  quantity: number;
  replacementTimeStandard: number;
  averageMonthlyTunnelProduction: number;
}

interface PutPayload {
  equipmentId: string;
  partUnitPrices: PartUnitPriceItem[];
}

// === Interface cho API GET /id (Dựa trên file SCTX_test.tsx) ===
interface ApiPartItem {
  id: string;
  partId: string;
  replacementTimeStandard: number;
  averageMonthlyTunnelProduction: number;
  quantity: number;
  // ... các trường khác
}

interface ApiResponseGetById {
  equipmentId: string;
  equipmentCode: string;
  maintainUnitPriceEquipment: ApiPartItem[];
  // ... các trường khác
}

// === Hàm helper tính toán (tách ra để tái sử dụng) ===
const calculateRowCosts = (row: PartRowData): PartRowData => {
  const donGia = row.donGiaVatTu || 0;
  const dinhMucThoiGian = parseFloat(row.dinhMucThoiGian) || 0;
  const soLuongVatTu = parseFloat(row.soLuongVatTu) || 0;
  const sanLuongMetLo = parseFloat(row.sanLuongMetLo) || 0;

  let dinhMucVatTu = 0;
  if (sanLuongMetLo !== 0)
    dinhMucVatTu = (dinhMucThoiGian * soLuongVatTu) / sanLuongMetLo;
  const chiPhiVatTu = dinhMucVatTu * donGia;

  return {
    ...row,
    dinhMucVatTuSCTX: dinhMucVatTu.toLocaleString("vi-VN", {
      maximumFractionDigits: 2,
    }),
    chiPhiVatTuSCTX: chiPhiVatTu.toLocaleString("vi-VN", {
      maximumFractionDigits: 2,
    }),
  };
};

// === Component EDIT ===
export default function SlideRailsEdit({
  id,
  onClose,
}: {
  id: string; // ID là bắt buộc
  onClose?: () => void;
}) {
  const navigate = useNavigate();
  const closePath = PATHS.SLIDE_RAILS.LIST;
  const basePath = "/api/pricing/maintainunitpriceequipment";

  // === Gọi API ===
  // 1. API GET (danh mục)
  const { data: equipmentData = [] } = useApi<Equipment>(
    "/api/catalog/equipment"
  );
  const { data: allPartsData = [] } = useApi<Part>("/api/catalog/part");

  // 2. API (CRUD)
  const {
    putData, // <-- SỬ DỤNG PUT
    fetchById,
    loading: isSubmitting, // loading cho PUT
    fetchData, // Dùng tạm 1 state loading chung,
  } = useApi<any>(basePath); // 'any' vì hook này xử lý nhiều loại

  // State loading riêng cho việc tải dữ liệu ban đầu
  const [isLoadingData, setIsLoadingData] = useState(true);

  // === State ===
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const [partRows, setPartRows] = useState<PartRowData[]>([]);

  // === Memoized Options cho Dropdown (Giữ nguyên) ===
  const equipmentOptions = useMemo(() => {
    return equipmentData.map((eq) => ({
      value: eq.id,
      label: eq.code,
    }));
  }, [equipmentData]);

  // === Tải dữ liệu khi component mount hoặc id/danh mục thay đổi ===
  useEffect(() => {
    // Chỉ chạy khi có id VÀ các danh mục đã tải xong
    if (!id || allPartsData.length === 0 || equipmentData.length === 0) {
      return;
    }

    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const fetchedData = (await fetchById(id)) as ApiResponseGetById; // <-- THAY ĐỔI: Ép kiểu để rõ ràng
        if (!fetchedData) {
          console.error("Không tìm thấy dữ liệu!");
          setIsLoadingData(false);
          return;
        }

        // 1. Set ID thiết bị đã chọn (chỉ 1)
        setSelectedEquipmentIds([fetchedData.equipmentId]);

        // 2. Tạo Map tra cứu cho dữ liệu đã lưu
        const partMap = new Map<string, ApiPartItem>(
          fetchedData.maintainUnitPriceEquipment.map((p: ApiPartItem) => [
            p.partId,
            p,
          ])
        );

        // 3. Lọc ra các phụ tùng thuộc thiết bị này (từ danh mục)
        const relevantParts = allPartsData.filter(
          (part) => part.equipmentId === fetchedData.equipmentId
        );

        // 4. Tạo partRows, kết hợp dữ liệu danh mục và dữ liệu đã lưu
        const newRows = relevantParts.map((part) => {
          const savedData = partMap.get(part.id);

          const initialRow: PartRowData = {
            id: savedData?.id || null, // <-- THAY ĐỔI: Lưu ID của bản ghi
            partId: part.id,
            equipmentId: part.equipmentId,
            tenPhuTung: part.name,
            donGiaVatTu: part.costAmmount || 0,
            donViTinh: part.unitOfMeasureName || "Cái",
            // Điền dữ liệu đã lưu (chuyển sang string)
            dinhMucThoiGian: String(savedData?.replacementTimeStandard || ""),
            soLuongVatTu: String(savedData?.quantity || ""),
            sanLuongMetLo: String(
              savedData?.averageMonthlyTunnelProduction || ""
            ),
            // Sẽ được tính toán ở bước sau
            dinhMucVatTuSCTX: "0",
            chiPhiVatTuSCTX: "0",
          };

          // Tính toán chi phí/định mức cho hàng đã tải
          return calculateRowCosts(initialRow);
        });

        setPartRows(newRows);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Edit:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [id, fetchById, allPartsData, equipmentData]); // Phụ thuộc vào id và danh mục

  // === Xử lý sự kiện ===

  const handleClose = () => {
    onClose?.();
    if (!onClose && closePath) navigate(closePath);
  };

  // handleSelectChange không còn cần thiết vì dropdown bị vô hiệu hóa
  // const handleSelectChange = ...

  // Khi người dùng nhập liệu vào một hàng
  const handleRowChange = (
    index: number,
    field: keyof PartRowData,
    value: string
  ) => {
    const newRows = [...partRows];
    const updatedRow = { ...newRows[index], [field]: value };

    // Tính toán lại chi phí/định mức và cập nhật hàng
    newRows[index] = calculateRowCosts(updatedRow);

    setPartRows(newRows);
  };

  // === THÊM MỚI: HÀM XÓA HÀNG ===
  const handleRemoveRow = (indexToRemove: number) => {
    const newRows = partRows.filter((_, index) => index !== indexToRemove);
    setPartRows(newRows);
  };
  // === KẾT THÚC THÊM MỚI ===

  // === THAY ĐỔI: Cập nhật handleSubmit ===
  // Khi người dùng nhấn nút "Xác nhận" (SUBMIT)
  const handleSubmit = async () => {
    // 1. Lấy equipmentId từ state (chỉ có 1 ID khi Edit)
    const equipmentId = selectedEquipmentIds[0];

    if (!equipmentId) {
      console.error("Không có equipmentId được chọn!");
      // (Nên thêm thông báo lỗi cho người dùng)
      return;
    }

    // 2. Lọc và Map các hàng sang định dạng PartUnitPriceItem
    // Chỉ gửi các hàng đã có 'id' (các bản ghi đã tồn tại)
    const partUnitPrices: PartUnitPriceItem[] = partRows
      .filter((row) => row.id !== null) // Chỉ gửi các hàng đã có ID từ trước
      .map((row) => ({
        id: row.id!, // Dùng '!' vì đã filter null
        partId: row.partId,
        quantity: parseFloat(row.soLuongVatTu) || 0,
        replacementTimeStandard: parseFloat(row.dinhMucThoiGian) || 0,
        averageMonthlyTunnelProduction: parseFloat(row.sanLuongMetLo) || 0,
      }));

    // 3. Tạo payload cuối cùng
    const payload: PutPayload = {
      equipmentId: equipmentId,
      partUnitPrices: partUnitPrices,
    };

    try {
      // SỬ DỤNG putData
      await putData(payload, () => {
        console.log("✅ Cập nhật thành công:", payload);
        handleClose();
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật dữ liệu:", error);
    }
  };
  // === KẾT THÚC THAY ĐỔI handleSubmit ===

  // Lấy các options đang được chọn cho react-select
  const selectedOptions = equipmentOptions.filter((opt) =>
    selectedEquipmentIds.includes(opt.value)
  );

  // === Hiển thị loading nếu đang tải dữ liệu ban đầu ===
  if (isLoadingData) {
    return (
      <div
        className="layout-input-container"
        style={{
          position: "relative",
          zIndex: 10000,
          height: "auto",
          padding: "20px",
        }}
      >
        Đang tải dữ liệu chỉnh sửa...
      </div>
    );
  }

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
          Đơn giá và định mức / Đơn giá và định mức SCTX
        </div>
        <div className="line"></div>
        {/* THAY ĐỔI TIÊU ĐỀ */}
        <div className="header02">Chỉnh sửa Đơn giá và định mức SCTX</div>
      </div>

      <div className="layout-input-body">
        {/* Field Mã thiết bị (REACT-SELECT) */}
        <div className="input-row" style={{ position: "fixed" }}>
          <label>Mã thiết bị</label>
          <Select
            isMulti
            options={equipmentOptions}
            value={selectedOptions}
            // onChange={handleSelectChange} // Không cần
            isDisabled={true} // <-- VÔ HIỆU HÓA KHI EDIT
            className="transaction-select-wrapper"
            classNamePrefix="transaction-select"
            placeholder="Chọn Mã thiết bị"
            styles={{
              menu: (provided) => ({ ...provided, zIndex: 9999 }),
            }}
          />
        </div>

        {/* ============================================== */}
        {/* ============================================== */}
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
              key={row.partId} // Giữ key là partId vì nó là duy nhất trong danh sách
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
              {/* === BẮT ĐẦU THAY ĐỔI: THÊM TOOLTIP === */}

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
                  {/* Bọc input bằng tooltip-wrapper */}
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
                    {/* Đây là nội dung popup */}
                    <span className="tooltip-text">
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
                  {/* Bọc input bằng tooltip-wrapper */}
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
                    {/* Đây là nội dung popup */}
                    <span className="tooltip-text">
                      {(row as any)[item.name]}
                    </span>
                  </div>
                </div>
              ))}
              {/* Input các trường còn lại */}
              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`dinhMucThoiGian-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  Định mức thời gian thay thế
                </label>
                {/* Bọc input bằng tooltip-wrapper */}
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
                  {/* Đây là nội dung popup */}
                  <span className="tooltip-text">
                    {row.dinhMucThoiGian || "Chưa nhập"}
                  </span>
                </div>
              </div>

              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`soLuongVatTu-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  Số lượng vật tư thay thế
                </label>
                {/* Bọc input bằng tooltip-wrapper */}
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
                  {/* Đây là nội dung popup */}
                  <span className="tooltip-text">
                    {row.soLuongVatTu || "Chưa nhập"}
                  </span>
                </div>
              </div>

              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`sanLuongMetLo-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  Sản lượng mét lò đào bình quân
                </label>
                {/* Bọc input bằng tooltip-wrapper */}
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
                  {/* Đây là nội dung popup */}
                  <span className="tooltip-text">
                    {row.sanLuongMetLo || "Chưa nhập"}
                  </span>
                </div>
              </div>

              {/* 2 cột kết quả tính toán */}
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
                {/* Bọc input bằng tooltip-wrapper */}
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
                  {/* Đây là nội dung popup */}
                  <span className="tooltip-text">
                    {row.dinhMucVatTuSCTX}
                  </span>
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
                {/* Bọc input bằng tooltip-wrapper */}
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
                  {/* Đây là nội dung popup */}
                  <span className="tooltip-text">
                    {row.chiPhiVatTuSCTX}
                  </span>
                </div>
              </div>

              {/* === THÊM MỚI: NÚT XÓA HÀNG === */}
              <button
                type="button"
                className="row-remove-button" // Sử dụng class CSS
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