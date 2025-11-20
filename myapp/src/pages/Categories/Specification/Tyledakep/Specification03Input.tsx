import React, { useState } from "react";
import PATHS from "../../../../hooks/path";
import { useApi } from "../../../../hooks/useFetchData";
import LayoutInput from "../../../../layout/layout_input";
import DropdownMenuSearchable from "../../../../components/dropdown_menu_searchable"; // 👈 THÊM IMPORT

// Định nghĩa cấu trúc cho data từ API (Process và Hardness)
interface ApiOption {
  id: string | number;
  name: string;
}
interface HardOptions{
  id: string;
  value: string;
}
// 3. Cập nhật props
interface Specification03InputProps {
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void;
}

export default function Specification03Input({
  onClose,
  onSuccess,
}: Specification03InputProps) {
  // 3. Khai báo state cho giá trị dropdown
  const [processId, setProcessId] = useState<string>("");
  const [hardnessId, setHardnessId] = useState<string>("");

  // 4. Khai báo API POST
  const basePath = `/api/product/stoneclampratio`;
  const { postData, loading: saving, error: saveError } = useApi(basePath, { autoFetch: false });

  // 5. Khai báo API GET cho Công đoạn sản xuất
  const { data: processs, loading: loadingProcess } = useApi<ApiOption>(
    `/api/process/productionprocess?pageIndex=1&pageSize=1000`
  );

  // 6. Khai báo API GET cho Độ kiên cố than/đá (f)
  const { data: hardnesses, loading: loadingHardness } = useApi<HardOptions>(
    `/api/product/hardness?pageIndex=1&pageSize=1000`
  );

  // 7. Chuyển đổi data API sang định dạng options cho Dropdown
  const processOptions = processs.map((p) => ({
    value: p.id.toString(), // Chuyển ID sang string
    label: p.name,
  }));

  const hardnessOptions = hardnesses.map((h) => ({
    value: h.id.toString(), // Chuyển ID sang string
    label: h.value,
  }));

  // --- HÀM MỚI: Chặn nhập dấu phẩy (,) ---
  // Người dùng bắt buộc phải dùng dấu chấm (.)
  const blockCommaInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',') {
      e.preventDefault(); // Ngăn phím ','
    }
  };

  // 5. Cập nhật handleSubmit
  const handleSubmit = async (data: Record<string, string>) => {
    // Lấy dữ liệu từ form
    const rawValue = data["Tỷ lệ đá kẹp (Ckep)"]?.trim();
    const rawCoefficient = data["Hệ số điều chỉnh định mức"]?.trim();

    // Validation cơ bản
    if (!rawValue) return alert("⚠️ Vui lòng nhập Tỷ lệ đá kẹp!");
    if (!rawCoefficient) return alert("⚠️ Vui lòng nhập Hệ số điều chỉnh định mức!");
    // Validation mới cho dropdown
    if (!processId) return alert("⚠️ Vui lòng chọn Công đoạn sản xuất!");
    if (!hardnessId) return alert("⚠️ Vui lòng chọn Độ kiên cố than/đá (f)!");

    // --- XỬ LÝ FORMAT (Safety) ---
    // Dù đã chặn phím ',', ta vẫn replace để phòng trường hợp user copy-paste văn bản chứa dấu ',' vào.
    const formattedValue = rawValue.replace(/,/g, '.'); 
    const formattedCoefficient = rawCoefficient.replace(/,/g, '.'); // "1,98" -> "1.98"

    // Validation số cho Hệ số (Vì hệ số bắt buộc là số)
    if (isNaN(Number(formattedCoefficient))) {
      return alert("⚠️ Hệ số điều chỉnh phải là số hợp lệ (Ví dụ: 1.98)!");
    }

    // Payload
    const payload = {
      // Tỷ lệ đá kẹp giữ là STRING vì chứa ký tự so sánh (<=, Ckep)
      value: formattedValue, 
      
      // Hệ số chuyển sang NUMBER (float) trước khi post
      coefficientValue: parseFloat(formattedCoefficient),
      hardnessId,
      processId,
    };

    // 1. Gọi API
    try {
      await Promise.all([
        postData(payload, undefined),
      ]);

      await new Promise(r => setTimeout(r, 0));

      alert("✅ Tạo Tỷ lệ đá kẹp thành công!");
      onClose?.();
      onSuccess?.();

    } catch (e: any) {
      console.error("Lỗi giao dịch:", e);
      let errorMessage = "Đã xảy ra lỗi không xác định.";

      if (e && typeof e.message === 'string') {
        const detail = e.message.replace(/HTTP error! status: \d+ - /i, '').trim();
        if (detail.includes("đã tồn tại") || detail.includes("duplicate")) {
          errorMessage = "Tỷ lệ đá kẹp này đã tồn tại. Vui lòng nhập giá trị khác!";
        } else if (detail.includes("network")) {
          errorMessage = "Lỗi kết nối máy chủ.";
        } else {
          errorMessage = `Lỗi: ${detail}`;
        }
      }
      alert(`❌ TẠO THẤT BẠI: ${errorMessage}`);
    }
  };

  // Fields (Chỉ giữ lại các trường text input được handle bởi LayoutInput)
  const fields = [
    { type: "custom1" as const },
    { type: "custom2" as const },
    {
      label: "Tỷ lệ đá kẹp (Ckep)",
      type: "text" as const,
      // Placeholder hướng dẫn đúng định dạng dấu chấm
      placeholder: "Nhập tỷ lệ đá kẹp, ví dụ: 2.0<=Ckep<3.0", 
      enableCompare: true,
      // Chặn dấu phẩy, ép dùng dấu chấm
      onKeyDown: blockCommaInput,
    },
    {
      label: "Hệ số điều chỉnh định mức",
      type: "text" as const,
      placeholder: "Nhập hệ số điều chỉnh định mức, ví dụ: 1.2",
      // Chặn dấu phẩy
      onKeyDown: blockCommaInput,
    },
  ];

  return (
    <LayoutInput
      title01="Danh mục / Thông số / Tỷ lệ đá kẹp"
      title="Tạo mới Tỷ lệ đá kẹp"
      fields={fields}
      onSubmit={handleSubmit}
      closePath={PATHS.SPECIFICATION_03.LIST}
      onClose={onClose}
      initialData={{
        "Tỷ lệ đá kẹp (Ckep)": "",
        "Hệ số điều chỉnh định mức": "",
      }}
    >
      {/* ================== THAY ĐỔI MỚI: Thêm 2 dropdown ================== */}
      <div className="custom1">
        {/* Dropdown Công đoạn sản xuất */}
        <DropdownMenuSearchable
          label="Công đoạn sản xuất"
          placeholder={"Chọn công đoạn"}
          options={processOptions}
          value={processId}
          onChange={setProcessId}
          isDisabled={loadingProcess || saving}
        />
        </div>
        {/* Dropdown Độ kiên cố than/đá (f) */}
        <div className="custom2">
        <DropdownMenuSearchable
          label="Độ kiên cố than/đá (f)"
          placeholder={"Chọn độ kiên cố"}
          options={hardnessOptions}
          value={hardnessId}
          onChange={setHardnessId}
          isDisabled={loadingHardness || saving}
        />
      </div>
      {/* ================================================================= */}

      {saving && <p className="text-blue-500 mt-3">Đang xử lý...</p>}
      {saveError && <p className="text-red-500 mt-3">Lỗi: {saveError.toString()}</p>}
    </LayoutInput>
  );
}