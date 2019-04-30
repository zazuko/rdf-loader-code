const cf = require('clownface')
const ns = require('./namespaces')

async function parseArguments (args, options) {
  // is it a list?
  if (args.out(ns.rdf.first).terms.length === 1) {
    return Promise.all([...args.list()].map(arg => parseArgument(arg, options)))
  }

  // or an object?
  const argNodes = args.toArray()
  const promises = argNodes.map((argNode) => parseArgument(argNode.out(ns.code.value), options))
  const values = await Promise.all(promises)

  // merge all key value pairs into an object
  const argObject = argNodes.reduce((acc, argNode, idx) => {
    acc[argNode.out(ns.code.name).value] = values[idx]

    return acc
  }, {})

  return [argObject]
}

async function parseArgument (arg, { context, variables, basePath, loaderRegistry }) {
  const code = await loaderRegistry.load(arg, { context, variables, basePath })

  if (code) {
    return code
  }

  if (arg.term.termType === 'Literal') {
    return arg.value
  }

  return arg
}

module.exports = (node, dataset, options) => {
  return parseArguments(cf(dataset).node(node), options)
}
