const evalTemplateLiteral = require('./evalTemplateLiteral')
const ns = require('./namespaces')

function loader ({ term }, { context, variables } = {}) {
  if (!(term.termType !== 'Literal' || !term.datatype.equals(ns.code('EcmaScriptTemplateLiteral')))) {
    return evalTemplateLiteral(term.value, { context, variables })
  }

  throw new Error(`Cannot load ES6 literal from term ${term.value}`)
}

loader.register = registry => {
  registry.registerLiteralLoader(ns.code('EcmaScriptTemplateLiteral'), loader)
}

module.exports = loader
