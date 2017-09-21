const path = require('path')
const isPathRelative = (sRelPath)=>{
    return (
        path.isAbsolute(sRelPath) === false && 
        (sRelPath.substr(0,2) === './' || sRelPath.substr(0,3) === '../')
    )
}
const relativeToAbsolute = (sRoot, sFileDir, sRelPath)=>{
    console.log(sRoot, sFileDir, sRelPath)
    if (isPathRelative(sRelPath) === false) {return sRelPath}
    return path.resolve(sFileDir, sRelPath).substr(sRoot.length)
}
const absoluteToRelative = (sRoot, sFileDir, sAbsolutePath)=>{
    if (!path.isAbsolute(sAbsolutePath) ){ return sAbsolutePath }
    return './' + path.relative(sFileDir, path.join(sRoot,sAbsolutePath))
}
const fnConvert = absoluteToRelative

module.exports = function(file, api) {
  var j = api.jscodeshift; // alias the jscodeshift API
  var sRoot = path.resolve()
  var sFileDir = path.parse(file.path).dir
  var root = j(file.source); // parse JS code into an AST

  const oneArgString = (node) => {
      return node.value.arguments.length === 1 && node.value.arguments[0].type === 'Literal'
  }
  // find and update all merge calls
  root.find(j.CallExpression, {callee: {name: 'require'}})
   .filter(oneArgString)
   .forEach((node, i)=>{
        const newPath = fnConvert(sRoot, sFileDir, node.value.arguments[0].value)
        node.value.arguments[0].value = newPath
   })
   root.find(j.ImportDeclaration)
    .forEach(node=>{
        const newPath = fnConvert(sRoot, sFileDir, node.value.source.value)
        node.value.source.value = newPath
    })
  // print
  return root.toSource({quote: 'single'});
};