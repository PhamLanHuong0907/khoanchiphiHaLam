import React from "react"; 
import Layout from "../../../layout/layout_filter";
import AdvancedTable from "../../../components/bodytable";
import PencilButton from "../../../components/PencilButtons";
import { ChevronsUpDown } from "lucide-react";
import EquipmentInput from "./EquipmentInput";
import EquipmentEdit from "./EquipmentEdit";
import { useApi } from "../../../hooks/useFetchData";

// Cập nhật Interface theo API
interface EquipmentItem {
  id: string;
  code: string;
  name: string;
  unitOfMeasureId: string;
  unitOfMeasureName: string; 
  currentPrice: number; // Thêm trường này
}

const Equipment: React.FC = () => {
  const basePath = `/api/catalog/equipment`;
  const fetchPath = `${basePath}?pageIndex=1&pageSize=1000`;
  const { data, loading, error, refresh } = useApi<EquipmentItem>(fetchPath);

  // ✅ Helper Async để đảm bảo việc await hoạt động đúng từ con
  const handleRefresh = async () => {
    await refresh();
  };

  // ====== Cột bảng ======
  const columns = [
    "STT",
    <div className="flex items-center gap-1" key="code">
      <span>Mã thiết bị</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    <div className="flex items-center gap-1" key="name">
      <span>Tên thiết bị</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    "ĐVT",
    <div className="flex items-center gap-1" key="price">
      <span>Đơn giá điện năng (kWh)</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    "Sửa",
  ];

  const columnWidths = [6, 15, 45, 10, 19, 5];

  // ====== Dữ liệu bảng ======
  const tableData =
    data?.map((row, index) => [
      index + 1,
      row.code || "",
      row.name || "",
      row.unitOfMeasureName || "",
      row.currentPrice?.toLocaleString('vi-VN') || "0", 
      <PencilButton
        key={row.id}
        id={row.id}
        // ✅ Truyền handleRefresh
        editElement={<EquipmentEdit id={row.id} onSuccess={handleRefresh} />}
      />,
    ]) || [];

  return (
    <Layout>
      <div className="p-6 relative min-h-[500px]">
        
        {error ? (
          <div className="text-center text-red-500 py-10">
            Lỗi: {error.toString()}
          </div>
        ) : (
          <AdvancedTable
            title01="Danh mục / Mã thiết bị"
            title="Thiết bị"
            columns={columns}
            columnWidths={columnWidths}
            data={tableData}
            // ✅ Truyền handleRefresh
            createElement={<EquipmentInput onSuccess={handleRefresh} />}
            basePath={basePath}
            // ✅ Truyền handleRefresh
            onDeleted={handleRefresh}
            columnLefts={['undefined', 'undefined', 'undefined', 'undefined', 'undefined', 'undefined']}
          />
        )}
        
        {/* Loading Overlay */}
        {loading && (
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
            <span className="text-blue-600 font-medium">Đang tải dữ liệu...</span>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Equipment;