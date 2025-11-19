import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import FormRow from "../../../components/formRow";
import PATHS from "../../../hooks/path";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable";
import { useApi } from "../../../hooks/useFetchData";

interface SparePartsEditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void;
}

// --- Interfaces khớp với JSON GET/PUT ---

interface SparePartCost {
  startDate: string;
  endDate: string;
  costType: number;
  amount: number;
}

interface SparePart {
  id: string;
  code: string;
  name: string;
  unitOfMeasureId: string;
  unitOfMeasureName?: string;
  equipmentId: string;
  equipmentCode: string;
  costs: SparePartCost[];
}

// Interface cho state của dòng chi phí trên giao diện (amount để string để format dấu chấm)
interface CostRow {
  id: number; // Key nội bộ react
  startDate: string;
  endDate: string;
  amount: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

// --- Utility Functions (Giống file Input) ---
const formatNumberForDisplay = (value: string | number): string => {
  if (value === null || value === undefined || value === "") return "";
  const stringValue = String(value).replace(/[^0-9]/g, "");
  if (stringValue === "") return "";
  const numberValue = Number(stringValue);
  if (isNaN(numberValue)) return "";
  return new Intl.NumberFormat('de-DE').format(numberValue);
};

const parseFormattedNumber = (formattedValue: string): string => {
  if (formattedValue === null || formattedValue === undefined) return "";
  return formattedValue.replace(/\./g, "");
};

const SparePartsEdit: React.FC<SparePartsEditProps> = ({ id, onClose, onSuccess }) => {

  // ====== API setup ======
  const partPath = "/api/catalog/part";
  const unitPath = "/api/catalog/unitofmeasure?pageIndex=1&pageSize=1000";
  const equipmentPath = "/api/catalog/equipment?pageIndex=1&pageSize=1000";

  const { fetchById, putData } = useApi<SparePart>(partPath);

  const { fetchData: fetchUnits, data: units, loading: loadingUnit } =
    useApi<{ id: string; name: string }>(unitPath);

  const { fetchData: fetchEquipments, data: equipments, loading: loadingEquipment } =
    useApi<{ id: string; code: string; name?: string }>(equipmentPath);

  // ====== State ======
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>("");
  const [formData, setFormData] = useState({ code: "", name: "" });
  
  // State quản lý danh sách chi phí
  const [costRows, setCostRows] = useState<CostRow[]>([
    { id: Date.now(), startDate: "", endDate: "", amount: "" }
  ]);

  // ====== Load Data & Dropdowns ======
  useEffect(() => {
    const initData = async () => {
      // 1. Load Dropdowns
      fetchUnits();
      fetchEquipments();

      // 2. Load Chi tiết phụ tùng
      if (id) {
        const res = await fetchById(id);
        if (res) {
          const data = res as SparePart;
          
          // Fill thông tin cơ bản
          setFormData({
            code: data.code,
            name: data.name,
          });
          setSelectedUnitId(data.unitOfMeasureId || "");
          setSelectedEquipmentId(data.equipmentId || "");

          // Fill bảng chi phí (Map từ API model sang UI Model)
          if (data.costs && data.costs.length > 0) {
            setCostRows(data.costs.map((c, index) => ({
              id: Date.now() + index, // Tạo key giả
              startDate: c.startDate,
              endDate: c.endDate,
              amount: c.amount.toString() // Chuyển number -> string để hiển thị
            })));
          } else {
            setCostRows([{ id: Date.now(), startDate: "", endDate: "", amount: "" }]);
          }
        }
      }
    };
    
    initData();
  }, [id, fetchById, fetchUnits, fetchEquipments]);

  // Map options for dropdowns
  const unitOptions: DropdownOption[] = units?.map((u) => ({ value: u.id, label: u.name })) || [];
  const equipmentOptions: DropdownOption[] = equipments?.map((e) => ({ value: e.id, label: `${e.code} - ${e.name || ''}` })) || [];

  // ====== Handle Submit ======
  const handleSubmit = async (data: Record<string, string>) => {
    if (!id) return alert("❌ Thiếu ID phụ tùng để cập nhật!");

    const code = data["Mã phụ tùng"]?.trim();
    const name = data["Tên phụ tùng"]?.trim();
    const unitOfMeasureId = selectedUnitId;
    const equipmentId = selectedEquipmentId;

    if (!equipmentId) return alert("⚠️ Vui lòng chọn Thiết bị!");
    if (!code) return alert("⚠️ Vui lòng nhập Mã phụ tùng!");
    if (!name) return alert("⚠️ Vui lòng nhập Tên phụ tùng!");
    if (!unitOfMeasureId) return alert("⚠️ Vui lòng chọn Đơn vị tính!");

    // Construct Payload theo mẫu JSON PUT
    const payload = {
      id, // Cần gửi kèm ID trong body nếu API yêu cầu (như mẫu JSON)
      code,
      name,
      unitOfMeasureId,
      equipmentId,
      costs: costRows.map(row => ({
        startDate: row.startDate || new Date().toISOString(),
        endDate: row.endDate || new Date().toISOString(),
        costType: 1, // Hardcode theo mẫu JSON
        amount: parseFloat(parseFormattedNumber(row.amount) || "0"), // Parse string form về number
      })),
    };

    // 1. ĐÓNG FORM NGAY LẬP TỨC (Giống file Input)


    try {
      // 2. CHẠY API VÀ CHỜ THÀNH CÔNG
      await Promise.all([
        putData(payload, undefined),

      ]);

      // Đợi 1 tick để đảm bảo UI update
      await new Promise(r => setTimeout(r, 0));

      // 4. HIỆN ALERT THÀNH CÔNG
      alert("✅ Cập nhật phụ tùng thành công!");

    } catch (e: any) {
      // 5. BẮT LỖI và alert thất bại
      console.error("Lỗi giao dịch sau khi đóng form:", e);

      let errorMessage = "Đã xảy ra lỗi không xác định.";

      if (e && typeof e.message === 'string') {
        const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();

        if (detail.includes("Mã đã tồn tại") || detail.includes("duplicate")) {
          errorMessage = "Mã phụ tùng này đã tồn tại. Vui lòng kiểm tra lại!";
        } else if (detail.includes("HTTP error") || detail.includes("network")) {
          errorMessage = "Yêu cầu đến máy chủ thất bại. Vui lòng kiểm tra kết nối mạng.";
        } else {
          errorMessage = `Lỗi nghiệp vụ: ${detail}`;
        }
      }

      alert(`❌ CẬP NHẬT THẤT BẠI: ${errorMessage}`);
    }
    onClose?.();
    onSuccess?.()
  };

  // ====== Cost Row Logic (Giữ nguyên logic Input) ======
  const handleCostRowChange = (rowIndex: number, fieldName: keyof CostRow, value: any) => {
    setCostRows(currentRows => currentRows.map((row, index) => {
      if (index === rowIndex) {
        return { ...row, [fieldName]: value };
      }
      return row;
    }));
  };

  const handleAddCostRow = () => {
    setCostRows(currentRows => [...currentRows, { id: Date.now(), startDate: "", endDate: "", amount: "" }]);
  };

  const handleRemoveCostRow = (rowIndex: number) => {
    if (costRows.length <= 1) return;
    setCostRows(currentRows => currentRows.filter((_, index) => index !== rowIndex));
  };

  // Prepare 'rows' prop for FormRow component
  const formRowPropData = costRows.map((row, index) => [
    {
      label: "Ngày bắt đầu",
      placeholder: "dd/mm/yy",
      type: "date" as const,
      value: row.startDate ? new Date(row.startDate) : null,
      onChange: (date: Date | null) => handleCostRowChange(index, 'startDate', date?.toISOString() || ""),
    },
    {
      label: "Ngày kết thúc",
      placeholder: "dd/mm/yy",
      type: "date" as const,
      value: row.endDate ? new Date(row.endDate) : null,
      onChange: (date: Date | null) => handleCostRowChange(index, 'endDate', date?.toISOString() || ""),
    },
    {
      label: "Đơn giá vật tư (đ)",
      placeholder: "Nhập đơn giá vật tư (đ), ví dụ: 234.567",
      type: "text" as const,
      value: formatNumberForDisplay(row.amount),
      onChange: (value: string) => {
        const parsedValue = parseFormattedNumber(value);
        if (!isNaN(Number(parsedValue)) || parsedValue === "") {
          handleCostRowChange(index, 'amount', parsedValue);
        }
      },
    },
  ]);

  return (
    <LayoutInput
      title01="Danh mục / Phụ tùng"
      title="Chỉnh sửa Phụ tùng"
      fields={[
        { type: "custom1" as const },
        { label: "Mã phụ tùng", type: "text" as const, placeholder: "Nhập mã phụ tùng, ví dụ: VB6310" },
        { label: "Tên phụ tùng", type: "text" as const, placeholder: "Nhập tên phụ tùng, ví dụ: Vòng bi 6310" },
        { type: "custom2" as const },
      ]}
      onSubmit={handleSubmit}
      formRowComponent={
        <FormRow
          title="Đơn giá phụ tùng (đ)"
          title1="phụ tùng (đ)"
          rows={formRowPropData}
          onAdd={handleAddCostRow}
          onRemove={handleRemoveCostRow}
        />
      }
      closePath={PATHS.SPARE_PARTS.LIST}
      onClose={onClose}
      initialData={{
        "Mã phụ tùng": formData.code,
        "Tên phụ tùng": formData.name,
      }}
      shouldSyncInitialData={true} // Quan trọng để LayoutInput nhận diện thay đổi từ API
    >
      {/* Custom slot for Equipment dropdown */}
      <div className="custom1" key={1}>
        <DropdownMenuSearchable
          label="Mã thiết bị"
          options={equipmentOptions}
          value={selectedEquipmentId}
          onChange={setSelectedEquipmentId}
          placeholder="Chọn thiết bị"
          isDisabled={loadingEquipment}
        />
      </div>

      {/* Custom slot for Unit of Measure dropdown */}
      <div className="custom2" key={2}>
        <DropdownMenuSearchable
          label="Đơn vị tính"
          options={unitOptions}
          value={selectedUnitId}
          onChange={setSelectedUnitId}
          placeholder="Chọn đơn vị tính"
          isDisabled={loadingUnit}
        />
      </div>
    </LayoutInput>
  );
};

export default SparePartsEdit;