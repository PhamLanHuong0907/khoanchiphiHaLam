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
  // 1. API lấy danh sách Đơn vị tính (autoFetch: true)
  const unitPath = `/api/catalog/unitofmeasure?pageIndex=1&pageSize=1000`;
  
  // 2. API lưu Mã giao khoán (autoFetch: false)
  const assignmentPath = `/api/catalog/assignmentcode`;

  const {
    data: units,
    loading: loadingUnits,
  } = useApi<{ id: string; name: string }>(unitPath);

  const {
    postData,
    loading: saving,
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
    const unitOfMeasureId = selectedUnitId;

    if (!code) return alert("⚠️ Vui lòng nhập mã giao khoán!");
    if (!name) return alert("⚠️ Vui lòng nhập tên mã giao khoán!");
    if (!unitOfMeasureId) return alert("⚠️ Vui lòng chọn đơn vị tính!");

    const payload = { code, name, unitOfMeasureId };

    // Gọi API -> Chờ xử lý
    await postData(payload, async () => {
      // 1. Chờ reload dữ liệu bảng cha
      if (onSuccess) {
        await onSuccess();
      }

      // 2. Chờ 300ms để UI kịp vẽ lại bảng bên dưới
      setTimeout(() => {
        alert("✅ Tạo mã giao khoán thành công!");
        onClose?.();
      }, 300);
    });
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

      {saving && <p className="text-blue-500 mt-3">Đang lưu dữ liệu...</p>}
      {saveError && <p className="text-red-500 mt-3">Lỗi: {saveError}</p>}
    </LayoutInput>
  );
};

export default WorkCodeInput;