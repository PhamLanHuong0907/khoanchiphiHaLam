import React from "react";
import Select from "react-select";
import { X } from "lucide-react";
// === THAY ĐỔI: IMPORT FILE CSS MỚI ===
import "./transactionselector.css";

export interface TransactionRow {
  
  materialId: any;
  id: string;
  code: string;
  assetCode?: string;
  unitPrice?: number;
  quantity?: string;
  total?: number;
}

interface TransactionSelectorProps {
  label?: string;
  className?: string;
  options: { value: string; label: string }[];
  selectedCodes: string[];
  rows: TransactionRow[];
  onSelectChange: (newSelected: string[]) => void;
  onRowChange: (id: string, field: keyof TransactionRow, value: string) => void;
  onRemoveRow: (id: string) => void;
}

// === THAY ĐỔI: Các hằng số này không còn cần thiết ===
// const gridTemplateColumns = "grid-cols-[100px_100px_100px_100px_100px_auto]";
// const gridGap = "gap-3";

const TransactionSelector: React.FC<TransactionSelectorProps> = ({
  label = "Mã giao khoán",
  options,
  selectedCodes,
  rows,
  onSelectChange,
  onRowChange,
  onRemoveRow,
  className,
}) => {
  const selectedOptions = options.filter((opt) =>
    selectedCodes.includes(opt.value)
  );

  
  const handleSelectChange = (selected: any) => {
    
    const newValues = selected ? selected.map((s: any) => s.value) : [];
    onSelectChange(newValues);
  };

  return (
    // === THAY ĐỔI: Sử dụng class CSS mới ===
    <div className={`transaction-container ${className || ""}`}>
      {/* Dropdown chọn mã giao khoản */}
      <div>
        <label className="transaction-label">{label}</label>
        <Select
          isMulti
          options={options}
          value={selectedOptions}
          onChange={handleSelectChange}
          // === THAY ĐỔI: Bỏ `styles` và `className`, dùng `classNamePrefix` ===
          className="transaction-select-wrapper"
          classNamePrefix="transaction-select"
          placeholder="Chọn mã giao khoán"
        />
      </div>

      {/* Grid */}
      <div className="transaction-grid-container">
        {/* Hàng Tiêu đề */}
        {rows.length > 0 && (
        <div className="transaction-grid transaction-grid-header">
          <label className="transaction-header-label">Mã giao khoán</label>
          <label className="transaction-header-label">Mã vật tư, tài sản</label>
          <label className="transaction-header-label">Đơn giá</label>
          <label className="transaction-header-label">Định mức</label>
          <label className="transaction-header-label">Thành tiền</label>
          {/* Cột trống cho nút xóa */}
          <span></span>
        </div>
        )}
        {/* Hàng Dữ liệu */}
        {rows.map((row) => (
          <div
            key={row.id}
            className="transaction-grid transaction-grid-row"
          >
            <input
              // === THAY ĐỔI: Sử dụng class CSS mới ===
              className="transaction-input transaction-input-readonly transaction-input-center"
              value={row.code}
              readOnly
            />

            <input
              className="transaction-input transaction-input-readonly transaction-input-center"
              value={row.assetCode || "TNLD"}
              readOnly
            />

            <input
              className="transaction-input transaction-input-readonly transaction-input-right"
              value={row.unitPrice ?? 0}
              readOnly
            />

            <input
              className="transaction-input transaction-input-center"
              placeholder="Input Text"
              value={row.quantity || ""}
              onChange={(e) => onRowChange(row.id, "quantity", e.target.value)}
            />

            <input
              className="transaction-input transaction-input-readonly transaction-input-right"
              value={row.total ?? 0}
              readOnly
            />

            <button
              className="transaction-remove-button"
              onClick={() => onRemoveRow(row.id)}
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionSelector;