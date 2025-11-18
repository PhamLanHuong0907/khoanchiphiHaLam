import React from "react";
import Select from "react-select";
import "./dropdown_menu_searchable.css"

interface DropdownMenuSearchableProps {
  label?: string;
  options: { value: string; label: string }[];
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  width?: string;
  isDisabled?: boolean;
}

const DropdownMenuSearchable: React.FC<DropdownMenuSearchableProps> = ({
  label,
  options,
  value,
  placeholder = "Chọn giá trị...",
  onChange,
  width = "100%",
  isDisabled = false,
}) => {
  const selectedOption = options.find((opt) => opt.value === value) || null;

  return (
    <div className="dropdown-container" style={{ width }}>
      {label && <label className="dropdown-label">{label}</label>}

      <Select
        options={options}
        value={selectedOption}
        onChange={(selected) => onChange(selected ? selected.value : "")}
        isSearchable
        isDisabled={isDisabled}
        placeholder={placeholder}
        classNamePrefix="dropdown-search"
        
        // ==================
        // === THAY ĐỔI 1 ===
        // Chỉ thị cho React-Select render menu ở <body>
        menuPortalTarget={document.body} 
        // ==================

        styles={{
          control: (base) => ({
            ...base,
            borderColor: "#ccc",
            boxShadow: "none",
            "&:hover": { borderColor: "#999" },
            minHeight: "34.6px",
            zIndex: 2000,
            backgroundColor: "white",
          }),
          
          // ==================
          // === THAY ĐỔI 2 ===
          // Gán z-index cao cho menu khi nó được "dịch chuyển" (portal)
          menuPortal: (base) => ({
            ...base,
            zIndex: 9999, // Đảm bảo menu luôn nổi lên trên cùng
          }),
          // ==================
        }}
      />
    </div>
  );
};

export default DropdownMenuSearchable;