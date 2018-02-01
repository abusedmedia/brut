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
      files: ['**/*.md', '**/*.ejs', '!node_modules/**/*'], //, '**/*.css'], //, 'scss/**/*.scss', 'js/**/*.js'],
      tasks: ['ejs:dev']
    },

    ejs: {
      dev: {
        options: {
          title: 'My Website',
          url: function (url) {
            return 'http://example.com/formatted/url/' + url
          }
        },
        cwd: appFolder,
        src: ['**/*.ejs', '!**/_*.ejs', '!node_modules/**/*'],
        dest: appFolder,
        expand: true,
        ext: '.html'
      }
    },

    copy: {
      dev: {
        expand: true,
        cwd: appFolder,
        src: '**/*.css',
        dest: devFolder
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
    }
  })

  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-ejs')
  grunt.loadNpmTasks('grunt-browser-sync')
  grunt.loadNpmTasks('grunt-contrib-copy')

  // grunt.registerTask('build', ['ejs:build'])

  grunt.registerTask('dev', ['ejs:dev', 'browserSync', 'watch'])
}
