import React, { useEffect, useState, useMemo } from "react";
import Layout from "../../layout/layout_filter";
import AdvancedTable from "../../components/bodytable";
import EyeToggle from "../../components/eye";
import Materials_Ingredient_Input from "./Materials_Ingredient_Input";
import Materials_Ingredient_Grouped from "../../layout/test";
import { useApi } from "../../hooks/useFetchData";
import { ChevronsUpDown } from "lucide-react";
import PencilButton from "../../components/PencilButtons";
// SỬA: Import Materials_Ingredient_Edit (đã có)
import Materials_Ingredient_Edit from "./Materials_Ingredient_Edit";

// ====== BẮT ĐẦU THAY ĐỔI (1/5): Cập nhật Interface ======
// 1. Định nghĩa Interface
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
 startDate: string;
 endDate: string;
}
// ====== KẾT THÚC THAY ĐỔI (1/5) ======

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

// ====== BẮT ĐẦU THAY ĐỔI (2/5): Thêm hàm định dạng ngày ======
/**
* Định dạng chuỗi ISO Date (hoặc Date) thành "dd/MM/yyyy"
*/
const formatDate = (dateStr: string | Date | undefined | null): string => {
 if (!dateStr) return "N/A";
 try {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('vi-VN', {
   day: '2-digit',
   month: '2-digit',
   year: 'numeric'
  }).format(date);
 } catch (e) {
  console.error("Lỗi định dạng ngày:", dateStr, e);
  return "Lỗi";
 }
};
// ====== KẾT THÚC THAY ĐỔI (2/5) ======

// Ánh xạ index cột sang tên API
// ====== BẮT ĐẦU THAY ĐỔI (3/5): Sửa lại COLUMN_API_MAP cho đúng
const COLUMN_API_MAP = [
 "stt",     // 0 (không sắp xếp)
 "processName", // 1
 "code",     // 2
 "startDate",   // 3 (Sắp xếp theo ngày bắt đầu)
 "totalPrice",  // 4
 "xem",     // 5 (không sắp xếp)
 "sua",     // 6 (không sắp xếp)
];
// ====== KẾT THÚC THAY ĐỔI (3/5) ======

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
 // SỬA: Thêm hàm refresh
 const { data, totalCount, fetchData, loading, error } =
  useApi<MaterialUnitPrice>(apiPath);

 // 4. Hàm refresh (SỬA: Bọc fetchData trong async để có thể await)
 const handleRefresh = async () => {
   await fetchData();
 };

 // 5. Cập nhật Columns
 // ====== BẮT ĐẦU THAY ĐỔI (4/5): Thêm sort cho cột Thời gian ======
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
  // Thêm div sort cho "Thời gian"
  <div className="flex items-center gap-1" key="time">
   <span>Thời gian</span>
   <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
  </div>,
  <div className="flex items-center gap-1" key="total">
   <span>Tổng tiền</span>
   <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
  </div>,
  "Xem",
  "Sửa",
 ];
 // ====== KẾT THÚC THAY ĐỔI (4/5) ======

 const columnWidths = [6, 18, 41.5, 17.3, 9.7, 3.5, 4];

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
     // ====== BẮT ĐẦU THAY ĐỔI (5/5): Thêm ngày tháng ======
     `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`,
     // ====== KẾT THÚC THAY ĐỔI (5/5) ======
     row.totalPrice?.toLocaleString() || "0",
     <EyeToggle
      key={`${row.id}-eye`} // Thêm key
      // Giả định component "test" (Materials_Ingredient_Grouped)
      // có thể xử lý ID từ slideunitprice
      detailComponent={<Materials_Ingredient_Grouped id={row.id} />}
     />,
     <PencilButton
      key={row.id} // THÊM KEY
      id={row.id}
      // SỬA: Truyền handleRefresh vào onSuccess của form Edit
      editElement={<Materials_Ingredient_Edit id={row.id} onSuccess={handleRefresh} />}
     />,
    ];
   }) || []
  );
 }, [data, pageIndex, pageSize]); 
 const isLoading = loading;
 const anyError = error;

 return (
  <Layout>
   <div className="p-6 relative min-h-[500px]"> {/* THÊM relative min-h */}
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
      // SỬA: Truyền handleRefresh vào form Create
      createElement={<Materials_Ingredient_Input onSuccess={handleRefresh} />}
      basePath={basePath} // basePath gốc (để Xóa)
      // SỬA: Truyền handleRefresh vào hành động Delete
      onDeleted={handleRefresh}
      columnLefts={['undefined','undefined','undefined','undefined','undefined', 'undefined']}
      
      // --- TRUYỀN PROPS XUỐNG BẢNG ---
      totalItems={totalCount}
      itemsPerPage={pageSize}
      currentPage={pageIndex}
      onPageChange={setPageIndex}
      
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      
      sortConfig={sortConfig}
      onSortChange={setSortConfig}
     />
    )}
    
    {/* SỬA: Hiển thị loading overlay như Unit.tsx */}
    {isLoading && (
       <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-500000000000000000 rounded-lg backdrop-blur-[2px]">
         <span className="text-blue-600 font-medium">Đang tải dữ liệu...</span>
       </div>
    )}
   </div>
  </Layout>
 );
};

export default Materials_Ingredient;