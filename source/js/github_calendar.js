
// 定义一个函数，用于插入 GitHub 贡献图到主页面的帖子列表的最上层
function insertGithubContributions() {
    // 创建一个新的 div 元素，包含 GitHub 贡献图
    var contributionsDiv = document.createElement('div');
    contributionsDiv.style.borderRadius = '15px';  // 设置圆角
    contributionsDiv.style.padding = '20px'; // 添加内边距

    // https://github.com/Bloggify/github-calendar?tab=readme-ov-file
    contributionsDiv.innerHTML = `
        <div class="calendar">
            <!-- Include the library. -->
            <script src="https://unpkg.com/github-calendar@latest/dist/github-calendar.min.js"></script>
            
            <!-- Prepare a container for your calendar. -->
            <div id="github-calendar-container" style="text-align: center; margin: 20px 0;">
                <div class="calendar">
                    <!-- Loading stuff -->
                    <img src="https://ghchart.rshah.org/82AAFF/shigure-no-wokka" alt="GitHub Contributions" style="width: 100%; max-width: 800px;" />
                </div>
            </div>

            <script>
                // Initialize the GitHub Calendar
                GitHubCalendar("#github-calendar-container .calendar", "shigure-no-wokka", { responsive: true });
            </script>
        </div>
    `;

    // Find the post list container
    var postListContainer = document.querySelector('.recent-posts');

    if (postListContainer) {
        // Insert the calendar container at the top of the post list
        postListContainer.insertBefore(contributionsDiv, postListContainer.firstChild);
    }
  }


// 等待 DOM 加载完成后执行插入函数
  document.addEventListener('DOMContentLoaded', insertGithubContributions);
