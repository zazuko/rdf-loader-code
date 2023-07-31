# Native RDF loaders for the [code](https://code.described.at) vocabulary

The loaders contained in this packages let developers link RDF to native code and load that code at runtime
to be executed in their programs.

## Installation

The code loader and the loader registry can be installed with the following lines:  

```
npm i --save rdf-loader-code
npm i --save rdf-loaders-registry
```

Somewhere at the beginning of your code, register the loaders

```js
import LoaderRegistry from 'rdf-loaders-registry'
import EcmaScriptLoader from 'rdf-loader-code/ecmaScript.js'
import EcmaScriptLiteralLoader from 'rdf-loader-code/ecmaScriptLiteral.js'

const registry = new LoaderRegistry()

EcmaScriptLoader.register(registry)
EcmaScriptLiteralLoader.register(registry)

export default registry
```

## Usage

All examples below assume that the `./dataset` module exports a [`RDF/JS` dataset](https://rdf.js.org/dataset-spec/).
That dataset would contain the triples presented in the respective turtle snippet.
The `./registry` module is assumed to be implemented as shown in the `Installation` section above.

### JS code loaded from node modules (or built-ins)

This example is equivalent to calling `require('fs').createReadStream` 

```turtle
@prefix code: <https://code.described.at/>.

<urn:example:node> 
  code:implementedBy [
    a code:EcmaScript ;
    code:link <node:fs#createReadStream>
  ] .
```

```js
import rdf from '@zazuko/env'
import registry from './registry.js'
import dataset from './dataset.js'

const term = rdf.namedNode('urn:example:node')
const implementedBy = rdf.namedNode('https://code.described.at/implementedBy')

const createReadStream = registry.load(rdf.clownface({ term, dataset }).out(implementedBy))
```

### JS code loaded from source file

Similar to the above but loads the default export from a local `lib/myCode.js` file.

```turtle
@prefix code: <https://code.described.at/>.

<urn:example:node> 
  code:implementedBy [
    a code:EcmaScriptModule ;
    code:link <file:lib/myCode.js#default>
  ] .
```

```js
import rdf from '@zazuko/env'
import registry from './registry.js'
import dataset from './dataset.js'

const term = rdf.namedNode('urn:example:node')
const implementedBy = rdf.namedNode('https://code.described.at/implementedBy')

const myCode = registry.load(
  rdf.clownface({ term, dataset }).out(implementedBy),
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
@prefix code: <https://code.described.at/>.

<urn:example:node> 
  code:implementedBy "name => name.startsWith('A')"^^code:EcmaScript .
```

```js
import rdf from '@zazuko/env'
import registry from './registry.js'
import dataset from './dataset.js'

const term = rdf.namedNode('urn:example:node')
const implementedBy = rdf.namedNode('https://code.described.at/implementedBy')

const filterFunc = registry.load(rdf.clownface({ term, dataset }).out(implementedBy))
```

### JS template string literal

A dedicated datatype can also be used to load a string based on a template literal. The loader will substitute
the variables based on an optional parameter.

```turtle
@prefix code: <https://code.described.at/>.

<urn:example:node> 
  code:implementedBy "Hello ${name}"^^code:EcmaScriptTemplateLiteral .
```

To fill in the template string, a Map of variable must be passed to the loader.

```js
import rdf from '@zazuko/env'
import registry from './registry.js'
import dataset from './dataset.js'

const term = rdf.namedNode('urn:example:node')
const implementedBy = rdf.namedNode('https://code.described.at/implementedBy')

const variables = new Map()
variables.set('name', 'World')

const helloString = registry.load(
  rdf.clownface({ term, dataset }).out(implementedBy),
  {
    variables
  })
```

### Loading function arguments

This package also provides an utility loader which can be used to load an array of function arguments.
Using this arguments loader it is possible to declare parametrized code within the RDF graph.

Two flavor for such arguments are possible: positional parameters and parameter map.

The actual argument values will be recursively loaded using the loader registry itself.

Note that the arguments loader cannot be registered with the registry because selection is based on an
`rdf:type` which is not available when defining the triples (check the exampels below). For that reason
the loader must always be called directly and it is the caller's responsibility to select the correct
RDF node which contains the `code:arguments` property.

#### Positional parameters

To load positional parameters the graph, simply define them as an `rdf:List`.

```turtle
@prefix code: <https://code.described.at/>.

<urn:call:string#startsWith> 
  code:arguments ( "a" 5 ).
```

Executing the code below against the above triples will return an array containing the values
`[ "a" "5" ]`.

The quotes around 5 is no mistake. The loader currently returns a raw literal value from RDF, disregarding
its datatype.


```js
import rdf from '@zazuko/env'
import loadArguments from 'rdf-loader-code/arguments.js'
import registry from './registry.js'
import dataset from './dataset.js'

const term = rdf.namedNode('urn:call:string#startsWith')

const argumentsArray = loadArguments(
  rdf.clownface({ term, dataset }), 
  {
    loaderRegistry: registry
  })
```

#### Named parameters

Instead of relying on the order of parameters, the loader also out-of-the-box supports
loading of an argument map. Such arguments are declared as name/value pairs.

```turtle
@prefix code: <https://code.described.at/>.

<urn:call:string#startsWith> 
  code:arguments [
    code:name "first"; code:value "foo"
  ], [
    code:name "second"; code:value "bar"
  ] .
```

Executing the code below against the above triples will return an object containing the values

```json
[
  {
    "first": "foo",
    "second": "bar"
  }
]
```

To make this method consistent with the positional flavor, the object will actually be wrapped
in an array as presented above. 

```js
import rdf from '@zazuko/env'
import loadArguments from 'rdf-loader-code/arguments.js'
import registry from './registry.js'
import dataset from './dataset.js'

const term = rdf.namedNode('urn:call:string#startsWith')

const argumentsObject = loadArguments(
  rdf.clownface({ term, dataset }),
  {
    loaderRegistry: registry
  })
```
