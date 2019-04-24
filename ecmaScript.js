const cf = require('clownface')
const iriRequire = require('./iriRequire')
const { code } = require('./namespaces')

function parseLiteral (node, context) {
  if (node.datatype.equals(code('EcmaScript'))) {
    return (function () { return eval(`(${node.value})`) }).call(context) // eslint-disable-line no-eval,no-extra-parens
  }

  throw new Error(`Cannot load ecmaScript code from node ${node}`)
}

function parseNamedNode (node, dataset, { basePath }) {
  const def = cf(dataset)
  const cfNode = def.node(node)
  const link = cfNode.out(code('link'))

  if (link.term && link.term.termType === 'NamedNode') {
    return iriRequire(link.value, basePath)
  }

  throw new Error(`Cannot load ecmaScript code from node ${node}`)
}

function loader (node, dataset, options) {
  if (node && node.termType === 'Literal') {
    return parseLiteral(node, options)
  }

  return parseNamedNode(node, dataset, options)
}

loader.register = registry => {
  registry.registerNodeLoader(code('EcmaScript'), loader)
  registry.registerLiteralLoader(code('EcmaScript'), loader)
}

module.exports = loader
