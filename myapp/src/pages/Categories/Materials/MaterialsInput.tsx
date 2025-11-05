import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import FormRow from "../../../components/formRow"; // Đảm bảo FormRow.tsx cũng đã được cập nhật
import PATHS from "../../../hooks/path";
import { useApi } from "../../../hooks/useFetchData";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable";

interface MaterialsInputProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

interface DropdownOption {
  value: string;
  label: string;
}

// BỔ SUNG: Định nghĩa kiểu dữ liệu cho một hàng đơn giá
interface CostRow {
  id: number; // Dùng làm key duy nhất cho React
  startDate: string;
  endDate: string;
  amount: string; // Dùng string để dễ quản lý input
}

const MaterialsInput: React.FC<MaterialsInputProps> = ({ onClose, onSuccess }) => {
  // ====== API setup ======
  const materialPath = "/api/catalog/material";
  const assignmentCodePath = "/api/catalog/assignmentcode?pageIndex=1&pageSize=10000";
  const unitPath = "/api/catalog/unitofmeasure?pageIndex=1&pageSize=10000";

  const { fetchData: fetchAssignmentCodes, data: assignmentCodes, loading: loadingAssignment } = // Bổ sung error
    useApi<{ id: string; code: string }>(assignmentCodePath);
  const { fetchData: fetchUnits, data: units, loading: loadingUnit } = // Bổ sung error
    useApi<{ id: string; name: string }>(unitPath);
  const { postData } = useApi(materialPath);

  // ====== State ======
  const [selectedAssignmentCode, setSelectedAssignmentCode] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [formData] = useState({
    code: "",
    name: "",
    // SỬA ĐỔI: Xóa 'amount' khỏi đây
  });
  
  // SỬA ĐỔI: Xóa state 'startDate' và 'endDate'
  // const [startDate, setStartDate] = useState<string>("");
  // const [endDate, setEndDate] = useState<string>("");

  // BỔ SUNG: State mới để quản lý danh sách các hàng đơn giá
  const [costRows, setCostRows] = useState<CostRow[]>([
    { id: Date.now(), startDate: "", endDate: "", amount: "" } // Hàng đầu tiên
  ]);

  // ====== Load dropdowns ======
  useEffect(() => {
    fetchAssignmentCodes();
    fetchUnits();
  }, [fetchAssignmentCodes, fetchUnits]);

  const assignmentOptions: DropdownOption[] =
    assignmentCodes?.map((a) => ({ value: a.id, label: a.code })) || [];
  const unitOptions: DropdownOption[] =
    units?.map((u) => ({ value: u.id, label: u.name })) || [];

  // ====== Handle submit (SỬA ĐỔI) ======
  const handleSubmit = async (data: Record<string, string>) => {
    const code = data["Mã vật tư, tài sản"]?.trim();
    const name = data["Tên vật tư, tài sản"]?.trim();
    // SỬA ĐỔI: Xóa 'amount'
    // const amount = parseFloat(data["Đơn giá vật tư"] || "0");

    if (!selectedAssignmentCode) return alert("⚠️ Vui lòng chọn Mã giao khoán!");
    if (!selectedUnit) return alert("⚠️ Vui lòng chọn Đơn vị tính!");
    if (!code) return alert("⚠️ Vui lòng nhập Mã vật tư, tài sản!");
    if (!name) return alert("⚠️ Vui lòng nhập Tên vật tư, tài sản!");

    // SỬA ĐỔI: Tạo payload từ 'formData' và 'costRows' state
    const payload = {
      code,
      name,
      assigmentCodeId: selectedAssignmentCode,
      unitOfMeasureId: selectedUnit,
      // Map qua state 'costRows' để tạo mảng 'costs' đúng chuẩn JSON
      costs: costRows.map(row => ({
        startDate: row.startDate || new Date().toISOString(), // Dùng giá trị mặc định nếu rỗng
        endDate: row.endDate || new Date().toISOString(), // Dùng giá trị mặc định nếu rỗng
        costType: 1,
        amount: parseFloat(row.amount || "0"), // Chuyển đổi amount sang số
      })),
    };

    console.log("📤 POST payload:", payload);

    await postData(payload, () => {
      console.log("✅ Tạo vật tư thành công!");
      onSuccess?.();
      onClose?.();
    });
  };

  // ====== Fields (giữ nguyên) ======
  const fields = [
    { type: "custom1" as const }, // placeholder cho dropdown Mã giao khoán
    { label: "Mã vật tư, tài sản", type: "text" as const, placeholder: "Nhập mã vật tư, tài sản , ví dụ: TN01" },
    { label: "Tên vật tư, tài sản", type: "text" as const, placeholder: "Nhập tên vật tư, tài sản, ví dụ: Thuốc nổ" },
    { type: "custom2" as const }, // placeholder cho dropdown Đơn vị tính
  ];

  // ====== BỔ SUNG: Các hàm quản lý state 'costRows' ======

  // Hàm cập nhật một trường trong một hàng
  const handleCostRowChange = (
    rowIndex: number,
    fieldName: keyof CostRow, // 'startDate', 'endDate', hoặc 'amount'
    
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
      { id: Date.now(), startDate: "", endDate: "", amount: "" } // Thêm hàng rỗng mới
    ]);
  };

  // Hàm xóa một hàng
  const handleRemoveCostRow = (rowIndex: number) => {
    if (costRows.length <= 1) return; // Không cho xóa hàng cuối cùng
    setCostRows(currentRows => currentRows.filter((_, index) => index !== rowIndex));
  };

  // SỬA ĐỔI: Tạo 'rows' prop cho FormRow từ state 'costRows'
  const formRowPropData = costRows.map((row, index) => [
    {
      label: "Ngày bắt đầu",
      placeholder: "dd/mm/yy",
      type: "date" as const,
      value: row.startDate ? new Date(row.startDate) : null, // Chuyển string sang Date
      onChange: (date: Date | null) => 
        handleCostRowChange(index, 'startDate', date?.toISOString() || ""), // Chuyển Date sang string
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
      label: "Đơn giá vật tư",
      placeholder: "Nhập đơn giá",
      type: "number" as const,
      value: row.amount, // value là string
      onChange: (value: string) => 
        handleCostRowChange(index, 'amount', value), // onChange là string
    },
  ]);

  return (
    // BỌC BẰNG FRAGMENT
      <LayoutInput
        title01="Danh mục / Vật tư, tài sản"
        title="Tạo mới Vật tư, tài sản"
        fields={fields}
        onSubmit={handleSubmit}
        // SỬA ĐỔI: Truyền 'rows' và các hàm handler mới vào FormRow
        formRowComponent={
          <FormRow
            title="Đơn giá vật tư"
            title1="vật tư"
            rows={formRowPropData} // Prop 'rows' động từ state
            onAdd={handleAddCostRow} // Hàm thêm hàng
            onRemove={handleRemoveCostRow} // Hàm xóa hàng
          />
        }
        closePath={PATHS.MATERIALS.LIST}
        onClose={onClose}
        initialData={{
          "Mã vật tư, tài sản": formData.code,
          "Tên vật tư, tài sản": formData.name,
          // SỬA ĐỔI: Xóa 'Đơn giá vật tư' khỏi initialData
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