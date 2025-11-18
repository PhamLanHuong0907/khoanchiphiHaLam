import React from "react"; // Bỏ 'useEffect' vì không cần nữa
import Layout from "../../../../layout/layout_filter";
import AdvancedTable from "../../../../components/bodytable";
import PencilButton from "../../../../components/PencilButtons";
import Specification02Edit from "./Specification02Edit";
import Specification02Input from "./Specification02Input";
import { ChevronsUpDown } from "lucide-react";
import { useApi } from "../../../../hooks/useFetchData";

// 1. Định nghĩa Interface
interface Hardness {
  id: string;
  value: string;
}

const Specification02: React.FC = () => {
  // 2. Khai báo API (Giống cấu trúc file Unit)
  const basePath = `/api/product/hardness`;
  const fetchPath = `${basePath}?pageIndex=1&pageSize=1000`;
  // Thay đổi ở đây: Bỏ 'fetchData', dùng 'refresh'
  const { data, loading, error, refresh } = useApi<Hardness>(fetchPath);

  // 3. Bỏ 'useEffect' và 'refresh' thủ công
  // (useApi sẽ tự động fetch lần đầu)

  // 4. Cập nhật Columns (giữ nguyên)
  const columns = [
    "STT",
    <div className="flex items-center gap-1" key="value">
      <span>Độ kiên cố than, đá (f)</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    "Sửa",
  ];
  // 5. Cập nhật columnWidths (giữ nguyên)
  const columnWidths = [6, 84, 10];

  // Navbar mini (giữ nguyên)
  const items = [
    { label: "Hộ chiếu, Sđ, Sc", path: "/Specification01" },
    { label: "Độ kiên cố than, đá (f)", path: "/Specification02" },
    { label: "Tỷ lệ đá kẹp (Ckep)", path: "/Specification03" },
    { label: "Chèn", path: "/Specification04" },
    { label: "Bước chống", path: "/Specification05" },
  ];

  // 6. Map dữ liệu từ API (giữ nguyên)
  const tableData =
    data?.map((row, index) => [
      index + 1,
      row.value || "",
      <PencilButton
        key={row.id}
        id={row.id}
        // Dùng 'refresh' lấy từ hook
        editElement={<Specification02Edit id={row.id} onSuccess={refresh} />}
      />,
    ]) || [];

  // 7. Biến loading/error (đổi tên cho nhất quán)
  const isLoading = loading;
  const anyError = error;

  return (
    <Layout>
      <div className="p-6">
        {/* Thêm style cho header (giữ nguyên) */}
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
        
        {/* 8. Xử lý UI (giữ nguyên logic từ lần sửa trước) */}
        
        {/* 1. Ưu tiên hiển thị lỗi */}
        {anyError ? (
          <div className="text-center text-red-500 py-10">
            Lỗi: {anyError.toString()}
          </div>
        ) : (
          /* 2. Luôn hiển thị bảng (ngay cả khi đang tải) */
          <AdvancedTable
            title01="Danh mục / Thông số / Độ kiên cố than, đá"
            title="Thông số"
            columns={columns}
            columnWidths={columnWidths}
            data={tableData}
            // Dùng 'refresh' lấy từ hook
            createElement={<Specification02Input onSuccess={refresh} />} 
            navbarMiniItems={items}
            basePath={basePath}
            // Dùng 'refresh' lấy từ hook
            onDeleted={refresh} 
            columnLefts={['undefined','undefined','undefined','undefined']} 
          />
        )}
        
        {/* 3. Hiển thị loading overlay riêng biệt */}
        {isLoading && (
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

export default Specification02;