const cf = require('clownface')
const iriRequire = require('./iriRequire')
const ns = require('./namespaces')

function parseLiteral ({ term }, { context } = {}) {
  if (term.datatype.equals(ns.code('EcmaScript'))) {
    return (function () { return eval(`(${term.value})`) }).call(context) // eslint-disable-line no-eval,no-extra-parens
  }

  throw new Error(`Cannot load ecmaScript code from term ${term.value}`)
}

function parseNamedNode ({ term, dataset }, { basePath } = {}) {
  const link = cf({ term, dataset }).out(ns.code('link'))

  if (link.term && link.term.termType === 'NamedNode') {
    return iriRequire(link.value, basePath)
  }

  throw new Error(`Cannot load ecmaScript code from term ${term.value}`)
}

function loader ({ term, dataset }, options = {}) {
  if (term && term.termType === 'Literal') {
    return parseLiteral({ term, dataset }, options)
  }

  return parseNamedNode({ term, dataset }, options)
}

loader.register = registry => {
  registry.registerNodeLoader(ns.code('EcmaScript'), loader)
  registry.registerLiteralLoader(ns.code('EcmaScript'), loader)
}

module.exports = loader
