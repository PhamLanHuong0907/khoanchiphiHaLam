import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import FormRow from "../../../components/formRow";
import PATHS from "../../../hooks/path";
import { useApi } from "../../../hooks/useFetchData";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable";

interface SparePartsInputProps {
 onClose?: () => void;
 onSuccess?: () => Promise<void> | void; // ✅ Async
}

// Interfaces for dropdowns and cost rows
interface DropdownOption {
 value: string;
 label: string;
}

interface CostRow {
 id: number;
 startDate: string;
 endDate: string;
 amount: string;
}

// Thêm các hàm tiện ích
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

const SparePartsInput: React.FC<SparePartsInputProps> = ({ onClose, onSuccess }) => {
  
 // ====== API setup ======
 const partPath = "/api/catalog/part";
 const unitPath = "/api/catalog/unitofmeasure?pageIndex=1&pageSize=1000";
 const equipmentPath = "/api/catalog/equipment?pageIndex=1&pageSize=1000";

 // API for POSTing Spare Part data (autoFetch: false)
 const { postData, loading: saving, error: saveError } = useApi(partPath, { autoFetch: false });

 // API for fetching Units dropdown
 const { fetchData: fetchUnits, data: units, loading: loadingUnit } =
  useApi<{ id: string; name: string }>(unitPath);

 // API for fetching Equipment dropdown
 const { fetchData: fetchEquipments, data: equipments, loading: loadingEquipment } =
  useApi<{ id: string; code: string; name?: string }>(equipmentPath);

 // ====== State ======
 const [selectedUnitId, setSelectedUnitId] = useState<string>("");
 const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>("");
 const [formData] = useState({ code: "", name: "" });
 const [costRows, setCostRows] = useState<CostRow[]>([
  { id: Date.now(), startDate: "", endDate: "", amount: "" }
 ]);

 // ====== Load dropdowns ======
 useEffect(() => {
  const fetchAllData = async () => {
   await Promise.all([fetchUnits(), fetchEquipments()]);
  };
  fetchAllData();
 }, [fetchUnits, fetchEquipments]);

 // Map options for dropdowns
 const unitOptions: DropdownOption[] = units?.map((u) => ({ value: u.id, label: u.name })) || []; 
 const equipmentOptions: DropdownOption[] = equipments?.map((e) => ({ value: e.id, label: `${e.code} - ${e.name || ''}` })) || [];

 // ====== Handle submit ======
 const handleSubmit = async (data: Record<string, string>) => {
  const code = data["Mã phụ tùng"]?.trim();
  const name = data["Tên phụ tùng"]?.trim();
  const unitOfMeasureId = selectedUnitId;
  const equipmentId = selectedEquipmentId;

  if (!equipmentId) return alert("⚠️ Vui lòng chọn Thiết bị!");
  if (!code) return alert("⚠️ Vui lòng nhập Mã phụ tùng!");
  if (!name) return alert("⚠️ Vui lòng nhập Tên phụ tùng!");
  if (!unitOfMeasureId) return alert("⚠️ Vui lòng chọn Đơn vị tính!");

  // Construct payload
  const payload = {
   code,
   name,
   unitOfMeasureId,
   equipmentId,
   costs: costRows.map(row => ({
    startDate: row.startDate || new Date().toISOString(),
    endDate: row.endDate || new Date().toISOString(),
    costType: 1, 
    amount: parseFloat(row.amount || "0"),
   })),
  };

  // 1. ĐÓNG FORM NGAY LẬP TỨC


  try {
    // 2. CHẠY API VÀ CHỜ THÀNH CÔNG (Không dùng callback thứ hai)
    await Promise.all([
    postData(payload, undefined),
]);

await new Promise(r => setTimeout(r, 0));

    // 4. HIỆN ALERT THÀNH CÔNG
    alert("✅ Tạo phụ tùng thành công!");

  } catch (e: any) {
    // 5. BẮT LỖI và alert thất bại
    console.error("Lỗi giao dịch sau khi đóng form:", e);
    
    let errorMessage = "Đã xảy ra lỗi không xác định.";

    if (e && typeof e.message === 'string') {
        const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
        
        if (detail.includes("Mã đã tồn tại") || detail.includes("duplicate")) {
            errorMessage = "Mã phụ tùng này đã tồn tại trong hệ thống. Vui lòng nhập mã khác!";
        } else if (detail.includes("HTTP error") || detail.includes("network")) {
            errorMessage = "Yêu cầu đến máy chủ thất bại. Vui lòng kiểm tra kết nối mạng.";
        } else {
            errorMessage = `Lỗi nghiệp vụ: ${detail}`;
        }
    }
    
    alert(`❌ TẠO THẤT BẠI: ${errorMessage}`);
  }
  onClose?.();
  onSuccess?.()
 };

 // ====== Cost Row Management Logic (Giữ nguyên) ======
 const handleCostRowChange = (rowIndex: number, fieldName: keyof CostRow, value: any) => { /* ... */ setCostRows(currentRows => currentRows.map((row, index) => { if (index === rowIndex) { return { ...row, [fieldName]: value }; } return row; })) };
 const handleAddCostRow = () => { setCostRows(currentRows => [ ...currentRows, { id: Date.now(), startDate: "", endDate: "", amount: "" } ]) };
 const handleRemoveCostRow = (rowIndex: number) => { if (costRows.length <= 1) return; setCostRows(currentRows => currentRows.filter((_, index) => index !== rowIndex)); };

 // Prepare 'rows' prop for FormRow component
 const formRowPropData = costRows.map((row, index) => [
  { label: "Ngày bắt đầu", placeholder: "dd/mm/yy", type: "date" as const, value: row.startDate ? new Date(row.startDate) : null, onChange: (date: Date | null) => handleCostRowChange(index, 'startDate', date?.toISOString() || ""), },
  { label: "Ngày kết thúc", placeholder: "dd/mm/yy", type: "date" as const, value: row.endDate ? new Date(row.endDate) : null, onChange: (date: Date | null) => handleCostRowChange(index, 'endDate', date?.toISOString() || ""), },
  { label: "Đơn giá vật tư (đ)", placeholder: "Nhập đơn giá vật tư", type: "text" as const, value: formatNumberForDisplay(row.amount), onChange: (value: string) => { const parsedValue = parseFormattedNumber(value); if (!isNaN(Number(parsedValue)) || parsedValue === "") { handleCostRowChange(index, 'amount', parsedValue); } }, },
 ]);

 return (
   <LayoutInput
    title01="Danh mục / Phụ tùng"
    title="Tạo mới Phụ tùng"
    fields={[ { type: "custom1" as const }, { label: "Mã phụ tùng", type: "text" as const, placeholder: "Nhập mã phụ tùng, ví dụ: BCTB" }, { label: "Tên phụ tùng", type: "text" as const, placeholder: "Nhập tên phụ tùng, ví dụ: Bánh công tác bơm LT50-50" }, { type: "custom2" as const }, ]}
    onSubmit={handleSubmit}
    formRowComponent={ <FormRow title="Đơn giá vật tư (đ)" title1="vật tư (đ)" rows={formRowPropData} onAdd={handleAddCostRow} onRemove={handleRemoveCostRow} /> }
    closePath={PATHS.SPARE_PARTS.LIST}
    onClose={onClose}
    initialData={{ "Mã phụ tùng": formData.code, "Tên phụ tùng": formData.name, }}
   >
    {/* Custom slot for Equipment dropdown */}
    <div className="custom1" key={1}>
 <DropdownMenuSearchable label="Thiết bị" options={equipmentOptions} value={selectedEquipmentId} onChange={setSelectedEquipmentId} placeholder="Chọn thiết bị..." isDisabled={loadingEquipment} />
    </div>

    {/* Custom slot for Unit of Measure dropdown */}
    <div className="custom2" key={2}>
     <DropdownMenuSearchable label="Đơn vị tính" options={unitOptions} value={selectedUnitId} onChange={setSelectedUnitId} placeholder="Chọn đơn vị tính..." isDisabled={loadingUnit} />
    </div>
   </LayoutInput> );
};

export default SparePartsInput;