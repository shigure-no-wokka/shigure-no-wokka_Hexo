document.addEventListener('DOMContentLoaded', function() {
  // if (document.getElementById('main-page')) 
  if (window.location.pathname === '/' || window.location.pathname === '/index.html'){
    // 页面加载后自动回到顶部
    window.scrollTo(0, 0);
    
    // 禁用浏览器的滚动位置恢复功能
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  
    // 初始化音频文件
    var audioFiles = [
      "../assets/media/Memory_3.mp3",
      "../assets/media/Welcome_1.ogg",
      "../assets/media/Welcome_2.ogg",
    ];
    
    // 随机选择一个音频文件
    var randomIndex = Math.floor(Math.random() * audioFiles.length);
    var audio = new Audio(audioFiles[randomIndex]);
    audio.volume = 0.5;
  
    var isUnlocked = false; // 用于检查滚动是否已经解锁
  
    // 禁用页面滚动
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  
    // 添加点击事件监听器，检测整个页面的点击
    document.addEventListener('click', function() {
      // 如果页面尚未解锁
      if (!isUnlocked) {
        // 播放音频
        audio.play().catch(function(error) {
          console.error("音频播放失败：", error);
        });
  
        // 恢复页面滚动
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        
        // 标记页面已解锁，防止多次点击重复播放音频
        isUnlocked = true;
      }
    }, { once: true }); // `once: true` 确保事件处理器只运行一次
  }
});
