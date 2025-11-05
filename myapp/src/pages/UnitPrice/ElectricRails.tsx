import React from "react"; // 1. Bỏ useEffect
import { useApi } from "../../hooks/useFetchData"; // 2. Import hook useApi
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
  // SỬA ĐỔI: Lấy 'refresh' trực tiếp, bỏ 'fetchData'
  const { data, loading, error, refresh } = useApi<ElectricPriceItem>(fetchPath);

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

  // 7. (Khai báo API đã xong ở trên)

  // 8. SỬA ĐỔI: Bỏ hàm 'refresh' thủ công
  // const refresh = () => fetchData();

  // 9. SỬA ĐỔI: Bỏ 'useEffect'
  // useEffect(() => { ... }, [fetchData]);

  // 10. Map dữ liệu
  const tableData = Array.isArray(data) ?
    data.map((row, index) => [
      index + 1, // STT là index (đã chuyển sang string)
      row.equipmentCode,
      row.equipmentName,
      row.unitOfMeasureName,
      row.equipmentElectricityCost,
      row.monthlyElectricityCost,
      row.averageMonthlyTunnelProduction,
      row.electricityConsumePerMetres,
      row.electricityCostPerMetres,
      <PencilButton
        key={row.id} // Thêm key
        id={row.id}
        // SỬA ĐỔI: Thêm onSuccess={refresh} (dùng 'refresh' từ hook)
        editElement={<ElectricRailsEdit id={row.id} onSuccess={refresh} />} 
      />,
    ]) : []; // Return empty array if data is not an array

  // 11. Căn chỉnh cột (giữ nguyên)
  const columnLefts = [
    'undefined', 'undefined', 'undefined', 'undefined', 'undefined',
    'undefined', 'undefined', 'undefined', 'undefined', 'undefined'
  ];

  // 12. Biến loading/error (theo format mẫu)
  const isLoading = loading;
  const anyError = error;

  // 13. Return JSX (SỬA ĐỔI logic)
  return (
    <Layout>
      <div className="p-6">
        {/* Xử lý UI - Đã cập nhật */}
        
        {/* 1. Ưu tiên hiển thị lỗi */}
        {anyError ? (
          <div className="text-center text-red-500 py-10">
            Lỗi: {anyError.toString()}
          </div>
        ) : (
          /* 2. Luôn hiển thị bảng (ngay cả khi đang tải) */
          <AdvancedTable
            title01="Đơn giá và định mức / Đơn giá và định mức điện năng"
            title="Đơn giá và định mức điện năng"
            columns={columns}
            columnWidths={columnWidths}
            data={tableData} // Dùng dữ liệu động
            
            // Thêm các prop giống file mẫu
            // 'refresh' này là từ hook
            createElement={<ElectricRailsInput onSuccess={refresh} />}
            basePath={basePath}
            // 'refresh' này là từ hook
            onDeleted={refresh}
            
            columnLefts={columnLefts}
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

export default ElectricRails;