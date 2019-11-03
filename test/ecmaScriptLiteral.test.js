/* global describe, expect, test */

const rdf = { ...require('@rdfjs/data-model'), ...require('@rdfjs/dataset') }
const loader = require('../ecmaScriptLiteral')
const ns = require('../namespaces')

describe('ecmaScriptTemplate loader', () => {
  test('should return string filled in with variables', () => {
    // given
    // eslint-disable-next-line no-template-curly-in-string
    const term = rdf.literal('Hello ${hello}', ns.code.EcmaScriptTemplateLiteral)
    const variables = new Map([['hello', 'world']])

    // when
    const string = loader({ term, dataset: rdf.dataset() }, { variables })

    // then
    expect(string).toBe('Hello world')
  })

  test('should throw if node is not literal', () => {
    // given
    const term = rdf.namedNode('not:literal:node')

    // then
    expect(() => {
      // when
      loader({ term, dataset: rdf.dataset() })
    }).toThrow()
  })
})
