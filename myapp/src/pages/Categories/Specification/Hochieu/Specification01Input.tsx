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

  // --- HÀM CHẶN NHẬP DẤU CHẤM (.) ---
  // Áp dụng cho tất cả các input
  const blockDotInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '.') {
      e.preventDefault();
    }
  };

  const handleSubmit = async (data: Record<string, string>) => {
    // Lấy dữ liệu dạng String từ Form
    const name = data["Hộ chiếu"]?.trim();
    const rawSd = data["Sđ"]?.trim(); 
    const rawSc = data["Sc"]?.trim();

    // Validation rỗng
    if (!name) return alert("⚠️ Vui lòng nhập Hộ chiếu!");
    if (!rawSd) return alert("⚠️ Vui lòng nhập Sđ!");
    if (!rawSc) return alert("⚠️ Vui lòng nhập Sc!");

    // --- XỬ LÝ SỐ LIỆU (Sđ, Sc) ---
    // 1. Thay thế dấu phẩy (,) thành dấu chấm (.) để đúng chuẩn số học
    const formattedSd = rawSd.replace(/,/g, '.');
    const formattedSc = rawSc.replace(/,/g, '.');

    // 2. Kiểm tra tính hợp lệ (Dù input là string nhưng nội dung phải là số)
    if (isNaN(Number(formattedSd))) return alert("⚠️ Sđ phải là số hợp lệ (VD: 9,8)!");
    if (isNaN(Number(formattedSc))) return alert("⚠️ Sc phải là số hợp lệ (VD: 9,8)!");

    // 3. Tạo Payload
    // Lưu ý: name giữ nguyên String, sd và sc chuyển thành Number (float)
    const payload = { 
        name: name, 
        sd: parseFloat(formattedSd), // "9,8" -> 9.8
        sc: parseFloat(formattedSc)  // "9,8" -> 9.8
    };
    
    console.log("📤 POST payload:", payload);

    try {
        // Gọi API
        await Promise.all([
          postData(payload, undefined),
        ]);

        // Delay nhỏ để UI kịp phản hồi
        await new Promise(r => setTimeout(r, 0));

        alert("✅ Tạo Hộ chiếu thành công!");
        
        onClose?.();
        onSuccess?.();

    } catch (e: any) {
        console.error("Lỗi giao dịch:", e);
        let errorMessage = "Đã xảy ra lỗi không xác định.";

        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            if (detail.includes("đã tồn tại") || detail.includes("duplicate")) {
                errorMessage = "Dữ liệu này đã tồn tại. Vui lòng kiểm tra lại!";
            } else if (detail.includes("network")) {
                errorMessage = "Lỗi kết nối máy chủ.";
            } else {
                errorMessage = `Lỗi: ${detail}`;
            }
        }
        alert(`❌ TẠO THẤT BẠI: ${errorMessage}`);
    }
  };
  
  // Cấu hình các trường input
  const fields = [
    { 
        label: "Hộ chiếu", 
        type: "text" as const, 
        placeholder: "Nhập hộ chiếu",
        // ✅ Đã thêm chặn dấu chấm cho Hộ chiếu
        onKeyDown: blockDotInput 
    },
    { 
        label: "Sđ", 
        type: "text" as const, 
        placeholder: "Nhập Sđ (VD: 9,8)", 
        enableCompare: true,
        // ✅ Đã thêm chặn dấu chấm
        onKeyDown: blockDotInput 
    }, 
    { 
        label: "Sc", 
        type: "text" as const, 
        placeholder: "Nhập Sc (VD: 9,8)", 
        enableCompare: true,
        // ✅ Đã thêm chặn dấu chấm
        onKeyDown: blockDotInput 
    }, 
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
        {saveError && <p className="text-red-500 mt-3">Lỗi: {saveError.toString()}</p>}
      </LayoutInput>
  );
}