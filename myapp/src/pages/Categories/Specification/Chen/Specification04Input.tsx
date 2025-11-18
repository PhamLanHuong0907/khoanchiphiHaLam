import  { useState } from "react";
import PATHS from "../../../../hooks/path";
import LayoutInput from "../../../../layout/layout_input";
import { useApi } from "../../../../hooks/useFetchData";

interface Specification04InputProps {
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Async
}

export default function Specification04Input({ onClose, onSuccess }: Specification04InputProps) {
  const basePath = `/api/product/insertitem`; 
  
  // ✅ autoFetch: false
  const { postData, loading: saving, error: saveError } = useApi(basePath, { autoFetch: false });

  // State để bind dữ liệu (nếu cần)
  const [formData] = useState({
    value: "",
  });

  const handleSubmit = async (data: Record<string, string>) => {
    const value = data["Chèn"]?.trim();

    if (!value) return alert("⚠️ Vui lòng nhập Chèn!");

    const payload = { value };
    console.log("📤 POST payload:", payload);

    // Gọi API -> Chờ xử lý
    await postData(payload, async () => {
      // 1. Chờ reload dữ liệu bảng cha
      if (onSuccess) {
        await onSuccess();
      }

      // 2. Chờ 300ms UI vẽ xong
      setTimeout(() => {
        alert("✅ Tạo Chèn thành công!");
        onClose?.();
      }, 300);
    });
  };

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
      initialData={{
        "Chèn": formData.value,
      }}
    >
      {/* Hiển thị trạng thái */}
      {saving && <p className="text-blue-500 mt-3">Đang xử lý...</p>}
      {saveError && <p className="text-red-500 mt-3">Lỗi: {saveError.toString()}</p>}
    </LayoutInput>
  );
}