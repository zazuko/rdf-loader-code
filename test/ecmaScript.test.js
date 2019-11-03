/* global beforeEach, describe, expect, test */

const cf = require('clownface')
const rdf = { ...require('@rdfjs/data-model'), ...require('@rdfjs/dataset') }
const loader = require('../ecmaScript')
const namespace = require('@rdfjs/namespace')
const ns = require('../namespaces')

describe('ecmaScript loader', () => {
  const example = namespace('http://example.org/pipeline#')
  let def

  beforeEach(async () => {
    def = cf({ term: rdf.namedNode('http://example.com/'), dataset: rdf.dataset() })
  })

  describe('loading literal', () => {
    test('should return function parsed from value', () => {
      // given
      // eslint-disable-next-line no-template-curly-in-string
      const term = rdf.literal('who => `Hello ${who}`', ns.code.EcmaScript)

      // when
      const func = loader({ term, dataset: rdf.dataset() })

      // then
      const result = func('world')
      expect(result).toBe('Hello world')
    })

    test('should accept object literals', () => {
      // given
      // eslint-disable-next-line no-template-curly-in-string
      const term = rdf.literal('{a: (b) => `a${b}c`}', ns.code.EcmaScript)

      // when
      const objectLiteral = loader({ term, dataset: rdf.dataset() })

      // then
      const result = objectLiteral.a('b')
      expect(result).toBe('abc')
    })

    test('should use the given context', () => {
      // given
      // eslint-disable-next-line no-template-curly-in-string
      const term = rdf.literal('who => `Hello ${this.who}`', ns.code.EcmaScript)

      // when
      const func = loader({ term, dataset: rdf.dataset() }, { context: { who: 'world' } })

      // then
      const result = func('world')
      expect(result).toBe('Hello world')
    })

    test('should throw if node does not have correct datatype', () => {
      // given
      const term = rdf.literal("() => 'nothing'", ns.code.unrecognized)

      // then
      expect(() => loader({ term, dataset: rdf.dataset })).toThrow()
    })
  })

  describe('loading from node:', () => {
    test('should return top export', () => {
      // given
      // <operation> code:link <node:rdf-ext#namedNode>
      const node = def.node(example('operation'))
      node.addOut(ns.code.link, rdf.namedNode('node:rdf-ext#namedNode'))

      // when
      const func = loader({ term: node.term, dataset: node.dataset })

      // then
      expect(func.name).toBe('namedNode')
    })

    test('should return correct function if using dot notation', () => {
      // given
      // <operation> code:link <node:rdf-ext#namedNode.name>
      const node = def.node(example('operation'))
      node.addOut(ns.code.link, rdf.namedNode('node:rdf-ext#namedNode.name'))

      // when
      const str = loader({ term: node.term, dataset: node.dataset })

      // then
      expect(typeof str).toBe('string')
    })
  })

  describe('loading from file:', () => {
    test('should return default export', () => {
      // given
      // <operation> code:link <file:foobar>
      const node = def.node(example('operation'))
      node.addOut(ns.code.link, rdf.namedNode('file:foobar'))

      // when
      const value = loader({ term: node.term, dataset: node.dataset }, { basePath: __dirname })

      // then
      expect(value.foo.foo).toBe('bar')
    })

    test('should return correct export if using hash and dot notation', () => {
      // given
      // <operation> code:link <file:foobar.foo>
      const node = def.node(example('operation'))
      node.addOut(ns.code.link, rdf.namedNode('file:foobar#foo.foo'))

      // when
      const foo = loader({ term: node.term, dataset: node.dataset }, { basePath: __dirname })

      // then
      expect(foo).toBe('bar')
    })
  })
})
