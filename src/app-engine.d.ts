import type { Context } from '@netlify/edge-functions'

export declare function getAllowedHosts(): string[]
export declare function getContext(): Context | undefined
export declare function getTrustProxyHeaders(): string[]
