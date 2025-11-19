import React from "react";
import PATHS from "../../../../hooks/path";
import { useApi } from "../../../../hooks/useFetchData";
import LayoutInput from "../../../../layout/layout_input";

// 3. Cập nhật props
interface Specification03InputProps {
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void;
}

export default function Specification03Input({
  onClose,
  onSuccess,
}: Specification03InputProps) {
  // 4. Khai báo API
  const basePath = `/api/product/stoneclampratio`;
  const { postData, loading: saving, error: saveError } = useApi(basePath, { autoFetch: false });

  // --- HÀM MỚI: Chặn nhập dấu phẩy (,) ---
  // Người dùng bắt buộc phải dùng dấu chấm (.)
  const blockCommaInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',') {
      e.preventDefault(); // Ngăn phím ','
    }
  };

  // 5. Cập nhật handleSubmit
  const handleSubmit = async (data: Record<string, string>) => {
    // Lấy dữ liệu từ form
    const rawValue = data["Tỷ lệ đá kẹp (Ckep)"]?.trim();
    const rawCoefficient = data["Hệ số điều chỉnh định mức"]?.trim();

    // Validation cơ bản
    if (!rawValue) return alert("⚠️ Vui lòng nhập Tỷ lệ đá kẹp!");
    if (!rawCoefficient) return alert("⚠️ Vui lòng nhập Hệ số điều chỉnh định mức!");

    // --- XỬ LÝ FORMAT (Safety) ---
    // Dù đã chặn phím ',', ta vẫn replace để phòng trường hợp user copy-paste văn bản chứa dấu ',' vào.
    const formattedValue = rawValue.replace(/,/g, '.');          // "1,98 <=Ckep<8" -> "1.98 <=Ckep<8"
    const formattedCoefficient = rawCoefficient.replace(/,/g, '.'); // "1,98" -> "1.98"

    // Validation số cho Hệ số (Vì hệ số bắt buộc là số)
    if (isNaN(Number(formattedCoefficient))) {
      return alert("⚠️ Hệ số điều chỉnh phải là số hợp lệ (Ví dụ: 1.98)!");
    }

    // Payload
    const payload = {
      // Tỷ lệ đá kẹp giữ là STRING vì chứa ký tự so sánh (<=, Ckep)
      value: formattedValue, 
      
      // Hệ số chuyển sang NUMBER (float) trước khi post
      coefficientValue: parseFloat(formattedCoefficient) 
    };

    // 1. Gọi API
    try {
      await Promise.all([
        postData(payload, undefined),
      ]);

      await new Promise(r => setTimeout(r, 0));

      alert("✅ Tạo Tỷ lệ đá kẹp thành công!");
      onClose?.();
      onSuccess?.();

    } catch (e: any) {
      console.error("Lỗi giao dịch:", e);
      let errorMessage = "Đã xảy ra lỗi không xác định.";

      if (e && typeof e.message === 'string') {
        const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
        if (detail.includes("đã tồn tại") || detail.includes("duplicate")) {
          errorMessage = "Tỷ lệ đá kẹp này đã tồn tại. Vui lòng nhập giá trị khác!";
        } else if (detail.includes("network")) {
          errorMessage = "Lỗi kết nối máy chủ.";
        } else {
          errorMessage = `Lỗi: ${detail}`;
        }
      }
      alert(`❌ TẠO THẤT BẠI: ${errorMessage}`);
    }
  };

  // Fields
  const fields = [
    {
      label: "Tỷ lệ đá kẹp (Ckep)",
      type: "text" as const,
      // Placeholder hướng dẫn đúng định dạng dấu chấm
      placeholder: "Nhập tỷ lệ đá kẹp, ví dụ: 2<=Ckep<3", 
      enableCompare: true,
      // Chặn dấu phẩy, ép dùng dấu chấm
      onKeyDown: blockCommaInput,
    },
    {
      label: "Hệ số điều chỉnh định mức",
      type: "text" as const,
      placeholder: "Nhập hệ só điều chỉnh định mức, ví dụ: 1,2",
      // Chặn dấu phẩy
      onKeyDown: blockCommaInput,
    },
  ];

  return (
    <LayoutInput
      title01="Danh mục / Thông số / Tỷ lệ đá kẹp"
      title="Tạo mới Tỷ lệ đá kẹp"
      fields={fields}
      onSubmit={handleSubmit}
      closePath={PATHS.SPECIFICATION_03.LIST}
      onClose={onClose}
      initialData={{
        "Tỷ lệ đá kẹp (Ckep)": "",
        "Hệ số điều chỉnh định mức": "",
      }}
    >
      {saving && <p className="text-blue-500 mt-3">Đang xử lý...</p>}
      {saveError && <p className="text-red-500 mt-3">Lỗi: {saveError.toString()}</p>}
    </LayoutInput>
  );
}