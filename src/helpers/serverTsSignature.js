const { createHash } = require('node:crypto')

const knownSignatures = require('./knownServerTsSignatures.json')

/**
 * Takes a string and generates a signature for it
 * @param {string} content Text of module to generate signature for
 * @returns {string} Signature
 */
const generateServerTsSignature = (content) => createHash('sha256').update(content).digest('hex')

module.exports.generateServerTsSignature = generateServerTsSignature

/**
 * Tries to compare current content of server.ts with known signatures to decide which engine to use
 * @param {string} content Current content of server.ts
 * @returns {'AppEngine' | 'CommonEngine' | undefined}
 */
const getEngineBasedOnKnownSignatures = (content) => {
  const signature = generateServerTsSignature(content)
  return knownSignatures[signature]
}

module.exports.getEngineBasedOnKnownSignatures = getEngineBasedOnKnownSignatures
