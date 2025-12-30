import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supbase.ts";

export  function useMaterialRequests() {
  return useQuery({
    queryKey:['material-requests'],
    queryFn: async()=>{
     const {data,error}= await supabase.from('material_requests').select('*').order('requested_at',{ascending:false});
      if(error) throw new Error('Failed to fetch material requests');
      return data;
    },
    refetchOnMount: 'always',
  })
}
