//随机背景图片数组，图片可以换成图床链接，注意最后一条后面不要有逗号
var backimg = [
  "url(https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/bg_00.jpg)"
];

var bgindex = 0;
function changeBackground() {
  var webBg = document.getElementById("web_bg");
  
  // 添加动画类
  webBg.classList.add("animate-bg");
  
  // 设置背景图片
  webBg.style.backgroundImage = backimg[bgindex];

  bgindex++;
  if(bgindex >= backimg.length)
  {
    bgindex = 0;
  }

  // 移除动画类
  setTimeout(function() {
    webBg.classList.remove("animate-bg");
  }, 1000); // 与动画时长保持一致
}

setInterval(changeBackground, 8000); // 切换图片的间隔时间为 5 秒

