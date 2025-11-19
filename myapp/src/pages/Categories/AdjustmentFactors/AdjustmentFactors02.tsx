import React from "react"; 
import Layout from "../../../layout/layout_filter";
import AdvancedTable from "../../../components/bodytable";
import PencilButton from "../../../components/PencilButtons";
import AdjustmentFactors02Input from "./AdjustmentFactor02Input";
import AdjustmentFactors02Edit from "./AdjustmentFactor02Edit";
import { useApi } from "../../../hooks/useFetchData"; 
import { ChevronsUpDown } from "lucide-react"; 

// 1. Định nghĩa Interface
interface AdjustmentFactorDescription {
  id: string;
  description: string;
  adjustmentFactorId: string;
  adjustmentFactorCode: string;
  processGroupId: string;
  processGroupName: string;
  maintenanceAdjustmentValue: number;
  electricityAdjustmentValue: number;
}

const AdjustmentFactors02: React.FC = () => {
  // 2. Khai báo API (SỬA ĐỔI)
  const basePath = `/api/adjustment/adjustmentfactordescription`;
  const fetchPath = `${basePath}?pageIndex=1&pageSize=1000`;
  const { data, loading, error, refresh } = useApi<AdjustmentFactorDescription>(fetchPath);

  // ✅ Wrapper Async để đảm bảo việc await hoạt động đúng từ con
  const handleRefresh = async () => {
    await refresh();
  };

  // 4. Cập nhật Columns (giữ nguyên)
  const columns = [
    "STT", // Đổi "" thành "STT"
    <div className="flex items-center gap-1" key="group">
      <span>Nhóm CĐSX</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    <div className="flex items-center gap-1" key="code">
      <span>Mã HSĐC</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    <div className="flex items-center gap-1" key="desc">
      <span>Diễn giải HSĐC</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    <div className="flex items-center gap-1" key="sctx">
      <span>Trị số điều chỉnh SCTX</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    <div className="flex items-center gap-1" key="elec">
      <span>Trị số điều chỉnh điện năng</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    "Sửa"
  ];
  const columnWidths = [6, 14, 8, 30, 19, 19, 4];

  // Navbar mini (giữ nguyên)
  const items = [
    { label: "Hệ số điều chỉnh", path: "/AdjustmentFactors01" },
    { label: "Diễn giải", path: "/AdjustmentFactors02" },
  ];

  // 5. Map dữ liệu từ API
  const tableData =
    data?.map((row, index) => [
      index + 1,
      row.processGroupName || "",
      row.adjustmentFactorCode || "",
      row.description || "",
      row.maintenanceAdjustmentValue?.toLocaleString() || "0",
      row.electricityAdjustmentValue?.toLocaleString() || "0",
      <PencilButton
        key={row.id}
        id={row.id} // Dùng id từ API
        // ✅ Truyền handleRefresh
        editElement={<AdjustmentFactors02Edit id={row.id} onSuccess={handleRefresh} />} 
      />
    ]) || [];

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
            title01="Danh mục / Hệ số điều chỉnh / Diễn giải"
            title="Hệ số điều chỉnh"
            columns={columns}
            columnWidths={columnWidths}
            data={tableData} // Dùng dữ liệu động
            // ✅ Truyền handleRefresh
            createElement={<AdjustmentFactors02Input onSuccess={handleRefresh} />} 
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

export default AdjustmentFactors02;