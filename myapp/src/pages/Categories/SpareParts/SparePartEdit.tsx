import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import FormRow from "../../../components/formRow"; // Make sure FormRow.tsx is updated
import PATHS from "../../../hooks/path";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable";
import { useApi } from "../../../hooks/useFetchData";

interface SparePartsEditProps {
  id?: string; // ID of the spare part to edit
  onClose?: () => void;
  onSuccess?: () => void;
}

// CORRECTED: Interface for the cost object within the costs array
interface SparePartCost {
  startDate: string;
  endDate: string;
  costType: number;
  amount: number;
}

// CORRECTED: Interface matching the ACTUAL GET /api/catalog/part/{id} response
interface SparePart {
  id: string;
  code: string;
  name: string;
  unitOfMeasureId: string;
  unitOfMeasureName?: string; // Keep optional if needed elsewhere
  equipmentId: string;
  equipmentCode?: string; // Keep optional if needed elsewhere
  costs: SparePartCost[]; // <-- CORRECT: Expects the costs array
  // costAmount is NOT here
}

// Interface for state management of cost rows in the form
interface CostRow {
  id: number; // React key
  startDate: string;
  endDate: string;
  amount: string; // Use string for input management
}

// Interface for dropdown options
interface DropdownOption {
  value: string;
  label: string;
}

const SparePartsEdit: React.FC<SparePartsEditProps> = ({ id, onClose, onSuccess }) => {
  // ====== API setup ======
  const partPath = "/api/catalog/part";
  const unitPath = "/api/catalog/unitofmeasure";
  const equipmentPath = "/api/catalog/equipment";

  // CORRECTED: useApi uses the correct interface for fetching
  const { fetchById, putData, loading: loadingPart, error: errorPart } =
    useApi<SparePart>(partPath);

  // API hook for Units dropdown
  const { fetchData: fetchUnits, data: units, loading: loadingUnit, error: errorUnit } =
    useApi<{ id: string; name: string }>(unitPath);

  // API hook for Equipment dropdown
  const { fetchData: fetchEquipments, data: equipments, loading: loadingEquipment, error: errorEquipment } =
    useApi<{ id: string; code: string; name?: string }>(equipmentPath);

  // ====== State ======
  const [currentSparePart, setCurrentSparePart] = useState<SparePart | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>("");
  const [formData, setFormData] = useState({
    code: "", // Mã phụ tùng
    name: "", // Tên phụ tùng
  });
  // State for cost rows, initialized based on GET response
  const [costRows, setCostRows] = useState<CostRow[]>([
    { id: Date.now(), startDate: "", endDate: "", amount: "" }
  ]);

  // ====== Load spare part by ID ======
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      // fetchById now returns data matching the CORRECTED SparePart interface
      const res = await fetchById(id);
      if (res) setCurrentSparePart(res as SparePart);
    };
    loadData();
  }, [id, fetchById]);

  // ====== Load dropdowns ======
  useEffect(() => {
    fetchUnits();
    fetchEquipments();
  }, [fetchUnits, fetchEquipments]);

  // ====== Sync fetched data to form state ======
  // This useEffect logic is now CORRECT because currentSparePart matches the API data
  useEffect(() => {
    if (currentSparePart) {
      // Sync main fields
      setFormData({
        code: currentSparePart.code,
        name: currentSparePart.name,
      });
      setSelectedUnitId(currentSparePart.unitOfMeasureId || "");
      setSelectedEquipmentId(currentSparePart.equipmentId || "");

      // Sync the 'costs' array from API to 'costRows' state
      if (currentSparePart.costs && currentSparePart.costs.length > 0) {
        setCostRows(currentSparePart.costs.map((cost, index) => ({
          id: Date.now() + index,
          startDate: cost.startDate,
          endDate: cost.endDate,
          amount: cost.amount.toString(), // Convert number to string for input
        })));
      } else {
        // If API returns no costs, ensure there's one empty row
        setCostRows([{ id: Date.now(), startDate: "", endDate: "", amount: "" }]);
      }
    }
  }, [currentSparePart]); // Dependency: run when currentSparePart data arrives

  // Map options for dropdowns
  const unitOptions: DropdownOption[] =
    units?.map((u) => ({ value: u.id, label: u.name })) || [];
  
  const equipmentOptions: DropdownOption[] =
    equipments?.map((e) => ({ value: e.id, label: `${e.code} - ${e.name || ''}` })) || [];

  // ====== PUT submit (This part was already correct) ======
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

    // Construct payload for PUT (using the complex structure with costs array)
    const payload = {
      id, // Include ID in the payload
      code,
      name,
      unitOfMeasureId,
      equipmentId,
      costs: costRows.map(row => ({
        startDate: row.startDate || new Date().toISOString(),
        endDate: row.endDate || new Date().toISOString(),
        costType: 1, // Keep costType as 1, adjust if needed
        amount: parseFloat(row.amount || "0"),
      })),
    };

    console.log("📤 PUT payload:", payload);

    try {
      // Call putData WITHOUT the first 'id' parameter
      await putData(payload as any); // Use 'as any' to bypass type mismatch if needed

      console.log("✅ Cập nhật phụ tùng thành công!");
      onSuccess?.(); // Refresh table
      onClose?.();   // Close popup
    } catch (err) {
       console.error("Error during PUT request in handleSubmit:", err);
    }
  };

  // ====== Fields definition for LayoutInput ======
  const fields = [
    { type: "custom1" as const }, // Placeholder for Equipment dropdown
    { label: "Mã phụ tùng", type: "text" as const, placeholder: "Nhập mã phụ tùng, ví dụ: BCTB" },
    { label: "Tên phụ tùng", type: "text" as const, placeholder: "Nhập tên phụ tùng, ví dụ: Bánh công tác bơm LT50-50" },
    { type: "custom2" as const }, // Placeholder for Unit of Measure dropdown
  ];

  // ====== Cost Row Management Logic (identical to Input) ======
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
    {
      label: "Đơn giá phụ tùng", // Changed label
      placeholder: "Nhập đơn giá phụ tùng", // Changed placeholder
      type: "number" as const,
      value: row.amount,
      onChange: (value: string) =>
        handleCostRowChange(index, 'amount', value),
    },
  ]);

  return (
      <LayoutInput
        title01="Danh mục / Phụ tùng"
        title="Chỉnh sửa Phụ tùng"
        fields={fields}
        onSubmit={handleSubmit}
        // Pass FormRow management props
        formRowComponent={
          <FormRow
            title="Đơn giá phụ tùng" // Changed title
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
        shouldSyncInitialData={true} // Enable syncing when data loads
      >
        {/* Custom slot for Equipment dropdown */}
        <div className="custom1" key={1}>
          <DropdownMenuSearchable
            label="Thiết bị"
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
      </LayoutInput>
  );
};

export default SparePartsEdit;