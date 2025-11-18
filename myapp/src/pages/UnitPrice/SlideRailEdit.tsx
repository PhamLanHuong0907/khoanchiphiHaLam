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
  donGiaVatTu: number; // <-- SẼ LƯU SỐ THÔ (number)
  donViTinh: string;
  dinhMucThoiGian: string; // <-- SẼ LƯU CHUỖI CÓ DẤU PHẨY (vd: "123,4")
  soLuongVatTu: string; // <-- SẼ LƯU CHUỖI CÓ DẤU PHẨY (vd: "123,4")
  sanLuongMetLo: string; // <-- SẼ LƯU CHUỖI CÓ DẤU PHẨY (vd: "123,4")
  dinhMucVatTuSCTX: string; // <-- SẼ LƯU CHUỖI ĐỊNH DẠNG (vd: "123,45")
  chiPhiVatTuSCTX: string; // <-- SẼ LƯU CHUỖI ĐỊNH DẠNG (vd: "100.000")
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

  // ====== BẮT ĐẦU SỬA ĐỔI 1: Thêm 3 HÀM TIỆN ÍCH + 1 HÀM FORMAT INPUT ======
  /**
   * (ĐỊNH MỨC - INPUTS) Chuyển đổi chuỗi (VD: "123,4") sang số (123.4)
   */
  const parseLocalFloat = (str: string | undefined | null): number => {
    if (!str) return 0;
    const cleanStr = str.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanStr || "0");
  };

  /**
   * (CHI PHÍ - OUTPUT) Chuyển đổi số (VD: 100000) thành chuỗi ("100.000")
   */
  const formatNumberForDisplay = (
    value: number | undefined | null
  ): string => {
    if (value === null || value === undefined) return "0";
    return new Intl.NumberFormat("de-DE", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(value);
  };

  /**
   * (ĐỊNH MỨC - OUTPUT/INPUT) Chuyển đổi số (VD: 123.456) thành chuỗi ("123,456")
   */
  const formatLocalFloat = (value: number | undefined | null): string => {
    if (value === null || value === undefined) return ""; // Trả về rỗng cho input
    return new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 4,
    }).format(value);
  };

  // ====== THÊM MỚI: HÀM ĐỊNH DẠNG INPUT KHI NHẬP ======
  /**
   * (INPUT DISPLAY) Định dạng chuỗi "thô" từ state (vd: "12345,6")
   * thành chuỗi hiển thị trong input (vd: "12.345,6")
   */
  const formatInputDisplay = (value: string | undefined | null): string => {
    if (!value) return "";

    // Tách phần nguyên và phần thập phân (luôn dùng dấu phẩy)
    const parts = value.split(",");
    const integerPart = parts[0];
    const decimalPart = parts[1];

    // Chỉ định dạng phần nguyên bằng dấu chấm
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // Ghép lại
    if (value.endsWith(",")) {
      // Nếu người dùng vừa gõ xong dấu phẩy (vd: "12.345,")
      return formattedInteger + ",";
    }
    if (decimalPart !== undefined) {
      // Nếu có cả phần thập phân (vd: "12.345,6")
      return formattedInteger + "," + decimalPart;
    }
    // Nếu chỉ có phần nguyên (vd: "12.345")
    return formattedInteger;
  };
  // ====== KẾT THÚC SỬA ĐỔI 1 ======

  // === Hàm helper tính toán (ĐÃ SỬA) ===
  const calculateRowCosts = (row: PartRowData): PartRowData => {
    const donGia = row.donGiaVatTu || 0;
    const dinhMucThoiGian = parseLocalFloat(row.dinhMucThoiGian);
    const soLuongVatTu = parseLocalFloat(row.soLuongVatTu);
    const sanLuongMetLo = parseLocalFloat(row.sanLuongMetLo);

    let dinhMucVatTu = 0;
    if (sanLuongMetLo !== 0)
      dinhMucVatTu = (dinhMucThoiGian * soLuongVatTu) / sanLuongMetLo;
    const chiPhiVatTu = dinhMucVatTu * donGia;

    return {
      ...row,
      dinhMucVatTuSCTX: formatLocalFloat(dinhMucVatTu),
      chiPhiVatTuSCTX: formatNumberForDisplay(chiPhiVatTu),
    };
  };

  // === Gọi API ===
  // 1. API GET (danh mục)
  const { data: equipmentData = [] } = useApi<Equipment>(
    "/api/catalog/equipment?pageIndex=1&pageSize=10000"
  );
  const { data: allPartsData = [] } = useApi<Part>(
    "/api/catalog/part?pageIndex=1&pageSize=10000"
  );

  // 2. API (CRUD)
  const {
    putData, // <-- SỬ DỤNG PUT
    fetchById,
    loading: isSubmitting,
  } = useApi<any>(basePath);

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
    if (!id || allPartsData.length === 0 || equipmentData.length === 0) {
      return;
    }

    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const fetchedData = (await fetchById(id)) as ApiResponseGetById;
        if (!fetchedData) {
          console.error("Không tìm thấy dữ liệu!");
          setIsLoadingData(false);
          return;
        }

        setSelectedEquipmentIds([fetchedData.equipmentId]);

        const partMap = new Map<string, ApiPartItem>(
          fetchedData.maintainUnitPriceEquipment.map((p: ApiPartItem) => [
            p.partId,
            p,
          ])
        );

        const relevantParts = allPartsData.filter(
          (part) => part.equipmentId === fetchedData.equipmentId
        );

        const newRows = relevantParts.map((part) => {
          const savedData = partMap.get(part.id);

          const initialRow: PartRowData = {
            id: savedData?.id || null,
            partId: part.id,
            equipmentId: part.equipmentId,
            tenPhuTung: part.name,
            donGiaVatTu: part.costAmmount || 0,
            donViTinh: part.unitOfMeasureName || "Cái",

            // ====== BẮT ĐẦU SỬA ĐỔI 2: Dùng formatLocalFloat khi GET ======
            // (GIỮ NGUYÊN - ĐÃ ĐÚNG)
            dinhMucThoiGian: formatLocalFloat(
              savedData?.replacementTimeStandard
            ),
            soLuongVatTu: formatLocalFloat(savedData?.quantity),
            sanLuongMetLo: formatLocalFloat(
              savedData?.averageMonthlyTunnelProduction
            ),
            // ====== KẾT THÚC SỬA ĐỔI 2 ======

            dinhMucVatTuSCTX: "0",
            chiPhiVatTuSCTX: "0",
          };

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
  }, [id, fetchById, allPartsData, equipmentData]);

  // === Xử lý sự kiện ===

  const handleClose = () => {
    onClose?.();
    if (!onClose && closePath) navigate(closePath);
  };

  // ====== BẮT ĐẦU SỬA ĐỔI 3: Cập nhật handleRowChange (cho Định mức) ======
  // (GIỮ NGUYÊN - HÀM NÀY ĐÃ HOẠT ĐỘNG ĐÚNG)
  const handleRowChange = (
    index: number,
    field: keyof PartRowData,
    value: string
  ) => {
    const newRows = [...partRows];
    let cleanValue = value;

    if (
      field === "dinhMucThoiGian" ||
      field === "soLuongVatTu" ||
      field === "sanLuongMetLo"
    ) {
      // 1a. CHẶN DẤU CHẤM: Xóa tất cả dấu chấm ('.')
      cleanValue = value.replace(/\./g, "");

      // 1b. KIỂM TRA HỢP LỆ: Chỉ cho phép số và 1 dấu phẩy
      if (!/^[0-9]*(,[0-9]*)?$/.test(cleanValue)) {
        return; // Không cập nhật nếu nhập không hợp lệ (vd: "12,3,4")
      }
    }

    const updatedRow = { ...newRows[index], [field]: cleanValue };
    newRows[index] = calculateRowCosts(updatedRow);
    setPartRows(newRows);
  };
  // ====== KẾT THÚC SỬA ĐỔI 3 ======

  const handleRemoveRow = (indexToRemove: number) => {
    const newRows = partRows.filter((_, index) => index !== indexToRemove);
    setPartRows(newRows);
  };

  // ====== BẮT ĐẦU SỬA ĐỔI 4: Cập nhật handleSubmit (dùng parseLocalFloat) ======
  // (GIỮ NGUYÊN - HÀM NÀY ĐÃ HOẠT ĐỘNG ĐÚNG)
  const handleSubmit = async () => {
    const equipmentId = selectedEquipmentIds[0];
    if (!equipmentId) {
      console.error("Không có equipmentId được chọn!");
      return;
    }

    const partUnitPrices: PartUnitPriceItem[] = partRows
      .filter((row) => row.id !== null)
      .map((row) => ({
        id: row.id!,
        partId: row.partId,
        quantity: parseLocalFloat(row.soLuongVatTu),
        replacementTimeStandard: parseLocalFloat(row.dinhMucThoiGian),
        averageMonthlyTunnelProduction: parseLocalFloat(row.sanLuongMetLo),
      }));

    const payload: PutPayload = {
      equipmentId: equipmentId,
      partUnitPrices: partUnitPrices,
    };

    try {
      await putData(payload, () => {
        console.log("✅ Cập nhật thành công:", payload);
        handleClose();
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật dữ liệu:", error);
    }
  };
  // ====== KẾT THÚC SỬA ĐỔI 4 ======

  const selectedOptions = equipmentOptions.filter((opt) =>
    selectedEquipmentIds.includes(opt.value)
  );

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
        <div className="header02">Chỉnh sửa Đơn giá và định mức SCTX</div>
      </div>

      <div className="layout-input-body">
        <div className="input-row" style={{ position: "fixed" }}>
          <label>Mã thiết bị</label>
          <Select
            isMulti
            options={equipmentOptions}
            value={selectedOptions}
            isDisabled={true} // <-- VÔ HIỆU HÓA KHI EDIT
            className="transaction-select-wrapper"
            classNamePrefix="transaction-select"
            placeholder="Chọn Mã thiết bị"
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (provided) => ({ ...provided, zIndex: 999999 }),
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
                width: "135%",
                flexWrap: "wrap",
                marginBottom: "20px",
                paddingBottom: "20px",
                borderBottom: "1px dashed #ccc",
              }}
            >
              {/* === BẮT ĐẦU SỬA ĐỔI 5: Tách riêng Đơn giá vật tư === */}
              {/* (GIỮ NGUYÊN) */}
              <div
                className="input-row"
                style={{ width: "100px", marginBottom: "21px" }}
              >
                <label
                  htmlFor={`tenPhuTung-${index}`}
                  style={{
                    display: "flex",
                    textAlign: "center",
                    height: "30px",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Tên phụ tùng
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`tenPhuTung-${index}`}
                    name="tenPhuTung"
                    className="input-text"
                    value={row.tenPhuTung}
                    readOnly
                    style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                  />
                  <span className="tooltip-text">{row.tenPhuTung}</span>
                </div>
              </div>

              <div
                className="input-row"
                style={{ width: "100px", marginBottom: "21px" }}
              >
                <label
                  htmlFor={`donGiaVatTu-${index}`}
                  style={{
                    display: "flex",
                    textAlign: "center",
                    height: "30px",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Đơn giá vật tư
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`donGiaVatTu-${index}`}
                    name="donGiaVatTu"
                    className="input-text"
                    value={formatNumberForDisplay(row.donGiaVatTu)}
                    readOnly
                    style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                  />
                  <span className="tooltip-text">
                    {formatNumberForDisplay(row.donGiaVatTu)}
                  </span>
                </div>
              </div>

              <div
                className="input-row"
                style={{ width: "80px", marginBottom: "21px" }}
              >
                <label
                  htmlFor={`donViTinh-${index}`}
                  style={{
                    display: "flex",
                    textAlign: "center",
                    height: "30px",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ĐVT
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`donViTinh-${index}`}
                    name="donViTinh"
                    className="input-text"
                    value={row.donViTinh}
                    readOnly
                    style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                  />
                  <span className="tooltip-text">{row.donViTinh}</span>
                </div>
              </div>
              {/* ====== KẾT THÚC SỬA ĐỔI 5 ====== */}

              {/* ====== BẮT ĐẦU SỬA ĐỔI 6: SỬ DỤNG HÀM FORMAT MỚI ====== */}
              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`dinhMucThoiGian-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  Định mức thời gian thay thế
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text" // (Giữ nguyên type="text")
                    id={`dinhMucThoiGian-${index}`}
                    name="dinhMucThoiGian"
                    placeholder="Nhập định mức"
                    className="input-text"
                    // ====== SỬA: Dùng hàm formatInputDisplay ======
                    value={formatInputDisplay(row.dinhMucThoiGian)}
                    onChange={(e) =>
                      handleRowChange(index, "dinhMucThoiGian", e.target.value)
                    }
                    autoComplete="off"
                  />
                  <span className="tooltip-text">
                    {/* Sửa tooltip để hiển thị đẹp hơn */}
                    {formatInputDisplay(row.dinhMucThoiGian) || "Chưa nhập"}
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
                <div className="tooltip-wrapper">
                  <input
                    type="text" // (Giữ nguyên type="text")
                    id={`soLuongVatTu-${index}`}
                    name="soLuongVatTu"
                    placeholder="Nhập số lượng"
                    className="input-text"
                    // ====== SỬA: Dùng hàm formatInputDisplay ======
                    value={formatInputDisplay(row.soLuongVatTu)}
                    onChange={(e) =>
                      handleRowChange(index, "soLuongVatTu", e.target.value)
                    }
                    autoComplete="off"
                  />
                  <span className="tooltip-text">
                    {/* Sửa tooltip để hiển thị đẹp hơn */}
                    {formatInputDisplay(row.soLuongVatTu) || "Chưa nhập"}
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
                <div className="tooltip-wrapper">
                  <input
                    type="text" // (Giữ nguyên type="text")
                    id={`sanLuongMetLo-${index}`}
                    name="sanLuongMetLo"
                    placeholder="Nhập sản lượng"
                    className="input-text"
                    // ====== SỬA: Dùng hàm formatInputDisplay ======
                    value={formatInputDisplay(row.sanLuongMetLo)}
                    onChange={(e) =>
                      handleRowChange(index, "sanLuongMetLo", e.target.value)
                    }
                    autoComplete="off"
                  />
                  <span className="tooltip-text">
                    {/* Sửa tooltip để hiển thị đẹp hơn */}
                    {formatInputDisplay(row.sanLuongMetLo) || "Chưa nhập"}
                  </span>
                </div>
              </div>
              {/* ====== KẾT THÚC SỬA ĐỔI 6 ====== */}

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
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`dinhMucVatTuSCTX-${index}`}
                    name="dinhMucVatTuSCTX"
                    className="input-text"
                    value={row.dinhMucVatTuSCTX} // Đã được định dạng dấu phẩy (,)
                    readOnly
                    style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                  />
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
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`chiPhiVatTuSCTX-${index}`}
                    name="chiPhiVatTuSCTX"
                    className="input-text"
                    value={row.chiPhiVatTuSCTX} // Đã được định dạng dấu chấm (.)
                    readOnly
                    style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                  />
                  <span className="tooltip-text">
                    {row.chiPhiVatTuSCTX}
                  </span>
                </div>
              </div>

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