import React from "react"; // 1. Thêm React
import PATHS from "../../../../hooks/path";
import LayoutInput from "../../../../layout/layout_input";
import { useApi } from "../../../../hooks/useFetchData"; // 2. Import useApi

// 3. Cập nhật props
interface Specification01InputProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function Specification01Input({ onClose, onSuccess }: Specification01InputProps) {
  // 4. Khai báo API
  const basePath = `/api/product/passport`;
  const { postData, loading: saving, error: saveError } = useApi(basePath);

  // 5. Cập nhật handleSubmit
  const handleSubmit = async (data: Record<string, string>) => {
    const name = data["Hộ chiếu"]?.trim();
    // Giả định 'Sđ' trả về 1 string (có thể là "2-3" hoặc giá trị đơn)
    const sd = data["Sđ"]?.trim(); 
    const scString = data["Sc"]?.trim();

    // Validation
    if (!name) return alert("⚠️ Vui lòng nhập Hộ chiếu!");
    if (!sd) return alert("⚠️ Vui lòng nhập Sđ!");
    if (!scString) return alert("⚠️ Vui lòng nhập Sc!");

    // Chuyển đổi Sc sang số
    const sc = parseFloat(scString);
    if (isNaN(sc)) {
      return alert("⚠️ Sc phải là một con số!");
    }

    // Payload (dựa theo mẫu JSON)
    const payload = {
      name,
      sd,
      sc,
    };

    console.log("📤 POST payload:", payload);

    // Gửi dữ liệu
    await postData(payload, () => {
      alert("✅ Tạo Hộ chiếu thành công!");
      onSuccess?.();
      onClose?.();
    });
  };
  
  // Fields (giữ nguyên)
  const fields = [
    { label: "Hộ chiếu", type: "text" as const, placeholder: "Nhập hộ chiếu" },
    // Giữ nguyên enableCompare, LayoutInput sẽ xử lý
    { label: "Sđ", type: "text" as const, placeholder: "Nhập Sđ: 2<=Sđ<=3", enableCompare: true }, 
    // Sửa: Nên dùng type "number" để đảm bảo đầu vào là số
    { label: "Sc", type: "text" as const, placeholder: "Nhập Sc" }, 
  ];

  return (
    // 6. Bọc bằng Fragment
     <LayoutInput
        title01="Danh mục / Thông số / Hộ chiếu Sđ, Sc"
        title="Tạo mới Hộ chiếu, Sđ, Sc"
        fields={fields}
        onSubmit={handleSubmit}
        closePath={PATHS.SPECIFICATION_01.LIST}
        onClose={onClose}
        // 7. Thêm initialData
        initialData={{
          "Hộ chiếu": "",
          "Sđ": "",
          "Sc": "",
        }}
      />
  );
}