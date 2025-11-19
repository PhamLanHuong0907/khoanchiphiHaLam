import React, { useState } from "react";
import PATHS from "../../../../hooks/path";
import LayoutInput from "../../../../layout/layout_input";
import { useApi } from "../../../../hooks/useFetchData";

interface Specification02InputProps {
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; 
}

export default function Specification02Input({ onClose, onSuccess }: Specification02InputProps) {
  const basePath = `/api/product/hardness`; 
  
  const { postData, error: saveError } = useApi(basePath, { autoFetch: false });

  const [formData] = useState({
    value: "",
  });

  const handleSubmit = async (data: Record<string, string>) => {
    const value = data["Độ kiên cố than, đá (f)"]?.trim();

    if (!value) return alert("⚠️ Vui lòng nhập Độ kiên cố than, đá!");

    const payload = { value };

    // 1. ĐÓNG FORM NGAY LẬP TỨC

    try {
        // 2. CHẠY API và CHỜ THÀNH CÔNG (Không dùng callback thứ hai)
        
        await Promise.all([
    postData(payload, undefined),
]);

await new Promise(r => setTimeout(r, 0));

        // 4. HIỆN ALERT THÀNH CÔNG
        alert("✅ Tạo Độ kiên cố thành công!");

    } catch (e: any) {
        // 5. BẮT LỖI và xử lý chi tiết bằng tiếng Việt
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        
        let errorMessage = "Đã xảy ra lỗi không xác định.";

        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            
            if (detail.includes("đã tồn tại") || detail.includes("duplicate")) {
                errorMessage = "Giá trị độ kiên cố này đã tồn tại trong hệ thống. Vui lòng nhập giá trị khác!";
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
      label: "Độ kiên cố than, đá (f)", 
      type: "text" as const, 
      placeholder: "Nhập độ kiên cố than, đá (f), ví dụ: 1<f<2", 
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
      {/* Chỉ hiển thị lỗi, không cần hiển thị loading nội bộ vì form đóng ngay */}
      {saveError && <p className="text-red-500 mt-3">Lỗi: {saveError.toString()}</p>}
    </LayoutInput>
  );
}