import { useState } from "react";
import PATHS from "../../../hooks/path";
import LayoutInput from "../../../layout/layout_input";
import { useApi } from "../../../hooks/useFetchData";

interface AdjustmentFactor01InputProps {
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Sửa type
}

export default function AdjustmentFactor01Input({ onClose, onSuccess }: AdjustmentFactor01InputProps) {
  const basePath = `api/adjustment/adjustmentfactor`;
  // Sử dụng autoFetch: false vì đây là form input
  const { postData } = useApi(basePath, { autoFetch: false }); 

  // Giữ state cho form data nếu cần sync
  const [formData] = useState({ code: "", name: "" });

  const handleSubmit = async (data: Record<string, string>) => {
    const code = data["Mã hệ số điều chỉnh"]?.trim();
    const name = data["Tên hệ số điều chỉnh"]?.trim();

    if (!code) return alert("⚠️ Vui lòng nhập Mã hệ số điều chỉnh!");
    if (!name) return alert("⚠️ Vui lòng nhập Tên hệ số điều chỉnh!");

    const payload = { code, name };
    
    // 1. ĐÓNG FORM NGAY LẬP TỨC


    try {
        // 2. CHẠY API và CHỜ THÀNH CÔNG (Không dùng callback thứ hai)
    await Promise.all([
    postData(payload, undefined),
  
]);
          await new Promise(r => setTimeout(r, 0))
        // 4. HIỆN ALERT THÀNH CÔNG
        alert("✅ Tạo hệ số điều chỉnh thành công!");

    } catch (e: any) {
        // 5. BẮT LỖI và xử lý chi tiết bằng tiếng Việt
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        
        let errorMessage = "Đã xảy ra lỗi không xác định.";

        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            
            if (detail.includes("Mã đã tồn tại") || detail.includes("duplicate")) {
                errorMessage = "Mã hệ số điều chỉnh này đã tồn tại trong hệ thống. Vui lòng nhập mã khác!";
            } else if (detail.includes("HTTP error") || detail.includes("network")) {
                errorMessage = "Yêu cầu đến máy chủ thất bại (Mất kết nối hoặc lỗi máy chủ).";
            } else {
                errorMessage = `Lỗi nghiệp vụ: ${detail}`;
            }
        }
        
        // 6. HIỆN ALERT THẤT BẠI CHI TIẾT
        alert(`❌ TẠO THẤT BẠI: ${errorMessage}`);
    }
    onClose?.();
    onSuccess?.()
  };

  // ✅ SỬA ĐỔI: Loại bỏ customApiStatus khỏi fields
  const fields = [
    { label: "Mã hệ số điều chỉnh", type: "text" as const, placeholder: "Nhập mã hệ số điều chỉnh, ví dụ: 1" },
    { label: "Tên hệ số điều chỉnh", type: "text" as const, placeholder: "Nhập tên hệ số điều chỉnh, ví dụ: " },
  ];

  return (
    <LayoutInput
      title01="Danh mục / Hệ số điều chỉnh"
      title="Tạo mới Hệ số điều chỉnh"
      fields={fields} 
      onSubmit={handleSubmit}
      onClose={onClose}
      closePath={PATHS.ADJUSTMENT_FACTORS_01.LIST}
      initialData={{
        "Mã hệ số điều chỉnh": "",
        "Tên hệ số điều chỉnh": "",
      }}
    >
      {/* KHÔNG CẦN THÔNG BÁO LỖI NỘI BỘ VÌ FORM ĐÃ ĐÓNG */}
    </LayoutInput>
  );
}