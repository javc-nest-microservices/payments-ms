import { Injectable } from '@nestjs/common'
import { envs } from 'src/config'
import Stripe from 'stripe'

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecret, {})

  createPaymentSession() {
    return 'Payment session created'
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

  stripeWebhook() {
    return {
      ok: true,
      message: 'Webhook received'
    }
  }
}
