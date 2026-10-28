// AI assistant client. The Gemini key and the prompt live in the `gemini-proxy` Edge Function:
// the browser only sends the visitor's message and the educator id.
import { supabase } from "../supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getChatResponse = async (message: string, profile: any): Promise<string> => {
  const { data, error } = await supabase.functions.invoke("gemini-proxy", {
    body: { message, educatorId: profile?.id },
  });
  if (error) {
    console.error("AI Chatbot error:", error);
    throw error;
  }
  return data?.text ?? "";
};
