import React, { useEffect, useState, useMemo } from "react"; // Thêm useState, useMemo
import Layout from "../../layout/layout_filter";
import AdvancedTable from "../../components/bodytable";
import EyeToggle from "../../components/eye";
import Materials_Ingredient_Input from "./Materials_Ingredient_Input";
import Materials_Ingredient_Grouped from "../../layout/test";
import { useApi } from "../../hooks/useFetchData";
import { ChevronsUpDown } from "lucide-react";
import PencilButton from "../../components/PencilButtons";
import Materials_Ingredient_Edit from "./Materials_Ingredient_Edit";

// 1. Định nghĩa Interface (Giữ nguyên)
interface MaterialUnitPrice {
  id: string;
  code: string;
  processGroupId: string;
  processId: string;
  passportId: string;
  hardnessId: string;
  insertItemId: string;
  supportStepId: string;
  processName: string;
  totalPrice: number;
}

// Hook debounce (tùy chọn nhưng rất nên dùng cho search)
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

// Ánh xạ index cột sang tên API (Rất quan trọng cho Sắp xếp)
// Phải khớp với 'columns'
const COLUMN_API_MAP = [
  "stt", // 0 (không sắp xếp)
  "processName", // 1
  "code",          // 2
  "totalPrice",    // 3
  "xem", // 4 (không sắp xếp)
  "sua", // 5 (không sắp xếp)
];

const Materials_Ingredient: React.FC = () => {
  // 1. STATE QUẢN LÝ (pagination, search, sort)
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Mặc định 10
  const [sortConfig, setSortConfig] = useState<{
    key: number;
    direction: "asc" | "desc";
  } | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 300); // Trì hoãn 300ms

  // 2. Xây dựng API Path động
  const basePath = `api/pricing/materialunitprice`;

  const apiPath = useMemo(() => {
    const params = new URLSearchParams();
    params.append("pageIndex=", pageIndex.toString());
    params.append("&pageSize=", pageSize.toString());

    // Thêm search (nếu có)
    if (debouncedSearchValue) {
      params.append("search", debouncedSearchValue);
    }

    // Thêm sort (nếu có)
    if (sortConfig) {
      const apiKey = COLUMN_API_MAP[sortConfig.key];
      if (apiKey && apiKey !== "stt" && apiKey !== "xem" && apiKey !== "sua") {
        params.append("sortBy", apiKey);
        params.append("sortDir", sortConfig.direction);
      }
    }

    return `${basePath}?${params.toString()}`;
  }, [pageIndex, pageSize, debouncedSearchValue, sortConfig]);

  // 3. Gọi API
  // Hook useApi sẽ tự động fetch lại khi 'apiPath' thay đổi
  const { data, totalCount, fetchData, loading, error } =
    useApi<MaterialUnitPrice>(apiPath);

  // 4. Hàm refresh
  const refresh = () => fetchData();

  // 5. Cập nhật Columns (Giữ nguyên)
  const columns = [
    "STT",
    <div className="flex items-center gap-1" key="processName">
      <span>Công đoạn sản xuất</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    <div className="flex items-center gap-1" key="name">
      <span>Mã định mức vật liệu</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    <div className="flex items-center gap-1" key="total">
      <span>Tổng tiền</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    "Xem",
    "Sửa",
  ];

  const columnWidths = [6.3, 18.6, 57.5, 10.2, 3, 4];

  // 6. Map dữ liệu từ API (Bọc trong useMemo)
  const tableData = useMemo(() => {
    return (
      data?.map((row, index) => {
        // Tính STT chính xác
        const sequentialIndex = (pageIndex - 1) * pageSize + index + 1;
        return [
          sequentialIndex,
          row.processName,
          row.code || "",
          row.totalPrice?.toLocaleString() || "0",
          <EyeToggle
        key={`${row.id}-eye`} // Thêm key
        // Giả định component "test" (Materials_Ingredient_Grouped)
        // có thể xử lý ID từ slideunitprice
        detailComponent={<Materials_Ingredient_Grouped id={row.id} />}
      />,
          <PencilButton
            id={row.id}
            // 👈 TỐI ƯU LAZY LOAD (Giả sử PencilButton hỗ trợ)
            editElement={<Materials_Ingredient_Edit onSuccess={refresh} />}
          />,
        ];
      }) || []
    );
  }, [data, pageIndex, pageSize]); // Chỉ chạy lại khi data hoặc trang thay đổi

  // 7. Biến loading/error
  // 'loading' từ hook useApi đã bao gồm cả lần tải đầu và các lần chuyển trang
  const isLoading = loading;
  const anyError = error;

  return (
    <Layout>
      <div className="p-6">
        {/* ... (style của bạn giữ nguyên) ... */}
         <style>{`
          th > div {
            display: inline-flex;
            align-items: center;
            gap: 3px;
          }
          th > div span:last-child {
            font-size: 5px;
            color: gray;
          }
        `}</style>
        
        {/* 7. Xử lý UI khi loading hoặc có lỗi */}
        {anyError ? ( // Ưu tiên hiển thị lỗi
          <div className="text-center text-red-500 py-10">
            Lỗi: {anyError.toString()}
          </div>
        ) : (
          <AdvancedTable
            title01="Đơn giá và định mức / Đơn giá và định mức vật liệu"
            title="Đơn giá và định mức vật liệu"
            columns={columns}
            columnWidths={columnWidths}
            data={tableData} // Dữ liệu của trang này (chỉ 10 dòng)
            createElement={<Materials_Ingredient_Input onSuccess={refresh} />}
            basePath={basePath} // basePath gốc (để Xóa)
            onDeleted={refresh}
            columnLefts={['undefined','undefined','undefined','undefined','undefined']}
            
            // --- TRUYỀN PROPS XUỐNG BẢNG ---
            totalItems={totalCount}
            itemsPerPage={pageSize}
            currentPage={pageIndex}
            onPageChange={setPageIndex} // 👈 Giao quyền
            
            searchValue={searchValue}
            onSearchChange={setSearchValue} // 👈 Giao quyền
            
            sortConfig={sortConfig}
            onSortChange={setSortConfig} // 👈 Giao quyền
          />
        )}
        
        {/* Hiển thị loading riêng, không làm ẩn bảng */}
        {isLoading && (
            <div style={{
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                background: 'rgba(255, 255, 255, 0.7)',
                padding: '10px 20px',
                borderRadius: '8px',
                zIndex: 100
            }}>
            </div>
        )}
      </div>
    </Layout>
  );
};

export default Materials_Ingredient;