import * as joi from 'joi';

try {
  process.loadEnvFile();
} catch (error) {
  console.log(
    'No .env file found, using environment variables from the system',
  );
}

interface EnvVars {
  PORT: number;
  DATABASE_URL: string;
  NATS_SERVERS: Array<string>;
}

// Validamos las variables de entorno
const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
    NATS_SERVERS: joi.array().items(joi.string().required()).required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  databaseUrl: envVars.DATABASE_URL,
  natsServers: envVars.NATS_SERVERS,
};
