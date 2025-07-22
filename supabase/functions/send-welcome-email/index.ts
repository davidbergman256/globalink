import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const handler = async (req: Request): Promise<Response> => {
  const { email, name } = await req.json()

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'globalink <hello@globalink.com>',
      to: [email],
      subject: 'Your meetup is organized! Payment details inside 💫',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed; font-size: 28px; margin: 0;">globalink</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 10px 0; font-size: 24px;">Great news, ${name}! 🎉</h2>
            <p style="margin: 0; font-size: 16px; opacity: 0.9;">We've organized a meetup for you with some amazing strangers!</p>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #334155; margin: 0 0 15px 0;">📍 Next Steps:</h3>
            <ol style="color: #64748b; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 12px;"><strong>Payment Required:</strong> Send <strong>$35</strong> to our Venmo account</li>
              <li style="margin-bottom: 12px;"><strong>Venmo:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">@globalink-events</code></li>
              <li style="margin-bottom: 12px;"><strong>Reference:</strong> Include your name in the payment note</li>
              <li style="margin-bottom: 12px;"><strong>Confirmation:</strong> We'll send you the venue reservation details once payment is received</li>
            </ol>
          </div>
          
          <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 20px; margin-right: 10px;">⚡</span>
              <strong style="color: #92400e;">Payment due within 24 hours</strong>
            </div>
            <p style="color: #92400e; margin: 0; font-size: 14px;">Your spot will be released if payment isn't received in time!</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #64748b; margin-bottom: 15px;">Ready to make new connections?</p>
            <a href="https://venmo.com/u/globalink-events" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Pay on Venmo</a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
            <p>Questions about payment or your meetup? Reply to this email!</p>
            <p style="margin-top: 10px; font-size: 12px;">💜 Can't wait to see the connections you'll make!</p>
          </div>
        </div>
      `,
    }),
  })

  if (res.ok) {
    const data = await res.json()
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } else {
    const error = await res.text()
    return new Response(JSON.stringify({ error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

serve(handler) 