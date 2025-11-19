import React, { useEffect, useState } from "react"; 
import PATHS from "../../../../hooks/path";
import LayoutInput from "../../../../layout/layout_input";
import { useApi } from "../../../../hooks/useFetchData"; 

interface Specification01EditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; 
}

interface Passport {
  id: string;
  name: string;
  sd: string; // Server trả về string (ví dụ "9.8")
  sc: number; // Server trả về number (ví dụ 9.8)
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

  // --- 1. HÀM CHẶN NHẬP DẤU CHẤM (.) ---
  const blockDotInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '.') {
      e.preventDefault();
    }
  };

  // Load data by ID
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id);
      if (res) setCurrentData(res as Passport);
    };
    loadData();
  }, [id, fetchById]);

  // --- 2. XỬ LÝ HIỂN THỊ: CHUYỂN '.' THÀNH ',' ---
  useEffect(() => {
    if (currentData) {
      setFormData({
        name: currentData.name,
        // Kiểm tra nếu có giá trị thì thay thế '.' bằng ','
        sd: currentData.sd ? String(currentData.sd).replace('.', ',') : "", 
        sc: currentData.sc ? String(currentData.sc).replace('.', ',') : "", 
      });
    }
  }, [currentData]);

  const handleSubmit = async (data: Record<string, string>) => {
    if (!id) return alert("❌ Thiếu ID để cập nhật!");

    const name = data["Hộ chiếu"]?.trim();
    const rawSd = data["Sđ"]?.trim();
    const rawSc = data["Sc"]?.trim();

    if (!name) return alert("⚠️ Vui lòng nhập Hộ chiếu!");
    if (!rawSd) return alert("⚠️ Vui lòng nhập Sđ!");
    if (!rawSc) return alert("⚠️ Vui lòng nhập Sc!");
    
    // --- 3. XỬ LÝ TRƯỚC KHI PUT: CHUYỂN ',' THÀNH '.' ---
    const formattedSd = rawSd.replace(/,/g, '.'); // "9,8" -> "9.8"
    const formattedSc = rawSc.replace(/,/g, '.'); // "9,8" -> "9.8"

    // Validation số
    if (isNaN(Number(formattedSd))) return alert("⚠️ Sđ phải là số hợp lệ (VD: 9,8)!");
    if (isNaN(Number(formattedSc))) return alert("⚠️ Sc phải là số hợp lệ (VD: 9,8)!");

    const payload = { 
        id, 
        name, 
        // sd: Theo interface là string, nên giữ dạng "9.8"
        sd: formattedSd, 
        // sc: Theo interface là number, nên parse sang số thực
        sc: parseFloat(formattedSc) 
    };

    console.log("📤 PUT payload:", payload);

    // 1. ĐÓNG FORM NGAY LẬP TỨC
    try {
        // 2. CHẠY API VÀ CHỜ THÀNH CÔNG
        await Promise.all([
            putData(payload, undefined),
        ]);

        await new Promise(r => setTimeout(r, 0));
        
        // 4. HIỆN ALERT THÀNH CÔNG
        alert("✅ Cập nhật Hộ chiếu thành công!");
        
        onClose?.();
        onSuccess?.();

    } catch (e: any) {
        // 5. BẮT LỖI VÀ XỬ LÝ
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        
        let errorMessage = "Đã xảy ra lỗi không xác định.";

        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            
            if (detail.includes("đã tồn tại") || detail.includes("duplicate")) {
                errorMessage = "Dữ liệu Hộ chiếu này đã tồn tại. Vui lòng nhập giá trị khác!";
            } else if (detail.includes("network")) {
                errorMessage = "Lỗi kết nối máy chủ.";
            } else {
                errorMessage = `Lỗi: ${detail}`;
            }
        }
        
        alert(`❌ CẬP NHẬT THẤT BẠI: ${errorMessage}`);
    }
  };

  const fields = [
    { 
        label: "Hộ chiếu", 
        type: "text" as const, 
        placeholder: "Nhập hộ chiếu",
        onKeyDown: blockDotInput // Chặn dấu chấm
    },
    { 
        label: "Sđ", 
        type: "text" as const, 
        placeholder: "Nhập Sđ (VD: 9,8)", 
        enableCompare: true,
        onKeyDown: blockDotInput // Chặn dấu chấm
    },
    { 
        label: "Sc", 
        type: "text" as const, 
        placeholder: "Nhập Sc (VD: 9,8)", 
        enableCompare: true,
        onKeyDown: blockDotInput // Chặn dấu chấm
    }, 
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
      {/* Hiển thị lỗi cuối cùng */}
      {loadingData && <p className="text-blue-500 mt-3">Đang xử lý dữ liệu...</p>}
      {dataError && <p className="text-red-500 mt-3">Lỗi: {dataError.toString()}</p>}
    </LayoutInput>
  );
}