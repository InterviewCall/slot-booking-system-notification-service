import { Router } from 'express';

import { mailingHandler, mailingStatusHandler } from '../../controllers/mailing.controller';

const mailRouter = Router();

mailRouter.post('/send', mailingHandler);

mailRouter.post('/status', mailingStatusHandler);

export default mailRouter;