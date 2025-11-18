/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from "react";

interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
}

export function useApi<T = any>(
  basePath: string,
  options: { 
    autoRefresh?: number;
    autoFetch?: boolean; 
  } = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [totalCount, setTotalCount] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Ref để kiểm tra component còn mounted không
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ====== Helper Set State an toàn ======
  const safeSetState = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    if (isMounted.current) setter(value);
  };

  // ====== GET (Fetch data) ======
  const fetchData = useCallback(async () => {
    if (!basePath) return;
    safeSetState(setLoading, true);
    safeSetState(setError, null);

    try {
      const res = await fetch(basePath, {
        method: "GET",
        headers: { accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const result = await res.json();

      if (isMounted.current) {
        if (result && typeof result.totalCount === "number" && Array.isArray(result.items)) {
          setData(result.items);
          setTotalCount(result.totalCount);
        } else if (result?.success && Array.isArray(result.result)) {
          setData(result.result);
          setTotalCount(result.result.length);
        } else if (Array.isArray(result)) {
          setData(result);
          setTotalCount(result.length);
        } else {
           setData([]);
           setTotalCount(0);
        }
        setSuccess(true);
      }
      return result; // Return data để await

    } catch (err: any) {
      console.error("Error fetching data:", err);
      safeSetState(setError, err.message || "Error fetching data");
      safeSetState(setData, []); 
      setTotalCount(0);
    } finally {
      safeSetState(setLoading, false);
    }
  }, [basePath]);

  const refresh = useCallback(() => fetchData(), [fetchData]);

  useEffect(() => {
    const { autoFetch = true } = options;
    if (autoFetch) fetchData();
  }, [fetchData, options.autoFetch]);

  useEffect(() => {
    if (!options.autoRefresh) return;
    const interval = setInterval(fetchData, options.autoRefresh);
    return () => clearInterval(interval);
  }, [fetchData, options.autoRefresh]);

  // ====== POST (Tạo mới) ======
  const postData = useCallback(
    async (body: T, onSuccess?: () => Promise<void> | void) => {
      safeSetState(setLoading, true);
      safeSetState(setError, null);
      safeSetState(setSuccess, false);
      try {
        const res = await fetch(basePath.split("?")[0], { 
          method: "POST",
          headers: { "Content-Type": "application/json", "accept": "application/json" },
          body: JSON.stringify(body),
        });
        
        if (!res.ok) {
           const errText = await res.text();
           throw new Error(`HTTP error! status: ${res.status} - ${errText}`);
        }
        
        await res.json();
        safeSetState(setSuccess, true);
        
        // Chỉ reload nội bộ hook này NẾU nó đang chế độ autoFetch (đang hiển thị list)
        // Giúp form input (autoFetch=false) không bị fetch thừa
        if (options.autoFetch !== false) {
            await fetchData();
        }

        // QUAN TRỌNG: Chờ Parent reload xong
        if (onSuccess) await onSuccess(); 

      } catch (err: any) {
        console.error("Error posting data:", err);
        safeSetState(setError, err.message || "Error posting data");
      } finally {
        safeSetState(setLoading, false);
      }
    },
    [basePath, fetchData, options.autoFetch]
  );

  // ====== PUT (Cập nhật) ======
  const putData = useCallback(
    async (body: T, onSuccess?: () => Promise<void> | void) => {
      safeSetState(setLoading, true);
      safeSetState(setError, null);
      try {
        const res = await fetch(basePath.split("?")[0], {
          method: "PUT",
          headers: { "Content-Type": "application/json", "accept": "application/json" },
          body: JSON.stringify(body),
        });
         if (!res.ok) {
           const errText = await res.text();
           throw new Error(`HTTP error! status: ${res.status} - ${errText}`);
        }
        await res.json();
        safeSetState(setSuccess, true);

        if (options.autoFetch !== false) await fetchData(); 
        if (onSuccess) await onSuccess();

      } catch (err: any) {
        console.error("Error putting data:", err);
        safeSetState(setError, err.message);
      } finally {
        safeSetState(setLoading, false);
      }
    },
    [basePath, fetchData, options.autoFetch]
  );

  // ====== DELETE ======
  const deleteData = useCallback(
    async (id: string | number, onSuccess?: () => Promise<void> | void) => {
      safeSetState(setLoading, true);
      try {
        const res = await fetch(`${basePath}`, { 
          method: "DELETE",
          headers: { "accept": "application/json" },
        });
         if (!res.ok) {
           const errText = await res.text();
           throw new Error(`HTTP error! status: ${res.status} - ${errText}`);
        }
        await res.json();
        safeSetState(setSuccess, true);

        if (options.autoFetch !== false) await fetchData();
        if (onSuccess) await onSuccess();
      } catch (err: any) {
        console.error("Error deleting data:", err);
        safeSetState(setError, err.message);
      } finally {
        safeSetState(setLoading, false);
      }
    },
    [basePath, fetchData, options.autoFetch]
  );

  // ====== GET BY ID ======
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
  
  return {
    data,
    totalCount, 
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