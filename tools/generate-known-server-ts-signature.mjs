import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { generateServerTsSignature } from '../src/helpers/serverTsSignature.js'

const hashToEngine = {}

for (const engine of ['CommonEngine', 'AppEngine']) {
  const knownFilesUsingEngineDirectory = fileURLToPath(
    new URL(join('known-server-ts-signatures', engine), import.meta.url),
  )
  const files = await readdir(knownFilesUsingEngineDirectory)
  for (const file of files) {
    const content = await readFile(join(knownFilesUsingEngineDirectory, file), 'utf-8')
    const signature = generateServerTsSignature(content)
    hashToEngine[signature] = engine
  }
}

// write out source file matching current formatting rules
await writeFile(
  fileURLToPath(new URL('../src/helpers/knownServerTsSignatures.json', import.meta.url)),
  `${JSON.stringify(hashToEngine, null, 2)}\n`,
)
