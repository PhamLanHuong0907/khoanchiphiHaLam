import React from "react";
import Layout from "../../../layout/layout_filter";
import AdvancedTable from "../../../components/bodytable";
import PencilButton from "../../../components/PencilButtons";
import { ChevronsUpDown } from "lucide-react";
import ProductionStepGroupEdit from "./ProductionStepGroupEdit";
import ProductionStepGroupInput from "./ProductionStepGroupInput";
import { useApi } from "../../../hooks/useFetchData";

const ProductionStepGroup: React.FC = () => {
  // ✅ Tách rõ hai endpoint (Đã tối ưu)
  const basePath = `/api/process/processgroup`; // dùng cho POST / PUT / DELETE
  const fetchPath = `${basePath}?pageIndex=1&pageSize=1000`; // dùng cho GET

  // ✅ Gọi API danh sách (Đã tối ưu)
  
  const { data, loading, error, refresh } = useApi<any>(fetchPath);

  // ✅ Cấu hình cột bảng
  const columns = [
    "STT",
    <div className="flex items-center gap-1" key="code">
      <span>Mã nhóm công đoạn sản xuất</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    <div className="flex items-center gap-1" key="name">
      <span>Tên nhóm công đoạn sản xuất</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    "Sửa",
  ];
  const columnWidths = [6, 31, 56, 4];

  // ✅ Chuẩn hóa dữ liệu bảng từ API
  const tableData =
    data && Array.isArray(data)
      
      ? data.map((row: any, index: number) => [
          index + 1,
          row.code,
          row.name,
          <PencilButton
            key={row.id}
            id={row.id}
            editElement={
              <ProductionStepGroupEdit id={row.id} onSuccess={refresh} />
            }
          />,
        ])
      : [];

  // ✅ Danh mục điều hướng phụ (navbarMini)
  const items = [
    { label: "Nhóm công đoạn sản xuất", path: "/ProductionStepGroup" },
    { label: "Công đoạn sản xuất", path: "/ProductionStep" },
  ];

  return (
    <Layout>
      <div className="p-6">
        <style>{`
          th > div {
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
          th > div span:last-child {
            font-size: 5px;
            color: gray;
          }
        `}</style>

        {/* SỬA ĐỔI: Cập nhật logic return */}

        {/* 1. Ưu tiên hiển thị lỗi */}
        {error ? (
          <div className="text-center text-red-500 py-10">Lỗi: {error}</div>
        ) : (
          /* 2. Luôn hiển thị bảng (ngay cả khi đang tải) */
          <AdvancedTable
            title01="Danh mục / Công đoạn sản xuất / Nhóm công đoạn sản xuất"
            title="Công đoạn sản xuất"
            columns={columns}
            columnWidths={columnWidths}
            data={tableData}
            createElement={<ProductionStepGroupInput onSuccess={refresh} />}
            navbarMiniItems={items}
            basePath={basePath} // ✅ dùng cho PUT / DELETE / POST
            onDeleted={refresh} // ✅ refresh sau khi xóa
            columnLefts={['undefined','undefined','undefined','undefined']}
          />
        )}
        
        {/* 3. Hiển thị loading overlay riêng biệt */}
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
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductionStepGroup;