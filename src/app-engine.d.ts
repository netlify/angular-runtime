import type { Context } from '@netlify/edge-functions'

export declare function getAllowedHosts(config?: {
  additionalAllowedHosts?: string[]
  injectDefaults?: boolean
}): string[]

export declare function getContext(): Context | undefined

export declare function getTrustProxyHeaders(
  config?:
    | {
        additionalTrustProxyHeaders?: string[]
      }
    | {
        trustAll?: boolean
      },
): boolean | string[]
