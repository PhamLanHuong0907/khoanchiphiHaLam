import React from "react";

interface SlideRailItem {
  id: number;
  name: string;
  unit: string;
  price: string; // Đã thêm cột này
  time: string;
  number_vt: string;
  number_sl: string;
  dinhmuc: string;
  total: string;
}

interface SlideRailGroup {
  items: SlideRailItem[];
}

interface SlideRailGroupTableProps {
  data: SlideRailGroup[];
}

const SlideRailGroupTable: React.FC<SlideRailGroupTableProps> = ({ data }) => {
  return (
    <div
      className="SlideRail-table-container"
      style={{
        width: "100%",
        backgroundColor: "white",
        fontFamily: "Roboto, sans-serif",
        border: "1px solid #dcdcdc",
        borderRadius: "0 0 8px 8px",
      }}
    >
      {/* Table */}
      <table
        className="SlideRail-table"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead style={{ border: "none", gap: "0" }}>
          <tr
            style={{
              width: "100%",
              height: "10px",
              border: "none",
              backgroundColor: "white",
            }}
          ></tr>
          <tr style={{ fontSize: "14px" }}>
            <th
              style={{
                width: "6.5%",
                
                border: "rgba(241, 242, 245, 1)",
                backgroundColor: "rgba(241, 242, 245, 1)",
                
                textAlign: "left",
                paddingLeft: "2.5%",
              }}
            >
              STT
            </th>
            <th
              style={{
                width: "16.5%",
                textAlign: "left",
                border: "none",
                backgroundColor: "rgba(241, 242, 245, 1)",
              }}
            >
              Tên phụ tùng
            </th>
            <th
              style={{
                width: "5%",
                textAlign: "left",
                border: "none",
                backgroundColor: "rgba(241, 242, 245, 1)",
              }}
            >
              ĐVT
            </th>
            {/* THÊM CỘT NÀY (cho item.price) */}
            <th
              style={{
                width: "8%",
                textAlign: "left",
                border: "none",
                backgroundColor: "rgba(241, 242, 245, 1)",
              }}
            >
              Đơn giá
            </th>
            <th
              style={{
                width: "10%",
                textAlign: "left",
                border: "none",
                backgroundColor: "rgba(241, 242, 245, 1)",
              }}
            >
              Định mức thời gian thay thế <br /> (tháng)
            </th>
            <th
              style={{
                width: "10%",
                textAlign: "left",
                border: "none",
                backgroundColor: "rgba(241, 242, 245, 1)",
              }}
            >
              Sản lượng vật tư 1 lần thay thế <br /> (tháng)
            </th>
            <th
              style={{
                width: "12%",
                textAlign: "left",
                border: "none",
                backgroundColor: "rgba(241, 242, 245, 1)",
              }}
            >
              Sản lượng đào lò <br /> bình quân tháng <br /> (m)
            </th>
            <th
              style={{
                width: "15%",
                textAlign: "left",
                border: "none",
                backgroundColor: "rgba(241, 242, 245, 1)",
              }}
            >
              Định mức vật tư SCTX cho <br />1 thiết bị / 1 mét lò đào
            </th>
            <th
              style={{
                width: "20%",
                border: "none",
                textAlign: "left",
                backgroundColor: "rgba(241, 242, 245, 1)",
              }}
            >
              Chi phí đầu tư SCTX cho <br />1 thiết bị / 1 mét lò đào <br />
              (đ/m)
            </th>
          </tr>
        </thead>
        <tbody style={{}}>
          {data.map((group, groupIdx) => (
            // Thêm key cho React.Fragment
            <React.Fragment key={groupIdx}>
              {group.items.map((item) => (
                // Sử dụng item.id làm key sẽ tốt hơn idx nếu nó là duy nhất
                <tr key={item.id} className="item-row">
                  {/* SẮP XẾP LẠI THỨ TỰ CÁC CỘT CHO ĐÚNG */}
                  <td style={{ textAlign: "left", paddingLeft:"3.1%", height: "22px" }}>
                    {item.id}
                  </td>
                  <td style={{ textAlign: "left", height: "22px" }}>
                    {item.name}
                  </td>
                  <td style={{ textAlign: "left", height: "22px" }}>
                    {item.unit}
                  </td>
                  {/* CỘT 4: item.price */}
                  <td style={{ textAlign: "left", height: "22px" }}>
                    {item.price}
                  </td>
                  {/* CỘT 5: item.time */}
                  <td
                    style={{
                      textAlign: "left",
                      paddingLeft: "1%",
                      height: "22px",
                    }}
                  >
                    {item.time}
                  </td>
                  {/* CỘT 6: item.number_vt */}
                  <td
                    style={{
                      textAlign: "left",
                      paddingLeft: "1%",
                      height: "22px",
                    }}
                  >
                    {item.number_vt}
                  </td>
                  {/* CỘN 7: item.number_sl */}
                  <td
                    style={{
                      textAlign: "left",
                      paddingLeft: "1%",
                      height: "22px",
                    }}
                  >
                    {item.number_sl}
                  </td>
                  {/* CỘT 8: item.dinhmuc */}
                  <td
                    style={{
                      textAlign: "left",
                      paddingLeft: "1%",
                      height: "22px",
                    }}
                  >
                    {item.dinhmuc}
                  </td>
                  {/* CỘT 9: item.total */}
                  <td
                    style={{
                      textAlign: "left",
                      paddingLeft: "1%",
                      height: "22px",
                    }}
                  >
                    {item.total}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SlideRailGroupTable;
