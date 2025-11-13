import { Eye, EyeOff } from "lucide-react";
import React from "react";

interface EyeToggleProps {
  onToggle?: (visible: boolean) => void;
  isVisible?: boolean;
  renderDetailComponent: () => React.ReactNode;
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
      onClick={() => onToggle?.(!isVisible)}
    >
      {isVisible ? (
        <Eye size={16} className="hover:text-blue-600" />
      ) : (
        <EyeOff size={16} className="hover:text-blue-600" />
      )}
    </div>
  );
};

export default EyeToggle;
