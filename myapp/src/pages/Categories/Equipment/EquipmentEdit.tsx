import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import FormRow from "../../../components/formRow";
import PATHS from "../../../hooks/path";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable";
import { useApi } from "../../../hooks/useFetchData";

interface EquipmentEditProps {
id?: string;
onClose?: () => void;
onSuccess?: () => Promise<void> | void; // ✅ Async
}

// Interfaces (Giữ nguyên)
interface EquipmentCost { startDate: string; endDate: string; costType: number; amount: number; }
interface Equipment { id: string; code: string; name: string; unitOfMeasureId: string; costs: EquipmentCost[]; }
interface CostRow { id: number; startDate: string; endDate: string; amount: string; }
interface DropdownOption { value: string; label: string; }

// Bổ sung các hàm tiện ích (giữ nguyên logic bạn cung cấp)
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


const EquipmentEdit: React.FC<EquipmentEditProps> = ({ id, onClose, onSuccess }) => {
// ====== API setup ======
const equipmentPath = "/api/catalog/equipment";
const unitPath = "/api/catalog/unitofmeasure";

const { fetchById, putData, loading: loadingPart, error: errorPart } =
useApi<Equipment>(equipmentPath);

const { fetchData: fetchUnits, data: units, loading: loadingUnit } =
useApi<{ id: string; name: string }>(unitPath);

// ====== State ======
const [currentEquipment, setCurrentEquipment] = useState<Equipment | null>(null);
const [selectedUnit, setSelectedUnit] = useState<string>("");
const [formData, setFormData] = useState({ code: "", name: "" });
const [costRows, setCostRows] = useState<CostRow[]>([
{ id: Date.now(), startDate: "", endDate: "", amount: "" }
]);

// ... (Logic Load Data, Sync Data, Load Dropdowns giữ nguyên) ...
useEffect(() => {
  const loadData = async () => { if (!id) return; const res = await fetchById(id); if (res) setCurrentEquipment(res as Equipment); }; loadData();
}, [id, fetchById]);
useEffect(() => { fetchUnits(); }, [fetchUnits]);
useEffect(() => {
  if (currentEquipment) {
    setFormData({ code: currentEquipment.code, name: currentEquipment.name, });
    setSelectedUnit(currentEquipment.unitOfMeasureId || "");
    if (currentEquipment.costs && currentEquipment.costs.length > 0) {
      setCostRows(currentEquipment.costs.map((cost, index) => ({ id: Date.now() + index, startDate: cost.startDate, endDate: cost.endDate, amount: cost.amount.toString(), })));
    } else { setCostRows([{ id: Date.now(), startDate: "", endDate: "", amount: "" }]); }
  }
}, [currentEquipment]);

const unitOptions: DropdownOption[] = units?.map((u) => ({ value: u.id, label: u.name })) || [];

// ====== PUT submit (LOGIC SỬA ĐÚNG) ======
const handleSubmit = async (data: Record<string, string>) => {
if (!id) return alert("❌ Thiếu ID để cập nhật!");

const code = data["Mã thiết bị"]?.trim();
const name = data["Tên thiết bị"]?.trim();
const unitOfMeasureId = selectedUnit;

if (!code) return alert("⚠️ Vui lòng nhập Mã thiết bị!");
if (!name) return alert("⚠️ Vui lòng nhập Tên thiết bị!");
if (!unitOfMeasureId) return alert("⚠️ Vui lòng chọn Đơn vị tính!");

const payload = { 
id, code, name, unitOfMeasureId,
costs: costRows.map(row => ({
startDate: row.startDate || new Date().toISOString(),
endDate: row.endDate || new Date().toISOString(),
costType: 1, 
amount: parseFloat(row.amount || "0"),
})),
};

// 1. ĐÓNG FORM NGAY LẬP TỨC


try {
  // 2. CHẠY API VÀ CHỜ THÀNH CÔNG
  await Promise.all([
    putData(payload, undefined),

]);

await new Promise(r => setTimeout(r, 0));


  // 4. HIỆN ALERT THÀNH CÔNG
  alert("✅ Cập nhật thiết bị thành công!");

} catch (e: any) {
  // 5. BẮT LỖI và alert thất bại
  console.error("Lỗi giao dịch sau khi đóng form:", e);
  
  let errorMessage = "Đã xảy ra lỗi không xác định.";

  if (e && typeof e.message === 'string') {
      const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
      
      if (detail.includes("Mã đã tồn tại") || detail.includes("duplicate")) {
          errorMessage = "Mã thiết bị này đã tồn tại trong hệ thống. Vui lòng nhập mã khác!";
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

// ====== Logic quản lý FormRow (Giữ nguyên) ======
const handleCostRowChange = (rowIndex: number, fieldName: keyof CostRow, value: any) => { setCostRows(currentRows => currentRows.map((row, index) => { if (index === rowIndex) { return { ...row, [fieldName]: value }; } return row; }) ); };
const handleAddCostRow = () => { setCostRows(currentRows => [ ...currentRows, { id: Date.now(), startDate: "", endDate: "", amount: "" } ]); };
const handleRemoveCostRow = (rowIndex: number) => { if (costRows.length <= 1) return; setCostRows(currentRows => currentRows.filter((_, index) => index !== rowIndex)); };

const formRowPropData = costRows.map((row, index) => [
{ label: "Ngày bắt đầu", placeholder: "dd/mm/yy", type: "date" as const, value: row.startDate ? new Date(row.startDate) : null, onChange: (date: Date | null) => handleCostRowChange(index, 'startDate', date?.toISOString() || ""), },
{ label: "Ngày kết thúc", placeholder: "dd/mm/yy", type: "date" as const, value: row.endDate ? new Date(row.endDate) : null, onChange: (date: Date | null) => handleCostRowChange(index, 'endDate', date?.toISOString() || ""), },
{ label: "Đơn giá điện năng (kWh)", placeholder: "Nhập đơn giá điện năng", type: "text" as const, value: formatNumberForDisplay(row.amount), onChange: (value: string) => { const parsedValue = parseFormattedNumber(value); if (!isNaN(Number(parsedValue)) || parsedValue === "") { handleCostRowChange(index, 'amount', parsedValue); } }, },
]);

return (
<LayoutInput
title01="Danh mục / Mã thiết bị"
title="Chỉnh sửa Mã thiết bị"
fields={[ { type: "custom1" as const }, { label: "Mã thiết bị", type: "text" as const, placeholder: "Nhập mã thiết bị, ví dụ: BDLT5054" }, { label: "Tên thiết bị", type: "text" as const, placeholder: "Nhập tên thiết bị, ví dụ: Bơm điện LT 50/54" }, ]}
onSubmit={handleSubmit}
formRowComponent={<FormRow title="Đơn giá điện năng (kWh)" title1="điện năng (kWh)" rows={formRowPropData} onAdd={handleAddCostRow} onRemove={handleRemoveCostRow} />}
closePath={PATHS.EQUIPMENT.LIST}
onClose={onClose}
initialData={{
"Mã thiết bị": formData.code,
"Tên thiết bị": formData.name,
}}
shouldSyncInitialData={true}
>
{/* Custom slot "custom1" cho Đơn vị tính */}
<div className="custom1" key={1}>
<DropdownMenuSearchable label="Đơn vị tính" options={unitOptions} value={selectedUnit} onChange={setSelectedUnit} placeholder="Chọn đơn vị tính..." isDisabled={loadingUnit} />
</div>
</LayoutInput>
);
};

export default EquipmentEdit;