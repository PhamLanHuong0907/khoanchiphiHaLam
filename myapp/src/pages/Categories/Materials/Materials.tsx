import React from "react"; 
import Layout from "../../../layout/layout_filter";
import AdvancedTable from "../../../components/bodytable";
import PencilButton from "../../../components/PencilButtons";
import { ChevronsUpDown } from "lucide-react";
import MaterialsInput from "./MaterialsInput";
import MaterialsEdit from "./MaterialsEdit";
import { useApi } from "../../../hooks/useFetchData";

// SỬA ĐỔI: Interface này phải khớp với JSON API trả về
interface Material {
  id: string;
  code: string;
  name: string;
  assigmentCodeId: string;
  assigmentCode: string; // <-- Trường mới
  unitOfMeasureId: string;
  unitOfMeasureName: string; // <-- Trường mới
  costAmmount: number; // <-- Trường mới (Lưu ý tên "Ammount")
}

const Materials: React.FC = () => {
  const basePath = `/api/catalog/material`;
  const fetchPath = `${basePath}?pageIndex=1&pageSize=1000`;
  const { data, loading, error, refresh } = useApi<Material>(fetchPath);

  // ✅ Helper Async để đảm bảo việc await hoạt động đúng từ con
  const handleRefresh = async () => {
    await refresh();
  };

  // ====== Định nghĩa Cột (Giữ nguyên) ======
  const columns = [
    "STT",
    <div className="flex items-center gap-1" key="assigmentCode">
      <span>Mã giao khoán</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    <div className="flex items-center gap-1" key="code">
      <span>Mã vật tư, tài sản</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    <div className="flex items-center gap-1" key="name">
      <span>Tên vật tư, tài sản</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    "ĐVT",
    "Đơn giá",
    "Sửa",
  ];

  const columnWidths = [6, 15, 15, 38, 9, 13, 4];

  // Map dữ liệu từ API
  const tableData =
    data?.map((row, index) => [
      index + 1,
      row.assigmentCode || "", // Đọc trực tiếp
      row.code || "",
      row.name || "",
      row.unitOfMeasureName || "", // Đọc trực tiếp
      row.costAmmount?.toLocaleString() || "0", 
      <PencilButton
        key={row.id}
        id={row.id}
        // ✅ Truyền handleRefresh
        editElement={<MaterialsEdit id={row.id} onSuccess={handleRefresh} />}
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
        
        {/* 1. Ưu tiên hiển thị lỗi */}
        {anyError ? (
          <div className="text-center text-red-500 py-10">Lỗi: {anyError.toString()}</div>
        ) : (
          /* 2. Luôn hiển thị bảng (ngay cả khi đang tải) */
          <AdvancedTable
            title01="Danh mục / Vật tư, tài sản"
            title="Vật tư, tài sản"
            columns={columns}
            columnWidths={columnWidths}
            data={tableData}
            // ✅ Truyền handleRefresh
            createElement={<MaterialsInput onSuccess={handleRefresh} />}
            basePath={basePath}
            // ✅ Truyền handleRefresh
            onDeleted={handleRefresh}
            columnLefts={['undefined','undefined','undefined','undefined',5.5,'undefined','undefined']}
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

export default Materials;