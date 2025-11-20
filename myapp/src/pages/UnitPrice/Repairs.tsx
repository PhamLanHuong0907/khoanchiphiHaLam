import React from "react"; 
import Layout from "../../layout/layout_filter";
import AdvancedTable from "../../components/bodytable";
import EyeToggle from "../../components/eye";
import Repairs_Grouped from "../../layout/test1";
import RepairsInput from "./Repairs_Input";
import { useApi } from "../../hooks/useFetchData"; 
import { ChevronsUpDown } from "lucide-react"; 
import RepairsEdit from "./Repairs_Edit";
import PencilButton from "../../components/PencilButtons";

// ====== BẮT ĐẦU THAY ĐỔI (1/3): Cập nhật Interface (Giữ nguyên) ======
// 1. Định nghĩa Interface
interface SlideUnitPrice {
 id: string;
 code: string; 
 processGroupId: string;
 processGroupName: string; 
 passportId: string;
 hardnessId: string;
 totalPrice: number; 
 startDate: string; 
 endDate: string; 
}
// ====== KẾT THÚC THAY ĐỔI (1/3) ======

// ====== BẮT ĐẦU THAY ĐỔI (2/3): Thêm hàm định dạng ngày (Giữ nguyên) ======
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
// ====== KẾT THÚC THAY ĐỔI (2/3) ======

const Repairs: React.FC = () => {
 // 2. Khai báo API (SỬA ĐỔI)
 const basePath = `/api/pricing/slideunitprice?pageIndex=1&pageSize=1000`; 
 // Lấy 'refresh' trực tiếp, bỏ 'fetchData'
 // SỬA: Đổi tên refresh thành fetchData và bọc lại
 const { data, loading, error, fetchData } = useApi<SlideUnitPrice>(basePath);

 // 3. THÊM: Hàm refresh async để truyền xuống form (tương tự Units.tsx)
 const handleRefresh = async () => {
   await fetchData();
 };


 // 4. Cập nhật Columns (Giữ nguyên)
 const columns = [
  "STT",
  <div className="flex items-center gap-1" key="processGroupName">
   <span>Nhóm công đoạn sản xuất</span> 
   <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
  </div>,
  <div className="flex items-center gap-1" key="code">
   <span>Mã định mức máng trượt</span>
   <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
  </div>,
  "Thời gian",
  <div className="flex items-center gap-1" key="total">
   <span>Tổng tiền</span>
   <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
  </div>,
  "Xem", 
  "Sửa"
 ];

 // Chiều rộng từng cột (Giữ nguyên)
 const columnWidths = [6, 18.2, 41,18, 9.8, 3, 4];

 // 5. Map dữ liệu từ API (SỬA: Dùng handleRefresh)
 const tableData =
  data?.map((row, index) => [
   index + 1,
   row.processGroupName || "", 
   row.code || "", 
   // ====== BẮT ĐẦU THAY ĐỔI (3/3): Cập nhật hiển thị ngày tháng (Giữ nguyên) ======
   `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`,
   // ====== KẾT THÚC THAY ĐỔI (3/3) ======
   row.totalPrice?.toLocaleString() || "0", 
   <EyeToggle
    key={`${row.id}-eye`}
    detailComponent={<Repairs_Grouped id={row.id} />}
   />,
   <PencilButton
    key={`${row.id}-pencil`} 
    id={row.id}
    // SỬA ĐỔI: Truyền handleRefresh vào onSuccess của form Edit
    editElement={<RepairsEdit id={row.id} onSuccess={handleRefresh} />}
   />,
  ]) || [];

 // 6. Biến loading/error
 const isLoading = loading;
 const anyError = error;

 return (
  <Layout>
   <div className="p-6 relative min-h-[500px]"> {/* THÊM relative min-h */}
    {/* Thêm style (giữ nguyên) */}
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
    
    {/* 7. Xử lý UI - Áp dụng logic Units.tsx */}
    
    {/* 1. Ưu tiên hiển thị lỗi */}
    {anyError ? (
     <div className="text-center text-red-500 py-10">
      Lỗi: {anyError.toString()}
     </div>
    ) : (
     /* 2. Luôn hiển thị bảng (ngay cả khi đang tải) */
     <AdvancedTable
      title01="Đơn giá và định mức / Đơn giá và định mức máng trượt"
    title="Đơn giá và định mức máng trượt"
      columns={columns}
      columnWidths={columnWidths}
      data={tableData} 
      // SỬA: Truyền handleRefresh vào form Create
      createElement={<RepairsInput onSuccess={handleRefresh} />} 
      basePath={basePath} 
      // SỬA: Truyền handleRefresh vào hành động Delete
      onDeleted={handleRefresh} 
      columnLefts={['undefined','undefined','undefined','undefined','undefined']}
     />
    )}
    
  {/* SỬA: Hiển thị loading overlay như Unit.tsx */}
  {isLoading && (
     <div style={{
      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      borderRadius: '8px',
      backdropFilter: 'blur(2px)'
     }}>
       <span className="text-blue-600 font-medium">Đang tải dữ liệu</span>
     </div>
    )}
   </div>
  </Layout>
 );
};

export default Repairs;