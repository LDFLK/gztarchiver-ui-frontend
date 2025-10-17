import { useQuery } from '@tanstack/react-query';

export const useDashboardStats = (enabled = true) => {
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const apiUrl = window?.configs?.apiUrl ? window.configs.apiUrl : "/";
      const response = await fetch(`${apiUrl}/dashboard-status`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000, 
    refetchOnWindowFocus: true,
    enabled: enabled, 
  });

  return {
    data: apiData,
    isLoading,
    error,
  };
};