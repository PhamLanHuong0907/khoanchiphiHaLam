import { Calendar, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import "../../components/dropdown_menu_searchable.css";
import "../../components/transactionselector.css";
import PATHS from "../../hooks/path";
import { useApi } from "../../hooks/useFetchData";
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
      maNhom: "NCD-01",
      tenNhom: "Nhóm công đoạn Đào lò",
      donViTinh: "mét",
    },
    KD01: {
      id: "sp2",
      code: "KD01",
      maNhom: "NCD-02",
      tenNhom: "Nhóm công đoạn Khai thác",
      donViTinh: "tấn",
    },
    EBH52: {
      id: "sp3",
      code: "EBH52",
      maNhom: "NCD-03",
      tenNhom: "Nhóm công đoạn Khai thác than",
      donViTinh: "tấn",
    },
  },

  editDetails: {
    "sctx-2025-01": {
      equipmentIds: [
        "2760bfd2-83b6-460b-a49b-21d9ae2c6a1b",
        "3285293b-b158-408b-a27e-4c01b636c04d",
        "0278a259-ff3f-4122-883f-fcf26b029072",
      ], // thiết bị đã chọn
      costs: [
        {
          partId: "1da363de-ebd1-44cf-b481-950bf067e552",
          equipmentId: "2760bfd2-83b6-460b-a49b-21d9ae2c6a1b",
          soLuongVatTu: 5,
          k1: 0.5,
          k2: 1,
          k3: 0.6,
          k4: 1,
          k5: 0.9,
          k6: 1,
          k7: 0.5,
        },
        {
          partId: "1fb6dd38-6eb0-46e2-a48c-7e6eb0157522",
          equipmentId: "3285293b-b158-408b-a27e-4c01b636c04d",
          soLuongVatTu: 3,
          k1: 0.5,
          k2: 1,
          k3: 0.6,
          k4: 1,
          k5: 0.9,
          k6: 1,
          k7: 0.5,
        },
        {
          partId: "2aa7bf03-234b-474d-b7be-29bb1b0038ea",
          equipmentId: "0278a259-ff3f-4122-883f-fcf26b029072",
          soLuongVatTu: 10,
          k1: 0.5,
          k2: 1,
          k3: 0.6,
          k4: 1,
          k5: 0.9,
          k6: 1,
          k7: 0.5,
        },
      ],
    },
    "sctx-2025-02": {
      equipmentIds: ["2760bfd2-83b6-460b-a49b-21d9ae2c6a1b"],
      costs: [
        {
          partId: "1da363de-ebd1-44cf-b481-950bf067e552",
          equipmentId: "2760bfd2-83b6-460b-a49b-21d9ae2c6a1b",
          soLuongVatTu: 5,
          k1: 0.5,
          k2: 1,
          k3: 0.6,
          k4: 1,
          k5: 0.9,
          k6: 1,
          k7: 0.5,
        },
      ],
    },
  },
};

// Mock coefficients for K1..K7 (float list)
const MOCK_K_OPTIONS = [0.9, 0.6, 0.5, 1];

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
}

interface Part {
  id: string;
  name: string;
  equipmentId: string;
  unitOfMeasureName?: string;
  costAmmount?: number;
}

interface PartRowData {
  partId: string;
  equipmentId: string;
  tenPhuTung: string;
  donGiaVatTu: number;
  donViTinh: string;
  dinhMucThoiGian: string;
  soLuongVatTu: number;
  sanLuongMetLo: string;
  k1: number | null;
  k2: number | null;
  k3: number | null;
  k4: number | null;
  k5: number | null;
  k6: number | null;
  k7: number | null;
  unitPriceInput: number | null;
  chiPhiSCTXKeHoach: number | null;
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
  subRowId?: string;
  isEditMode?: boolean;
  onSuccess?: () => void;
}

export default function InitialElectricityPlanInput({
  onClose,
  selectedId,
  subRowId,
  isEditMode = false,
  onSuccess,
}: Props) {
  const navigate = useNavigate();
  const closePath = PATHS.SLIDE_RAILS.LIST;

  // Hàm format số kiểu Việt Nam: 1.234.567
  const formatVND = (value: number | undefined | null): string => {
    if (value === null || value === undefined || isNaN(value)) return "0";
    return new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 0,
    }).format(value);
  };

  const parseLocalFloat = (str: string | undefined | null): number => {
    if (str === undefined || str === null) return 0;
    const cleanStr = String(str).replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanStr || "0") || 0;
  };

  // API hooks
  const { data: equipmentData = [] } = useApi<Equipment>(
    "/api/catalog/equipment?pageIndex=1&pageSize=10000"
  );
  const { data: allPartsData = [] } = useApi<Part>(
    "/api/catalog/part?pageIndex=1&pageSize=10000"
  );
  const { postData, loading: isSubmitting } = useApi<PostPayload>(
    "/api/pricing/maintainunitpriceequipment"
  );

  // state
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>(
    []
  );
  const [partRows, setPartRows] = useState<PartRowData[]>([]);
  const [productData, setProductData] = useState<ProductData>(
    DEFAULT_EMPTY_PRODUCT
  );
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const equipmentOptions = useMemo(
    () => equipmentData.map((eq) => ({ value: eq.id, label: eq.code })),
    [equipmentData]
  );

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

  // CHỈNH SỬA: Load dữ liệu chi tiết khi isEditMode
  useEffect(() => {
    if (
      isEditMode &&
      subRowId &&
      selectedId &&
      MOCK_DATA.editDetails[subRowId]
    ) {
      const editData = MOCK_DATA.editDetails[subRowId];

      setSelectedEquipmentIds(editData.equipmentIds);

      const savedCosts = editData.costs;

      const loadedRows: PartRowData[] = savedCosts.map((saved) => {
        const partInfo = allPartsData.find((p) => p.id === saved.partId);
        if (!partInfo) {
          return {
            partId: saved.partId,
            equipmentId: saved.equipmentId,
            tenPhuTung: "Không tìm thấy phụ tùng",
            donGiaVatTu: 0,
            donViTinh: "",
            dinhMucThoiGian: "",
            soLuongVatTu: saved.soLuongVatTu,
            sanLuongMetLo: "",
            k1: saved.k1 ?? null,
            k2: saved.k2 ?? null,
            k3: saved.k3 ?? null,
            k4: saved.k4 ?? null,
            k5: saved.k5 ?? null,
            k6: saved.k6 ?? null,
            k7: saved.k7 ?? null,
            unitPriceInput: 0,
            chiPhiSCTXKeHoach: null,
          };
        }

        const row: PartRowData = {
          partId: partInfo.id,
          equipmentId: partInfo.equipmentId,
          tenPhuTung: partInfo.name,
          donGiaVatTu: partInfo.costAmmount || 0,
          donViTinh: partInfo.unitOfMeasureName || "",
          dinhMucThoiGian: "",
          soLuongVatTu: saved.soLuongVatTu,
          sanLuongMetLo: "",
          k1: saved.k1 ?? null,
          k2: saved.k2 ?? null,
          k3: saved.k3 ?? null,
          k4: saved.k4 ?? null,
          k5: saved.k5 ?? null,
          k6: saved.k6 ?? null,
          k7: saved.k7 ?? null,
          unitPriceInput: partInfo.costAmmount || null,
          chiPhiSCTXKeHoach: null,
        };

        row.chiPhiSCTXKeHoach = computeRowCost(row);
        return row;
      });

      setPartRows(loadedRows);
    }
  }, [isEditMode, subRowId, selectedId, allPartsData]);

  const handleClose = () => {
    onClose?.();
    if (!onClose && closePath) navigate(closePath);
  };

  const computeRowCost = (r: PartRowData): number | null => {
    if (!r.soLuongVatTu || r.soLuongVatTu <= 0) return null;
    const ks = [r.k1, r.k2, r.k3, r.k4, r.k5, r.k6, r.k7];
    if (ks.some((v) => v === null || v === undefined)) return null;
    if (!r.unitPriceInput || r.unitPriceInput <= 0) return null;

    const productK = ks.reduce((acc: number, cur) => acc * (cur as number), 1);
    if (productK === null) return null;
    const rawCost = r.soLuongVatTu * productK * (r.unitPriceInput as number);
    console.log("Computed cost for row:", r.partId, "=", rawCost);
    return Math.round(rawCost); // Làm tròn lên thành số nguyên
  };

  const handleSubmit = async () => {
    const costItems: CostItem[] = partRows.map((row) => ({
      equipmentId: row.equipmentId,
      partId: row.partId,
      quantity: row.soLuongVatTu,
      replacementTimeStandard: parseLocalFloat(row.dinhMucThoiGian),
      averageMonthlyTunnelProduction: parseLocalFloat(row.sanLuongMetLo),
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

  const handleSelectChange = (selected: any) => {
    const newSelectedIds: string[] = selected
      ? selected.map((s: any) => s.value)
      : [];

    // 1. Tìm các equipment MỚI (có trong newSelectedIds nhưng không có trong selectedEquipmentIds cũ)
    const previousSelectedIds = selectedEquipmentIds;
    const newlyAddedEquipmentIds = newSelectedIds.filter(
      (id) => !previousSelectedIds.includes(id)
    );

    // Cập nhật state thiết bị
    setSelectedEquipmentIds(newSelectedIds);

    // Nếu không có equipment mới → chỉ giữ lại các dòng hiện có (và xóa nếu bỏ chọn)
    if (newlyAddedEquipmentIds.length === 0) {
      // Chỉ giữ lại các dòng thuộc thiết bị vẫn còn được chọn
      const preservedRows = partRows.filter((row) =>
        newSelectedIds.includes(row.equipmentId)
      );
      setPartRows(preservedRows);
      return;
    }

    // 2. Chỉ lấy phụ tùng của các equipment MỚI thêm vào
    const existingPartIds = new Set(partRows.map((r) => r.partId));

    const newRowsFromSelection = allPartsData
      .filter((part) => {
        return (
          newlyAddedEquipmentIds.includes(part.equipmentId) && // CHỈ equipment mới
          !existingPartIds.has(part.id) // chưa từng có
        );
      })
      .map((part): PartRowData => {
        // Ưu tiên lấy dữ liệu cũ nếu có (trong edit mode)
        let savedCost = null;
        if (isEditMode && selectedId && MOCK_DATA.editDetails[selectedId]) {
          savedCost = MOCK_DATA.editDetails[selectedId].costs.find(
            (c) => c.partId === part.id
          );
        }

        const row: PartRowData = {
          partId: part.id,
          equipmentId: part.equipmentId,
          tenPhuTung: part.name,
          donGiaVatTu: part.costAmmount || 0,
          donViTinh: part.unitOfMeasureName || "Cái",
          dinhMucThoiGian: "",
          soLuongVatTu: savedCost?.soLuongVatTu || 0,
          sanLuongMetLo: "",
          k1: savedCost?.k1 ?? null,
          k2: savedCost?.k2 ?? null,
          k3: savedCost?.k3 ?? null,
          k4: savedCost?.k4 ?? null,
          k5: savedCost?.k5 ?? null,
          k6: savedCost?.k6 ?? null,
          k7: savedCost?.k7 ?? null,
          unitPriceInput: part.costAmmount || null,
          chiPhiSCTXKeHoach: null,
        };

        row.chiPhiSCTXKeHoach = computeRowCost(row);
        return row;
      });

    // 3. Giữ lại tất cả dòng cũ + thêm dòng mới từ equipment mới
    const preservedRows = partRows.filter((row) =>
      newSelectedIds.includes(row.equipmentId)
    );

    setPartRows([...preservedRows, ...newRowsFromSelection]);
  };

  const handleRemoveRow = (indexToRemove: number) =>
    setPartRows((prev) => prev.filter((_, i) => i !== indexToRemove));

  const handleRowNumberChange = (
    index: number,
    field: keyof PartRowData,
    value: number | null
  ) => {
    setPartRows((prev) => {
      const newRows = [...prev];
      const row = { ...newRows[index] };
      (row as any)[field] = value;
      row.chiPhiSCTXKeHoach = computeRowCost(row);
      newRows[index] = row;
      return newRows;
    });
  };

  const handleRowStringChange = (
    index: number,
    field: keyof PartRowData,
    value: string
  ) => {
    setPartRows((prev) => {
      const newRows = [...prev];
      const row = { ...newRows[index], [field]: value };
      row.chiPhiSCTXKeHoach = computeRowCost(row);
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
        <div className="header01">Thống kê vận hành / Kế hoạch sản xuất</div>
        <div className="line"></div>
        <div className="header02">
          {isEditMode ? "Chỉnh sửa" : "Tạo mới"} chi phí điện năng kế hoạch
        </div>
      </div>

      <div className="layout-input-body">
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

        <div
          className="sticky-headerGroup"
          style={{
            position: "sticky",
            left: 0,
            zIndex: 1002,
            background: "#f1f2f5",
            paddingTop: 5,
          }}
        >
          <div className="input-row" style={{ marginBottom: 20 }}>
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

          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "nowrap",
              alignItems: "flex-end",
              overflowX: "auto",
              minWidth: 700,
              marginBottom: 20,
            }}
          >
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
                disabled
                style={{ backgroundColor: "#f1f2f5" }}
                placeholder="Chọn ĐVT..."
              />
            </div>
          </div>

          <div className="input-row" style={{ zIndex: 9999, marginBottom: 20 }}>
            <label>Mã thiết bị</label>
            <Select
              isMulti
              options={equipmentOptions}
              value={selectedEquipmentIds
                .map((id) => equipmentOptions.find((o) => o.value === id))
                .filter(Boolean)}
              onChange={handleSelectChange}
              className="transaction-select-wrapper"
              classNamePrefix="transaction-select"
              placeholder="Chọn Mã thiết bị"
              menuPortalTarget={document.body}
              styles={{ menuPortal: (p) => ({ ...p, zIndex: 999999 }) }}
            />
          </div>

          <div style={{ width: "97%", maxHeight: 400, overflowY: "auto" }}>
            {partRows.map((row, index) => (
              <div
                key={row.partId}
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
                <div className="input-row" style={{ width: 100, margin: 0 }}>
                  <label
                    style={{
                      display: "flex",
                      textAlign: "center",
                      height: 30,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Tên phụ tùng
                  </label>
                  <div className="tooltip-wrapper">
                    <input
                      type="text"
                      className="input-text"
                      value={row.tenPhuTung}
                      readOnly
                      style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                    />
                    <span className="tooltip-text">{row.tenPhuTung}</span>
                  </div>
                </div>

                <div className="input-row" style={{ width: 80, margin: 0 }}>
                  <label
                    style={{
                      display: "flex",
                      textAlign: "center",
                      height: 30,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ĐVT
                  </label>
                  <div className="tooltip-wrapper">
                    <input
                      type="text"
                      className="input-text"
                      value={row.donViTinh}
                      readOnly
                      style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                    />
                    <span className="tooltip-text">{row.donViTinh}</span>
                  </div>
                </div>

                {/* Số lượng - cho phép bỏ số 0 đầu */}
                <div className="input-row" style={{ width: 120, margin: 0 }}>
                  <label
                    htmlFor={`soluong-${index}`}
                    style={{ textAlign: "center", height: 30 }}
                  >
                    Số lượng
                  </label>
                  <div className="tooltip-wrapper">
                    <input
                      id={`soluong-${index}`}
                      type="number"
                      placeholder="Nhập số lượng"
                      className="input-text"
                      value={row.soLuongVatTu || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        const num = val === "" ? 0 : parseFloat(val);
                        handleRowNumberChange(
                          index,
                          "soLuongVatTu",
                          isNaN(num) ? 0 : num
                        );
                      }}
                      step="any"
                      min="0"
                    />
                    <span className="tooltip-text">
                      {row.soLuongVatTu || 0}
                    </span>
                  </div>
                </div>

                {/* K1..K7 selects */}
                {["k1", "k2", "k3", "k4", "k5", "k6", "k7"].map((kKey, i) => (
                  <div
                    key={kKey}
                    className="input-row"
                    style={{ width: 70, margin: 0 }}
                  >
                    <label
                      htmlFor={`${kKey}-${index}`}
                      style={{
                        display: "flex",
                        textAlign: "center",
                        height: 30,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {kKey.toUpperCase()}
                    </label>
                    <div className="tooltip-wrapper">
                      <select
                        id={`${kKey}-${index}`}
                        className="input-text"
                        value={(row as any)[kKey] ?? ""}
                        onChange={(e) =>
                          handleRowNumberChange(
                            index,
                            kKey as keyof PartRowData,
                            e.target.value === ""
                              ? null
                              : parseFloat(e.target.value)
                          )
                        }
                      >
                        <option value="">Chọn hệ số</option>
                        {MOCK_K_OPTIONS.map((k) => (
                          <option key={k} value={k}>
                            {k}
                          </option>
                        ))}
                      </select>
                      <span className="tooltip-text">
                        {(row as any)[kKey] ?? "Chưa chọn"}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Đơn giá (disabled) - format VND */}
                <div className="input-row" style={{ width: 120, margin: 0 }}>
                  <label style={{ textAlign: "center", height: 30 }}>
                    Đơn giá
                  </label>
                  <div className="tooltip-wrapper">
                    <input
                      type="text"
                      className="input-text"
                      value={formatVND(row.unitPriceInput)}
                      disabled
                      style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                    />
                    <span className="tooltip-text">
                      {formatVND(row.unitPriceInput)}
                    </span>
                  </div>
                </div>

                {/* Chi phí SCTX kế hoạch - làm tròn lên + format VND */}
                <div className="input-row" style={{ width: 140, margin: 0 }}>
                  <label style={{ textAlign: "center", height: 30 }}>
                    Chi phí điện năng kế hoạch
                  </label>
                  <div className="tooltip-wrapper">
                    <input
                      type="text"
                      className="input-text"
                      value={formatVND(row.chiPhiSCTXKeHoach)}
                      disabled
                      style={{ width: "100%", backgroundColor: "#f1f2f5" }}
                    />
                    <span className="tooltip-text">
                      {formatVND(row.chiPhiSCTXKeHoach)}
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
