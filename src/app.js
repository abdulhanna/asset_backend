import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {errorHandler, notFoundHandler} from './helpers/express-middleware';
import authModule from './modules/auth';
import userManagementModule from './modules/user-management';
import organizationModule from './modules/organization';
import fieldManagementModule from './modules/field-management';
import masterTableModule from "./modules/master-table";

const modules = [
    authModule,
    userManagementModule,
    organizationModule,
    fieldManagementModule,
    masterTableModule
];

export const createApp = () => {
     const app = express();
     app.set('trust proxy', true);
     app.use(
          cors({
               origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:4000', 'https://api.asset.dev.client.kloudlite.io', 'https://asset.dev.client.kloudlite.io','https://cute-dieffenbachia-e110b0.netlify.app'],
               credentials: true,
          })
     );
     app.use(express.json({ limit: '250mb' }));
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
