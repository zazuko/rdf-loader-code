---
"rdf-loader-code": major
---

Preserve the type of literal by loading them as native JS objects.
Any literal supported by [rdf-literal](https://npm.im/rdf-literal) will be converted to appropriate type.
An error will be thrown in the value does not correspond with the lexical representation of the given datatype.
