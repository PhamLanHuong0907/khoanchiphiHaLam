import React, { useEffect, useState } from "react";
import PATHS from "../../../../hooks/path";
import LayoutInput from "../../../../layout/layout_input";
import { useApi } from "../../../../hooks/useFetchData";

interface Specification02EditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Async
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

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id);
      if (res) setCurrentData(res as Hardness);
    };
    loadData();
  }, [id, fetchById]);

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

    console.log("📤 PUT payload:", payload);

    // Gửi dữ liệu
    await putData(payload, async () => {
      // 1. Chờ reload dữ liệu
      if (onSuccess) {
        await onSuccess();
      }

      // 2. Chờ 300ms UI vẽ xong
      setTimeout(() => {
        alert("✅ Cập nhật Độ kiên cố thành công!");
        onClose?.();
      }, 300);
    });
  };

  const fields = [
    { 
      label: "Độ kiên cố than, đá (f)", 
      type: "text" as const, 
      placeholder: "Nhập độ kiên cố than, đá (f): 2<=f<=3", 
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
      {loadingData && <p className="text-blue-500 mt-3">Đang xử lý dữ liệu...</p>}
      {dataError && <p className="text-red-500 mt-3">Lỗi: {dataError.toString()}</p>}
    </LayoutInput>
  );
}