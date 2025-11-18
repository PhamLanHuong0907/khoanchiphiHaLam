import React, { useEffect, useState } from "react"; 
import PATHS from "../../../../hooks/path";
import LayoutInput from "../../../../layout/layout_input";
import { useApi } from "../../../../hooks/useFetchData"; 

interface Specification01EditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Async
}

interface Passport {
  id: string;
  name: string;
  sd: string;
  sc: number;
}

export default function Specification01Edit({ id, onClose, onSuccess }: Specification01EditProps) {
  const basePath = `/api/product/passport`;
  const { fetchById, putData, loading: loadingData, error: dataError } = useApi<Passport>(basePath);

  const [currentData, setCurrentData] = useState<Passport | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    sd: "",
    sc: "", 
  });

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id);
      if (res) setCurrentData(res as Passport);
    };
    loadData();
  }, [id, fetchById]);

  useEffect(() => {
    if (currentData) {
      setFormData({
        name: currentData.name,
        sd: currentData.sd,
        sc: currentData.sc.toString(), 
      });
    }
  }, [currentData]);

  const handleSubmit = async (data: Record<string, string>) => {
    if (!id) return alert("❌ Thiếu ID để cập nhật!");

    const name = data["Hộ chiếu"]?.trim();
    const sd = data["Sđ"]?.trim();
    const scString = data["Sc"]?.trim();

    if (!name) return alert("⚠️ Vui lòng nhập Hộ chiếu!");
    if (!sd) return alert("⚠️ Vui lòng nhập Sđ!");
    if (!scString) return alert("⚠️ Vui lòng nhập Sc!");
    
    const sc = parseFloat(scString.replace(',', '.'));
    if (isNaN(sc)) {
      return alert("⚠️ Sc phải là một con số!");
    }

    const payload = { id, name, sd, sc };
    console.log("📤 PUT payload:", payload);

    // Gọi API
    await putData(payload, async () => {
      // 1. Chờ reload dữ liệu
      if (onSuccess) {
        await onSuccess();
      }

      // 2. Chờ 300ms UI vẽ xong
      setTimeout(() => {
        alert("✅ Cập nhật Hộ chiếu thành công!");
        onClose?.();
      }, 300);
    });
  };

  const fields = [
    { label: "Hộ chiếu", type: "text" as const, placeholder: "Nhập hộ chiếu" },
    { label: "Sđ", type: "text" as const, placeholder: "Nhập Sđ: 2<=Sđ<=3", enableCompare: true },
    { label: "Sc", type: "text" as const, placeholder: "Nhập Sc" }, 
  ];

  return (
    <LayoutInput
      title01="Danh mục / Thông số / Hộ chiếu Sđ, Sc"
      title="Chỉnh sửa Hộ chiếu, Sđ, Sc"
      fields={fields}
      onSubmit={handleSubmit}
      closePath={PATHS.SPECIFICATION_01.LIST}
      onClose={onClose}
      initialData={{
        "Hộ chiếu": formData.name,
        "Sđ": formData.sd,
        "Sc": formData.sc,
      }}
      shouldSyncInitialData={true}
    >
      {loadingData && <p className="text-blue-500 mt-3">Đang xử lý dữ liệu...</p>}
      {dataError && <p className="text-red-500 mt-3">Lỗi: {dataError.toString()}</p>}
    </LayoutInput>
  );
}