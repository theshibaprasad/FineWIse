import { useState, useCallback } from "react";

const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fn = useCallback(async (...args) => {
    setLoading(true);
    setIsLoading(true);
    setError(null);
    setData(undefined);

    try {
      const response = await cb(...args);
      
      // Handle both success and error responses
      if (response && response.success === false) {
        setError(new Error(response.error || "Operation failed"));
        return response;
      }
      
      setData(response);
      setError(null);
      return response;
    } catch (error) {
      const errorMessage = error.message || "An unexpected error occurred";
      setError(new Error(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  }, [cb]);

  // Reset function to clear state
  const reset = useCallback(() => {
    setData(undefined);
    setLoading(false);
    setIsLoading(false);
    setError(null);
  }, []);

  return { 
    data, 
    loading, 
    isLoading,
    error, 
    fn, 
    setData,
    reset 
  };
};

export default useFetch;
