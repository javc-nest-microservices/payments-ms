import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Logger, ValidationPipe } from '@nestjs/common'
import { envs } from './config'

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
  await app.listen(3000)

  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  //   AppModule,
  //   {
  //     transport: Transport.NATS,
  //     options: {
  //       servers: envs.natsServers
  //     }
  //   }
  // )

  logger.log(`Payments microservice is running on port: ${envs.port}`)
}
bootstrap()
