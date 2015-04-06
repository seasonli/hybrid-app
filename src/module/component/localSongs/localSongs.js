/**
 * @Fileoverview localSongs
 * @Author SeasonLi | season.chopsticks@gmail.com
 * @Version 1.0 | 2015-04-06 | SeasonLi    // Initial version
 *
 * 该类汇集了所有关于本地歌曲 getter 和 setter 方法
 **/

window.himalayan = window.himalayan || {};
window.himalayan.rootDir = 'himalayan';
window.himalayan.songDir = 'songs';
window.himalayan.songList = [];


// 初始化应用目录
window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
  // 初始化应用根目录
  fileSystem.root.getDirectory(window.himalayan.rootDir, {
    create: true,
    exclusive: false
  }, function(entry) {
    console.log('Log: Success setting app root directory.');

    // 初始化歌曲存储目录
    entry.getDirectory(window.himalayan.songDir, {
      create: true,
      exclusive: false
    }, function(entry) {
      console.log('Log: Success setting app storage directory.');

      // 获取歌曲列表
      var directoryReader = entry.createReader();
      directoryReader.readEntries(function(entries) {
        window.himalayan.songList = entries;
        console.log('Log: Success getting song list.');

      }, function() {
        throw new Error('Error[directoryReader]: Fail getting app storage directory info.');
      });
    }, function() {
      throw new Error('Error[DirectoryEntry]: setting app storage directory.');
    });

  }, function() {
    throw new Error('Error[DirectoryEntry]: setting app root directory.');
  });

}, function() {
  throw new Error('Error[requestFileSystem]: Fail setting app directory.');
});