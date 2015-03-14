require(['lib-zepto', 'lib-mustache'], function($, Mustache) {


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
    }
  }


  $('#searchQuery').on('input', function() {
    $('.result-list dt').html('查找中...').addClass('expand');
    search(function(res) {
      $('.result-list dt').html('查找到以下歌曲').addClass('expand');
      $('.result-list dd dl').html(Mustache.render(tpl.resultList, res));
    });
  });
});