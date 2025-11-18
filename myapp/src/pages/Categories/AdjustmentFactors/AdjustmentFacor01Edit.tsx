import { useEffect, useState } from "react"; // 1. Thêm React, useEffect, useState
import PATHS from "../../../hooks/path";
import LayoutInput from "../../../layout/layout_input";
import { useApi } from "../../../hooks/useFetchData"; // 2. Thêm useApi

// 3. Cập nhật props
interface AdjustmentFactor01EditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

// 4. Interface cho dữ liệu
interface AdjustmentFactor {
  id: string;
  code: string;
  name: string;
}

export default function AdjustmentFactor01Edit({ id, onClose, onSuccess }: AdjustmentFactor01EditProps) {
  // 5. Khai báo API
  const basePath = `api/adjustment/adjustmentfactor`;
  const { fetchById, putData } =
    useApi<AdjustmentFactor>(basePath);

  // 6. State
  const [currentData, setCurrentData] = useState<AdjustmentFactor | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
  });

  // 7. Load data by ID
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id);
      if (res) setCurrentData(res as AdjustmentFactor);
    };
    loadData();
  }, [id, fetchById]);

  // 8. Sync data to form state
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

    // Validation
    if (!code) return alert("⚠️ Vui lòng nhập Mã hệ số điều chỉnh!");
    if (!name) return alert("⚠️ Vui lòng nhập Tên hệ số điều chỉnh!");

    const payload = {
      id,
      code,
      name,
    };

    console.log("📤 PUT payload:", payload);

    // Gửi dữ liệu
    await putData(payload, () => {
      alert("✅ Cập nhật hệ số thành công!");
      onSuccess?.();
      onClose?.();
    });
  };

  // Fields (giữ nguyên)
  const fields = [
    { label: "Mã hệ số điều chỉnh", type: "text" as const, placeholder: "Nhập mã hệ số điều chỉnh" },
    { label: "Tên hệ số điều chỉnh", type: "text" as const, placeholder: "Nhập tên hệ số điều chỉnh" },
  ];

  return (
    // 10. Bọc bằng Fragment
      <LayoutInput
        title01="Danh mục / Hệ số điều chỉnh"
        title="Chỉnh sửa Hệ số điều chỉnh" // Sửa title
        fields={fields}
        onSubmit={handleSubmit}
        onClose={onClose}
        closePath={PATHS.ADJUSTMENT_FACTORS_01.LIST}
        // 11. Thêm initialData và shouldSync
        initialData={{
          "Mã hệ số điều chỉnh": formData.code,
          "Tên hệ số điều chỉnh": formData.name,
        }}
        shouldSyncInitialData={true}
      />
      
  );
}