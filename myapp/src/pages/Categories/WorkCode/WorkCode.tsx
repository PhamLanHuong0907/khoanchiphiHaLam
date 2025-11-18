import React from "react";
import Layout from "../../../layout/layout_filter";
import AdvancedTable from "../../../components/bodytable";
import PencilButton from "../../../components/PencilButtons";
import { ChevronsUpDown } from "lucide-react";
import WorkCodeEdit from "./WorkCodeEdit";
import WorkCodeInput from "./WorkCodeInput";
import { useApi } from "../../../hooks/useFetchData";

const WorkCode: React.FC = () => {
  const basePath = `/api/catalog/assignmentcode`;
  const fetchPath = `${basePath}?pageIndex=1&pageSize=1000`;
  
  const { data, loading, error, refresh } = useApi<{
    id: string;
    code: string;
    name: string;
    unitOfMeasureName: string;
  }>(fetchPath);

  // ✅ Helper Async để đảm bảo các component con await đúng
  const handleRefresh = async () => {
    await refresh();
  };

  const columns = [
    "STT",
    <div className="flex items-center gap-1" key="code">
      <span>Mã giao khoán</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    <div className="flex items-center gap-1" key="name">
      <span>Tên mã giao khoán</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    <div className="flex items-center gap-1" key="unit">
      <span>ĐVT</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    "Sửa",
  ];

  const columnWidths = [6, 20, 61, 9, 4];

  const tableData =
    data?.map((row, index) => [
      index + 1,
      row.code,
      row.name,
      row.unitOfMeasureName || "",
      <PencilButton
        key={row.id}
        id={row.id}
        // ✅ Truyền handleRefresh
        editElement={<WorkCodeEdit id={row.id} onSuccess={handleRefresh} />}
      />,
    ]) || [];


  return (
    <Layout>
      <div className="p-6 relative min-h-[500px]">
        
        {error ? (
          <div className="text-center text-red-500 py-10">Lỗi: {error}</div>
        ) : (
          <AdvancedTable
            title01="Danh mục / Mã giao khoán"
            title="Mã giao khoán"
            columns={columns}
            columnWidths={columnWidths}
            data={tableData}
            // ✅ Truyền handleRefresh cho Create
            createElement={<WorkCodeInput onSuccess={handleRefresh} />}
            basePath={basePath}
            // ✅ Truyền handleRefresh cho Delete
            onDeleted={handleRefresh}
            // Giữ nguyên config columnLefts của bạn
            columnLefts={['undefined', 'undefined', 'undefined', 6, 'undefined']}
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

export default WorkCode;