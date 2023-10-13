import {Router} from 'express';
import  masterTableRouter from './router/masterTable'

const router = Router();
router.use('/master-table', masterTableRouter);


const masterTableModule = {
    init: (app) => {
        app.use(router);
        Logger.info({
            msg: 'masterTable module Loaded',
        });
    },
};

export default masterTableModule;
