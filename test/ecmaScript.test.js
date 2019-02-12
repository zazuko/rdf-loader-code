/* global describe, test, beforeEach */
const cf = require('clownface')
const rdf = require('rdf-ext')
const expect = require('expect')
const loader = require('../ecmaScript')
const namespace = require('@rdfjs/namespace')
const { code } = require('../namespaces')

describe('ecmaScript loader', () => {
  const example = namespace('http://example.org/pipeline#')
  let dataset
  let def
  const context = {
    basePath: '/some/path'
  }

  beforeEach(async () => {
    dataset = rdf.dataset()
    def = cf(dataset, rdf.namedNode('http://example.com/'))
  })

  describe('loading literal', () => {
    test('should return function parsed from value', () => {
      // given
      // eslint-disable-next-line no-template-curly-in-string
      const node = rdf.literal('who => `Hello ${who}`', code('EcmaScript'))

      // when
      const func = loader(node, dataset, context)

      // then
      const result = func('world')
      expect(result).toBe('Hello world')
    })

    test('should throw if node does not have correct datatype', () => {
      // given
      const node = rdf.literal("() => 'nothing'", code('unrecognized'))

      // then
      expect(() => loader(node)).toThrow()
    })
  })

  describe('loading from node:', () => {
    test('should return top export', () => {
      // given
      // <operation> code:link <node:rdf-ext#namedNode>
      const node = def.node(example('operation'))
      node.addOut(code('link'), rdf.namedNode('node:rdf-ext#namedNode'))

      // when
      const func = loader(node.term, dataset, { context })

      // then
      expect(func.name).toBe('namedNode')
    })

    test('should return correct function if using dot notation', () => {
      // given
      // <operation> code:link <node:rdf-ext#namedNode.name>
      const node = def.node(example('operation'))
      node.addOut(code('link'), rdf.namedNode('node:rdf-ext#namedNode.name'))

      // when
      const str = loader(node.term, dataset, { context })

      // then
      expect(typeof str).toBe('string')
    })
  })
})
