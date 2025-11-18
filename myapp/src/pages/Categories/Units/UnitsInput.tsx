import React, { useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import PATHS from "../../../hooks/path";
import { useApi } from "../../../hooks/useFetchData";

interface UnitsInputProps {
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void;
}

const UnitsInput: React.FC<UnitsInputProps> = ({ onClose, onSuccess }) => {
  const basePath = `/api/catalog/unitofmeasure`;
  // autoFetch: false vì đây là form input, không cần load danh sách của chính nó
  const { postData, loading: saving, error: saveError } = useApi(basePath, { autoFetch: false });

  const [formData, setFormData] = useState({
    name: "",
  });

  const handleSubmit = async (data: Record<string, string>) => {
    const name = data["Đơn vị tính"]?.trim();
    if (!name) return alert("⚠️ Vui lòng nhập đơn vị tính!");

    // Gọi postData và truyền callback xử lý sau khi post thành công
    await postData({ name }, async () => {
      // 1. Chờ reload dữ liệu bảng cha
      // Lúc này useApi ở cha sẽ fetch lại và set state data mới
      if (onSuccess) {
        await onSuccess(); 
      }

      // 2. Dùng setTimeout để nhường 1 nhịp cho React vẽ lại UI (Re-render bảng cha)
      // Nếu không có cái này, alert sẽ chặn việc vẽ lại bảng
      setTimeout(() => {
        alert("✅ Tạo đơn vị tính thành công!");
        
        // 3. Đóng form sau khi alert tắt
        onClose?.();
      }, 300); 
    });
  };

  const fields = [
    {
      label: "Đơn vị tính",
      type: "text" as const,
      placeholder: "Nhập tên đơn vị tính, ví dụ cm",
    },
  ];

  return (
    <LayoutInput
      title01="Danh mục / Đơn vị tính"
      title="Tạo mới Đơn vị tính"
      fields={fields}
      onSubmit={handleSubmit}
      closePath={PATHS.UNIT.LIST}
      onClose={onClose}
      initialData={{
        "Đơn vị tính": formData.name,
      }}
    >
      {saving && <p className="text-blue-500 mt-3">Đang lưu...</p>}
      {saveError && <p className="text-red-500 mt-3">Lỗi: {saveError}</p>}
    </LayoutInput>
  );
};

export default UnitsInput;