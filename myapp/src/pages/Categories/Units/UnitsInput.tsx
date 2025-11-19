import React, { useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import PATHS from "../../../hooks/path";
import { useApi } from "../../../hooks/useFetchData";

interface UnitsInputProps {
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void;
}

const UnitsInput: React.FC<UnitsInputProps> = ({ onClose, onSuccess }) => {
  const basePath = `/api/catalog/unitofmeasure`;
  const { postData } = useApi(basePath, { autoFetch: false });

  const [formData] = useState({
    name: "",
  });

  const handleSubmit = async (data: Record<string, string>) => {
    const name = data["Đơn vị tính"]?.trim();
    if (!name) return alert("⚠️ Vui lòng nhập đơn vị tính!");

    const payload = { name };
    
    // Khởi tạo Promise API, truyền logic reload vào callback thành công
  

    // 1. ✅ ĐÓNG FORM NGAY LẬP TỨC (Optimistic Close)
    

    try {
        // 2. CHỜ API VÀ RELOAD HOÀN TẤT
        await Promise.all([
    postData(payload, undefined),

]);

await new Promise(r => setTimeout(r, 0));
onClose?.();
    onSuccess?.()
        // 4. HIỆN ALERT (Đã reload xong, không phụ thuộc vào thời gian)
        alert("✅ Tạo đơn vị tính thành công!");

    } catch (e) {
        // 5. Bắt lỗi (Vì form đã đóng, alert lỗi ra ngoài)
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        alert("❌ Đã xảy ra lỗi. Vui lòng kiểm tra lại dữ liệu.");
    }
    
  };

  const fields = [
    {
      label: "Đơn vị tính",
      type: "text" as const,
      placeholder: "Nhập tên đơn vị tính, ví dụ: cái",
    },
  ];

  return (
    <LayoutInput
      title01="Danh mục / Đơn vị tính"
      title="Tạo mới Đơn vị tính"
      fields={fields}
      onSubmit={handleSubmit}
      closePath={PATHS.UNIT.LIST}
      onClose={onClose}
      initialData={{
        "Đơn vị tính": formData.name,
      }}
    >
      {/* ❌ ĐÃ XÓA: Loại bỏ hiển thị loading/error nội bộ vì form đóng ngay lập tức 
             và lỗi đã được xử lý qua alert trong khối catch. */}
    </LayoutInput>
  );
};

export default UnitsInput;