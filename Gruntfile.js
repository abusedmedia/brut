var path = require('path')

module.exports = function (grunt) {
  var baseProject = grunt.option('app') // i.e. grunt dev --app=path/to/folder

  var appFolder = path.join(baseProject, '/app')
  var devFolder = path.join(baseProject, '/.dev')

  var localPkg = {version: '0.0.0'}
  try {
    localPkg = grunt.file.readJSON(path.join(baseProject, '/package.json'))
  } catch (e) {
  }

  grunt.initConfig({

    watch: {
      options: {
        cwd: appFolder
      },
      files: ['**/*.json', '**/*.ejs', '!node_modules/**/*'], //, '**/*.css'], //, 'scss/**/*.scss', 'js/**/*.js'],
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
        cwd: baseProject,
        src: '**/*.json'
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-ejs')
  grunt.loadNpmTasks('grunt-browser-sync')

  grunt.registerMultiTask('localdata', 'Read local data', require('./plugins/localdata.js'))

  grunt.registerTask('dev', ['localdata', 'ejs:dev', 'browserSync', 'watch'])

  grunt.registerTask('ttt', ['localdata', 'ejs:dev'])
}
