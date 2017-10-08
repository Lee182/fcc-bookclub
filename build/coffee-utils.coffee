export isCoffeeFile = (filepath) ->
  typeof filepath is 'string' and
  filepath.substr(-7) is '.coffee'

export writeCoffeeScriptToJs = ({ filepath, babelconfig }) ->
  console.time filepath
  filebuf = await fs.readFile filepath
  babeloptions = _.assign({}, babelconfig,
    filename: path.resolve filepath
    sourceFileName: path.resolve filepath
    sourceRoot: path.resolve('./')
    babelrc: false)
  out = CoffeeScript.compile(filebuf.toString(),
    inlineMap: true
    filename: filepath
    bare: true
    transpile: babeloptions)
  newpath = 'dist/' + filepath.substr(0, filepath.length - 6) + 'js'
  await fs.outputFile newpath, out
  console.timeEnd(filepath)