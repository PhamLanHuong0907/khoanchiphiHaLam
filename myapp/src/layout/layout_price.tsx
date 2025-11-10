import React from "react";
import "./layout_price.css";

// Định nghĩa cho một mục thông tin chung (key-value)
interface InfoItem {
  label: string;
  value: React.ReactNode;
}

// Định nghĩa cho một cột trong bảng
export interface ColumnDefinition {
  key: string; // Key để truy cập dữ liệu trong data
  label: string; // Tên hiển thị trên tiêu đề
  width?: string; // Kích thước cột (ví dụ: '20%', '100px')
  textAlign?: "left" | "right" | "center"; // Căn lề
}

// Định nghĩa cho một khu vực bảng
interface TableSection {
  headers: ColumnDefinition[];
  data: Array<Record<string, React.ReactNode>>; // Mảng các object dữ liệu
  headerBackgroundColor?: string; // Tùy chọn màu nền cho header
}

// Props của component chính
interface CustomDataDisplayProps {
  generalInfo?: InfoItem[];
  sections: TableSection[];
}

const CustomDataDisplay: React.FC<CustomDataDisplayProps> = ({
  generalInfo,
  sections,
}) => {
  return (
    <div className="data-display-container">
      {/* 1. Khu vực Thông tin chung */}
      {generalInfo && generalInfo.length > 0 && (
        <div className="general-info-section">
          {generalInfo.map((item, index) => (
            <div className="info-item" key={index}>
              <span className="info-label">{item.label}</span>
              <span className="info-value">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* 2. Khu vực các Bảng động */}
      {sections.map((section, sectionIndex) => (
        <div className="table-section" key={sectionIndex}>
          <table className="dynamic-table">
            <thead>
              <tr
                style={{
                  backgroundColor:
                    section.headerBackgroundColor || "transparent",
                }}
              >
                {section.headers.map((header) => (
                  <th
                    key={header.key}
                    style={{
                      width: header.width || "auto",
                      textAlign: header.textAlign || "left",
                      paddingLeft: "16px",
                      paddingTop: "10px",
                      paddingBottom: "10px",
                    }}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {section.headers.map((header) => (
                    <td
                      key={`${header.key}-${rowIndex}`}
                      style={{
                        textAlign: header.textAlign || "left",
                        paddingLeft: "16px",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                      }}
                    >
                      {row[header.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default CustomDataDisplay;
