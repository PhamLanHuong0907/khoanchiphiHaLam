import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import PATHS from "../../../hooks/path";
import { useApi } from "../../../hooks/useFetchData";

interface ProductionStepGroupEditProps {
  id: string; // ID is required for editing
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Sửa type
}

// 1. Interface for the data structure
interface ProductionStepGroupData {
  id: string;
  code: string;
  name: string;
}

const ProductionStepGroupEdit: React.FC<ProductionStepGroupEditProps> = ({
  id,
  onClose,
  onSuccess,
}) => {
  const basePath = `/api/process/processgroup`;
  // Lấy thêm 'loading' và 'error' để xử lý trạng thái
  const { fetchById, putData, loading: loadingData, error: dataError } = useApi<ProductionStepGroupData>(basePath);

  // 2. State Separation
  const [currentData, setCurrentData] = useState<ProductionStepGroupData | null>(null);
  const [formData, setFormData] = useState({ 
    code: "",
    name: "",
  });

  // 3. useEffect for Fetching Data by ID (giữ nguyên)
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const result = await fetchById(id);
      if (result) {
        setCurrentData(result as ProductionStepGroupData);
      }
    };
    loadData();
  }, [id, fetchById]);

  // 4. useEffect for Syncing Fetched Data to Form State (giữ nguyên)
  useEffect(() => {
    if (currentData) {
      setFormData({
        code: currentData.code,
        name: currentData.name,
      });
    }
  }, [currentData]);

  // 5. handleSubmit (Logic PUT)
  const handleSubmit = async (data: Record<string, string>) => {
    const code = data["Mã nhóm công đoạn sản xuất"]?.trim();
    const name = data["Tên nhóm công đoạn sản xuất"]?.trim();

    if (!code || !name) return alert("Vui lòng nhập đầy đủ thông tin!");
    if (!id) return alert("❌ Thiếu ID để cập nhật!");

    const payload = { id, code, name };
    
    // 1. ĐÓNG FORM NGAY LẬP TỨC
    onClose?.(); 

    try {
        // 2. CHẠY API và CHỜ THÀNH CÔNG
       await Promise.all([
    putData(payload, undefined),
    onSuccess?.()
]);

await new Promise(r => setTimeout(r, 0));


        // 4. HIỆN ALERT THÀNH CÔNG
        alert("✅ Cập nhật nhóm công đoạn thành công!");

    } catch (e: any) {
        // 5. BẮT LỖI và xử lý chi tiết bằng tiếng Việt
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        
        let errorMessage = "Đã xảy ra lỗi không xác định.";

        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            
            if (detail.includes("Mã đã tồn tại") || detail.includes("duplicate")) {
                errorMessage = "Mã nhóm công đoạn sản xuất này đã tồn tại. Vui lòng nhập mã khác!";
            } else if (detail.includes("HTTP error") || detail.includes("network")) {
                errorMessage = "Yêu cầu đến máy chủ thất bại (Mất kết nối hoặc lỗi máy chủ).";
            } else {
                errorMessage = `Lỗi nghiệp vụ: ${detail}`;
            }
        }
        
        // 6. HIỆN ALERT THẤT BẠI CHI TIẾT
        alert(`❌ CẬP NHẬT THẤT BẠI: ${errorMessage}`);
    }
  };

  // 6. Fields definition (remains the same)
  const fields = [
    {
      label: "Mã nhóm công đoạn sản xuất",
      type: "text" as const,
      placeholder: "Nhập mã nhóm công đoạn sản xuất",
    },
    {
      label: "Tên nhóm công đoạn sản xuất",
      type: "text" as const,
      placeholder: "Nhập tên nhóm công đoạn sản xuất",
    },
  ];

  return (
      <LayoutInput
        title01="Danh mục / Công đoạn sản xuất / Nhóm công đoạn sản xuất"
        title="Chỉnh sửa Nhóm công đoạn sản xuất"
        fields={fields}
        onSubmit={handleSubmit}
        closePath={PATHS.PRODUCTION_STEP_GROUP.LIST}
        onClose={onClose}
        // 8. Update LayoutInput props
        initialData={{ 
          "Mã nhóm công đoạn sản xuất": formData.code,
          "Tên nhóm công đoạn sản xuất": formData.name,
        }}
        shouldSyncInitialData={true}
      >
        {/* Chỉ hiển thị lỗi, không cần hiển thị loading nội bộ vì form đóng ngay */}
        {dataError && <p className="text-red-500 mt-2">❌ Lỗi: {dataError}</p>}
      </LayoutInput>
  );
};

export default ProductionStepGroupEdit;