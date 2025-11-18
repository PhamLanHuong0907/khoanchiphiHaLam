import React from "react"; // Bỏ useEffect
import Layout from "../../../../layout/layout_filter";
import AdvancedTable from "../../../../components/bodytable";
import PencilButton from "../../../../components/PencilButtons";
// Sửa: Bỏ LabelWithIcon vì dùng div
// import LabelWithIcon from "../../../../components/label"; 
import { ChevronsUpDown } from "lucide-react"; // Thêm
import Specification01Edit from "./Specification01Edit";
import Specification01Input from "./Specification01Input";
import { useApi } from "../../../../hooks/useFetchData"; // Thêm


// 1. Định nghĩa Interface dựa trên JSON
interface Passport {
  id: string;
  name: string;
  sd: number;
  sdMax: number;
  sc: number;
}

const Specification01: React.FC = () => {
  // 2. Khai báo API (Giống cấu trúc Unit/Spec02)
  const basePath = `api/product/passport`;
   const fetchPath = `${basePath}?pageIndex=1&pageSize=1000`;
  // Thay đổi ở đây: Lấy 'refresh' trực tiếp, bỏ 'fetchData'
  const { data, loading, error, refresh } = useApi<Passport>(fetchPath);

  // 3. Bỏ 'useEffect' và 'refresh' thủ công
  // (useApi sẽ tự động fetch lần đầu)

  // 4. Cập nhật Columns (giữ nguyên)
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
  // 5. Cập nhật columnWidths (6 cột)
  const columnWidths = [6, 39, 30, 20, 4];

  // (items giữ nguyên)
  const items = [
    { label: "Hộ chiếu, Sđ, Sc", path: "/Specification01" },
    { label: "Độ kiên cố than, đá", path: "/Specification02" },
    { label: "Tỷ lệ đá kẹp (Ckep)", path: "/Specification03" },
    { label: "Chèn", path: "/Specification04" },
    { label: "Bước chống", path: "/Specification05" },
  ];

  // 6. Map dữ liệu từ API
  const tableData =
    data?.map((row, index) => [
      index + 1,
      row.name || "",
      row.sd?.toLocaleString() || "0",
      row.sc?.toLocaleString() || "0",
      <PencilButton
        key={row.id}
        id={row.id}
        // 'refresh' này giờ là từ hook
        editElement={<Specification01Edit id={row.id} onSuccess={refresh} />}
      />,
    ]) || [];

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
        
        {/* 7. Xử lý UI (Logic này đã đúng) */}
        
        {/* 1. Ưu tiên hiển thị lỗi */}
        {anyError ? (
          <div className="text-center text-red-500 py-10">
            Lỗi: {anyError.toString()}
          </div>
        ) : (
          /* 2. Luôn hiển thị bảng (ngay cả khi đang tải) */
          <AdvancedTable
            title01="Danh mục / Thông số / Hộ chiếu Sđ, Sc"
            title="Thông số"
            columns={columns}
            columnWidths={columnWidths}
            data={tableData} // Dùng dữ liệu động
            // 'refresh' này giờ là từ hook
            createElement={<Specification01Input onSuccess={refresh} />} 
            navbarMiniItems={items}
            basePath={basePath} // Thêm basePath
            // 'refresh' này giờ là từ hook
            onDeleted={refresh} 
            columnLefts={['undefined','undefined','undefined','undefined','undefined','undefined','undefined','undefined']}
          />
        )}
        
        {/* 3. Hiển thị loading overlay riêng biệt (Logic này đã đúng) */}
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

export default Specification01;