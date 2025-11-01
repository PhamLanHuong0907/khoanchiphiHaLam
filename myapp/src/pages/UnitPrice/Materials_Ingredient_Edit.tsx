import LayoutInput from "../../layout/layout_input";
import TransactionSelector, { type TransactionRow } from "../../components/transactionselector"; // Import TransactionSelector và TransactionRow
import React, { useState } from "react"; // Cần import useState để quản lý state cho TransactionSelector
import PATHS from "../../hooks/path";

export default function Materials_Ingredient_Input({ onClose }: { onClose?: () => void }) {
  const handleSubmit = (data: Record<string, string>) => {
    console.log("Dữ liệu form:", data);
    console.log("Dữ liệu giao khoản:", rows); // Log thêm dữ liệu của TransactionSelector
  };

  const fields = [
    {
      label: "Mã định mức vật liệu",
      type: "dropdown" as const,
      placeholder: "Placeholder",
      dropdownItems: [
        { label: "May", path: "#" },
        { label: "Đóng gói", path: "#" },
        { label: "Kiểm tra", path: "#" },
      ],
    },
    {
      label: "Nhóm công đoạn sản xuất",
      type: "dropdown" as const,
      placeholder: "Placeholder",
      dropdownItems: [
        { label: "May", path: "#" },
        { label: "Đóng gói", path: "#" },
        { label: "Kiểm tra", path: "#" },
      ],
    },
    {
      label: "Hộ chiếu, Sđ, Sc",
      type: "dropdown" as const,
      placeholder: "Placeholder",
      dropdownItems: [
        { label: "May", path: "#" },
        { label: "Đóng gói", path: "#" },
        { label: "Kiểm tra", path: "#" },
      ],
    },
    {
      label: "Độ kiên cố đá/than (f)",
      type: "dropdown" as const,
      placeholder: "Placeholder",
      dropdownItems: [
        { label: "May", path: "#" },
        { label: "Đóng gói", path: "#" },
        { label: "Kiểm tra", path: "#" },
      ],
    },
    {
      label: "Chèn",
      type: "dropdown" as const,
      placeholder: "Placeholder",
      dropdownItems: [
        { label: "May", path: "#" },
        { label: "Đóng gói", path: "#" },
        { label: "Kiểm tra", path: "#" },
      ],
    },
    {
      label: "Bước chống",
      type: "dropdown" as const,
      placeholder: "Placeholder",
      dropdownItems: [
        { label: "May", path: "#" },
        { label: "Đóng gói", path: "#" },
        { label: "Kiểm tra", path: "#" },
      ],
    },
    {
      label: "", 
      type: "customTransactionSelector" as const,
    },
  ];

  // Khai báo state và hàm xử lý cho TransactionSelector
  const mockOptions = [
    { value: "MGK001", label: "MGK001" },
    { value: "MGK002", label: "MGK002" },
    { value: "MGK003", label: "MGK003" },
    { value: "MGK004", label: "MGK004" },
  ];

  const initialRows: TransactionRow[] = [
  ];

  const [selectedCodes, setSelectedCodes] = useState<string[]>([
  ]);
  const [rows, setRows] = useState<TransactionRow[]>(initialRows);

  const handleSelectChange = (newSelected: string[]) => {
    setSelectedCodes(newSelected);
    // Logic cập nhật rows dựa trên newSelected (Thêm/Xóa rows)
    // Ví dụ: chỉ giữ lại các row có code trong newSelected
    setRows((prevRows) => {
      const filteredRows = prevRows.filter((row) =>
        newSelected.includes(row.code)
      );
      // Thêm các code mới chưa có trong rows
      const existingCodes = filteredRows.map((r) => r.code);
      const newRowsToAdd: TransactionRow[] = newSelected
        .filter((code) => !existingCodes.includes(code))
        .map((code) => ({
          id: `r${Date.now()}-${code}`, // id duy nhất
          code: code,
          assetCode: `TS-${code.slice(-3)}`, // giả định
          unitPrice: Math.floor(Math.random() * 100000) + 10000, // giả định
          quantity: "0",
          total: 0,
        }));
      return [...filteredRows, ...newRowsToAdd];
    });
  };

  const handleRowChange = (
    id: string,
    field: keyof TransactionRow,
    value: string
  ) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };

          // Xử lý logic tính toán total khi quantity thay đổi
          if (field === "quantity") {
            const quantityNumber = parseFloat(value);
            const unitPrice = updatedRow.unitPrice ?? 0;
            const total = isNaN(quantityNumber)
              ? 0
              : quantityNumber * unitPrice;
            updatedRow.total = total;
          }

          return updatedRow;
        }
        return row;
      })
    );
  };

  const handleRemoveRow = (id: string) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
    // Cập nhật selectedCodes nếu row bị xóa là row cuối cùng của code đó
    setRows((currentRows) => {
      const rowToRemove = currentRows.find((r) => r.id === id);
      if (rowToRemove) {
        const code = rowToRemove.code;
        const isLastRowWithCode =
          currentRows.filter((r) => r.code === code && r.id !== id).length === 0;

        if (isLastRowWithCode) {
          setSelectedCodes((prevSelected) =>
            prevSelected.filter((c) => c !== code)
          );
        }
      }
      return currentRows.filter((row) => row.id !== id);
    });
  };

  return (
    <LayoutInput
      title01="Đơn giá và định mức / Đơn giá và định mức Vật liệu"
      title="Tạo mới Đơn giá và định mức Vật liệu"
      fields={fields}
      onSubmit={handleSubmit}
      closePath={PATHS.MATERIALS_INGREDIENT.LIST}
      onClose={onClose}
    >
      {/* TransactionSelector được đặt sau các trường form và trước nút Submit/Cancel */}
      <TransactionSelector
        label="Mã giao khoán"
        className="customTransactionSelector"
        options={mockOptions}
        selectedCodes={selectedCodes}
        rows={rows}
        onSelectChange={handleSelectChange}
        onRowChange={handleRowChange}
        onRemoveRow={handleRemoveRow}
      />
      {/* MaterialGroupTable (hoặc bất kỳ component nào khác) nếu cần */}
    </LayoutInput>
  );
}