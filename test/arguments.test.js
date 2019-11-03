/* global beforeEach, describe, expect, test */

const createReadStream = require('fs').createReadStream
const path = require('path')
const rdf = { ...require('@rdfjs/data-model'), ...require('@rdfjs/dataset') }
const Parser = require('@rdfjs/parser-n3')
const { fromStream } = require('rdf-dataset-ext')
const sinon = require('sinon')
const loader = require('../arguments')

const parser = new Parser()

describe('arguments loader', () => {
  const term = rdf.namedNode('http://example.com/')
  let loaderRegistry

  beforeEach(() => {
    loaderRegistry = {
      load: sinon.stub()
    }
  })

  describe('loading from rdf:List', () => {
    test('should fall back to verbatim literal value', async () => {
      // given
      const dataset = await loadDataset('./arguments-list.ttl')

      // when
      const result = await loader({ term, dataset }, { loaderRegistry })

      // then
      expect(result).toEqual(['a', '5'])
    })

    test('should use loaders to load values', async () => {
      // given
      const dataset = await loadDataset('./arguments-list.ttl')
      loaderRegistry.load.callsFake((arg) => arg.value.toUpperCase())

      // when
      const result = await loader({ term, dataset }, { loaderRegistry })

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

      // when
      await loader({ term, dataset }, options)

      // then
      expect(loaderRegistry.load.calledWith(
        sinon.match.object,
        {
          context: options.context,
          variables: options.variables,
          basePath: options.basePath
        }
      )).toBe(true)
    })
  })

  describe('loading from set of name/value pairs', () => {
    test('should fall back to verbatim literal value', async () => {
      // given
      const dataset = await loadDataset('./arguments-named.ttl')

      // when
      const result = await loader({ term, dataset }, { loaderRegistry })

      // then
      expect(result).toEqual([{
        foo: 'bar',
        a: 'b'
      }])
    })

    test('should use loaders to load values', async () => {
      // given
      const dataset = await loadDataset('./arguments-named.ttl')
      loaderRegistry.load.callsFake((arg) => arg.value.toUpperCase())

      // when
      const result = await loader({ term, dataset }, { loaderRegistry })

      // then
      expect(result).toEqual([{
        foo: 'BAR',
        a: 'B'
      }])
    })

    test('should support array values', async () => {
      // given
      const dataset = await loadDataset('./arguments-named-list.ttl')

      // when
      const result = await loader({ term, dataset }, { loaderRegistry })

      // then
      expect(result).toEqual([{
        foo: 'bar',
        a: ['b', 'c']
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

      // when
      await loader({ term, dataset }, options)

      // then
      expect(loaderRegistry.load.calledWith(
        sinon.match.object,
        {
          context: options.context,
          variables: options.variables,
          basePath: options.basePath
        }
      )).toBe(true)
    })
  })
})

async function loadDataset (filename) {
  const datasetFileStream = createReadStream(path.join(__dirname, filename))

  return fromStream(rdf.dataset(), parser.import(datasetFileStream))
}
