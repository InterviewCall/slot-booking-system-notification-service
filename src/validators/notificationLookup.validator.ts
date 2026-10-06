import { z } from 'zod';

import { MAX_LOOKUP_SUBMISSION_IDS } from '../constants/lookup';

export const lookupNotificationsBodySchema = z.object({
    submissionIds: z.array(z.string().uuid()).max(MAX_LOOKUP_SUBMISSION_IDS)
});
