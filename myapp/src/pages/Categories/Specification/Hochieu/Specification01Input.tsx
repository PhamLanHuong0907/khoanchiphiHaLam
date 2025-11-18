import React, { useState } from "react"; 
import PATHS from "../../../../hooks/path";
import LayoutInput from "../../../../layout/layout_input";
import { useApi } from "../../../../hooks/useFetchData";

interface Specification01InputProps {
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Async
}

export default function Specification01Input({ onClose, onSuccess }: Specification01InputProps) {
  const basePath = `/api/product/passport`;
  
  // ✅ autoFetch: false
  const { postData, loading: saving, error: saveError } = useApi(basePath, { autoFetch: false });

  // State binding (tùy chọn)
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

    // Gọi API
    await postData(payload, async () => {
      // 1. Chờ reload dữ liệu
      if (onSuccess) {
        await onSuccess();
      }

      // 2. Chờ 300ms UI vẽ xong
      setTimeout(() => {
        alert("✅ Tạo Hộ chiếu thành công!");
        onClose?.();
      }, 300);
    });
  };
  
  const fields = [
    { label: "Hộ chiếu", type: "text" as const, placeholder: "Nhập hộ chiếu" },
    { label: "Sđ", type: "text" as const, placeholder: "Nhập Sđ: 2<=Sđ<=3", enableCompare: true }, 
    { label: "Sc", type: "text" as const, placeholder: "Nhập Sc" }, 
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
        {saving && <p className="text-blue-500 mt-3">Đang xử lý...</p>}
        {saveError && <p className="text-red-500 mt-3">Lỗi: {saveError.toString()}</p>}
      </LayoutInput>
  );
}