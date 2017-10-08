import path from 'path'
import fs from 'fs-extra'
import _ from 'lodash'
import chokidar from 'chokidar'
import CoffeeScript from 'coffeescript'

serverBabelConfig =
  'presets': [ 'node8' ]
  'plugins': [
    ['babel-plugin-root-import', { 'rootPathPrefix': '~' }]
  ]

deepGetAllFiles = (dir = './') ->
  names = await fs.readdir(dir)
  contents = await Promise.all(names.map((name) ->
    fullpath = path.join(dir, name)
    info = await fs.stat(fullpath)
    {
      name: name
      dir: fullpath
      isFile: info.isFile()
      isDirectory: info.isDirectory()
      parsed: false
    }
  ))
  files = []
  dirs = []
  _.each contents, (item) ->
    if item.isFile
      files.push item
      return
    if item.isDirectory and not ['.git', 'node_modules'].includes item.name
      dirs.push item
  prom = Promise.resolve({ files, dirs })
  _.each dirs, (item) ->
    prom = prom.then (result) ->
      res = await deepGetAllFiles(path.join(dir, item.name))
      result.files = _.concat(result.files, res.files)
      result.dirs = _.concat(result.dirs, res.dirs)
      result
  await prom

allfiles = ->
  { files, dirs } = await deepGetAllFiles('../server')
  serverfiles = _.filter files, ({ dir }) ->
    dir.startsWith 'server'
  coffeefiles = _.filter serverfiles, ({ name }) ->
    isCoffeeFile name
  await Promise.all _.map coffeefiles, ({ dir }) ->
    await writeCoffeeScriptToJs dir
  debugger

console.log 'started jnoo'
allfiles()

watcher = chokidar.watch('./server')
watcher.on 'change', _.debounce((filepath) ->
  if isCoffeeFile(filepath)
    await writeCoffeeScriptToJs filepath
, 200)

String::startsWith = (startstr) ->
  typeof this is 'string' and new Regex('^' + startstr).test filepath

isCoffeeFile = (filepath) ->
  typeof filepath is 'string' and
  filepath.substr(-7) is '.coffee'

writeCoffeeScriptToJs = (filepath) ->
  console.time filepath
  filebuf = await fs.readFile filepath
  babeloptions = _.assign({}, serverBabelConfig,
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