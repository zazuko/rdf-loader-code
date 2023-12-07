import type { LoaderRegistry } from 'rdf-loaders-registry'
import evalTemplateLiteral from './evalTemplateLiteral.js'
import * as ns from './namespaces.js'
import { GraphPointerLike } from './lib/types.js'

export default function loader({ term }: GraphPointerLike, { context, variables }: { context?: unknown; variables?: Map<string, unknown> } = {}) {
  if (!(term.termType !== 'Literal' || !term.datatype.equals(ns.code('EcmaScriptTemplateLiteral')))) {
    return evalTemplateLiteral(term.value, { context, variables })
  }

  throw new Error(`Cannot load ES6 literal from term ${term.value}`)
}

loader.register = (registry: LoaderRegistry) => {
  registry.registerLiteralLoader(ns.code('EcmaScriptTemplateLiteral'), loader)
}
