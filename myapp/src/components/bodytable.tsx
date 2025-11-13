import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter, // 👈 Giữ nguyên import
  Download,
  FileDown,
  Printer,
  Trash2,
  Plus,
  Mail,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"; // 👈 Không thêm 'ChevronsUpDown'
import { motion } from "framer-motion";
import "./bodytable.css";
import ConfirmDeleteModal from "./confirmdeletemodal";
import "./confirmdeletemodal.css";
import type { JSX } from "react/jsx-dev-runtime";
import NavbarMini, { type NavItem } from "./navbar_mini";
import EyeToggle from "./eye"; // Giả sử EyeToggle chấp nhận 'onToggle'

// ========== CÁC KIỂU (TYPE) TÙY CHỈNH ĐỂ THAY THẾ 'ANY' ==========

/** Kiểu dữ liệu cơ bản cho một ô (cell) */
type CellData = string | number | JSX.Element;

/**
 * Props mong đợi cho các component được clone trong modal (Tạo mới / Chỉnh sửa).
 */
type ModalCloneProps = {
  id?: string;
  onClose?: () => void;
};

/**
 * Props mong đợi cho component "Pencil" (Chỉnh sửa) có thể được truyền vào bảng.
 */
type EditButtonProps = {
  id?: string | number; // ID của mục cần sửa
  onEdit?: (id: string, element: React.ReactElement) => void;
};

/**
 * Props mong đợi cho component "Eye" (Xem) có thể được truyền vào bảng.
 */
type EyeToggleProps = {
  onToggle?: (visible: boolean) => void;
  detailComponent?: React.ReactNode;
};

// ================================================================

interface AdvancedTableProps {
  title01?: string;
  title?: string;
  columns: (string | React.ReactNode)[];
  data: CellData[][]; // 👈 Sử dụng CellData
  itemsPerPage?: number;
  columnWidths?: number[];
  createElement?: React.ReactElement;
  navbarMiniItems?: NavItem[];
  basePath?: string;
  onDeleted?: () => void;
  lefts?: (number | string)[];
  columnLefts?: (string | number)[];
}

// 🔽 HÀM HỖ TRỢ: Đọc văn bản từ một ReactNode (Đã bỏ 'any')
const getHeaderText = (node: React.ReactNode): string => {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (node == null || typeof node === "boolean") return "";

  if (Array.isArray(node)) {
    return node.map(getHeaderText).find((text) => text.length > 0) || "";
  }

  // 🔽 Thay thế 'any'
  if (React.isValidElement(node)) {
    // Ép kiểu an toàn để kiểm tra props.children
    const props = node.props as { children?: React.ReactNode };
    if (props.children) {
      return getHeaderText(props.children);
    }
  }

  return "";
};

const AdvancedTable: React.FC<AdvancedTableProps> = ({
  title01,
  title = "Bảng dữ liệu",
  columns,
  data: initialData,
  itemsPerPage = 10,
  columnWidths,
  createElement,
  navbarMiniItems,
  basePath,
  onDeleted,
  columnLefts = [],
}) => {
  const [tableData, setTableData] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(itemsPerPage);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<() => Promise<void>>(
    () => async () => {}
  );
  const [activeEdit, setActiveEdit] = useState<{
    id: string;
    element: React.ReactElement | null;
  } | null>(null);

  // 🔽 STATE MỚI CHO SẮP XẾP VÀ POPOVER
  const [sortConfig, setSortConfig] = useState<{
    key: number;
    direction: "asc" | "desc";
  } | null>(null);

  const [showSortPopover, setShowSortPopover] = useState(false);
  const [tempSortColumn, setTempSortColumn] = useState<string>("0");
  const [tempSortDirection, setTempSortDirection] = useState<"asc" | "desc">(
    "asc"
  );
  const filterButtonRef = useRef<HTMLDivElement>(null); // Ref cho popover

  useEffect(() => {
    setTableData(initialData);
  }, [initialData]);

  // 🔽 useEffect ĐỂ ĐÓNG POPOVER KHI CLICK RA NGOÀI
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target as Node)
      ) {
        setShowSortPopover(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterButtonRef]);

  // 🔽 TÌM CÁC CỘT CÓ THỂ SẮP XẾP
  const sortableColumnIndexes = React.useMemo(() => {
    if (!tableData || tableData.length === 0) {
      return columns
        .map((col, index) => ({ col, index }))
        .filter((item) => typeof item.col === "string")
        .map((item) => item.index);
    }
    const firstRow = tableData[0];
    const indexes: number[] = [];
    for (let i = 0; i < firstRow.length; i++) {
      const cellValue = firstRow[i];
      if (typeof cellValue === "string" || typeof cellValue === "number") {
        indexes.push(i);
      }
    }
    return indexes;
  }, [tableData, columns]);

  // 🔽 Cập nhật state mặc định cho dropdown
  useEffect(() => {
    const firstSortableIndex = sortableColumnIndexes[0] || 0;
    setTempSortColumn(String(firstSortableIndex));
  }, [sortableColumnIndexes]);

  const [colWidths, setColWidths] = useState<number[]>(
    columnWidths && columnWidths.length === columns.length
      ? columnWidths
      : Array(columns.length).fill(100 / columns.length)
  );

  const useFixedWidth = !!(
    columnWidths && columnWidths.length === columns.length
  );
  const colRefs = useRef<(HTMLTableCellElement | null)[]>([]);
  const resizingCol = useRef<number | null>(null);
  const resizingStartX = useRef<number>(0);

  // 🔽 LOGIC SẮP XẾP DỮ LIỆU BẰNG useMemo
  const sortedData = React.useMemo(() => {
    // eslint-disable-next-line prefer-const
    let sortableData = [...tableData];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue == null) return sortConfig.direction === "asc" ? -1 : 1;
        if (bValue == null) return sortConfig.direction === "asc" ? 1 : -1;

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }
        
        // Cẩn thận khi cell là JSX.Element, chỉ so sánh nếu là string/number
        const aString = React.isValidElement(aValue) ? '' : String(aValue).toLowerCase();
        const bString = React.isValidElement(bValue) ? '' : String(bValue).toLowerCase();

        if (aString < bString) return sortConfig.direction === "asc" ? -1 : 1;
        if (aString > bString) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [tableData, sortConfig]);

  // 🔽 CẬP NHẬT filteredData ĐỂ DÙNG sortedData (thay vì tableData)
  const filteredData = sortedData.filter((row) =>
    row.some((cell) =>
      // Chỉ tìm kiếm nếu cell không phải là React Element
      !React.isValidElement(cell) &&
      cell?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const visibleData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  // ========== Resize cột (Giữ nguyên) ==========
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingCol.current !== null && useFixedWidth) {
        const newWidths = [...colWidths];
        const newWidth = e.clientX - resizingStartX.current;
        newWidths[resizingCol.current] = Math.max(60, newWidth);
        setColWidths(newWidths);
      }
    };
    const handleMouseUp = () => {
      resizingCol.current = null;
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [colWidths, useFixedWidth]);

  const startResize = (index: number, e: React.MouseEvent) => {
    if (!useFixedWidth) return;
    resizingCol.current = index;
    resizingStartX.current = e.clientX - colWidths[index];
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedRows(checked ? visibleData.map((_, i) => i + startIndex) : []);
  };

  const toggleSelectRow = (index: number) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // 🔽 CẬP NHẬT LOGIC XÓA ĐỂ DÙNG `sortedData` (Đã bỏ 'any')
  const handleDelete = async () => {
    if (selectedRows.length === 0) return;

    setPendingDelete(() => async () => {
      try {
        if (basePath) {
          // Lấy ID từ `sortedData`
          const idsToDelete = selectedRows
            .map((i) => {
              const row = sortedData[i];
              if (!row) return null;

              // 🔽 Tìm cell là React Element và có prop 'id'
              const pencilButton = row.find(
                (cell): cell is React.ReactElement<EditButtonProps> =>
                  React.isValidElement(cell) &&
                  typeof (cell.props as EditButtonProps).id !== "undefined"
              );

              return pencilButton ? pencilButton.props.id : null;
            })
            // 🔽 Lọc ra các ID hợp lệ (string hoặc number)
            .filter(
              (id): id is string | number => id !== null && id !== undefined
            );

          for (const id of idsToDelete) {
            const res = await fetch(`${basePath}/${id}`, {
              method: "DELETE",
              headers: { accept: "application/json" },
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          }

          if (onDeleted) onDeleted();
        } else {
          // Xử lý xóa local, cập nhật `tableData`
          const rowsInSortedData = selectedRows.map((i) => sortedData[i]);
          const updated = tableData.filter(
            (row) => !rowsInSortedData.includes(row)
          );

          const reordered = updated.map((row, idx) => {
            const newRow = [...row];
            newRow[0] = idx + 1;
            return newRow;
          });
          setTableData(reordered);
        }
      } catch (err) {
        console.error("❌ Lỗi khi xoá dữ liệu:", err);
      } finally {
        setSelectedRows([]);
        setShowDeleteModal(false);
      }
    });

    setShowDeleteModal(true);
  };

  return (
    <>
      <div className="advanced-table-container">
        {/* ... (Header, NavbarMini) ... */}
        <div className="table-header-path">{title01}</div>
        <div className="table-header">{title}</div>
        {navbarMiniItems && navbarMiniItems.length > 0 && (
          <NavbarMini items={navbarMiniItems} />
        )}

        {/* ==== Toolbar ==== */}
        <div className="table-toolbar">
          {/* ... (Toolbar Left: Tạo mới, Xóa) ... */}
          <div className="toolbar-left">
            <button
              className="btn btn-create"
              onClick={() => setShowCreate(true)}
            >
              Tạo mới <Plus size={16} />
            </button>
            <button
              onClick={handleDelete} // 👈 Đã sửa hàm
              className={
                selectedRows.length === 0
                  ? "btn btn-disabled disabled"
                  : "btn btn-delete"
              }
            >
              Xóa ({selectedRows.length}) <Trash2 size={16} />
            </button>
          </div>

          <div className="toolbar-center">
            {/* 🔽 BỌC NÚT LỌC VÀ THÊM POPOVER */}
            <div className="filter-sort-wrapper" ref={filterButtonRef}>
              <button
                className="btn btn-light"
                onClick={() => setShowSortPopover(!showSortPopover)} // 👈 Cập nhật onClick
              >
                <Filter size={16} /> Lọc
              </button>

              {/* ========== POPOVER SẮP XẾP ========== */}
              {showSortPopover && (
                <div className="sort-popover">
                  <div className="sort-popover-header">Sắp xếp dữ liệu</div>

                  {/* 1. Chọn cột */}
                  <label htmlFor="sort-column-select">Cột</label>
                  <select
                    id="sort-column-select"
                    value={tempSortColumn}
                    onChange={(e) => setTempSortColumn(e.target.value)}
                  >
                    {sortableColumnIndexes.map((index) => {
                      const col = columns[index];
                      const label = getHeaderText(col) || `Cột ${index + 1}`;
                      return (
                        <option key={index} value={index}>
                          {label}
                        </option>
                      );
                    })}
                  </select>

                  {/* 2. Chọn chiều */}
                  <label>Thứ tự</label>
                  <div className="sort-direction-group">
                    <label>
                      <input
                        type="radio"
                        name="sort-direction"
                        value="asc"
                        checked={tempSortDirection === "asc"}
                        onChange={() => setTempSortDirection("asc")}
                      />{" "}
                      Tăng dần
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="sort-direction"
                        value="desc"
                        checked={tempSortDirection === "desc"}
                        onChange={() => setTempSortDirection("desc")}
                      />{" "}
                      Giảm dần
                    </label>
                  </div>

                  {/* 3. Nút hành động */}
                  <div className="sort-popover-actions">
                    <button
                      className="btn btn-primary"
                      style={{ marginRight: "8px" }}
                      onClick={() => {
                        const colIndex = parseInt(tempSortColumn, 10);
                        if (!isNaN(colIndex)) {
                          setSortConfig({
                            key: colIndex,
                            direction: tempSortDirection,
                          });
                        }
                        setShowSortPopover(false);
                      }}
                    >
                      Áp dụng
                    </button>
                    <button
                      className="btn btn-light"
                      onClick={() => {
                        setSortConfig(null);
                        const firstSortableIndex =
                          sortableColumnIndexes[0] || 0;
                        setTempSortColumn(String(firstSortableIndex));
                        setTempSortDirection("asc");
                        setShowSortPopover(false);
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* 🔼 KẾT THÚC VÙNG LỌC/SORT */}

            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm kiếm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={16} className="search-icon" />
            </div>

            {/* ... (Toolbar Right: Tải lên, Xuất file, ...) ... */}
            <div className="toolbar-right">
              <button className="btn btn-light">
                <Download size={16} /> Tải lên
              </button>
              <button className="btn btn-light">
                <FileDown size={16} /> Xuất file
              </button>
              <button className="btn btn-light">
                <Printer size={16} /> In
              </button>
              <button className="btn btn-light">
                <Mail size={16} /> Gửi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==== Bảng dữ liệu (Giữ nguyên) ==== */}
      <div className="table-wrapper">
        <table className="advanced-table">
          <thead>
            <tr>
              <th className="checkbox-cell">
                <input
                  type="checkbox"
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  checked={
                    visibleData.length > 0 &&
                    visibleData.every((_, i) =>
                      selectedRows.includes(i + startIndex)
                    )
                  }
                />
              </th>
              {columns.map((col, i) => (
                <th
                  key={i}
                  ref={(el) => {
                    colRefs.current[i] = el;
                  }}
                  style={{
                    width: `${colWidths[i]}%`,
                  }}
                >
                  {col}
                  {useFixedWidth && (
                    <div
                      className="resize-handle"
                      onMouseDown={(e) => startResize(i, e)}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="no-data">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              visibleData.map((row, i) => {
                const globalIndex = startIndex + i;
                const isChecked = selectedRows.includes(globalIndex);
                const hasEyeToggle = columns.includes("Xem");

                return (
                  <React.Fragment key={i}>
                    <tr className={i % 2 === 1 ? "row-alt" : ""}>
                      <td className="checkbox-cell">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(globalIndex)}
                        />
                      </td>

                      {row.map((cell, j) => {
                        const colName = columns[j];

                        // 🔽 Xử lý cột "Xem" (Đã bỏ 'any')
                        if (colName === "Xem" && React.isValidElement(cell)) {
                          return (
                            <td key={j}>
                              {React.isValidElement(cell)
                                ? React.cloneElement(
                                    // Ép kiểu cell sang kiểu có prop 'onToggle'
                                    cell as React.ReactElement<EyeToggleProps>,
                                    {
                                      onToggle: (visible: boolean) => {
                                        setExpandedRow(
                                          visible ? globalIndex : null
                                        );
                                      },
                                    }
                                  )
                                : cell}
                            </td>
                          );
                        }

                        // 🔽 Xử lý các cột khác (Đã bỏ 'any')
                        return (
                          <td
                            key={j}
                            style={
                              columnLefts && columnLefts[j] !== "undefined"
                                ? {
                                    position: "relative",
                                    paddingRight: `${columnLefts[j]}%`,
                                    paddingLeft: "0px",
                                    zIndex: 1,
                                    textAlign: "center",
                                  }
                                : undefined
                            }
                          >
                            {React.isValidElement(cell)
                              ? React.cloneElement(
                                  // Ép kiểu cell sang kiểu có prop 'onEdit'
                                  cell as React.ReactElement<EditButtonProps>,
                                  {
                                    onEdit: (
                                      id: string,
                                      element: React.ReactElement
                                    ) => setActiveEdit({ id, element }),
                                  }
                                )
                              : cell}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Hàng chi tiết mở rộng (Đã bỏ 'any') */}
                    {hasEyeToggle && expandedRow === globalIndex && (
                      <tr className="row-expanded">
                        <td
                          colSpan={columns.length + 1}
                          style={{ padding: 0, textAlign: "initial" }}
                        >
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            whileHover={{ backgroundColor: "#fff" }}
                            style={{
                              overflow: "hidden",
                              borderTop: "1px solid #ddd",
                              backgroundColor: "white",
                              textAlign: "initial",
                            }}
                          >
                            {(() => {
                              // 🔽 Tìm cell "Xem" một cách an toàn
                              const detailCell = row.find(
                                (_, idx) => columns[idx] === "Xem"
                              );
                              
                              // 🔽 Kiểm tra và truy cập 'detailComponent'
                              if (React.isValidElement(detailCell)) {
                                return (
                                  detailCell.props as EyeToggleProps
                                ).detailComponent;
                              }
                              return null;
                            })()}
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>

        {/* ==== Phân trang (Giữ nguyên) ==== */}
        <div className="pagination">
          <div className="info">
            Hiển thị {startIndex + 1}-
            {Math.min(startIndex + rowsPerPage, filteredData.length)} trên{" "}
            {filteredData.length} mục
          </div>
          <div className="pagination-controls">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              ««
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft size={10} strokeWidth={1} />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight size={10} strokeWidth={1} />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              »»
            </button>
          </div>
          <div className="page-info">
            <span>
              Trang {currentPage}/{totalPages}
            </span>
          </div>
        </div>
      </div>

      {/* ==== Modals (Đã bỏ 'any') ==== */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        message={`Bạn có chắc chắn muốn xóa ${selectedRows.length} mục không? Hành động này không thể hoàn tác.`}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          try {
            await pendingDelete();
          } catch (err) {
            console.error("Lỗi khi confirm xóa:", err);
          }
        }}
      />

      {showCreate && createElement && ( // Thêm kiểm tra createElement tồn tại
        <div className="overlay-create" onClick={() => setShowCreate(false)}>
          <div className="overlay-body" onClick={(e) => e.stopPropagation()}>
            {React.cloneElement(
              // Ép kiểu component sang kiểu có prop 'onClose'
              createElement as React.ReactElement<ModalCloneProps>,
              { onClose: () => setShowCreate(false) }
            )}
          </div>
        </div>
      )}

      {activeEdit && activeEdit.element && ( // Thêm kiểm tra activeEdit.element tồn tại
        <div
          className="overlay-edit"
          onClick={() => setActiveEdit(null)}
        >
          <div className="overlay-body" onClick={(e) => e.stopPropagation()}>
            {React.cloneElement(
              // Ép kiểu component sang kiểu có prop 'id' và 'onClose'
              activeEdit.element as React.ReactElement<ModalCloneProps>,
              {
                id: activeEdit.id,
                onClose: () => setActiveEdit(null),
              }
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AdvancedTable;