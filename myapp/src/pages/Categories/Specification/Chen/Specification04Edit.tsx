import { useEffect, useState } from "react"; 
import PATHS from "../../../../hooks/path";
import LayoutInput from "../../../../layout/layout_input";
import { useApi } from "../../../../hooks/useFetchData";

interface Specification04EditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Sửa type
}

interface InsertItem {
  id: string;
  value: string;
}

export default function Specification04Edit({ id, onClose, onSuccess }: Specification04EditProps) {
  const basePath = `/api/product/insertitem`;
  const { fetchById, putData, loading: loadingData, error: dataError } = useApi<InsertItem>(basePath);

  const [currentData, setCurrentData] = useState<InsertItem | null>(null);
  const [formData, setFormData] = useState({
    value: "",
  });

  // Load data by ID (giữ nguyên)
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id);
      if (res) setCurrentData(res as InsertItem);
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

    const value = data["Chèn"]?.trim();

    if (!value) return alert("⚠️ Vui lòng nhập Chèn!");

    const payload = { id, value };
    console.log("📤 PUT payload:", payload);

    // 1. ĐÓNG FORM NGAY LẬP TỨC

    try {
        // 2. CHẠY API VÀ CHỜ THÀNH CÔNG
        await Promise.all([
    putData(payload, undefined),
]);

await new Promise(r => setTimeout(r, 0));
        
        // 4. HIỆN ALERT THÀNH CÔNG
        alert("✅ Cập nhật Chèn thành công!");

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
    { label: "Chèn", type: "text" as const, placeholder: "Nhập thông số chèn" },
  ];

  return (
    <LayoutInput
      title01="Danh mục / Thông số / Chèn"
      title="Chỉnh sửa Chèn"
      fields={fields}
      onSubmit={handleSubmit}
      closePath={PATHS.SPECIFICATION_04.LIST}
      onClose={onClose}
      initialData={{
        "Chèn": formData.value,
      }}
      shouldSyncInitialData={true}
    >
      {loadingData && <p className="text-blue-500 mt-3">Đang xử lý dữ liệu...</p>}
      {dataError && <p className="text-red-500 mt-3">Lỗi: {dataError.toString()}</p>}
    </LayoutInput>
  );
}