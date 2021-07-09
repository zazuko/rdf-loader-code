const { resolve } = require('path')
const rdf = require('rdf-ext')
const fromFile = require('rdf-utils-fs/fromFile.js')

async function loadDataset (filename) {
  return rdf.dataset().import(fromFile(resolve(__dirname, '..', filename)))
}

module.exports = loadDataset
