import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { PaymentSessionDto } from './dto'
import { Request, Response } from 'express'
import { MessagePattern } from '@nestjs/microservices'

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-session')
  @MessagePattern('create.payment.session')
  createPaymentSession(@Body() paymentSessionDto: PaymentSessionDto) {
    return this.paymentsService.createPaymentSession(paymentSessionDto)
  }

  @Post('webhook')
  stripeWebhook(@Req() req: Request, @Res() res: Response) {
    return this.paymentsService.stripeWebhook(req, res)
  }

  @Get('success')
  success() {
    return this.paymentsService.success()
  }

  @Get('cancel')
  cancel() {
    return this.paymentsService.cancel()
  }
}
