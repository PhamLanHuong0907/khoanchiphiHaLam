import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import PATHS from "../../../hooks/path";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable";
import { useApi } from "../../../hooks/useFetchData";

interface WorkCodeEditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; 
}

interface WorkCode {
  id: string;
  code: string;
  name: string;
  unitOfMeasureId: string;
}

const WorkCodeEdit: React.FC<WorkCodeEditProps> = ({
  id,
  onClose,
  onSuccess,
}) => {
  const workCodePath = `/api/catalog/assignmentcode`;
  const unitPath = `/api/catalog/unitofmeasure?pageIndex=1&pageSize=1000`;

  // useApi cho WorkCode (autoFetch: false)
  const {
    fetchById,
    putData,
    error: errorWorkCode,
  } = useApi<WorkCode>(workCodePath, { autoFetch: false });

  // useApi cho danh sách đơn vị tính
  const {
    data: units,
    loading: loadingUnits
  } = useApi<{ id: string; name: string }>(unitPath);

  const [currentWorkCode, setCurrentWorkCode] = useState<WorkCode | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
  });

  // Fetch dữ liệu theo ID
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id);
      if (res) setCurrentWorkCode(res as WorkCode);
    };
    loadData();
  }, [id, fetchById]);

  // Gán dữ liệu
  useEffect(() => {
    if (currentWorkCode) {
      setFormData({
        code: currentWorkCode.code,
        name: currentWorkCode.name,
      });
      // Nếu API trả về null, gán "" để dropdown hiển thị đúng trạng thái reset
      setSelectedUnitId(currentWorkCode.unitOfMeasureId || "");
    }
  }, [currentWorkCode]);

  const unitOptions = Array.isArray(units) 
    ? units.map((u) => ({ value: u.id, label: u.name })) 
    : [];

  // ====== PUT cập nhật dữ liệu ======
  const handleSubmit = async (data: Record<string, string>) => {
    if (!id) return alert("❌ Thiếu ID mã giao khoán để cập nhật!");

    const code = data["Mã giao khoán"]?.trim();
    const name = data["Tên mã giao khoán"]?.trim();
    
    // ✅ SỬA LỖI JSON GUID: Kiểm tra kỹ chuỗi rỗng
    // Nếu selectedUnitId là "", null, undefined thì gán cứng là null để gửi lên backend
    const unitOfMeasureId = (selectedUnitId && selectedUnitId.trim() !== "") ? selectedUnitId : null;

    if (!code) return alert("⚠️ Vui lòng nhập mã giao khoán!");
    if (!name) return alert("⚠️ Vui lòng nhập tên mã giao khoán!");

    const payload = { id, code, name, unitOfMeasureId };
    
    // 1. ✅ ĐÓNG FORM NGAY LẬP TỨC (Optimistic UI)
    // Đặt ở đây để form đóng ngay, tạo cảm giác nhanh
    onClose?.(); 
    
    try {
        // 2. CHỜ API VÀ RELOAD HOÀN TẤT
        await Promise.all([
            putData(payload, undefined),
            onSuccess?.() // ✅ SỬA LỖI LOGIC: Chỉ refresh bảng nếu API thành công
        ]);

        await new Promise(r => setTimeout(r, 0));
        
        // 4. HIỆN ALERT THÀNH CÔNG
        alert("✅ Cập nhật mã giao khoán thành công!");

    } catch (e: any) {
        // 5. Bắt lỗi
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        
        let errorMessage = "Đã xảy ra lỗi không xác định.";

        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            
            if (detail.includes("Mã đã tồn tại") || detail.includes("duplicate")) {
                errorMessage = "Mã giao khoán này đã tồn tại trong hệ thống. Vui lòng nhập mã khác!";
            } else if (detail.includes("HTTP error")) {
                errorMessage = "Yêu cầu đến máy chủ thất bại. Vui lòng kiểm tra kết nối mạng.";
            } else {
                errorMessage = `Lỗi nghiệp vụ: ${detail}`;
            }
        }

        alert(`❌ CẬP NHẬT THẤT BẠI: ${errorMessage}`);
        // Không gọi onSuccess ở đây để tránh reload bảng khi lỗi
    }
  };

  const fields = [
    {
      label: "Mã giao khoán",
      type: "text" as const,
      placeholder: "Nhập mã giao khoán",
    },
    {
      label: "Tên mã giao khoán",
      type: "text" as const,
      placeholder: "Nhập tên mã giao khoán",
    },
    { type: "custom" as const },
  ];

  return (
      <LayoutInput
        title01="Danh mục / Mã giao khoán"
        title="Chỉnh sửa Mã giao khoán"
        fields={fields}
        onSubmit={handleSubmit}
        closePath={PATHS.WORK_CODE.LIST}
        onClose={onClose}
        initialData={{
          "Mã giao khoán": formData.code,
          "Tên mã giao khoán": formData.name,
        }}
        shouldSyncInitialData={true}
      >
        <div className="custom" key={1}>
          <DropdownMenuSearchable
            label="Đơn vị tính"
            options={unitOptions}
            value={selectedUnitId}
            onChange={(value) => setSelectedUnitId(value)}
            placeholder="Chọn đơn vị tính..."
            isDisabled={loadingUnits}
          />
        </div>

        {/* Hiển thị lỗi cuối cùng */}
        {errorWorkCode && <p className="text-red-500 mt-3">Lỗi: {errorWorkCode}</p>}
      </LayoutInput>
  );
};

export default WorkCodeEdit;