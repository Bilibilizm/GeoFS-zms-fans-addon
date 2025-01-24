(function () {
  'use strict';

  // 动态加载 JSON 数据
  async function loadJSON() {
    const response = await fetch('https://raw.githubusercontent.com/Bilibilizm/GeoFS-zms-fans-addon/main/data.json');
    const data = await response.json();
    return data;
  }

  // 创建插件界面
  function createPluginUI(data) {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.backgroundColor = '#1e1e1e';
    container.style.color = '#ffffff';
    container.style.padding = '20px';
    container.style.borderRadius = '10px';
    container.style.zIndex = '10000';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.width = '300px';
    container.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

    // 关闭按钮
    const closeButton = document.createElement('button');
    closeButton.innerText = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = '#ffffff';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '20px';
    closeButton.addEventListener('click', () => {
      container.remove();
    });

    // 更新内容
    const updateContent = document.createElement('h2');
    updateContent.innerText = '更新内容';
    updateContent.style.marginTop = '0';

    const updateText = document.createElement('p');
    updateText.innerText = data.updateContent;

    // 互动部分
    const interaction = document.createElement('h2');
    interaction.innerText = '互动';

    const memberButton = document.createElement('button');
    memberButton.innerText = '会员';
    memberButton.style.marginRight = '10px';

    const leaderboardButton = document.createElement('button');
    leaderboardButton.innerText = '排行榜';

    const eventButton = document.createElement('button');
    eventButton.innerText = '活动';

    // 新视频
    const newVideo = document.createElement('h2');
    newVideo.innerText = '新视频';

    const videoLink = document.createElement('a');
    videoLink.href = data.newVideo;
    videoLink.innerText = data.newVideo;
    videoLink.style.color = '#00a1d6';

    // 将会员、排行榜、活动按钮添加到容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginBottom = '20px';
    buttonContainer.appendChild(memberButton);
    buttonContainer.appendChild(leaderboardButton);
    buttonContainer.appendChild(eventButton);

    // 将会员、排行榜、活动内容添加到容器
    const contentContainer = document.createElement('div');

    // 会员页面
    const memberContent = document.createElement('div');
    memberContent.style.display = 'none';
    memberContent.innerHTML = `<p>会员列表：${data.members.join(', ')}</p>`;

    // 排行榜页面
    const leaderboardContent = document.createElement('div');
    leaderboardContent.style.display = 'none';
    const sortedLeaderboard = data.leaderboard.sort((a, b) => b.points - a.points);
    leaderboardContent.innerHTML = sortedLeaderboard
      .map(
        (user) => `
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <img src="${user.avatar}" alt="${user.name}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;">
          <div>
            <p style="margin: 0;">${user.name}</p>
            <p style="margin: 0; color: #888;">积分：${user.points}</p>
          </div>
        </div>
      `
      )
      .join('');

    // 活动页面
    const eventContent = document.createElement('div');
    eventContent.style.display = 'none';
    eventContent.innerHTML = `<p>${data.event}</p>`;

    // 按钮点击事件
    memberButton.addEventListener('click', () => {
      memberContent.style.display = 'block';
      leaderboardContent.style.display = 'none';
      eventContent.style.display = 'none';
    });

    leaderboardButton.addEventListener('click', () => {
      memberContent.style.display = 'none';
      leaderboardContent.style.display = 'block';
      eventContent.style.display = 'none';
    });

    eventButton.addEventListener('click', () => {
      memberContent.style.display = 'none';
      leaderboardContent.style.display = 'none';
      eventContent.style.display = 'block';
    });

    // 将内容添加到容器
    container.appendChild(closeButton);
    container.appendChild(updateContent);
    container.appendChild(updateText);
    container.appendChild(interaction);
    container.appendChild(buttonContainer);
    container.appendChild(memberContent);
    container.appendChild(leaderboardContent);
    container.appendChild(eventContent);
    container.appendChild(newVideo);
    container.appendChild(videoLink);

    document.body.appendChild(container);
  }

  // 初始化插件
  async function initPlugin() {
    const data = await loadJSON();
    createPluginUI(data);
  }

  // 监听按键 K 打开插件
  document.addEventListener('keydown', (event) => {
    if (event.key === 'k' || event.key === 'K') {
      initPlugin();
    }
  });
})();
