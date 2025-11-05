import CustomDataDisplay, { type ColumnDefinition } from './layout_price';
import './layout_price.css'; // File CSS chính của bạn

// 1. Định nghĩa dữ liệu cho thông tin chung
const generalInfoData = [
  { label: 'Mã sản phẩm', value: 'KLC' },
  { label: 'Tên sản phẩm', value: 'Khẩu lò chợ II-5-6' },
];

// 2. Định nghĩa cho Bảng 1 (Công đoạn)
const phaseHeaders: ColumnDefinition[] = [
  { key: 'code', label: 'Mã nhóm công đoạn', width: '15%' },
  { key: 'name', label: '', width: '43%' },
  { key: 'unit', label: 'ĐVT', width: '5%', textAlign: 'left' },
  { key: 'quantity', label: 'Sản lượng', width: '23%', textAlign: 'left' },
  { key: 'quantity', label: 'Chi phí thực hiện', width: '15%', textAlign: 'left' },
];

const phaseData = [
  { code: 'DL', name: '', unit: 'mét', quantity: 6 },
  // Thêm các hàng khác nếu có
];

// 3. Định nghĩa cho Bảng 2 (Thiết bị)
const equipmentHeaders: ColumnDefinition[] = [
  { key: 'WorkCode_ID', label: 'Mã giao khoán', width: '15%' },
  { key: 'Material_ID', label: 'Mã vật tư', width: '15%' },
  { key: 'Material_name', label: 'Tên vật tư, tài sản', width: '28%' , textAlign: 'left'},
  { key: 'Unit', label: 'ĐVT', width: '5%' },
  { key: 'quantity', label: 'Số lượng', width: '8%' },
  { key: 'price', label: 'Đơn giá bình quân', width: '15%' },
  { key: 'total', label: 'Thành tiền', width: '15%' },
];

const equipmentData = [
  {
    WorkCode_ID: 'KT12',
    Material_ID: '',
    Material_name: 'Thuốc nổ NTLT-2',
    Unit: 'kg',
    quantity: '',
    price: '',
    total: '',
  },
  {
    WorkCode_ID: '',
    Material_ID: 'TN10006VNMM',
    Material_name: 'Thuốc nổ nhữ tương an toàn dùng cho mỏ hầm lò có khí nổ (NTLT-2)',
    Unit: 'kg',
    quantity: 460,
    price: 0.6,
    total: 0.6,
  },
  {
    WorkCode_ID: '',
    Material_ID: 'TN10003VNM2',
    Material_name: 'Đầu nổ điện dùng cho mỏ hầm lò (ĐNE-2)',
    Unit: 'kg',
    quantity: 469.2,
    price: 0.6,
    total: 0.6,
  },
];

function Material_Price() {
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

export default Material_Price;