import CustomDataDisplay, { type ColumnDefinition } from './layout_price';
import './layout_price.css'; // File CSS chính của bạn

// 1. Định nghĩa dữ liệu cho thông tin chung
const generalInfoData = [
  { label: 'Mã sản phẩm', value: 'KLC' },
  { label: 'Tên sản phẩm', value: 'Khẩu lò chợ II-5-6' },
  { label: 'Chi phí điện năng thực hiện', value: '90.470' },
];

// 2. Định nghĩa cho Bảng 1 (Công đoạn)
const phaseHeaders: ColumnDefinition[] = [
  { key: 'code', label: 'Mã công đoạn', width: '25%' },
  { key: 'name', label: 'Tên công đoạn', width: '48%' },
  { key: 'unit', label: 'ĐVT', width: '12%', textAlign: 'left' },
  { key: 'quantity', label: 'Sản lượng', width: '15%', textAlign: 'left' },
];

const phaseData = [
  { code: 'DL', name: 'Đào lò', unit: 'mét', quantity: 6 },
  // Thêm các hàng khác nếu có
];

// 3. Định nghĩa cho Bảng 2 (Thiết bị)
const equipmentHeaders: ColumnDefinition[] = [
  { key: 'name', label: 'Tên thiết bị', width: '25%' },
  { key: 'unit', label: 'ĐVT', width: '5%' },
  { key: 'quantity', label: 'Số lượng', width: '8%' , textAlign: 'center'},
  { key: 'k1', label: 'K1', width: '5%' },
  { key: 'k2', label: 'K2', width: '5%' },
  { key: 'k3', label: 'K3', width: '5%' },
  { key: 'k4', label: 'K4', width: '5%' },
  { key: 'k5', label: 'K5', width: '5%' },
  { key: 'k6', label: 'K6', width: '5%' },
  { key: 'k7', label: 'K7', width: '5%' },
  { key: 'price', label: 'Đơn giá', width: '12%' },
  { key: 'cost', label: 'Chi phí thực hiện', width: '15%' },
];

const equipmentData = [
  {
    name: 'Máy cào SGB 520/40(số 03)',
    unit: 'Cái',
    quantity: 1,
    k1: 0.9,
    k2: 1.0,
    k3: 0.6,
    k4: 0.6,
    k5: 0.9,
    k6: 0.5,
    k7: 1,
    price: '124.102',
    cost: '30.157',
  },
  {
    name: 'Máy cào SGB 520/40(số 03)',
    unit: 'Cái',
    quantity: 1,
    k1: 0.9,
    k2: 1.0,
    k3: 0.6,
    k4: 0.6,
    k5: 0.9,
    k6: 0.5,
    k7: 1,
    price: '124.102',
    cost: '30.157',
  },
  {
    name: 'Máy cào SGB 520/40(số 03)',
    unit: 'Cái',
    quantity: 1,
    k1: 0.9,
    k2: 1.0,
    k3: 0.6,
    k4: 0.6,
    k5: 0.9,
    k6: 0.5,
    k7: 1,
    price: '124.102',
    cost: '30.157',
  },
];

function Electric_Price() {
  return (
    <div style={{ paddingLeft: '8.5%', paddingRight: "8.5%" }}>
      <CustomDataDisplay
        generalInfo={generalInfoData}
        sections={[
          {
            headers: phaseHeaders,
            data: phaseData,
            headerBackgroundColor: '#f0f2f5', // Màu xám nhạt như trong ảnh
          },
          {
            headers: equipmentHeaders,
            data: equipmentData,
            // Không set màu, sẽ dùng màu mặc định trong CSS
          },
        ]}
      />
    </div>
  );
}

export default Electric_Price;