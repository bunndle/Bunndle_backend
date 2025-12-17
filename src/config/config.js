import {config as dotenvConfig} from 'dotenv';



dotenvConfig();


const _config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'secret',
  MONGO_URI: process.env.MONGO_URI ,
  email: process.env.EMAIL_USER ,
  password: process.env.APP_PASSWORD,
  reset_scrt:process.env.RESET_SECRET
};

export default _config;