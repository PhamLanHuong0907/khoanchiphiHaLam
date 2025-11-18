import  { useEffect, useState } from "react"; 
import PATHS from "../../../../hooks/path";
import LayoutInput from "../../../../layout/layout_input";
import { useApi } from "../../../../hooks/useFetchData";

interface Specification04EditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Async
}

interface InsertItem {
  id: string;
  value: string;
}

export default function Specification04Edit({ id, onClose, onSuccess }: Specification04EditProps) {
  const basePath = `/api/product/insertitem`;
  const { fetchById, putData, loading: loadingData, error: dataError } = useApi<InsertItem>(basePath);

  const [currentData, setCurrentData] = useState<InsertItem | null>(null);
  const [formData, setFormData] = useState({
    value: "",
  });

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id);
      if (res) setCurrentData(res as InsertItem);
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

    const value = data["Chèn"]?.trim();

    if (!value) return alert("⚠️ Vui lòng nhập Chèn!");

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
        alert("✅ Cập nhật Chèn thành công!");
        onClose?.();
      }, 300);
    });
  };

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
      initialData={{
        "Chèn": formData.value,
      }}
      shouldSyncInitialData={true}
    >
      {loadingData && <p className="text-blue-500 mt-3">Đang xử lý dữ liệu...</p>}
      {dataError && <p className="text-red-500 mt-3">Lỗi: {dataError.toString()}</p>}
    </LayoutInput>
  );
}