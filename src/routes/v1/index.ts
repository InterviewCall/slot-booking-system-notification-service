import express from 'express';

import internalNotificationRouter from './internalNotification.route';
import internalWorkrRouter from './internalWorkr.route';
import pingRouter from './ping.route';

const v1Router = express.Router();

v1Router.use('/ping', pingRouter);
v1Router.use('/internal/notifications', internalNotificationRouter);
v1Router.use('/internal/workr', internalWorkrRouter);

export default v1Router;