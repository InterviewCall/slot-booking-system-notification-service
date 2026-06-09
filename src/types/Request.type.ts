export type WhatsAppApiRequestBody = {
    apiKey: string,
    campaignName: string,
    destination: string,
    userName: string,
    templateParams: string[]
}