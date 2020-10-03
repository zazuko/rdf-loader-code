const { strictEqual, throws } = require('assert')
const { describe, it } = require('mocha')
const iriResolve = require('../lib/iriResolve')

describe('iriResolve', () => {
  it('should be a function', () => {
    strictEqual(typeof iriResolve, 'function')
  })

  it('should throw if no argument was given', () => {
    throws(() => {
      iriResolve()
    })
  })

  it('should throw if an invalid IRI was given', () => {
    throws(() => {
      iriResolve('test')
    })
  })

  it('should throw if an unknown protocol was given', () => {
    throws(() => {
      iriResolve('test:test')
    })
  })

  it('should return an object with a filename and hash property', () => {
    const str = 'file:test.js#hash'

    const result = iriResolve(str)

    strictEqual(typeof result.filename, 'string')
    strictEqual(typeof result.method, 'string')
  })

  describe('file:', () => {
    it('should resolve file URLs', () => {
      const str = 'file:///test.js'

      const result = iriResolve(str)

      strictEqual(result.filename, '/test.js')
    })

    it('should resolve file URLs with hashes', () => {
      const str = 'file:///test.js#test123'

      const result = iriResolve(str)

      strictEqual(result.filename, '/test.js')
      strictEqual(result.method, 'test123')
    })

    it('should resolve file URIs', () => {
      const str = 'file:test.js'

      const result = iriResolve(str)

      strictEqual(result.filename, 'test.js')
    })

    it('should resolve file URIs with hashes', () => {
      const str = 'file:test.js#test123'

      const result = iriResolve(str)

      strictEqual(result.filename, 'test.js')
      strictEqual(result.method, 'test123')
    })

    it('should resolve file URIs using the given base', () => {
      const str = 'file:test.js#test123'

      const result = iriResolve(str, '/root')

      strictEqual(result.filename, '/root/test.js')
      strictEqual(result.method, 'test123')
    })
  })

  describe('node:', () => {
    it('should resolve node URIs', () => {
      const str = 'node:clownface/lib/fromPrimitive.js'

      const result = iriResolve(str)

      strictEqual(result.filename, 'clownface/lib/fromPrimitive.js')
    })

    it('should resolve node URIs with hashes', () => {
      const str = 'node:clownface/lib/fromPrimitive.js#toLiteral'

      const result = iriResolve(str)

      strictEqual(result.filename, 'clownface/lib/fromPrimitive.js')
      strictEqual(result.method, 'toLiteral')
    })
  })
})
