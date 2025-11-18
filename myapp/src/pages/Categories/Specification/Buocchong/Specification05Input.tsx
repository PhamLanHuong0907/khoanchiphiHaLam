import  { useState } from "react";
import LayoutInput from "../../../../layout/layout_input";
import PATHS from "../../../../hooks/path";
import { useApi } from "../../../../hooks/useFetchData";

interface Specification05InputProps {
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Async
}

export default function Specification05Input({ onClose, onSuccess }: Specification05InputProps) {
  const basePath = `api/product/supportstep`; 
  
  // ✅ Thêm { autoFetch: false } để tránh fetch list không cần thiết
  const { postData, loading: saving, error: saveError } = useApi(basePath, { autoFetch: false });

  const [formData] = useState({
    value: "",
  });

  const handleSubmit = async (data: Record<string, string>) => {
    const value = data["Bước chống"]?.trim();

    if (!value) return alert("⚠️ Vui lòng nhập Bước chống!");

    const payload = { value };

    console.log("📤 POST payload:", payload);

    // Gọi API
    await postData(payload, async () => {
      // 1. Chờ reload dữ liệu bảng cha
      if (onSuccess) {
        await onSuccess();
      }

      // 2. Chờ 300ms để UI kịp vẽ lại bảng bên dưới
      setTimeout(() => {
        alert("✅ Tạo Bước chống thành công!");
        onClose?.(); // Đóng form
      }, 300);
    });
  };

  const fields = [
    {
      label: "Bước chống",
      type: "text" as const,
      placeholder: "Nhập bước chống"
    },
  ];

  return (
    <LayoutInput
      title01="Danh mục / Thông số / Bước chống"
      title="Tạo mới Bước chống"
      fields={fields}
      onSubmit={handleSubmit}
      closePath={PATHS.SPECIFICATION_05.LIST}
      onClose={onClose}
      initialData={{
        "Bước chống": formData.value,
      }}
    >
      {/* Trạng thái xử lý */}
      {saving && <p className="text-blue-500 mt-3">Đang xử lý...</p>}
      {saveError && <p className="text-red-500 mt-3">Lỗi: {saveError.toString()}</p>}
    </LayoutInput>
  );
}