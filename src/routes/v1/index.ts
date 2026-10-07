import express from 'express';

import mailRouter from './mail.route';
import notificationRouter from './notification.route';
import pingRouter from './ping.route';


const v1Router = express.Router();

v1Router.use('/ping', pingRouter);

v1Router.use('/mail', mailRouter);

v1Router.use('/notifications', notificationRouter);

export default v1Router;