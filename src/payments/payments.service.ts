import { Injectable } from '@nestjs/common'
import { envs } from 'src/config'
import Stripe from 'stripe'
import { PaymentSessionDto } from './dto'
import { Request, Response } from 'express'

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecret, {})

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, items } = paymentSessionDto

    const lineItems = items.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.name
        },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: item.quantity
    }))

    const session = await this.stripe.checkout.sessions.create({
      // add here my orderId
      payment_intent_data: {
        metadata: {}
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:3000/payments/success',
      cancel_url: 'http://localhost:3000/cancel/success'
    })

    return session
  }

  success() {
    return {
      ok: true,
      message: 'Payment successful'
    }
  }

  cancel() {
    return {
      ok: false,
      message: 'Payment cancelled'
    }
  }

  stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature']

    let event: Stripe.Event
    const endpointSecret =
      'whsec_195a53b38bfc66ea1cc1fc738b75bf4e347f33f1d2020fd5deb5a16d8f441e0b'
    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        sig,
        endpointSecret
      )
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`)
      return
    }

    switch (event.type) {
      case 'charge.succeeded':
        // Payment was successful
        console.log(event)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return res.status(200).send({
      sig
    })
  }
}
