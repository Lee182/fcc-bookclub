import path from 'path'
import fs from 'fs-extra'
import _ from 'lodash'
import chokidar from 'chokidar'
import CoffeeScript from 'coffeescript'

import deepGetAllFiles from '#/build/deep-get-all-files'
import { isCoffeeFile, writeCoffeeScriptToJs } from '#/build/coffee-utils'
String::startsWith = (startstr) ->
  typeof this is 'string' and new Regex('^' + startstr).test this

serverBabelConfig =
  'presets': [ 'node8' ]
  'plugins': [
    ['babel-plugin-root-import', { 'rootPathPrefix': '~' }]
  ]

allfiles = ->
  { files, dirs } = await deepGetAllFiles('../server')
  serverfiles = _.filter files, ({ dir }) ->
    dir.startsWith 'server'
  coffeefiles = _.filter serverfiles, ({ name }) ->
    isCoffeeFile name
  await Promise.all _.map coffeefiles, ({ dir }) ->
    await writeCoffeeScriptToJs dir


watcher = chokidar.watch('./server')
watcher.on 'change', _.debounce((filepath) ->
  if isCoffeeFile(filepath)
    await writeCoffeeScriptToJs({ filepath, babelconfig: serverBabelConfig })
, 200)

allfiles()