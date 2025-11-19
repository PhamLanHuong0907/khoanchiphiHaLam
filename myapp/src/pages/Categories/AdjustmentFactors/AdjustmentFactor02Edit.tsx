import { useEffect, useState } from "react";
import PATHS from "../../../hooks/path";
import LayoutInput from "../../../layout/layout_input";
import { useApi } from "../../../hooks/useFetchData";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable";

interface AdjustmentFactors02EditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; 
}

interface DropdownOption { value: string; label: string; }
interface AdjustmentFactorDescription {
  id: string;
  description: string;
  adjustmentFactorId: string;
  processGroupId: string;
  maintenanceAdjustmentValue: number;
  electricityAdjustmentValue: number;
}
interface ProcessGroup { id: string; name: string; }
interface AdjustmentFactor { id: string; code: string; }

export default function AdjustmentFactors02Edit({ id, onClose, onSuccess }: AdjustmentFactors02EditProps) {
  const basePath = "/api/adjustment/adjustmentfactordescription";
  const processGroupPath = "/api/process/processgroup";
  const adjustmentFactorPath = "/api/adjustment/adjustmentfactor";

  // API (autoFetch: false cho main data)
  const { fetchById, putData, loading: loadingData, error: dataError } =
    useApi<AdjustmentFactorDescription>(basePath, { autoFetch: false });

  // API Dropdowns
  const { data: processGroups, loading: loadingProcessGroup } =
    useApi<ProcessGroup>(processGroupPath);
    
  const { data: adjustmentFactors, loading: loadingFactor } =
    useApi<AdjustmentFactor>(adjustmentFactorPath);

  const [currentData, setCurrentData] = useState<AdjustmentFactorDescription | null>(null);
  const [selectedProcessGroup, setSelectedProcessGroup] = useState<string>("");
  const [selectedAdjustmentFactor, setSelectedAdjustmentFactor] = useState<string>("");
  const [formData, setFormData] = useState({
    description: "",
    maintenanceValue: "",
    electricityValue: "",
  });

  // Load ID
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id);
      if (res) setCurrentData(res as AdjustmentFactorDescription);
    };
    loadData();
  }, [id, fetchById]);

  // Sync Data
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

  const processGroupOptions: DropdownOption[] =
    processGroups?.map((g) => ({ value: g.id, label: g.name })) || [];
  const adjustmentFactorOptions: DropdownOption[] =
    adjustmentFactors?.map((f) => ({ value: f.id, label: f.code })) || [];

  // Submit
  const handleSubmit = async (data: Record<string, string>) => {
    if (!id) return alert("❌ Thiếu ID!");
    const description = data["Diễn giải"]?.trim();
    const maintenanceValueStr = data["Trị số điều chỉnh SCTX"]?.trim();
    const electricityValueStr = data["Trị số điều chỉnh điện năng"]?.trim();

    if (!selectedProcessGroup) return alert("⚠️ Vui lòng chọn Nhóm công đoạn!");
    if (!selectedAdjustmentFactor) return alert("⚠️ Vui lòng chọn Mã hệ số điều chỉnh!");
    if (!description) return alert("⚠️ Vui lòng nhập Diễn giải!");
    if (!maintenanceValueStr) return alert("⚠️ Vui lòng nhập Trị số SCTX!");
    if (!electricityValueStr) return alert("⚠️ Vui lòng nhập Trị số điều chỉnh điện năng!");

    const payload = {
      id,
      description,
      adjustmentFactorId: selectedAdjustmentFactor,
      processGroupId: selectedProcessGroup,
      maintenanceAdjustmentValue: parseFloat(maintenanceValueStr),
      electricityAdjustmentValue: parseFloat(electricityValueStr),
    };

    onClose?.();

    try {
        await Promise.all([
            putData(payload, undefined),
            onSuccess?.()
        ]);
        await new Promise(r => setTimeout(r, 0));
        alert("✅ Cập nhật diễn giải thành công!");
    } catch (e: any) {
        console.error("Lỗi giao dịch:", e);
        let errorMessage = "Đã xảy ra lỗi không xác định.";
        if (e && typeof e.message === 'string') {
             const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
             if (detail.includes("duplicate")) errorMessage = "Dữ liệu trùng lặp!";
             else errorMessage = `Lỗi: ${detail}`;
        }
        alert(`❌ CẬP NHẬT THẤT BẠI: ${errorMessage}`);
    }
  };

  const fields = [
    { type: "custom1" as const }, 
    { type: "custom2" as const }, 
    { label: "Diễn giải", type: "text" as const, placeholder: "Nhập thông số diễn giải" },
    { label: "Trị số điều chỉnh SCTX", type: "text" as const, placeholder: "Nhập trị số điều chỉnh SCTX" },
    { label: "Trị số điều chỉnh điện năng", type: "text" as const, placeholder: "Nhập trị số điều chỉnh điện năng" },
  ];

  const isLoading = loadingData || loadingProcessGroup || loadingFactor;
  const anyError = dataError;

  return (
      // ✅ FIX: Bỏ thẻ div bao ngoài, trả về trực tiếp LayoutInput
      <LayoutInput
        title01="Danh mục / Hệ số điều chỉnh / Diễn giải"
        title="Chỉnh sửa Diễn giải Hệ số điều chỉnh"
        fields={fields}
        onSubmit={handleSubmit}
        closePath={PATHS.ADJUSTMENT_FACTORS_02.LIST}
        onClose={onClose}
        initialData={{
          "Diễn giải": formData.description,
          "Trị số điều chỉnh SCTX": formData.maintenanceValue,
          "Trị số điều chỉnh điện năng": formData.electricityValue,
        }}
        shouldSyncInitialData={true}
      >
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

        {/* ✅ FIX: Đưa Loading/Error vào bên trong LayoutInput */}
        <div style={{ padding: '10px 0' }}>
            {isLoading && <span className="text-blue-500">Đang tải dữ liệu...</span>}
            {anyError && <span className="text-red-500">Lỗi: {anyError.toString()}</span>}
        </div>
      </LayoutInput>
  );
}