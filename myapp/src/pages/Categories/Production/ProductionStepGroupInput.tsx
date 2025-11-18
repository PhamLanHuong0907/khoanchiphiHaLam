import React from "react";
import LayoutInput from "../../../layout/layout_input";
import PATHS from "../../../hooks/path";
import { useApi } from "../../../hooks/useFetchData";

interface ProductionStepGroupInputProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

const ProductionStepGroupInput: React.FC<ProductionStepGroupInputProps> = ({
  onClose,
  onSuccess,
}) => {
  const basePath = `/api/process/processgroup`;
  const { postData, loading, error } = useApi(basePath);

  const handleSubmit = async (data: Record<string, string>) => {
    console.log("📤 Gửi dữ liệu form:", data);

    const code = data["Mã nhóm công đoạn sản xuất"]?.trim();
    const name = data["Tên nhóm công đoạn sản xuất"]?.trim();

    if (!code || !name) {
      alert("⚠️ Vui lòng nhập đầy đủ Mã và Tên nhóm công đoạn sản xuất!");
      return;
    }

    await postData({ code, name }, () => {
      alert("✅ Tạo nhóm công đoạn sản xuất thành công!");
      onSuccess?.(); // refresh bảng ngoài
      onClose?.();   // đóng form
    });
  };

  const fields = [
    {
      label: "Mã nhóm công đoạn sản xuất",
      type: "text" as const,
      placeholder: "Nhập mã nhóm công đoạn sản xuất",
    },
    {
      label: "Tên nhóm công đoạn sản xuất",
      type: "text" as const,
      placeholder: "Nhập tên nhóm công đoạn sản xuất",
    },
  ];

  return (
    <LayoutInput
      title01="Danh mục / Công đoạn sản xuất / Nhóm công đoạn sản xuất"
      title="Tạo mới Nhóm công đoạn sản xuất"
      fields={fields}
      onSubmit={handleSubmit}
      closePath={PATHS.PRODUCTION_STEP_GROUP.LIST}
      onClose={onClose}
      initialData={{
        "Mã nhóm công đoạn sản xuất": "",
        "Tên nhóm công đoạn sản xuất": "",
      }} // ✅ đồng bộ với LayoutInput mới
    >
      {loading && <p className="text-blue-500 mt-2">Đang lưu dữ liệu...</p>}
      {error && <p className="text-red-500 mt-2">❌ Lỗi: {error}</p>}
    </LayoutInput>
  );
};

export default ProductionStepGroupInput;
