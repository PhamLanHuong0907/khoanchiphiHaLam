// ------------------------------------
// BẮT ĐẦU: File formrow.tsx (Đã sửa)
// ------------------------------------
import React, { useRef } from "react";
import { createPortal } from "react-dom"; // <--- BỔ SUNG 1: Import createPortal
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./formrow.css";
import X from "../../assets/X.png";
import { Calendar } from "lucide-react";
import { PlusCircle } from "lucide-react";
import { offset } from "@floating-ui/dom";
// CẬP NHẬT: Sử dụng Discriminated Unions để loại bỏ 'any'

// 1. Interface cơ sở cho các trường chung
interface BaseFieldData {
  label: string;
  placeholder: string;
  readOnly?: boolean;
}

// 2. Interface cho input 'text' hoặc 'number'
interface InputFieldData extends BaseFieldData {
  type?: "text" | "number";
  value: string | null;
  onChange: (value: string) => void; // 👈 Kiểu 'string' chính xác
}

// 3. Interface cho input 'date'
interface DateFieldData extends BaseFieldData {
  type: "date";
  value: Date | null;
  onChange: (value: Date | null) => void; // 👈 Kiểu 'Date | null' chính xác
}

// 4. Kiểu FieldData gộp (Discriminated Union)
type FieldData = InputFieldData | DateFieldData;

// Props của FormRow giờ nhận MỘT MẢNG CÁC HÀNG (rows)
interface FormRowProps {
  title?: string;
  title1?: string;
  // 'rows' là một mảng các hàng, mỗi hàng là một mảng các ô input (FieldData)
  rows: FieldData[][]; // 👈 Sử dụng kiểu union mới
  onAdd?: () => void;
  onRemove?: (rowIndex: number) => void; // Prop mới để báo cho cha biết cần xóa hàng
}

// <--- BỔ SUNG 2: Component container để "dịch chuyển" lịch ra <body>
//     Component này dùng "cổng dịch chuyển" (portal) để render children vào <body>
const PopperContainer = ({ children }: { children: React.ReactNode }) => {
  return createPortal(children, document.body);
};
// -------------------------------------------------------------------

const FormRow: React.FC<FormRowProps> = ({
  title,
  title1,
  rows,
  onAdd,
  onRemove,
}) => {
  // Ref để mở lịch (vẫn giữ lại)
  const datePickerRefs = useRef<(DatePicker | null)[][]>([]);

  // XÓA BỎ: Toàn bộ state [rows, setRows] và các hàm handler nội bộ.

  return (
    <div className="form-row-container">
      {title && <div className="form-row-title">{title}</div>}

      {/* Render các hàng dựa trên state 'rows' của cha */}
      {rows.map((rowFields, rowIndex) => (
        <div className="form-row" key={rowIndex}>
          {/* Render các ô input (fields) trong hàng đó */}
          {rowFields.map((field, fieldIndex) => (
            <div className="form-field" key={fieldIndex}>
              <label>{field.label}</label>
              <div className="input-wrapper">
                {field.type === "date" ? (
                  // CẬP NHẬT: Nhánh này TypeScript tự động hiểu 'field' là DateFieldData
                  <div className="date-input-container">
                    <DatePicker
                      ref={(el) => {
                        if (!datePickerRefs.current[rowIndex])
                          datePickerRefs.current[rowIndex] = [];
                        datePickerRefs.current[rowIndex][fieldIndex] = el;
                      }}
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      dateFormat="dd/MM/yyyy"
                      placeholderText={field.placeholder}
                      className="datepicker-input"
                      popperModifiers={[
                        offset({ crossAxis: 30, mainAxis: 0 }),
                      ]}
                      // <--- SỬA LẠI 3: Dùng component PopperContainer đã tạo
                      popperContainer={PopperContainer}
                    />
                    <Calendar
                      alt="calendar"
                      className="calendar-overlay-icon"
                      strokeWidth={2}
                      color="rgba(30, 30, 30, 1)"
                      onClick={() =>
                        datePickerRefs.current[rowIndex]?.[
                          fieldIndex
                        ]?.setOpen(true)
                      }
                    />
                  </div>
                ) : (
                  // CẬP NHẬT: Nhánh này TypeScript tự động hiểu 'field' là InputFieldData
                  <input
                    type={field.type || "text"}
                    value={field.value || ""} // 👈 Bỏ 'as string'
                    onChange={(e) => field.onChange(e.target.value)} // 👈 'e.target.value' là string, khớp hoàn hảo
                    placeholder={field.placeholder}
                    readOnly={field.readOnly}
                  />
                )}
              </div>
            </div>
          ))}

          {/* Nút Xóa: Gọi hàm 'onRemove' của cha */}
          {rows.length > 1 && ( // Chỉ hiện khi có nhiều hơn 1 hàng
            <button
              className="remove-btn"
              onClick={() => onRemove?.(rowIndex)} // Báo cho cha biết cần xóa hàng 'rowIndex'
              title="Xoá dòng"
            >
              <img src={X} alt="remove" />
            </button>
          )}
        </div>
      ))}

      {/* Nút Thêm: Gọi hàm 'onAdd' của cha */}
      {onAdd && (
        <div className="add-btn-wrapper">
          <button className="add-btn" onClick={onAdd} title="Thêm dòng">
            <PlusCircle
              size={20}
              strokeWidth={2}
              color="rgba(0, 123, 255, 1)"
              alt="add"
            />
            Thêm đơn giá {title1}
          </button>
        </div>
      )}
    </div>
  );
};

export default FormRow;
// ------------------------------------
// KẾT THÚC: File formrow.tsx
// ------------------------------------