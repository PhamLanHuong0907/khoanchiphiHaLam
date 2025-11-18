import React, { useEffect, useState } from "react";
import LayoutInput from "../../../layout/layout_input";
import PATHS from "../../../hooks/path";
import { useApi } from "../../../hooks/useFetchData"; // Ensure useApi provides fetchById, putData

interface ProductionStepGroupEditProps {
  id: string; // ID is required for editing
  onClose?: () => void;
  onSuccess?: () => void;
}

// 1. Interface for the data structure
interface ProductionStepGroupData {
  id: string;
  code: string;
  name: string;
}

const ProductionStepGroupEdit: React.FC<ProductionStepGroupEditProps> = ({
  id,
  onClose,
  onSuccess,
}) => {
  const basePath = `/api/process/processgroup`;
  // Assuming useApi<ProductionStepGroupData> correctly fetches/puts this type
  const { fetchById, putData } = useApi<ProductionStepGroupData>(basePath);

  // 2. State Separation
  const [currentData, setCurrentData] = useState<ProductionStepGroupData | null>(null); // State for fetched data
  const [formData, setFormData] = useState({ // State specifically for LayoutInput initialData
    code: "",
    name: "",
  });

  // 3. useEffect for Fetching Data by ID
  useEffect(() => {
    const loadData = async () => {
      if (!id) return; // Should have id in edit mode
      const result = await fetchById(id);
      if (result) {
        setCurrentData(result as ProductionStepGroupData); // Store fetched data
      }
    };
    loadData();
  }, [id, fetchById]); // Dependencies

  // 4. useEffect for Syncing Fetched Data to Form State
  useEffect(() => {
    if (currentData) {
      setFormData({ // Update formData when currentData is available/changes
        code: currentData.code,
        name: currentData.name,
      });
    }
  }, [currentData]); // Dependency: run when currentData changes

  // 5. handleSubmit (Logic is mostly correct, reads from LayoutInput's data)
  const handleSubmit = async (data: Record<string, string>) => {
    const code = data["Mã nhóm công đoạn sản xuất"]?.trim();
    const name = data["Tên nhóm công đoạn sản xuất"]?.trim();

    if (!code || !name) return alert("Vui lòng nhập đầy đủ thông tin!");
    if (!id) return alert("❌ Thiếu ID để cập nhật!"); // Should not happen in edit

    const payload = { id, code, name };
    console.log("📤 PUT payload:", payload);

    try {
        await putData(// Assuming PUT needs ID in URL
          payload,
          () => { // Success callback
            alert("✅ Cập nhật nhóm công đoạn thành công!");
            onSuccess?.(); // refresh table
            onClose?.();   // close popup
          }
          // Optional fourth argument 'false' if needed by your useApi
        );
      } catch (err) {
        // Error is likely handled by useApi's 'error' state, but log just in case
        console.error("Error during PUT request in handleSubmit:", err);
        // You might want to prevent closing the form on error:
        // return; 
      }
      // onClose?.(); // Moved inside the success callback
  };

  // 6. Fields definition (remains the same)
  const fields = [
    {
      label: "Mã nhóm công đoạn sản xuất",
      type: "text" as const,
      placeholder: "Nhập mã nhóm công đoạn sản xuất",
    },
    {
      label: "Tên nhóm công đoạn sản xuất",
      type: "text" as const,
      placeholder: "Nhập tên nhóm công đoạn sản xuất",
    },
  ];

  return (
 
      <LayoutInput
        title01="Danh mục / Công đoạn sản xuất / Nhóm công đoạn sản xuất"
        title="Chỉnh sửa Nhóm công đoạn sản xuất"
        fields={fields}
        onSubmit={handleSubmit}
        closePath={PATHS.PRODUCTION_STEP_GROUP.LIST}
        onClose={onClose}
        // 8. Update LayoutInput props
        initialData={{ // Use formData state which gets synced
          "Mã nhóm công đoạn sản xuất": formData.code,
          "Tên nhóm công đoạn sản xuất": formData.name,
        }}
        shouldSyncInitialData={true} // Add this prop
      >
        {/* Loading/Error removed from here */}
      </LayoutInput>
  );
};

export default ProductionStepGroupEdit;