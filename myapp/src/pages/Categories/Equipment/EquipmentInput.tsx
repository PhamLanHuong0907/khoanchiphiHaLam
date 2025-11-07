import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import FormRow from "../../../components/formRow"; // Đảm bảo FormRow.tsx đã được cập nhật
import PATHS from "../../../hooks/path";
import { useApi } from "../../../hooks/useFetchData";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable"; // Bổ sung import

interface EquipmentInputProps {
onClose?: () => void;
onSuccess?: () => void;
// Bỏ onSave để dùng format chuẩn
}

// Bổ sung interface
interface DropdownOption {
value: string;
label: string;
}

// Bổ sung interface cho state quản lý hàng
interface CostRow {
id: number;
startDate: string;
endDate: string;
amount: string;
}

const EquipmentInput: React.FC<EquipmentInputProps> = ({ onClose, onSuccess }) => {
// ====== API setup ======
// Sửa đổi: Dùng path tương đối
const equipmentPath = "/api/catalog/equipment";
const unitPath = "/api/catalog/unitofmeasure";

// Bổ sung: API cho dropdown ĐVT
const { fetchData: fetchUnits, data: units, loading: loadingUnit } =
useApi<{ id: string; name: string }>(unitPath);

// Sửa đổi: Đổi tên loading/error
const { postData } = useApi(equipmentPath);


  // ====== BẮT ĐẦU: Thêm các hàm tiện ích TẠI ĐÂY (Sửa lỗi ReferenceError) ======
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
  // ====== KẾT THÚC: Thêm các hàm tiện ích ======


// ====== State ======
// Bổ sung: State cho dropdown
const [selectedUnit, setSelectedUnit] = useState<string>("");

// Bổ sung: State cho các trường text
const [formData] = useState({
code: "",
name: "",
});

// Bổ sung: State cho danh sách chi phí (costs)
const [costRows, setCostRows] = useState<CostRow[]>([
{ id: Date.now(), startDate: "", endDate: "", amount: "" }
]);

// ====== Load dropdowns ======
useEffect(() => {
fetchUnits();
}, [fetchUnits]);

// Bổ sung: Map options cho dropdown
const unitOptions: DropdownOption[] =
units?.map((u) => ({ value: u.id, label: u.name })) || [];

// ====== Handle submit (SỬA ĐỔI TOÀN BỘ) ======
const handleSubmit = async (data: Record<string, string>) => {
// 1. Lấy dữ liệu từ các trường text (do LayoutInput quản lý)
const code = data["Mã thiết bị"]?.trim();
const name = data["Tên thiết bị"]?.trim();

// 2. Lấy dữ liệu từ state (do component này quản lý)
const unitOfMeasureId = selectedUnit;

// 3. Validation
if (!code) return alert("⚠️ Vui lòng nhập Mã thiết bị!");
if (!name) return alert("⚠️ Vui lòng nhập Tên thiết bị!");
if (!unitOfMeasureId) return alert("⚠️ Vui lòng chọn Đơn vị tính!");

// 4. Tạo payload
const payload = {
code,
name,
unitOfMeasureId,
// Map qua state 'costRows' để tạo mảng 'costs'
costs: costRows.map(row => ({
startDate: row.startDate || new Date().toISOString(),
endDate: row.endDate || new Date().toISOString(),
costType: 1, // Giữ nguyên costType = 1
        // row.amount LÀ GIÁ TRỊ SẠCH (VD: "100000"), NÊN parseFloat HOẠT ĐỘNG ĐÚNG
amount: parseFloat(row.amount || "0"),
})),
};

console.log("📤 POST payload:", payload);

// 5. Gọi API
await postData(payload, () => {
console.log("✅ Tạo thiết bị thành công!");
onSuccess?.();
onClose?.();
});
};

// ====== Fields (SỬA ĐỔI) ======
const fields = [
{ label: "Mã thiết bị", type: "text" as const, placeholder: "Nhập mã thiết bị, ví dụ: BDLT5054" },
{ label: "Tên thiết bị", type: "text" as const, placeholder: "Nhập tên thiết bị, ví dụ: Bơm điện LT 50/54" },
// Sửa đổi: Chuyển ĐVT thành custom slot
{ type: "custom1" as const }, // placeholder cho dropdown Đơn vị tính
];

// ====== BỔ SUNG: Logic quản lý FormRow (giống hệt MaterialsInput) ======

// Hàm cập nhật một trường trong một hàng
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

// Hàm thêm một hàng mới
const handleAddCostRow = () => {
setCostRows(currentRows => [
...currentRows,
{ id: Date.now(), startDate: "", endDate: "", amount: "" }
]);
};

// Hàm xóa một hàng
const handleRemoveCostRow = (rowIndex: number) => {
if (costRows.length <= 1) return;
setCostRows(currentRows => currentRows.filter((_, index) => index !== rowIndex));
};

// Tạo 'rows' prop cho FormRow từ state 'costRows'
const formRowPropData = costRows.map((row, index) => [
{
    label: "Ngày bắt đầu",
    placeholder: "dd/mm/yy",
    type: "date" as const,
    value: row.startDate ? new Date(row.startDate) : null,
    onChange: (date: Date | null) => 
        handleCostRowChange(index, 'startDate', date?.toISOString() || ""),
},
{
    label: "Ngày kết thúc",
    placeholder: "dd/mm/yy",
    type: "date" as const,
    value: row.endDate ? new Date(row.endDate) : null,
    onChange: (date: Date | null) => 
        handleCostRowChange(index, 'endDate', date?.toISOString() || ""),
},
{
    label: "Đơn giá điện năng",
    placeholder: "Nhập đơn giá điện năng",
    type: "text" as const,
    value: formatNumberForDisplay(row.amount), 
    
    // HÀM ONCHANGE CHỈ CẬP NHẬT STATE
    onChange: (value: string) => {
        const parsedValue = parseFormattedNumber(value);
        if (!isNaN(Number(parsedValue)) || parsedValue === "") {
            handleCostRowChange(index, 'amount', parsedValue);
        }
    }, // <-- Đóng hàm onChange
}, // <-- Đóng object "Đơn giá điện năng"
]); // <-- ĐÂY LÀ CHỖ SỬA LẠI DÒNG 228 (Đóng mảng và hàm map)


// ====== RETURN CHÍNH CỦA COMPONENT 'EquipmentInput' ======
return (
    <LayoutInput
        title01="Danh mục / Mã thiết bị"
        title="Tạo mới Mã thiết bị"
        fields={fields}
        onSubmit={handleSubmit}
        formRowComponent={
            <FormRow
                title="Đơn giá điện năng"
                title1="điện năng"
                rows={formRowPropData} // <-- Sử dụng dữ liệu đã tạo ở trên
                onAdd={handleAddCostRow}
                onRemove={handleRemoveCostRow}
            />
        }
        closePath={PATHS.EQUIPMENT.LIST}
        onClose={onClose}
        initialData={{
            "Mã thiết bị": formData.code,
            "Tên thiết bị": formData.name,
        }}
    >
        {/* Custom slot "custom1" cho Đơn vị tính */}
        Setting <div className="custom1" key={1}>
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

}; // <-- DẤU '}' NÀY DÙNG ĐỂ ĐÓNG COMPONENT 'EquipmentInput' (bắt đầu từ dòng 31)

export default EquipmentInput;