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