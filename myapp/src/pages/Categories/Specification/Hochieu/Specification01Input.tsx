import React, { useState } from "react"; 
import PATHS from "../../../../hooks/path";
import LayoutInput from "../../../../layout/layout_input";
import { useApi } from "../../../../hooks/useFetchData";

interface Specification01InputProps {
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; 
}

export default function Specification01Input({ onClose, onSuccess }: Specification01InputProps) {
  const basePath = `/api/product/passport`;
  
  const { postData, error: saveError } = useApi(basePath, { autoFetch: false });

  const [formData] = useState({
    name: "",
    sd: "",
    sc: "",
  });

  const handleSubmit = async (data: Record<string, string>) => {
    const name = data["Hộ chiếu"]?.trim();
    const sd = data["Sđ"]?.trim(); 
    const scString = data["Sc"]?.trim();

    if (!name) return alert("⚠️ Vui lòng nhập Hộ chiếu!");
    if (!sd) return alert("⚠️ Vui lòng nhập Sđ!");
    if (!scString) return alert("⚠️ Vui lòng nhập Sc!");

    // Chuyển đổi Sc sang số an toàn
    const sc = parseFloat(scString.replace(',', '.')); // Hỗ trợ cả dấu phẩy
    if (isNaN(sc)) {
      return alert("⚠️ Sc phải là một con số!");
    }

    const payload = { name, sd, sc };
    console.log("📤 POST payload:", payload);

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
        alert("✅ Tạo Hộ chiếu thành công!");

    } catch (e: any) {
        // 5. BẮT LỖI và xử lý chi tiết bằng tiếng Việt
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        
        let errorMessage = "Đã xảy ra lỗi không xác định.";

        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            
            if (detail.includes("đã tồn tại") || detail.includes("duplicate")) {
                errorMessage = "Dữ liệu Hộ chiếu này đã tồn tại trong hệ thống. Vui lòng nhập giá trị khác!";
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
  
  const fields = [
    { label: "Hộ chiếu", type: "text" as const, placeholder: "Nhập hộ chiếu" },
    { label: "Sđ", type: "text" as const, placeholder: "Nhập Sđ", enableCompare: true }, 
    { label: "Sc", type: "text" as const, placeholder: "Nhập Sc", enableCompare: true }, 
  ];

  return (
     <LayoutInput
        title01="Danh mục / Thông số / Hộ chiếu Sđ, Sc"
        title="Tạo mới Hộ chiếu, Sđ, Sc"
        fields={fields}
        onSubmit={handleSubmit}
        closePath={PATHS.SPECIFICATION_01.LIST}
        onClose={onClose}
        initialData={{
          "Hộ chiếu": formData.name,
          "Sđ": formData.sd,
          "Sc": formData.sc,
        }}
      >
        {/* Hiển thị lỗi cuối cùng */}
        {saveError && <p className="text-red-500 mt-3">Lỗi: {saveError.toString()}</p>}
      </LayoutInput>
  );
}