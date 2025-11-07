import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import FormRow from "../../../components/formRow"; // Make sure FormRow.tsx is updated
import PATHS from "../../../hooks/path";
import { useApi } from "../../../hooks/useFetchData";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable";

interface SparePartsInputProps {
 onClose?: () => void;
 onSuccess?: () => void;
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

const SparePartsInput: React.FC<SparePartsInputProps> = ({ onClose, onSuccess }) => {
  
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

  
 // ====== API setup ======
 const partPath = "/api/catalog/part";
 const unitPath = "/api/catalog/unitofmeasure?pageIndex=1&pageSize=1000";
 const equipmentPath = "/api/catalog/equipment?pageIndex=1&pageSize=1000"; // API path for equipment

 // API for POSTing Spare Part data
 const { postData, loading: saving, error: saveError } = useApi(partPath);

 // API for fetching Units dropdown
 const { fetchData: fetchUnits, data: units, loading: loadingUnit, error: errorUnit } =
  useApi<{ id: string; name: string }>(unitPath);

 // API for fetching Equipment dropdown
 const { fetchData: fetchEquipments, data: equipments, loading: loadingEquipment, error: errorEquipment } =
  useApi<{ id: string; code: string; name?: string }>(equipmentPath); // Assuming equipment has code/name

 // ====== State ======
 const [selectedUnitId, setSelectedUnitId] = useState<string>("");
 const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>(""); // State for selected equipment
 const [formData, setFormData] = useState({
  code: "", // Mã phụ tùng
  name: "", // Tên phụ tùng
 });
 const [costRows, setCostRows] = useState<CostRow[]>([
  { id: Date.now(), startDate: "", endDate: "", amount: "" } // Initial cost row
 ]);

 // ====== Load dropdowns ======
 const [isInitialLoading, setIsInitialLoading] = useState(true);

useEffect(() => {
  // 1. Định nghĩa một hàm async bên trong
  const fetchAllData = async () => {
   setIsInitialLoading(true); // Bắt đầu loading

   try {
    // 2. Gọi Promise.allSettled với MẢNG các hàm fetch
    const results = await Promise.allSettled([
     fetchUnits(),
     fetchEquipments(),
    ]);

    // 3. (Tùy chọn) Kiểm tra kết quả
    results.forEach((result, index) => {
     if (result.status === 'rejected') {
      // Log ra API nào bị lỗi
      console.error(`API call ${index} thất bại:`, result.reason);
     }
    });

   } catch (error) {
    // 4. Bắt các lỗi cú pháp hoặc lỗi không mong đợi
    console.error('Lỗi không mong đợi khi fetch dữ liệu:', error);
   } finally {
    // 5. Tắt loading sau khi TẤT CẢ đã hoàn thành
    setIsInitialLoading(false);
   }
  };

  // 6. Gọi hàm async
  fetchAllData();

  // 7. Mảng dependencies giữ nguyên
 }, [fetchUnits, fetchEquipments]);

 // Map options for dropdowns
 const unitOptions: DropdownOption[] =
  units?.map((u) => ({ value: u.id, label: u.name })) || [];
 
 const equipmentOptions: DropdownOption[] =
  equipments?.map((e) => ({ value: e.id, label: `${e.code} - ${e.name || ''}` })) || []; // Combine code and name for label

 // ====== Handle submit ======
 const handleSubmit = async (data: Record<string, string>) => {
  // Get data from LayoutInput's fields
  const code = data["Mã phụ tùng"]?.trim();
  const name = data["Tên phụ tùng"]?.trim();

  // Get data from state
  const unitOfMeasureId = selectedUnitId;
  const equipmentId = selectedEquipmentId;

  // Validation
  if (!equipmentId) return alert("⚠️ Vui lòng chọn Thiết bị!");
  if (!code) return alert("⚠️ Vui lòng nhập Mã phụ tùng!");
  if (!name) return alert("⚠️ Vui lòng nhập Tên phụ tùng!");
  if (!unitOfMeasureId) return alert("⚠️ Vui lòng chọn Đơn vị tính!");

  // Construct payload according to JSON structure
  const payload = {
   code,
   name,
   unitOfMeasureId,
   equipmentId,
   costs: costRows.map(row => ({
    startDate: row.startDate || new Date().toISOString(),
    endDate: row.endDate || new Date().toISOString(),
    costType: 1, // Assuming costType is always 1 for spare parts
        // row.amount LÀ GIÁ TRỊ SẠCH (VD: "100000"), NÊN parseFloat HOẠT ĐỘNG ĐÚNG
    amount: parseFloat(row.amount || "0"),
   })),
  };

  console.log("📤 POST payload:", payload);

  // Call API to post data
  await postData(payload, () => {
   console.log("✅ Tạo phụ tùng thành công!");
   onSuccess?.(); // Refresh table
   onClose?.();  // Close popup
  });
 };

 // ====== Fields definition for LayoutInput ======
 const fields = [
  // Use custom slots for dropdowns
  { type: "custom1" as const }, // Placeholder for Equipment dropdown
  { label: "Mã phụ tùng", type: "text" as const, placeholder: "Nhập mã phụ tùng, ví dụ: BCTB" },
  { label: "Tên phụ tùng", type: "text" as const, placeholder: "Nhập tên phụ tùng, ví dụ: Bánh công tác bơm LT50-50" },
  { type: "custom2" as const }, // Placeholder for Unit of Measure dropdown
 ];

 // ====== Cost Row Management Logic ======
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

 // Prepare 'rows' prop for FormRow component
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
    
    // ====== BẮT ĐẦU SỬA ĐỔI ĐƠN GIÁ ======
  {
   label: "Đơn giá phụ tùng", // Changed label from "Đơn giá vật tư"
   placeholder: "Nhập đơn giá phụ tùng", // Changed placeholder
   type: "text" as const, // <-- ĐỔI SANG "text"
      
      // HIỂN THỊ: Luôn hiển thị giá trị đã được format
   value: formatNumberForDisplay(row.amount), 
      
   onChange: (value: string) => {
        // CẬP NHẬT STATE: Phân tích input về "giá trị sạch"
    const parsedValue = parseFormattedNumber(value);
        
        // Chỉ cập nhật nếu nó là số hoặc rỗng
    if (!isNaN(Number(parsedValue)) || parsedValue === "") {
     handleCostRowChange(index, 'amount', parsedValue);
    }
   },
  },
    // ====== KẾT THÚC SỬA ĐỔI ĐƠN GIÁ ======
 ]);

 return (
   <LayoutInput
    title01="Danh mục / Phụ tùng"
    title="Tạo mới Phụ tùng"
    fields={fields}
    onSubmit={handleSubmit}
    // Pass FormRow management props
    formRowComponent={
     <FormRow
      title="Đơn giá phụ tùng" // Changed title from "Bảng vật tư"
     title1="phụ tùng"
      rows={formRowPropData}
      onAdd={handleAddCostRow}
      onRemove={handleRemoveCostRow}
     />
    }
    closePath={PATHS.SPARE_PARTS.LIST} // Ensure this path is correct
    onClose={onClose}
    initialData={{
     // Link text fields to formData state
     "Mã phụ tùng": formData.code,
     "Tên phụ tùng": formData.name,
    }}
   >
    {/* Custom slot for Equipment dropdown */}
    <div className="custom1" key={1}>
 <DropdownMenuSearchable
      label="Mã thiết bị"
      options={equipmentOptions}
      value={selectedEquipmentId}
      onChange={setSelectedEquipmentId}
      placeholder="Chọn thiết bị..."
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
      placeholder="Chọn đơn vị tính..."
      isDisabled={loadingUnit}
     />
    </div>
   </LayoutInput> );
};

export default SparePartsInput;