import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import PATHS from "../../../hooks/path";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable";
import { useApi } from "../../../hooks/useFetchData";

interface ProductionStepEditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Sửa type
}

interface ProductionStep {
  id: string;
  code: string;
  name: string;
  processGroupId: string;
}

const ProductionStepEdit: React.FC<ProductionStepEditProps> = ({
  id,
  onClose,
  onSuccess,
}) => {
  // ====== API setup ======
  const stepPath = `/api/process/productionprocess`;
  const groupPath = `/api/process/processgroup`;

  // API WorkCode
  const { fetchById, putData, error: errorStep } = useApi<ProductionStep>(stepPath);

  // API Dropdown
  const { fetchData: fetchGroups, data: processGroups, loading: loadingGroups } = useApi<{ id: string; name: string }>(groupPath);

  // ====== State ======
  const [currentStep, setCurrentStep] = useState<ProductionStep | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
  });

  // Fetch công đoạn theo ID (giữ nguyên)
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id);
      if (res) setCurrentStep(res as ProductionStep);
    };
    loadData();
  }, [id, fetchById]);

  // Gán dữ liệu vào form (giữ nguyên)
  useEffect(() => {
    if (currentStep) {
      setFormData({
        code: currentStep.code,
        name: currentStep.name,
      });
      setSelectedGroupId(currentStep.processGroupId || "");
    }
  }, [currentStep]);

  // Load danh sách nhóm công đoạn (giữ nguyên)
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const groupOptions =
    processGroups?.map((g) => ({
      value: g.id,
      label: g.name,
    })) || [];

  // ====== PUT cập nhật dữ liệu ======
  const handleSubmit = async (data: Record<string, string>) => {
    const code = data["Mã công đoạn sản xuất"]?.trim();
    const name = data["Tên công đoạn sản xuất"]?.trim();
    const processGroupId = selectedGroupId;

    if (!id) return alert("❌ Thiếu ID để cập nhật!");
    if (!processGroupId) return alert("⚠️ Vui lòng chọn nhóm công đoạn!");
    if (!code) return alert("⚠️ Vui lòng nhập mã công đoạn!");
    if (!name) return alert("⚠️ Vui lòng nhập tên công đoạn!");

    const payload = { id, code, name, processGroupId };
    
    // 1. ĐÓNG FORM NGAY LẬP TỨC
 

    try {
        // 2. CHẠY API và CHỜ THÀNH CÔNG (Gọi trực tiếp putData)
        await Promise.all([
    putData(payload, undefined),

]);

await new Promise(r => setTimeout(r, 0));

        
        // 4. HIỆN ALERT THÀNH CÔNG
        alert("✅ Cập nhật công đoạn sản xuất thành công!");

    } catch (e: any) {
        // 5. BẮT LỖI VÀ XỬ LÝ
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        
        let errorMessage = "Đã xảy ra lỗi không xác định.";

        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            
            if (detail.includes("Mã đã tồn tại") || detail.includes("duplicate")) {
                errorMessage = "Mã công đoạn sản xuất này đã tồn tại. Vui lòng nhập mã khác!";
            } else if (detail.includes("HTTP error") || detail.includes("network")) {
                errorMessage = "Yêu cầu đến máy chủ thất bại (Mất kết nối hoặc lỗi máy chủ).";
            } else {
                errorMessage = `Lỗi nghiệp vụ: ${detail}`;
            }
        }
        
        // 6. HIỆN ALERT THẤT BẠI CHI TIẾT
        alert(`❌ CẬP NHẬT THẤT BẠI: ${errorMessage}`);
    }
    onClose?.();
    onSuccess?.()
  };

  // ====== Fields ======
  const fields = [
    { type: "custom" as const }, // ✅ để chèn dropdown nhóm công đoạn
    {
      label: "Mã công đoạn sản xuất",
      type: "text" as const,
      placeholder: "Nhập mã công đoạn sản xuất",
    },
    {
      label: "Tên công đoạn sản xuất",
      type: "text" as const,
      placeholder: "Nhập tên công đoạn sản xuất",
    },
  ];

  return (
      <LayoutInput
        title01="Danh mục / Công đoạn sản xuất"
        title="Chỉnh sửa Công đoạn sản xuất"
        fields={fields}
        onSubmit={handleSubmit}
        closePath={PATHS.PRODUCTION_STEP.LIST}
        onClose={onClose}
        initialData={{
          "Mã công đoạn sản xuất": formData.code,
          "Tên công đoạn sản xuất": formData.name,
        }}
        shouldSyncInitialData={true}
      >
        {/* ✅ Dropdown nhóm công đoạn */}
        <div className="custom" key={1}>
          <DropdownMenuSearchable
            label="Nhóm công đoạn sản xuất"
            options={groupOptions}
            value={selectedGroupId}
            onChange={(value) => setSelectedGroupId(value)}
            placeholder="Chọn nhóm công đoạn sản xuất..."
            isDisabled={loadingGroups}
          />
        </div>

        {/* Hiển thị lỗi cuối cùng */}
        {errorStep && <p className="text-red-500 mt-2">❌ Lỗi: {errorStep}</p>}
      </LayoutInput>

  );
};

export default ProductionStepEdit;