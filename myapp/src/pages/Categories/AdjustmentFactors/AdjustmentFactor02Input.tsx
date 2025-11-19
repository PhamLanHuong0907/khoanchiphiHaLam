import { useState, useEffect } from "react";
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
  // 4. Khai báo API
  const postPath = "/api/adjustment/adjustmentfactordescription";
  const processGroupPath = "/api/process/processgroup";
  const adjustmentFactorPath = "/api/adjustment/adjustmentfactor";

  // API POST
  const { postData, loading: saving, error: saveError } = useApi(postPath, { autoFetch: false }); 

  // API GET Dropdowns
  const { 
    fetchData: fetchProcessGroups, 
    data: processGroups, 
    loading: loadingProcessGroup,
    error: errorProcessGroup 
  } = useApi<ProcessGroup>(processGroupPath);

  const { 
    fetchData: fetchAdjustmentFactors, 
    data: adjustmentFactors, 
    loading: loadingFactor,
    error: errorFactor 
  } = useApi<AdjustmentFactor>(adjustmentFactorPath);

  // 5. State cho dropdowns
  const [selectedProcessGroup, setSelectedProcessGroup] = useState<string>("");
  const [selectedAdjustmentFactor, setSelectedAdjustmentFactor] = useState<string>("");

  // 6. Load dropdown data
  useEffect(() => {
    fetchProcessGroups();
    fetchAdjustmentFactors();
  }, [fetchProcessGroups, fetchAdjustmentFactors]);

  // 7. Map options
  const processGroupOptions: DropdownOption[] =
    processGroups?.map((g) => ({ value: g.id, label: g.name })) || [];
  const adjustmentFactorOptions: DropdownOption[] =
    adjustmentFactors?.map((f) => ({ value: f.id, label: f.code })) || [];


  // 8. Handle Submit
  const handleSubmit = async (data: Record<string, string>) => {
    const description = data["Diễn giải"]?.trim();
    const maintenanceValueStr = data["Trị số điều chỉnh SCTX"]?.trim();
    const electricityValueStr = data["Trị số điều chỉnh điện năng"]?.trim();

    // Validation
    if (!selectedProcessGroup) return alert("⚠️ Vui lòng chọn Nhóm công đoạn!");
    if (!selectedAdjustmentFactor) return alert("⚠️ Vui lòng chọn Mã hệ số điều chỉnh!");
    if (!description) return alert("⚠️ Vui lòng nhập Diễn giải!");
    if (!maintenanceValueStr) return alert("⚠️ Vui lòng nhập Trị số SCTX!");
    if (!electricityValueStr) return alert("⚠️ Vui lòng nhập Trị số điều chỉnh điện năng!");

    // Chuyển đổi sang số an toàn
    const maintenanceAdjustmentValue = parseFloat(maintenanceValueStr);
    const electricityAdjustmentValue = parseFloat(electricityValueStr);

    if (isNaN(maintenanceAdjustmentValue)) return alert("⚠️ Trị số SCTX phải là một con số!");
    if (isNaN(electricityAdjustmentValue)) return alert("⚠️ Trị số điều chỉnh điện năng phải là một con số!");

    // Tạo payload
    const payload = {
      description,
      adjustmentFactorId: selectedAdjustmentFactor,
      processGroupId: selectedProcessGroup,
      maintenanceAdjustmentValue,
      electricityAdjustmentValue,
    };
    
    // 1. ĐÓNG FORM NGAY LẬP TỨC
    onClose?.(); 

    try {
        // 2. CHẠY API và CHỜ THÀNH CÔNG
        await Promise.all([
            postData(payload, undefined),
            onSuccess?.()
        ]);

        await new Promise(r => setTimeout(r, 0));

        // 4. HIỆN ALERT THÀNH CÔNG
        alert("✅ Tạo diễn giải thành công!");

    } catch (e: any) {
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        
        let errorMessage = "Đã xảy ra lỗi không xác định.";

        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            
            if (detail.includes("đã tồn tại") || detail.includes("duplicate")) {
                errorMessage = "Dữ liệu này đã tồn tại trong hệ thống. Vui lòng kiểm tra lại Mã hệ số và Nhóm công đoạn!";
            } else if (detail.includes("HTTP error") || detail.includes("network")) {
                errorMessage = "Yêu cầu đến máy chủ thất bại (Mất kết nối hoặc lỗi máy chủ).";
            } else {
                errorMessage = `Lỗi nghiệp vụ: ${detail}`;
            }
        }
        
        alert(`❌ TẠO THẤT BẠI: ${errorMessage}`);
    }
  };

  // 9. Fields definition
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
    // 🛑 THAY ĐỔI: Dùng thẻ div bao ngoài thay vì Fragment để tránh lỗi 2 root elements
    <div>
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
        {/* 11. Render Dropdowns */}
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
      
      {/* 12. Hiển thị trạng thái loading/error */}
      <div style={{ padding: '0 20px', marginTop: '-10px' }}>
        {isLoading && (
          <p className="text-blue-500 mt-3">Đang xử lý...</p>
        )}
        {anyError && (
          <p className="text-red-500 mt-3">Lỗi: {anyError.toString()}</p>
        )}
      </div>
    </div>
  );
}