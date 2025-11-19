import React, { useEffect, useState, useMemo } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { useApi } from "../../hooks/useFetchData";
import PATHS from "../../hooks/path";
import "../../layout/layout_input.css";
import "../../components/transactionselector.css";
import FormRow from "../../components/formRow";

// === Định nghĩa interface cho dữ liệu (Giữ nguyên) ===
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
  id: string | null;
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

interface PartUnitPriceItem {
  partId: string;
  quantity: number;
  replacementTimeStandard: number;
  averageMonthlyTunnelProduction: number;
}

interface PutPayload {
  equipmentId: string;
  startDate: string;
  endDate: string;
  partUnitPrices: PartUnitPriceItem[];
}

interface ApiPartItem {
  id: string;
  partId: string;
  replacementTimeStandard: number;
  averageMonthlyTunnelProduction: number;
  quantity: number;
}

interface ApiResponseGetById {
  equipmentId: string;
  equipmentCode: string;
  startDate?: string;
  endDate?: string;
  maintainUnitPriceEquipment: ApiPartItem[];
}

// Interface cho state dropdown
interface DropdownOption {
  value: string;
  label: string;
}

// ====== CÁC HÀM TIỆN ÍCH (Giữ nguyên) ======
const parseLocalFloat = (str: string | undefined | null): number => {
  if (!str) return 0;
  const cleanStr = str.replace(/\./g, "").replace(",", ".");
  return parseFloat(cleanStr || "0");
};

const formatNumberForDisplay = (value: number | undefined | null): string => {
  if (value === null || value === undefined) return "0";
  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value);
};

const formatLocalFloat = (value: number | undefined | null): string => {
  if (value === null || value === undefined) return "0";
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 4,
  }).format(value);
};

const formatInputDisplay = (value: string | undefined | null): string => {
  if (!value) return "";
  const parts = value.split(",");
  const integerPart = parts[0];
  const decimalPart = parts[1];
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  if (value.endsWith(",")) {
    return formattedInteger + ",";
  }
  if (decimalPart !== undefined) {
    return formattedInteger + "," + decimalPart;
  }
  return formattedInteger;
};

// === Hàm helper tính toán (Giữ nguyên) ===
const calculateRowCosts = (row: PartRowData): PartRowData => {
  const donGia = row.donGiaVatTu || 0;
  const dinhMucThoiGian = parseLocalFloat(row.dinhMucThoiGian);
  const soLuongVatTu = parseLocalFloat(row.soLuongVatTu);
  const sanLuongMetLo = parseLocalFloat(row.sanLuongMetLo);

  let dinhMucVatTu = 0;
  if (sanLuongMetLo !== 0 && dinhMucThoiGian !== 0) {
    dinhMucVatTu = (soLuongVatTu / dinhMucThoiGian) / sanLuongMetLo;
  }

  const chiPhiVatTu = dinhMucVatTu * donGia;

  return {
    ...row,
    dinhMucVatTuSCTX: formatLocalFloat(dinhMucVatTu),
    chiPhiVatTuSCTX: formatNumberForDisplay(chiPhiVatTu),
  };
};

// === Component EDIT ===
export default function SlideRailsEdit({
  id,
  onClose,
  onSuccess
}: {
  id: string;
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Cập nhật type
}) {
  const navigate = useNavigate();
  const closePath = PATHS.SLIDE_RAILS.LIST;
  const basePath = "/api/pricing/maintainunitpriceequipment";

  // === Gọi API ===
  const { data: equipmentData = [] } = useApi<Equipment>(
    "/api/catalog/equipment?pageIndex=1&pageSize=10000"
  );
  const { data: allPartsData = [] } = useApi<Part>(
    "/api/catalog/part?pageIndex=1&pageSize=10000"
  );

  const {
    putData,
    fetchById,
    loading: isSubmitting,
  } = useApi<any>(basePath);

  const [isLoadingData, setIsLoadingData] = useState(true);

  // === State ===
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const [partRows, setPartRows] = useState<PartRowData[]>([]);
  
  // State ngày tháng
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // === Memoized Options ===
  const equipmentOptions = useMemo(() => {
    return equipmentData.map((eq) => ({
      value: eq.id,
      label: eq.code,
    }));
  }, [equipmentData]);

  // === Tải dữ liệu ===
  useEffect(() => {
    // ... (Logic tải dữ liệu giữ nguyên)
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

        // BỔ SUNG: Set ngày tháng từ API
        if (fetchedData.startDate) setStartDate(new Date(fetchedData.startDate));
        if (fetchedData.endDate) setEndDate(new Date(fetchedData.endDate));

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
            dinhMucThoiGian: formatLocalFloat(savedData?.replacementTimeStandard),
            soLuongVatTu: formatLocalFloat(savedData?.quantity),
            sanLuongMetLo: formatLocalFloat(savedData?.averageMonthlyTunnelProduction),
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
      cleanValue = value.replace(/\./g, "");
      if (!/^[0-9]*(,[0-9]*)?$/.test(cleanValue)) {
        return;
      }
    }

    const updatedRow = { ...newRows[index], [field]: cleanValue };
    newRows[index] = calculateRowCosts(updatedRow);
    setPartRows(newRows);
  };

  const handleRemoveRow = (indexToRemove: number) => {
    const newRows = partRows.filter((_, index) => index !== indexToRemove);
    setPartRows(newRows);
  };

  // ====== CẬP NHẬT: handleSubmit (LOGIC SỬA ĐÚNG) ======
  const handleSubmit = async () => {
    const equipmentId = selectedEquipmentIds[0];
    if (!equipmentId) {
      alert("⚠️ Vui lòng chọn Mã thiết bị!");
      return;
    }

    // Validation ngày tháng
    if (!startDate) return alert("⚠️ Vui lòng chọn Ngày bắt đầu!");
    if (!endDate) return alert("⚠️ Vui lòng chọn Ngày kết thúc!");
    if (startDate > endDate) return alert("⚠️ Ngày kết thúc không được nhỏ hơn Ngày bắt đầu!");
    if (partRows.length === 0) return alert("⚠️ Vui lòng chọn ít nhất một phụ tùng!");

    const partUnitPrices: PartUnitPriceItem[] = partRows
      .filter((row) => row.id !== null) // Chỉ gửi hàng đã lưu
      .map((row) => ({
        partId: row.partId,
        quantity: parseLocalFloat(row.soLuongVatTu),
        replacementTimeStandard: parseLocalFloat(row.dinhMucThoiGian),
        averageMonthlyTunnelProduction: parseLocalFloat(row.sanLuongMetLo),
      }));

    const payload: PutPayload = {
      equipmentId: equipmentId,
      startDate: startDate.toISOString(), 
      endDate: endDate.toISOString(),     
      partUnitPrices: partUnitPrices,
    };

    console.log("📤 PUT payload:", payload);
    
    // 1. ĐÓNG FORM NGAY LẬP TỨC
    handleClose(); // Sử dụng handleClose để đóng form (unmount)

    try {
        // 2. CHẠY API VÀ CHỜ THÀNH CÔNG
        await putData(payload, undefined); 

        // 3. RELOAD DỮ LIỆU VÀ CHỜ NEXT TICK
        if (onSuccess) {
            await onSuccess(); // Chờ reload dữ liệu bảng cha
        }
        await new Promise(resolve => setTimeout(resolve, 0));

        // 4. HIỆN ALERT THÀNH CÔNG
        alert("✅ Cập nhật đơn giá và định mức thành công!");

    } catch (e: any) {
        // 5. BẮT LỖI và alert thất bại
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        
        let errorMessage = "Đã xảy ra lỗi không xác định.";

        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            
            if (detail.includes("đã tồn tại") || detail.includes("duplicate")) {
                errorMessage = "Dữ liệu đơn giá đã tồn tại trong khoảng thời gian này!";
            } else if (detail.includes("HTTP error") || detail.includes("network")) {
                errorMessage = "Yêu cầu đến máy chủ thất bại. Vui lòng kiểm tra kết nối mạng.";
            } else {
                errorMessage = `Lỗi nghiệp vụ: ${detail}`;
            }
        }
        
        alert(`❌ CẬP NHẬT THẤT BẠI: ${errorMessage}`);
    }
  };

  // BỔ SUNG: Data cho FormRow
  const dateRowData = useMemo(
    () => [
      [
        {
          type: "date" as const,
          label: "Ngày bắt đầu",
          value: startDate,
          onChange: setStartDate,
          placeholder: "Chọn ngày bắt đầu",
        },
        {
          type: "date" as const,
          label: "Ngày kết thúc",
          value: endDate,
          onChange: setEndDate,
          placeholder: "Chọn ngày kết thúc",
        },
      ],
    ],
    [startDate, endDate]
  );

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
        
        {/* BỔ SUNG: Header chứa DatePicker và Select */}
        <div className="layout-input-header1" style={{ position: "fixed", zIndex: 9999999, backgroundColor: "#f1f2f5", width: "755px" }}>
          
          {/* Hàng chọn ngày tháng */}
          <div className="date-row-slot" style={{ marginTop: "0px", marginBottom: "10px" }}>
            <FormRow rows={dateRowData} />
          </div>

          <div className="input-row">
            <label style={{ marginTop: "10px" }}>Mã thiết bị</label>
            <Select
              isMulti
              options={equipmentOptions}
              value={selectedOptions}
              isDisabled={true}
              className="transaction-select-wrapper"
              classNamePrefix="transaction-select"
              placeholder="Chọn Mã thiết bị"
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (provided) => ({ ...provided, zIndex: 999999 }),
              }}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: "180px", // Tăng margin top để tránh bị che
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
              {/* Các trường input giữ nguyên như cũ */}
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

              {/* Các trường nhập liệu */}
              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`dinhMucThoiGian-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  Định mức thời gian thay thế
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text"
                    id={`dinhMucThoiGian-${index}`}
                    name="dinhMucThoiGian"
                    placeholder="Nhập định mức"
                    className="input-text"
                    value={formatInputDisplay(row.dinhMucThoiGian)}
                    onChange={(e) =>
                      handleRowChange(index, "dinhMucThoiGian", e.target.value)
                    }
                    autoComplete="off"
                  />
                  <span className="tooltip-text">
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
                    type="text"
                    id={`soLuongVatTu-${index}`}
                    name="soLuongVatTu"
                    placeholder="Nhập số lượng"
                    className="input-text"
                    value={formatInputDisplay(row.soLuongVatTu)}
                    onChange={(e) =>
                      handleRowChange(index, "soLuongVatTu", e.target.value)
                    }
                    autoComplete="off"
                  />
                  <span className="tooltip-text">
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
                    type="text"
                    id={`sanLuongMetLo-${index}`}
                    name="sanLuongMetLo"
                    placeholder="Nhập sản lượng"
                    className="input-text"
                    value={formatInputDisplay(row.sanLuongMetLo)}
                    onChange={(e) =>
                      handleRowChange(index, "sanLuongMetLo", e.target.value)
                    }
                    autoComplete="off"
                  />
                  <span className="tooltip-text">
                    {formatInputDisplay(row.sanLuongMetLo) || "Chưa nhập"}
                  </span>
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
                    value={row.chiPhiVatTuSCTX}
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