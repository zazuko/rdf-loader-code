# rdf-loader-code

## 2.2.0

### Minor Changes

- 829dc79: Add simpler syntax for creating key/value pair arguments (closes #37, closes #38)

## 2.1.3

### Patch Changes

- aa9a3f5: Fix Windows compatibility of module imports

## 2.1.2

### Patch Changes

- de91ac6: Ban deprecated `rdf-js` package

## 2.1.1

### Patch Changes

- 798319d: Wrong .npmignore - declarations were actually missing

## 2.1.0

### Minor Changes

- f901cec: Bundle TypeScript declarations

## 2.0.0

### Major Changes

- 3e0b319: Preserve the type of literal by loading them as native JS objects.
  Any literal supported by [rdf-literal](https://npm.im/rdf-literal) will be converted to appropriate type.
  An error will be thrown in the value does not correspond with the lexical representation of the given datatype.

## 1.0.0

### Major Changes

- c3b6e27: Convert package to ESM (and dependencies)
