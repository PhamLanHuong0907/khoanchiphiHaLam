import React from "react"; // 1. Thêm React
import PATHS from "../../../../hooks/path";
import LayoutInput from "../../../../layout/layout_input";
import { useApi } from "../../../../hooks/useFetchData"; // 2. Import useApi

// 3. Cập nhật props
interface Specification04InputProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function Specification04Input({ onClose, onSuccess }: Specification04InputProps) {
  // 4. Khai báo API
  // (BasePath được suy ra từ file Specification04.tsx)
  const basePath = `/api/product/insertitem`; 
  // (Mẫu JSON post được suy ra từ các file Specification 02, 03)
  const { postData, loading: saving, error: saveError } = useApi(basePath);

  // 5. Cập nhật handleSubmit
  const handleSubmit = async (data: Record<string, string>) => {
    // Lấy giá trị từ label của field
    const value = data["Chèn"]?.trim();

    // Validation
    if (!value) return alert("⚠️ Vui lòng nhập Chèn!");

    // Payload (dựa theo mẫu JSON { "value": "string" })
    const payload = {
      value,
    };

    console.log("📤 POST payload:", payload);

    // Gửi dữ liệu
    await postData(payload, () => {
      alert("✅ Tạo Chèn thành công!");
      onSuccess?.();
      onClose?.();
    });
  };

  // Fields (giữ nguyên)
  const fields = [
    { label: "Chèn", type: "text" as const, placeholder: "Nhập thông số chèn" },
  ];

  return (
      <LayoutInput
        title01="Danh mục / Thông số / Chèn"
        title="Tạo mới Chèn"
        fields={fields}
        onSubmit={handleSubmit}
        closePath={PATHS.SPECIFICATION_04.LIST}
        onClose={onClose}
        // 7. Thêm initialData
        initialData={{
          "Chèn": "",
        }}
      />
  );
}