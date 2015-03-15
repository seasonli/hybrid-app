/**
 * @Fileoverview Grunt Task Configure
 * @Author SeasonLi | season.chopsticks@gmail.com
 * @Version 1.0 | 2015-01-18 | SeasonLi    // Initial version
 *                                         // Add copy task
 * @Version 1.1 | 2015-02-03 | SeasonLi    // Adjust config ways
 * @Version 1.2 | 2015-02-04 | SeasonLi    // Use imagemin
 * @Version 1.3 | 2015-02-07 | SeasonLi    // Use less
 *                                         // Regularize tasks settings
 * @Version 1.4 | 2015-02-22 | SeasonLi    // Use requirejs
 *                                         // Dynamic config scripts should be optimized
 *                                         // Use filerev & usemin
 * @Version 1.5 | 2015-02-24 | SeasonLi    // Optimize tasks
 * @Version 1.6 | 2015-03-08 | SeasonLi    // Optimize match scripts
 *                                         // Optimize release task
 * @Version 1.7 | 2015-03-16 | SeasonLi    // Use tpl widget compile
 **/

var path = require('path'),
  fs = require("fs"),
  glob = require('glob'),
  cheerio = require('cheerio');


function mkdirsSync(dirname, mode) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname), mode)) {
      fs.mkdirSync(dirname, mode);
      return true;
    }
  }
}


module.exports = function(grunt) {
  // Grunt tasks config
  grunt.config.init({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      options: {
        spawn: false
      },
      common: {
        files: [
          'page/**/*.*',
          'static/**/*.*',
          'module/**/*.*',
        ],
        tasks: [] // Dynamic config
      }
    },
    copy: {
      common: {
        files: [{
          expand: true,
          cwd: '',
          src: ['{static,module}/**/*.{html,js,gif,png,jpg,jpeg,gif,eot,svg,ttf,woff,mst}'],
          dest: '' // Dynamic config
        }]
      }
    },
    less: {
      common: {
        files: [{
          expand: true,
          cwd: '',
          src: ['static/**/*.less'],
          dest: '', // Dynamic config
          ext: '.css'
        }]
      }
    },
    imagemin: {
      options: {
        optimizationLevel: 3,
      },
      common: {
        files: [{
          expand: true,
          cwd: '', // Dynamic config
          src: ['{page,static,module}/**/*.{png,jpg,jpeg,gif}'],
          dest: '' // Dynamic config
        }]
      }
    },
    requirejs: {
      common: {
        options: {
          mainConfigFile: 'static/js/requireConfig.js',
          dir: '', // Dynamic config
          modules: [] // Dynamic config
        }
      }
    },
    filerev: {
      options: {
        encoding: 'utf8',
        algorithm: 'md5',
        length: 6
      },
      common: {
        files: [{
          expand: true,
          cwd: '',
          src: '', // Dynamic config
          dest: ''
        }]
      }
    },
    usemin: {
      options: {
        assetsDirs: [], // Dynamic config
        patterns: {
          common: [
            [/([a-zA-Z\.\d]+\.js|[a-zA-Z\.\d]+\.css)/g]
          ]
        }
      },
      common: {
        files: [{
          expand: true,
          cwd: '',
          src: '', // Dynamic config
          dest: ''
        }]
      }
    }
  });


  // Load npm tasks
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-filerev');
  grunt.loadNpmTasks('grunt-usemin');


  // Internal tasks 内部任务
  // Internal setting task 内部配置任务
  grunt.task.registerTask('_set', function() {
    var dest = grunt.config.get('_config.dest', dest);

    grunt.config.set('copy.common.files.0.dest', dest);
    grunt.config.set('less.common.files.0.dest', dest);
    grunt.config.set('imagemin.common.files.0.cwd', dest);
    grunt.config.set('imagemin.common.files.0.dest', dest);
    grunt.config.set('requirejs.common.options.dir', dest + 'module/');
    // Widget content list
    var wgtContentList = (function() {
      var wgtContentList = {},
        wgtFileRegExp = new RegExp(/\.html$/);
      (function readDir(dir) {
        var items = fs.readdirSync(dir);
        for (var i in items) {
          var path = dir + '/' + items[i],
            stat = fs.lstatSync(path);
          if (stat.isDirectory()) {
            readDir(path);
          } else {
            if (wgtFileRegExp.test(items[i])) {
              var content = fs.readFileSync(path),
                $ = cheerio.load(content),
                $scriptList = $('script[type="text/javascript"]'),
                $cssList = $('link[rel="stylesheet"]');
              $cssList.remove();
              $scriptList.remove();
              var cssList = [],
                scriptList = [];
              $cssList.each(function() {
                cssList.push($(this).attr('href'));
              });
              $scriptList.each(function() {
                scriptList.push($(this).attr('src'));
              });
              wgtContentList[path.replace(/widget\//, '')] = {
                html: $.html(),
                cssList: cssList,
                scriptList: scriptList
              }
            }
          }
        }
      })('widget');
      return wgtContentList;
    })();
    // Template file list
    var tplFileList = (function getTplFileList() {
      var tplFileRegExp = new RegExp(/\.html$/),
        tplFileList = [];
      (function readDir(dir) {
        var items = fs.readdirSync(dir);
        for (var i in items) {
          var path = dir + '/' + items[i],
            stat = fs.lstatSync(path);
          if (stat.isDirectory()) {
            readDir(path);
          } else {
            if (tplFileRegExp.test(items[i])) {
              var content = fs.readFileSync(path, 'utf-8');
              var placeholderList = content.match(/\{\{widget\:\S+\}\}/g);
              $ = cheerio.load(content);
              for (var i in placeholderList) {
                var widgetName = placeholderList[i].match(/\{\{widget:(\S+)\}\}/)[1];
                content = $.html().replace('{{widget:' + widgetName + '}}', wgtContentList[widgetName].html);
                $ = cheerio.load(content);
                for (var j in wgtContentList[widgetName].cssList) {
                  var $css = $('<link>').attr({
                    'rel': 'stylesheet',
                    'type': 'text/css',
                    'href': wgtContentList[widgetName].cssList[j]
                  });
                  $('head').append($css);
                }
                console.log($.html());
                for (var j in wgtContentList[widgetName].scriptList) {
                  var $script = $('<script>').attr({
                    'type': 'text/javascript',
                    'src': wgtContentList[widgetName].scriptList[j]
                  });
                  $('body').append($css);
                }
              }
              mkdirsSync(dest + path.replace(/\/\w+.html$/, ''));
              fs.writeFileSync(dest + path, $.html());
              tplFileList.push(path);
            }
          }
        }
      })('page');
      return tplFileList;
    })();
    // Script list used in templates
    var scriptList = (function() {
      var scriptList = [];
      for (var i in tplFileList) {
        var content = fs.readFileSync(tplFileList[i], 'utf-8'),
          $ = cheerio.load(content),
          $script = $('body').find('script[type="text/javascript"]');
        $script.each(function() {
          scriptList.push($(this).attr('src'));
        });
      }
      return scriptList;
    })();
    var modules = [];
    for (var i in scriptList) {
      modules.push({
        name: scriptList[i].substr(3).replace(/\.js$/, '')
      });
    }
    grunt.config.set('requirejs.common.options.modules', modules);
    // Static file list
    var staticFileList = (function() {
      var staticFileList = glob.sync('static/**/**.{js,less,css,gif,png,jpg,jpeg,gif}');
      for (var i in staticFileList) {
        staticFileList[i] = dest + staticFileList[i].replace(/\.less/g, '.css');
      }
      return staticFileList;
    })();
    // Static directory list
    var staticDirList = (function() {
      var staticDirList = [];
      for (var i in staticFileList) {
        var tmpList = staticFileList[i].split('/');
        tmpList.splice(-1, 1);
        var staticDir = tmpList.join('/') + '/';
        if (staticDir != staticDirList[staticDirList.length - 1]) {
          staticDirList.push(staticDir);
        }
      }
      return staticDirList;
    })();

    grunt.config.set('filerev.common.files.0.src', staticFileList);
    grunt.config.set('usemin.options.assetsDirs', staticDirList);
    grunt.config.set('usemin.common.files.0.src', dest + 'page/**/*.html')
  });
  // Internal logic task 内部业务任务
  grunt.task.registerTask('_watch', function() {
    grunt.config.set('watch.common.tasks', ['_copy', '_less']);
    grunt.task.run('watch:common');
  });
  grunt.task.registerTask('_copy', function() {
    grunt.task.run('copy:common');
  });
  grunt.task.registerTask('_less', function() {
    grunt.task.run('less:common');
  });
  grunt.task.registerTask('_imagemin', function() {
    grunt.task.run('imagemin:common');
  });
  grunt.task.registerTask('_requirejs', function() {
    grunt.task.run('requirejs:common');
  });
  grunt.task.registerTask('_filerev', function() {
    grunt.task.run('filerev:common');
  });
  grunt.task.registerTask('_usemin', function() {
    grunt.task.run('usemin:common');
  });

  // Interface tasks 接口任务（通过 Command line 调用）
  // Release
  grunt.task.registerTask('release', function() {
    grunt.config.set('_config.dest', '../www/');

    grunt.task.run('_set');
    grunt.task.run('_copy');
    grunt.task.run('_less');
    grunt.task.run('_imagemin');
    // grunt.task.run('_requirejs');
    // grunt.task.run('_filerev');
    // grunt.task.run('_usemin');
  });

  // Dev
  grunt.task.registerTask('dev', function() {
    var dest = '_dev/',
      watch = grunt.option('watch');
    grunt.config.set('_config.dest', dest);

    grunt.task.run('_set');
    if (watch) {
      grunt.task.run('_watch');
    } else {
      grunt.task.run('_copy');
      grunt.task.run('_less');
      grunt.task.run('_imagemin');
      // grunt.task.run('_requirejs');
      // grunt.task.run('_filerev');
      // grunt.task.run('_usemin');
    }
  });
};