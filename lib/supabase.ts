import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://scfuwyqvhbawavtpkchp.supabase.co";
const supabaseKey = "sb_publishable_U3qVtn6AmL_-eMBLzxCNIg_xeUlD5QP";

export const supabase = createClient(supabaseUrl, supabaseKey);
