require(['lib-zepto', 'lib-mustache'], function($, Mustache) {
  var tpl = {
    songInfo: $('#template-songInfo').html()
  };

  $.getJSON('/api/songs/play?id=15132', function(res) {
    $('#template-songInfo').parent().html(Mustache.render(tpl.songInfo, res));
  });
});