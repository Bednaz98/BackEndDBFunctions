


export interface TokenConfig {
    [deviceHash: string]: {
        firstInsert: number,
        lastUpdated: number,
        tokenID: string,
        priority: number
    }
}
export interface appMessageToken {
    appID: string
    tokenConfig: TokenConfig
}


export interface appPreference {
    appID: string
    [key: string]: any
}