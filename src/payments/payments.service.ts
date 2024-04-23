import { Inject, Injectable, Logger } from '@nestjs/common'
import { NATS_SERVICE, envs } from 'src/config'
import Stripe from 'stripe'
import { PaymentSessionDto } from './dto'
import { Request, Response } from 'express'
import { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecret, {})
  private readonly logger = new Logger('PaymentsService')

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, items, orderId } = paymentSessionDto

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
        metadata: {
          orderId: orderId
        }
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: envs.stripeSuccessUrl,
      cancel_url: envs.stripeCancelUrl
    })

    // return session
    return {
      cancelUrl: session.cancel_url,
      successUrl: session.success_url,
      url: session.url
    }
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
    // Testing
    // const endpointSecret =
    //   'whsec_195a53b38bfc66ea1cc1fc738b75bf4e347f33f1d2020fd5deb5a16d8f441e0b'

    const endpointSecret = envs.stripeEndpointSecret

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
        const chargeSucceeded = event.data.object

        // Payment was successful

        const payload = {
          stripePaymentId: chargeSucceeded.id,
          orderId: chargeSucceeded.metadata.orderId,
          receiptUrl: chargeSucceeded.receipt_url
        }

        this.client.emit('payment.succeeded', payload)

        this.logger.log(
          `Payment was successful: ${JSON.stringify(payload, null, 2)}`
        )

        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return res.status(200).send({
      sig
    })
  }
}
