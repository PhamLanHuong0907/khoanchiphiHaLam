import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface EyeToggleProps {
  onToggle?: (visible: boolean) => void;
  // Sửa: Nhận một hàm render, thay vì một ReactNode đã được tạo
  renderDetailComponent: () => React.ReactNode;
}

const EyeToggle: React.FC<EyeToggleProps> = ({ onToggle }) => {
  const [showDetail, setShowDetail] = useState(false);

  const handleToggle = () => {
    const next = !showDetail;
    setShowDetail(next);
    onToggle?.(next); // ✅ gọi callback để báo bảng biết
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        
        justifyContent: "center",
        cursor: "pointer",
        width: "100%",
        height: "fit-content",
      }}
      onClick={handleToggle}
    >
      {showDetail ? (
        <Eye size={16} className="hover:text-blue-600" />
      ) : (
        <EyeOff size={16} className="hover:text-blue-600" />
      )}
    </div>
  );
};

export default EyeToggle;