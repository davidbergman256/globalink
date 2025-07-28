import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const { groupId, userId } = session.metadata!

    try {
      // Record the payment in our database
      const { error: paymentError } = await supabase
        .from('payments')
        .upsert({
          group_id: groupId,
          user_id: userId,
          status: 'paid',
          stripe_session_id: session.id,
          amount_cents: 800,
        }, { onConflict: 'group_id,user_id' })

      if (paymentError) {
        console.error('Error recording payment:', paymentError)
        return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
      }

      console.log(`Payment recorded for user ${userId} in group ${groupId}`)
    } catch (error) {
      console.error('Error processing webhook:', error)
      return NextResponse.json({ error: 'Error processing webhook' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
} 