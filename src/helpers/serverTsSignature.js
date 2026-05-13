import { createHash } from 'node:crypto'

import knownSignatures from './knownServerTsSignatures.json' with { type: 'json' }

/**
 * Takes a string and generates a signature for it
 * @param {string} content Text of module to generate signature for
 * @returns {string} Signature
 */
export function generateServerTsSignature(content) {
  // windows or unix line endings should not affect the signature
  const normalizedContent = content.replaceAll('\r', '')

  return createHash('sha256').update(normalizedContent).digest('hex')
}

/**
 * Tries to compare current content of server.ts with known signatures to decide which engine to use
 * @param {string} content Current content of server.ts
 * @returns {'AppEngine' | 'CommonEngine' | undefined}
 */
export function getEngineBasedOnKnownSignatures(content) {
  const signature = generateServerTsSignature(content)
  return knownSignatures[signature]
}
