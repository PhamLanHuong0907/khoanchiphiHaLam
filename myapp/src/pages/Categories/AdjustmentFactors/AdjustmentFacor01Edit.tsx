import { useEffect, useState } from "react";
import PATHS from "../../../hooks/path";
import LayoutInput from "../../../layout/layout_input";
import { useApi } from "../../../hooks/useFetchData";

interface AdjustmentFactor01EditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Sửa type
}

interface AdjustmentFactor {
  id: string;
  code: string;
  name: string;
}

export default function AdjustmentFactor01Edit({ id, onClose, onSuccess }: AdjustmentFactor01EditProps) {
  const basePath = `api/adjustment/adjustmentfactor`;
  const { fetchById, putData } = useApi<AdjustmentFactor>(basePath);

  const [currentData, setCurrentData] = useState<AdjustmentFactor | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
  });

  // Load data by ID (giữ nguyên)
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id);
      if (res) setCurrentData(res as AdjustmentFactor);
    };
    loadData();
  }, [id, fetchById]);

  // Sync data to form state (giữ nguyên)
  useEffect(() => {
    if (currentData) {
      setFormData({
        code: currentData.code,
        name: currentData.name,
      });
    }
  }, [currentData]);

  // 9. Cập nhật handleSubmit (logic PUT)
  const handleSubmit = async (data: Record<string, string>) => {
    if (!id) return alert("❌ Thiếu ID để cập nhật!");

    const code = data["Mã hệ số điều chỉnh"]?.trim();
    const name = data["Tên hệ số điều chỉnh"]?.trim();

    if (!code) return alert("⚠️ Vui lòng nhập Mã hệ số điều chỉnh!");
    if (!name) return alert("⚠️ Vui lòng nhập Tên hệ số điều chỉnh!");

    const payload = { id, code, name };

    // 1. ĐÓNG FORM NGAY LẬP TỨC

    
    try {
        // 2. CHẠY API và CHỜ THÀNH CÔNG
        await Promise.all([
    putData(payload, undefined),

]);

await new Promise(r => setTimeout(r, 0));


        // 4. HIỆN ALERT THÀNH CÔNG
        alert("✅ Cập nhật hệ số điều chỉnh thành công!");

    } catch (e: any) {
        // 5. BẮT LỖI VÀ XỬ LÝ
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        
        let errorMessage = "Đã xảy ra lỗi không xác định.";

        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            
            if (detail.includes("Mã đã tồn tại") || detail.includes("duplicate")) {
                errorMessage = "Mã hệ số điều chỉnh này đã tồn tại trong hệ thống. Vui lòng nhập mã khác!";
            } else if (detail.includes("HTTP error") || detail.includes("network")) {
                errorMessage = "Yêu cầu đến máy chủ thất bại (Mất kết nối hoặc lỗi máy chủ).";
            } else {
                errorMessage = `Lỗi nghiệp vụ: ${detail}`;
            }
        }
        
        // 6. HIỆN ALERT THẤT BẠI CHI TIẾT
        alert(`❌ CẬP NHẬT THẤT BẠI: ${errorMessage}`);
    }
    onClose?.();
    onSuccess?.()
  };

  // Fields (giữ nguyên)
  const fields = [
    { label: "Mã hệ số điều chỉnh", type: "text" as const, placeholder: "Nhập mã hệ số điều chỉnh" },
    { label: "Tên hệ số điều chỉnh", type: "text" as const, placeholder: "Nhập tên hệ số điều chỉnh" },
  ];

  return (
      <LayoutInput
        title01="Danh mục / Hệ số điều chỉnh"
        title="Chỉnh sửa Hệ số điều chỉnh" 
        fields={fields}
        onSubmit={handleSubmit}
        onClose={onClose}
        closePath={PATHS.ADJUSTMENT_FACTORS_01.LIST}
        initialData={{
          "Mã hệ số điều chỉnh": formData.code,
          "Tên hệ số điều chỉnh": formData.name,
        }}
        shouldSyncInitialData={true}
      />
  );
}