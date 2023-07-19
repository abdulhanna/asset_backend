import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './helpers/express-middleware';
import authModule from "./modules/auth";


const modules = [
    authModule
  ];
  

export const createApp = () => {
    const app = express();
    app.set('trust proxy', true);
    app.use(
      cors({
        origin: [
          "http://localhost:3000",
        ],
        credentials: true,
      })
    );
    app.use(express.json({limit: '250mb'}));
    app.use(cookieParser());
  
    app.use(bodyParser.urlencoded({ extended: true }));
    return app;
  };
  
  export const finishApp = (app) => {
    app.use(notFoundHandler);
    app.use(errorHandler);
  };
  
  export const useModules = (app) => {
    modules.map((module) => module.init(app));
  };
  