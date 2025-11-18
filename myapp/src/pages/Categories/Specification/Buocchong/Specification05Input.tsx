import React from "react"; // 1. Thêm React
import LayoutInput from "../../../../layout/layout_input";
import PATHS from "../../../../hooks/path";
import { useApi } from "../../../../hooks/useFetchData"; // 2. Import useApi

// 3. Cập nhật props
interface Specification05InputProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function Specification05Input({ onClose, onSuccess }: Specification05InputProps) {
  // 4. Khai báo API
  const basePath = `api/product/supportstep`; // (Lấy từ Specification05.tsx)
  // (Mẫu JSON post suy ra từ các file Specification 02, 03, 04)
  const { postData, loading: saving, error: saveError } = useApi(basePath);

  // 5. Cập nhật handleSubmit
  const handleSubmit = async (data: Record<string, string>) => {
    const value = data["Bước chống"]?.trim();

    // Validation
    if (!value) return alert("⚠️ Vui lòng nhập Bước chống!");

    // Payload (dựa theo mẫu JSON { "value": "string" })
    const payload = {
      value,
    };

    console.log("📤 POST payload:", payload);

    // Gửi dữ liệu
    await postData(payload, () => {
      alert("✅ Tạo Bước chống thành công!");
      onSuccess?.();
      onClose?.();
    });
  };

  // Fields (giữ nguyên)
  const fields = [
    {
      label: "Bước chống",
      type: "text" as const,
      placeholder: "Nhập bước chống"
    },
  ];

  return (
    // 6. Bọc bằng Fragment
    <>
      <LayoutInput
        title01="Danh mục / Thông số / Bước chống"
        title="Tạo mới Bước chống"
        fields={fields}
        onSubmit={handleSubmit}
        closePath={PATHS.SPECIFICATION_05.LIST}
        onClose={onClose}
        // 7. Thêm initialData
        initialData={{
          "Bước chống": "",
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