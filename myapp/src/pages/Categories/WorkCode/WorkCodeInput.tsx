import React, { useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import PATHS from "../../../hooks/path";
import { useApi } from "../../../hooks/useFetchData";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable";

interface WorkCodeInputProps {
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void;
}

const WorkCodeInput: React.FC<WorkCodeInputProps> = ({
  onClose,
  onSuccess,
}) => {
  const unitPath = `/api/catalog/unitofmeasure?pageIndex=1&pageSize=1000`;
  const assignmentPath = `/api/catalog/assignmentcode`;

  const {
    data: units,
    loading: loadingUnits,
  } = useApi<{ id: string; name: string }>(unitPath);

  const {
    postData,
    error: saveError,
  } = useApi(assignmentPath, { autoFetch: false });

  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  
  const [formData] = useState({
    code: "",
    name: "",
  });

  const unitOptions = Array.isArray(units)
    ? units.map((u) => ({
        value: u.id,
        label: u.name,
      }))
    : [];

  const handleSubmit = async (data: Record<string, string>) => {
    const code = data["Mã giao khoán"]?.trim();
    const name = data["Tên mã giao khoán"]?.trim();
    
    // ✅ CHỈNH SỬA: Nếu selectedUnitId là rỗng thì gán là null
    // Backend thường yêu cầu null thay vì chuỗi rỗng "" đối với trường ID
    const unitOfMeasureId = selectedUnitId || null;

    if (!code) return alert("⚠️ Vui lòng nhập mã giao khoán!");
    if (!name) return alert("⚠️ Vui lòng nhập tên mã giao khoán!");
    
    // Không check unitOfMeasureId nữa để cho phép rỗng

    const payload = { code, name, unitOfMeasureId };

    // 1. ĐÓNG FORM NGAY LẬP TỨC
    

    try {
        // 2. CHỜ API HOÀN TẤT
        await Promise.all([
            postData(payload, undefined)
        ]);

        await new Promise(r => setTimeout(r, 0));
        onClose?.();
        onSuccess?.()
        // 4. HIỆN ALERT THÀNH CÔNG
        alert("✅ Tạo mã giao khoán thành công!");

    } catch (e: any) {
        // 5. BẮT LỖI và alert thất bại
        console.error("Lỗi giao dịch sau khi đóng form:", e);
        
        let errorMessage = "Đã xảy ra lỗi không xác định.";

        if (e && typeof e.message === 'string') {
            const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
            
            if (detail.includes("Mã đã tồn tại") || detail.includes("exists")) {
                errorMessage = "Mã giao khoán này đã tồn tại trong hệ thống. Vui lòng nhập mã khác!";
            } else if (detail.includes("HTTP error")) {
                errorMessage = "Yêu cầu đến máy chủ thất bại. Vui lòng kiểm tra kết nối mạng hoặc liên hệ quản trị viên.";
            } else {
                errorMessage = `Lỗi nghiệp vụ: ${detail}`;
            }
        }
        
        // 6. HIỂN THỊ ALERT THẤT BẠI CHI TIẾT
        alert(`❌ TẠO THẤT BẠI: ${errorMessage}`);
    }
    
  };

  const fields = [
    {
      label: "Mã giao khoán",
      type: "text" as const,
      placeholder: "Nhập mã giao khoán, ví dụ: VLN ",
    },
    {
      label: "Tên mã giao khoán",
      type: "text" as const,
      placeholder: "Nhập tên mã giao khoán, ví dụ: Vật liệu nổ",
    },
    { type: "custom" as const }, 
  ];

  return (
    <LayoutInput
      title01="Danh mục / Mã giao khoán"
      title="Tạo mới Mã giao khoán"
      fields={fields}
      onSubmit={handleSubmit}
      closePath={PATHS.WORK_CODE.LIST}
      onClose={onClose}
      initialData={{
        "Mã giao khoán": formData.code,
        "Tên mã giao khoán": formData.name,
      }}
    >
      {/* Dropdown nằm ở vị trí custom */}
      <div className="custom">
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
      {saveError && <p className="text-red-500 mt-3">Lỗi: {saveError}</p>}
    </LayoutInput>
  );
};

export default WorkCodeInput;