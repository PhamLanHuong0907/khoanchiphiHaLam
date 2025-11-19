import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import PATHS from "../../../hooks/path";
import { useApi } from "../../../hooks/useFetchData";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable";

interface ProductionStepInputProps {
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Sửa type
}

const ProductionStepInput: React.FC<ProductionStepInputProps> = ({
  onClose,
  onSuccess,
}) => {
  // ====== API setup ======
  const groupPath = `/api/process/processgroup`;
  const stepPath = `/api/process/productionprocess`;

  // Fetch nhóm công đoạn
  const {
    fetchData: fetchGroups,
    data: processGroups,
    loading: loadingGroups,
  } = useApi<{ id: string; name: string }>(groupPath);

  // Post công đoạn sản xuất
  const { postData, error: saveError } = useApi(stepPath, { autoFetch: false }); // Sử dụng autoFetch: false

  // ====== State ======
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [formData] = useState({
    code: "",
    name: "",
  });

  // ====== Load danh sách nhóm công đoạn ======
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // ====== Dropdown options ======
  const groupOptions =
    processGroups?.map((g) => ({
      value: g.id,
      label: g.name,
    })) || [];

  // ====== Gửi dữ liệu ======
  const handleSubmit = async (data: Record<string, string>) => {
    const code = data["Mã công đoạn sản xuất"]?.trim();
    const name = data["Tên công đoạn sản xuất"]?.trim();
    const processGroupId = selectedGroupId;

    if (!processGroupId)
      return alert("⚠️ Vui lòng chọn nhóm công đoạn sản xuất!");
    if (!code) return alert("⚠️ Vui lòng nhập mã công đoạn sản xuất!");
    if (!name) return alert("⚠️ Vui lòng nhập tên công đoạn sản xuất!");

    const payload = { code, name, processGroupId };
    
    // 1. ĐÓNG FORM NGAY LẬP TỨC
    onClose?.(); 

    try {
        // 2. CHẠY API và CHỜ THÀNH CÔNG (Không dùng callback thứ hai)
        await Promise.all([
    postData(payload, undefined),
    onSuccess?.()
]);

await new Promise(r => setTimeout(r, 0));


        // 4. HIỆN ALERT THÀNH CÔNG
        alert("✅ Tạo công đoạn sản xuất thành công!");

    } catch (e: any) {
        // 5. BẮT LỖI và xử lý chi tiết bằng tiếng Việt
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        
        let errorMessage = "Đã xảy ra lỗi không xác định.";

        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            
            if (detail.includes("Mã đã tồn tại") || detail.includes("duplicate")) {
                errorMessage = "Mã công đoạn sản xuất này đã tồn tại. Vui lòng nhập mã khác!";
            } else if (detail.includes("HTTP error") || detail.includes("network")) {
                errorMessage = "Yêu cầu đến máy chủ thất bại (Mất kết nối hoặc lỗi máy chủ).";
            } else {
                errorMessage = `Lỗi nghiệp vụ: ${detail}`;
            }
        }
        
        // 6. HIỆN ALERT THẤT BẠI CHI TIẾT
        alert(`❌ TẠO THẤT BẠI: ${errorMessage}`);
    }
  };

  // ====== Trường nhập (Mã - Tên) ======
  const fields = [
    { type: "custom" as const }, // ✅ giữ chỗ cho dropdown nhóm công đoạn
    {
      label: "Mã công đoạn sản xuất",
      type: "text" as const,
      placeholder: "Nhập mã công đoạn sản xuất",
    },
    {
      label: "Tên công đoạn sản xuất",
      type: "text" as const,
      placeholder: "Nhập tên công đoạn sản xuất",
    },
  ];

  return (
      <LayoutInput
        title01="Danh mục / Công đoạn sản xuất"
        title="Tạo mới Công đoạn sản xuất"
        fields={fields}
        onSubmit={handleSubmit}
        closePath={PATHS.PRODUCTION_STEP.LIST}
        onClose={onClose}
        initialData={{
          "Mã công đoạn sản xuất": formData.code,
          "Tên công đoạn sản xuất": formData.name,
        }}
      >
        {/* ✅ Dropdown nhóm công đoạn đặt ở cuối (sau các field text) */}
        <div className="custom" key={1}>
          <DropdownMenuSearchable
            label="Nhóm công đoạn sản xuất"
            options={groupOptions}
            value={selectedGroupId}
            onChange={(value) => setSelectedGroupId(value)}
            placeholder="Chọn nhóm công đoạn sản xuất..."
            isDisabled={loadingGroups}
          />
        </div>

        {/* Hiển thị lỗi cuối cùng */}
        {saveError && <p className="text-red-500 mt-2">❌ Lỗi: {saveError}</p>}
      </LayoutInput>

  );
};

export default ProductionStepInput;