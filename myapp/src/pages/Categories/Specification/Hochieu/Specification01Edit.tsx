import React, { useEffect, useState } from "react"; // 1. Thêm React, useEffect, useState
import PATHS from "../../../../hooks/path";
import LayoutInput from "../../../../layout/layout_input";
import { useApi } from "../../../../hooks/useFetchData"; // 2. Thêm useApi

// 3. Cập nhật props
interface Specification01EditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

// 4. Interface cho dữ liệu (dựa trên mẫu PUT JSON)
// Giả định API GET {id} trả về cấu trúc tương tự
interface Passport {
  id: string;
  name: string;
  sd: string;
  sc: number;
}

export default function Specification01Edit({ id, onClose, onSuccess }: Specification01EditProps) {
  // 5. Khai báo API
  const basePath = `/api/product/passport`;
  const { fetchById, putData, loading: loadingData, error: dataError }
    = useApi<Passport>(basePath);

  // 6. State
  const [currentData, setCurrentData] = useState<Passport | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    sd: "",
    sc: "", // Dùng string cho input
  });

  // 7. Load data by ID
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id);
      if (res) setCurrentData(res as Passport);
    };
    loadData();
  }, [id, fetchById]);

  // 8. Sync data to form state
  useEffect(() => {
    if (currentData) {
      setFormData({
        name: currentData.name,
        sd: currentData.sd,
        sc: currentData.sc.toString(), // Chuyển số sang string
      });
    }
  }, [currentData]);

  // 9. Cập nhật handleSubmit (logic PUT)
  const handleSubmit = async (data: Record<string, string>) => {
    if (!id) return alert("❌ Thiếu ID để cập nhật!");

    const name = data["Hộ chiếu"]?.trim();
    const sd = data["Sđ"]?.trim();
    const scString = data["Sc"]?.trim();

    // Validation
    if (!name) return alert("⚠️ Vui lòng nhập Hộ chiếu!");
    if (!sd) return alert("⚠️ Vui lòng nhập Sđ!");
    if (!scString) return alert("⚠️ Vui lòng nhập Sc!");
    
    const sc = parseFloat(scString);
    if (isNaN(sc)) {
      return alert("⚠️ Sc phải là một con số!");
    }

    // Payload
    const payload = {
      id,
      name,
      sd,
      sc,
    };

    console.log("📤 PUT payload:", payload);

    // Gửi dữ liệu
    await putData(payload, () => {
      alert("✅ Cập nhật Hộ chiếu thành công!");
      onSuccess?.();
      onClose?.();
    });
  };

  // 10. Cập nhật fields (Sc nên là type 'number')
  const fields = [
    { label: "Hộ chiếu", type: "text" as const, placeholder: "Nhập hộ chiếu" },
    { label: "Sđ", type: "text" as const, placeholder: "Nhập Sđ: 2<=Sđ<=3", enableCompare: true },
    { label: "Sc", type: "text" as const, placeholder: "Nhập Sc" }, // Sửa type
  ];

  return (
    // 11. Bọc bằng Fragment
    <>
      <LayoutInput
        title01="Danh mục / Thông số / Hộ chiếu Sđ, Sc"
        title="Chỉnh sửa Hộ chiếu, Sđ, Sc"
        fields={fields}
        onSubmit={handleSubmit}
        closePath={PATHS.SPECIFICATION_01.LIST}
        onClose={onClose}
        // 12. Thêm initialData và shouldSync
        initialData={{
          "Hộ chiếu": formData.name,
          "Sđ": formData.sd,
          "Sc": formData.sc,
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