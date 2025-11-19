import React from "react"; 
import Layout from "../../../../layout/layout_filter";
import AdvancedTable from "../../../../components/bodytable";
import PencilButton from "../../../../components/PencilButtons";
import Specification03Edit from "./Specification03Edit";
import Specification03Input from "./Specification03Input";
import { ChevronsUpDown } from "lucide-react"; 
import { useApi } from "../../../../hooks/useFetchData";

// 1. Định nghĩa Interface (Thêm trường mới)
interface StoneClampRatio {
  id: string;
  value: string;
  coefficientValue: number;
}

const Specification03: React.FC = () => {
  // 2. Khai báo API 
  const basePath = `/api/product/stoneclampratio`;
  const fetchPath = `${basePath}?pageIndex=1&pageSize=1000`;
  const { data, loading, error, refresh } = useApi<StoneClampRatio>(fetchPath);

  // ✅ Wrapper Async để đảm bảo việc await hoạt động đúng từ con
  const handleRefresh = async () => {
    await refresh();
  };

  // 4. Cập nhật Columns (Thêm cột mới)
  const columns = [
    "STT",
    <div className="flex items-center gap-1" key="value">
      <span>Tỷ lệ đá kẹp (Ckep)</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    <div className="flex items-center gap-1" key="adjFactor">
      <span>Hệ số điều chỉnh định mức</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    "Sửa",
  ];
  // 5. Cập nhật columnWidths (Phân bổ lại)
  const columnWidths = [6, 40, 44, 10]; 

  // Navbar mini (giữ nguyên)
  const items = [
    { label: "Hộ chiếu, Sđ, Sc", path: "/Specification01" },
    { label: "Độ kiên cố than, đá (f)", path: "/Specification02" },
    { label: "Tỷ lệ đá kẹp (Ckep)", path: "/Specification03" },
    { label: "Chèn", path: "/Specification04" },
    { label: "Bước chống", path: "/Specification05" },
  ];

  // 6. Map dữ liệu từ API (Thêm dữ liệu cho cột mới)
  const tableData =
    data?.map((row, index) => [
      index + 1,
      row.value || "",
      row.coefficientValue?.toLocaleString() || "", // Dữ liệu cho cột mới
      <PencilButton
        key={row.id}
        id={row.id}
        // 'refresh' này là từ hook
        editElement={<Specification03Edit id={row.id} onSuccess={handleRefresh} />}
      />,
    ]) || [];

  // 7. Biến loading/error
  const isLoading = loading;
  const anyError = error;

  return (
    <Layout>
      <div className="p-6 relative min-h-[500px]">
        
        <style>{`
          th > div { display: inline-flex; align-items: center; gap: 3px; }
          th > div span:last-child { font-size: 5px; color: gray; }
        `}</style>
        
        {/* 8. Xử lý UI */}
        {anyError ? (
          <div className="text-center text-red-500 py-10">
            Lỗi: {anyError.toString()}
          </div>
        ) : (
          /* 2. Luôn hiển thị bảng (ngay cả khi đang tải) */
          <AdvancedTable
            title01="Danh mục / Thông số / Tỷ lệ đá kẹp"
            title="Thông số"
            columns={columns}
            columnWidths={columnWidths}
            data={tableData} // Dùng dữ liệu động
            // 'refresh' này là từ hook
            createElement={<Specification03Input onSuccess={handleRefresh} />} 
            navbarMiniItems={items}
            basePath={basePath} // Thêm basePath
            // 'refresh' này là từ hook
            onDeleted={handleRefresh} 
            columnLefts={['undefined','undefined','undefined','undefined']}
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

export default Specification03;