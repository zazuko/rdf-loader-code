import namespace from '@rdfjs/namespace'

/*
  Namespaces should be used with function call in the library like: ns.code('link')
  That avoids problems for platforms without Proxy support.
  In the test code, the namespaces can be used with the property like: ns.code.link
*/

export const code = namespace('https://code.described.at/')
export const rdf = namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
