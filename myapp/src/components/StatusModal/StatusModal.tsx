import React from "react";
import { CheckCircle, XCircle } from "lucide-react"; // Import thêm XCircle

interface StatusModalProps {
  isOpen: boolean;
  type: "success" | "error"; // Thêm prop type
  message: string;
  onClose: () => void;
}

const StatusModal: React.FC<StatusModalProps> = ({ isOpen, type, message, onClose }) => {
  if (!isOpen) return null;

  const isSuccess = type === "success";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999999,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "12px",
          width: "320px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          animation: "fadeIn 0.2s ease-out"
        }}
      >
        {/* Đổi Icon dựa trên type */}
        {isSuccess ? (
          <CheckCircle size={48} color="#22c55e" strokeWidth={2} />
        ) : (
          <XCircle size={48} color="#ef4444" strokeWidth={2} />
        )}
        
        <div style={{ textAlign: "center" }}>
          <h3 style={{ 
            margin: "0 0 8px 0", 
            color: isSuccess ? "#333" : "#ef4444", // Đổi màu tiêu đề nếu lỗi
            fontSize: "18px" 
          }}>
            {isSuccess ? "Thành công!" : "Đã xảy ra lỗi!"}
          </h3>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>{message}</p>
        </div>

        <button
          onClick={onClose}
          style={{
            backgroundColor: isSuccess ? "#007bff" : "#ef4444", // Đổi màu nút
            color: "white",
            border: "none",
            padding: "10px 24px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            width: "100%"
          }}
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

export default StatusModal;