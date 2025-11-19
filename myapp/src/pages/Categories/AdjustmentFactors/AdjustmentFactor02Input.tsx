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

  // API POST
  const { postData, loading: saving, error: saveError } = useApi(postPath, { autoFetch: false }); 

  // API GET Dropdowns
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

  // --- HÀM CHẶN NHẬP DẤU CHẤM (.) ---
  const blockDotInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '.') {
      e.preventDefault();
    }
  };

  // Handle Submit
  const handleSubmit = async (data: Record<string, string>) => {
    // Lấy dữ liệu
    const description = data["Diễn giải"]?.trim();
    const maintenanceValueStr = data["Trị số điều chỉnh SCTX"]?.trim(); // Có thể rỗng
    const electricityValueStr = data["Trị số điều chỉnh điện năng"]?.trim(); // Có thể rỗng

    // Validation bắt buộc (Chỉ còn Nhóm công đoạn, Mã hệ số, Diễn giải)
    if (!selectedProcessGroup) return alert("⚠️ Vui lòng chọn Nhóm công đoạn!");
    if (!selectedAdjustmentFactor) return alert("⚠️ Vui lòng chọn Mã hệ số điều chỉnh!");
    if (!description) return alert("⚠️ Vui lòng nhập Diễn giải!");

    // --- XỬ LÝ FORMAT VÀ VALIDATION SỐ HỌC ---
    
    // 1. Xử lý SCTX
    let finalMaintenance: number | null = null;
    if (maintenanceValueStr) {
        // Nếu có nhập -> Đổi phẩy thành chấm
        const formatted = maintenanceValueStr.replace(/,/g, '.');
        if (isNaN(Number(formatted))) {
            return alert("⚠️ Trị số SCTX phải là số hợp lệ (VD: 9,8)!");
        }
        finalMaintenance = parseFloat(formatted);
    }

    // 2. Xử lý Điện năng
    let finalElectricity: number | null = null;
    if (electricityValueStr) {
        // Nếu có nhập -> Đổi phẩy thành chấm
        const formatted = electricityValueStr.replace(/,/g, '.');
        if (isNaN(Number(formatted))) {
            return alert("⚠️ Trị số điều chỉnh điện năng phải là số hợp lệ (VD: 9,8)!");
        }
        finalElectricity = parseFloat(formatted);
    }

    // Payload
    const payload = {
      description,
      adjustmentFactorId: selectedAdjustmentFactor,
      processGroupId: selectedProcessGroup,
      maintenanceAdjustmentValue: finalMaintenance, // Null hoặc Number
      electricityAdjustmentValue: finalElectricity, // Null hoặc Number
    };

    try {
        await Promise.all([
            postData(payload, undefined),
        ]);
        await new Promise(r => setTimeout(r, 0));
        alert("✅ Tạo diễn giải thành công!");
        
        onClose?.();
        onSuccess?.();
    } catch (e: any) {
        console.error("Lỗi giao dịch:", e);
        let errorMessage = "Đã xảy ra lỗi không xác định.";
        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            if (detail.includes("đã tồn tại") || detail.includes("duplicate")) {
                errorMessage = "Dữ liệu này đã tồn tại. Vui lòng kiểm tra lại!";
            } else if (detail.includes("network")) {
                errorMessage = "Lỗi kết nối máy chủ.";
            } else {
                errorMessage = `Lỗi nghiệp vụ: ${detail}`;
            }
        }
        alert(`❌ TẠO THẤT BẠI: ${errorMessage}`);
    }
  };

  const fields = [
    { type: "custom1" as const }, 
    { type: "custom2" as const }, 
    { label: "Diễn giải", type: "text" as const, placeholder: "Nhập diễn giải, ví dụ: Thiết bị loại A" },
    { 
        label: "Trị số điều chỉnh SCTX", 
        type: "text" as const, 
        placeholder: "Nhập trị số điều chỉnh SCTX, ví dụ: 1,3",
        onKeyDown: blockDotInput // ✅ Chặn dấu chấm
    },
    { 
        label: "Trị số điều chỉnh điện năng", 
        type: "text" as const, 
        placeholder: "Nhập trị số điện năng, ví dụ: 1,3",
        onKeyDown: blockDotInput // ✅ Chặn dấu chấm
    },
  ];

  const isLoading = loadingProcessGroup || loadingFactor || saving;
  const anyError = errorProcessGroup || errorFactor || saveError;

  return (
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
            label="Nhóm công đoạn sản xuất"
            options={processGroupOptions}
            value={selectedProcessGroup}
            onChange={setSelectedProcessGroup}
            placeholder="Chọn nhóm CĐSX"
            isDisabled={loadingProcessGroup}
          />
        </div>
        <div className="custom2" key={2}>
          <DropdownMenuSearchable
            label="Mã hệ số điều chỉnh"
            options={adjustmentFactorOptions}
            value={selectedAdjustmentFactor}
            onChange={setSelectedAdjustmentFactor}
            placeholder="Chọn mã hệ số điều chỉnh"
            isDisabled={loadingFactor}
          />
        </div>

        <div style={{ padding: '10px 0', color: 'blue' }}>
            {isLoading && <span className="text-blue-500">Đang xử lý...</span>}
            {anyError && <span className="text-red-500">Lỗi: {anyError.toString()}</span>}
        </div>
      </LayoutInput>
  );
}