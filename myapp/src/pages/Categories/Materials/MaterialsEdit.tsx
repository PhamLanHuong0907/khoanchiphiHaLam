import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import FormRow from "../../../components/formRow"; // Đảm bảo FormRow.tsx đã được cập nhật
import PATHS from "../../../hooks/path";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable";
import { useApi } from "../../../hooks/useFetchData";

interface MaterialsEditProps {
id?: string;
onClose?: () => void;
onSuccess?: () => void;
}

// SỬA ĐỔI: Interface này phải khớp với JSON GET {id} BẠN VỪA CUNG CẤP
interface MaterialCost { 
startDate: string;
endDate: string;
costType: number
amount: number;
}

interface Material {
id: string;
code: string;
name: string;
assigmentCodeId: string;
unitOfMeasureId: string;
costs: MaterialCost[]; // <-- API trả về mảng này
// 'costAmmount' không có ở đây
}

// Interface cho state nội bộ
interface CostRow {
id: number; // Key cho React
startDate: string;
endDate: string;
amount: string; // Dùng string cho input
}

const MaterialsEdit: React.FC<MaterialsEditProps> = ({ id, onClose, onSuccess }) => {
// ====== API setup ======
const materialPath = "/api/catalog/material";
const assignmentCodePath = "/api/catalog/assignmentcode?pageIndex=1&pageSize=10000";
const unitPath = "/api/catalog/unitofmeasure?pageIndex=1&pageSize=10000";

// SỬA ĐỔI: useApi<Material> dùng interface 'phức tạp' ở trên
const { fetchById, putData } =
useApi<Material>(materialPath);

const { fetchData: fetchAssignmentCodes, data: assignmentCodes, loading: loadingAssignment } =
useApi<{ id: string; code: string }>(assignmentCodePath);
const { fetchData: fetchUnits, data: units, loading: loadingUnit } =
useApi<{ id: string; name: string }>(unitPath);


  // ====== BẮT ĐẦU DI CHUYỂN TIỆN ÍCH LÊN ĐÂY ======
  /**
   * Định dạng một số string/number (VD: 100000) thành dạng có dấu chấm (VD: "100.000")
   * Sử dụng 'de-DE' locale để có dấu chấm (.) ngăn cách hàng nghìn.
   */
  const formatNumberForDisplay = (value: string | number): string => {
    if (value === null || value === undefined || value === "") return "";
    
    // Xóa mọi ký tự không phải số (giữ lại giá trị "sạch")
    const stringValue = String(value).replace(/[^0-9]/g, "");
    
    if (stringValue === "") return "";
    
    // Chuyển đổi sang số để format
    const numberValue = Number(stringValue);
    if (isNaN(numberValue)) return "";

    return new Intl.NumberFormat('de-DE').format(numberValue);
  };

  /**
   * Chuyển đổi giá trị người dùng nhập (VD: "100.000") về giá trị "sạch" (VD: "100000")
   */
  const parseFormattedNumber = (formattedValue: string): string => {
    if (formattedValue === null || formattedValue === undefined) return "";
    // Xóa tất cả dấu chấm (ký tự ngăn cách hàng nghìn)
    return formattedValue.replace(/\./g, "");
  };
  // ====== KẾT THÚC DI CHUYỂN TIỆN ÍCH ======


// ====== State ======
const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null);
const [selectedAssignmentCode, setSelectedAssignmentCode] = useState<string>("");
const [selectedUnit, setSelectedUnit] = useState<string>("");

const [formData, setFormData] = useState({
code: "",
name: "",
});

// State cho danh sách hàng đơn giá
const [costRows, setCostRows] = useState<CostRow[]>([
{ id: Date.now(), startDate: "", endDate: "", amount: "" }
]);

// ====== Load material by ID ======
useEffect(() => {
const loadData = async () => {
if (!id) return;
const res = await fetchById(id);
if (res) setCurrentMaterial(res as Material);
};
loadData();
}, [id, fetchById]);

// ====== Load dropdowns ======
useEffect(() => {
fetchAssignmentCodes();
fetchUnits();
}, [fetchAssignmentCodes, fetchUnits]);

// ====== Sync data to form (SỬA ĐỔI QUAN TRỌNG) ======
useEffect(() => {
if (currentMaterial) {
// 1. Đồng bộ các trường chính
setFormData({
code: currentMaterial.code,
name: currentMaterial.name,
});
setSelectedAssignmentCode(currentMaterial.assigmentCodeId || "");
setSelectedUnit(currentMaterial.unitOfMeasureId || "");

// 2. SỬA ĐỔI: Đồng bộ mảng 'costs' (từ API) vào 'costRows' (state)
if (currentMaterial.costs && currentMaterial.costs.length > 0) {
setCostRows(currentMaterial.costs.map((cost, index) => ({
id: Date.now() + index, // Tạo key duy nhất
startDate: cost.startDate,
endDate: cost.endDate,
amount: cost.amount.toString(), // Chuyển số sang string cho input
})));
} else {
// Nếu không có cost, trả về 1 hàng rỗng
setCostRows([{ id: Date.now(), startDate: "", endDate: "", amount: "" }]);
}
}
}, [currentMaterial]); // Phụ thuộc vào currentMaterial

const assignmentOptions = assignmentCodes?.map((a) => ({ value: a.id, label: a.code })) || [];
const unitOptions = units?.map((u) => ({ value: u.id, label: u.name })) || [];

// ====== PUT submit (Hàm này đã đúng) ======
// Hàm này gửi payload 'phức tạp' (với mảng costs)
const handleSubmit = async (data: Record<string, string>) => {
if (!id) return alert("❌ Thiếu ID để cập nhật!");
// ... (các validation khác) ...

const payload = { 
id,
code: data["Mã vật tư, tài sản"].trim(),
name: data["Tên vật tư, tài sản"].trim(),
assigmentCodeId: selectedAssignmentCode,
unitOfMeasureId: selectedUnit,
costs: costRows.map(row => ({
startDate: row.startDate || new Date().toISOString(),
endDate: row.endDate || new Date().toISOString(),
costType: 1, // Bạn có thể muốn thay đổi 'costType' này
        // row.amount LÀ GIÁ TRỊ SẠCH (VD: "99000"), NÊN parseFloat HOẠT ĐỘNG ĐÚNG
amount: parseFloat(row.amount), 
})),
};

console.log("📤 PUT payload:", payload);

await putData(payload, () => {
alert("✅ Cập nhật vật tư thành công!");
onSuccess?.();
onClose?.();
});
};

// ====== Fields (Phải là custom1, custom2) ======
const fields = [
{ type: "custom1" as const }, 
{ label: "Mã vật tư, tài sản", type: "text" as const, placeholder: "Nhập mã vật tư, tài sản, ví dụ: TN01" },
{ label: "Tên vật tư, tài sản", type: "text" as const, placeholder: "Nhập tên vật tư, tài sản, ví dụ: Thuốc nổ" },
{ type: "custom2" as const }, 
];

// ====== Các hàm quản lý state 'costRows' (Giữ nguyên) ======
const handleCostRowChange = (
rowIndex: number,
fieldName: keyof CostRow,

value: any
) => {
setCostRows(currentRows =>
currentRows.map((row, index) => {
if (index === rowIndex) {
return { ...row, [fieldName]: value };
}
return row;
})
);
};

const handleAddCostRow = () => {
setCostRows(currentRows => [
...currentRows,
{ id: Date.now(), startDate: "", endDate: "", amount: "" }
]);
};

const handleRemoveCostRow = (rowIndex: number) => {
if (costRows.length <= 1) return;
setCostRows(currentRows => currentRows.filter((_, index) => index !== rowIndex));
};

// Tạo 'rows' prop cho FormRow (Giữ nguyên)
  // ** CHỖ NÀY BÂY GIỜ SẼ HOẠT ĐỘNG VÌ CÁC HÀM TIỆN ÍCH ĐÃ Ở TRÊN **
const formRowPropData = costRows.map((row, index) => [
{
label: "Ngày bắt đầu",
placeholder: "Chọn ngày",
type: "date" as const,
value: row.startDate ? new Date(row.startDate) : null,
onChange: (date: Date | null) => 
handleCostRowChange(index, 'startDate', date?.toISOString() || ""),
},
{
label: "Ngày kết thúc",
placeholder: "Chọn ngày",
type: "date" as const,
value: row.endDate ? new Date(row.endDate) : null,
onChange: (date: Date | null) => 
handleCostRowChange(index, 'endDate', date?.toISOString() || ""),
},

    // ====== ĐOẠN CODE SỬA ĐỔI ======
{
label: "Đơn giá vật tư",
placeholder: "Nhập đơn giá",
type: "text" as const, // <-- Đổi sang "text"

// HIỂN THỊ: (VD: 100000 -> "100.000")
value: formatNumberForDisplay(row.amount), 

onChange: (value: string) => {
        // CẬP NHẬT STATE: (VD: "99.000" -> "99000")
const parsedValue = parseFormattedNumber(value);

        // Chỉ cập nhật nếu nó là số hoặc rỗng
if (!isNaN(Number(parsedValue)) || parsedValue === "") {
handleCostRowChange(index, 'amount', parsedValue);
}
},
},
    // ====== KẾT THÚC SỬA ĐỔI ======
]);

  // ===== CÁC HÀM TIỆN ÍCH ĐÃ ĐƯỢC DI CHUYỂN LÊN ĐẦU =====

return (
<LayoutInput
title01="Danh mục / Vật tư, tài sản"
title="Chỉnh sửa Vật tư, tài sản"
fields={fields}
onSubmit={handleSubmit}
closePath={PATHS.MATERIALS.LIST}
onClose={onClose}
initialData={{
"Mã vật tư, tài sản": formData.code,
"Tên vật tư, tài sản": formData.name,
}}
shouldSyncInitialData={true}
formRowComponent={
<FormRow
title="Đơn giá vật tư"
rows={formRowPropData}
onAdd={handleAddCostRow}
onRemove={handleRemoveCostRow}
/>
}
>
{/* Dropdown Mã giao khoán */}
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

{/* Dropdown Đơn vị tính */}
<div className="custom2" key={2}>
<DropdownMenuSearchable
label="Đơn vị tính"
options={unitOptions}
value={selectedUnit}
onChange={setSelectedUnit}
placeholder="Chọn đơn vị tính..."
isDisabled={loadingUnit}
/>
</div>
</LayoutInput>
);
};

export default MaterialsEdit;