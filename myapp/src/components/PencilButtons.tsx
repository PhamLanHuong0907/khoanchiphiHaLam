import React from "react";
import pencil from "../../assets/pencil.png";
interface PencilButtonProps {
  id: string;
  onEdit?: (id: string, element: React.ReactElement) => void; // ✅ callback gửi lên cha
  editElement: React.ReactElement; // ✅ component popup
}

const PencilButton: React.FC<PencilButtonProps> = ({ id, onEdit, editElement }) => {
  return (
    <button
      onClick={() => onEdit?.(id, editElement)} // ✅ gửi event lên cha
      title="Chỉnh sửa"
      style={{
        border: "none",
        background: "transparent",
        padding: 0,
        outline: "none",
        cursor: "pointer",
      }}
    >
      <img
        src={pencil}
        alt="edit"
        style={{
          border: "none",
          background: "transparent",
          display: "block",
        }}
      />
    </button>
  );
};

export default PencilButton;
