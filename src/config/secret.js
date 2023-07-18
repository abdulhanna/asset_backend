import path from "path";


import { dirname } from "path";
import { fileURLToPath } from "url";
import {secretBuilder} from "../commons/conf/secret";


const __dirname = dirname(fileURLToPath(import.meta.url));

export const secret = secretBuilder(
  process.env.SECRET_FILE.startsWith("/")
    ? process.env.SECRET_FILE
    : path.resolve(__dirname, process.env.SECRET_FILE)
);
