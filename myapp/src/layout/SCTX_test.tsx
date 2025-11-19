import React, { useEffect, useState } from 'react';
import SlideRailGroupTable from './SCTX'; // Giả định SCTX là component render bảng
import { useApi } from '../hooks/useFetchData'; 

// === Định nghĩa Interface cho dữ liệu API trả về ===
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

// === Định nghĩa Interface cho UI (giống như mock data) ===
interface SlideRailItem {
  id: number; 
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

// === Hàm trợ giúp để định dạng số ===
const formatNumber = (num: number, digits: number = 2): string => {
    if (num === null || num === undefined) return "0";
    return num.toLocaleString("vi-VN", { maximumFractionDigits: digits });
}

// === Hàm chuyển đổi dữ liệu API sang dữ liệu cho UI ===
const transformData = (apiData: ApiResponse): SlideRailGroup[] => {
  if (!apiData || !apiData.maintainUnitPriceEquipment) {
    return [];
  }

  const items: SlideRailItem[] = apiData.maintainUnitPriceEquipment.map((part, index) => ({
    id: index + 1, 
    name: part.partName,
    unit: part.unitOfMeasureName,
    price: formatNumber(part.partCost, 0), 
    time: formatNumber(part.replacementTimeStandard, 0),
    number_vt: formatNumber(part.quantity, 0),
    number_sl: formatNumber(part.averageMonthlyTunnelProduction, 0),
    dinhmuc: formatNumber(part.materialRatePerMetres, 4), 
    total: formatNumber(part.materialCostPerMetres, 0), 
  }));

  return [
    {
      items: items,
    },
  ];
};


// === Component chính (SlideRailExample.tsx) ===
const SlideRailExample: React.FC<{ id: string }> = ({ id }) => {
  const { fetchById, loading } = useApi<ApiResponse>(
    "/api/pricing/maintainunitpriceequipment"
  );
  
  const [tableData, setTableData] = useState<SlideRailGroup[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Dùng useEffect để gọi API khi 'id' thay đổi HOẶC khi component bị re-mount (do key thay đổi)
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
        // Kiểm tra lỗi 404/not found để hiển thị message rõ ràng hơn
        const errorMsg = err.message || "Lỗi khi tải dữ liệu.";
        setError(errorMsg.includes('404') ? "Dữ liệu chi tiết không tồn tại." : errorMsg);
        setTableData([]);
      }
    };

    loadData();
    // Dependency array: [id, fetchById]
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