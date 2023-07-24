import path from 'path';
import { configBuilder } from '../commons/conf/config';

export const config = configBuilder(
     process.env.CONFIG_FILE.startsWith('/')
          ? process.env.CONFIG_FILE
          : path.resolve(__dirname, process.env.CONFIG_FILE)
);
