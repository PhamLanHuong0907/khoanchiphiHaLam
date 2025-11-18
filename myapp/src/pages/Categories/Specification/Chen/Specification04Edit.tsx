import React, { useEffect, useState } from "react"; // 1. Thêm React, useEffect, useState
import PATHS from "../../../../hooks/path";
import LayoutInput from "../../../../layout/layout_input";
import { useApi } from "../../../../hooks/useFetchData"; // 2. Thêm useApi

// 3. Cập nhật props
interface Specification04EditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

// 4. Interface cho dữ liệu (dựa trên mẫu JSON của Specification04.tsx)
interface InsertItem {
  id: string;
  value: string;
}

export default function Specification04Edit({ id, onClose, onSuccess }: Specification04EditProps) {
  // 5. Khai báo API
  const basePath = `/api/product/insertitem`; // (Lấy từ file Specification04.tsx)
  const { fetchById, putData, loading: loadingData, error: dataError }
    = useApi<InsertItem>(basePath);

  // 6. State
  const [currentData, setCurrentData] = useState<InsertItem | null>(null);
  const [formData, setFormData] = useState({
    value: "",
  });

  // 7. Load data by ID
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id);
      if (res) setCurrentData(res as InsertItem);
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

    const value = data["Chèn"]?.trim();

    // Validation
    if (!value) return alert("⚠️ Vui lòng nhập Chèn!");

    // Payload (Mẫu JSON to put: { "id": "string", "value": "string" })
    const payload = {
      id,
      value,
    };

    console.log("📤 PUT payload:", payload);

    // Gửi dữ liệu
    await putData( payload, () => {
      alert("✅ Cập nhật Chèn thành công!");
      onSuccess?.();
      onClose?.();
    });
  };

  // Fields (giữ nguyên)
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
        // 11. Thêm initialData và shouldSync
        initialData={{
          "Chèn": formData.value,
        }}
        shouldSyncInitialData={true}
      />
  );
}