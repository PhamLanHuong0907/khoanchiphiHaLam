import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import FormRow from "../../../components/formRow"; // Đảm bảo FormRow.tsx đã được cập nhật
import PATHS from "../../../hooks/path";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable";
import { useApi } from "../../../hooks/useFetchData";

interface EquipmentEditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

// Interface cho chi phí (từ API)
interface EquipmentCost {
  startDate: string;
  endDate: string;
  costType: number;
  amount: number;
}

// Interface cho Equipment (từ API GET {id})
interface Equipment {
  id: string;
  code: string;
  name: string;
  unitOfMeasureId: string;
  costs: EquipmentCost[]; // Giả định API GET {id} trả về mảng này
}

// Interface cho state quản lý hàng chi phí
interface CostRow {
  id: number; // Key cho React
  startDate: string;
  endDate: string;
  amount: string; // Dùng string cho input
}

// Interface cho state dropdown
interface DropdownOption {
  value: string;
  label: string;
}

const EquipmentEdit: React.FC<EquipmentEditProps> = ({ id, onClose, onSuccess }) => {
  // ====== API setup ======
  const equipmentPath = "/api/catalog/equipment";
  const unitPath = "/api/catalog/unitofmeasure";

  // API cho Equipment (GET by Id, PUT)
  const { fetchById, putData } =
    useApi<Equipment>(equipmentPath);
  
  // API cho Đơn vị tính
  const { fetchData: fetchUnits, data: units, loading: loadingUnit } =
    useApi<{ id: string; name: string }>(unitPath);

  // ====== State ======
  const [currentEquipment, setCurrentEquipment] = useState<Equipment | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
  });

  // State cho danh sách hàng chi phí
  const [costRows, setCostRows] = useState<CostRow[]>([
    { id: Date.now(), startDate: "", endDate: "", amount: "" }
  ]);

  // ====== Load equipment by ID ======
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id);
      if (res) setCurrentEquipment(res as Equipment);
    };
    loadData();
  }, [id, fetchById]);

  // ====== Load dropdowns ======
  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  // ====== Sync data to form (Đồng bộ dữ liệu load được vào state) ======
  useEffect(() => {
    if (currentEquipment) {
      // 1. Đồng bộ các trường chính
      setFormData({
        code: currentEquipment.code,
        name: currentEquipment.name,
      });
      setSelectedUnit(currentEquipment.unitOfMeasureId || "");

      // 2. Đồng bộ danh sách 'costs' vào 'costRows'
      if (currentEquipment.costs && currentEquipment.costs.length > 0) {
        setCostRows(currentEquipment.costs.map((cost, index) => ({
          id: Date.now() + index,
          startDate: cost.startDate,
          endDate: cost.endDate,
          amount: cost.amount.toString(),
        })));
      } else {
        setCostRows([{ id: Date.now(), startDate: "", endDate: "", amount: "" }]);
      }
    }
  }, [currentEquipment]); // Phụ thuộc vào currentEquipment

  // Map options cho dropdown ĐVT
  const unitOptions: DropdownOption[] =
    units?.map((u) => ({ value: u.id, label: u.name })) || [];

  // ====== PUT submit ======
  const handleSubmit = async (data: Record<string, string>) => {
    if (!id) return alert("❌ Thiếu ID để cập nhật!");

    const code = data["Mã thiết bị"]?.trim();
    const name = data["Tên thiết bị"]?.trim();
    const unitOfMeasureId = selectedUnit;

    if (!code) return alert("⚠️ Vui lòng nhập Mã thiết bị!");
    if (!name) return alert("⚠️ Vui lòng nhập Tên thiết bị!");
    if (!unitOfMeasureId) return alert("⚠️ Vui lòng chọn Đơn vị tính!");

    // Tạo payload
    const payload = { 
      id,
      code,
      name,
      unitOfMeasureId,
      costs: costRows.map(row => ({
        startDate: row.startDate || new Date().toISOString(),
        endDate: row.endDate || new Date().toISOString(),
        costType: 1, // Giữ nguyên costType = 1
        amount: parseFloat(row.amount || "0"),
      })),
    };

    console.log("📤 PUT payload:", payload);

    await putData( payload, () => {
      console.log("✅ Cập nhật thiết bị thành công!");
      onSuccess?.();
      onClose?.();
    });
  };

  // ====== Fields (Định nghĩa cho LayoutInput) ======
  const fields = [
    { label: "Mã thiết bị", type: "text" as const, placeholder: "Nhập mã thiết bị, ví dụ: BDLT5054" },
    { label: "Tên thiết bị", type: "text" as const, placeholder: "Nhập tên thiết bị, ví dụ: Bơm điện LT 50/54" },
    { type: "custom1" as const }, // placeholder cho dropdown Đơn vị tính
  ];

  // ====== Logic quản lý FormRow (Costs) ======
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
      label: "Đơn giá",
      placeholder: "Nhập đơn giá điện năng",
      type: "number" as const,
      value: row.amount,
      onChange: (value: string) => 
        handleCostRowChange(index, 'amount', value),
    },
  ]);

  return (
      <LayoutInput
        title01="Danh mục / Mã thiết bị"
        title="Chỉnh sửa Mã thiết bị"
        fields={fields}
        onSubmit={handleSubmit}
        formRowComponent={
          <FormRow
            title="Đơn giá điện năng"
            title1="điện năng"
            rows={formRowPropData}
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
        shouldSyncInitialData={true} // Bật cờ đồng bộ khi data load về
      >
        {/* Custom slot "custom1" cho Đơn vị tính */}
        <div className="custom1" key={1}>
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

export default EquipmentEdit;