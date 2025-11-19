import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import PATHS from "../../../hooks/path";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable";
import { useApi } from "../../../hooks/useFetchData";

// 1. Định nghĩa Props
interface ProductsEditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Sửa type
}

// 2. Interface cho dữ liệu Product (GET {id})
interface Product {
  id: string;
  code: string;
  name: string;
  processGroupId: string;
}

// Interfaces cho dữ liệu trả về từ API dropdown
interface DropdownOption { value: string; label: string; }
interface ProcessGroup { id: string; code: string; }


const ProductsEdit: React.FC<ProductsEditProps> = ({ id, onClose, onSuccess }) => {
  // 3. ====== API setup ======
  const productPath = "/api/product/product";
  const processGroupPath = "/api/process/processgroup";

  // API GET/PUT
  const { fetchById, putData, loading: loadingMaterial, error: errorMaterial } =
    useApi<Product>(productPath);

  // API GET Dropdowns
  const { fetchData: fetchProcessGroups, data: processGroups, loading: loadingProcessGroup } =
    useApi<ProcessGroup>(processGroupPath);

  // 4. ====== State ======
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [selectedProcessGroup, setSelectedProcessGroup] = useState<string>("");
  const [formData, setFormData] = useState({ code: "", name: "" });

  // 5. ====== Load material by ID ======
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id);
      if (res) setCurrentProduct(res as Product);
    };
    loadData();
  }, [id, fetchById]);

  // 6. ====== Load dropdowns ======
  useEffect(() => {
    fetchProcessGroups();
  }, [fetchProcessGroups]);

  // 7. ====== Sync data to form (QUAN TRỌNG) ======
  useEffect(() => {
    if (currentProduct) {
      setFormData({
        code: currentProduct.code,
        name: currentProduct.name,
      });
      // ✅ Sync dropdown ID
      setSelectedProcessGroup(currentProduct.processGroupId || "");
    }
  }, [currentProduct]);

  // 8. Map data API sang định dạng DropdownOption
  const processGroupOptions: DropdownOption[] =
    processGroups?.map((g) => ({ value: g.id, label: g.code })) || [];


  // 9. ====== PUT submit (LOGIC SỬA ĐÚNG) ======
  const handleSubmit = async (data: Record<string, string>) => {
    if (!id) return alert("❌ Thiếu ID để cập nhật!");

    const code = data["Mã sản phẩm"]?.trim();
    const name = data["Tên sản phẩm"]?.trim();
    const processGroupId = selectedProcessGroup;

    // Validation
    if (!selectedProcessGroup) return alert("⚠️ Vui lòng chọn Nhóm công đoạn sản xuất!");
    if (!code) return alert("⚠️ Vui lòng nhập Mã sản phẩm!");
    if (!name) return alert("⚠️ Vui lòng nhập Tên sản phẩm!");

    const payload = { id, code, name, processGroupId };
    
    // 1. ĐÓNG FORM NGAY LẬP TỨC
  

    try {
        // 2. CHẠY API VÀ CHỜ THÀNH CÔNG (Gọi trực tiếp putData)
        await Promise.all([
    putData(payload, undefined),

]);

await new Promise(r => setTimeout(r, 0));
        // 4. HIỆN ALERT THÀNH CÔNG
        alert("✅ Cập nhật sản phẩm thành công!");

    } catch (e: any) {
        // 5. BẮT LỖI VÀ XỬ LÝ
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
        
        // 6. HIỆN ALERT THẤT BẠI CHI TIẾT
        alert(`❌ CẬP NHẬT THẤT BẠI: ${errorMessage}`);
    }
    onClose?.();
    onSuccess?.()
  };

  // 10. ====== Fields (Dùng custom placeholders) ======
  const fields = [
    { type: "custom1" as const }, // Placeholder cho Nhóm CĐSX
    { label: "Mã sản phẩm", type: "text" as const, placeholder: "Nhập mã sản phẩm, ví dụ: SP01" },
    { label: "Tên sản phẩm", type: "text" as const, placeholder: "Nhập tên sản phẩm, ví dụ: Lò chợ 11-1.26 lò chống..." },
  ];

  return (
      <LayoutInput
        title01="Danh mục / Sản phẩm"
        title="Chỉnh sửa Sản phẩm"
        fields={fields}
        onSubmit={handleSubmit}
        closePath={PATHS.PRODUCTS.LIST}
        onClose={onClose}
        initialData={{
          "Mã sản phẩm": formData.code,
          "Tên sản phẩm": formData.name,
        }}
        shouldSyncInitialData={true}
      >
        {/* Render các dropdown tùy chỉnh */}
        <div className="custom1" key={1}>
          <DropdownMenuSearchable
            label="Nhóm công đoạn sản xuất"
            options={processGroupOptions}
            value={currentProduct?.processGroupId || selectedProcessGroup} // Sử dụng currentProduct khi load lần đầu
            onChange={setSelectedProcessGroup}
            placeholder="Chọn mã nhóm công đoạn sản xuất"
            isDisabled={loadingProcessGroup}
          />
        </div>
      </LayoutInput>
  );
};

export default ProductsEdit;