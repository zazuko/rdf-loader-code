import { rejects, strictEqual } from 'assert'
import * as url from 'url'
import rdf from '@zazuko/env'
import loader from '../ecmaScriptModule.js'
import * as ns from '../namespaces.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

describe('ecmaScriptModule', () => {
  it('should be a function', () => {
    strictEqual(typeof loader, 'function')
  })

  it('should reject if there is no link', async () => {
    const node = rdf.clownface()
      .blankNode()

    rejects(async () => {
      await loader({ term: node.term, dataset: node.dataset })
    })
  })

  it('should reject if the link object is not a NamedNode', async () => {
    const node = rdf.clownface()
      .blankNode()
      .addOut(ns.code.link, rdf.literal('node:@rdfjs/data-model'))

    rejects(async () => {
      await loader({ term: node.term, dataset: node.dataset })
    })
  })

  describe('node:', () => {
    it('should return async the loaded module', async () => {
      const node = rdf.clownface()
        .blankNode()
        .addOut(ns.code.link, rdf.namedNode('node:@rdfjs/data-model'))

      const func = await loader({ term: node.term, dataset: node.dataset })

      strictEqual(typeof func, 'object')
    })

    it('should use the hash to traverse the module content using dots to separate levels', async () => {
      const node = rdf.clownface()
        .blankNode()
        .addOut(ns.code.link, rdf.namedNode('node:@rdfjs/data-model#default.namedNode'))

      const str = await loader({ term: node.term, dataset: node.dataset })

      strictEqual(typeof str, 'function')
    })
  })

  describe('file:', () => {
    it('should return async the loaded module from the given URL', async () => {
      const node = rdf.clownface()
        .blankNode()
        .addOut(ns.code.link, rdf.namedNode(`file://${__dirname}/foobar.js`)) // eslint-disable-line n/no-path-concat

      const value = await loader({ term: node.term, dataset: node.dataset }, { basePath: __dirname })

      strictEqual(value.foo.foo, 'bar')
    })

    it('should use the hash to traverse the module content from the given URL using dots to separate levels', async () => {
      const node = rdf.clownface()
        .blankNode()
        .addOut(ns.code.link, rdf.namedNode(`file://${__dirname}/foobar.js#foo.foo`)) // eslint-disable-line n/no-path-concat

      const foo = await loader({ term: node.term, dataset: node.dataset }, { basePath: __dirname })

      strictEqual(foo, 'bar')
    })

    it('should return async the loaded module from the given URI', async () => {
      const node = rdf.clownface()
        .blankNode()
        .addOut(ns.code.link, rdf.namedNode('file:foobar.js'))

      const value = await loader({ term: node.term, dataset: node.dataset }, { basePath: __dirname })

      strictEqual(value.foo.foo, 'bar')
    })

    it('should use the hash to traverse the module content from the given URI using dots to separate levels', async () => {
      const node = rdf.clownface()
        .blankNode()
        .addOut(ns.code.link, rdf.namedNode('file:foobar.js#foo.foo'))

      const foo = await loader({ term: node.term, dataset: node.dataset }, { basePath: __dirname })

      strictEqual(foo, 'bar')
    })
  })

  describe('register', () => {
    it('should be a function', () => {
      strictEqual(typeof loader.register, 'function')
    })

    it('should register the loader to the given registry', () => {
      let called = null

      const registry = {
        registerNodeLoader: (...args) => {
          called = args
        },
      }

      loader.register(registry)

      strictEqual(ns.code.EcmaScriptModule.equals(called[0]), true)
      strictEqual(called[1], loader)
    })
  })
})
