import { Calendar, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select, { type MultiValue } from "react-select";
import "../../components/dropdown_menu_searchable.css";
import "../../components/transactionselector.css";
import PATHS from "../../hooks/path";
import { useApi } from "../../hooks/useFetchData";
import "../../layout/layout_input.css";

// ==================
// === NGUỒN MOCK (Chỉ cho plan info) ===
// ==================
const MOCK_DATA = {
  // ... (Dữ liệu mock plans, products, editDetails, materialDetails giữ nguyên)
  plans: [
    {
      id: 1,
      productCode: "TN01",
      maNhom: "DL",
      sanluong: 1000,
      thoigian: "1/1/2025-30/1/2025",
    },
    {
      id: 2,
      productCode: "KD01",
      maNhom: "L1",
      sanluong: 2000,
      thoigian: "1/2/2025-28/2/2025",
    },
    {
      id: 3,
      productCode: "EBH52",
      maNhom: "L2",
      sanluong: 1500,
      thoigian: "1/3/2025-31/3/2025",
    },
  ],
  products: {
    TN01: {
      id: "sp1",
      code: "TN01",
      tensp:
        "Lò than 11-1.26 lò chống giá xích chiều dài lò than: 72 m. Các yếu tố TT bằng chiều dài 80 m. Chiều dày vỉa: 9.77 m . Tỷ lệ đá kẹp 23% có trải lưới thép nóc.",
      maNhom: "NCD-01",
      tenNhom: "Nhóm công đoạn Đào lò",
      donViTinh: "mét",
    },
    KD01: {
      id: "sp2",
      code: "KD01",
      tensp:
        "Lò than 11-1.26 lò chống giá xích chiều dài lò than: 72 m. Các yếu tố TT bằng chiều dài 80 m. Chiều dày vỉa: 9.77 m . Tỷ lệ đá kẹp 23% có trải lưới thép nóc.",
      maNhom: "NCD-02",
      tenNhom: "Nhóm công đoạn Khai thác",
      donViTinh: "tấn",
    },
    EBH52: {
      id: "sp3",
      code: "EBH52",
      tensp:
        "Lò than 11-1.26 lò chống giá xích chiều dài lò than: 72 m. Các yếu tố TT bằng chiều dài 80 m. Chiều dày vỉa: 9.77 m . Tỷ lệ đá kẹp 23% có trải lưới thép nóc.",
      maNhom: "NCD-03",
      tenNhom: "Nhóm công đoạn Khai thác than",
      donViTinh: "tấn",
    },
  },
  editDetails: {
    "dn-2025-01": {
      equipmentIds: [
        "2760bfd2-83b6-460b-a49b-21d9ae2c6a1b",
        "3285293b-b158-408b-a27e-4c01b636c04d",
      ],
      costs: [
        {
          equipmentId: "2760bfd2-83b6-460b-a49b-21d9ae2c6a1b",
          soLuongVatTu: 5,
          k1: 0.5,
          k2: 1,
          k3: 0.6,
        },
        {
          equipmentId: "3285293b-b158-408b-a27e-4c01b636c04d",
          soLuongVatTu: 3,
          k1: 0.5,
          k2: 1,
          k3: 0.6,
        },
      ],
    },
    "dn-2025-02": {
      equipmentIds: [
        "2760bfd2-83b6-460b-a49b-21d9ae2c6a1b",
        "3285293b-b158-408b-a27e-4c01b636c04d",
      ],
      costs: [
        {
          equipmentId: "2760bfd2-83b6-460b-a49b-21d9ae2c6a1b",
          soLuongVatTu: 5,
          k1: 0.5,
          k2: 1,
          k3: 0.6,
        },
        {
          equipmentId: "3285293b-b158-408b-a27e-4c01b636c04d",
          soLuongVatTu: 3,
          k1: 0.5,
          k2: 1,
          k3: 0.6,
        },
      ],
    },
  },
  materialDetails: {
    "dn-2025-01": {
      thoigianbatdau: "1/1/2025",
      thoigianketthuc: "30/1/2025",
    },
    "dn-2025-02": {
      thoigianbatdau: "1/2/2025",
      thoigianketthuc: "28/2/2025",
    },
  },
};

const MOCK_K_OPTIONS = [0.9, 0.6, 0.5, 1];

// **THAY ĐỔI**: Định nghĩa các kiểu (type) cho key của MOCK_DATA
type ProductCode = keyof typeof MOCK_DATA.products;
type DetailKey = keyof typeof MOCK_DATA.editDetails;
type MaterialDetailKey = keyof typeof MOCK_DATA.materialDetails;

// ==================
// === INTERFACES ===
// ==================
interface ProductData {
  id: string;
  // **THAY ĐỔI**: Thêm productCode vào state
  productCode: ProductCode | "";
  maNhom: string;
  tenNhom: string;
  donViTinh: string;
  sanLuong: string;
}

const DEFAULT_EMPTY_PRODUCT: ProductData = {
  id: "",
  // **THAY ĐỔI**: Khởi tạo
  productCode: "",
  maNhom: "",
  tenNhom: "",
  donViTinh: "",
  sanLuong: "",
};

// ... (Các interface khác giữ nguyên)
// Interface cho API GET /api/catalog/equipment (danh sách)
interface EquipmentListItem {
  id: string;
  code: string;
}

// Interface cho costs lồng nhau
interface EquipmentCost {
  startDate: string;
  endDate: string;
  costType: number;
  amount: number;
}

// Interface cho API GET /api/catalog/equipment/{id} (chi tiết)
interface EquipmentDetail {
  id: string;
  code: string;
  name: string;
  unitOfMeasureId: string;
  unitOfMeasureName: string;
  costs: EquipmentCost[];
}

// Interface cho dữ liệu mock 'costs'
interface MockSavedCost {
  equipmentId: string;
  soLuongVatTu: number;
  k1: number;
  k2: number;
  k3: number;
}

interface EquipmentRowData {
  equipmentId: string;
  tenThietBi: string;
  donViTinh: string;
  donGiaDienNang: number | null;
  soLuongVatTu: number;
  k1: number | null;
  k2: number | null;
  k3: number | null;
  chiPhiDienNangKeHoach: number;
}

interface CostItem {
  equipmentId: string;
  quantity: number;
  k1?: number;
  k2?: number;
  k3?: number;
}
interface PostPayload {
  costs: CostItem[];
}
interface Props {
  onClose?: () => void;
  selectedId?: number;
  subRowId?: string;
  isEditMode?: boolean;
  onSuccess?: () => void;
}

// Thêm kiểu dữ liệu cho react-select
type EquipmentOptionType = {
  value: string;
  label: string;
};

// Thêm kiểu dữ liệu cho các trường số trong bảng
type NumericEquipmentRowKeys = "soLuongVatTu" | "k1" | "k2" | "k3";

export default function InitialElectricityPlanInput({
  onClose,
  selectedId,
  subRowId,
  isEditMode = false,
  onSuccess,
}: Props) {
  const navigate = useNavigate();
  const closePath = PATHS.SLIDE_RAILS.LIST;

  // Format VND
  const formatVND = (value: number | undefined | null): string => {
    if (value === null || value === undefined || isNaN(value)) return "0";
    return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(
      value
    );
  };

  // API hooks
  const { data: equipmentListData = [] } = useApi<EquipmentListItem>(
    "/api/catalog/equipment?pageIndex=1&pageSize=10000"
  );
  const { fetchById: getEquipmentDetail, loading: isLoadingRows } =
    useApi<EquipmentDetail>("/api/catalog/equipment");
  const { postData, loading: isSubmitting } = useApi<PostPayload>(
    "/api/pricing/electricityunitpriceequipment"
  );

  // State
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>(
    []
  );
  const [equipmentRows, setEquipmentRows] = useState<EquipmentRowData[]>([]);
  const [productData, setProductData] = useState<ProductData>(
    DEFAULT_EMPTY_PRODUCT
  );
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const equipmentOptions = useMemo(
    (): EquipmentOptionType[] =>
      equipmentListData.map((eq) => ({
        value: eq.id,
        label: eq.code,
      })),
    [equipmentListData]
  );

  // Load plan info
  // Load plan info
  // Load plan info
  useEffect(() => {
    if (selectedId) {
      const row = MOCK_DATA.plans.find((r) => r.id === selectedId);
      if (row) {
        // --- 1. Product Logic ---
        const productCode = row.productCode as ProductCode;
        if (productCode in MOCK_DATA.products) {
          const product = MOCK_DATA.products[productCode];
          setProductData({
            id: product.id,
            productCode: productCode,
            maNhom: row.maNhom,
            tenNhom: product.tenNhom,
            donViTinh: product.donViTinh,
            sanLuong: row.sanluong.toString(),
          });
        }

        // --- 2. Date Logic (Đã sửa Lỗi 2538) ---
        let foundStartDate: Date | null = null;
        let foundEndDate: Date | null = null;

        // Ưu tiên 1: Thử lấy từ 'materialDetails'
        // KIỂM TRA QUAN TRỌNG: "if (subRowId && ...)"
        // Lỗi 2538 của bạn là do thiếu kiểm tra "subRowId" ở đây.
        if (subRowId && subRowId in MOCK_DATA.materialDetails) {
          const saved =
            MOCK_DATA.materialDetails[subRowId as MaterialDetailKey];
          foundStartDate = new Date(
            saved.thoigianbatdau.split("/").reverse().join("-")
          );
          foundEndDate = new Date(
            saved.thoigianketthuc.split("/").reverse().join("-")
          );
        }
        // Ưu tiên 2: Nếu không có, lấy từ 'plans.thoigian' (fallback)
        else if (row.thoigian) {
          const parts = row.thoigian.split("-");
          if (parts.length === 2) {
            const startDateStr = parts[0]; // "1/1/2025"
            const endDateStr = parts[1]; // "30/1/2025"
            foundStartDate = new Date(
              startDateStr.split("/").reverse().join("-")
            );
            foundEndDate = new Date(
              endDateStr.split("/").reverse().join("-")
            );
          }
        }

        // Set state một lần
        setStartDate(foundStartDate);
        setEndDate(foundEndDate);
      }
    }
  }, [selectedId, subRowId]); // <-- Phải có cả selectedId và subRowId
  const editLoadedRef = useRef<Record<string, boolean>>({});
  // Edit mode: load saved data
  useEffect(() => {
    if (!isEditMode || !subRowId) return;

    if (editLoadedRef.current[subRowId]) return;

    // **THAY ĐỔI**: Dùng type guard 'in'
    if (subRowId in MOCK_DATA.editDetails) {
      const editData = MOCK_DATA.editDetails[subRowId as DetailKey];

      // Đánh dấu đã load cho subRowId này
      editLoadedRef.current[subRowId] = true;

      setSelectedEquipmentIds(editData.equipmentIds);

      // gọi load (hàm này dùng getEquipmentDetail bên ngoài)
      loadEquipmentDetailsForIds(editData.equipmentIds, editData.costs);
    }

    // Chỉ phụ thuộc vào isEditMode và subRowId để chạy khi 2 giá trị này thay đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, subRowId]);

  // Helper to load details for equipment IDs
  const loadEquipmentDetailsForIds = async (
    ids: string[],
    savedCosts: MockSavedCost[]
  ) => {
    try {
      const detailPromises = ids.map((id) => getEquipmentDetail(id));
      const details = await Promise.all(detailPromises);
      const validDetails = details.filter(
        (eq): eq is EquipmentDetail => eq !== null
      );

      const loadedRows: EquipmentRowData[] = validDetails.map((eq) => {
        const saved = savedCosts.find((c) => c.equipmentId === eq.id);
        const electricCostObj = eq.costs?.find((c) => c.costType === 2);
        const donGia = electricCostObj ? electricCostObj.amount : 0;

        const row: EquipmentRowData = {
          equipmentId: eq.id,
          tenThietBi: eq.name || eq.code || "Không tìm thấy",
          donViTinh: eq.unitOfMeasureName || "Cái",
          donGiaDienNang: donGia,
          soLuongVatTu: saved?.soLuongVatTu || 0,
          k1: saved?.k1 ?? null,
          k2: saved?.k2 ?? null,
          k3: saved?.k3 ?? null,
          chiPhiDienNangKeHoach: 0,
        };
        row.chiPhiDienNangKeHoach = computeRowCost(row);
        return row;
      });
      setEquipmentRows(loadedRows);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết thiết bị edit:", error);
    }
  };

  const handleClose = () => {
    onClose?.();
    if (!onClose && closePath) navigate(closePath);
  };

  const computeRowCost = (r: EquipmentRowData): number => {
    const sl = r.soLuongVatTu ?? 0;
    const dg = r.donGiaDienNang ?? 0;
    const k1_val = r.k1 ?? 0;
    const k2_val = r.k2 ?? 0;
    const k3_val = r.k3 ?? 0;
    const productK = k1_val * k2_val * k3_val;
    const rawCost = sl * productK * dg;
    return Math.round(rawCost);
  };

  const handleSubmit = async () => {
    const costItems: CostItem[] = equipmentRows.map((row) => ({
      equipmentId: row.equipmentId,
      quantity: row.soLuongVatTu,
      k1: row.k1 ?? 0,
      k2: row.k2 ?? 0,
      k3: row.k3 ?? 0,
    }));

    const payload: PostPayload = { costs: costItems };
    try {
      await postData(payload, () => {
        onSuccess?.();
        handleClose();
      });
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu:", error);
    }
  };

  const handleSelectChange = async (
    selected: MultiValue<EquipmentOptionType>
  ) => {
    const newSelectedIds: string[] = selected ? selected.map((s) => s.value) : [];

    const previousIds = selectedEquipmentIds;
    const newlyAddedIds = newSelectedIds.filter(
      (id) => !previousIds.includes(id)
    );

    setSelectedEquipmentIds(newSelectedIds);

    if (newlyAddedIds.length === 0) {
      const preserved = equipmentRows.filter((row) =>
        newSelectedIds.includes(row.equipmentId)
      );
      setEquipmentRows(preserved);
      return;
    }

    try {
      const detailPromises = newlyAddedIds.map((id) => getEquipmentDetail(id));
      const details = await Promise.all(detailPromises);
      const validDetails = details.filter(
        (eq): eq is EquipmentDetail => eq !== null
      );

      // **THAY ĐỔI**: Dùng type guard 'in'
      const savedCosts: MockSavedCost[] =
        isEditMode &&
        subRowId &&
        subRowId in MOCK_DATA.editDetails
          ? MOCK_DATA.editDetails[subRowId as DetailKey].costs
          : [];

      const newRows = validDetails
        .filter((eq) => {
          const existingIds = new Set(equipmentRows.map((r) => r.equipmentId));
          return !existingIds.has(eq.id);
        })
        .map((eq): EquipmentRowData => {
          const saved = savedCosts.find((c) => c.equipmentId === eq.id);
          const electricCostObj = eq.costs?.find((c) => c.costType === 2);
          const donGia = electricCostObj ? electricCostObj.amount : 0;

          const row: EquipmentRowData = {
            equipmentId: eq.id,
            tenThietBi: eq.name || eq.code || "Không tên",
            donViTinh: eq.unitOfMeasureName || "Cái",
            donGiaDienNang: donGia,
            soLuongVatTu: saved?.soLuongVatTu || 0,
            k1: saved?.k1 ?? null,
            k2: saved?.k2 ?? null,
            k3: saved?.k3 ?? null,
            chiPhiDienNangKeHoach: 0,
          };
          row.chiPhiDienNangKeHoach = computeRowCost(row);
          return row;
        });

      const preservedRows = equipmentRows.filter((row) =>
        newSelectedIds.includes(row.equipmentId)
      );

      setEquipmentRows([...preservedRows, ...newRows]);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết thiết bị:", error);
    }
  };

  const handleRemoveRow = (indexToRemove: number) =>
    setEquipmentRows((prev) => prev.filter((_, i) => i !== indexToRemove));

  const handleRowNumberChange = (
    index: number,
    field: NumericEquipmentRowKeys,
    value: number | null
  ) => {
    setEquipmentRows((prev) => {
      const newRows = [...prev];
      const row = { ...newRows[index] };

      if (field === "soLuongVatTu") {
        row.soLuongVatTu = value ?? 0;
      } else {
        row[field] = value;
      }

      row.chiPhiDienNangKeHoach = computeRowCost(row);
      newRows[index] = row;
      return newRows;
    });
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
          Thống kê vận hành / Chi phí điện năng kế hoạch ban đầu
        </div>
        <div className="line"></div>
        <div className="header02">
          {isEditMode ? "Chỉnh sửa" : "Tạo mới"} chi phí điện năng kế hoạch ban
          đầu
        </div>
      </div>

      <div className="layout-input-body">
        {/* ... (Phần Thời gian không đổi) */}
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

        {/* Thông tin sản phẩm */}
        <div
          className="sticky-headerGroup"
          style={{ background: "#f1f2f5", paddingTop: 5 }}
        >
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "nowrap",
              alignItems: "flex-end",
              overflowX: "auto",
              minWidth: "700px",
              width: "95%",
            }}
          >
            <div className="input-row" style={{ marginBottom: 20, flex: 1 }}>
              <label>Mã sản phẩm</label>
              <input
                type="text"
                className="input-text"
                // **THAY ĐỔI**: Đọc từ productData.productCode
                value={
                  productData.productCode &&
                  productData.productCode in MOCK_DATA.products
                    ? MOCK_DATA.products[productData.productCode].code
                    : ""
                }
                disabled
                style={{ backgroundColor: "#f1f2f5" }}
              />
            </div>

            <div className="input-row" style={{ marginBottom: 20, flex: 1 }}>
              <label>Tên sản phẩm</label>
              <input
                type="text"
                className="input-text"
                // **THAY ĐỔI**: Đọc từ productData.productCode
                value={
                  productData.productCode &&
                  productData.productCode in MOCK_DATA.products
                    ? MOCK_DATA.products[productData.productCode].tensp
                    : ""
                }
                disabled
                style={{ backgroundColor: "#f1f2f5" }}
              />
            </div>
          </div>
          {/* ... (Các input Mã nhóm, Nhóm CĐSX, Sản lượng, ĐVT không đổi) */}
          <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <div className="input-row" style={{ width: 150 }}>
              <label>Mã nhóm CĐSX</label>
              <input
                type="text"
                className="input-text"
                value={productData.maNhom}
                readOnly
                style={{ backgroundColor: "#f1f2f5" }}
              />
            </div>
            <div className="input-row" style={{ width: 220 }}>
              <label>Nhóm CĐSX</label>
              <input
                type="text"
                className="input-text"
                value={productData.tenNhom}
                readOnly
                style={{ backgroundColor: "#f1f2f5" }}
              />
            </div>
            <div className="input-row" style={{ width: 150 }}>
              <label>Sản lượng</label>
              <input
                type="text"
                className="input-text"
                value={productData.sanLuong}
                readOnly
                style={{ backgroundColor: "#f1f2f5" }}
              />
            </div>
            <div className="input-row" style={{ width: 150 }}>
              <label>ĐVT</label>
              <input
                type="text"
                className="input-text"
                value={productData.donViTinh}
                readOnly
                style={{ backgroundColor: "#f1f2f5" }}
              />
            </div>
          </div>

          {/* ... (Select thiết bị không đổi) */}
          <div className="input-row" style={{ zIndex: 9999, marginBottom: 20 }}>
            <label>Mã thiết bị</label>
            <Select
              isMulti
              options={equipmentOptions}
              value={selectedOptions}
              onChange={handleSelectChange}
              className="transaction-select-wrapper"
              classNamePrefix="transaction-select"
              placeholder="Chọn Mã thiết bị"
              isDisabled={isLoadingRows}
              menuPortalTarget={document.body}
              styles={{ menuPortal: (p) => ({ ...p, zIndex: 999999 }) }}
            />
          </div>

          {/* ... (Danh sách thiết bị không đổi) */}
          <div style={{ width: "97%", maxHeight: 400, overflowY: "auto" }}>
            {isLoadingRows && (
              <div style={{ textAlign: "center", padding: "20px" }}>
                Đang tải dữ liệu thiết bị...
              </div>
            )}
            {!isLoadingRows &&
              equipmentRows.map((row, index) => (
                <div
                  key={row.equipmentId}
                  style={{
                    display: "flex",
                    gap: 16,
                    width: "max-content",
                    flexWrap: "wrap",
                    marginBottom: 20,
                    borderBottom: "1px dashed #ccc",
                    paddingBottom: 12,
                  }}
                >
                  {/* Tên thiết bị */}
                  <div className="input-row" style={{ width: 100, margin: 0 }}>
                    <label style={{ textAlign: "center", height: 30 }}>
                      Tên thiết bị
                    </label>
                    <div className="tooltip-wrapper">
                      <input
                        type="text"
                        className="input-text"
                        value={row.tenThietBi}
                        readOnly
                        style={{ backgroundColor: "#f1f2f5" }}
                      />
                      <span className="tooltip-text">{row.tenThietBi}</span>
                    </div>
                  </div>

                  {/* ĐVT */}
                  <div className="input-row" style={{ width: 80, margin: 0 }}>
                    <label style={{ textAlign: "center", height: 30 }}>
                      ĐVT
                    </label>
                    <div className="tooltip-wrapper">
                      <input
                        type="text"
                        className="input-text"
                        value={row.donViTinh}
                        readOnly
                        style={{ backgroundColor: "#f1f2f5" }}
                      />
                      <span className="tooltip-text">{row.donViTinh}</span>
                    </div>
                  </div>

                  {/* Đơn giá điện năng */}
                  <div className="input-row" style={{ width: 130, margin: 0 }}>
                    <label style={{ textAlign: "center", height: 30 }}>
                      Đơn giá điện năng
                    </label>
                    <div className="tooltip-wrapper">
                      <input
                        type="text"
                        className="input-text"
                        value={formatVND(row.donGiaDienNang)}
                        readOnly
                        style={{ backgroundColor: "#f1f2f5" }}
                      />
                      <span className="tooltip-text">
                        {formatVND(row.donGiaDienNang)}
                      </span>
                    </div>
                  </div>

                  {/* Số lượng */}
                  <div className="input-row" style={{ width: 120, margin: 0 }}>
                    <label style={{ textAlign: "center", height: 30 }}>
                      Số lượng
                    </label>
                    <div className="tooltip-wrapper">
                      <input
                        type="number"
                        className="input-text"
                        value={row.soLuongVatTu || ""}
                        onChange={(e) => {
                          const val =
                            e.target.value === ""
                              ? 0
                              : parseFloat(e.target.value);
                          handleRowNumberChange(
                            index,
                            "soLuongVatTu",
                            isNaN(val) ? 0 : val
                          );
                        }}
                        min="0"
                        step="any"
                      />
                      <span className="tooltip-text">
                        {row.soLuongVatTu || 0}
                      </span>
                    </div>
                  </div>

                  {/* K1-K3 */}
                  {["k1", "k2", "k3"].map((kKey) => (
                    <div
                      key={kKey}
                      className="input-row"
                      style={{ width: 70, margin: 0 }}
                    >
                      <label style={{ textAlign: "center", height: 30 }}>
                        {kKey.toUpperCase()}
                      </label>
                      <div className="tooltip-wrapper">
                        <select
                          className="input-text"
                          value={row[kKey as keyof EquipmentRowData] ?? ""}
                          onChange={(e) =>
                            handleRowNumberChange(
                              index,
                              kKey as NumericEquipmentRowKeys,
                              e.target.value === ""
                                ? null
                                : parseFloat(e.target.value)
                            )
                          }
                        >
                          <option value="">Chọn</option>
                          {MOCK_K_OPTIONS.map((k) => (
                            <option key={k} value={k}>
                              {k}
                            </option>
                          ))}
                        </select>
                        <span className="tooltip-text">
                          {row[kKey as keyof EquipmentRowData] ?? "Chưa chọn"}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Chi phí điện năng kế hoạch */}
                  <div className="input-row" style={{ width: 150, margin: 0 }}>
                    <label style={{ textAlign: "center", height: 30 }}>
                      Chi phí điện năng kế hoạch ban đầu
                    </label>
                    <div className="tooltip-wrapper">
                      <input
                        type="text"
                        className="input-text"
                        value={formatVND(row.chiPhiDienNangKeHoach)}
                        readOnly
                        style={{ backgroundColor: "#f1f2f5" }}
                      />
                      <span className="tooltip-text">
                        {formatVND(row.chiPhiDienNangKeHoach)}
                      </span>
                    </div>
                  </div>

                  {/* Nút xóa */}
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
      </div>

      <div className="layout-input-footer">
        <button className="btn-cancel" onClick={handleClose}>
          Hủy
        </button>
        <button
          className="btn-confirm"
          onClick={handleSubmit}
          disabled={isSubmitting || isLoadingRows}
        >
          {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
        </button>
      </div>
    </div>
  );
}