import { NotificationType } from '../../../generated/prisma/enums';

/** Step 0 is the signup message (Day 0); every other step is a handbook WorkR nurture day. */
export const WORKR_SIGNUP_STEP = 0;
export const WORKR_NURTURE_STEPS: readonly number[] = [2, 4, 5, 7, 10, 12, 15];

/** Notification types that belong to a WorkR user (keyed by external_ref, never by a booking submission). */
export const WORKR_NOTIFICATION_TYPES: NotificationType[] = [
    NotificationType.WORKR_SIGNUP_DAY0,
    NotificationType.WORKR_NURTURE
];

export function isWorkrNotificationType(type: NotificationType): boolean {
    return WORKR_NOTIFICATION_TYPES.includes(type);
}

export function isValidWorkrStep(step: number): boolean {
    return step === WORKR_SIGNUP_STEP || WORKR_NURTURE_STEPS.includes(step);
}

/** Day 0 keeps its own type; every later day is a WORKR_NURTURE notification whose reminder number is the day. */
export function getWorkrNotificationType(step: number): NotificationType {
    return step === WORKR_SIGNUP_STEP ? NotificationType.WORKR_SIGNUP_DAY0 : NotificationType.WORKR_NURTURE;
}
