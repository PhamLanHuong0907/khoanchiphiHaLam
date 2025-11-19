import React, { useState } from "react"; // ✅ THÊM useState
// 1. Import hook useApi (giả sử vị trí file)
import { useApi } from "../../hooks/useFetchData"; 
import Layout from "../../layout/layout_filter";
import AdvancedTable from "../../components/bodytable";
import PencilButton from "../../components/PencilButtons";
import SlideRailsInput from "./SlideRailInput";
import SlideRailsEdit from "./SlideRailEdit"; 
import EyeToggle from "../../components/eye";
import SlideRailExample from "../../layout/SCTX_test"; // Đổi tên thành SlideRailExample.tsx sau
import { ChevronsUpDown } from "lucide-react"; 

// === 2. Định nghĩa Interface cho dữ liệu API ===
interface MaintainUnitPrice {
 id: string; // Thêm ID
 equipmentId: string;
 equipmentCode: string;
 totalPrice: number;
 startDate: string; // Thêm ngày bắt đầu
 endDate: string; // Thêm ngày kết thúc
}

// === 3. Hàm trợ giúp định dạng số ===
const formatNumber = (num: number, digits: number = 2): string => {
  if (num === null || num === undefined) return "0";
  return num.toLocaleString("vi-VN", { maximumFractionDigits: digits });
}

// === 4. Thêm hàm định dạng ngày ===
const formatDate = (dateStr: string | Date | undefined | null): string => {
 if (!dateStr) return "N/A";
 try {
  const date = new Date(dateStr);
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


const SlideRails: React.FC = () => {
 // === 5. Khai báo API ===
 const basePath = "/api/pricing/maintainunitpriceequipment?pageIndex=1&pageSize=1000";
 const { data: apiData, loading, error, refresh } = useApi<MaintainUnitPrice>(
  basePath
 );
 
 // ✅ 1. STATE TRIGGER RELOAD
 const [detailReloadKey, setDetailReloadKey] = useState(0);

  // ✅ 2. CẬP NHẬT handleRefresh
  const handleRefresh = async () => {
    // 1. Refresh bảng cha
    await refresh(); 
    // 2. Tăng key để buộc bảng con re-render
    setDetailReloadKey(prev => prev + 1); 
  };


 // === 6. Cập nhật cột ===
 const columns = [
  "STT",
  "Mã thiết bị",
  "Thời gian",
  "Tổng tiền",
  "Xem",
  "Sửa",
 ];

 // === 7. Cập nhật độ rộng cột ===
 const columnWidths = [6, 20.5, 56, 10.5, 3, 4];

 // Navbar mini (giữ nguyên)
 const items = [
  { label: "Đào lò", path: "/SlideRails" },
  { label: "Lò chợ", path: "/MarketRails" },
 ];

 // === 8. Map dữ liệu API sang định dạng cho bảng ===
 const tableData =
  apiData?.map((row, index) => [
   index + 1, // STT là index
   row.equipmentCode, // Mã thiết bị
   `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`, // Hiển thị ngày tháng
   formatNumber(row.totalPrice), // Tổng tiền đã định dạng
   
   // Pass equipmentId cho component con
    <EyeToggle
    key={`${row.id}-eye`} // Key động
    // ✅ 3. TRUYỀN KEY ĐỘNG (Bắt buộc re-render khi detailReloadKey thay đổi)
    detailComponent={<SlideRailExample key={`${row.id}-${detailReloadKey}`} id={row.id} />} 
   />,
   <PencilButton
    key={`${row.id}-pencil`} // Key động
    id={row.id}
    // ✅ Truyền handleRefresh đã được cập nhật
    editElement={<SlideRailsEdit id={row.id} onSuccess={handleRefresh} />}
   />,
  ]) || [];

 // === 9. Cập nhật columnLefts ===
 const columnLefts = ['undefined','undefined','undefined',10,'undefined','undefined','undefined','undefined','undefined'];

 // === 10. Xử lý trạng thái loading ===
 const isLoading = loading;
 const anyError = error;

 return (
  <Layout>
   <div className="p-6 relative min-h-[500px]">
    
    <style>{`
          th > div { display: inline-flex; align-items: center; gap: 3px; }
          th > div span:last-child { font-size: 5px; color: gray; }
        `}</style>

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
      
      // ✅ Truyền handleRefresh cho Input
      createElement={<SlideRailsInput onSuccess={handleRefresh} />}
      navbarMiniItems={items}
      basePath={"/api/pricing/maintainunitpriceequipment"} // Cần basePath cho DELETE
      // ✅ Truyền handleRefresh cho Delete
      onDeleted={handleRefresh}
      
      columnLefts={columnLefts} // Sử dụng columnLefts đã cập nhật
     />
    )}
    
    {/* 3. Hiển thị loading overlay riêng biệt */}
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

export default SlideRails;