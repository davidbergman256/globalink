import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  try {
    const { groupId } = await request.json()

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID required' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: group } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single()

    if (!group || !group.member_ids.includes(user.id)) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Globalink Meetup - ${group.venue_name || 'Event'}`,
              description: 'Refundable deposit for your meetup',
            },
            unit_amount: 800,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/payment/success?session_id={CHECKOUT_SESSION_ID}&group_id=${groupId}`,
      cancel_url: `${request.headers.get('origin')}/group/${groupId}`,
      metadata: {
        groupId,
        userId: user.id,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
} 