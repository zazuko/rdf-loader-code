import { strictEqual, throws } from 'assert'
import rdf from '@zazuko/env-node'
import loader from '../ecmaScriptLiteral.js'
import * as ns from '../namespaces.js'

describe('ecmaScriptTemplate loader', () => {
  it('should return string filled in with variables', () => {
    const term = rdf.literal('Hello ${hello}', ns.code.EcmaScriptTemplateLiteral) // eslint-disable-line no-template-curly-in-string
    const variables = new Map([['hello', 'world']])

    const string = loader({ term, dataset: rdf.dataset() }, { variables })

    strictEqual(string, 'Hello world')
  })

  it('should not require additional arguments', () => {
    const term = rdf.literal('Hello world', ns.code.EcmaScriptTemplateLiteral)

    const string = loader({ term, dataset: rdf.dataset() })

    strictEqual(string, 'Hello world')
  })

  it('should throw if node is not literal', () => {
    const term = rdf.namedNode('not:literal:node')

    throws(() => {
      loader({ term, dataset: rdf.dataset() })
    })
  })
})
