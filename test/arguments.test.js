/* global describe, test, beforeEach */
const createReadStream = require('fs').createReadStream
const cf = require('clownface')
const path = require('path')
const expect = require('expect')
const rdf = require('rdf-ext')
const Parser = require('@rdfjs/parser-n3')
const sinon = require('sinon')
const loader = require('../arguments')
const ns = require('../namespaces')

const parser = new Parser()

describe('arguments loader', () => {
  const rootNode = rdf.namedNode('http://example.com/')
  let loaderRegistry

  beforeEach(() => {
    loaderRegistry = {
      load: sinon.spy()
    }
  })

  test('should accept arguments from rdf:List', async () => {
    // given
    const options = {
      loaderRegistry
    }
    const dataset = await loadDataset('./list-arguments.ttl')
    const node = cf(dataset).node(rootNode).out(ns.code.arguments)

    // when
    const result = await loader(node.term, dataset, options)

    // then
    expect(result).toEqual(['a', 'b'])
  })
})

async function loadDataset (filename) {
  const dataset = rdf.dataset()

  const datasetFileStream = createReadStream(path.join(__dirname, filename))
  await dataset.import(parser.import(datasetFileStream))

  return dataset
}
