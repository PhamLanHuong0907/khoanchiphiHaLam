import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import PATHS from "../../../hooks/path";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable";
import { useApi } from "../../../hooks/useFetchData";

interface ProductionStepEditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => void;
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

  const {
    fetchById,
    putData,
  } = useApi<ProductionStep>(stepPath);

  const {
    fetchData: fetchGroups,
    data: processGroups,
    loading: loadingGroups,
  } = useApi<{ id: string; name: string }>(groupPath);

  // ====== State ======
  const [currentStep, setCurrentStep] = useState<ProductionStep | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
  });

  // ====== Fetch công đoạn theo ID ======
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id);
      if (res) setCurrentStep(res as ProductionStep);
    };
    loadData();
  }, [id, fetchById]);

  // ====== Gán dữ liệu vào form ======
  useEffect(() => {
    if (currentStep) {
      setFormData({
        code: currentStep.code,
        name: currentStep.name,
      });
      setSelectedGroupId(currentStep.processGroupId || "");
    }
  }, [currentStep]);

  // ====== Load danh sách nhóm công đoạn ======
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
    console.log("📤 PUT:", payload);

    await putData(
      payload,
      () => {
        alert("✅ Cập nhật công đoạn sản xuất thành công!");
        onSuccess?.(); // refresh danh sách
        onClose?.();   // đóng popup
      },
    );
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
    // SỬA ĐỔI: Bọc bằng Fragment
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
        shouldSyncInitialData={true} // ✅ cập nhật lại form khi fetch thành công
      >
        {/* ✅ Dropdown nhóm công đoạn */}
        {/* SỬA ĐỔI: Thêm className="custom" để khớp với type */}
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

        {/* Trạng thái tải & lỗi (ĐÃ XÓA KHỎI ĐÂY) */}
      </LayoutInput>

  );
};

export default ProductionStepEdit;