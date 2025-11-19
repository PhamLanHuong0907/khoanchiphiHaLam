import { useState } from "react";
import LayoutInput from "../../../../layout/layout_input";
import PATHS from "../../../../hooks/path";
import { useApi } from "../../../../hooks/useFetchData";

interface Specification05InputProps {
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void;
}

export default function Specification05Input({ onClose, onSuccess }: Specification05InputProps) {
  const basePath = `api/product/supportstep`; 
  
  const { postData, error: saveError } = useApi(basePath, { autoFetch: false });

  const [formData] = useState({
    value: "",
  });

  const handleSubmit = async (data: Record<string, string>) => {
    const value = data["Bước chống"]?.trim();

    if (!value) return alert("⚠️ Vui lòng nhập Bước chống!");

    const payload = { value };

    // 1. ĐÓNG FORM NGAY LẬP TỨC

    try {
        // 2. CHẠY API và CHỜ THÀNH CÔNG (Không dùng callback thứ hai)
       await Promise.all([
    postData(payload, undefined),
]);

await new Promise(r => setTimeout(r, 0));

        // 4. HIỆN ALERT THÀNH CÔNG
        alert("✅ Tạo Bước chống thành công!");

    } catch (e: any) {
        // 5. BẮT LỖI và xử lý chi tiết
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
      {saveError && <p className="text-red-500 mt-3">Lỗi: {saveError.toString()}</p>}
    </LayoutInput>
  );
}