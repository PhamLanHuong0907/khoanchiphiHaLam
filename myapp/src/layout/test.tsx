import React, { useEffect, useState } from "react";
import MaterialGroupTable from "./material";
import { useApi } from "../hooks/useFetchData"; // 1. Import useApi

// 2. Định nghĩa Props, chấp nhận 'id'
interface MaterialsIngredientGroupedProps {
  id?: string;
}

// 3. Định nghĩa Interfaces cho JSON API
interface CostItem {
  materialId: string;
  materialCode: string;
  materialName: string;
  unitOfMeasureName: string;
  cost: string;
  quantity: string;
  totalPrice: string;
}

interface MaterialCostGroup {
  assignmentCodeId: string;
  assignmentCode: string;
  costs: CostItem[];
}

interface ApiData {
  id: string;
  code: string;
  name: string; // Đây sẽ là 'title'
  materialCost: MaterialCostGroup[];
}

const Materials_Ingredient_Grouped: React.FC<MaterialsIngredientGroupedProps> = ({ id }) => {
  // 4. Setup API
  const basePath = `/api/pricing/materialunitprice`;
  // (Giả định useApi có 'loading' và 'error')
  const { fetchById, loading, error } = useApi<ApiData>(basePath); 
  const [apiData, setApiData] = useState<ApiData | null>(null);

  // 5. Fetch dữ liệu khi 'id' thay đổi
  useEffect(() => {
    const loadData = async () => {
      if (id) {
        setApiData(null); // Xóa dữ liệu cũ
        const data = await fetchById(id);
        if (data) {
          setApiData(data as ApiData);
        }
      }
    };
    loadData();
  }, [id, fetchById]);

  // 6. Chuyển đổi dữ liệu API sang định dạng 'groupData'
  const transformedData = apiData?.materialCost.map((group, index) => {
    
    // Tính tổng 'sumoftotal' cho mỗi nhóm
    const sumoftotal = group.costs.reduce(
      (acc, item) => acc + parseFloat(item.totalPrice),
      0
    );

    // Map các vật tư bên trong
    const items = group.costs.map((item) => ({
      code: item.materialCode,
      name: item.materialName,
      unit: item.unitOfMeasureName,
      price: item.cost.toLocaleString(), // Format số
      quota: item.quantity.toLocaleString(), // Format số
      total: item.totalPrice.toLocaleString(), // Format số
    }));

    return {
      id: index + 1, // Dùng ID thật
      code: group.assignmentCode, // Tên nhóm (ví dụ: "GL")
      sumoftotal: sumoftotal.toLocaleString(),
      items: items,
    };
  }) || []; // Trả về mảng rỗng nếu apiData là null

  // 7. Render (với xử lý loading/error)
  return (
    <div style={{paddingLeft:"111px"}}>
      {loading && (
        <div style={{ padding: "20px", textAlign: "center" }}>
          Đang tải chi tiết...
        </div>
      )}
      {error && (
        <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
          Lỗi: {error.toString()}
        </div>
      )}
      {apiData && (
        <MaterialGroupTable
          title={apiData.name} // Lấy title từ API
          data={transformedData} // Dùng dữ liệu đã chuyển đổi
        />
      )}
    </div>
  );
};

export default Materials_Ingredient_Grouped;