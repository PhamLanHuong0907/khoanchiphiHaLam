import React from "react";
// 1. Import hook useApi (giả sử vị trí file)
import { useApi } from "../../hooks/useFetchData"; // Sửa lại: Giả sử đường dẫn đúng là useFetchData
import Layout from "../../layout/layout_filter";
import AdvancedTable from "../../components/bodytable";
import PencilButton from "../../components/PencilButtons";
import SlideRailsInput from "./SlideRailInput";
import SlideRailsEdit from "./SlideRailEdit";
import EyeToggle from "../../components/eye";
import SlideRailExample from "../../layout/SCTX_test";

// === 2. Định nghĩa Interface cho dữ liệu API ===
// ====== BẮT ĐẦU THAY ĐỔI (1/3): Cập nhật Interface ======
interface MaintainUnitPrice {
 id: string; // Thêm ID
 equipmentId: string;
 equipmentCode: string;
 totalPrice: number;
 startDate: string; // Thêm ngày bắt đầu
 endDate: string; // Thêm ngày kết thúc
 // Chúng ta không cần 'maintainUnitPriceEquipment' cho bảng này
}
// ====== KẾT THÚC THAY ĐỔI (1/3) ======


// === 3. Hàm trợ giúp định dạng số ===
const formatNumber = (num: number, digits: number = 2): string => {
  if (num === null || num === undefined) return "0";
  return num.toLocaleString("vi-VN", { maximumFractionDigits: digits });
}

// ====== BẮT ĐẦU THAY ĐỔI (2/3): Thêm hàm định dạng ngày ======
/**
 * 4. Định dạng chuỗi ISO Date (hoặc Date) thành "dd/MM/yyyy"
 */
const formatDate = (dateStr: string | Date | undefined | null): string => {
 if (!dateStr) return "N/A"; // Trả về "N/A" nếu ngày không tồn tại
 try {
  const date = new Date(dateStr);
  // 'vi-VN' đã mặc định dùng format dd/MM/yyyy
  return new Intl.DateTimeFormat('vi-VN', {
   day: '2-digit',
   month: '2-digit',
   year: 'numeric',
   timeZone: 'UTC'
  }).format(date);
 } catch (e) {
  console.error("Lỗi định dạng ngày:", dateStr, e);
  return "Lỗi";
 }
};
// ====== KẾT THÚC THAY ĐỔI (2/3) ======


const SlideRails: React.FC = () => {
 // === 4. Cập nhật cột ===
 const columns = [
  "STT",
  "Mã thiết bị",
  "Thời gian",
  "Tổng tiền", // Thêm cột mới
  "Xem",
  "Sửa",
 ];

 // === 5. Cập nhật độ rộng cột ===
 const columnWidths = [
  6, // STT
  20, // Mã thiết bị (giảm bớt)
  57,
  10, // Tổng tiền (cột mới)
  3, // Xem
  4  // Sửa
 ];

 // ✅ Navbar mini (giữ nguyên)
 const items = [
  { label: "Đào lò", path: "/SlideRails" },
  { label: "Lò chợ", path: "/MarketRails" },
 ];

 // === 6. Gọi API (SỬA ĐỔI) ===
 const basePath = "/api/pricing/maintainunitpriceequipment?pageIndex=1&pageSize=1000";
 // SỬA ĐỔI: Lấy 'apiData', 'loading', 'error', 'refresh'
 const { data: apiData, loading, error, refresh } = useApi<MaintainUnitPrice>(
  basePath
 );

 // === 7. Map dữ liệu API sang định dạng cho bảng ===
 const tableData =
  apiData?.map((row, index) => [
   index + 1, // STT là index
   row.equipmentCode, // Mã thiết bị
// ====== BẮT ĐẦU THAY ĐỔI (3/3): Cập nhật hiển thị ngày tháng ======
   `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`,
// ====== KẾT THÚC THAY ĐỔI (3/3) ======
   formatNumber(row.totalPrice), // Tổng tiền đã định dạng
   
   // Pass equipmentId cho component con
    <EyeToggle
    key={`${row.id}-eye`} 
    detailComponent={<SlideRailExample id={row.id} />}
   />,
   <PencilButton
    key={`${row.equipmentId}-pencil`} // Thêm key
    id={row.equipmentId}
    // SỬA ĐỔI: Thêm onSuccess={refresh}
    editElement={<SlideRailsEdit id={row.equipmentId} onSuccess={refresh} />}
   />,
  ]) || []; // Thêm fallback || []

 // === 8. Cập nhật columnLefts ===
 const columnLefts = ['undefined','undefined','undefined',10,'undefined','undefined','undefined','undefined','undefined'];

 // === 9. Xử lý trạng thái loading (SỬA ĐỔI) ===
 // Bỏ khối `if (loading)`
 const isLoading = loading;
 const anyError = error;

 return (
  <Layout>
   <div className="p-6">
    
    {/* SỬA ĐỔI: Cập nhật logic return */}

    {/* 1. Ưu tiên hiển thị lỗi */}
    {anyError ? (
     <div className="text-center text-red-500 py-10">
      Lỗi: {anyError.toString()}
     </div>
    ) : (
     /* 2. Luôn hiển thị bảng (ngay cả khi đang tải) */
     <AdvancedTable
      title01="Đơn giá và định mức / Đơn giá và định mức sửa chữa thường xuyên"
      title="Đơn giá và định mức sửa chữa thường xuyên"
      columns={columns}
      columnWidths={columnWidths}
      data={tableData} // Sử dụng dữ liệu từ API
      
      // SỬA ĐỔI: Thêm các prop cần thiết
      createElement={<SlideRailsInput onSuccess={refresh} />}
      navbarMiniItems={items}
      basePath={basePath}
      onDeleted={refresh}
      
      columnLefts={columnLefts} // Sử dụng columnLefts đã cập nhật
     />
    )}
    
    {/* 3. Hiển thị loading overlay riêng biệt */}
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

export default SlideRails;