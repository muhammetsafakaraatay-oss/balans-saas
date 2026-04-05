import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const eventType = body.event_type

  if (eventType === 'subscription.activated' || eventType === 'subscription.updated') {
    const userId = body.data?.custom_data?.user_id
    if (userId) {
      await supabase.from('gyms').update({ plan: 'pro' }).eq('user_id', userId)
    }
  }

  if (eventType === 'subscription.canceled') {
    const userId = body.data?.custom_data?.user_id
    if (userId) {
      await supabase.from('gyms').update({ plan: 'free' }).eq('user_id', userId)
    }
  }

  return NextResponse.json({ ok: true })
}
