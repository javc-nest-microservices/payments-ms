import 'dotenv/config'
import * as joi from 'joi'

interface IEnv {
  PORT: number
  STRIPE_SECRET: string
}

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    STRIPE_SECRET: joi.string().required()
  })
  .unknown(true)

const { error, value } = envSchema.validate(process.env)

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const envVars: IEnv = value

export const envs = {
  port: envVars.PORT,
  stripeSecret: envVars.STRIPE_SECRET
}
