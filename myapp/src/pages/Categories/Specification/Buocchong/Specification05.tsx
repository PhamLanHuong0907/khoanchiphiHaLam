import React from "react";
import Layout from "../../../../layout/layout_filter";
import AdvancedTable from "../../../../components/bodytable";
import PencilButton from "../../../../components/PencilButtons";
import Specification05Input from "./Specification05Input";
import Specification05Edit from "./Specification05Edit";
import { ChevronsUpDown } from "lucide-react";
import { useApi } from "../../../../hooks/useFetchData";

interface SupportStep {
  id: string;
  value: string;
}

const Specification05: React.FC = () => {
  const basePath = `api/product/supportstep`;
  const fetchPath = `${basePath}?pageIndex=1&pageSize=1000`;
  
  const { data, loading, error, refresh } = useApi<SupportStep>(fetchPath);

  // ✅ Wrapper Async để đảm bảo việc await hoạt động đúng từ con
  const handleRefresh = async () => {
    await refresh();
  };

  const columns = [
    "STT",
    <div className="flex items-center gap-1" key="value">
      <span>Bước chống</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    "Sửa",
  ];
  
  const columnWidths = [6, 84, 10];

  const items = [
    { label: "Hộ chiếu, Sđ, Sc", path: "/Specification01" },
    { label: "Độ kiên cố than, đá (f)", path: "/Specification02" },
    { label: "Tỷ lệ đá kẹp (Ckep)", path: "/Specification03" },
    { label: "Chèn", path: "/Specification04" },
    { label: "Bước chống", path: "/Specification05" },
  ];

  const tableData =
    data?.map((row, index) => [
      index + 1,
      row.value || "",
      <PencilButton
        key={row.id}
        id={row.id}
        // ✅ Truyền handleRefresh
        editElement={<Specification05Edit id={row.id} onSuccess={handleRefresh} />}
      />,
    ]) || [];

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
        
        {error ? (
          <div className="text-center text-red-500 py-10">
            Lỗi: {error.toString()}
          </div>
        ) : (
          <AdvancedTable
            title01="Danh mục / Thông số / Bước chống"
            title="Thông số"
            columns={columns}
            columnWidths={columnWidths}
            data={tableData}
            // ✅ Truyền handleRefresh
            createElement={<Specification05Input onSuccess={handleRefresh} />} 
            navbarMiniItems={items}
            basePath={basePath}
            // ✅ Truyền handleRefresh
            onDeleted={handleRefresh} 
            columnLefts={['undefined','undefined','undefined']}
          />
        )}
        
        {/* Loading Overlay chuẩn */}
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

export default Specification05;