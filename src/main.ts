import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Logger, ValidationPipe } from '@nestjs/common'
import { envs } from './config'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

async function bootstrap() {
  const logger = new Logger('PaymentsBootstrap')

  const app = await NestFactory.create(AppModule, {
    rawBody: true
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })
  )

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: {
        servers: envs.natsServers
      }
    },
    {
      // * https://docs.nestjs.com/faq/hybrid-application#sharing-configuration
      // ! This is necessary to hybrid applications be able to apply class-validator and class-transformer decorators
      inheritAppConfig: true
    }
  )

  await app.startAllMicroservices()

  await app.listen(envs.port)
  logger.log(`Payments microservice is running on port: ${envs.port}`)
}
bootstrap()
