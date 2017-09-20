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
    if (isPathRelative(sAbsolutePath) ){ return sAbsolutePath }
    return './' + path.relative(sFileDir, path.join(sRoot,sAbsolutePath))
}

module.exports = function(file, api) {
  var j = api.jscodeshift; // alias the jscodeshift API
  var sRoot = path.resolve()
  var sFileDir = path.parse(file.path).dir
  var root = j(file.source); // parse JS code into an AST
  debugger
  // the main update method replaces merge with ObjectExpression
  var i = 0
  const oneArgString = (node) => {
      return node.value.arguments.length === 1 && node.value.arguments[0].type === 'Literal'
    // j(node)
  }
  // find and update all merge calls
  root.find(j.CallExpression, {callee: {name: 'require'}})
   .filter(oneArgString)
   .forEach((node, i)=>{
        const newPath = absoluteToRelative(sRoot, sFileDir, node.value.arguments[0].value)
        node.value.arguments[0].value = newPath
        if (i === 0) {
            console.log(node)
            console.log(j(node))
        }
   })
  // print
  return root.toSource({quote: 'single'});
};

const flatten = a => Array.isArray(a) ? [].concat(...a.map(flatten)) : a;