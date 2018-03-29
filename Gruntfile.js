var path = require('path')

module.exports = function (grunt) {
  var baseProject = grunt.option('app') ? grunt.option('app') : __dirname // i.e. grunt dev --app=path/to/folder

  var appFolder = path.join(baseProject, '/app')
  var tmpFolder = path.join(baseProject, '/.process')

  var localPkg = {version: '0.0.0'}
  try {
    localPkg = grunt.file.readJSON(path.join(appFolder, '/package.json'))
  } catch (e) {
  }

  var brut = {
    publicFolder: 'public',
    asyncBundle: true
  }

  if (localPkg.brut) {
    for (var k in localPkg.brut) {
      brut[k] = localPkg.brut[k]
    }
  }

  var pubFolder = path.join(appFolder, '/', brut.publicFolder)

  var version = localPkg.version

  grunt.initConfig({

    /*
      Development
    */

    watch: {
      options: {
        cwd: appFolder
      },
      files: ['**/*.json', '**/*.ejs', '!node_modules/**'], //, '**/*.css'], //, 'scss/**/*.scss', 'js/**/*.js'],
      tasks: ['localdata', 'ejs:dev']
    },

    ejs: {
      dev: {
        options: '<%= localdata %>',
        cwd: appFolder,
        src: ['**/*.ejs', '!**/_*.ejs', '!node_modules/**/*'],
        dest: appFolder,
        expand: true,
        ext: '.html'
      }
    },

    browserSync: {
      dev: {
        bsFiles: {
          src: [
            path.join(appFolder, '/**/*.css'),
            path.join(appFolder, '/**/*.html')
          ]
        },
        options: {
          watchTask: true,
          server: appFolder,
          injectChanges: true,
          reloadDelay: 0,
          open: false
        }
      }
    },

    localdata: {
      dev: {
        expand: true,
        cwd: appFolder,
        src: ['**/*.json', '!node_modules/**', '!package.json', '!package-lock.json']
      }
    },

    /*
      Build
    */

    copy: {
      build: {
        files: [
          {
            expand: true,
            cwd: appFolder,
            src: ['**/*'],
            dest: tmpFolder
          }
        ]
      }
    },

    useminPrepare: {
      options: {
        dest: tmpFolder
      },
      multi: {
        files: {
          src: [
            path.join(tmpFolder, '**/*.html'),
            '!' + path.join(tmpFolder, 'node_modules/**/*.html')
          ]
        }
      }
    },

    usemin: {
      html: [ path.join(tmpFolder, 'index.html'), path.join(tmpFolder, '**/*.html'), '!' + path.join(tmpFolder, 'node_modules/**/*.html') ],
      options: {
        blockReplacements: {
          js: function (block) {
            if (brut.asyncBundle) {
              return `<script type="text/javascript">
                      function _l(a,b){var c=new XMLHttpRequest,d=document;c.open("GET",a,!0),c.onload=function(){var a=d.createElement("script");a.type="text/javascript",a.textContent=c.responseText,d.body.appendChild(a),b&&b()},c.send()}
                      _l('${block.dest}?v=${version}');
                      </script>`
            } else {
              return `<script type="text/javascript" src="${block.dest}?v=${version}"></script>`
            }
          },
          css: function (block) {
            var dest = block.dest.split('/')
            dest = (dest.length > 1) ? dest[dest.length - 1] : dest[0]
            return '<link href="' + dest + '?__inline=true&v=' + version + '" rel="stylesheet" />'
          }
        }
      }
    },

    uglify: {
      options: {
        sourceMap: false,
        sourceMapIn: function (uglifySource) {
          return uglifySource + '.map'
        },
        compress: {
          pure_funcs: ['console.log']
        }
      },
      generated: {
        mangle: true,  // invert for debug
        beautify: false, // invert for debug
        sourceMap: true   // generated source maps for debug
      }
    },

    postcss: {
      options: {
        // map: true, // inline sourcemaps

        // or
        /* map: {
            inline: false, // save all sourcemaps as separate files...
            annotation: 'dist/css/maps/' // ...to the specified directory
        }, */

        processors: [
          require('pixrem')(), // add fallbacks for rem units
          require('autoprefixer')({browsers: 'last 3 versions'}), // add vendor prefixes
          require('cssnano')() // minify the result
        ]
      },
      dist: {
        src: [path.join(tmpFolder, 'concat/**/*.css'), path.join(tmpFolder, 'concat/*.css')]
        // dest: path.join(options.folders.tmp, 'concat/css/app.css' ),
      }
    },

    processhtml: {
      options: {
        commentMarker: 'process',
        recursive: true,
        data: '<%= localdata %>',
        includeBase: tmpFolder
      },
      multi: {
        expand: true,
        cwd: tmpFolder,
        src: ['*.html', '**/*.html'],
        dest: tmpFolder
      }
    }

  })

  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-ejs')
  grunt.loadNpmTasks('grunt-browser-sync')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-usemin')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-postcss')
  grunt.loadNpmTasks('grunt-contrib-cssmin')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-processhtml')

  grunt.registerMultiTask('localdata', 'Read local data', require('./plugins/localdata.js'))

  grunt.registerTask('dev', ['localdata', 'ejs:dev', 'browserSync', 'watch'])

  grunt.registerTask('build', [
    'copy:build',
    'useminPrepare',
    'concat:generated',
    'postcss',
    'uglify:generated',
    'cssmin:generated',
    'usemin'

    // 'processhtml'
  ])
}
