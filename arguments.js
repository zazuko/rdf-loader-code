const cf = require('clownface')
const ns = require('./namespaces')

function isList (node) {
  return node.out(ns.rdf('first')).terms.length === 1
}

async function parseArguments (args, options) {
  // is it a list?
  if (isList(args)) {
    return Promise.all([...args.list()].map(arg => parseArgument(arg, options)))
  }

  // or an object?
  const argNodes = args.toArray()
  const promises = argNodes.map(argNode => parseArgument(argNode.out(ns.code('value')), options))
  const values = await Promise.all(promises)

  // merge all key value pairs into an object
  const argObject = argNodes.reduce((acc, argNode, idx) => {
    acc[argNode.out(ns.code('name')).value] = values[idx]

    return acc
  }, {})

  return [argObject]
}

async function parseArgument (arg, { context, variables, basePath, loaderRegistry }) {
  const code = await loaderRegistry.load(arg, { context, variables, basePath })

  if (typeof code !== 'undefined') {
    return code
  }

  if (arg.term.termType === 'Literal') {
    return arg.value
  }

  if (isList(arg)) {
    // if it's a list, iterate over each item and run the parse argument logic on it
    return Promise.all([...arg.list()].map(item => parseArgument(item, { context, variables, basePath, loaderRegistry })))
  }

  return arg
}

async function loader ({ term, dataset }, { property = ns.code('arguments'), ...options } = {}) {
  return parseArguments(cf({ term, dataset }).out(property), options)
}

module.exports = loader
