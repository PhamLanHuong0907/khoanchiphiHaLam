import PATHS from "../../../../hooks/path";
import { useApi } from "../../../../hooks/useFetchData"; // 2. Import useApi
import LayoutInput from "../../../../layout/layout_input";

// 3. Cập nhật props
interface Specification03InputProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function Specification03Input({
  onClose,
  onSuccess,
}: Specification03InputProps) {
  // 4. Khai báo API
  // (BasePath được suy ra từ file Specification03.tsx)
  const basePath = `/api/product/stoneclampratio`;
  // (Mẫu JSON post được suy ra từ file Specification02Input.tsx, vì cấu trúc API giống hệt)
  const { postData, loading: saving, error: saveError } = useApi(basePath);

  // 5. Cập nhật handleSubmit
  const handleSubmit = async (data: Record<string, string>) => {
    // Lấy giá trị từ label của field
    const value = data["Tỷ lệ đá kẹp (Ckep)"]?.trim();

    // Validation
    if (!value) return alert("⚠️ Vui lòng nhập Tỷ lệ đá kẹp!");

    // Payload (dựa theo mẫu JSON { "value": "string" })
    const payload = {
      value,
    };

    console.log("📤 POST payload:", payload);

    // Gửi dữ liệu
    await postData(payload, () => {
      console.log("✅ Tạo Tỷ lệ đá kẹp thành công!");
      onSuccess?.();
      onClose?.();
    });
  };

  // Fields (giữ nguyên)
  const fields = [
    {
      label: "Tỷ lệ đá kẹp (Ckep)",
      type: "text" as const,
      placeholder: "Nhập tỷ lệ đá kẹp: 2<=Ckep<=3",
      enableCompare: true,
    },
    {
      label: "Hệ số điều chỉnh định mức",
      type: "text" as const,
      placeholder: "Nhập hệ số điều chỉnh định mức",
      // enableCompare: true,
    },
  ];

  return (
    <LayoutInput
      title01="Danh mục / Thông số / Tỷ lệ đá kẹp"
      title="Tạo mới Tỷ lệ đá kẹp"
      fields={fields}
      onSubmit={handleSubmit}
      closePath={PATHS.SPECIFICATION_03.LIST}
      onClose={onClose}
      // 7. Thêm initialData
      initialData={{
        "Tỷ lệ đá kẹp (Ckep)": "",
      }}
    />
  );
}
