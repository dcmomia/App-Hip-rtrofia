
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://buayeoxnovsnqaozynrt.supabase.co'
const supabaseKey = 'sb_publishable_fsJHWJmL_1eaYJYyvEb0NA_e6clyjGR'

export const supabase = createClient(supabaseUrl, supabaseKey)
