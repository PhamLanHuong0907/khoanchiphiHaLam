import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import FormRow from "../../../components/formRow";
import PATHS from "../../../hooks/path";
import { useApi } from "../../../hooks/useFetchData";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable";

interface MaterialsInputProps {
onClose?: () => void;
onSuccess?: () => Promise<void> | void; // ✅ Async
}

interface DropdownOption { value: string; label: string; }
interface CostRow { id: number; startDate: string; endDate: string; amount: string; }

// ====== BẮT ĐẦU: Các hàm tiện ích (Giữ nguyên) ======
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
// ====== KẾT THÚC: Các hàm tiện ích ======

const MaterialsInput: React.FC<MaterialsInputProps> = ({ onClose, onSuccess }) => {
// ====== API setup ======
const materialPath = "/api/catalog/material";
const assignmentCodePath = "/api/catalog/assignmentcode?pageIndex=1&pageSize=10000";
const unitPath = "/api/catalog/unitofmeasure?pageIndex=1&pageSize=10000";

const { fetchData: fetchAssignmentCodes, data: assignmentCodes, loading: loadingAssignment } =
useApi<{ id: string; code: string }>(assignmentCodePath);
const { fetchData: fetchUnits, data: units, loading: loadingUnit } =
useApi<{ id: string; name: string }>(unitPath);
const { postData, error: saveError } = useApi(materialPath);

// ====== State ======
const [selectedAssignmentCode, setSelectedAssignmentCode] = useState<string>("");
const [selectedUnit, setSelectedUnit] = useState<string>("");
const [formData] = useState({ code: "", name: "" });
const [costRows, setCostRows] = useState<CostRow[]>([
{ id: Date.now(), startDate: "", endDate: "", amount: "" }
]);

// ====== Load dropdowns ======
useEffect(() => { fetchAssignmentCodes(); fetchUnits(); }, [fetchAssignmentCodes, fetchUnits]);

const assignmentOptions: DropdownOption[] = assignmentCodes?.map((a) => ({ value: a.id, label: a.code })) || [];
const unitOptions: DropdownOption[] = units?.map((u) => ({ value: u.id, label: u.name })) || [];

// ====== Handle submit (SỬA ĐỔI) ======
const handleSubmit = async (data: Record<string, string>) => {
const code = data["Mã vật tư, tài sản"]?.trim();
const name = data["Tên vật tư, tài sản"]?.trim();

if (!selectedAssignmentCode) return alert("⚠️ Vui lòng chọn Mã giao khoán!");
if (!selectedUnit) return alert("⚠️ Vui lòng chọn Đơn vị tính!");
if (!code) return alert("⚠️ Vui lòng nhập Mã vật tư, tài sản!");
if (!name) return alert("⚠️ Vui lòng nhập Tên vật tư, tài sản!");

const payload = {
code,
name,
assigmentCodeId: selectedAssignmentCode,
unitOfMeasureId: selectedUnit,
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
  alert("✅ Tạo vật tư thành công!");

} catch (e: any) {
  // 5. BẮT LỖI và alert thất bại
  console.error("Lỗi giao dịch sau khi đóng form:", e);
  
  let errorMessage = "Đã xảy ra lỗi không xác định.";

  if (e && typeof e.message === 'string') {
      const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
      
      if (detail.includes("Mã đã tồn tại") || detail.includes("duplicate")) {
          errorMessage = "Mã vật tư này đã tồn tại trong hệ thống. Vui lòng nhập mã khác!";
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

// ====== BỔ SUNG: Các hàm quản lý state 'costRows' (Giữ nguyên) ======
const handleCostRowChange = (rowIndex: number, fieldName: keyof CostRow, value: any) => { setCostRows(currentRows => currentRows.map((row, index) => { if (index === rowIndex) { return { ...row, [fieldName]: value }; } return row; })) };
const handleAddCostRow = () => { setCostRows(currentRows => [ ...currentRows, { id: Date.now(), startDate: "", endDate: "", amount: "" } ]) };
const handleRemoveCostRow = (rowIndex: number) => { if (costRows.length <= 1) return; setCostRows(currentRows => currentRows.filter((_, index) => index !== rowIndex)); };

// SỬA ĐỔI: Tạo 'rows' prop cho FormRow từ state 'costRows'
const formRowPropData = costRows.map((row, index) => [
{ label: "Ngày bắt đầu", placeholder: "dd/mm/yy", type: "date" as const, value: row.startDate ? new Date(row.startDate) : null, onChange: (date: Date | null) => handleCostRowChange(index, 'startDate', date?.toISOString() || ""), },
{ label: "Ngày kết thúc", placeholder: "dd/mm/yy", type: "date" as const, value: row.endDate ? new Date(row.endDate) : null, onChange: (date: Date | null) => handleCostRowChange(index, 'endDate', date?.toISOString() || ""), },
{ label: "Đơn giá vật tư (đ)", placeholder: "Nhập đơn giá vật tư (đ), ví dụ: 234.567", type: "text" as const, value: formatNumberForDisplay(row.amount), onChange: (value: string) => { const parsedValue = parseFormattedNumber(value); if (!isNaN(Number(parsedValue)) || parsedValue === "") { handleCostRowChange(index, 'amount', parsedValue); } }, },
]);

return (
<LayoutInput
title01="Danh mục / Vật tư, tài sản"
title="Tạo mới Vật tư, tài sản"
fields={[ { type: "custom1" as const }, { label: "Mã vật tư, tài sản", type: "text" as const, placeholder: "Nhập mã vật tư, tài sản , ví dụ: TN01" }, { label: "Tên vật tư, tài sản", type: "text" as const, placeholder: "Nhập tên vật tư, tài sản, ví dụ: Thuốc nổ" }, { type: "custom2" as const }, ]}
onSubmit={handleSubmit}
formRowComponent={
<FormRow
title="Đơn giá vật tư (đ)"
title1="vật tư (đ)"
rows={formRowPropData}
onAdd={handleAddCostRow}
onRemove={handleRemoveCostRow}
/>
}
closePath={PATHS.MATERIALS.LIST}
onClose={onClose}
initialData={{
"Mã vật tư, tài sản": formData.code,
"Tên vật tư, tài sản": formData.name,
 }}
>
{/* Dropdown riêng cho Mã giao khoán */}
<div className="custom1" key={1}>
<DropdownMenuSearchable
label="Mã giao khoán"
options={assignmentOptions}
value={selectedAssignmentCode}
onChange={setSelectedAssignmentCode}
placeholder="Chọn mã giao khoán..."
isDisabled={loadingAssignment}
/>
</div>

{/* Dropdown riêng cho Đơn vị tính */}
<div className="custom2" key={2}>
<DropdownMenuSearchable
label="Đơn vị tính"
options={unitOptions}
value={selectedUnit}
onChange={setSelectedUnit}
placeholder="Chọn đơn vị tính"
isDisabled={loadingUnit}
/>
</div>
</LayoutInput>
);
};

export default MaterialsInput;