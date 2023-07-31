import clownface from 'clownface'
import iriResolve from './lib/iriResolve.js'
import * as ns from './namespaces.js'

export default async function loader({ term, dataset }, { basePath } = {}) {
  const link = clownface({ term, dataset }).out(ns.code('link'))

  if (link.term && link.term.termType !== 'NamedNode') {
    throw new Error(`Cannot load ecmaScriptModule from term ${term.value}`)
  }

  const { filename, method } = iriResolve(link.value, basePath)

  const code = await import(filename)

  if (!method) {
    return code
  }

  // split method name by . for deep structures
  return method.split('.').reduce((code, property) => code[property], code)
}

loader.register = registry => {
  registry.registerNodeLoader(ns.code('EcmaScriptModule'), loader)
}
