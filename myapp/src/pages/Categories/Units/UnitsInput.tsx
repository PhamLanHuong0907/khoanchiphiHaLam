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
  const { postData, loading: saving, error: saveError } = useApi(basePath, { autoFetch: false });

  const [formData] = useState({
    name: "",
  });

  const handleSubmit = async (data: Record<string, string>) => {
    const name = data["Đơn vị tính"]?.trim();
    if (!name) return alert("⚠️ Vui lòng nhập đơn vị tính!");

    const payload = { name };
    
    // Khởi tạo Promise API, truyền logic reload vào callback thành công
    const apiPromise = postData(payload, async () => {
        if (onSuccess) {
            await onSuccess(); // Trigger Parent Refresh (loading state)
        }
    });

    // 1. ✅ ĐÓNG FORM NGAY LẬP TỨC (Kích hoạt màn hình tối/overlay của Parent)
    onClose?.(); 

    try {
        // 2. CHỜ API VÀ RELOAD HOÀN TẤT (Loading overlay ở Parent đã hiện rồi ẩn)
        await apiPromise; 

        // 3. ✅ CHỜ NEXT RENDER TICK: Loại bỏ dependency 300ms cố định
        // Đây là cách đáng tin cậy nhất để chờ React hoàn thành việc vẽ lại UI (re-paint).
        await new Promise(resolve => setTimeout(resolve, 0));

        // 4. HIỆN ALERT (Đã reload xong, không phụ thuộc vào thời gian)
        alert("✅ Tạo đơn vị tính thành công!");

    } catch (e) {
        // 5. Bắt lỗi (Vì form đã đóng)
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        alert("❌ Đã xảy ra lỗi. Vui lòng kiểm tra lại dữ liệu.");
    }
  };

  const fields = [
    {
      label: "Đơn vị tính",
      type: "text" as const,
      placeholder: "Nhập tên đơn vị tính, ví dụ cm",
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
      {saving && <p className="text-blue-500 mt-3">Đang lưu...</p>}
      {saveError && <p className="text-red-500 mt-3">Lỗi: {saveError}</p>}
    </LayoutInput>
  );
};

export default UnitsInput;