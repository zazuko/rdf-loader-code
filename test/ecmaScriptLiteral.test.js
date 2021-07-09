const { strictEqual, throws } = require('assert')
const { describe, it } = require('mocha')
const rdf = require('rdf-ext')
const loader = require('../ecmaScriptLiteral')
const ns = require('../namespaces')

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
