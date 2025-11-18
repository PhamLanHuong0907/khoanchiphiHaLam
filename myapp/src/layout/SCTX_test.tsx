import React, { useEffect, useState } from 'react';
// 1. Import component của bạn (tên file là SCTX)
import SlideRailGroupTable from './SCTX';
// 2. Import hook API (Giả sử file hook nằm ở thư mục hooks)
import { useApi } from '../hooks/useFetchData'; 

// === 3. Định nghĩa Interface cho dữ liệu API trả về ===
interface ApiPartItem {
  id: string; // ID của bản ghi (unit price item)
  equipmentId: string;
  equipmentCode: string;
  partId: string;
  partName: string; // -> name
  unitOfMeasureId: string;
  unitOfMeasureName: string; // -> unit
  partCost: number; // -> price
  replacementTimeStandard: number; // -> time
  averageMonthlyTunnelProduction: number; // -> number_sl
  quantity: number; // -> number_vt
  materialRatePerMetres: number; // -> dinhmuc
  materialCostPerMetres: number; // -> total
}

interface ApiResponse {
  equipmentId: string;
  equipmentCode: string;
  totalPrice: number;
  maintainUnitPriceEquipment: ApiPartItem[];
}

// === 4. Định nghĩa Interface cho UI (giống như mock data) ===
interface SlideRailItem {
  // === THAY ĐỔI: ID giờ sẽ là số thứ tự ===
  id: number; 
  // === KẾT THÚC THAY ĐỔI ===
  name: string;
  unit: string;
  price: string;
  time: string;
  number_vt: string;
  number_sl: string;
  dinhmuc: string; 
  total: string;
}

interface SlideRailGroup {
  items: SlideRailItem[];
}

// === 5. Hàm trợ giúp để định dạng số ===
const formatNumber = (num: number, digits: number = 2): string => {
    if (num === null || num === undefined) return "0";
    return num.toLocaleString("vi-VN", { maximumFractionDigits: digits });
}

// === 6. Hàm chuyển đổi dữ liệu API sang dữ liệu cho UI ===
const transformData = (apiData: ApiResponse): SlideRailGroup[] => {
  if (!apiData || !apiData.maintainUnitPriceEquipment) {
    return [];
  }

  // === THAY ĐỔI: Thêm `index` vào hàm map ===
  const items: SlideRailItem[] = apiData.maintainUnitPriceEquipment.map((part, index) => ({
    id: index + 1, // Gán ID là index + 1 (để bắt đầu từ 1)
    // === KẾT THÚC THAY ĐỔI ===
    name: part.partName,
    unit: part.unitOfMeasureName,
    price: formatNumber(part.partCost),
    time: formatNumber(part.replacementTimeStandard, 0),
    number_vt: formatNumber(part.quantity, 0),
    number_sl: formatNumber(part.averageMonthlyTunnelProduction, 0),
    dinhmuc: formatNumber(part.materialRatePerMetres, 6), 
    total: formatNumber(part.materialCostPerMetres),
  }));

  // API trả về 1 nhóm thiết bị, UI mong đợi 1 mảng các nhóm
  return [
    {
      items: items,
    },
  ];
};


// === 7. Component chính (đã cập nhật) ===
// Component này giờ sẽ nhận 'id' của thiết bị
const SlideRailExample: React.FC<{ id: string }> = ({ id }) => {
  // Khởi tạo hook useApi với base path
  const { fetchById, loading } = useApi<ApiResponse>(
    "/api/pricing/maintainunitpriceequipment"
  );
  
  // State để lưu trữ dữ liệu đã chuyển đổi cho bảng
  const [tableData, setTableData] = useState<SlideRailGroup[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Dùng useEffect để gọi API khi 'id' thay đổi
  useEffect(() => {
    if (!id) {
      setTableData([]); 
      return;
    }

    const loadData = async () => {
      setError(null);
      try {
        const result = await fetchById(id);
        
        if (result) {
          const transformed = transformData(result);
          setTableData(transformed);
        } else {
          setError("Không tìm thấy dữ liệu cho thiết bị này.");
          setTableData([]);
        }
      } catch (err: any) {
        setError(err.message || "Lỗi khi tải dữ liệu.");
        setTableData([]);
      }
    };

    loadData();
  }, [id, fetchById]); 

  // --- Render logic ---
  if (loading) {
    return <div style={{ padding: '20px' }}>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Lỗi: {error}</div>;
  }

  if (tableData.length === 0) {
    return <div style={{ padding: '20px' }}>Không có dữ liệu phụ tùng để hiển thị.</div>;
  }

  // Render component SCTX với dữ liệu từ API
  return (
    <div style={{ paddingLeft: '2.5%', paddingRight: '4%', paddingTop: '0px' }}>
      <SlideRailGroupTable data={tableData} />
    </div>
  );
};

export default SlideRailExample;