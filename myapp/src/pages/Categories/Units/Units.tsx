import React from "react";
import Layout from "../../../layout/layout_filter";
import AdvancedTable from "../../../components/bodytable";
import PencilButton from "../../../components/PencilButtons";
import { ChevronsUpDown } from "lucide-react";
import UnitsEdit from "./UnitsEdit";
import UnitsInput from "./UnitsInput";
import { useApi } from "../../../hooks/useFetchData";

const Unit: React.FC = () => {
  // ✅ URL cơ sở cho các hành động CRUD
  const basePath = `/api/catalog/unitofmeasure`; 
  // ✅ URL đầy đủ để fetch list (GET)
  const fetchPath = `${basePath}?pageIndex=1&pageSize=1000`; 
  
  // Hook useApi trả về data và hàm refresh (đã được sửa để trả Promise)
  const { data, loading, error, refresh } = useApi<any>(fetchPath);

  const columns = [
    "STT",
    <div className="flex items-center gap-1" key="unit">
      <span>Đơn vị tính</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    "Sửa",
  ];
  const columnWidths = [6, 90, 4];

  // ✅ Helper async để đảm bảo việc await hoạt động đúng
  const handleRefresh = async () => {
    await refresh();
  };

  const tableData =
    data && Array.isArray(data)
      ? data.map((row: any, index: number) => [
          index + 1,
          row.name,
          <PencilButton
            key={row.id}
            id={row.id}
            // ✅ Truyền handleRefresh vào onSuccess của form Edit
            // Logic: Sửa -> Chờ refresh() -> Table update -> 300ms -> Alert
            editElement={<UnitsEdit id={row.id} onSuccess={handleRefresh} />}
          />,
        ])
      : [];

  return (
    <Layout>
      <div className="p-6 relative min-h-[500px]">
        <style>{`
          th > div {
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
        `}</style>

        {error ? (
          <div className="text-center text-red-500 py-10">Lỗi: {error}</div>
        ) : (
          <AdvancedTable
            title01="Danh mục / Đơn vị tính"
            title="Đơn vị tính"
            columns={columns}
            columnWidths={columnWidths}
            data={tableData}
            // ✅ Truyền handleRefresh vào form Create
            createElement={<UnitsInput onSuccess={handleRefresh} />}
            basePath={basePath}
            // ✅ Truyền handleRefresh vào hành động Delete
            // Logic: Xóa API -> await handleRefresh() -> 300ms -> Alert
            onDeleted={handleRefresh}
            columnLefts={[]} 
          />
        )}
        
        {/* Overlay Loading khi đang refresh dữ liệu */}
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

export default Unit;