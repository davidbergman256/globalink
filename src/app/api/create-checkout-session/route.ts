import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  try {
    const { groupId } = await request.json()

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 })
    }

    // Verify user authentication and group membership
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get group details and verify user is a member
    const { data: group } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single()

    if (!group || !group.member_ids.includes(user.id)) {
      return NextResponse.json({ error: 'Group not found or unauthorized' }, { status: 404 })
    }

    // Check if user already paid
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single()

    if (existingPayment && existingPayment.status === 'paid') {
      return NextResponse.json({ error: 'Payment already completed' }, { status: 400 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Globalink Meetup - ${group.venue_name || 'Event'}`,
              description: 'Refundable deposit for your meetup spot',
            },
            unit_amount: 800, // $8.00 in cents
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
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 