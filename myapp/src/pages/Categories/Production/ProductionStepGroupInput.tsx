import React from "react";
import LayoutInput from "../../../layout/layout_input";
import PATHS from "../../../hooks/path";
import { useApi } from "../../../hooks/useFetchData";

interface ProductionStepGroupInputProps {
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Sửa type
}

const ProductionStepGroupInput: React.FC<ProductionStepGroupInputProps> = ({
  onClose,
  onSuccess,
}) => {
  const basePath = `/api/process/processgroup`;
  // Sử dụng autoFetch: false vì đây là form input
  const { postData, error: saveError } = useApi(basePath, { autoFetch: false });

  const handleSubmit = async (data: Record<string, string>) => {
    const code = data["Mã nhóm công đoạn sản xuất"]?.trim();
    const name = data["Tên nhóm công đoạn sản xuất"]?.trim();

    if (!code || !name) {
      alert("⚠️ Vui lòng nhập đầy đủ Mã và Tên nhóm công đoạn sản xuất!");
      return;
    }

    const payload = { code, name };
    
    // 1. ✅ ĐÓNG FORM NGAY LẬP TỨC
 

    try {
        // 2. CHẠY API và CHỜ THÀNH CÔNG (Không dùng callback thứ hai)
        await Promise.all([
    postData(payload, undefined),

]);

await new Promise(r => setTimeout(r, 0));


        // 4. HIỆN ALERT THÀNH CÔNG
        alert("✅ Tạo nhóm công đoạn sản xuất thành công!");

    } catch (e: any) {
        // 5. BẮT LỖI và xử lý chi tiết bằng tiếng Việt
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        
        let errorMessage = "Đã xảy ra lỗi không xác định.";

        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            
            if (detail.includes("Mã đã tồn tại") || detail.includes("duplicate")) {
                errorMessage = "Mã nhóm công đoạn sản xuất này đã tồn tại. Vui lòng nhập mã khác!";
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
      label: "Mã nhóm công đoạn sản xuất",
      type: "text" as const,
      placeholder: "Nhập mã nhóm công đoạn sản xuất, ví dụ: DL",
    },
    {
      label: "Tên nhóm công đoạn sản xuất",
      type: "text" as const,
      placeholder: "Nhập tên nhóm công đoạn sản xuất, ví dụ: Đào lò",
    },
  ];

  return (
    <LayoutInput
      title01="Danh mục / Công đoạn sản xuất / Nhóm công đoạn sản xuất"
      title="Tạo mới Nhóm công đoạn sản xuất"
      fields={fields}
      onSubmit={handleSubmit}
      closePath={PATHS.PRODUCTION_STEP_GROUP.LIST}
      onClose={onClose}
      initialData={{
        "Mã nhóm công đoạn sản xuất": "",
        "Tên nhóm công đoạn sản xuất": "",
      }}
    >
      {/* Chỉ hiển thị lỗi, không cần hiển thị loading nội bộ vì form đóng ngay */}
      {saveError && <p className="text-red-500 mt-2">❌ Lỗi: {saveError}</p>}
    </LayoutInput>
  );
};

export default ProductionStepGroupInput;