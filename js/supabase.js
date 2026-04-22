import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = "https://qeylfwxvaznkzsyofgbx.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFleWxmd3h2YXpua3pzeW9mZ2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MTMzMjAsImV4cCI6MjA5MjI4OTMyMH0.gjE7G2ukFzGSKoL9OsvJHd3O8HXHn8B38k8ttPsbwSo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

window.sb = supabase;
window.dispatchEvent(new Event('supabase-ready'));