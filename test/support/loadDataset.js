const { createReadStream } = require('fs')
const { resolve } = require('path')
const rdf = require('@rdfjs/dataset')
const Parser = require('@rdfjs/parser-n3')
const { fromStream } = require('rdf-dataset-ext')

async function loadDataset (filename) {
  const parser = new Parser()
  const datasetFileStream = createReadStream(resolve(__dirname, '..', filename))

  return fromStream(rdf.dataset(), parser.import(datasetFileStream))
}

module.exports = loadDataset
