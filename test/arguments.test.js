/* global describe, test, beforeEach */
const createReadStream = require('fs').createReadStream
const cf = require('clownface')
const path = require('path')
const expect = require('expect')
const assert = require('assert')
const rdf = require('rdf-ext')
const Parser = require('@rdfjs/parser-n3')
const sinon = require('sinon')
const loader = require('../arguments')
const ns = require('../namespaces')

const parser = new Parser()

describe('arguments loader', () => {
  const rootNode = rdf.namedNode('http://example.com/')
  let loaderRegistry

  beforeEach(() => {
    loaderRegistry = {
      load: sinon.stub()
    }
  })

  describe('loading from rdf:List', () => {
    test('should fall back to verbatim literal value', async () => {
      // given
      const options = {
        loaderRegistry
      }
      const dataset = await loadDataset('./arguments-list.ttl')
      const args = cf(dataset).node(rootNode).out(ns.code.arguments)

      // when
      const result = await loader(args, dataset, options)

      // then
      expect(result).toEqual(['a', '5'])
    })

    test('should use loaders to load values', async () => {
      // given
      const options = {
        loaderRegistry
      }
      const dataset = await loadDataset('./arguments-list.ttl')
      const args = cf(dataset).node(rootNode).out(ns.code.arguments)
      loaderRegistry.load.callsFake((arg) => arg.value.toUpperCase())

      // when
      const result = await loader(args, dataset, options)

      // then
      expect(result).toEqual(['A', '5'])
    })

    test('should forward options to loaderRegistry', async () => {
      // given
      const options = {
        loaderRegistry,
        context: {},
        variables: new Map(),
        basePath: '/some/path'
      }
      const dataset = await loadDataset('./arguments-list.ttl')
      const args = cf(dataset).node(rootNode).out(ns.code.arguments)

      // when
      await loader(args, dataset, options)

      // then
      assert(loaderRegistry.load.calledWith(
        sinon.match.object,
        {
          context: options.context,
          variables: options.variables,
          basePath: options.basePath
        }
      ))
    })
  })

  describe('loading from set of name/value pairs', () => {
    test('should fall back to verbatim literal value', async () => {
      // given
      const options = {
        loaderRegistry
      }
      const dataset = await loadDataset('./arguments-named.ttl')
      const args = cf(dataset).node(rootNode).out(ns.code.arguments)

      // when
      const result = await loader(args, dataset, options)

      // then
      expect(result).toEqual([{
        'foo': 'bar',
        'a': 'b'
      }])
    })

    test('should use loaders to load values', async () => {
      // given
      const options = {
        loaderRegistry
      }
      const dataset = await loadDataset('./arguments-named.ttl')
      const args = cf(dataset).node(rootNode).out(ns.code.arguments)
      loaderRegistry.load.callsFake((arg) => arg.value.toUpperCase())

      // when
      const result = await loader(args, dataset, options)

      // then
      expect(result).toEqual([{
        'foo': 'BAR',
        'a': 'B'
      }])
    })

    test('should forward options to loaderRegistry', async () => {
      // given
      const options = {
        loaderRegistry,
        context: {},
        variables: new Map(),
        basePath: '/some/path'
      }
      const dataset = await loadDataset('./arguments-named.ttl')
      const args = cf(dataset).node(rootNode).out(ns.code.arguments)

      // when
      await loader(args, dataset, options)

      // then
      assert(loaderRegistry.load.calledWith(
        sinon.match.object,
        {
          context: options.context,
          variables: options.variables,
          basePath: options.basePath
        }
      ))
    })
  })
})

async function loadDataset (filename) {
  const dataset = rdf.dataset()

  const datasetFileStream = createReadStream(path.join(__dirname, filename))
  await dataset.import(parser.import(datasetFileStream))

  return dataset
}
