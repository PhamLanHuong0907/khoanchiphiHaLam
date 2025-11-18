import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import PATHS from "../../../hooks/path";
import { useApi } from "../../../hooks/useFetchData";

interface UnitsEditProps {
  id: string;
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Async để await reload
}

interface UnitData {
  id: string;
  name: string;
}

const UnitsEdit: React.FC<UnitsEditProps> = ({ id, onClose, onSuccess }) => {
  const basePath = `/api/catalog/unitofmeasure`;
  
  // Hook API riêng cho modal edit (để fetch detail và put)
  const { fetchById, putData, loading, error } = useApi<UnitData>(basePath);

  const [unit, setUnit] = useState<UnitData | null>(null);

  // Fetch dữ liệu chi tiết
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const result = await fetchById(id);
      if (result) setUnit(result);
    };
    loadData();
  }, [id, fetchById]);

  const handleSubmit = async (data: Record<string, string>) => {
    const name = data["Đơn vị tính"]?.trim();

    if (!id) return alert("❌ Thiếu ID để cập nhật!");
    if (!name) return alert("⚠️ Vui lòng nhập đơn vị tính!");

    const payload = { id, name };
    
    await putData(payload, async () => {
      // 1. Chờ reload dữ liệu bảng cha
      if (onSuccess) {
          await onSuccess();
      }

      // 2. Đợi 300ms để UI update xong mới hiện Alert
      setTimeout(() => {
          alert("✅ Cập nhật đơn vị tính thành công!");
          onClose?.(); 
      }, 300);
    });
  };

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
      {loading && <p className="text-blue-500 mt-3">Đang lưu dữ liệu...</p>}
      {error && <p className="text-red-500 mt-3">Lỗi: {error}</p>}
    </LayoutInput>
  );
};

export default UnitsEdit;