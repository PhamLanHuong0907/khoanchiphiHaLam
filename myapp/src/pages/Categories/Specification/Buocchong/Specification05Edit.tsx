import { useEffect, useState } from "react";
import PATHS from "../../../../hooks/path";
import LayoutInput from "../../../../layout/layout_input";
import { useApi } from "../../../../hooks/useFetchData";

interface Specification05EditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Async
}

interface SupportStep {
  id: string;
  value: string;
}

export default function Specification05Edit({ id, onClose, onSuccess }: Specification05EditProps) {
  const basePath = `api/product/supportstep`; 
  const { fetchById, putData, loading: loadingData, error: dataError } = useApi<SupportStep>(basePath);

  const [currentData, setCurrentData] = useState<SupportStep | null>(null);
  const [formData, setFormData] = useState({
    value: "",
  });

  // Load data by ID
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id);
      if (res) setCurrentData(res as SupportStep);
    };
    loadData();
  }, [id, fetchById]);

  // Sync data to form state
  useEffect(() => {
    if (currentData) {
      setFormData({
        value: currentData.value,
      });
    }
  }, [currentData]);

  const handleSubmit = async (data: Record<string, string>) => {
    if (!id) return alert("❌ Thiếu ID để cập nhật!");

    const value = data["Bước chống"]?.trim();

    if (!value) return alert("⚠️ Vui lòng nhập Bước chống!");

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
        alert("✅ Cập nhật Bước chống thành công!");
        onClose?.();
      }, 300);
    });
  };

  const fields = [
    { label: "Bước chống", type: "text" as const, placeholder: "Nhập thông số bước chống" },
  ];

  return (
    <LayoutInput
      title01="Danh mục / Thông số / Bước chống"
      title="Chỉnh sửa Bước chống"
      fields={fields}
      onSubmit={handleSubmit}
      closePath={PATHS.SPECIFICATION_05.LIST}
      onClose={onClose}
      initialData={{
        "Bước chống": formData.value,
      }}
      shouldSyncInitialData={true}
    >
      {/* Trạng thái loading/error */}
      {loadingData && <p className="text-blue-500 mt-3">Đang xử lý dữ liệu...</p>}
      {dataError && <p className="text-red-500 mt-3">Lỗi: {dataError.toString()}</p>}
    </LayoutInput>
  );
}