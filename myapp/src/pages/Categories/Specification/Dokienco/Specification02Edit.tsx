import React, { useEffect, useState } from "react"; // 1. Thêm React, useEffect, useState
import PATHS from "../../../../hooks/path";
import LayoutInput from "../../../../layout/layout_input";
import { useApi } from "../../../../hooks/useFetchData"; // 2. Thêm useApi

// 3. Cập nhật props
interface Specification02EditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

// 4. Interface cho dữ liệu
interface Hardness {
  id: string;
  value: string;
}

// 5. Sửa tên component (user cung cấp file tên Specification02Edit.tsx)
export default function Specification02Edit({ id, onClose, onSuccess }: Specification02EditProps) {
  // 6. Khai báo API
  const basePath = `/api/product/hardness`; // (Lấy từ file .tsx list)
  const { fetchById, putData, loading: loadingData, error: dataError }
    = useApi<Hardness>(basePath);

  // 7. State
  const [currentData, setCurrentData] = useState<Hardness | null>(null);
  const [formData, setFormData] = useState({
    value: "",
  });

  // 8. Load data by ID
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id);
      if (res) setCurrentData(res as Hardness);
    };
    loadData();
  }, [id, fetchById]);

  // 9. Sync data to form state
  useEffect(() => {
    if (currentData) {
      setFormData({
        value: currentData.value,
      });
    }
  }, [currentData]);

  // 10. Cập nhật handleSubmit (logic PUT)
  const handleSubmit = async (data: Record<string, string>) => {
    if (!id) return alert("❌ Thiếu ID để cập nhật!");

    const value = data["Độ kiên cố than, đá (f)"]?.trim();

    // Validation
    if (!value) return alert("⚠️ Vui lòng nhập Độ kiên cố!");

    // Payload
    const payload = {
      id,
      value,
    };

    console.log("📤 PUT payload:", payload);

    // Gửi dữ liệu
    await putData(payload, () => {
      alert("✅ Cập nhật Độ kiên cố thành công!");
      onSuccess?.();
      onClose?.();
    });
  };

  // Fields (giữ nguyên)
  const fields = [
    { label: "Độ kiên cố than, đá (f)", type: "text" as const, placeholder: "Nhập độ kiên cố than, đá (f): 2<=f<=3", enableCompare: true },
  ];

  return (
    // 11. Bọc bằng Fragment
    <>
      <LayoutInput
        title01="Danh mục / Thông số / Độ kiên cố than, đá (f)"
        title="Chỉnh sửa Độ kiên cố than, đá"
        fields={fields}
        onSubmit={handleSubmit}
        closePath={PATHS.SPECIFICATION_02.LIST}
        onClose={onClose}
        // 12. Thêm initialData và shouldSync
        initialData={{
          "Độ kiên cố than, đá (f)": formData.value,
        }}
        shouldSyncInitialData={true}
      />
      {/* 13. Thêm loading/error state */}
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