import React from "react";
import Layout from "../../../layout/layout_filter";
import AdvancedTable from "../../../components/bodytable";
import PencilButton from "../../../components/PencilButtons";
import { ChevronsUpDown } from "lucide-react";
import UnitsEdit from "./UnitsEdit";
import UnitsInput from "./UnitsInput";
import { useApi } from "../../../hooks/useFetchData";

const Unit: React.FC = () => {
  // ✅ tách riêng URL: (Đã tối ưu)
  const basePath = `/api/catalog/unitofmeasure`; // dùng cho POST / PUT / DELETE
  const fetchPath = `${basePath}?pageIndex=1&pageSize=1000`; // dùng cho GET
  
  const { data, loading, error, refresh } = useApi<any>(fetchPath);

  const columns = [
    "STT",
    <div className="flex items-center gap-1" key="unit">
      <span>Đơn vị tính</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    "Sửa",
  ];
  const columnWidths = [6, 90, 4]; // (Giữ nguyên)

  const tableData =
    data && Array.isArray(data)
      
      ? data.map((row: any, index: number) => [
          index + 1,
          row.name,
          <PencilButton
            key={row.id}
            id={row.id}
            editElement={<UnitsEdit id={row.id} onSuccess={refresh} />}
          />,
        ])
      : [];

  return (
    <Layout>
      <div className="p-6">
        <style>{`
          th > div {
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
        `}</style>

        {/* SỬA ĐỔI: Cập nhật logic return */}

        {/* 1. Ưu tiên hiển thị lỗi */}
        {error ? (
          <div className="text-center text-red-500 py-10">Lỗi: {error}</div>
        ) : (
          /* 2. Luôn hiển thị bảng (ngay cả khi đang tải) */
          <AdvancedTable
            title01="Danh mục / Đơn vị tính"
            title="Đơn vị tính"
            columns={columns}
            columnWidths={columnWidths}
            data={tableData}
            createElement={<UnitsInput onSuccess={refresh} />}
            basePath={basePath}   // ✅ dùng basePath "sạch" cho PUT / DELETE / POST
            onDeleted={refresh}   // ✅ tự refresh sau khi xóa
            columnLefts={['undefined', 'undefined', 'undefined']}
          />
        )}
        
        {/* 3. Hiển thị loading overlay riêng biệt */}
        {loading && (
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

export default Unit;