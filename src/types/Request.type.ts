export type WhatsAppApiRequestBody = {
    apiKey: string,
    campaignName: string,
    destination: string,
    userName: string,
    templateParams: string[]
}

// What is kept per request in the async local storage (read back by the logger).
export type AsyncLocalStorageType = {
    correlationId: string
}
