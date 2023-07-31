import { resolve } from 'path'
import url from 'url'
import rdf from '@zazuko/env'
import fromFile from 'rdf-utils-fs/fromFile.js'
import fromStream from 'rdf-dataset-ext/fromStream.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
export default async function loadDataset(filename) {
  return fromStream(rdf.dataset(), fromFile(resolve(__dirname, '..', filename)))
}
