import React from "react"; // Bỏ useEffect
import Layout from "../../../../layout/layout_filter";
import AdvancedTable from "../../../../components/bodytable";
import PencilButton from "../../../../components/PencilButtons";
import Specification04Input from "./Specification04Input";
import Specification04Edit from "./Specification04Edit";
// import LabelWithIcon from "../../../../components/label"; // Bỏ
import { ChevronsUpDown } from "lucide-react"; // Thêm
import { useApi } from "../../../../hooks/useFetchData"; // Thêm

// 1. Định nghĩa Interface
interface InsertItem {
  id: string;
  value: string;
}

const Specification04: React.FC = () => {
  // 2. Khai báo API (Thay đổi)
  const basePath = `/api/product/insertitem`;
  const fetchPath = `${basePath}?pageIndex=1&pageSize=1000`;
  // Lấy 'refresh' trực tiếp, bỏ 'fetchData'
  const { data, loading, error, refresh } = useApi<InsertItem>(fetchPath);

  // 3. Bỏ 'useEffect' và 'refresh' thủ công
  // (useApi sẽ tự động fetch lần đầu)

  // 4. Cập nhật Columns (giữ nguyên)
  const columns = [
    "STT",
    <div className="flex items-center gap-1" key="value">
      <span>Chèn</span>
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

  // 6. Map dữ liệu từ API
  const tableData =
    data?.map((row, index) => [
      index + 1,
      row.value || "",
      <PencilButton
        key={row.id}
        id={row.id}
        // 'refresh' này là từ hook
        editElement={<Specification04Edit id={row.id} onSuccess={refresh} />}
      />,
    ]) || [];

  // 7. Biến loading/error
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
        
        {/* 8. Xử lý UI - Đã cập nhật */}
        
        {/* 1. Ưu tiên hiển thị lỗi */}
        {anyError ? (
          <div className="text-center text-red-500 py-10">
            Lỗi: {anyError.toString()}
          </div>
        ) : (
          /* 2. Luôn hiển thị bảng (ngay cả khi đang tải) */
          <AdvancedTable
            title01="Danh mục / Thông số / Chèn"
            title="Thông số"
            columns={columns}
            columnWidths={columnWidths}
            data={tableData} // Dùng dữ liệu động
            // 'refresh' này là từ hook
            createElement={<Specification04Input onSuccess={refresh} />} 
            navbarMiniItems={items}
            basePath={basePath} // Thêm basePath
            // 'refresh' này là từ hook
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

export default Specification04;