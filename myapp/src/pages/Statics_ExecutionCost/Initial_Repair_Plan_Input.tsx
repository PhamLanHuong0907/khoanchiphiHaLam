import { Calendar, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import "../../components/dropdown_menu_searchable.css";
import "../../components/transactionselector.css";
import PATHS from "../../hooks/path";
import { useApi } from "../../hooks/useFetchData"; // Import hook API
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

interface Props {
  onClose?: () => void;
  selectedId?: number;
  isEditMode?: boolean;
  onSuccess?: () => void;
}

// === COMPONENT ===
export default function InitialRepairPlanInput({
  onClose,
  selectedId,
  isEditMode = false,
  onSuccess,
}: Props) {
  const navigate = useNavigate();
  const closePath = PATHS.SLIDE_RAILS.LIST;

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

  const [productData, setProductData] = useState<ProductData>(
    DEFAULT_EMPTY_PRODUCT
  );

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // === Memoized Options cho Dropdown ===
  const equipmentOptions = useMemo(() => {
    return equipmentData.map((eq) => ({
      value: eq.id,
      label: eq.code,
    }));
  }, [equipmentData]);

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
      }
    }
  }, [selectedId]);

  useEffect(() => {
    // Không cần fetchAllData phức tạp ở đây
    // Các hook useApi ở trên đã tự động fetch
  }, []); // useEffect rỗng để chạy 1 lần (mặc dù các hook useApi đã tự chạy)

  // === XỬ LÝ SỰ KIỆN ===
  const handleClose = () => {
    onClose?.();
    if (!onClose && closePath) navigate(closePath);
  };

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
        onSuccess?.();
        handleClose();
      });
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu:", error);
    }
  };

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

  const handleRemoveRow = (indexToRemove: number) => {
    const newRows = partRows.filter((_, index) => index !== indexToRemove);
    setPartRows(newRows);
  };

  const selectedOptions = equipmentOptions.filter((opt) =>
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
        <div className="header01">Thống kê vận hành / Kế hoạch sản xuất</div>
        <div className="line"></div>
        <div className="header02">
          {isEditMode ? "Chỉnh sửa" : "Tạo mới"} chi phí SCTX kế hoạch
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
              marginBottom: "20px",
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
          <div
            className="input-row"
            style={{ zIndex: 9999, marginBottom: "20px" }}
          >
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

          {/* THAY ĐỔI: Bọc danh sách hàng trong div cuộn */}
          <div
            style={{
              width: "97%",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            {/* THAY ĐỔI: Map qua marketRows thay vì form tĩnh */}
            {partRows.map((row, index) => (
              <div
                key={row.partId} // Dùng partId duy nhất làm key
                style={{
                  display: "flex",
                  gap: "16px",
                  width: "142%", // Giống file mẫu
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

                <div className="input-row" style={{ width: "120px" }}>
                  <label
                    htmlFor={`dinhMucThoiGian-${index}`}
                    style={{ textAlign: "center", height: "30px" }}
                  >
                    Định mức thời gian thay thế (tháng)
                  </label>
                  <div className="tooltip-wrapper">
                    <input
                      type="text"
                      id={`dinhMucThoiGian-${index}`}
                      name="dinhMucThoiGian"
                      placeholder="Nhập định mức"
                      className="input-text"
                      value={row.dinhMucThoiGian}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "dinhMucThoiGian",
                          e.target.value
                        )
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
                      type="text"
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
                <div className="input-row" style={{ width: "120px" }}>
                  <label
                    htmlFor={`sanLuongMetLo-${index}`}
                    style={{ textAlign: "center", height: "30px" }}
                  >
                    Sản lượng lò đào bình quân (m)
                  </label>
                  <div className="tooltip-wrapper">
                    <input
                      type="text"
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
