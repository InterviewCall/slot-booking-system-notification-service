// How many submission ids the internal notifications lookup (POST /internal/notifications/lookup) accepts per call.
// The form and booking services chunk their calls by the same number.
export const MAX_LOOKUP_SUBMISSION_IDS = 100;

// How many WorkR user ids POST /internal/workr/deliveries accepts per call (one admin page is 20).
export const MAX_WORKR_LOOKUP_USER_IDS = 100;
