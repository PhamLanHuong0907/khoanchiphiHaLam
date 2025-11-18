import React from "react"; // 1. Thêm React
import PATHS from "../../../../hooks/path";
import LayoutInput from "../../../../layout/layout_input";
import { useApi } from "../../../../hooks/useFetchData"; // 2. Import useApi

// 3. Cập nhật props
interface Specification02InputProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function Specification02Input({ onClose, onSuccess }: Specification02InputProps) {
  // 4. Khai báo API
  // (Giả định basePath giống như file Specification02.tsx)
  const basePath = `/api/product/hardness`; 
  const { postData, loading: saving, error: saveError } = useApi(basePath);

  // 5. Cập nhật handleSubmit
  const handleSubmit = async (data: Record<string, string>) => {
    // Lấy giá trị từ label của field
    const value = data["Độ kiên cố than, đá (f)"]?.trim();

    // Validation
    if (!value) return alert("⚠️ Vui lòng nhập Độ kiên cố than, đá!");

    // Payload (dựa theo mẫu JSON)
    const payload = {
      value,
    };

    console.log("📤 POST payload:", payload);

    // Gửi dữ liệu
    await postData(payload, () => {
      alert("✅ Tạo Độ kiên cố thành công!");
      onSuccess?.();
      onClose?.();
    });
  };

  // Fields (giữ nguyên)
  const fields = [
    { label: "Độ kiên cố than, đá (f)", type: "text" as const, placeholder: "Nhập độ kiên cố than, đá (f): 2<=f<=3", enableCompare: true },
  ];

  return (
    // 6. Bọc bằng Fragment
    <>
      <LayoutInput
        title01="Danh mục / Thông số / Độ kiên cố than, đá (f)"
        title="Tạo mới Độ kiên cố than, đá"
        fields={fields}
        onSubmit={handleSubmit}
        closePath={PATHS.SPECIFICATION_02.LIST}
        onClose={onClose}
        // 7. Thêm initialData
        initialData={{
          "Độ kiên cố than, đá (f)": "",
        }}
      />
      {/* 8. Hiển thị trạng thái loading/error */}
      <div style={{ padding: '0 20px', marginTop: '-10px' }}>
        {saving && (
          <p className="text-blue-500 mt-3">Đang xử lý...</p>
        )}
        {saveError && (
          <p className="text-red-500 mt-3">Lỗi: {saveError.toString()}</p>
        )}
      </div>
    </>
  );
}