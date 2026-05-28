import { serve } from "https://deno.land/std/http/server.ts";

serve(async () => {
  return new Response(
    JSON.stringify({
      status: "awake",
      message: "Supabase active",
      time: new Date(),
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
});