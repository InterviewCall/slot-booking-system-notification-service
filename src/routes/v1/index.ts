import express from 'express';

import mailRouter from './mail.route';
import pingRouter from './ping.route';

const v1Router = express.Router();

v1Router.use('/ping', pingRouter);

v1Router.use('/mail', mailRouter);

export default v1Router;