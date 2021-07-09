const cf = require('clownface')
const iriResolve = require('./lib/iriResolve')
const ns = require('./namespaces')

function parseLiteral ({ term }, { context } = {}) {
  if (term.datatype.equals(ns.code('EcmaScript'))) {
    return (function () {
      return eval(`(${term.value})`) // eslint-disable-line no-eval,no-extra-parens
    }.call(context))
  }

  throw new Error(`Cannot load ecmaScript code from term ${term.value}`)
}

function parseNamedNode ({ term, dataset }, { basePath } = {}) {
  const link = cf({ term, dataset }).out(ns.code('link'))

  if (link.term && link.term.termType !== 'NamedNode') {
    throw new Error(`Cannot load ecmaScript code from term ${term.value}`)
  }

  const { filename, method } = iriResolve(link.value, basePath)

  const code = require(filename)

  if (!method) {
    return code
  }

  // split method name by . for deep structures
  return method.split('.').reduce((code, property) => code[property], code)
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
