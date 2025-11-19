import { useState } from "react";
import PATHS from "../../../hooks/path";
import LayoutInput from "../../../layout/layout_input";
import { useApi } from "../../../hooks/useFetchData";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable";

interface AdjustmentFactors02InputProps {
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; 
}

// Interface cho Dropdown
interface DropdownOption { value: string; label: string; }
interface ProcessGroup { id: string; name: string; }
interface AdjustmentFactor { id: string; code: string; }


export default function AdjustmentFactors02Input({ onClose, onSuccess }: AdjustmentFactors02InputProps) {
  const postPath = "/api/adjustment/adjustmentfactordescription";
  const processGroupPath = "/api/process/processgroup";
  const adjustmentFactorPath = "/api/adjustment/adjustmentfactor";

  // API POST (autoFetch: false)
  const { postData, loading: saving, error: saveError } = useApi(postPath, { autoFetch: false }); 

  // API GET Dropdowns (autoFetch mặc định là true)
  const { 
    data: processGroups, 
    loading: loadingProcessGroup,
    error: errorProcessGroup 
  } = useApi<ProcessGroup>(processGroupPath);

  const { 
    data: adjustmentFactors, 
    loading: loadingFactor,
    error: errorFactor 
  } = useApi<AdjustmentFactor>(adjustmentFactorPath);

  const [selectedProcessGroup, setSelectedProcessGroup] = useState<string>("");
  const [selectedAdjustmentFactor, setSelectedAdjustmentFactor] = useState<string>("");

  // Dropdown options
  const processGroupOptions: DropdownOption[] =
    processGroups?.map((g) => ({ value: g.id, label: g.name })) || [];
  const adjustmentFactorOptions: DropdownOption[] =
    adjustmentFactors?.map((f) => ({ value: f.id, label: f.code })) || [];

  // Handle Submit
  const handleSubmit = async (data: Record<string, string>) => {
    const description = data["Diễn giải"]?.trim();
    const maintenanceValueStr = data["Trị số điều chỉnh SCTX"]?.trim();
    const electricityValueStr = data["Trị số điều chỉnh điện năng"]?.trim();

    if (!selectedProcessGroup) return alert("⚠️ Vui lòng chọn Nhóm công đoạn!");
    if (!selectedAdjustmentFactor) return alert("⚠️ Vui lòng chọn Mã hệ số điều chỉnh!");
    if (!description) return alert("⚠️ Vui lòng nhập Diễn giải!");
    if (!maintenanceValueStr) return alert("⚠️ Vui lòng nhập Trị số SCTX!");
    if (!electricityValueStr) return alert("⚠️ Vui lòng nhập Trị số điều chỉnh điện năng!");

    const maintenanceAdjustmentValue = parseFloat(maintenanceValueStr);
    const electricityAdjustmentValue = parseFloat(electricityValueStr);

    if (isNaN(maintenanceAdjustmentValue)) return alert("⚠️ Trị số SCTX phải là một con số!");
    if (isNaN(electricityAdjustmentValue)) return alert("⚠️ Trị số điều chỉnh điện năng phải là một con số!");

    const payload = {
      description,
      adjustmentFactorId: selectedAdjustmentFactor,
      processGroupId: selectedProcessGroup,
      maintenanceAdjustmentValue,
      electricityAdjustmentValue,
    };
    


    try {
        await Promise.all([
            postData(payload, undefined),
          
        ]);
        await new Promise(r => setTimeout(r, 0));
        alert("✅ Tạo diễn giải thành công!");
    } catch (e: any) {
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        let errorMessage = "Đã xảy ra lỗi không xác định.";
        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            if (detail.includes("đã tồn tại") || detail.includes("duplicate")) {
                errorMessage = "Dữ liệu này đã tồn tại. Vui lòng kiểm tra lại!";
            } else if (detail.includes("HTTP error") || detail.includes("network")) {
                errorMessage = "Lỗi kết nối máy chủ.";
            } else {
                errorMessage = `Lỗi nghiệp vụ: ${detail}`;
            }
        }
        alert(`❌ TẠO THẤT BẠI: ${errorMessage}`);
    }
    onClose?.();
    onSuccess?.()
  };

  const fields = [
    { type: "custom1" as const }, 
    { type: "custom2" as const }, 
    { label: "Diễn giải", type: "text" as const, placeholder: "Nhập thông số diễn giải" },
    { label: "Trị số điều chỉnh SCTX", type: "text" as const, placeholder: "Nhập trị số điều chỉnh SCTX" },
    { label: "Trị số điều chỉnh điện năng", type: "text" as const, placeholder: "Nhập trị số điều chỉnh điện năng" },
  ];

  const isLoading = loadingProcessGroup || loadingFactor || saving;
  const anyError = errorProcessGroup || errorFactor || saveError;

  return (
      // ✅ FIX: Bỏ thẻ div bao ngoài, trả về trực tiếp LayoutInput
      <LayoutInput
        title01="Danh mục / Hệ số điều chỉnh / Diễn giải"
        title="Tạo mới Diễn giải Hệ số điều chỉnh"
        fields={fields}
        onSubmit={handleSubmit}
        closePath={PATHS.ADJUSTMENT_FACTORS_02.LIST}
        onClose={onClose}
        initialData={{
          "Diễn giải": "",
          "Trị số điều chỉnh SCTX": "",
          "Trị số điều chỉnh điện năng": "",
        }}
      >
        {/* Dropdowns */}
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

        {/* ✅ FIX: Đưa Loading/Error vào bên trong LayoutInput (làm children) */}
        <div style={{ padding: '10px 0', color: 'blue' }}>
            {isLoading && <span className="text-blue-500">Đang xử lý...</span>}
            {anyError && <span className="text-red-500">Lỗi: {anyError.toString()}</span>}
        </div>
      </LayoutInput>
  );
}