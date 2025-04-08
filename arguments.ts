import type { NamedNode } from '@rdfjs/types'
import clownface, { AnyPointer, MultiPointer } from 'clownface'
import { fromRdf } from 'rdf-literal'
import type { LoaderRegistry } from 'rdf-loaders-registry'
import { isGraphPointer } from 'is-graph-pointer'
import * as ns from './namespaces.js'
import { GraphPointerLike } from './lib/types.js'

function isList(node: MultiPointer) {
  return node.out(ns.rdf('first')).terms.length === 1
}

interface ParseArgument {
  context?: unknown
  variables?: Map<string, unknown>
  basePath?: string
  loaderRegistry: LoaderRegistry
}

async function parseArguments(args: MultiPointer, options: ParseArgument): Promise<unknown[]> {
  if (args.terms.length === 0) {
    return []
  }

  // is it a list?
  if (isList(args)) {
    return Promise.all([...args.list()!].map(arg => parseArgument(arg, options)))
  }

  // or an object?
  const argNodes = args.toArray()
  const promises = argNodes.map(argNode => parseArgument(argNode.out(ns.code('value')), options))
  const values = await Promise.all(promises)

  // merge all key value pairs into an object
  const argObject = argNodes.reduce((acc, argNode, idx) => {
    acc[argNode.out(ns.code('name')).value || ''] = values[idx]

    return acc
  }, <Record<string, unknown>>{})

  return [argObject]
}

const argumentPropPattern = new RegExp(`^${ns.code('argument#').value}(.+)$`)

async function parseArgument(arg: AnyPointer, { context, variables, basePath, loaderRegistry }: ParseArgument): Promise<unknown> {
  if (!isGraphPointer(arg)) {
    throw new Error('Cannot load argument. Expected a single node or RDF List.')
  }

  const loadingNamedArgs = [...arg.dataset.match(arg.term)]
    .map(async quad => {
      const isArgumentProp = quad.predicate.value.match(argumentPropPattern)
      if (isArgumentProp) {
        const key = isArgumentProp[1]
        const value = await parseArgument(clownface({ dataset: arg.dataset, term: quad.object }), { context, variables, basePath, loaderRegistry })
        return <[string, unknown]>[key, value]
      }
      return []
    })

  const argMap = Object.fromEntries((await Promise.all(loadingNamedArgs)).filter(([key]) => !!key))

  if (Object.keys(argMap).length > 0) {
    return argMap
  }

  const code = await loaderRegistry.load(arg, { context, variables, basePath })

  if (typeof code !== 'undefined') {
    return code
  }

  if (arg.term.termType === 'Literal') {
    return fromRdf(arg.term, true)
  }

  if (isList(arg)) {
    // if it's a list, iterate over each item and run the parse argument logic on it
    return Promise.all([...arg.list()!].map(item => parseArgument(item, { context, variables, basePath, loaderRegistry })))
  }

  return arg
}

interface LoaderOptions extends ParseArgument {
  property?: NamedNode
}

export default async function loader({ term, dataset }: GraphPointerLike, { property = ns.code('arguments'), ...options }: LoaderOptions) {
  return parseArguments(clownface({ term, dataset }).out(property), options)
}
