import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supbase.ts";

export function useMaterialRequests() {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['material-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('material_requests')
        .select('*')
        .order('requested_at', { ascending: false });
      
      if (error) throw new Error('Failed to fetch material requests');
      return data;
    },
    refetchOnMount: 'always',
  });

  // mutate function this tells the react query to refetch the data
  const mutate = () => {
    queryClient.invalidateQueries({ queryKey: ['material-requests'] });
  };

  return {
    ...query,
    mutate, // Add mutate to the return object
  };
}