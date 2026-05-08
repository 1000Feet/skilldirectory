import { supabase } from "@/integrations/supabase/client";

export const getChatResponse = async (message: string, profile: any): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('gemini-proxy', {
    body: { message, profile },
  });

  if (error) {
    console.error('gemini-proxy invoke error:', error);
    throw error;
  }
  if (!data?.text) {
    throw new Error('Empty response from AI');
  }
  return data.text as string;
};
