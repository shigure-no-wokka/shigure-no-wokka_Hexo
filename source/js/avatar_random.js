var avatarimg = [
    "https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/avatar.jpg",
    // "https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/avatar_00.jpg",
    // "https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/avatar_01.jpg",
    // "https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/avatar_03.jpg",
  ];
  
  var avatarindex = 0;
  var rotating = false;
  
  function changeAvatar() {
    if (!rotating) {
      rotating = true;
      var avatarImgs = document.querySelectorAll(".avatar-img img");
      avatarImgs.forEach(function(img) {
        // 添加旋转类
        img.classList.add("rotate");
      });
  
      // 在旋转到 180 度时切换图片
      setTimeout(function() {
        avatarImgs.forEach(function(img) {
          // 切换到下一个图片
          img.src = avatarimg[avatarindex];
        });
      }, 300); // 与旋转一半的时间保持一致

      avatarindex++;
      if (avatarindex >= avatarimg.length) {
        avatarindex = 0; // 防止下标越界
      }

      
      // 等待旋转动画结束后再移除旋转类
      setTimeout(function() {
        avatarImgs.forEach(function(img) {
          // 移除旋转类
          img.classList.remove("rotate");
        });
        rotating = false;
      }, 500); // 与动画时长保持一致
    }
  }
  
  // 初始化头像
  changeAvatar();
  
  // 每隔 5 秒钟调用一次 changeAvatar 函数
  // setInterval(changeAvatar, 5000);