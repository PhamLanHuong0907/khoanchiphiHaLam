import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import PATHS from "../../../hooks/path";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable";
import { useApi } from "../../../hooks/useFetchData";

interface WorkCodeEditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void; // ✅ Async
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
  const unitPath = `/api/catalog/unitofmeasure`;

  // useApi cho WorkCode
  const {
    fetchById,
    putData,
    loading: loadingWorkCode,
    error: errorWorkCode,
  } = useApi<WorkCode>(workCodePath);

  // useApi cho danh sách đơn vị tính
  const {
    fetchData: fetchUnits,
    data: units,
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
      setSelectedUnitId(currentWorkCode.unitOfMeasureId || "");
    }
  }, [currentWorkCode]);

  // Load danh sách đơn vị tính
  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const unitOptions = Array.isArray(units) 
    ? units.map((u) => ({ value: u.id, label: u.name })) 
    : [];

  // ====== PUT cập nhật dữ liệu ======
  const handleSubmit = async (data: Record<string, string>) => {
    const code = data["Mã giao khoán"]?.trim();
    const name = data["Tên mã giao khoán"]?.trim();
    const unitOfMeasureId = selectedUnitId;

    if (!id) return alert("❌ Thiếu ID mã giao khoán để cập nhật!");
    if (!unitOfMeasureId) return alert("⚠️ Vui lòng chọn đơn vị tính!");
    if (!code) return alert("⚠️ Vui lòng nhập mã giao khoán!");
    if (!name) return alert("⚠️ Vui lòng nhập tên mã giao khoán!");

    const payload = { id, code, name, unitOfMeasureId };
    
    await putData(
      payload,
      async () => {
        // 1. Chờ reload dữ liệu
        if (onSuccess) {
            await onSuccess();
        }
        
        // 2. Chờ 300ms UI vẽ xong
        setTimeout(() => {
            alert("✅ Cập nhật mã giao khoán thành công!");
            onClose?.();
        }, 300);
      },
    );
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
          />
        </div>

        {loadingWorkCode && <p className="text-blue-500 mt-3">Đang lưu dữ liệu...</p>}
        {errorWorkCode && <p className="text-red-500 mt-3">Lỗi: {errorWorkCode}</p>}
      </LayoutInput>
  );
};

export default WorkCodeEdit;