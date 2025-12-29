import { supabase } from "../lib/supbase.ts";
function MaterialRequests() {
  return (
    <>
      <h1>Material Requests Page</h1>
      <button
        onClick={async () => {
          await supabase.auth.signOut();
        }}
      >
        Sign Out
      </button>
    </>
  );
}

export default MaterialRequests;
