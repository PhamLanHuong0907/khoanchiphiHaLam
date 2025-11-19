import React from "react"; 
import Layout from "../../../layout/layout_filter";
import AdvancedTable from "../../../components/bodytable";
import PencilButton from "../../../components/PencilButtons";
import { ChevronsUpDown } from "lucide-react";
import AdjustmentFactor01Edit from "./AdjustmentFacor01Edit";
import AdjustmentFactor01Input from "./AdjustmentFactor01Input";
import { useApi } from "../../../hooks/useFetchData";

// 1. Định nghĩa Interface
interface AdjustmentFactor {
  id: string;
  code: string;
  name: string;
}

const AdjustmentFactors01: React.FC = () => {
  // 2. Khai báo API (SỬA ĐỔI)
  const basePath = `api/adjustment/adjustmentfactor`;
  const fetchPath = `${basePath}?pageIndex=1&pageSize=1000`;
  const { data, loading, error, refresh } = useApi<AdjustmentFactor>(fetchPath);

  // ✅ Wrapper Async để đảm bảo việc await hoạt động đúng từ con
  const handleRefresh = async () => {
    await refresh();
  };

  // 4. Cập nhật Columns (giữ nguyên)
  const columns = [
    "STT",
    <div className="flex items-center gap-1" key="code">
      <span>Mã hệ số điều chỉnh</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    <div className="flex items-center gap-1" key="name">
      <span>Tên hệ số điều chỉnh</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    "Sửa",
  ];

  const columnWidths = [6, 18, 68, 4]; // Giữ nguyên

  // 5. Map dữ liệu từ API
  const tableData =
    data?.map((row, index) => [
      index + 1,
      row.code || "",
      row.name || "",
      <PencilButton
        key={row.id}
        id={row.id} // Dùng id từ API
        // ✅ Truyền handleRefresh
        editElement={<AdjustmentFactor01Edit id={row.id} onSuccess={handleRefresh} />} 
      />,
    ]) || [];

  // Navbar mini (giữ nguyên)
  const items = [
    { label: "Hệ số điều chỉnh", path: "/AdjustmentFactors01" },
    { label: "Diễn giải", path: "/AdjustmentFactors02" },
  ];

  // 6. Biến loading/error
  const isLoading = loading;
  const anyError = error;

  return (
    <Layout>
      <div className="p-6 relative min-h-[500px]">
        {/* Style giữ nguyên */}
        <style>{`
          th > div { display: inline-flex; align-items: center; gap: 3px; }
          th > div span:last-child { font-size: 5px; color: gray; }
        `}</style>
        
        {/* 7. Xử lý UI - Đã cập nhật */}
        
        {/* 1. Ưu tiên hiển thị lỗi */}
        {anyError ? (
          <div className="text-center text-red-500 py-10">
            Lỗi: {anyError.toString()}
          </div>
        ) : (
          /* 2. Luôn hiển thị bảng (ngay cả khi đang tải) */
          <AdvancedTable
            title01="Danh mục / Hệ số điều chỉnh / Hệ số điều chỉnh"
            title="Hệ số điều chỉnh"
            columns={columns}
            columnWidths={columnWidths}
            data={tableData} // Dùng dữ liệu động
            // ✅ Truyền handleRefresh
            createElement={<AdjustmentFactor01Input onSuccess={handleRefresh} />} 
            navbarMiniItems={items}
            basePath={basePath} // Thêm basePath
            // ✅ Truyền handleRefresh
            onDeleted={handleRefresh} 
            columnLefts={['undefined','undefined','undefined','undefined','undefined','undefined','undefined','undefined']}
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

export default AdjustmentFactors01;