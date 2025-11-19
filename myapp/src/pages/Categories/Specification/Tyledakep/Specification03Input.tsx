import PATHS from "../../../../hooks/path";
import { useApi } from "../../../../hooks/useFetchData";
import LayoutInput from "../../../../layout/layout_input";

// 3. Cập nhật props
interface Specification03InputProps {
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Sửa type
}

export default function Specification03Input({
  onClose,
  onSuccess,
}: Specification03InputProps) {
  // 4. Khai báo API
  const basePath = `/api/product/stoneclampratio`;
  // Sử dụng autoFetch: false vì đây là form input
  const { postData, loading: saving, error: saveError } = useApi(basePath, { autoFetch: false });

  // 5. Cập nhật handleSubmit (LOGIC SỬA ĐÚNG)
  const handleSubmit = async (data: Record<string, string>) => {
    // Lấy giá trị từ label của field
    const value = data["Tỷ lệ đá kẹp (Ckep)"]?.trim();
    // Lấy giá trị từ trường mới
    const adjustmentFactorStr = data["Hệ số điều chỉnh định mức"]?.trim();


    // Validation
    if (!value) return alert("⚠️ Vui lòng nhập Tỷ lệ đá kẹp!");
    if (!adjustmentFactorStr) return alert("⚠️ Vui lòng nhập Hệ số điều chỉnh định mức!"); // Validation trường mới

    // Payload (dựa theo mẫu JSON { "value": "string" })
    const payload = {
      value,
      // Ckep: value, // Giả sử API chỉ cần value và adjustmentFactor
      adjustmentFactor: parseFloat(adjustmentFactorStr) // Chuyển đổi an toàn
    };
    
    // 1. ĐÓNG FORM NGAY LẬP TỨC
    onClose?.(); 

    try {
        // 2. CHẠY API và CHỜ THÀNH CÔNG (Không dùng callback thứ hai)
        await Promise.all([
    postData(payload, undefined),
    onSuccess?.()
]);

await new Promise(r => setTimeout(r, 0));

        // 4. HIỆN ALERT THÀNH CÔNG
        alert("✅ Tạo Tỷ lệ đá kẹp thành công!");

    } catch (e: any) {
        // 5. BẮT LỖI và xử lý chi tiết bằng tiếng Việt
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        
        let errorMessage = "Đã xảy ra lỗi không xác định.";

        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            
            if (detail.includes("đã tồn tại") || detail.includes("duplicate")) {
                errorMessage = "Tỷ lệ đá kẹp này đã tồn tại trong hệ thống. Vui lòng nhập giá trị khác!";
            } else if (detail.includes("HTTP error") || detail.includes("network")) {
                errorMessage = "Yêu cầu đến máy chủ thất bại (Mất kết nối hoặc lỗi máy chủ).";
            } else {
                errorMessage = `Lỗi nghiệp vụ: ${detail}`;
            }
        }
        
        // 6. HIỆN ALERT THẤT BẠI CHI TIẾT
        alert(`❌ TẠO THẤT BẠI: ${errorMessage}`);
    }
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
        "Hệ số điều chỉnh định mức": "",
      }}
    >
      {/* Hiển thị trạng thái */}
      {saving && <p className="text-blue-500 mt-3">Đang xử lý...</p>}
      {saveError && <p className="text-red-500 mt-3">Lỗi: {saveError.toString()}</p>}
    </LayoutInput>
  );
}