"use client";

import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  FileDown,
  Filter,
  Mail,
  Pencil,
  Plus,
  Printer,
  Search,
  Trash2,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import type { JSX } from "react/jsx-dev-runtime";
import "./bodytable.css";
import ConfirmDeleteModal from "./confirmdeletemodal";
import "./confirmdeletemodal.css";
import "./expandablecell.css";
import NavbarMini, { type NavItem } from "./navbar_mini";

// ========== CÁC KIỂU (TYPE) TÙY CHỈNH ĐỂ THAY THẾ 'ANY' ==========

/** Kiểu dữ liệu cơ bản cho một ô (cell) */
type CellData = string | number | JSX.Element;

type SubRowConfig = {
  label: string;
  validityPeriod?: string;
  detailComponent?: React.ReactNode;
  editComponent?: React.ReactNode;
  createComponent?: React.ReactNode;
  sanluong?: number;
  chiphi?: number;
};

// Type cho level 1.5 của advance-cost variant
type MiddleLevelConfig = {
  label: string;
  subRows: SubRowConfig[];
};

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
  id?: string | number;
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
  data: CellData[][];
  itemsPerPage?: number;
  columnWidths?: number[];
  createElement?: React.ReactElement;
  navbarMiniItems?: NavItem[];
  basePath?: string;
  // 👇 CẬP NHẬT: Cho phép trả về Promise để await được việc reload
  onDeleted?: () => void | Promise<void>;
  lefts?: (number | string)[];
  columnLefts?: (string | number)[];
  variant?: "default" | "cost" | "advance-cost";
}

const getHeaderText = (node: React.ReactNode): string => {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (node == null || typeof node === "boolean") return "";

  if (Array.isArray(node)) {
    return node.map(getHeaderText).find((text) => text.length > 0) || "";
  }

  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    if (props.children) {
      return getHeaderText(props.children);
    }
  }

  return "";
};

const subRowGridCol = [65.6, 8, 12, 12];

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
  variant = "default",
}) => {
  const [tableData, setTableData] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(itemsPerPage);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedRowLevel1, setExpandedRowLevel1] = useState<number | null>(
    null
  );
  const [expandedRowLevel1_5, setExpandedRowLevel1_5] = useState<string | null>(
    null
  );
  const [expandedRowLevel2, setExpandedRowLevel2] = useState<string | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<() => Promise<void>>(
    () => async () => {}
  );
  const [activeEdit, setActiveEdit] = useState<{
    id: string;
    element: React.ReactElement | null;
  } | null>(null);
  const [activeCreate, setActiveCreate] = useState<{
    type: string;
    element: React.ReactElement | null;
  } | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    key: number;
    direction: "asc" | "desc";
  } | null>(null);

  const [showSortPopover, setShowSortPopover] = useState(false);
  const [tempSortColumn, setTempSortColumn] = useState<string>("0");
  const [tempSortDirection, setTempSortDirection] = useState<"asc" | "desc">(
    "asc"
  );
  const filterButtonRef = useRef<HTMLDivElement>(null);

  const isCostVariant = React.useMemo(() => {
    if (variant === "advance-cost") return true;
    if (variant === "cost") return true;
    if (!tableData || tableData.length === 0) return false;
    const lastCellOfFirstRow = tableData[0][tableData[0].length - 1];
    return Array.isArray(lastCellOfFirstRow);
  }, [tableData, variant]);

  const isAdvanceCostVariant = variant === "advance-cost";

  useEffect(() => {
    setTableData(initialData);
  }, [initialData]);

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

  const sortedData = React.useMemo(() => {
    const sortableData = [...tableData];
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

        const aString = React.isValidElement(aValue)
          ? ""
          : String(aValue).toLowerCase();
        const bString = React.isValidElement(bValue)
          ? ""
          : String(bValue).toLowerCase();

        if (aString < bString) return sortConfig.direction === "asc" ? -1 : 1;
        if (aString > bString) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [tableData, sortConfig]);

  const filteredData = sortedData.filter((row) =>
    row.some(
      (cell) =>
        !React.isValidElement(cell) &&
        cell?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const visibleData = filteredData.slice(startIndex, startIndex + rowsPerPage);

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

  // 👇 CẬP NHẬT LOGIC XÓA TẠI ĐÂY
 // 👇 CẬP NHẬT LOGIC XÓA TẠI ĐÂY (Đã song song hóa)
  const handleDelete = async () => {
    if (selectedRows.length === 0) return;

    setPendingDelete(() => async () => {
      try {
        // 1. Gọi API xóa
        if (basePath) {
          // Lấy danh sách ID
          const idsToDelete = selectedRows
            .map((i) => {
              const row = sortedData[i];
              if (!row) return null;
              const pencilButton = row.find(
                (cell): cell is React.ReactElement<any> =>
                  React.isValidElement(cell) && typeof (cell.props as any).id !== "undefined"
              );
              return pencilButton ? pencilButton.props.id : null;
            })
            .filter((id) => id !== null && id !== undefined);

          // --- THAY ĐỔI Ở ĐÂY: Dùng Promise.all thay vì vòng lặp for tuần tự ---
          const deletePromises = idsToDelete.map(async (id) => {
            const res = await fetch(`${basePath}/${id}`, {
              method: "DELETE",
              headers: { accept: "application/json" },
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res;
          });

          // Chờ tất cả các request hoàn thành song song
          await Promise.all(deletePromises);
          // --------------------------------------------------------------------
        }

        // 2. Cập nhật UI (Optimistic Update - Xóa ngay lập tức trên Client)
        const rowsInSortedData = selectedRows.map((i) => sortedData[i]);
        const updated = tableData.filter((row) => !rowsInSortedData.includes(row));
        setTableData(updated);
        setSelectedRows([]);

        // 3. CHỜ RELOAD DỮ LIỆU TỪ SERVER
        if (onDeleted) {
           await onDeleted();
        }

        // 4. HIỆN ALERT SAU KHI RELOAD XONG
        setTimeout(() => {
            alert("Xóa thành công");
            setShowDeleteModal(false);
        }, 300);

      } catch (err) {
        console.error("❌ Lỗi khi xoá dữ liệu:", err);
        alert("Có lỗi xảy ra khi xóa dữ liệu!");
        setShowDeleteModal(false);
      }
    });

    setShowDeleteModal(true);
  };

  const toggleRowLevel1 = (index: number) => {
    if (expandedRowLevel1 === index) {
      setExpandedRowLevel1(null);
      setExpandedRowLevel1_5(null);
      setExpandedRowLevel2(null);
    } else {
      setExpandedRowLevel1(index);
      setExpandedRowLevel1_5(null);
      setExpandedRowLevel2(null);
    }
  };

  const toggleRowLevel1_5 = (key: string) => {
    if (expandedRowLevel1_5 === key) {
      setExpandedRowLevel1_5(null);
      setExpandedRowLevel2(null);
    } else {
      setExpandedRowLevel1_5(key);
      setExpandedRowLevel2(null);
    }
  };

  const toggleRowLevel2 = (key: string) => {
    setExpandedRowLevel2(expandedRowLevel2 === key ? null : key);
  };

  const handleCreateClick = (label: string, component: React.ReactNode) => {
    setActiveCreate({ type: label, element: component as React.ReactElement });
  };

  const handleEditClick = (label: string, component: React.ReactNode) => {
    setActiveEdit({ id: label, element: component as React.ReactElement });
  };

  return (
    <>
      <div className="advanced-table-container">
        <div className="table-header-path">{title01}</div>
        <div className="table-header">{title}</div>
        {navbarMiniItems && navbarMiniItems.length > 0 && (
          <NavbarMini items={navbarMiniItems} />
        )}

        <div className="table-toolbar">
          <div className="toolbar-left">
            <button
              className="btn btn-create"
              onClick={() => setShowCreate(true)}
            >
              Tạo mới <Plus size={16} />
            </button>
            <button
              onClick={handleDelete}
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
            <div className="filter-sort-wrapper" ref={filterButtonRef}>
              <button
                className="btn btn-light"
                onClick={() => setShowSortPopover(!showSortPopover)}
              >
                <Filter size={16} /> Lọc
              </button>

              {showSortPopover && (
                <div className="sort-popover">
                  <div className="sort-popover-header">Sắp xếp dữ liệu</div>

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

                  <div className="sort-popover-actions">
                    <button
                      className="btn btn-primary"
                      style={{ marginRight: "8px" }}
                      onClick={() => {
                        const colIndex = Number.parseInt(tempSortColumn, 10);
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

            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm kiếm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={16} className="search-icon" />
            </div>

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

      <div className="table-wrapper">
        <table className="advanced-table">
          <thead>
            <tr>
              <th className="checkbox-cell">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleSelectAll(e.target.checked);
                  }}
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
                const isExpanded = expandedRowLevel1 === globalIndex;
                const rowSubRows = row[row.length - 1];
                const subRows = Array.isArray(rowSubRows)
                  ? (rowSubRows as (SubRowConfig | MiddleLevelConfig)[])
                  : [];
                const renderableCells = isCostVariant ? row.slice(0, -1) : row;

                return (
                  <React.Fragment key={i}>
                    <tr
                      className={i % 2 === 1 ? "row-alt" : ""}
                      onClick={() => {
                        if (
                          isCostVariant &&
                          !hasEyeToggle &&
                          subRows.length > 0
                        ) {
                          toggleRowLevel1(globalIndex);
                        }
                      }}
                      style={{
                        cursor:
                          isCostVariant && !hasEyeToggle && subRows.length > 0
                            ? "pointer"
                            : "default",
                      }}
                    >
                      <td className="checkbox-cell">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSelectRow(globalIndex);
                          }}
                        />
                      </td>

                      {renderableCells.map((cell, j) => {
                        const colName = columns[j];

                        if (colName === "Xem" && React.isValidElement(cell)) {
                          return (
                            <td key={j} onClick={(e) => e.stopPropagation()}>
                              {React.cloneElement(
                                cell as React.ReactElement<EyeToggleProps>,
                                {
                                  onToggle: (visible: boolean) => {
                                    if (visible) {
                                      setExpandedRowLevel1(globalIndex);
                                    } else {
                                      setExpandedRowLevel1(null);
                                    }
                                    setExpandedRowLevel1_5(null);
                                    setExpandedRowLevel2(null);
                                  },
                                }
                              )}
                            </td>
                          );
                        }

                        if (React.isValidElement(cell)) {
                          return (
                            <td key={j} onClick={(e) => e.stopPropagation()}>
                              {React.cloneElement(
                                cell as React.ReactElement<EditButtonProps>,
                                {
                                  onEdit: (
                                    id: string,
                                    element: React.ReactElement
                                  ) => setActiveEdit({ id, element }),
                                }
                              )}
                            </td>
                          );
                        }

                        return <td key={j}>{cell}</td>;
                      })}
                    </tr>

                    {hasEyeToggle && isExpanded && (
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
                              const detailCell = renderableCells.find(
                                (_, idx) => columns[idx] === "Xem"
                              );
                              if (React.isValidElement(detailCell)) {
                                return (detailCell.props as EyeToggleProps)
                                  .detailComponent;
                              }
                              return null;
                            })()}
                          </motion.div>
                        </td>
                      </tr>
                    )}

                    {!hasEyeToggle &&
                      isCostVariant &&
                      isExpanded &&
                      (() => {
                        if (subRows.length === 0) return null;

                        // Render for advance-cost variant (3 levels)
                        if (isAdvanceCostVariant) {
                          const middleLevels = subRows as MiddleLevelConfig[];

                          return (
                            <tr className="row-expanded">
                              <td
                                colSpan={columns.length + 1}
                                style={{ padding: 0, textAlign: "initial" }}
                              >
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  style={{
                                    overflow: "hidden",
                                    borderTop: "1px solid #ddd",
                                    backgroundColor: "white",
                                    padding: "16px",
                                  }}
                                >
                                  {middleLevels.map((middleLevel, midIdx) => {
                                    const midKey = `${globalIndex}-${middleLevel.label}`;
                                    const isMidExpanded =
                                      expandedRowLevel1_5 === midKey;

                                    return (
                                      <div
                                        key={midIdx}
                                        style={{ marginBottom: "16px" }}
                                      >
                                        <div
                                          style={{
                                            padding: "12px 16px",
                                            backgroundColor: "#f3f4f6",
                                            borderRadius: "4px",
                                            marginBottom: "8px",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            cursor: "pointer",
                                            fontWeight: "600",
                                            color: "#374151",
                                          }}
                                          onClick={() =>
                                            toggleRowLevel1_5(midKey)
                                          }
                                        >
                                          <span>{middleLevel.label}</span>
                                        </div>

                                        {isMidExpanded && (
                                          <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                              opacity: 1,
                                              height: "auto",
                                            }}
                                            exit={{ opacity: 0, height: 0 }}
                                            style={{
                                              overflow: "hidden",
                                              paddingLeft: "16px",
                                            }}
                                          >
                                            {(() => {
                                              const levelSubRows =
                                                middleLevel.subRows;
                                              const grouped =
                                                levelSubRows.reduce(
                                                  (acc, subRow) => {
                                                    const period =
                                                      subRow.validityPeriod ||
                                                      "default";
                                                    if (!acc[period])
                                                      acc[period] = [];
                                                    acc[period].push(subRow);
                                                    return acc;
                                                  },
                                                  {} as Record<
                                                    string,
                                                    SubRowConfig[]
                                                  >
                                                );

                                              return Object.entries(
                                                grouped
                                              ).map(
                                                ([period, periodSubRows]) => {
                                                  const totalChiphi =
                                                    periodSubRows.reduce(
                                                      (sum, subRow) =>
                                                        sum +
                                                        (subRow.chiphi || 0),
                                                      0
                                                    );

                                                  const totalSanluong =
                                                    periodSubRows[0].sanluong ||
                                                    0;

                                                  const isReadOnlySection =
                                                    middleLevel.label ===
                                                    "Chi phí kế hoạch";

                                                  return (
                                                    <div
                                                      key={period}
                                                      style={{
                                                        marginBottom: "16px",
                                                      }}
                                                    >
                                                      {period !== "default" && (
                                                        <div
                                                          style={{
                                                            padding: "8px 12px",
                                                            backgroundColor:
                                                              "#e5e7eb",
                                                            borderRadius: "4px",
                                                            marginBottom: "8px",
                                                            display: "grid",
                                                            gridTemplateColumns: `${subRowGridCol[0]}% ${subRowGridCol[1]}% ${subRowGridCol[2]}% ${subRowGridCol[3]}%`,
                                                            alignItems:
                                                              "center",
                                                            gap: "8px",
                                                          }}
                                                        >
                                                          <div
                                                            style={{
                                                              fontWeight: "600",
                                                              color: "#374151",
                                                            }}
                                                          >
                                                            {period}
                                                          </div>
                                                          <div
                                                            style={{
                                                              textAlign: "left",
                                                              fontWeight: "600",
                                                              color: "#374151",
                                                            }}
                                                          >
                                                            {totalSanluong}
                                                          </div>
                                                          <div
                                                            style={{
                                                              textAlign: "left",
                                                              fontWeight: "600",
                                                              color: "#374151",
                                                            }}
                                                          >
                                                            {totalChiphi.toLocaleString()}
                                                          </div>
                                                        </div>
                                                      )}
                                                      <div
                                                        style={{
                                                          display: "flex",
                                                          flexDirection:
                                                            "column",
                                                          gap: "12px",
                                                        }}
                                                      >
                                                        {periodSubRows.map(
                                                          (subRow, idx) => {
                                                            const subKey = `${midKey}-${period}-${subRow.label}`;
                                                            const isSubExpanded =
                                                              expandedRowLevel2 ===
                                                              subKey;

                                                            return (
                                                              <div
                                                                key={idx}
                                                                style={{
                                                                  display:
                                                                    "flex",
                                                                  flexDirection:
                                                                    "column",
                                                                  gap: "8px",
                                                                }}
                                                              >
                                                                <div
                                                                  style={{
                                                                    padding:
                                                                      "12px 16px",
                                                                    border:
                                                                      "1px solid #e5e7eb",
                                                                    display:
                                                                      "grid",
                                                                    gridTemplateColumns: `${subRowGridCol[0]}% ${subRowGridCol[1]}% ${subRowGridCol[2]}% ${subRowGridCol[3]}%`,
                                                                    alignItems:
                                                                      "center",
                                                                    gap: "10px",
                                                                    borderRadius:
                                                                      "4px",
                                                                  }}
                                                                >
                                                                  <span
                                                                    style={{
                                                                      fontWeight: 500,
                                                                      color:
                                                                        "#374151",
                                                                    }}
                                                                  >
                                                                    {
                                                                      subRow.label
                                                                    }
                                                                  </span>
                                                                  <div
                                                                    style={{
                                                                      textAlign:
                                                                        "left",
                                                                      color:
                                                                        "#374151",
                                                                    }}
                                                                  >
                                                                    {subRow.sanluong ||
                                                                      ""}
                                                                  </div>
                                                                  <div
                                                                    style={{
                                                                      textAlign:
                                                                        "left",
                                                                      color:
                                                                        "#374151",
                                                                    }}
                                                                  >
                                                                    {subRow.chiphi
                                                                      ? subRow.chiphi.toLocaleString()
                                                                      : ""}
                                                                  </div>
                                                                  <div
                                                                    style={{
                                                                      display:
                                                                        "flex",
                                                                      gap: "8px",
                                                                      justifyContent:
                                                                        "end",
                                                                    }}
                                                                  >
                                                                    {!isReadOnlySection &&
                                                                      subRow.createComponent && (
                                                                        <Plus
                                                                          size={
                                                                            20
                                                                          }
                                                                          style={{
                                                                            padding:
                                                                              "6px 10px",
                                                                            fontSize:
                                                                              "14px",
                                                                            cursor:
                                                                              "pointer",
                                                                          }}
                                                                          onClick={(
                                                                            e
                                                                          ) => {
                                                                            e.stopPropagation();
                                                                            setActiveCreate(
                                                                              {
                                                                                type: subRow.label,
                                                                                element:
                                                                                  subRow.createComponent as React.ReactElement,
                                                                              }
                                                                            );
                                                                          }}
                                                                        />
                                                                      )}
                                                                    {subRow.detailComponent &&
                                                                      (isSubExpanded ? (
                                                                        <Eye
                                                                          size={
                                                                            19
                                                                          }
                                                                          style={{
                                                                            padding:
                                                                              "6px 10px",
                                                                            fontSize:
                                                                              "14px",
                                                                            cursor:
                                                                              "pointer",
                                                                          }}
                                                                          onClick={(
                                                                            e
                                                                          ) => {
                                                                            e.stopPropagation();
                                                                            toggleRowLevel2(
                                                                              subKey
                                                                            );
                                                                          }}
                                                                        />
                                                                      ) : (
                                                                        <EyeOff
                                                                          size={
                                                                            19
                                                                          }
                                                                          style={{
                                                                            padding:
                                                                              "6px 10px",
                                                                            fontSize:
                                                                              "14px",
                                                                            cursor:
                                                                              "pointer",
                                                                          }}
                                                                          onClick={(
                                                                            e
                                                                          ) => {
                                                                            e.stopPropagation();
                                                                            toggleRowLevel2(
                                                                              subKey
                                                                            );
                                                                          }}
                                                                        />
                                                                      ))}
                                                                    {!isReadOnlySection &&
                                                                      subRow.editComponent && (
                                                                        <Pencil
                                                                          size={
                                                                            18
                                                                          }
                                                                          style={{
                                                                            padding:
                                                                              "6px 10px",
                                                                            fontSize:
                                                                              "14px",
                                                                            cursor:
                                                                              "pointer",
                                                                          }}
                                                                          onClick={(
                                                                            e
                                                                          ) => {
                                                                            e.stopPropagation();
                                                                            setActiveEdit(
                                                                              {
                                                                                id: subRow.label,
                                                                                element:
                                                                                  subRow.editComponent as React.ReactElement,
                                                                              }
                                                                            );
                                                                          }}
                                                                        />
                                                                      )}
                                                                  </div>
                                                                </div>

                                                                {isSubExpanded &&
                                                                  subRow.detailComponent && (
                                                                    <motion.div
                                                                      initial={{
                                                                        opacity: 0,
                                                                        height: 0,
                                                                      }}
                                                                      animate={{
                                                                        opacity: 1,
                                                                        height:
                                                                          "auto",
                                                                      }}
                                                                      exit={{
                                                                        opacity: 0,
                                                                        height: 0,
                                                                      }}
                                                                      style={{
                                                                        overflow:
                                                                          "hidden",
                                                                        backgroundColor:
                                                                          "white",
                                                                        padding:
                                                                          "16px",
                                                                        borderRadius:
                                                                          "4px",
                                                                      }}
                                                                    >
                                                                      {
                                                                        subRow.detailComponent
                                                                      }
                                                                    </motion.div>
                                                                  )}
                                                              </div>
                                                            );
                                                          }
                                                        )}
                                                      </div>
                                                    </div>
                                                  );
                                                }
                                              );
                                            })()}
                                          </motion.div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </motion.div>
                              </td>
                            </tr>
                          );
                        }

                        // Render for cost variant (2 levels) - original code
                        const costSubRows = subRows as SubRowConfig[];
                        return (
                          <tr className="row-expanded">
                            <td
                              colSpan={columns.length + 1}
                              style={{ padding: 0, textAlign: "initial" }}
                            >
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{
                                  overflow: "hidden",
                                  borderTop: "1px solid #ddd",
                                  backgroundColor: "white",
                                  padding: "16px",
                                }}
                              >
                                {(() => {
                                  const grouped = costSubRows.reduce(
                                    (acc, subRow) => {
                                      const period =
                                        subRow.validityPeriod || "default";
                                      if (!acc[period]) acc[period] = [];
                                      acc[period].push(subRow);
                                      return acc;
                                    },
                                    {} as Record<string, SubRowConfig[]>
                                  );

                                  return Object.entries(grouped).map(
                                    ([period, periodSubRows]) => {
                                      const totalChiphi = periodSubRows.reduce(
                                        (sum, subRow) =>
                                          sum + (subRow.chiphi || 0),
                                        0
                                      );

                                      const totalSanluong =
                                        periodSubRows[0].sanluong || 0;

                                      return (
                                        <div
                                          key={period}
                                          style={{ marginBottom: "16px" }}
                                        >
                                          {period !== "default" && (
                                            <div
                                              style={{
                                                padding: "8px 12px",
                                                backgroundColor: "#e5e7eb",
                                                borderRadius: "4px",
                                                marginBottom: "8px",
                                                display: "grid",
                                                gridTemplateColumns: `${subRowGridCol[0]}% ${subRowGridCol[1]}% ${subRowGridCol[2]}% ${subRowGridCol[3]}%`,
                                                alignItems: "center",
                                                gap: "8px",
                                              }}
                                            >
                                              <div
                                                style={{
                                                  fontWeight: "600",
                                                  color: "#374151",
                                                }}
                                              >
                                                {period}
                                              </div>
                                              <div
                                                style={{
                                                  textAlign: "left",
                                                  fontWeight: "600",
                                                  color: "#374151",
                                                }}
                                              >
                                                {totalSanluong}
                                              </div>
                                              <div
                                                style={{
                                                  textAlign: "left",
                                                  fontWeight: "600",
                                                  color: "#374151",
                                                }}
                                              >
                                                {totalChiphi.toLocaleString()}
                                              </div>
                                            </div>
                                          )}
                                          <div
                                            style={{
                                              display: "flex",
                                              flexDirection: "column",
                                              gap: "12px",
                                            }}
                                          >
                                            {periodSubRows.map(
                                              (subRow, idx) => {
                                                const subKey = `${globalIndex}-${period}-${subRow.label}`;
                                                const isSubExpanded =
                                                  expandedRowLevel2 === subKey;

                                                return (
                                                  <div
                                                    key={idx}
                                                    style={{
                                                      display: "flex",
                                                      flexDirection: "column",
                                                      gap: "8px",
                                                    }}
                                                  >
                                                    <div
                                                      style={{
                                                        padding: "12px 16px",
                                                        border:
                                                          "1px solid #e5e7eb",
                                                        display: "grid",
                                                        gridTemplateColumns: `${subRowGridCol[0]}% ${subRowGridCol[1]}% ${subRowGridCol[2]}% ${subRowGridCol[3]}%`,
                                                        alignItems: "center",
                                                        gap: "10px",
                                                        borderRadius: "4px",
                                                      }}
                                                    >
                                                      <span
                                                        style={{
                                                          fontWeight: 500,
                                                          color: "#374151",
                                                        }}
                                                      >
                                                        {subRow.label}
                                                      </span>
                                                      <div
                                                        style={{
                                                          textAlign: "left",
                                                          color: "#374151",
                                                        }}
                                                      >
                                                        {subRow.sanluong || ""}
                                                      </div>
                                                      <div
                                                        style={{
                                                          textAlign: "left",
                                                          color: "#374151",
                                                        }}
                                                      >
                                                        {subRow.chiphi
                                                          ? subRow.chiphi.toLocaleString()
                                                          : ""}
                                                      </div>
                                                      <div
                                                        style={{
                                                          display: "flex",
                                                          gap: "8px",
                                                          justifyContent: "end",
                                                        }}
                                                      >
                                                        {subRow.createComponent && (
                                                          <Plus
                                                            size={20}
                                                            style={{
                                                              padding:
                                                                "6px 10px",
                                                              fontSize: "14px",
                                                              cursor: "pointer",
                                                            }}
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setActiveCreate({
                                                                type: subRow.label,
                                                                element:
                                                                  subRow.createComponent as React.ReactElement,
                                                              });
                                                            }}
                                                          />
                                                        )}
                                                        {subRow.detailComponent &&
                                                          (isSubExpanded ? (
                                                            <Eye
                                                              size={19}
                                                              style={{
                                                                padding:
                                                                  "6px 10px",
                                                                fontSize:
                                                                  "14px",
                                                                cursor:
                                                                  "pointer",
                                                              }}
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleRowLevel2(
                                                                  subKey
                                                                );
                                                              }}
                                                            />
                                                          ) : (
                                                            <EyeOff
                                                              size={19}
                                                              style={{
                                                                padding:
                                                                  "6px 10px",
                                                                fontSize:
                                                                  "14px",
                                                                cursor:
                                                                  "pointer",
                                                              }}
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleRowLevel2(
                                                                  subKey
                                                                );
                                                              }}
                                                            />
                                                          ))}
                                                        {subRow.editComponent && (
                                                          <Pencil
                                                            size={18}
                                                            style={{
                                                              padding:
                                                                "6px 10px",
                                                              fontSize: "14px",
                                                              cursor: "pointer",
                                                            }}
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setActiveEdit({
                                                                id: subRow.label,
                                                                element:
                                                                  subRow.editComponent as React.ReactElement,
                                                              });
                                                            }}
                                                          />
                                                        )}
                                                      </div>
                                                    </div>

                                                    {isSubExpanded &&
                                                      subRow.detailComponent && (
                                                        <motion.div
                                                          initial={{
                                                            opacity: 0,
                                                            height: 0,
                                                          }}
                                                          animate={{
                                                            opacity: 1,
                                                            height: "auto",
                                                          }}
                                                          exit={{
                                                            opacity: 0,
                                                            height: 0,
                                                          }}
                                                          style={{
                                                            overflow: "hidden",
                                                            backgroundColor:
                                                              "white",
                                                            padding: "16px",
                                                            borderRadius: "4px",
                                                          }}
                                                        >
                                                          {
                                                            subRow.detailComponent
                                                          }
                                                        </motion.div>
                                                      )}
                                                  </div>
                                                );
                                              }
                                            )}
                                          </div>
                                        </div>
                                      );
                                    }
                                  );
                                })()}
                              </motion.div>
                            </td>
                          </tr>
                        );
                      })()}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>

        <div className="pagination">
          <div className="info">
            Hiển thị {startIndex + 1}-{" "}
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

      {/* Confirm Modal */}
       <ConfirmDeleteModal
        isOpen={showDeleteModal}
        message={`Bạn có chắc chắn muốn xóa ${selectedRows.length} mục không?`}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          await pendingDelete();
        }}
        />
      {showCreate && createElement && (
        <div className="overlay-create" onClick={() => setShowCreate(false)}>
          <div className="overlay-body" onClick={(e) => e.stopPropagation()}>
            {React.cloneElement(
              createElement as React.ReactElement<ModalCloneProps>,
              {
                onClose: () => setShowCreate(false),
              }
            )}
          </div>
        </div>
      )}

      {activeCreate && activeCreate.element && (
        <div className="overlay-create" onClick={() => setActiveCreate(null)}>
          <div className="overlay-body" onClick={(e) => e.stopPropagation()}>
            {React.cloneElement(
              activeCreate.element as React.ReactElement<ModalCloneProps>,
              {
                onClose: () => setActiveCreate(null),
              }
            )}
          </div>
        </div>
      )}

      {activeEdit && activeEdit.element && (
        <div className="overlay-edit" onClick={() => setActiveEdit(null)}>
          <div className="overlay-body" onClick={(e) => e.stopPropagation()}>
            {React.cloneElement(
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