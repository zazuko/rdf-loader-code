# rdf-loader-code

## 2.0.0

### Major Changes

- 3e0b319: Preserve the type of literal by loading them as native JS objects.
  Any literal supported by [rdf-literal](https://npm.im/rdf-literal) will be converted to appropriate type.
  An error will be thrown in the value does not correspond with the lexical representation of the given datatype.

## 1.0.0

### Major Changes

- c3b6e27: Convert package to ESM (and dependencies)
