import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import PATHS from "../../../hooks/path";
import { useApi } from "../../../hooks/useFetchData";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable";

// 1. Định nghĩa Props
interface ProductsInputProps {
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Sửa type
}

// 2. Interfaces cho dữ liệu trả về từ API dropdown
interface DropdownOption { value: string; label: string; }
interface ProcessGroup { id: string; code: string; }

const ProductsInput: React.FC<ProductsInputProps> = ({ onClose, onSuccess }) => {
  // 3. ====== API setup ======
  const productPath = "/api/product/product";
  const processGroupPath = "/api/process/processgroup";

  // API POST (autoFetch: false)
  const { postData, error: saveError } = useApi(productPath, { autoFetch: false });

  // API GET Dropdowns
  const { fetchData: fetchProcessGroups, data: processGroups, loading: loadingProcessGroup } =
    useApi<ProcessGroup>(processGroupPath);
  
  // 4. ====== State ======
  const [selectedProcessGroup, setSelectedProcessGroup] = useState<string>("");
  const [formData] = useState({ code: "", name: "" });

  // 5. Load dropdowns
  useEffect(() => {
    fetchProcessGroups();
  }, [fetchProcessGroups]);

  const processGroupOptions: DropdownOption[] =
    processGroups?.map((g) => ({ value: g.id, label: g.code })) || [];

  // 6. ====== Handle submit (LOGIC SỬA ĐÚNG) ======
  const handleSubmit = async (data: Record<string, string>) => {
    const code = data["Mã sản phẩm"]?.trim();
    const name = data["Tên sản phẩm"]?.trim();
    const processGroupId = selectedProcessGroup;

    if (!selectedProcessGroup) return alert("⚠️ Vui lòng chọn Nhóm công đoạn sản xuất!");
    if (!code) return alert("⚠️ Vui lòng nhập Mã sản phẩm!");
    if (!name) return alert("⚠️ Vui lòng nhập Tên sản phẩm!");

    const payload = { code, name, processGroupId };

    // 1. ĐÓNG FORM NGAY LẬP TỨC

    try {
        // 2. CHẠY API VÀ CHỜ THÀNH CÔNG (Gọi trực tiếp, không dùng callback thứ hai)
        await Promise.all([
    postData(payload, undefined),
]);

await new Promise(r => setTimeout(r, 0));

        // 4. HIỆN ALERT THÀNH CÔNG
        alert("✅ Tạo sản phẩm thành công!");

    } catch (e: any) {
        // 5. BẮT LỖI VÀ XỬ LÝ CHI TIẾT
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        
        let errorMessage = "Đã xảy ra lỗi không xác định.";
        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            if (detail.includes("Mã đã tồn tại") || detail.includes("duplicate")) {
                errorMessage = "Mã sản phẩm này đã tồn tại trong hệ thống. Vui lòng nhập mã khác!";
            } else if (detail.includes("HTTP error") || detail.includes("network")) {
                errorMessage = "Yêu cầu đến máy chủ thất bại (Mất kết nối hoặc lỗi máy chủ).";
            } else {
                errorMessage = `Lỗi nghiệp vụ: ${detail}`;
            }
        }
        
        // 6. HIỂN THỊ ALERT THẤT BẠI CHI TIẾT
        alert(`❌ TẠO THẤT BẠI: ${errorMessage}`);
    }
    onClose?.();
    onSuccess?.()
  };

  const fields = [
    { type: "custom1" as const }, // Placeholder cho Nhóm CĐSX
    { label: "Mã sản phẩm", type: "text" as const, placeholder: "Nhập tên mã sản phẩm" },
    { label: "Tên sản phẩm", type: "text" as const, placeholder: "Nhập tên sản phẩm" },
  ];

  return (
      <LayoutInput
        title01="Danh mục / Sản phẩm"
        title="Tạo mới Sản phẩm"
        fields={fields}
        onSubmit={handleSubmit}
        closePath={PATHS.PRODUCTS.LIST}
        onClose={onClose}
        initialData={{
          "Mã sản phẩm": "",
          "Tên sản phẩm": "",
        }}
      >
        {/* Render các dropdown tùy chỉnh */}
        <div className="custom1" key={1}>
          <DropdownMenuSearchable
            label="Nhóm công đoạn sản xuất"
            options={processGroupOptions}
            value={selectedProcessGroup}
            onChange={setSelectedProcessGroup}
            placeholder="Chọn nhóm CĐSX"
            isDisabled={loadingProcessGroup}
          />
        </div>
      </LayoutInput>
  );
};
export default ProductsInput;