import module from 'module'
import url from 'url'
import clownface from 'clownface'
import { isNamedNode } from 'is-graph-pointer'
import type { LoaderRegistry } from 'rdf-loaders-registry'
import iriResolve from './lib/iriResolve.js'
import * as ns from './namespaces.js'
import { GraphPointerLike } from './lib/types.js'

const require = module.createRequire(import.meta.url)

function parseLiteral({ term }: GraphPointerLike, { context }: { context?: unknown | null } = {}) {
  if (term.termType === 'Literal' && term.datatype.equals(ns.code('EcmaScript'))) {
    return (function () {
      return eval(`(${term.value})`) // eslint-disable-line no-eval,no-extra-parens
    }.call(context))
  }

  throw new Error(`Cannot load ecmaScript code from term ${term.value}`)
}

function parseNamedNode({ term, dataset }: GraphPointerLike, { basePath }: { basePath?: string } = {}) {
  const link = clownface({ term, dataset }).out(ns.code('link'))

  if (!isNamedNode(link)) {
    throw new Error(`Cannot load ecmaScript code from term ${term.value}`)
  }

  const { filename, method } = iriResolve(link.value, basePath)

  const path = typeof filename === 'string' ? filename : url.fileURLToPath(filename)
  const code = require(path)

  if (!method) {
    return code
  }

  // split method name by . for deep structures
  return method.split('.').reduce((code, property) => code[property], code)
}

export default function loader({ term, dataset }: GraphPointerLike, options = {}) {
  if (term && term.termType === 'Literal') {
    return parseLiteral({ term, dataset }, options)
  }

  return parseNamedNode({ term, dataset }, options)
}

loader.register = (registry: LoaderRegistry) => {
  registry.registerNodeLoader(ns.code('EcmaScript'), loader)
  registry.registerLiteralLoader(ns.code('EcmaScript'), loader)
}
