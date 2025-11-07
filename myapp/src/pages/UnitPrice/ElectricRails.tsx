import React from "react";
import { useApi } from "../../hooks/useFetchData"; 
import Layout from "../../layout/layout_filter";
import AdvancedTable from "../../components/bodytable";
import PencilButton from "../../components/PencilButtons";
import ElectricRailsInput from "./ElectricRailsInput";
import ElectricRailsEdit from "./ElectricRailsEdit";

// 3. Định nghĩa Interface (giữ nguyên)
interface ElectricPriceItem {
 id: string; 
 equipmentId: string;
 equipmentCode: string;
 equipmentName: string;
 unitOfMeasureName: string;
 equipmentElectricityCost: string;
 monthlyElectricityCost: string;
 averageMonthlyTunnelProduction: string;
 electricityConsumePerMetres: string;
 electricityCostPerMetres: string;
}
const ElectricRails: React.FC = () => {
 const basePath = "/api/pricing/electricityunitpriceequipment";
 const fetchPath = `${basePath}?pageIndex=1&pageSize=1000`;
 const { data, loading, error, refresh } = useApi<ElectricPriceItem>(fetchPath);

  // ====== BẮT ĐẦU SỬA ĐỔI: Cập nhật hàm tiện ích ======
      
  /**
   * 1. Parse chuỗi API (có thể là "1.000,5" hoặc "1000.5") về SỐ
   */
  const parseApiString = (str: string | undefined | null): number => {
    if (!str) return 0;
    // Xóa dấu chấm (nghìn), thay dấu phẩy (thập phân) bằng dấu chấm
    const cleanStr = String(str).replace(/\./g, "").replace(',', '.'); 
    return parseFloat(cleanStr || "0");
  };

  /**
   * 2. Định dạng SỐ thành chuỗi "Định mức" (dấu phẩy , thập phân, TỐI ĐA 4 số)
   * VÍ DỤ: 1.234,5678
   */
  const formatNorm = (num: number): string => {
    return new Intl.NumberFormat('vi-VN', { // 'vi-VN' dùng ',' thập phân
      maximumFractionDigits: 4,
    }).format(num);
  };

  /**
   * 3. Định dạng SỐ thành chuỗi "Chi phí" (dấu chấm . hàng nghìn, 0 số thập phân)
   * VÍ DỤ: 100.000
   */
  const formatCost = (num: number): string => {
      // 'de-DE' dùng '.' làm dấu hàng nghìn và ',' làm dấu thập phân.
      // Bằng cách set 0 số thập phân, dấu ',' sẽ không bao giờ xuất hiện.
      return new Intl.NumberFormat('de-DE', { 
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
      }).format(num);
  };

  // --- Hàm kết hợp (wrapper) cho gọn ---
  const reformatNorm = (str: string | undefined | null): string => {
      const num = parseApiString(str);
      return formatNorm(num);
  };
  const reformatCost = (str: string | undefined | null): string => {
      const num = parseApiString(str);
      return formatCost(num);
  };
  // ====== KẾT THÚC SỬA ĐỔI ======


 const columns = [
  "STT",
  "Mã thiết bị",
  "Tên thiết bị",
  "ĐVT",
  "Đơn giá điện năng (đ/kwh)",
  "Điện năng tiêu thụ cho 1 thiết bị / tháng (Kwh/tháng)",
  "Sản lượng đào lò bình quân tháng (m)",
  "Điện năng tiêu thụ cho 1 thiết bị/1 mét lò đào (kwh/m)",
  "Chi phí điện năng cho 1 thiết bị/1 mét lò đào (đ/m)",
  "Sửa",
 ];
 const columnWidths = [6, 8, 15, 4, 8, 14, 13, 15, 15, 4];

 // 10. Map dữ liệu (Đã cập nhật)
 const tableData = Array.isArray(data) ?
  data.map((row, index) => [
   index + 1, // STT 
   row.equipmentCode,
   row.equipmentName,
   row.unitOfMeasureName,
      // "Đơn giá điện năng" -> CHI PHÍ (dấu chấm ., 0 số thập phân)
   reformatCost(row.equipmentElectricityCost), 
      // "Điện năng tiêu thụ" -> ĐỊNH MỨC (dấu phẩy ,, max 4 số thập phân)
   reformatNorm(row.monthlyElectricityCost), 
      // "Sản lượng" -> ĐỊNH MỨC (dấu phẩy ,, max 4 số thập phân)
   reformatNorm(row.averageMonthlyTunnelProduction), 
      // "Điện năng tiêu thụ" -> ĐỊNH MỨC (dấu phẩy ,, max 4 số thập phân)
   reformatNorm(row.electricityConsumePerMetres), 
      // "Chi phí điện năng" -> CHI PHÍ (dấu chấm ., 0 số thập phân)
   reformatCost(row.electricityCostPerMetres), 
   <PencilButton
    key={row.id} 
    id={row.id}
    editElement={<ElectricRailsEdit id={row.id} onSuccess={refresh} />} 
   />,
  ]) : []; 

 const columnLefts = [
  'undefined', 'undefined', 'undefined', 'undefined', 'undefined',
  'undefined', 'undefined', 'undefined', 'undefined', 'undefined'
 ];

 const isLoading = loading;
 const anyError = error;

 return (
  <Layout>
   <div className="p-6">
    {anyError ? (
     <div className="text-center text-red-500 py-10">
      Lỗi: {anyError.toString()}
     </div>
    ) : (
     <AdvancedTable
      title01="Đơn giá và định mức / Đơn giá và định mức điện năng"
      title="Đơn giá và định mức điện năng"
      columns={columns}
      columnWidths={columnWidths}
      data={tableData} 
      createElement={<ElectricRailsInput onSuccess={refresh} />}
      basePath={basePath}
      onDeleted={refresh}
      columnLefts={columnLefts}
    />
    )}
    
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

export default ElectricRails;