import { deepStrictEqual, strictEqual } from 'assert'
import rdf from '@zazuko/env'
import loader from '../arguments.js'
import loadDataset from './support/loadDataset.js'

const dummyLoaderRegistry = {
  load: () => undefined,
}

describe('arguments loader', () => {
  const term = rdf.namedNode('http://example.com/')

  describe('loading from rdf:List', () => {
    it('should fall back to native literal value', async () => {
      const dataset = await loadDataset('./arguments-list.ttl')

      const result = await loader({ term, dataset }, { loaderRegistry: dummyLoaderRegistry })

      deepStrictEqual(result, ['a', 5, true, 5.6, new Date(Date.UTC(2000, 10, 20))])
    })

    it('should handle boolean false, but not undefined values from loaders', async () => {
      const dataset = await loadDataset('./arguments-list.ttl')
      const values = [undefined, '']
      const loaderRegistry = {
        load: () => values.shift(),
      }

      const result = await loader({ term, dataset }, { loaderRegistry })

      deepStrictEqual(result, ['a', '', true, 5.6, new Date(Date.UTC(2000, 10, 20))])
    })

    it('should use loaders to load values', async () => {
      const dataset = await loadDataset('./arguments-list.ttl')
      const loaderRegistry = {
        load: ptr => ptr.value.toUpperCase(),
      }

      const result = await loader({ term, dataset }, { loaderRegistry })

      deepStrictEqual(result, ['A', '5', 'TRUE', '5.6', '2000-11-20'])
    })

    it('should forward options to loaderRegistry', async () => {
      let called = null

      const loaderRegistry = {
        load: (ptr, options) => {
          called = options
        },
      }

      const options = {
        loaderRegistry,
        context: {},
        variables: new Map(),
        basePath: '/some/path',
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
        a: 'b',
      }])
    })

    it('should use loaders to load values', async () => {
      const dataset = await loadDataset('./arguments-named.ttl')
      const loaderRegistry = {
        load: ptr => ptr.value.toUpperCase(),
      }

      const result = await loader({ term, dataset }, { loaderRegistry })

      deepStrictEqual(result, [{
        foo: 'BAR',
        a: 'B',
      }])
    })

    it('should support array values', async () => {
      const dataset = await loadDataset('./arguments-named-list.ttl')

      const result = await loader({ term, dataset }, { loaderRegistry: dummyLoaderRegistry })

      deepStrictEqual(result, [{
        foo: 'bar',
        a: ['b', 'c'],
      }])
    })

    it('should forward options to loaderRegistry', async () => {
      let called = null

      const loaderRegistry = {
        load: (ptr, options) => {
          called = options
        },
      }

      const options = {
        loaderRegistry,
        context: {},
        variables: new Map(),
        basePath: '/some/path',
      }
      const dataset = await loadDataset('./arguments-named.ttl')

      await loader({ term, dataset }, options)

      for (const key of ['basePath', 'context', 'variable']) {
        strictEqual(called[key], options[key])
      }
    })
  })
})
