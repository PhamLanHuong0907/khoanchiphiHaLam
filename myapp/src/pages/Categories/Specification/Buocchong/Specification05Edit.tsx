import { useEffect, useState } from "react";
import PATHS from "../../../../hooks/path";
import LayoutInput from "../../../../layout/layout_input";
import { useApi } from "../../../../hooks/useFetchData";

interface Specification05EditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; 
}

interface SupportStep {
  id: string;
  value: string;
}

export default function Specification05Edit({ id, onClose, onSuccess }: Specification05EditProps) {
  const basePath = `api/product/supportstep`; 
  const { fetchById, putData, loading: loadingData, error: dataError } = useApi<SupportStep>(basePath);

  const [currentData, setCurrentData] = useState<SupportStep | null>(null);
  const [formData, setFormData] = useState({
    value: "",
  });

  // Load data by ID (giữ nguyên)
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id);
      if (res) setCurrentData(res as SupportStep);
    };
    loadData();
  }, [id, fetchById]);

  // Sync data to form state (giữ nguyên)
  useEffect(() => {
    if (currentData) {
      setFormData({
        value: currentData.value,
      });
    }
  }, [currentData]);

  const handleSubmit = async (data: Record<string, string>) => {
    if (!id) return alert("❌ Thiếu ID để cập nhật!");

    const value = data["Bước chống"]?.trim();

    if (!value) return alert("⚠️ Vui lòng nhập Bước chống!");

    const payload = { id, value };

    // 1. ĐÓNG FORM NGAY LẬP TỨC

    try {
        await Promise.all([
    putData(payload, undefined),
]);

await new Promise(r => setTimeout(r, 0));
        // 4. HIỆN ALERT THÀNH CÔNG
        alert("✅ Cập nhật Bước chống thành công!");

    } catch (e: any) {
        // 5. BẮT LỖI VÀ XỬ LÝ
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        
        let errorMessage = "Đã xảy ra lỗi không xác định.";

        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            
            if (detail.includes("đã tồn tại") || detail.includes("duplicate")) {
                errorMessage = "Dữ liệu này đã tồn tại trong hệ thống. Vui lòng nhập giá trị khác!";
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

  const fields = [
    { label: "Bước chống", type: "text" as const, placeholder: "Nhập thông số bước chống" },
  ];

  return (
    <LayoutInput
      title01="Danh mục / Thông số / Bước chống"
      title="Chỉnh sửa Bước chống"
      fields={fields}
      onSubmit={handleSubmit}
      closePath={PATHS.SPECIFICATION_05.LIST}
      onClose={onClose}
      initialData={{
        "Bước chống": formData.value,
      }}
      shouldSyncInitialData={true}
    >
      {/* Hiển thị lỗi cuối cùng */}
      {dataError && <p className="text-red-500 mt-3">Lỗi: {dataError.toString()}</p>}
    </LayoutInput>
  );
}