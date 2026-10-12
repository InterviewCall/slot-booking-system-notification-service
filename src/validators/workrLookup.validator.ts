import { z } from 'zod';

import { MAX_WORKR_LOOKUP_USER_IDS } from '../constants/lookup';

export const workrLookupBodySchema = z.object({
    userIds: z.array(z.number().int().positive()).max(MAX_WORKR_LOOKUP_USER_IDS)
});
