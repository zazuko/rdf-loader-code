import { resolve } from 'path'
import url from 'url'
import rdf from '@zazuko/env-node'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
export default async function loadDataset(filename) {
  return rdf.dataset().import(rdf.fromFile(resolve(__dirname, '..', filename)))
}
