import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { type } = await req.json()

    console.log(`[admin-system-reset] Solicitando reset de: ${type}`)

    if (type === 'affiliates') {
      // 1. Limpa histórico de ganhos de afiliados
      await supabaseAdmin.from('referral_earnings').delete().filter('id', 'not.is', null)
      // 2. Reseta os contadores nos perfis
      await supabaseAdmin.from('profiles').update({ 
        referrals_count: 0, 
        total_earnings: 0 
      }).filter('id', 'not.is', null)
    } 
    else if (type === 'profit') {
      // Remove registros de ganhos da plataforma (onde user_id é NULL)
      await supabaseAdmin.from('winners').delete().is('user_id', null)
    }
    else {
      // Limpa transações concluídas por tipo (deposit/withdrawal)
      await supabaseAdmin.from('transactions').delete().eq('type', type).eq('status', 'completed')
    }

    return new Response(
      JSON.stringify({ message: 'Dados resetados com sucesso' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})