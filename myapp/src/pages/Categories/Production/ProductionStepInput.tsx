import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import PATHS from "../../../hooks/path";
import { useApi } from "../../../hooks/useFetchData";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable";

interface ProductionStepInputProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

const ProductionStepInput: React.FC<ProductionStepInputProps> = ({
  onClose,
  onSuccess,
}) => {
  // ====== API setup ======
  const groupPath = `/api/process/processgroup`;
  const stepPath = `/api/process/productionprocess`;

  // Fetch nhóm công đoạn
  const {
    fetchData: fetchGroups,
    data: processGroups,
    loading: loadingGroups,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error: errorGroups,
  } = useApi<{ id: string; name: string }>(groupPath);

  // Post công đoạn sản xuất
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { postData, loading: saving, error: saveError } = useApi(stepPath,
    { autoFetch: false });

  // ====== State ======
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [formData, setFormData] = useState({
    code: "",
    name: "",
  });

  // ====== Load danh sách nhóm công đoạn ======
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // ====== Dropdown options ======
  const groupOptions =
    processGroups?.map((g) => ({
      value: g.id,
      label: g.name,
    })) || [];

  // ====== Gửi dữ liệu ======
  const handleSubmit = async (data: Record<string, string>) => {
    const code = data["Mã công đoạn sản xuất"]?.trim();
    const name = data["Tên công đoạn sản xuất"]?.trim();
    const processGroupId = selectedGroupId;

    if (!processGroupId)
      return alert("⚠️ Vui lòng chọn nhóm công đoạn sản xuất!");
    if (!code) return alert("⚠️ Vui lòng nhập mã công đoạn sản xuất!");
    if (!name) return alert("⚠️ Vui lòng nhập tên công đoạn sản xuất!");

    const payload = { code, name, processGroupId };
    console.log("📤 POST:", payload);

    await postData(payload, () => {
      alert("✅ Tạo công đoạn sản xuất thành công!");
      onSuccess?.(); // refresh bảng ngoài
      onClose?.();   // đóng popup
    });
  };

  // ====== Trường nhập (Mã - Tên) ======
  const fields = [
    { type: "custom" as const }, // ✅ giữ chỗ cho dropdown nhóm công đoạn
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
        title="Tạo mới Công đoạn sản xuất"
        fields={fields}
        onSubmit={handleSubmit}
        closePath={PATHS.PRODUCTION_STEP.LIST}
        onClose={onClose}
        initialData={{
          "Mã công đoạn sản xuất": formData.code,
          "Tên công đoạn sản xuất": formData.name,
        }}
      >
        {/* ✅ Dropdown nhóm công đoạn đặt ở cuối (sau các field text) */}
        
        {/* SỬA ĐỔI: className="const" đổi thành "custom" để khớp với type */}
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

        {/* Trạng thái tải và lỗi (ĐÃ XÓA KHỎI ĐÂY) */}
      </LayoutInput>

  );
};

export default ProductionStepInput;