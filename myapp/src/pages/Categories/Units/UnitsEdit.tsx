import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import PATHS from "../../../hooks/path";
import { useApi } from "../../../hooks/useFetchData";

interface UnitsEditProps {
  id: string;
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Cho phép async để await reload
}

interface UnitData {
  id: string;
  name: string;
}

const UnitsEdit: React.FC<UnitsEditProps> = ({ id, onClose, onSuccess }) => {
  // ====== Base API ======
  const basePath = `/api/catalog/unitofmeasure`;

  // ====== Hooks API ======
  const { fetchById, putData, loading, error } = useApi<UnitData>(basePath);

  // ====== State ======
  const [unit, setUnit] = useState<UnitData | null>(null);

  // ====== Fetch dữ liệu theo ID ======
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const result = await fetchById(id);
      if (result) setUnit(result);
    };
    loadData();
  }, [id, fetchById]);

  // ====== Submit cập nhật ======
  const handleSubmit = async (data: Record<string, string>) => {
    const name = data["Đơn vị tính"]?.trim();

    if (!id) return alert("❌ Thiếu ID để cập nhật!");
    if (!name) return alert("⚠️ Vui lòng nhập đơn vị tính!");

    const payload = { id, name };
    
    // Gọi putData và chờ xử lý callback
    await putData(
      payload,
      async () => {
        // 1. Chờ reload dữ liệu bảng cha
        if (onSuccess) {
            await onSuccess();
        }

        // 2. Dùng setTimeout 200ms để bảng kịp vẽ lại dữ liệu mới trước khi alert hiện lên
        setTimeout(() => {
            alert("✅ Cập nhật đơn vị tính thành công!");
            onClose?.(); // Đóng form sau khi alert xong
        }, 300);
      }
    );
  };

  // ====== Fields ======
  const fields = [
    {
      label: "Đơn vị tính",
      type: "text" as const,
      placeholder: "Nhập tên đơn vị tính, ví dụ cm",
    },
  ];

  return (
    <LayoutInput
      title01="Danh mục / Đơn vị tính"
      title="Chỉnh sửa Đơn vị tính"
      fields={fields}
      onSubmit={handleSubmit}
      closePath={PATHS.UNIT.LIST}
      onClose={onClose}
      initialData={{
        "Đơn vị tính": unit?.name || "",
      }}
      shouldSyncInitialData={true}
    >
      {/* Trạng thái tải và lỗi */}
      {loading && <p className="text-blue-500 mt-3">Đang lưu dữ liệu...</p>}
      {error && <p className="text-red-500 mt-3">Lỗi: {error}</p>}
    </LayoutInput>
  );
};

export default UnitsEdit;