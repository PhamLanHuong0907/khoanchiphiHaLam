import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react"; // SỬA: Thêm useEffect
import { useNavigate } from "react-router-dom";
import Select from "react-select"; // Import react-select
import "../../components/transactionselector.css"; // Import CSS
import PATHS from "../../hooks/path"; // Import PATHS
import { useApi } from "../../hooks/useFetchData"; // Import hook API
import "../../layout/layout_input.css";

// === Định nghĩa interface cho dữ liệu ===
// ... (Interfaces của bạn giữ nguyên) ...
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
  donGiaVatTu: number; // Sẽ lưu SỐ THÔ (number)
  donViTinh: string;
  dinhMucThoiGian: string; // Sẽ lưu chuỗi (vd: "123,4")
  soLuongVatTu: string; // Sẽ lưu chuỗi (vd: "123,4")
  sanLuongMetLo: string; // Sẽ lưu chuỗi (vd: "123,4")
  dinhMucVatTuSCTX: string; // Sẽ lưu chuỗi định dạng (vd: "123,45")
  chiPhiVatTuSCTX: string; // Sẽ lưu chuỗi định dạng (vd: "100.000")
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

// 1. Cập nhật Props (Sửa tên Interface cho đúng)
interface RepairsInputProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function RepairsInput({
  onClose,
  onSuccess,
}: RepairsInputProps) {
  // SỬA TÊN
  const navigate = useNavigate();
  const closePath = PATHS.SLIDE_RAILS.LIST;

  // ====== BẮT ĐẦU SỬA ĐỔI 1: Thêm 3 HÀM TIỆN ÍCH ======
  /**
   * (ĐỊNH MỨC - INPUTS) Chuyển đổi chuỗi (VD: "123,4") sang số (123.4)
   */
  const parseLocalFloat = (str: string | undefined | null): number => {
    if (!str) return 0;
    // 1. Xóa tất cả dấu chấm (ngăn cách hàng nghìn)
    // 2. Thay dấu phẩy (thập phân) bằng dấu chấm
    const cleanStr = str.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanStr || "0");
  };

  /**
   * (CHI PHÍ - OUTPUT) Chuyển đổi số (VD: 100000) thành chuỗi ("100.000")
   */
  const formatNumberForDisplay = (value: number | undefined | null): string => {
    if (value === null || value === undefined) return "0";
    // Dùng 'de-DE' để có dấu chấm (.) ngăn cách hàng nghìn
    // Làm tròn về 0 số thập phân cho chi phí
    return new Intl.NumberFormat("de-DE", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(value);
  };

  /**
   * (ĐỊNH MỨC - OUTPUT) Chuyển đổi số (VD: 123.456) thành chuỗi ("123,456")
   */
  const formatLocalFloat = (value: number | undefined | null): string => {
    if (value === null || value === undefined) return "0";
    // Dùng 'vi-VN' để có dấu phẩy (,) ngăn cách thập phân
    return new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 4, // Giữ nguyên logic cũ
    }).format(value);
  };
  // ====== KẾT THÚC SỬA ĐỔI 1 ======

  // === Gọi API ===
  const { data: equipmentData = [] } = useApi<Equipment>(
    "/api/catalog/equipment?pageIndex=1&pageSize=10000"
  );
  const { data: allPartsData = [] } = useApi<Part>(
    "/api/catalog/part?pageIndex=1&pageSize=10000"
  );

  const { postData, loading: isSubmitting } = useApi<PostPayload>(
    "/api/pricing/maintainunitpriceequipment"
  );

  // === State ===
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>(
    []
  );
  const [partRows, setPartRows] = useState<PartRowData[]>([]);

  // === Memoized Options cho Dropdown ===
  const equipmentOptions = useMemo(() => {
    return equipmentData.map((eq) => ({
      value: eq.id,
      label: eq.code,
    }));
  }, [equipmentData]);

  // SỬA: Xóa Promise.allSettled vì không cần thiết trong file này
  // (File này không có nhiều API như file trước)
  // 7. ====== Load dropdowns (Đã sửa) ======
  useEffect(() => {
    // Không cần fetchAllData phức tạp ở đây
    // Các hook useApi ở trên đã tự động fetch
  }, []); // useEffect rỗng để chạy 1 lần (mặc dù các hook useApi đã tự chạy)

  // === Xử lý sự kiện ===
  const handleClose = () => {
    onClose?.();
    if (!onClose && closePath) navigate(closePath);
  };

  // (Hàm này không thay đổi, nó lưu SỐ THÔ (number) vào state)
  const handleSelectChange = (selected: any) => {
    const newSelectedIds = selected ? selected.map((s: any) => s.value) : [];
    setSelectedEquipmentIds(newSelectedIds);
    const newRows = allPartsData
      .filter((part) => newSelectedIds.includes(part.equipmentId))
      .map(
        (part): PartRowData => ({
          partId: part.id,
          equipmentId: part.equipmentId,
          tenPhuTung: part.name,
          donGiaVatTu: part.costAmmount || 0, // <-- Lưu SỐ THÔ (number)
          donViTinh: part.unitOfMeasureName || "Cái",
          dinhMucThoiGian: "", // <-- Lưu CHUỖI
          soLuongVatTu: "", // <-- Lưu CHUỖI
          sanLuongMetLo: "", // <-- Lưu CHUỖI
          dinhMucVatTuSCTX: "0", // <-- Lưu CHUỖI (đã định dạng)
          chiPhiVatTuSCTX: "0", // <-- Lưu CHUỖI (đã định dạng)
        })
      );
    setPartRows(newRows);
  };

  // ====== BẮT ĐẦU SỬA ĐỔI 2: Cập nhật handleRowChange (cho Định mức) ======
  const handleRowChange = (
    index: number,
    field: keyof PartRowData,
    value: string
  ) => {
    const newRows = [...partRows];
    let cleanValue = value;

    // 1. Áp dụng logic dấu phẩy (,) cho 3 trường nhập liệu
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

    // 2. Cập nhật giá trị "sạch" (cleanValue) vào state
    const updatedRow = { ...newRows[index], [field]: cleanValue };

    // 3. Tính toán lại
    const donGia = updatedRow.donGiaVatTu || 0; // Đọc SỐ THÔ (number)
    // Dùng parseLocalFloat để đọc giá trị từ state (chuỗi có dấu phẩy)
    const dinhMucThoiGian = parseLocalFloat(updatedRow.dinhMucThoiGian);
    const soLuongVatTu = parseLocalFloat(updatedRow.soLuongVatTu);
    const sanLuongMetLo = parseLocalFloat(updatedRow.sanLuongMetLo);

    let dinhMucVatTu = 0;
    // Thêm kiểm tra chia cho 0
    if (sanLuongMetLo !== 0 && dinhMucThoiGian !== 0) {
      dinhMucVatTu = soLuongVatTu / dinhMucThoiGian / sanLuongMetLo;
    }

    const chiPhiVatTu = dinhMucVatTu * donGia;

    // 4. Định dạng kết quả đầu ra
    // Yêu cầu: "Định mức" dùng dấu phẩy (,)
    updatedRow.dinhMucVatTuSCTX = formatLocalFloat(dinhMucVatTu);
    // Yêu cầu: "Chi phí" dùng dấu chấm (.)
    updatedRow.chiPhiVatTuSCTX = formatNumberForDisplay(chiPhiVatTu);

    newRows[index] = updatedRow;
    setPartRows(newRows);
  };
  // ====== KẾT THÚC SỬA ĐỔI 2 ======

  // ====== BẮT ĐẦU SỬA ĐỔI 3: Cập nhật handleSubmit (dùng parseLocalFloat) ======
  const handleSubmit = async () => {
    const costItems: CostItem[] = partRows.map((row) => ({
      equipmentId: row.equipmentId,
      partId: row.partId,
      // Dùng hàm parse mới để chuyển "123,4" (string) -> 123.4 (number)
      quantity: parseLocalFloat(row.soLuongVatTu),
      replacementTimeStandard: parseLocalFloat(row.dinhMucThoiGian),
      averageMonthlyTunnelProduction: parseLocalFloat(row.sanLuongMetLo),
    }));

    // (Validation có thể thêm ở đây nếu muốn)

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
  // ====== KẾT THÚC SỬA ĐỔI 3 ======

  const handleRemoveRow = (indexToRemove: number) => {
    const newRows = partRows.filter((_, index) => index !== indexToRemove);
    setPartRows(newRows);
  };

  const selectedOptions = equipmentOptions.filter((opt) =>
    selectedEquipmentIds.includes(opt.value)
  );

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
              {[{ label: "Tên phụ tùng", name: "tenPhuTung" }].map((item) => (
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

              {/* ====== BẮT ĐẦU SỬA ĐỔI 4: Định dạng Đơn giá vật tư ====== */}
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
                    // SỬA: Dùng hàm format (vì state lưu là number)
                    value={formatNumberForDisplay(row.donGiaVatTu)}
                    readOnly
                    style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                  />
                  <span className="tooltip-text">
                    {/* SỬA: Dùng hàm format */}
                    {formatNumberForDisplay(row.donGiaVatTu)}
                  </span>
                </div>
              </div>
              {/* ====== KẾT THÚC SỬA ĐỔI 4 ====== */}

              {[{ label: "ĐVT", name: "donViTinh" }].map((item) => (
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

              {/* ====== BẮT ĐẦU SỬA ĐỔI 5: Đổi type="number" -> "text" ====== */}
              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`dinhMucThoiGian-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  Định mức thời gian thay thế (tháng)
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text" // SỬA: number -> text
                    id={`dinhMucThoiGian-${index}`}
                    name="dinhMucThoiGian"
                    placeholder="Nhập định mức"
                    className="input-text"
                    value={row.dinhMucThoiGian} // State (string "123,4")
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
              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`soLuongVatTu-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  Số lượng vật tư 1 lần thay thế
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text" // SỬA: number -> text
                    id={`soLuongVatTu-${index}`}
                    name="soLuongVatTu"
                    placeholder="Nhập số lượng"
                    className="input-text"
                    value={row.soLuongVatTu} // State (string "123,4")
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
              <div className="input-row" style={{ width: "120px" }}>
                <label
                  htmlFor={`sanLuongMetLo-${index}`}
                  style={{ textAlign: "center", height: "30px" }}
                >
                  Sản lượng lò đào bình quân (m)
                </label>
                <div className="tooltip-wrapper">
                  <input
                    type="text" // SỬA: number -> text
                    id={`sanLuongMetLo-${index}`}
                    name="sanLuongMetLo"
                    placeholder="Nhập sản lượng"
                    className="input-text"
                    value={row.sanLuongMetLo} // State (string "123,4")
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
              {/* ====== KẾT THÚC SỬA ĐỔI 5 ====== */}

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
                    value={row.chiPhiVatTuSCTX} // Đã được định dạng dấu chấm (.)
                    readOnly
                    style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                  />
                  <span className="tooltip-text">{row.chiPhiVatTuSCTX}</span>
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
