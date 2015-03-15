document.addEventListener('deviceready', function() {
  require(['lib-zepto', 'lib-mustache'], function($, Mustache) {
    window.config = {
      dir: 'himalayan',
      Path: ''
    };

    var tpl = {
      resultList: (function() {
        var _tpl;
        $.ajax({
          type: 'GET',
          url: '../../static/page/search/resultList.mst',
          async: false,
          success: function(res) {
            _tpl = res;
          }
        });
        return _tpl;
      })()
    };

    function search(callback) {
      var query = $.trim($('#searchQuery').val());
      if (query) {
        $.ajax({
          type: 'GET',
          url: 'http://himalayan.duapp.com/api/songs/get',
          data: {
            song: query
          },
          success: function(res) {
            typeof callback == 'function' && callback(res);
          }
        });
      } else {
        $('.result-list dt').html('&nbsp;').removeClass('expand');
        $('.result-list dl').html('');
      }
    }


    // Init
    // 创建存储目录
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
      console.log(util);
      fileSystem.root.getDirectory(window.config.dir, {
        create: true,
        exclusive: false
      }, function(entry) {
        window.config.path = entry.toURL();
      }, function() {
        console.log('创建文件夹失败');
      });
    }, function() {
      console.log('创建文件夹失败');
    });

    // 
    $('.result-list dl').height($(window).height() - 60 - 59 - 24);


    // Bind events
    $('#searchQuery').on('input', function() {
      $('.result-list dt').html('查找中...').addClass('expand');
      search(function(res) {
        $('.result-list dt').html('查找到以下歌曲').addClass('expand');
        $('.result-list dl').html(Mustache.render(tpl.resultList, res));
      });
    });
  });
}, false);