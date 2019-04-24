/* global describe, test */
const createReadStream = require('fs').createReadStream
const path = require('path')
const expect = require('expect')
const rdf = require('rdf-ext')
const Parser = require('@rdfjs/parser-n3')
const loader = require('../arguments')

const parser = new Parser()

describe('arguments loader', () => {
  const node = rdf.namedNode('http://example.com/')

  test('should accept arguments from rdf:List', async () => {
    // given
    const options = {}
    const dataset = await loadDataset('./list-arguments.ttl')

    // when
    const result = loader(node, dataset, options)

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
