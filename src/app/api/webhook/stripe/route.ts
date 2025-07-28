import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  try {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')!
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

    const event = stripe.webhooks.constructEvent(body, sig, endpointSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      const { groupId, userId } = session.metadata

      const supabase = createSupabaseServerClient()
      
      await supabase
        .from('payments')
        .upsert({
          group_id: groupId,
          user_id: userId,
          status: 'paid',
          stripe_session_id: session.id,
          amount_cents: 800,
        })

      console.log(`Payment recorded: ${userId} in group ${groupId}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 })
  }
} 