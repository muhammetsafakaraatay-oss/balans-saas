import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email, userId } = await req.json()

  const response = await fetch('https://api.paddle.com/transactions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [{ price_id: process.env.PADDLE_PRICE_ID, quantity: 1 }],
      customer: { email },
      custom_data: { user_id: userId },
      checkout: { url: 'https://balans-eta.vercel.app/dashboard' }
    })
  })

  const data = await response.json()
  return NextResponse.json({ checkoutUrl: data.data?.checkout?.url })
}
