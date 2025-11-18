import React, { useState } from "react";
import PATHS from "../../../../hooks/path";
import LayoutInput from "../../../../layout/layout_input";
import { useApi } from "../../../../hooks/useFetchData";

interface Specification02InputProps {
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Async
}

export default function Specification02Input({ onClose, onSuccess }: Specification02InputProps) {
  const basePath = `/api/product/hardness`; 
  
  // ✅ autoFetch: false để tránh load list không cần thiết
  const { postData, loading: saving, error: saveError } = useApi(basePath, { autoFetch: false });

  // State binding (tùy chọn, giúp quản lý form tốt hơn)
  const [formData] = useState({
    value: "",
  });

  const handleSubmit = async (data: Record<string, string>) => {
    const value = data["Độ kiên cố than, đá (f)"]?.trim();

    if (!value) return alert("⚠️ Vui lòng nhập Độ kiên cố than, đá!");

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
        alert("✅ Tạo Độ kiên cố thành công!");
        onClose?.();
      }, 300);
    });
  };

  const fields = [
    { 
      label: "Độ kiên cố than, đá (f)", 
      type: "text" as const, 
      placeholder: "Nhập độ kiên cố than, đá (f): 2<=f<=3", 
      enableCompare: true 
    },
  ];

  return (
    <LayoutInput
      title01="Danh mục / Thông số / Độ kiên cố than, đá (f)"
      title="Tạo mới Độ kiên cố than, đá"
      fields={fields}
      onSubmit={handleSubmit}
      closePath={PATHS.SPECIFICATION_02.LIST}
      onClose={onClose}
      initialData={{
        "Độ kiên cố than, đá (f)": formData.value,
      }}
    >
      {/* Hiển thị trạng thái */}
      {saving && <p className="text-blue-500 mt-3">Đang xử lý...</p>}
      {saveError && <p className="text-red-500 mt-3">Lỗi: {saveError.toString()}</p>}
    </LayoutInput>
  );
}