import React from "react"; // Bỏ useEffect
import Layout from "../../../layout/layout_filter";
import AdvancedTable from "../../../components/bodytable";
import PencilButton from "../../../components/PencilButtons";
import { ChevronsUpDown } from "lucide-react";
import EquipmentInput from "./EquipmentInput";
import EquipmentEdit from "./EquipmentEdit";
import { useApi } from "../../../hooks/useFetchData";

// SỬA ĐỔI: Cập nhật Interface theo API
interface EquipmentItem {
  id: string;
  code: string;
  name: string;
  unitOfMeasureId: string;
  unitOfMeasureName: string; 
  currentPrice: number; // Thêm trường này
}

const Equipment: React.FC = () => {
  const basePath = `/api/catalog/equipment`;
  const fetchPath = `${basePath}?pageIndex=1&pageSize=1000`;
  // SỬA ĐỔI: Lấy 'refresh' trực tiếp, bỏ 'fetchData'
  const { data, loading, error, refresh } = useApi<EquipmentItem>(fetchPath);

  // ====== Cột bảng ======
  const columns = [
    "STT",
    <div className="flex items-center gap-1" key="code">
      <span>Mã thiết bị</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    <div className="flex items-center gap-1" key="name">
      <span>Tên thiết bị</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    "ĐVT",
    // SỬA ĐỔI: Thêm cột Đơn giá
    <div className="flex items-center gap-1" key="price">
      <span>Đơn giá</span>
      <ChevronsUpDown size={13} className="text-gray-100 text-xs" />
    </div>,
    "Sửa",
  ];

  // SỬA ĐỔI: Cân đối lại độ rộng cột (Tổng = 100%)
  const columnWidths = [6, 15, 45, 10, 19, 5];

  // ====== Dữ liệu bảng ======
  const tableData =
    data?.map((row, index) => [
      index + 1,
      row.code || "",
      row.name || "",
      row.unitOfMeasureName || "",
      // SỬA ĐỔI: Thêm dữ liệu Đơn giá (định dạng số vi-VN)
      row.currentPrice?.toLocaleString('vi-VN') || "0", 
      <PencilButton
        key={row.id}
        id={row.id}
        // 'refresh' này là từ hook
        editElement={<EquipmentEdit id={row.id} onSuccess={refresh} />}
      />,
    ]) || [];

  // SỬA ĐỔI: Cập nhật columnLefts cho khớp số lượng cột (6 cột)
  // Cột ĐVT và Đơn giá có thể cần căn chỉnh, ở đây để undefined theo mặc định
  const columnLefts = ['undefined', 'undefined', 'undefined', 'undefined', 'undefined', 'undefined'];

  return (
    <Layout>
      <div className="p-6">
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

        {/* SỬA ĐỔI: Cập nhật logic return */}

        {/* 1. Ưu tiên hiển thị lỗi */}
        {error ? (
          <div className="text-center text-red-500 py-10">
            Lỗi: {error.toString()}
          </div>
        ) : (
          /* 2. Luôn hiển thị bảng (ngay cả khi đang tải) */
          <AdvancedTable
            title01="Danh mục / Thiết bị"
            title="Thiết bị"
            columns={columns}
            columnWidths={columnWidths}
            data={tableData}
            // 'refresh' này là từ hook
            createElement={<EquipmentInput onSuccess={refresh} />}
            basePath={basePath}
            // 'refresh' này là từ hook
            onDeleted={refresh}
            columnLefts={columnLefts}
          />
        )}
        
        {/* 3. Hiển thị loading overlay riêng biệt */}
        {loading && (
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

export default Equipment;