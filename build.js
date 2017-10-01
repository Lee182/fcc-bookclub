const fs = require('fs-extra')
const _ = require('lodash')
const chokidar = require('chokidar')
const CoffeeScript = require('coffeescript')

const serverBabelConfig = {
  'presets': ['node8'],
  'plugins': [
    ['babel-plugin-root-import', {
      'rootPathPrefix': '~'
    }]
  ]
}
const path = require('path')

const deepGetAllFiles = async (dir = './') => {
  const names = await fs.readdir(dir)
  const contents = await Promise.all(names.map(async (name) => {
    const fullpath = path.join(dir, name)
    const info = await fs.stat(fullpath)
    return {
      name,
      dir: fullpath,
      isFile: info.isFile(),
      isDirectory: info.isDirectory(),
      parsed: false
    }
  }))
  const files = []
  const dirs = []
  contents.map((item) => {
    if (item.isFile) {
      files.push(item)
    } else if (item.isDirectory && item.name !== '.git' && item.name !== 'node_modules') {
      dirs.push(item)
    }
  })
  const stuff = await _.reduce(dirs, (prom, item) => {
    return prom.then(async (result) => {
      const res = await deepGetAllFiles(path.join(dir, item.name))
      result.files = _.concat(result.files, res.files)
      result.dirs = _.concat(result.dirs, res.dirs)
      return result
    })
  }, Promise.resolve({files, dirs}))
  return stuff
}

const allfiles = async () => {
  try {
    const a = await deepGetAllFiles()
    debugger
  } catch (err) {
    debugger
  }
}
allfiles()

const watcher = chokidar.watch('./server')
watcher.on('change', _.debounce(async (filepath) => {
  if (isCoffeeFile(filepath)) {
    await writeCoffeeScript(filepath)
  }
}, 200))

const isCoffeeFile = (filepath) => {
  return filepath.substr(-7) === '.coffee'
}
const writeCoffeeScript = async (filepath) => {
  console.time(`compiled ${filepath}`)
  const filebuf = await fs.readFile(filepath)
  const babeloptions = _.assign({}, serverBabelConfig, {
    filename: path.resolve(filepath),
    sourceFileName: path.resolve(filepath),
    sourceRoot: path.resolve('./'),
    babelrc: false
  })
  const out = CoffeeScript.compile(filebuf.toString(), {
    inlineMap: true,
    filename: filepath,
    bare: true,
    transpile: babeloptions
  })
  const newpath = 'dist/' + filepath.substr(0, filepath.length - 6) + 'js'
  await fs.outputFile(newpath, out)
  console.timeEnd(`compiled ${filepath}`)
}
