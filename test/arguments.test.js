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
      const dataset = await loadDataset('./list-arguments.ttl')
      const node = cf(dataset).node(rootNode).out(ns.code.arguments)

      // when
      const result = await loader(node.term, dataset, options)

      // then
      expect(result).toEqual(['a', 'b'])
    })

    test('should use loaders to load values', async () => {
      // given
      const options = {
        loaderRegistry
      }
      const dataset = await loadDataset('./list-arguments.ttl')
      const node = cf(dataset).node(rootNode).out(ns.code.arguments)
      loaderRegistry.load.callsFake((arg) => arg.value.toUpperCase())

      // when
      const result = await loader(node.term, dataset, options)

      // then
      expect(result).toEqual(['A', 'B'])
    })

    test('should forward options to loaderRegistry', async () => {
      // given
      const options = {
        loaderRegistry,
        context: {},
        variables: new Map(),
        basePath: '/some/path'
      }
      const dataset = await loadDataset('./list-arguments.ttl')
      const node = cf(dataset).node(rootNode).out(ns.code.arguments)

      // when
      await loader(node.term, dataset, options)

      // then
      assert(loaderRegistry.load.calledWith(
        sinon.match.object,
        options.context,
        options.variables,
        options.basePath
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
