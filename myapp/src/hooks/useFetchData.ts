/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";

/**
 * Interface cho API response có phân trang
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PaginatedResponse<T> {
  items: T[];       // Mảng dữ liệu của trang hiện tại
  totalCount: number; // Tổng số bản ghi
}

/**
 * Hook API tổng hợp hỗ trợ CRUD và Phân trang Phía Server
 *
 * @param basePath - Đường dẫn API (có thể chứa query params động)
 * @param options - { autoRefresh?: number, autoFetch?: boolean }
 */

export function useApi<T = any>(
  basePath: string,
  options: { 
    autoRefresh?: number;
    autoFetch?: boolean; // Tùy chọn để tắt auto-fetch (cho POST/PUT)
  } = {}
) {
  // ===== Trạng thái chung =====
  const [data, setData] = useState<T[]>([]);
  const [totalCount, setTotalCount] = useState(0); // <-- STATE QUAN TRỌNG
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ====== GET (Fetch data) ======
  const fetchData = useCallback(async () => {
    if (!basePath) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(basePath, {
        method: "GET",
        headers: { accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const result = await res.json();

      // --- 🔽 LOGIC MỚI QUAN TRỌNG Ở ĐÂY 🔽 ---
      
      // 1. Ưu tiên kiểm tra cấu trúc phân trang { items: [...], totalCount: ... }
      if (
        result &&
        typeof result.totalCount === "number" &&
        Array.isArray(result.items)
      ) {
        setData(result.items);
        setTotalCount(result.totalCount);
      }
      // 2. Fallback về logic cũ (API trả về { success: true, result: [...] })
      else if (result?.success && Array.isArray(result.result)) {
        setData(result.result);
        setTotalCount(result.result.length); // Không có phân trang, tự đếm
      }
      // 3. Fallback về logic cũ (API trả về mảng trực tiếp [...])
      else if (Array.isArray(result)) {
        setData(result);
        setTotalCount(result.length); // Không có phân trang, tự đếm
      }
      // 4. Lỗi không đúng định dạng
      else {
         throw new Error("Unexpected API format. Expected { items: [], totalCount: 0 } or [...]");
      }
      // --- 🔼 KẾT THÚC LOGIC MỚI 🔼 ---

      setSuccess(true);
    
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Error fetching data");
      setData([]); // Xóa data cũ khi có lỗi
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [basePath]); // Hook sẽ tự fetch lại khi 'basePath' thay đổi

  // ===== Refresh dữ liệu =====
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // ===== Tự fetch khi mount =====
  useEffect(() => {
    const { autoFetch = true } = options; // Mặc định là true
    if (autoFetch === false) {
      return; // Bỏ qua nếu 'autoFetch: false'
    }
    fetchData();
  }, [fetchData, options.autoFetch]);

  // ===== Auto refresh (Giữ nguyên) =====
  useEffect(() => {
    if (!options.autoRefresh) return;
    const interval = setInterval(fetchData, options.autoRefresh);
    return () => clearInterval(interval);
  }, [fetchData, options.autoRefresh]);

  // ====== POST (Tạo mới) ======
  const postData = useCallback(
    async (body: T, onSuccess?: () => void) => {
      setLoading(true);
      setError(null);
      setSuccess(false);
      try {
        // Chỉ POST về base path (loại bỏ query params)
        const res = await fetch(basePath.split("?")[0], { 
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "accept": "application/json",
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
           const errText = await res.text();
           throw new Error(`HTTP error! status: ${res.status} - ${errText}`);
        }
        await res.json();
        setSuccess(true);
        if (onSuccess) onSuccess(); // Để component cha gọi 'refresh'
      } catch (err: any) {
        console.error("Error posting data:", err);
        setError(err.message || "Error posting data");
      } finally {
        setLoading(false);
      }
    },
    [basePath]
  );

  // ====== PUT (Cập nhật) ======
  const putData = useCallback(
    async (body: T, onSuccess?: () => void) => {
      setLoading(true);
      setError(null);
      setSuccess(false);
      try {
        const url = basePath.split("?")[0];
        const res = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "accept": "application/json",
          },
          body: JSON.stringify(body),
        });
         if (!res.ok) {
           const errText = await res.text();
           throw new Error(`HTTP error! status: ${res.status} - ${errText}`);
        }
        await res.json();
        setSuccess(true);
        if (onSuccess) onSuccess();
      } catch (err: any) {
        console.error("Error putting data:", err);
        setError(err.message || "Error putting data");
      } finally {
        setLoading(false);
      }
    },
    [basePath]
  );

  // ====== DELETE (Xóa dữ liệu) ======
  const deleteData = useCallback(
    async (id: string | number, onSuccess?: () => void) => {
      setLoading(true);
      setError(null);
      setSuccess(false);
      try {
        const res = await fetch(`${basePath.split("?")[0]}/${id}`, { 
          method: "DELETE",
          headers: { "accept": "application/json" },
        });
         if (!res.ok) {
           const errText = await res.text();
           throw new Error(`HTTP error! status: ${res.status} - ${errText}`);
        }
        await res.json();
        setSuccess(true);
        if (onSuccess) onSuccess();
      } catch (err: any) {
        console.error("Error deleting data:", err);
        setError(err.message || "Error deleting data");
      } finally {
        setLoading(false);
      }
    },
    [basePath]
  );

  // ====== GET BY ID (Fetch 1 bản ghi) ======
  const fetchById = useCallback(
    async (id: string | number): Promise<T | null> => {
      if (!basePath || !id) return null;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${basePath.split("?")[0]}/${id}`, {
          method: "GET",
          headers: { "accept": "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const result = await res.json();
        if (result?.success && result?.result) return result.result;
        if (result) return result;
        return null;
      } catch (err: any) {
        console.error("Error fetching by ID:", err);
        setError(err.message || "Error fetching by ID");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [basePath]
  );
  
  // ===== Trả về toàn bộ API methods =====
  return {
    data,
    totalCount, // <-- Trả về state mới
    loading,
    error,
    success,
    refresh,
    fetchData,
    fetchById,
    postData,
    putData,
    deleteData,
  };
}