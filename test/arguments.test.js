const { deepStrictEqual, strictEqual } = require('assert')
const { describe, it } = require('mocha')
const rdf = require('rdf-ext')
const loader = require('../arguments')
const loadDataset = require('./support/loadDataset')

const dummyLoaderRegistry = {
  load: () => undefined
}

describe('arguments loader', () => {
  const term = rdf.namedNode('http://example.com/')

  describe('loading from rdf:List', () => {
    it('should fall back to verbatim literal value', async () => {
      const dataset = await loadDataset('./arguments-list.ttl')

      const result = await loader({ term, dataset }, { loaderRegistry: dummyLoaderRegistry })

      deepStrictEqual(result, ['a', '5'])
    })

    it('should handle boolean false, but not undefined values from loaders', async () => {
      const dataset = await loadDataset('./arguments-list.ttl')
      const values = [undefined, '']
      const loaderRegistry = {
        load: () => values.shift()
      }

      const result = await loader({ term, dataset }, { loaderRegistry })

      deepStrictEqual(result, ['a', ''])
    })

    it('should use loaders to load values', async () => {
      const dataset = await loadDataset('./arguments-list.ttl')
      const loaderRegistry = {
        load: ptr => ptr.value.toUpperCase()
      }

      const result = await loader({ term, dataset }, { loaderRegistry })

      deepStrictEqual(result, ['A', '5'])
    })

    it('should forward options to loaderRegistry', async () => {
      let called = null

      const loaderRegistry = {
        load: (ptr, options) => {
          called = options
        }
      }

      const options = {
        loaderRegistry,
        context: {},
        variables: new Map(),
        basePath: '/some/path'
      }

      const dataset = await loadDataset('./arguments-list.ttl')

      await loader({ term, dataset }, options)

      for (const key of ['basePath', 'context', 'variable']) {
        strictEqual(called[key], options[key])
      }
    })
  })

  describe('loading from set of name/value pairs', () => {
    it('should fall back to verbatim literal value', async () => {
      const dataset = await loadDataset('./arguments-named.ttl')

      const result = await loader({ term, dataset }, { loaderRegistry: dummyLoaderRegistry })

      deepStrictEqual(result, [{
        foo: 'bar',
        a: 'b'
      }])
    })

    it('should use loaders to load values', async () => {
      const dataset = await loadDataset('./arguments-named.ttl')
      const loaderRegistry = {
        load: ptr => ptr.value.toUpperCase()
      }

      const result = await loader({ term, dataset }, { loaderRegistry })

      deepStrictEqual(result, [{
        foo: 'BAR',
        a: 'B'
      }])
    })

    it('should support array values', async () => {
      const dataset = await loadDataset('./arguments-named-list.ttl')

      const result = await loader({ term, dataset }, { loaderRegistry: dummyLoaderRegistry })

      deepStrictEqual(result, [{
        foo: 'bar',
        a: ['b', 'c']
      }])
    })

    it('should forward options to loaderRegistry', async () => {
      let called = null

      const loaderRegistry = {
        load: (ptr, options) => {
          called = options
        }
      }

      const options = {
        loaderRegistry,
        context: {},
        variables: new Map(),
        basePath: '/some/path'
      }
      const dataset = await loadDataset('./arguments-named.ttl')

      await loader({ term, dataset }, options)

      for (const key of ['basePath', 'context', 'variable']) {
        strictEqual(called[key], options[key])
      }
    })
  })
})
