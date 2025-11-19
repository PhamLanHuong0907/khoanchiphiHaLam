import { Eye, EyeOff } from "lucide-react";
import React from "react";

interface EyeToggleProps {
  onToggle?: (visible: boolean) => void;
  isVisible?: boolean;
  // 👇 Sửa lại tên prop cho khớp với SlideRails.tsx và bodytable.tsx
  detailComponent?: React.ReactNode; 
}

const EyeToggle: React.FC<EyeToggleProps> = ({ onToggle, isVisible }) => {
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
      // Khi click: Đảo ngược trạng thái hiện tại
      onClick={() => onToggle?.(!isVisible)}
    >
      {/* Logic hiển thị icon: 
          Nếu đang mở (isVisible = true) -> Hiện mắt mở (Eye) hoặc mắt đóng (EyeOff) tùy sở thích.
          Thường thì: Đang mở -> Hiện Eye (để báo là đang xem) hoặc EyeOff (để báo bấm vào sẽ tắt).
          Code cũ của bạn: isVisible ? Eye : EyeOff
      */}
      {isVisible ? (
        <Eye size={16} className="text-blue-600" /> // Đã mở (sáng lên)
      ) : (
        <EyeOff size={16} className="text-gray-400 hover:text-blue-600" /> // Đang đóng
      )}
    </div>
  );
};

export default EyeToggle;