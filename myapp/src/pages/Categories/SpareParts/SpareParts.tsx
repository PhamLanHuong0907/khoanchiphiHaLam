import React from "react"; 
import Layout from "../../../layout/layout_filter";
import AdvancedTable from "../../../components/bodytable";
import PencilButton from "../../../components/PencilButtons";
import { ChevronsUpDown } from "lucide-react";
import SparePartsInput from "./SparePartsInput";
import SparePartsEdit from "./SparePartEdit";
import { useApi } from "../../../hooks/useFetchData";

// SỬA ĐỔI: Interface khớp hoàn toàn với JSON result
interface SparePart {
  id: string;
  code: string;           // Mã phụ tùng
  name: string;           // Tên phụ tùng
  unitOfMeasureId: string;
  unitOfMeasureName: string; // <-- API đã cung cấp
  equipmentId: string;
  equipmentCode: string;     // <-- API đã cung cấp
  costAmmount: number;       // <-- Tên đúng từ API
}

const SpareParts: React.FC = () => {
  const basePath = `/api/catalog/part`;
  const fetchPath = `${basePath}?pageIndex=1&pageSize=1000`;
  // Gọi 1 API chính, lấy 'refresh' trực tiếp
  const { data, loading, error, refresh } = useApi<SparePart>(fetchPath);

  // ✅ Helper Async để đảm bảo việc await hoạt động đúng từ con
  const handleRefresh = async () => {
    await refresh();
  };


  // ====== Định nghĩa Cột ======
  const columns = [
    "STT",
    <div className="flex items-center gap-1" key="equipmentCode">
      <span>Mã thiết bị</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    <div className="flex items-center gap-1" key="code">
      <span>Mã phụ tùng</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    <div className="flex items-center gap-1" key="name">
      <span>Tên phụ tùng</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    "ĐVT",
    "Đơn giá",
    "Sửa",
  ];

  const columnWidths = [6, 15, 15, 36, 10, 14, 4];

  // Map dữ liệu từ API
  const tableData =
    data?.map((row, index) => [
      index + 1,
      row.equipmentCode || "",
      row.code || "",
      row.name || "",
      row.unitOfMeasureName || "",
      row.costAmmount?.toLocaleString() || "0",
      <PencilButton
        key={row.id}
        id={row.id}
        // ✅ Truyền handleRefresh
        editElement={<SparePartsEdit id={row.id} onSuccess={handleRefresh} />}
      />,
    ]) || [];

  const isLoading = loading;
  const anyError = error;

  return (
    <Layout>
      <div className="p-6 relative min-h-[500px]">
        {/* Style cho sort icon */}
        <style>{`
          th > div { display: inline-flex; align-items: center; gap: 3px; }
          th > div span:last-child { font-size: 5px; color: gray; }
        `}</style>

        {/* 1. Ưu tiên hiển thị lỗi */}
        {anyError ? (
          <div className="text-center text-red-500 py-10">Lỗi: {anyError.toString()}</div>
        ) : (
          /* 2. Luôn hiển thị bảng (ngay cả khi đang tải) */
          <AdvancedTable
            title01="Danh mục / Phụ tùng"
            title="Phụ tùng"
            columns={columns}
            columnWidths={columnWidths}
            data={tableData}
            // ✅ Truyền handleRefresh
            createElement={<SparePartsInput onSuccess={handleRefresh} />}
            basePath={basePath}
            // ✅ Truyền handleRefresh
            onDeleted={handleRefresh}
            columnLefts={['undefined','undefined','undefined','undefined',6,'undefined','undefined']}
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
             <span className="text-blue-600 font-medium">Đang tải dữ liệu...</span>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SpareParts;