import CustomDataDisplay, { type ColumnDefinition } from './layout_price';
import './layout_price.css'; // File CSS chính của bạn

// 1. Định nghĩa dữ liệu cho thông tin chung
const generalInfoData = [
  { label: 'Mã sản phẩm', value: 'KLC' },
  { label: 'Tên sản phẩm', value: 'Khẩu lò chợ II-5-6' },
  { label: 'Chi phí vật liệu kế hoạch', value: '23.389.496,96' },
];

// 2. Định nghĩa cho Bảng 1 (Công đoạn)
const phaseHeaders: ColumnDefinition[] = [
  { key: 'code', label: 'Mã công đoạn', width: '11%' },
  { key: 'name', label: 'Tên công đoạn', width: '39%' },
  { key: 'unit', label: 'ĐVT', width: '5%', textAlign: 'left' },
  { key: 'quantity', label: 'Sản lượng', width: '10%', textAlign: 'left' },
  { key: 'material_code', label: 'Mã định mức vật liệu', width: '18%', textAlign: 'left' },
  { key: 'stone_scale', label: 'Tỷ lệ đá kẹp', width: '17%', textAlign: 'left' },
];

const phaseData = [
  { code: 'DL', name: 'Đào lò', unit: 'mét', quantity: 6, material_code: 'T01', stone_scale: '>20%' },
  // Thêm các hàng khác nếu có
];

// 3. Định nghĩa cho Bảng 2 (Thiết bị)
const equipmentHeaders: ColumnDefinition[] = [
  { key: 'WorkCode_ID', label: 'Mã giao khoán', width: '11%' },
  { key: 'Material_ID', label: 'Mã vật tư', width: '11%' },
  { key: 'Material_name', label: 'Tên vật tư, tài sản', width: '19%' , textAlign: 'left'},
  { key: 'quantity', label: 'Số lượng', width: '9%' },
  { key: 'Unit', label: 'ĐVT', width: '5%' },
  { key: 'origin_adjustment', label: 'Định mức gốc', width: '10%' },
  { key: 'adjustment', label: <>Hệ số điều chỉnh định mức</>, width: '12%' },
  { key: 'new_adjustment', label: 'Định mức', width: '6%' },
  { key: 'price', label: 'Đơn giá bình quân', width: '9%' },
  { key: 'total', label: 'Chi phí kế hoạch', width: '8%' },
];

const equipmentData = [
  {
    WorkCode_ID: 'KT12',
    Material_ID: '',
    Material_name: 'Thuốc nổ NTLT-2',
    quantity: '',
    Unit: 'kg',
    origin_adjustment: '',
    adjustment: '',
    new_adjustment: '',
    price: '',
    total: '',
  },
  {
    WorkCode_ID: '',
    Material_ID: 'TN10006VNMM',
    Material_name: 'Thuốc nổ nhữ tương an toàn dùng cho mỏ hầm lò có khí nổ (NTLT-2)',
    quantity: 460,
    Unit: 'kg',
    origin_adjustment: 0.6,
    adjustment: 1,
    new_adjustment: 0.6,
    price: 0.6,
    total: 0.6,
  },
  {
    WorkCode_ID: '',
    Material_ID: 'TN10003VNM2',
    Material_name: 'Đầu nổ điện dùng cho mỏ hầm lò (ĐNE-2)',
    quantity: 469.2,
    Unit: 'kg',
    origin_adjustment: 0.6,
    adjustment: 1,
    new_adjustment: 0.6,
    price: 0.6,
    total: 0.6,
  },
   {
    WorkCode_ID: 'KT12',
    Material_ID: '',
    Material_name: 'Thuốc nổ NTLT-2',
    quantity: '',
    Unit: 'kg',
    origin_adjustment: '',
    adjustment: '',
    new_adjustment: '',
    price: '',
    total: '',
  },
  {
    WorkCode_ID: '',
    Material_ID: 'TN10006VNMM',
    Material_name: 'Thuốc nổ nhữ tương an toàn dùng cho mỏ hầm lò có khí nổ (NTLT-2)',
    quantity: 460,
    Unit: 'kg',
    origin_adjustment: 0.6,
    adjustment: 1,
    new_adjustment: 0.6,
    price: 0.6,
    total: 0.6,
  },
  {
    WorkCode_ID: '',
    Material_ID: 'TN10003VNM2',
    Material_name: 'Đầu nổ điện dùng cho mỏ hầm lò (ĐNE-2)',
    quantity: 469.2,
    Unit: 'kg',
    origin_adjustment: 0.6,
    adjustment: 1,
    new_adjustment: 0.6,
    price: 0.6,
    total: 0.6,
  },
];

function Material_PlanPrice() {
  return (
    <div style={{ paddingLeft: '8.5%', paddingRight: "8.5%" }}>
      <CustomDataDisplay
        generalInfo={generalInfoData}
        sections={[
          {
            headers: phaseHeaders,
            data: phaseData,
            headerBackgroundColor: '#f1f1f1', // Màu xám nhạt như trong ảnh
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

export default Material_PlanPrice;