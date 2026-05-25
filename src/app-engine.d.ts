import type { Context } from '@netlify/edge-functions'

export declare function getAllowedHosts(config?: { allowedHosts?: string[]; injectDefaults?: boolean }): string[]
export declare function getContext(): Context | undefined
export declare function getTrustProxyHeaders(): string[]
