// jshint node: true
'use strict';

module.exports = function (grunt) {
  var projectConfig = {
    // configurable paths
    temp: '.tmp',
    dist: 'dist',
    localAssets: 'local_assets',
    sharedAssets: 'src',
    bower: require('./bower.json')
  };

  var configureTasks = require('grunt-fresenius-tasks');
  configureTasks(grunt, projectConfig);

  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-wiredep');
  grunt.loadNpmTasks('grunt-replace');

  grunt.config.merge({

    //////////////////////////////////////////////
    // Bump
    //////////////////////////////////////////////
    bump: {
      options: {
        files: ['bower.json', 'package.json'],
        updateConfigs: [],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['bower.json', 'package.json'],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        // NEVER change this.
        push: false,
        pushTo: 'upstream',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
      }
    },

    ////////////////////////////////////////////////////
    // Clean
    ////////////////////////////////////////////////////
    clean: {
      build: {
        files: [{
          dot: true,
          src: [
            '<%= projectconfig.temp %>',
            '<%= projectconfig.dist %>/*'
            //,
            //'!<%= projectconfig.dist %>/.git*',
            //'!<%= projectconfig.dist %>/CNAME'
          ]
        }]
      }
    },

    ////////////////////////////////////////////////////
    // Copy
    ////////////////////////////////////////////////////
    // Copies remaining files to places other tasks can use
    copy: {
      build: {
        files: [
          {
            expand: true,
            cwd: '<%= projectconfig.sharedAssets %>',
            src: [
              'bower_components/**/*',
              'images/**/*',
              'scripts/**/*',
              'styles/**/*',
              'templates/**/*',
              '.htaccess',
              'favicon.ico',
              'robots.txt'
            ],
            dest: '<%= projectconfig.dist %>'
          },
          {
            expand: true,
            cwd: '.',
            src: [
              'bower.json'
            ],
            dest: '<%= projectconfig.dist %>'
          }
        ]
      }
    },

    ////////////////////////////////////////////////////
    // JSHint
    ////////////////////////////////////////////////////
    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      //options: {
      //  jshintrc: '.jshintrc',
      //  reporter: require('jshint-stylish')
      //},
      //gruntfile: {
      //  src: ['Gruntfile.js']
      //},
      scripts: {
        src: [
          '<%= projectconfig.sharedAssets %>/scripts/**/*.js'
        ]
      }
//      e2eTests: {
//        options: {
//          jshintrc: 'test/e2e/.jshintrc'
//        },
//        src: ['test/e2e/spec/{,*/}*.js']
//      },
//      integrationTests: {
//        options: {
//          jshintrc: 'test/integration/.jshintrc'
//        },
//        src: ['test/integration/spec/{,*/}*.js']
//      },
//      unitTests: {
//        options: {
//          jshintrc: 'test/unit/.jshintrc'
//        },
//        src: ['test/unit/spec/{,*/}*.js']
//      }
    },

    //////////////////////////////////////////////
    // Replace
    //////////////////////////////////////////////
    replace: {
      develop: {
        options: {
          patterns: [
            {
              match: '../../bower_components',
              replacement: '/bower_components'
            }
          ],
          usePrefix: false
        },
        files: [
          {
            expand: true,
            flatten: true,
            src: ['<%= projectconfig.sharedAssets %>/templates/layouts/base_layout.hbs'],
            dest: '<%= projectconfig.sharedAssets %>/templates/layouts/'
          }
        ]
      },
      build: {
        options: {
          patterns: [
            {
              match: '../../bower_components',
              replacement: '/bower_components'
            },
            //{
            //  match: 'build:css({.tmp,src})',
            //  replacement: 'build:css({node_modules/fresenius-assets/dist,.tmp,src})'
            //},
            {
              match: 'build:js({.tmp,src})',
              replacement: 'build:js({node_modules/fresenius-assets/dist,.tmp,src})'
            }
          ],
          usePrefix: false
        },
        files: [
          {
            expand: true,
            flatten: true,
            src: ['<%= projectconfig.dist %>/templates/layouts/base_layout.hbs'],
            dest: '<%= projectconfig.dist %>/templates/layouts/'
          }
        ]
      }
    },

    //////////////////////////////////////////////
    // Wiredep
    //////////////////////////////////////////////
    // Automatically inject Bower components into the html
    wiredep: {
      all: {
        src: ['<%= projectconfig.sharedAssets %>/templates/layouts/base_layout.hbs'],
        exclude: [
          '<%= projectconfig.sharedAssets %>/bower_components/json3/lib/json3.min.js',
          '<%= projectconfig.sharedAssets %>/bower_components/es5-shim/es5-shim.js'
        ],
        bowerJson: '<%= projectconfig.bower %>',
        directory: '<%= projectconfig.sharedAssets %>/bower_components',
        cwd: '<%= projectconfig.sharedAssets %>/templates/layouts'
      }
    }


  });

  //////////////////////////////////////////////
  // Watch
  //////////////////////////////////////////////
  // Explicitly override the watch configuration
  grunt.config('watch', {
    gruntfile: {
      files: ['Gruntfile.js'],
      tasks: ['jshint:gruntfile']
    },
    bower: {
      files: ['./bower.json'],
      tasks: ['wiredep', 'replace:develop']
    },
    handlebars: {
      files: [
        '<%= projectconfig.sharedAssets %>/templates/**/*.hbs',
        '<%= projectconfig.localAssets %>/data/**/*.{yml,json}',
        '<%= projectconfig.localAssets %>/images/**/*',
        '!<%= projectconfig.localAssets %>/images/sprites/**/*'
      ],
      tasks: ['assemble'],
      options: {
        livereload: true
      }
    },
    sprite: {
      files: [
        '{<%= projectconfig.localAssets %>, <%= projectconfig.sharedAssets %>}/images/sprites/**/*'
      ],
      tasks: ['sprite', 'stylus:develop', 'autoprefixer'],
      options: {
        livereload: true
      }
    },
    stylus: {
      files: [
        '{<%= projectconfig.localAssets %>, <%= projectconfig.sharedAssets %>}/styles/**/*.styl'
      ],
      tasks: ['stylus:develop', 'autoprefixer'],
      options: {
        livereload: true
      }
    },
    scripts: {
      files: ['<%= projectconfig.sharedAssets %>/scripts/**/*.js'],
      tasks: ['jshint:scripts', 'karma:unitCI'],
      options: {
        livereload: true
      }
    },
    unitTests: {
      files: ['test/unit/spec/**/*.js'],
      tasks: ['jshint:unitTests', 'karma:unitCI']
    },
    livereload: {
      options: {
        livereload: '<%= connect.options.livereload %>'
      },
      files: [
        '<%= projectconfig.temp %>/{,*/}*.html',
        '<%= projectconfig.temp %>/styles/{,*/}*.css',
        '{<%= projectconfig.localAssets %>,<%= projectconfig.sharedAssets %>,<%= projectconfig.temp %>}/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
      ]
    }
  });

  // Override the build task
  grunt.registerTask('build', [
    'clean:build',
    'wiredep',
    'copy:build',
    'replace:build'
  ]);

};
