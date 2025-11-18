import PATHS from "../../../hooks/path";
import LayoutInput from "../../../layout/layout_input";
import { useApi } from "../../../hooks/useFetchData";

interface AdjustmentFactor01InputProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function AdjustmentFactor01Input({ onClose, onSuccess }: AdjustmentFactor01InputProps) {
  const basePath = `api/adjustment/adjustmentfactor`;
  const { postData } = useApi(basePath);

  const handleSubmit = async (data: Record<string, string>) => {
    // ... (logic submit của bạn giữ nguyên) ...
    const code = data["Mã hệ số điều chỉnh"]?.trim();
    const name = data["Tên hệ số điều chỉnh"]?.trim();
    if (!code) return alert("⚠️ Vui lòng nhập Mã hệ số điều chỉnh!");
    if (!name) return alert("⚠️ Vui lòng nhập Tên hệ số điều chỉnh!");
    const payload = { code, name };
    await postData(payload, () => {
      alert("✅ Tạo hệ số thành công!");
      onSuccess?.();
      onClose?.();
    });
  };

  // ✅ SỬA ĐỔI: Thêm một "slot" cho thông báo lỗi vào mảng fields
  const fields = [
    { label: "Mã hệ số điều chỉnh", type: "text" as const, placeholder: "Nhập mã hệ số điều chỉnh, ví dụ: 1" },
    { label: "Tên hệ số điều chỉnh", type: "text" as const, placeholder: "Nhập tên hệ số điều chỉnh, ví dụ: " },
    {
      type: "customApiStatus" as const, // ✅ Đặt tên custom type
      // không cần label
    },
  ];

  return (
    // ❌ Bỏ React.Fragment (<>)
    <LayoutInput
      title01="Danh mục / Hệ số điều chỉnh"
      title="Tạo mới Hệ số điều chỉnh"
      fields={fields} // ✅ Truyền fields đã cập nhật
      onSubmit={handleSubmit}
      onClose={onClose}
      closePath={PATHS.ADJUSTMENT_FACTORS_01.LIST}
      initialData={{
        "Mã hệ số điều chỉnh": "",
        "Tên hệ số điều chỉnh": "",
      }}
    >
    </LayoutInput>
    // ❌ Bỏ div thông báo lỗi ở ngoài
  );
}