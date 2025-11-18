import React, { useEffect, useState } from "react"; // 1. Thêm React, useEffect, useState
import PATHS from "../../../../hooks/path";
import LayoutInput from "../../../../layout/layout_input";
import { useApi } from "../../../../hooks/useFetchData"; // 2. Thêm useApi

// 3. Cập nhật props
interface Specification05EditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

// 4. Interface cho dữ liệu (dựa trên mẫu JSON của Specification05.tsx)
interface SupportStep {
  id: string;
  value: string;
}

export default function Specification05Edit({ id, onClose, onSuccess }: Specification05EditProps) {
  // 5. Khai báo API
  const basePath = `api/product/supportstep`; // (Lấy từ file Specification05.tsx)
  const { fetchById, putData, loading: loadingData, error: dataError }
    = useApi<SupportStep>(basePath);

  // 6. State
  const [currentData, setCurrentData] = useState<SupportStep | null>(null);
  const [formData, setFormData] = useState({
    value: "",
  });

  // 7. Load data by ID
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id);
      if (res) setCurrentData(res as SupportStep);
    };
    loadData();
  }, [id, fetchById]);

  // 8. Sync data to form state
  useEffect(() => {
    if (currentData) {
      setFormData({
        value: currentData.value,
      });
    }
  }, [currentData]);

  // 9. Cập nhật handleSubmit (logic PUT)
  const handleSubmit = async (data: Record<string, string>) => {
    if (!id) return alert("❌ Thiếu ID để cập nhật!");

    const value = data["Bước chống"]?.trim();

    // Validation
    if (!value) return alert("⚠️ Vui lòng nhập Bước chống!");

    // Payload (Mẫu JSON to put: { "id": "string", "value": "string" })
    const payload = {
      id,
      value,
    };

    console.log("📤 PUT payload:", payload);

    // Gửi dữ liệu
    await putData( payload, () => {
      alert("✅ Cập nhật Bước chống thành công!");
      onSuccess?.();
      onClose?.();
    });
  };

  // Fields (giữ nguyên)
  const fields = [
    { label: "Bước chống", type: "text" as const, placeholder: "Nhập thông số bước chống" },
  ];

  return (
    // 10. Bọc bằng Fragment
    <>
      <LayoutInput
        title01="Danh mục / Thông số / Bước chống"
        title="Chỉnh sửa Bước chống"
        fields={fields}
        onSubmit={handleSubmit}
        closePath={PATHS.SPECIFICATION_05.LIST}
        onClose={onClose}
        // 11. Thêm initialData và shouldSync
        initialData={{
          "Bước chống": formData.value,
        }}
        shouldSyncInitialData={true}
      />
      {/* 12. Thêm loading/error state */}
      <div style={{ padding: '0 20px', marginTop: '-10px' }}>
        {(loadingData) && (
          <p className="text-blue-500 mt-3">Đang tải dữ liệu...</p>
        )}
        {(dataError) && (
          <p className="text-red-500 mt-3">Lỗi: {dataError.toString()}</p>
        )}
      </div>
    </>
  );
}