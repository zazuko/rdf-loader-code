const { strictEqual, throws } = require('assert')
const namespace = require('@rdfjs/namespace')
const clownface = require('clownface')
const { describe, it } = require('mocha')
const rdf = require('rdf-ext')
const loader = require('../ecmaScript')
const ns = require('../namespaces')

const example = namespace('http://example.org/')

describe('ecmaScript loader', () => {
  describe('loading literal', () => {
    it('should return function parsed from value', () => {
      const term = rdf.literal('who => `Hello ${who}`', ns.code.EcmaScript) // eslint-disable-line no-template-curly-in-string

      const func = loader({ term, dataset: rdf.dataset() })

      const result = func('world')
      strictEqual(result, 'Hello world')
    })

    it('should accept object literals', () => {
      const term = rdf.literal('{a: (b) => `a${b}c`}', ns.code.EcmaScript) // eslint-disable-line no-template-curly-in-string

      const objectLiteral = loader({ term, dataset: rdf.dataset() })

      const result = objectLiteral.a('b')
      strictEqual(result, 'abc')
    })

    it('should use the given context', () => {
      const term = rdf.literal('who => `Hello ${this.who}`', ns.code.EcmaScript) // eslint-disable-line no-template-curly-in-string

      const func = loader({ term, dataset: rdf.dataset() }, { context: { who: 'world' } })

      const result = func('world')
      strictEqual(result, 'Hello world')
    })

    it('should throw if node does not have correct datatype', () => {
      const term = rdf.literal("() => 'nothing'", ns.code.unrecognized)

      throws(() => {
        loader({ term, dataset: rdf.dataset })
      })
    })
  })

  describe('loading from node:', () => {
    it('should return top export', () => {
      // <operation> code:link <node:@rdfjs/data-model#namedNode>
      const node = clownface({ dataset: rdf.dataset(), term: example('operation') })
        .addOut(ns.code.link, rdf.namedNode('node:@rdfjs/data-model#namedNode'))

      const func = loader({ term: node.term, dataset: node.dataset })

      strictEqual(typeof func, 'function')
    })

    it('should return correct function if using dot notation', () => {
      // <operation> code:link <node:@rdfjs/data-model#namedNode.name>
      const node = clownface({ dataset: rdf.dataset(), term: example('operation') })
        .addOut(ns.code.link, rdf.namedNode('node:@rdfjs/data-model#namedNode.name'))

      const str = loader({ term: node.term, dataset: node.dataset })

      strictEqual(typeof str, 'string')
    })
  })

  describe('loading from file:', () => {
    it('should return default export', () => {
      // <operation> code:link <file:foobar>
      const node = clownface({ dataset: rdf.dataset(), term: example('operation') })
        .addOut(ns.code.link, rdf.namedNode('file:foobar'))

      const value = loader({ term: node.term, dataset: node.dataset }, { basePath: __dirname })

      strictEqual(value.foo.foo, 'bar')
    })

    it('should return correct export if using hash and dot notation', () => {
      // <operation> code:link <file:foobar.foo>
      const node = clownface({ dataset: rdf.dataset(), term: example('operation') })
        .addOut(ns.code.link, rdf.namedNode('file:foobar#foo.foo'))

      const foo = loader({ term: node.term, dataset: node.dataset }, { basePath: __dirname })

      strictEqual(foo, 'bar')
    })
  })
})
