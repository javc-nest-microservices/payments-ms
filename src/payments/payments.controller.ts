import { Controller, Get, Post } from '@nestjs/common'
import { PaymentsService } from './payments.service'

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-session')
  createPaymentSession() {
    return this.paymentsService.createPaymentSession()
  }

  @Get('success')
  success() {
    return this.paymentsService.success()
  }

  @Get('cancel')
  cancel() {
    return this.paymentsService.cancel()
  }

  @Post('webhook')
  stripeWebhook() {
    return this.paymentsService.stripeWebhook()
  }
}
