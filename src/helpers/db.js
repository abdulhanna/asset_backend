import mongoose from 'mongoose';
import {secret} from "../config/secret";


(async () => {

  const dbUrl = secret.db_url;
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    Logger.info({
      msg: 'Connected to DB',
    });
  } catch (err) {
    Logger.error({
      msg: 'Unable to connect to database',
      err,
    });
  }
})();

