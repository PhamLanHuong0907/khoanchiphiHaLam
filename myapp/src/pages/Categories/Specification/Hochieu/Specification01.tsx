import React from "react"; 
import Layout from "../../../../layout/layout_filter";
import AdvancedTable from "../../../../components/bodytable";
import PencilButton from "../../../../components/PencilButtons";
import { ChevronsUpDown } from "lucide-react"; 
import Specification01Edit from "./Specification01Edit";
import Specification01Input from "./Specification01Input";
import { useApi } from "../../../../hooks/useFetchData"; 

interface Passport {
  id: string;
  name: string;
  sd: string; // API trả về string (theo Input/Edit)
  sc: number;
}

const Specification01: React.FC = () => {
  const basePath = `api/product/passport`;
  const fetchPath = `${basePath}?pageIndex=1&pageSize=1000`;
  
  const { data, loading, error, refresh } = useApi<Passport>(fetchPath);

  // ✅ Wrapper Async
  const handleRefresh = async () => {
    await refresh();
  };

  const columns = [
    "STT",
    <div className="flex items-center gap-1" key="name">
      <span>Hộ chiếu, Sđ, Sc</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    <div className="flex items-center gap-1" key="sd">
      <span>Sđ</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    <div className="flex items-center gap-1" key="sc">
      <span>Sc</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    "Sửa",
  ];
  
  const columnWidths = [6, 39, 30, 20, 4];

  const items = [
    { label: "Hộ chiếu, Sđ, Sc", path: "/Specification01" },
    { label: "Độ kiên cố than, đá", path: "/Specification02" },
    { label: "Tỷ lệ đá kẹp (Ckep)", path: "/Specification03" },
    { label: "Chèn", path: "/Specification04" },
    { label: "Bước chống", path: "/Specification05" },
  ];

  const tableData =
    data?.map((row, index) => [
      index + 1,
      row.name || "",
      row.sd || "0", // Sđ là string
      row.sc?.toLocaleString() || "0",
      <PencilButton
        key={row.id}
        id={row.id}
        // ✅ Truyền handleRefresh
        editElement={<Specification01Edit id={row.id} onSuccess={handleRefresh} />}
      />,
    ]) || [];

  const isLoading = loading;
  const anyError = error;

  return (
    <Layout>
      <div className="p-6 relative min-h-[500px]">
        <style>{`
          th > div {
            display: inline-flex;
            align-items: center;
            gap: 3px;
          }
          th > div span:last-child {
            font-size: 5px;
            color: gray;
          }
        `}</style>
        
        {anyError ? (
          <div className="text-center text-red-500 py-10">
            Lỗi: {anyError.toString()}
          </div>
        ) : (
          <AdvancedTable
            title01="Danh mục / Thông số / Hộ chiếu Sđ, Sc"
            title="Thông số"
            columns={columns}
            columnWidths={columnWidths}
            data={tableData}
            // ✅ Truyền handleRefresh
            createElement={<Specification01Input onSuccess={handleRefresh} />} 
            navbarMiniItems={items}
            basePath={basePath}
            // ✅ Truyền handleRefresh
            onDeleted={handleRefresh} 
            columnLefts={['undefined','undefined','undefined','undefined','undefined']}
          />
        )}
        
        {/* Loading Overlay */}
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

export default Specification01;