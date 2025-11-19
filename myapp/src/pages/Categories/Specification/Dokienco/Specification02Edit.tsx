import React, { useEffect, useState } from "react";
import PATHS from "../../../../hooks/path";
import LayoutInput from "../../../../layout/layout_input";
import { useApi } from "../../../../hooks/useFetchData";

interface Specification02EditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; 
}

interface Hardness {
  id: string;
  value: string;
}

export default function Specification02Edit({ id, onClose, onSuccess }: Specification02EditProps) {
  const basePath = `/api/product/hardness`;
  const { fetchById, putData, loading: loadingData, error: dataError } = useApi<Hardness>(basePath);

  const [currentData, setCurrentData] = useState<Hardness | null>(null);
  const [formData, setFormData] = useState({
    value: "",
  });

  // Load data by ID (giữ nguyên)
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id);
      if (res) setCurrentData(res as Hardness);
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

    const value = data["Độ kiên cố than, đá (f)"]?.trim();

    if (!value) return alert("⚠️ Vui lòng nhập Độ kiên cố!");

    const payload = { id, value };

    // 1. ĐÓNG FORM NGAY LẬP TỨC

    try {
        // 2. CHẠY API và CHỜ THÀNH CÔNG
        await Promise.all([
    putData(payload, undefined),
]);

await new Promise(r => setTimeout(r, 0));

        // 4. HIỆN ALERT THÀNH CÔNG
        alert("✅ Cập nhật Độ kiên cố thành công!");

    } catch (e: any) {
        // 5. BẮT LỖI và xử lý chi tiết bằng tiếng Việt
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        
        let errorMessage = "Đã xảy ra lỗi không xác định.";

        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            
            if (detail.includes("đã tồn tại") || detail.includes("duplicate")) {
                errorMessage = "Giá trị độ kiên cố này đã tồn tại trong hệ thống. Vui lòng nhập giá trị khác!";
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
    { 
      label: "Độ kiên cố than, đá (f)", 
      type: "text" as const, 
      placeholder: "Nhập độ kiên cố than, đá (f), ví dụ: 1<f<2", 
      enableCompare: true 
    },
  ];

  return (
    <LayoutInput
      title01="Danh mục / Thông số / Độ kiên cố than, đá (f)"
      title="Chỉnh sửa Độ kiên cố than, đá"
      fields={fields}
      onSubmit={handleSubmit}
      closePath={PATHS.SPECIFICATION_02.LIST}
      onClose={onClose}
      initialData={{
        "Độ kiên cố than, đá (f)": formData.value,
      }}
      shouldSyncInitialData={true}
    >
      {/* Hiển thị trạng thái */}
      {loadingData && <p className="text-blue-500 mt-3">Đang xử lý dữ liệu...</p>}
      {dataError && <p className="text-red-500 mt-3">Lỗi: {dataError.toString()}</p>}
    </LayoutInput>
  );
}