import React, { useEffect, useState } from "react";
import PATHS from "../../../../hooks/path";
import LayoutInput from "../../../../layout/layout_input";
import { useApi } from "../../../../hooks/useFetchData"; 

// 3. Cập nhật props
interface Specification03EditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Sửa type
}

// 4. Interface cho dữ liệu (Thêm trường mới)
interface StoneClampRatio {
  id: string;
  value: string;
  coefficientValue: number; // Trường mới
}

export default function Specification03Edit({ id, onClose, onSuccess }: Specification03EditProps) {
  // 5. Khai báo API
  const basePath = `/api/product/stoneclampratio`;
  const { fetchById, putData, loading: loadingData, error: dataError }
    = useApi<StoneClampRatio>(basePath);

  // 6. State
  const [currentData, setCurrentData] = useState<StoneClampRatio | null>(null);
  const [formData, setFormData] = useState({
    value: "",
    coefficientValue: "", // Trường mới
  });

  // 7. Load data by ID (giữ nguyên)
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id);
      if (res) setCurrentData(res as StoneClampRatio);
    };
    loadData();
  }, [id, fetchById]);

  // 8. Sync data to form state (Cập nhật logic sync)
  useEffect(() => {
    if (currentData) {
      setFormData({
        value: currentData.value,
        coefficientValue: currentData.coefficientValue?.toString() || "",
      });
    }
  }, [currentData]);

  // 9. Cập nhật handleSubmit (logic PUT)
  const handleSubmit = async (data: Record<string, string>) => {
    if (!id) return alert("❌ Thiếu ID để cập nhật!");

    const value = data["Tỷ lệ đá kẹp (Ckep)"]?.trim();
    const coefficientValueStr = data["Hệ số điều chỉnh định mức"]?.trim(); // Trường mới

    // Validation
    if (!value) return alert("⚠️ Vui lòng nhập Tỷ lệ đá kẹp!");
    if (!coefficientValueStr) return alert("⚠️ Vui lòng nhập Hệ số điều chỉnh định mức!");

    // Chuyển đổi an toàn
    const coefficientValue = parseFloat(coefficientValueStr);
    if (isNaN(coefficientValue)) return alert("⚠️ Hệ số điều chỉnh định mức phải là một con số!");

    // Payload (Thêm trường mới)
    const payload = {
      id,
      value,
      coefficientValue,
    };
    
    // 1. ĐÓNG FORM NGAY LẬP TỨC

    try {
        // 2. CHẠY API VÀ CHỜ THÀNH CÔNG
      await Promise.all([
    putData(payload, undefined),
]);

await new Promise(r => setTimeout(r, 0));
        await new Promise(resolve => setTimeout(resolve, 0));

        // 4. HIỆN ALERT THÀNH CÔNG
        alert("✅ Cập nhật Tỷ lệ đá kẹp thành công!");

    } catch (e: any) {
        // 5. BẮT LỖI VÀ XỬ LÝ
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        
        let errorMessage = "Đã xảy ra lỗi không xác định.";

        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            
            if (detail.includes("đã tồn tại") || detail.includes("duplicate")) {
                errorMessage = "Tỷ lệ đá kẹp này đã tồn tại trong hệ thống. Vui lòng nhập giá trị khác!";
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

  // Fields (Thêm trường mới)
  const fields = [
    { label: "Tỷ lệ đá kẹp (Ckep)", type: "text" as const, placeholder: "Nhập tỷ lệ đá kẹp: 2<=Ckep<=3", enableCompare: true },
    { label: "Hệ số điều chỉnh định mức", type: "text" as const, placeholder: "Nhập hệ số điều chỉnh định mức" },
  ];

  return (
      <LayoutInput
        title01="Danh mục / Thông số / Tỷ lệ đá kẹp"
        title="Chỉnh sửa Tỷ lệ đá kẹp"
        fields={fields}
        onSubmit={handleSubmit}
        closePath={PATHS.SPECIFICATION_03.LIST}
        onClose={onClose}
        // 11. Thêm initialData và shouldSync
        initialData={{
          "Tỷ lệ đá kẹp (Ckep)": formData.value,
          "Hệ số điều chỉnh định mức": formData.coefficientValue,
        }}
        shouldSyncInitialData={true}
      >
      {/* 12. Thêm loading/error state */}
      <div style={{ padding: '0 20px', marginTop: '-10px' }}>
        {(loadingData) && (
          <p className="text-blue-500 mt-3">Đang tải dữ liệu...</p>
        )}
        {(dataError) && (
          <p className="text-red-500 mt-3">Lỗi: {dataError.toString()}</p>
        )}
      </div>
      </LayoutInput>
  );
}