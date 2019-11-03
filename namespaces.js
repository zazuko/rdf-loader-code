const namespace = require('@rdfjs/namespace')

/*
  Namespaces should be used with function call in the library like: ns.code('link')
  That avoids problems for platforms without Proxy support.
  In the test code, the namespaces can be used with the property like: ns.code.link
*/

module.exports = {
  code: namespace('https://code.described.at/'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
}
