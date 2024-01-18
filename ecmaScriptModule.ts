import clownface from 'clownface'
import type { LoaderRegistry } from 'rdf-loaders-registry'
import { isNamedNode } from 'is-graph-pointer'
import iriResolve from './lib/iriResolve.js'
import * as ns from './namespaces.js'
import { GraphPointerLike } from './lib/types.js'

export default async function loader({ term, dataset }: GraphPointerLike, { basePath }: { basePath?: string } = {}) {
  const link = clownface({ term, dataset }).out(ns.code('link'))

  if (!isNamedNode(link)) {
    throw new Error(`Cannot load ecmaScriptModule from term ${term.value}`)
  }

  const { filename, method } = iriResolve(link.value, basePath)

  const code = await import(filename.toString())

  if (!method) {
    return code
  }

  // split method name by . for deep structures
  return method.split('.').reduce((code, property) => code[property], code)
}

loader.register = (registry: LoaderRegistry) => {
  registry.registerNodeLoader(ns.code('EcmaScriptModule'), loader)
}
