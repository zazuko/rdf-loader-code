import { pathToFileURL, URL } from 'url'
import { resolve } from 'path'

type IRI = Pick<URL, 'protocol' | 'pathname' | 'hash'>

interface Resolver {
  (url: IRI, base?: string): string | URL
}

const resolvers = new Map<string, Resolver>([
  ['file:', (url, base) => {
    if (url.pathname.slice(0, 1) === '/') {
      return url.pathname
    }

    if (base) {
      return pathToFileURL(resolve(base, url.pathname))
    }

    return url.pathname
  }],
  ['node:', url => url.pathname],
])

const isUrl = /^[a-z]*:\/\//
const parseUri = /([^:]*:)([^#]*)(#?.*)/

function parseIri(str: string): IRI {
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
    hash: result[3],
  }
}

interface Resolved extends IRI {
  filename: string | URL
  method: string
}

export default function iriResolve(str: string | URL, basePath: string | undefined): Resolved {
  const iri = parseIri(str.toString())

  if (!resolvers.has(iri.protocol)) {
    throw new Error(`unknown protocol: ${iri.protocol}`)
  }

  const filename = resolvers.get(iri.protocol)!(iri, basePath)
  const method = iri.hash && iri.hash.slice(1)

  return {
    ...iri,
    method,
    filename,
  }
}
