import PATHS from "../../../hooks/path";
import LayoutInput from "../../../layout/layout_input";
import { useApi } from "../../../hooks/useFetchData"; // 2. Import useApi
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable"; // 2. Import Dropdown
import { useState, useEffect } from "react";
// 3. Cập nhật props
interface AdjustmentFactors02InputProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

// Interface cho Dropdown
interface DropdownOption {
  value: string;
  label: string;
}

// Interface cho API GET
interface ProcessGroup {
  id: string;
  name: string; // Giả định API trả về 'name' (dựa trên file List)
}
interface AdjustmentFactor {
  id: string;
  code: string; // Giả định API trả về 'code' (dựa trên file List)
}


export default function AdjustmentFactors02Input({ onClose, onSuccess }: AdjustmentFactors02InputProps) {
  // 4. Khai báo API
  const postPath = "/api/adjustment/adjustmentfactordescription";
  const processGroupPath = "/api/process/processgroup";
  const adjustmentFactorPath = "/api/adjustment/adjustmentfactor";

  // API POST
  const { postData, loading: saving, error: saveError } = useApi(postPath);

  // API GET Dropdowns
  const { fetchData: fetchProcessGroups, data: processGroups, loading: loadingProcessGroup, error: errorProcessGroup } =
    useApi<ProcessGroup>(processGroupPath);
  const { fetchData: fetchAdjustmentFactors, data: adjustmentFactors, loading: loadingFactor, error: errorFactor } =
    useApi<AdjustmentFactor>(adjustmentFactorPath);

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


  // 8. Cập nhật handleSubmit
  const handleSubmit = async (data: Record<string, string>) => {
    // Lấy giá trị từ text fields
    const description = data["Diễn giải"]?.trim();
    const maintenanceValueStr = data["Trị số điều chỉnh SCTX"]?.trim();
    const electricityValueStr = data["Trị số điều chỉnh điện năng"]?.trim();

    // Validation
    if (!selectedProcessGroup) return alert("⚠️ Vui lòng chọn Nhóm công đoạn!");
    if (!selectedAdjustmentFactor) return alert("⚠️ Vui lòng chọn Mã hệ số điều chỉnh!");
    if (!description) return alert("⚠️ Vui lòng nhập Diễn giải!");
    if (!maintenanceValueStr) return alert("⚠️ Vui lòng nhập Trị số SCTX!");
    if (!electricityValueStr) return alert("⚠️ Vui lòng nhập Trị số điện năng!");

    // Chuyển đổi sang số
    const maintenanceAdjustmentValue = parseFloat(maintenanceValueStr);
    const electricityAdjustmentValue = parseFloat(electricityValueStr);

    if (isNaN(maintenanceAdjustmentValue)) return alert("⚠️ Trị số SCTX phải là một con số!");
    if (isNaN(electricityAdjustmentValue)) return alert("⚠️ Trị số điện năng phải là một con số!");

    // Tạo payload
    const payload = {
      description,
      adjustmentFactorId: selectedAdjustmentFactor,
      processGroupId: selectedProcessGroup,
      maintenanceAdjustmentValue,
      electricityAdjustmentValue,
    };
    
    console.log("📤 POST payload:", payload);

    // Gửi dữ liệu
    await postData(payload, () => {
      alert("✅ Tạo diễn giải thành công!");
      onSuccess?.();
      onClose?.();
    });
  };

  // 9. Cập nhật fields
  const fields = [
    { type: "custom1" as const }, // Placeholder cho Nhóm công đoạn
    { type: "custom2" as const }, // Placeholder cho Mã hệ số
    { label: "Diễn giải", type: "text" as const, placeholder: "Nhập thông số diễn giải" },
    // Sửa: Dùng type "number"
    { label: "Trị số điều chỉnh SCTX", type: "text" as const, placeholder: "Nhập trị số điều chỉnh SCTX" },
    { label: "Trị số điều chỉnh điện năng", type: "text" as const, placeholder: "Nhập trị số điều chỉnh điện năng" },
  ];

  const isLoading = loadingProcessGroup || loadingFactor || saving;
  const anyError = errorProcessGroup || errorFactor || saveError;

  return (
    // 10. Bọc bằng Fragment
    <>
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
    </>
  );
}