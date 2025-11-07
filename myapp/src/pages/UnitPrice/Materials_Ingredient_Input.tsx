// THAY ĐỔI: Thêm 'useMemo'
import  { useEffect, useState, useMemo } from "react";
import LayoutInput from "../../layout/layout_input";
// Import TransactionRow GỐC (không có materialId)
import TransactionSelector, { type TransactionRow as ImportedTransactionRow } from "../../components/transactionselector"; 
import PATHS from "../../hooks/path";
import { useApi } from "../../hooks/useFetchData";
import DropdownMenuSearchable from "../../components/dropdown_menu_searchable";

// 1. Cập nhật Props
interface Materials_Ingredient_InputProps {
onClose?: () => void;
onSuccess?: () => void;
}

// 2. Interface (Chung)
interface DropdownOption {
value: string;
label: string;
data?: any; // Để lưu trữ thông tin bổ sung
}

// 3. Interfaces (API Payloads)
interface Process { id: string; name: string; } 
interface Passport { id: string; name: string; }
interface Hardness { id: string; value: string; }
interface InsertItem { id: string; value: string; }
interface SupportStep { id: string; value: string; }
interface AssignmentCode { 
id: string; 
code: string; 
name: string; 
}
interface Material { 
id: string; 
code: string; 
name: string;
assigmentCodeId: string; 
costAmmount: number; 
}

// 4. Interface (State nội bộ)
interface LocalTransactionRow extends ImportedTransactionRow {
materialId: string; 
assignmentCodeId: string; // <-- ID của Mã giao khoán
}

export default function Materials_Ingredient_Input({ onClose, onSuccess }: Materials_Ingredient_InputProps) {

  // ====== BẮT ĐẦU SỬA ĐỔI 1: Cập nhật Hàm Tiện Ích ======
  /**
   * (OUTPUT) Định dạng SỐ -> CHUỖI (vd: 1234.56 -> "1.234,56")
   * Yêu cầu: Dấu phẩy (,) thập phân, tối đa 4 số.
   */
  const formatLocalFloat = (num: number | undefined | null): string => {
    if (num === null || num === undefined) return "0";
    return new Intl.NumberFormat('vi-VN', { // 'vi-VN' dùng ',' thập phân
      maximumFractionDigits: 4,
    }).format(num);
  };
  
  /**
   * (INPUT - PARSE) Chuyển đổi CHUỖI (vd: "1.234,56") -> SỐ (1234.56)
   */
 const parseLocalFloat = (str: string | undefined | null): number => {
  if (!str) return 0;
  // 1. Xóa tất cả dấu chấm (ngăn cách hàng nghìn)
  // 2. Thay dấu phẩy (thập phân) bằng dấu chấm
  const cleanStr = String(str).replace(/\./g, "").replace(',', '.');
  return parseFloat(cleanStr || "0");
 };

  /**
   * (INPUT - HIỂN THỊ) Định dạng CHUỖI NHẬP (vd: "1234,5") -> CHUỖI HIỂN THỊ (vd: "1.234,5")
   * (Để thêm dấu chấm động khi gõ)
   */
  const formatForInput = (str: string | undefined | null): string => {
    if (str === null || str === undefined) return "";
    if (str === "") return ""; // Giữ lại giá trị rỗng
    
    // Tách phần nguyên và phần thập phân
    const parts = String(str).split(',');
    // Làm sạch phần nguyên (chỉ giữ số)
    const intPart = parts[0].replace(/[^0-9]/g, '');
    
    // Định dạng phần nguyên (thêm dấu '.')
    // Dùng 'de-DE' để đảm bảo không bị lỗi '1.000' -> '1' khi parse
    const formattedInt = new Intl.NumberFormat('de-DE').format(Number(intPart) || 0);

    // Nếu không có phần thập phân (ví dụ người dùng gõ "1234")
    if (parts.length === 1) {
      return formattedInt; // vd: "1.234"
    }
    
    // Nếu có phần thập phân (kể cả khi rỗng, vd: "123,")
    // parts[1] sẽ là "56" hoặc ""
    return formattedInt + ',' + parts[1]; // vd: "1.234,56" hoặc "1.234,"
  };
  // ====== KẾT THÚC SỬA ĐỔI 1 ======


// 5. ====== API setup ======
const postPath = "/api/pricing/materialunitprice";
const { postData, loading: saving, error: saveError } = useApi(postPath);

// API GET Dropdowns

const { fetchData: fetchProcesses, data: processes, loading: ld2 } = 
useApi<Process>("/api/process/productionprocess?pageIndex=1&pageSize=1000"); 
const { fetchData: fetchPassports, data: passports, loading: ld3 } = 
useApi<Passport>("/api/product/passport?pageIndex=1&pageSize=1000");
const { fetchData: fetchHardness, data: hardness, loading: ld4 } = 
useApi<Hardness>("/api/product/hardness?pageIndex=1&pageSize=1000");
const { fetchData: fetchInsertItems, data: insertItems, loading: ld5 } = 
useApi<InsertItem>("/api/product/insertitem?pageIndex=1&pageSize=1000");
const { fetchData: fetchSupportSteps, data: supportSteps, loading: ld6 } = 
useApi<SupportStep>("/api/product/supportstep?pageIndex=1&pageSize=1000");
const { fetchData: fetchAssignmentCodes, data: assignmentData, loading: ld7 } = 
useApi<any>("/api/catalog/assignmentcode?pageIndex=1&pageSize=1000");
const { fetchData: fetchMaterials, data: materialsData, loading: ld8 } = 
useApi<any>("/api/catalog/material?pageIndex=1&pageSize=1000");

// 6. ====== State ======
const [selectedProcess, setSelectedProcess] = useState<string>(""); 
const [selectedPassport, setSelectedPassport] = useState<string>("");
const [selectedHardness, setSelectedHardness] = useState<string>("");
const [selectedInsertItem, setSelectedInsertItem] = useState<string>("");
const [selectedSupportStep, setSelectedSupportStep] = useState<string>("");
const [selectedCodes, setSelectedCodes] = useState<string[]>([]); 
const [rows, setRows] = useState<LocalTransactionRow[]>([]); 

// 7. ====== Load dropdowns ======
const [isInitialLoading, setIsInitialLoading] = useState(true);
useEffect(() => {
const fetchAllData = async () => {
setIsInitialLoading(true); 
try {
 const results = await Promise.allSettled([
 fetchProcesses(),
 fetchPassports(),
 fetchHardness(),
 fetchInsertItems(),
 fetchSupportSteps(),
 fetchAssignmentCodes(),
 fetchMaterials(),
 ]);

 results.forEach((result, index) => {
 if (result.status === 'rejected') {
 console.error(`API call ${index} thất bại:`, result.reason);
 }
 });

} catch (error) {
 console.error('Lỗi không mong đợi:', error);
} finally {
 setIsInitialLoading(false);
}
};

fetchAllData();

}, [
fetchProcesses,
fetchPassports,
fetchHardness,
fetchInsertItems,
fetchSupportSteps,
fetchAssignmentCodes,
fetchMaterials,
]);

// THAY ĐỔI 1: Sửa logic trích xuất allMaterials
const allMaterials: Material[] = useMemo(() => {
if (!materialsData) return []; 
if (Array.isArray(materialsData) && materialsData.length > 0 && materialsData[0] && materialsData[0].items) {
return materialsData[0].items; 
}
if (Array.isArray(materialsData)) return materialsData; 
return [];
}, [materialsData]);


// 8. ====== Map options ======

const processOptions: DropdownOption[] = processes?.map((p) => ({ value: p.id, label: p.name })) || []; 
const passportOptions: DropdownOption[] = passports?.map((p) => ({ value: p.id, label: p.name })) || [];
const hardnessOptions: DropdownOption[] = hardness?.map((h) => ({ value: h.id, label: h.value })) || [];
const insertItemOptions: DropdownOption[] = insertItems?.map((i) => ({ value: i.id, label: i.value })) || [];
const supportStepOptions: DropdownOption[] = supportSteps?.map((s) => ({ value: s.id, label: s.value })) || [];

// THAY ĐỔI 2: Sửa logic trích xuất assignmentCodeOptions
const assignmentCodeOptions: DropdownOption[] = useMemo(() => {
if (!assignmentData) return []; 
if (Array.isArray(assignmentData) && assignmentData.length > 0 && assignmentData[0] && assignmentData[0].items) {
return assignmentData[0].items.map((a: AssignmentCode) => ({ value: a.id, label: a.code }));
}
if (Array.isArray(assignmentData)) { 
return assignmentData.map((a: AssignmentCode) => ({ value: a.id, label: a.code }));
}
return [];
}, [assignmentData]);

// 9. ====== TransactionSelector Handlers (LOGIC MỚI) ======
// (Hàm này không thay đổi, nó lưu SỐ THÔ (number) vào state)
const handleSelectChange = (newSelectedIds: string[]) => {
setSelectedCodes(newSelectedIds); 

if (!allMaterials || !assignmentData) return; 

// THAY ĐỔI 3: Sửa logic trích xuất mảng để tạo Map
let codesArray: AssignmentCode[] = [];
if (Array.isArray(assignmentData) && assignmentData.length > 0 && assignmentData[0] && assignmentData[0].items) {
codesArray = assignmentData[0].items;
} else if (Array.isArray(assignmentData)) {
codesArray = assignmentData;
}

const assignmentCodeMap = new Map<string, string>(
codesArray.map((a: AssignmentCode) => [a.id, a.code])
);

const oldRows = [...rows];
const newRows: LocalTransactionRow[] = [];

newSelectedIds.forEach(codeId => { 
const assignmentCodeValue = assignmentCodeMap.get(codeId) || codeId; 

const materialsForThisCode = allMaterials.filter(
(m) => m.assigmentCodeId === codeId
);

materialsForThisCode.forEach(material => {
const existingRow = oldRows.find(
(r) => r.assignmentCodeId === codeId && r.materialId === material.id
);

if (existingRow) {
existingRow.code = assignmentCodeValue; 
newRows.push(existingRow);
} else {
newRows.push({
id: `r${Date.now()}-${codeId}-${material.id}`, 
code: assignmentCodeValue, 
 assignmentCodeId: codeId, 
materialId: material.id, 
assetCode: material.code, 
unitPrice: material.costAmmount || 0, // <-- Giữ là NUMBER
quantity: "0",
total: 0, // <-- Giữ là NUMBER
});
}
});
});

setRows(newRows);
};

// (Hàm này không thay đổi, nó tính toán dựa trên SỐ THÔ (number) trong state)
const handleRowChange = (id: string, field: keyof ImportedTransactionRow, value: string) => {
if (field !== "quantity") return;

const rawValue = value;

// 1. CHẶN DẤU CHẤM: Xóa tất cả dấu chấm ('.') theo yêu cầu
const cleanValue = rawValue.replace(/\./g, ''); 

// 2. KIỂM TRA HỢP LỆ:
// Chỉ cho phép (số) hoặc (số + 1 dấu phẩy + số)
if (!/^[0-9]*(,[0-9]*)?$/.test(cleanValue)) {
 return; 
}

setRows((prevRows) =>
prevRows.map((row) => {
if (row.id === id) {
 const updatedRow = { ...row, quantity: cleanValue }; 
  
 const quantityNumber = parseLocalFloat(cleanValue); 
 const unitPrice = updatedRow.unitPrice ?? 0; 
 updatedRow.total = isNaN(quantityNumber) ? 0 : quantityNumber * unitPrice; 
 return updatedRow;
}
return row;
})
);
};

const handleRemoveRow = (id: string) => { 
setRows((prevRows) => prevRows.filter(row => row.id !== id));
};

// (Hàm này không thay đổi, nó gửi SỐ THÔ (float) lên API)
const handleSubmit = async (data: Record<string, string>) => {
const code = data["Mã định mức vật liệu"]?.trim() || "";

// Validation
if (!code) return alert("⚠️ Vui lòng nhập Mã định mức vật liệu!");
if (!selectedProcess) return alert("⚠️ Vui lòng chọn Công đoạn!"); 
if (!selectedPassport) return alert("⚠️ Vui lòng chọn Hộ chiếu!");
if (!selectedHardness) return alert("⚠️ Vui lòng chọn Độ kiên cố!");
if (!selectedInsertItem) return alert("⚠️ Vui lòng chọn Chèn!");
if (!selectedSupportStep) return alert("⚠️ Vui lòng chọn Bước chống!");
if (rows.length === 0) return alert("⚠️ Vui lòng chọn ít nhất một Mã giao khoán!");

for (const row of rows) {
const quantity = parseLocalFloat(row.quantity); 
if (isNaN(quantity) || quantity <= 0) {
const mgkLabel = row.code; 
return alert(`⚠️ Vui lòng nhập Số lượng (Định mức) hợp lệ cho Vật tư "${row.assetCode}" (MGK: ${mgkLabel})!`);
}
}

// Tạo payload
const payload = {
code, 
processId: selectedProcess, 
passportId: selectedPassport,
hardnessId: selectedHardness,
insertItemId: selectedInsertItem,
supportStepId: selectedSupportStep,
costs: rows.map(row => ({
assignmentCodeId: row.assignmentCodeId, 
materialId: row.materialId, 
quantity: parseLocalFloat(row.quantity), 
})),
};

console.log("📤 POST payload:", payload);

await postData(payload, () => {
console.log("✅ Tạo đơn giá vật liệu thành công!");
onSuccess?.();
onClose?.();
});
};

// 11. ====== Fields (LayoutInput) ======
const fields = [
{ label: "Mã định mức vật liệu", type: "text" as const, placeholder: "Nhập mã định mức dữ liệu" },
{ type: "custom2" as const }, 
{ type: "custom3" as const }, 
{ type: "custom4" as const }, 
{ type: "custom5" as const }, 
{ type: "custom6" as const }, 
{ label: "", type: "customTransactionSelector" as const },
];

const isLoading = ld2 || ld3 || ld4 || ld5 || ld6 || ld7 || ld8 || saving;
const anyError = saveError;


// ====== BẮT ĐẦU SỬA ĐỔI 2: Cập nhật 'displayRows' ======
const displayRows = useMemo(() => {
 return rows.map(row => ({
  ...row,
    // SỬA: Dùng formatLocalFloat (dấu phẩy ,)
  unitPrice: formatLocalFloat(row.unitPrice),
    // SỬA: Dùng formatLocalFloat (dấu phẩy ,)
  total: formatLocalFloat(row.total),
    // THÊM: Định dạng 'quantity' (là string "1234,5") thành "1.234,5"
    quantity: formatForInput(row.quantity),
 }));
}, [rows]); // Phụ thuộc vào 'rows'. Sẽ tự động tính toán lại khi 'rows' thay đổi.
// ====== KẾT THÚC SỬA ĐỔI 2 ======


return (
<LayoutInput
title01="Đơn giá và định mức / Đơn giá và định mức Vật liệu"
title="Tạo mới Đơn giá và định mức Vật liệu"
fields={fields}
onSubmit={handleSubmit}
closePath={PATHS.MATERIALS_INGREDIENT.LIST}
onClose={onClose}
initialData={{
"Mã định mức vật liệu": ""
}}
>
{/* 12. Render Dropdowns */}

<div className="custom2" key="c2">
<DropdownMenuSearchable
label="Công đoạn" 
options={processOptions}
value={selectedProcess}
onChange={setSelectedProcess}
placeholder="Chọn công đoạn"
isDisabled={ld2}
/>
</div>
<div className="custom3" key="c3">
<DropdownMenuSearchable
label="Hộ chiếu, Sđ, Sc"
options={passportOptions}
value={selectedPassport}
onChange={setSelectedPassport}
placeholder="Chọn hộ chiếu"
isDisabled={ld3}
/>
</div>
<div className="custom4" key="c4">
<DropdownMenuSearchable
label="Độ kiên cố đá/ than (f)"
options={hardnessOptions}
value={selectedHardness}
onChange={setSelectedHardness}
placeholder="Chọn độ kiên cố"
isDisabled={ld4}
/>
</div>
<div className="custom5" key="c5">
<DropdownMenuSearchable
label="Chèn"
options={insertItemOptions}
value={selectedInsertItem}
onChange={setSelectedInsertItem}
placeholder="Chọn chèn..."
isDisabled={ld5}
/>
</div>
<div className="custom6" key="c6">
<DropdownMenuSearchable
label="Bước chống"
options={supportStepOptions}
value={selectedSupportStep}
onChange={setSelectedSupportStep}
placeholder="Chọn bước chống"
isDisabled={ld6}
/>
</div>

{/* ====== BẮT ĐẦU SỬA ĐỔI 3: Truyền 'displayRows' vào 'TransactionSelector' ====== */}
<TransactionSelector
label="Mã giao khoán"
className="customTransactionSelector" 
options={assignmentCodeOptions} // Dropdown dùng code
selectedCodes={selectedCodes}

 // Sửa: Truyền 'displayRows' (đã định dạng) thay vì 'rows' (số thô)
rows={displayRows as any} 

onSelectChange={handleSelectChange}
onRowChange={handleRowChange}
onRemoveRow={handleRemoveRow}
/>
 {/* ====== KẾT THÚC SỬA ĐỔI 3 ====== */}
</LayoutInput>
);
}