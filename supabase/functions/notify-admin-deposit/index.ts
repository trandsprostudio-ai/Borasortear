import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { record } = await req.json()
    
    // Obter variáveis de ambiente (O usuário deve configurar no painel do Supabase)
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error("[notify-admin-deposit] Telegram credentials missing")
      return new Response('Credentials missing', { status: 500 })
    }

    console.log(`[notify-admin-deposit] Notificando depósito de ${record.amount} Kz`)

    const message = `
<b>💰 NOVO DEPÓSITO DETECTADO!</b>
-----------------------------
<b>Valor:</b> ${record.amount} Kz
<b>Método:</b> ${record.payment_method || 'N/A'}
<b>ID Usuário:</b> ${record.user_id}
<b>Hora:</b> ${new Date(record.created_at).toLocaleString()}

<a href="${record.proof_url}">📄 VER COMPROVATIVO</a>
-----------------------------
<i>Valide agora no Painel Admin</i>
    `

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    })

    const result = await response.json()
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error: any) {
    console.error("[notify-admin-deposit] Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})