# Native RDF loaders for the [code](https://code.described.at) vocabulary

The loaders contained in this packages let developers link RDF to native code and load that code at runtime
to be exacuted in their programs.

## Installation

Currently must be installed from git

```
npm i --save https://github.com/zazuko/rdf-native-loader-code
npm i --save https://github.com/zazuko/rdf-native-loader
```

Somewhere at the beginning of your code, register the loaders

```js
const LoaderRegistry = require('rdf-native-loader')
const EcmaScriptLoader = require('rdf-native-loader-code/ecmaScript')
const EcmaScriptLiteralLoader = require('rdf-native-loader-code/ecmaScriptLiteral')

const registry = new LoaderRegistry()

EcmaScriptLoader.register(registry)
EcmaScriptLiteralLoader.register(registry)

module.exports = registry
```

## Usage

All examples below assume that the `./dataset` module exports a [`RDF/JS` dataset](https://github.com/rdfjs/dataset-spec).
The `./registry` module is assumed to be implemented as shown in the `Installation` section above.

### JS code loaded from node modules (or built-ins)

This example is equivalent to calling `require('fs').createReadStream` 

```turtle
@prefix code: <https://code.described.at/>

<urn:example:node> 
  code:implementedBy [
    a code:EcmaScript ;
    code:link <node:fs#createReadStream>
  ] .
```

```js
const cf = require('clownface')
const rdf = require('rdf-ext')
const registry = require('./registry')
const dataset = require('./dataset')

const parentNode = rdf.namedNode('urn:example:node')
const implementedBy = rdf.namedNode('https://code.described.at/implementedBy')

const createReadStream = registry.load(cf(dataset).node(parentNode).out(implementedBy))
```

### JS code loaded from source file

Similar to the above but loads the default export from a local `lib/myCode.js` file.

```turtle
@prefix code: <https://code.described.at/>

<urn:example:node> 
  code:implementedBy [
    a code:EcmaScript ;
    code:link <file:lib/myCode>
  ] .
```

```js
const cf = require('clownface')
const rdf = require('rdf-ext')
const registry = require('./registry')
const dataset = require('./dataset')

const parentNode = rdf.namedNode('urn:example:node')
const implementedBy = rdf.namedNode('https://code.described.at/implementedBy')

const myCode = registry.load(
  cf(dataset).node(parentNode).out(implementedBy),
  {
    basePath: process.cwd() // required to resolve relative paths
  })
```

It is also possible to load named exports similarly to the first example by using hash fragments
like `file:lib/myCode#namedExport`.

### JS literal inlined in RDF dataset

A piece of JS code can also be placed directly in the triples. 

This snippet shows how an `Array#filter` callback can be loaded from the dataset.

```turtle
@prefix code: <https://code.described.at/>

<urn:example:node> 
  code:implementedBy "name => name.startsWith('A')"^^code:EcmaScript .
```

```js
const cf = require('clownface')
const rdf = require('rdf-ext')
const registry = require('./registry')
const dataset = require('./dataset')

const parentNode = rdf.namedNode('urn:example:node')
const implementedBy = rdf.namedNode('https://code.described.at/implementedBy')

const filterFunc = registry.load(cf(dataset).node(parentNode).out(implementedBy))
```

### JS template string literal

A dedicated datatype can also be used to load a string based on a template literal. The loader will substitute
the variables based on an optional parameter.

```turtle
@prefix code: <https://code.described.at/>

<urn:example:node> 
  code:implementedBy "Hello ${name}"^^code:EcmaScriptTemplateLiteral .
```

To fill in the template string, a Map of variable must be passed to the loader.

```js
const cf = require('clownface')
const rdf = require('rdf-ext')
const registry = require('./registry')
const dataset = require('./dataset')

const parentNode = rdf.namedNode('urn:example:node')
const implementedBy = rdf.namedNode('https://code.described.at/implementedBy')

const variables = new Map()
variables.set('name', 'World')

const helloString = registry.load(
  cf(dataset).node(parentNode).out(implementedBy),
  {
    variables
  })
```
