import './helpers/db';
import {useHttpLogging} from '@madhouselabs/http-helpers';
import {StatusCodes} from 'http-status-codes';
import http from 'http';
import {useRateLimiter} from '@madhouselabs/rate-limiter';
import {finishApp, createApp, useModules} from './app';
import {config} from './config/config';
import {secret} from './config/secret';
import {initPassport} from './modules/auth/router/passport';

(async () => {
    const app = createApp();
    useHttpLogging(app);

    useRateLimiter(app, {
        redis_url: secret.session.redis_url.split('?')[0],
        redis_prefix: 'auth_rate_limiter',
        req_per_sec: config.req_per_sec,
        chooseConsumer: (req) => {
            return req.session;
        },
    });

    app.get('/healthy', (req, res) => {
        res.send(StatusCodes.OK);
    });

    useModules(app);
    initPassport();
    finishApp(app);
    try {
        const PORT = process.env.PORT || 4000;
        const server = http.createServer(app);
        await server.listen(PORT);
        Logger.info({
            msg: `Server Started at PORT ${PORT}`,
        });
    } catch (err) {
        console.error(err);
        Logger.info({
            msg: 'Failed to Start Server',
        });
        process.exit(1);
    }
})();
