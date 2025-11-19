import { useState } from "react";
import PATHS from "../../../../hooks/path";
import LayoutInput from "../../../../layout/layout_input";
import { useApi } from "../../../../hooks/useFetchData";

interface Specification04InputProps {
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; 
}

export default function Specification04Input({ onClose, onSuccess }: Specification04InputProps) {
  const basePath = `/api/product/insertitem`; 
  
  const { postData, loading: saving, error: saveError } = useApi(basePath, { autoFetch: false });

  const [formData] = useState({
    value: "",
  });

  const handleSubmit = async (data: Record<string, string>) => {
    const value = data["Chèn"]?.trim();

    if (!value) return alert("⚠️ Vui lòng nhập Chèn!");

    const payload = { value };
    console.log("📤 POST payload:", payload);

    // 1. ĐÓNG FORM NGAY LẬP TỨC

    try {
        // 2. CHẠY API và CHỜ THÀNH CÔNG (Không dùng callback thứ hai)
        await Promise.all([
    postData(payload, undefined)
]);

await new Promise(r => setTimeout(r, 0));

        // 4. HIỆN ALERT THÀNH CÔNG
        alert("✅ Tạo Chèn thành công!");

    } catch (e: any) {
        // 5. BẮT LỖI và xử lý chi tiết bằng tiếng Việt
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        
        let errorMessage = "Đã xảy ra lỗi không xác định.";

        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim(); 
            
            if (detail.includes("đã tồn tại") || detail.includes("duplicate")) {
                errorMessage = "Dữ liệu này đã tồn tại trong hệ thống. Vui lòng nhập giá trị khác!";
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