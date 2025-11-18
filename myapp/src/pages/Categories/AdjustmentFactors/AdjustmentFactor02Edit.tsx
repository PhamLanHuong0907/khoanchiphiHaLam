import PATHS from "../../../hooks/path";
import LayoutInput from "../../../layout/layout_input";
import { useApi } from "../../../hooks/useFetchData"; // 2. Import useApi
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable"; // 2. Import Dropdown
import { useState, useEffect } from "react";
// 3. Cập nhật props
interface AdjustmentFactors02EditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

// Interface cho Dropdown
interface DropdownOption {
  value: string;
  label: string;
}

// Interface cho API GET {id} (dựa trên mẫu JSON file List)
interface AdjustmentFactorDescription {
  id: string;
  description: string;
  adjustmentFactorId: string;
  processGroupId: string;
  maintenanceAdjustmentValue: number;
  electricityAdjustmentValue: number;
}

// Interface cho API GET Dropdown
interface ProcessGroup {
  id: string;
  name: string; 
}
interface AdjustmentFactor {
  id: string;
  code: string; 
}

export default function AdjustmentFactors02Edit({ id, onClose, onSuccess }: AdjustmentFactors02EditProps) {
  // 4. Khai báo API
  const basePath = "/api/adjustment/adjustmentfactordescription";
  const processGroupPath = "/api/process/processgroup";
  const adjustmentFactorPath = "/api/adjustment/adjustmentfactor";

  // API GET/PUT
  const { fetchById, putData, loading: loadingData, error: dataError } =
    useApi<AdjustmentFactorDescription>(basePath);

  // API GET Dropdowns
  const { fetchData: fetchProcessGroups, data: processGroups, loading: loadingProcessGroup, error: errorProcessGroup } =
    useApi<ProcessGroup>(processGroupPath);
  const { fetchData: fetchAdjustmentFactors, data: adjustmentFactors, loading: loadingFactor, error: errorFactor } =
    useApi<AdjustmentFactor>(adjustmentFactorPath);

  // 5. State
  const [currentData, setCurrentData] = useState<AdjustmentFactorDescription | null>(null);
  const [selectedProcessGroup, setSelectedProcessGroup] = useState<string>("");
  const [selectedAdjustmentFactor, setSelectedAdjustmentFactor] = useState<string>("");
  const [formData, setFormData] = useState({
    description: "",
    maintenanceValue: "",
    electricityValue: "",
  });

  // 6. Load data by ID
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id);
      if (res) setCurrentData(res as AdjustmentFactorDescription);
    };
    loadData();
  }, [id, fetchById]);

  // 7. Load dropdown data
  useEffect(() => {
    fetchProcessGroups();
    fetchAdjustmentFactors();
  }, [fetchProcessGroups, fetchAdjustmentFactors]);

  // 8. Sync data to form state
  useEffect(() => {
    if (currentData) {
      setFormData({
        description: currentData.description || "",
        maintenanceValue: currentData.maintenanceAdjustmentValue?.toString() || "0",
        electricityValue: currentData.electricityAdjustmentValue?.toString() || "0",
      });
      setSelectedProcessGroup(currentData.processGroupId || "");
      setSelectedAdjustmentFactor(currentData.adjustmentFactorId || "");
    }
  }, [currentData]);

  // 9. Map options
  const processGroupOptions: DropdownOption[] =
    processGroups?.map((g) => ({ value: g.id, label: g.name })) || [];
  const adjustmentFactorOptions: DropdownOption[] =
    adjustmentFactors?.map((f) => ({ value: f.id, label: f.code })) || [];

  // 10. Cập nhật handleSubmit (logic PUT)
  const handleSubmit = async (data: Record<string, string>) => {
    if (!id) return alert("❌ Thiếu ID để cập nhật!");

    const description = data["Diễn giải"]?.trim();
    const maintenanceValueStr = data["Trị số điều chỉnh SCTX"]?.trim();
    const electricityValueStr = data["Trị số điều chỉnh điện năng"]?.trim();

    // Validation
    if (!selectedProcessGroup) return alert("⚠️ Vui lòng chọn Nhóm công đoạn!");
    if (!selectedAdjustmentFactor) return alert("⚠️ Vui lòng chọn Mã hệ số điều chỉnh!");
    if (!description) return alert("⚠️ Vui lòng nhập Diễn giải!");
    if (!maintenanceValueStr) return alert("⚠️ Vui lòng nhập Trị số SCTX!");
    if (!electricityValueStr) return alert("⚠️ Vui lòng nhập Trị số điện năng!");

    const maintenanceAdjustmentValue = parseFloat(maintenanceValueStr);
    const electricityAdjustmentValue = parseFloat(electricityValueStr);

    if (isNaN(maintenanceAdjustmentValue)) return alert("⚠️ Trị số SCTX phải là một con số!");
    if (isNaN(electricityAdjustmentValue)) return alert("⚠️ Trị số điện năng phải là một con số!");

    // Payload (thêm ID)
    const payload = {
      id,
      description,
      adjustmentFactorId: selectedAdjustmentFactor,
      processGroupId: selectedProcessGroup,
      maintenanceAdjustmentValue,
      electricityAdjustmentValue,
    };

    console.log("📤 PUT payload:", payload);

    await putData( payload, () => {
      alert("✅ Cập nhật diễn giải thành công!");
      onSuccess?.();
      onClose?.();
    });
  };

  // 11. Cập nhật fields
  const fields = [
    { type: "custom1" as const }, 
    { type: "custom2" as const }, 
    { label: "Diễn giải", type: "text" as const, placeholder: "Nhập thông số diễn giải" },
    { label: "Trị số điều chỉnh SCTX", type: "text" as const, placeholder: "Nhập trị số điều chỉnh SCTX" },
    { label: "Trị số điều chỉnh điện năng", type: "text" as const, placeholder: "Nhập trị số điều chỉnh điện năng" },
  ];

  const isLoading = loadingData || loadingProcessGroup || loadingFactor;
  const anyError = dataError || errorProcessGroup || errorFactor;

  return (
    // 12. Bọc bằng Fragment
    <>
      <LayoutInput
        title01="Danh mục / Hệ số điều chỉnh / Diễn giải"
        title="Chỉnh sửa Diễn giải Hệ số điều chỉnh" // Sửa title
        fields={fields}
        onSubmit={handleSubmit}
        closePath={PATHS.ADJUSTMENT_FACTORS_02.LIST}
        onClose={onClose}
        // 13. Thêm initialData và shouldSync
        initialData={{
          "Diễn giải": formData.description,
          "Trị số điều chỉnh SCTX": formData.maintenanceValue,
          "Trị số điều chỉnh điện năng": formData.electricityValue,
        }}
        shouldSyncInitialData={true}
      >
        {/* 14. Render Dropdowns */}
        <div className="custom1" key={1}>
          <DropdownMenuSearchable
            label="Nhóm công đoạn"
            options={processGroupOptions}
            value={selectedProcessGroup}
            onChange={setSelectedProcessGroup}
            placeholder="Chọn nhóm công đoạn..."
            isDisabled={loadingProcessGroup}
          />
        </div>
        <div className="custom2" key={2}>
          <DropdownMenuSearchable
            label="Mã hệ số điều chỉnh"
            options={adjustmentFactorOptions}
            value={selectedAdjustmentFactor}
            onChange={setSelectedAdjustmentFactor}
            placeholder="Chọn mã hệ số..."
            isDisabled={loadingFactor}
          />
        </div>
      </LayoutInput>

      {/* 15. Hiển thị trạng thái loading/error */}
      <div style={{ padding: '0 20px', marginTop: '-10px' }}>
        {isLoading && (
          <p className="text-blue-500 mt-3">Đang tải dữ liệu...</p>
        )}
        {anyError && (
          <p className="text-red-500 mt-3">Lỗi: {anyError.toString()}</p>
        )}
      </div>
    </>
  );
}