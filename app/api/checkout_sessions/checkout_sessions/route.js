import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

const formatAmountForStripe = (amount, currency) => {
  // Modify if necessary based on the currency (e.g., JPY does not use cents)
  return Math.round(amount * 100); // Convert to smallest currency unit
};

const getPriceForCurrency = (currency) => {
  // Define prices for different currencies
  const prices = {
    usd: 10, // $10.00
    eur: 9,  // €9.00
    gbp: 8,  // £8.00
  };
  return prices[currency] || prices['usd']; // Fallback to USD if currency not found
};

export async function POST(req) {
  try {
    const { currency = 'usd' } = await req.json(); // Extract currency from the request body, default to 'usd'
    
    const unitAmount = formatAmountForStripe(getPriceForCurrency(currency), currency);

    const params = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency, // Use selected currency
            product_data: {
              name: 'Pro subscription',
            },
            unit_amount: unitAmount, // Adjusted price based on currency
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('referer')}result?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('referer')}cancel`,
    };

    const checkoutSession = await stripe.checkout.sessions.create(params);

    return NextResponse.json(checkoutSession, { status: 200 });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new NextResponse(JSON.stringify({ error: { message: error.message } }), {
      status: 500,
    });
  }
}

export async function GET(req) {
  const searchParams = req.nextUrl.searchParams;
  const session_id = searchParams.get('session_id');

  try {
    if (!session_id) {
      throw new Error('Session ID is required');
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

    return NextResponse.json(checkoutSession);
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
