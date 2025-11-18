import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import PATHS from "../../../hooks/path";
import { useApi } from "../../../hooks/useFetchData";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable";

// 1. Định nghĩa Props (giống MaterialsInput)
interface ProductsInputProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

// 2. Interface cho các tùy chọn dropdown
interface DropdownOption {
  value: string;
  label: string;
}

// 3. (Giả định) Interfaces cho dữ liệu trả về từ API dropdown
// (API api/process/processgroup trả về { id, code })
interface ProcessGroup {
  id: string;
  code: string;
}
// (Các API còn lại giả định trả về { id, value })
interface ProductProperty {
  id: string;
  value: string;
}

const ProductsInput: React.FC<ProductsInputProps> = ({ onClose, onSuccess }) => {
  // 4. ====== API setup ======
  const productPath = "/api/product/product";
  const processGroupPath = "/api/process/processgroup";
  const hardnessPath = "/api/product/hardness";
  const stoneClampRatioPath = "/api/product/stoneclampratio";
  const insertItemPath = "/api/product/insertitem";

  // API POST
  const { postData, loading: saving, error: saveError } = useApi(productPath);

  // API GET (4 dropdowns)
  const { fetchData: fetchProcessGroups, data: processGroups, loading: loadingProcessGroup, error: errorProcessGroup } =
    useApi<ProcessGroup>(processGroupPath);
  const { fetchData: fetchHardness, data: hardness, loading: loadingHardness, error: errorHardness } =
    useApi<ProductProperty>(hardnessPath);
  const { fetchData: fetchStoneClampRatios, data: stoneClampRatios, loading: loadingStoneClamp, error: errorStoneClamp } =
    useApi<ProductProperty>(stoneClampRatioPath);
  const { fetchData: fetchInsertItems, data: insertItems, loading: loadingInsertItem, error: errorInsertItem } =
    useApi<ProductProperty>(insertItemPath);

  // 5. ====== State ======
  // State cho 4 dropdowns
  const [selectedProcessGroup, setSelectedProcessGroup] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedHardness, setSelectedHardness] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedStoneClamp, setSelectedStoneClamp] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedInsertItem, setSelectedInsertItem] = useState<string>("");
  // (State cho "Mã sản phẩm" và "Tên sản phẩm" được quản lý nội bộ bởi LayoutInput)

  // 6. ====== Load dropdowns ======
  const [isInitialLoading, setIsInitialLoading] = useState(true);

useEffect(() => {
    // 1. Định nghĩa một hàm async bên trong
    const fetchAllData = async () => {
      setIsInitialLoading(true); // Bắt đầu loading

      try {
        // 2. Gọi Promise.allSettled với MẢNG các hàm fetch
        const results = await Promise.allSettled([
          fetchProcessGroups(),
          fetchHardness(),
          fetchStoneClampRatios(),
          fetchInsertItems(),
        ]);

        // 3. (Tùy chọn) Kiểm tra kết quả
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            // Log ra API nào bị lỗi
            console.error(`API call ${index} thất bại:`, result.reason);
          }
        });

      } catch (error) {
        // 4. Bắt các lỗi cú pháp hoặc lỗi không mong đợi
        console.error('Lỗi không mong đợi khi fetch dữ liệu:', error);
      } finally {
        // 5. Tắt loading sau khi TẤT CẢ đã hoàn thành
        setIsInitialLoading(false);
      }
    };

    // 6. Gọi hàm async
    fetchAllData();

    // 7. Mảng dependencies giữ nguyên
  }, [fetchProcessGroups, fetchHardness, fetchStoneClampRatios, fetchInsertItems]);
  const processGroupOptions: DropdownOption[] =
    processGroups?.map((g) => ({ value: g.id, label: g.code })) || [];
  const hardnessOptions: DropdownOption[] =
    hardness?.map((h) => ({ value: h.id, label: h.value })) || [];
  const stoneClampOptions: DropdownOption[] =
    stoneClampRatios?.map((s) => ({ value: s.id, label: s.value })) || [];
  const insertItemOptions: DropdownOption[] =
    insertItems?.map((i) => ({ value: i.id, label: i.value })) || [];

  // 7. ====== Handle submit ======
  const handleSubmit = async (data: Record<string, string>) => {
    // Lấy giá trị từ các trường text
    const code = data["Mã sản phẩm"]?.trim();
    const name = data["Tên sản phẩm"]?.trim();

    // Validation
    if (!selectedProcessGroup) return alert("⚠️ Vui lòng chọn Nhóm công đoạn sản xuất!");
    if (!code) return alert("⚠️ Vui lòng nhập Mã sản phẩm!");
    if (!name) return alert("⚠️ Vui lòng nhập Tên sản phẩm!");

    // Tạo payload
    const payload = {
      code,
      name,
      processGroupId: selectedProcessGroup,
    };

    console.log("📤 POST payload:", payload);

    // Gửi dữ liệu
    await postData(payload, () => {
      alert("✅ Tạo sản phẩm thành công!");
      onSuccess?.();
      onClose?.();
    });
  };

  // 8. ====== Fields (Dùng custom placeholders cho dropdowns) ======
  const fields = [
    { type: "custom1" as const }, // Placeholder cho Nhóm CĐSX
    { label: "Mã sản phẩm", type: "text" as const, placeholder: "Nhập tên mã sản phẩm" },
    { label: "Tên sản phẩm", type: "text" as const, placeholder: "Nhập tên sản phẩm" },
  ];

  // 9. Tính toán trạng thái loading/error tổng
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isLoading = loadingProcessGroup || loadingHardness || loadingStoneClamp || loadingInsertItem || saving;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const anyError = errorProcessGroup || errorHardness || errorStoneClamp || errorInsertItem || saveError;

  return (
    // Bọc bằng Fragment
      <LayoutInput
        title01="Danh mục / Sản phẩm"
        title="Tạo mới Sản phẩm"
        fields={fields}
        onSubmit={handleSubmit}
        closePath={PATHS.PRODUCTS.LIST}
        onClose={onClose}
        initialData={{
          // Để trống initialData cho các trường text
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