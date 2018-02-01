'use strict'

var grunt = require('grunt')
var path = require('path')
var fs = require('fs')

module.exports = function () {
  var ob = {}
  this.files.forEach(function (filePair) {
    var f = filePair.orig.cwd
    var p = filePair.src[0]
    var src = grunt.file.readJSON(p)
    var filename = path.parse(p).name
    var diff = path.relative(f, path.parse(p).dir)
    if (diff) {
      var frags = diff.split('/')
      var res = ob
      frags.forEach(d => {
        res[d] = (!res[d]) ? {} : res[d]
        res = res[d]
      })
      res[filename] = src
    } else {
      ob[filename] = src
    }
  })
  grunt.config('localdata', ob)
}
