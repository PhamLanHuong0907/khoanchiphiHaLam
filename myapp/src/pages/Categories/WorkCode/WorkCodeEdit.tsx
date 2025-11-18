import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import PATHS from "../../../hooks/path";
import DropdownMenuSearchable from "../../../components/dropdown_menu_searchable";
import { useApi } from "../../../hooks/useFetchData";

interface WorkCodeEditProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => void;
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
  // ====== API setup ======
  const workCodePath = `/api/catalog/assignmentcode`;
  const unitPath = `/api/catalog/unitofmeasure`;

  // useApi cho WorkCode (GET theo id + PUT)
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
    loading: loadingUnits,
    error: errorUnits,
  } = useApi<{ id: string; name: string }>(unitPath);

  // ====== State ======
  const [currentWorkCode, setCurrentWorkCode] = useState<WorkCode | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
  });

  // ====== Fetch dữ liệu WorkCode theo ID ======
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const res = await fetchById(id); // GET: /api/catalog/assignmentcode/{id}
      if (res) setCurrentWorkCode(res as WorkCode);
    };
    loadData();
  }, [id, fetchById]);

  // ====== Gán dữ liệu vào form ======
  useEffect(() => {
    if (currentWorkCode) {
      setFormData({
        code: currentWorkCode.code,
        name: currentWorkCode.name,
      });
      setSelectedUnitId(currentWorkCode.unitOfMeasureId || "");
    }
  }, [currentWorkCode]);

  // ====== Load danh sách đơn vị tính ======
  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const unitOptions =
    units?.map((u) => ({
      value: u.id,
      label: u.name,
    })) || [];

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
    console.log("📤 PUT:", payload);
    await putData(
      payload,
      () => {
        alert("✅ Cập nhật mã giao khoán thành công!");
        onSuccess?.(); // refresh bảng ngoài
        onClose?.();   // đóng popup
      },
    );
  };

  // ====== Fields ======
  const fields = [
    // custom slot cho dropdown
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
    { type: "custom" as const }, // Đặt slot custom ở cuối
  ];

  return (
    // SỬA ĐỔI: Bọc bằng Fragment
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
        shouldSyncInitialData={true} // đồng bộ dữ liệu sau khi fetch
      >
        {/* Dropdown Đơn vị tính */}
        {/* SỬA ĐỔI: Thêm className="custom" để khớp với type */}
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


        {/* Trạng thái tải & lỗi (ĐÃ XÓA KHỎI ĐÂY) */}
      </LayoutInput>
  );
};

export default WorkCodeEdit;