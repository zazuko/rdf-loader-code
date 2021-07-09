const { resolve } = require('path')
const { URL } = require('url')

const resolvers = new Map([
  ['file:', (url, base) => {
    if (url.pathname.slice(0, 1) === '/') {
      return url.pathname
    }

    if (base) {
      return resolve(base, url.pathname)
    }

    return url.pathname
  }],
  ['node:', url => url.pathname]
])

const isUrl = /^[a-z]*:\/\//
const parseUri = /([^:]*:)([^#]*)(#?.*)/

function parseIri (str) {
  if (isUrl.test(str)) {
    return new URL(str)
  }

  const result = str.match(parseUri)

  if (!result) {
    throw new Error(`can't parse IRI: ${str}`)
  }

  return {
    protocol: result[1],
    pathname: result[2],
    hash: result[3]
  }
}

function iriResolve (str, basePath) {
  const iri = parseIri(str.toString())

  if (!resolvers.has(iri.protocol)) {
    throw new Error(`unknown protocol: ${iri.protocol}`)
  }

  iri.filename = resolvers.get(iri.protocol)(iri, basePath)
  iri.method = iri.hash && iri.hash.slice(1)

  return iri
}

module.exports = iriResolve
