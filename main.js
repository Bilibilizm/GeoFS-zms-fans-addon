(function () {
  'use strict';

  // 加载JSON配置文件
  const configUrl = 'https://github.com/Bilibilizm/GeoFS-zms-fans-addon/blob/main/data.json';

  // 创建插件UI
  const pluginUI = document.createElement('div');
  pluginUI.id = 'plugin-ui';
  pluginUI.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    background: rgba(255, 255, 255, 0.9);
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    font-family: Arial, sans-serif;
    width: 300px;
    z-index: 1000;
    display: none; /* 默认隐藏 */
    cursor: move; /* 拖动时显示移动光标 */
  `;

  // 标题
  const title = document.createElement('h1');
  title.innerText = 'GeoFS-zm粉丝专属插件';
  title.style.cssText = `
    font-size: 18px;
    margin: 0 0 15px 0;
    color: #333;
  `;
  pluginUI.appendChild(title);

  // 更新内容
  const updateContent = document.createElement('div');
  updateContent.id = 'update-content';
  updateContent.style.cssText = `
    font-size: 14px;
    margin-bottom: 20px;
    color: #666;
  `;
  pluginUI.appendChild(updateContent);

  // 活动标题
  const activityTitle = document.createElement('h2');
  activityTitle.innerText = '活动';
  activityTitle.style.cssText = `
    font-size: 16px;
    margin: 0 0 10px 0;
    color: #333;
  `;
  pluginUI.appendChild(activityTitle);

  // 会员按钮
  const membersButton = document.createElement('button');
  membersButton.id = 'open-members';
  membersButton.innerText = '会员';
  membersButton.style.cssText = `
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
    margin-right: 10px;
    font-size: 14px;
  `;
  pluginUI.appendChild(membersButton);

  // 排行榜按钮
  const leaderboardButton = document.createElement('button');
  leaderboardButton.id = 'open-leaderboard';
  leaderboardButton.innerText = '排行榜';
  leaderboardButton.style.cssText = `
    background: #28a745;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
  `;
  pluginUI.appendChild(leaderboardButton);

  // 活动内容
  const activityContent = document.createElement('div');
  activityContent.id = 'activity-content';
  activityContent.style.cssText = `
    font-size: 14px;
    margin: 15px 0;
    color: #666;
  `;
  pluginUI.appendChild(activityContent);

  // 新视频标题
  const newVideoTitle = document.createElement('h2');
  newVideoTitle.innerText = '新视频';
  newVideoTitle.style.cssText = `
    font-size: 16px;
    margin: 20px 0 10px 0;
    color: #333;
  `;
  pluginUI.appendChild(newVideoTitle);

  // 新视频内容
  const newVideoContent = document.createElement('div');
  newVideoContent.id = 'new-video-content';
  newVideoContent.style.cssText = `
    font-size: 14px;
    color: #666;
  `;
  pluginUI.appendChild(newVideoContent);

  // 将会员列表和排行榜模态框添加到页面
  const membersModal = createModal('members-modal', '会员列表');
  const leaderboardModal = createModal('leaderboard-modal', '排行榜');
  document.body.appendChild(membersModal);
  document.body.appendChild(leaderboardModal);

  // 将插件UI添加到页面
  document.body.appendChild(pluginUI);

  // 加载JSON数据并更新UI
  fetch(configUrl)
    .then((response) => response.json())
    .then((data) => {
      updateContent.innerText = data.updateContent;
      activityContent.innerText = data.activityContent;
      newVideoContent.innerText = data.newVideoContent;

      // 更新会员列表
      const membersList = document.getElementById('members-list');
      data.members.forEach((member) => {
        const memberItem = document.createElement('div');
        memberItem.innerText = member.name;
        membersList.appendChild(memberItem);
      });
      const joinMessage = document.createElement('div');
      joinMessage.innerText = '如要加入会员请私信zm添加！';
      joinMessage.style.cssText = 'font-size: 12px; color: #888; margin-top: 10px;';
      membersList.appendChild(joinMessage);

      // 更新排行榜
      const leaderboardList = document.getElementById('leaderboard-list');
      data.leaderboard
        .sort((a, b) => b.score - a.score)
        .forEach((member, index) => {
          const leaderboardItem = document.createElement('div');
          leaderboardItem.innerText = `${index + 1}. ${member.name} - 积分: ${member.score}`;
          leaderboardList.appendChild(leaderboardItem);
        });
    })
    .catch((error) => console.error('Error loading JSON:', error));

  // 打开和关闭模态框的逻辑
  document.getElementById('open-members').addEventListener('click', () => {
    document.getElementById('members-modal').style.display = 'block';
  });

  document.getElementById('open-leaderboard').addEventListener('click', () => {
    document.getElementById('leaderboard-modal').style.display = 'block';
  });

  document.querySelectorAll('.close').forEach((button) => {
    button.addEventListener('click', () => {
      button.parentElement.parentElement.style.display = 'none';
    });
  });

  // 创建模态框的函数
  function createModal(id, title) {
    const modal = document.createElement('div');
    modal.id = id;
    modal.style.cssText = `
      display: none;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      width: 300px;
      z-index: 1001;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = 'position: relative;';

    const closeButton = document.createElement('span');
    closeButton.className = 'close';
    closeButton.innerText = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: -10px;
      right: -10px;
      font-size: 24px;
      cursor: pointer;
      color: #888;
    `;

    const modalTitle = document.createElement('h2');
    modalTitle.innerText = title;
    modalTitle.style.cssText = `
      font-size: 18px;
      margin: 0 0 15px 0;
      color: #333;
    `;

    const content = document.createElement('div');
    content.id = `${id}-list`;
    content.style.cssText = 'font-size: 14px; color: #666;';

    modalContent.appendChild(closeButton);
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(content);
    modal.appendChild(modalContent);

    return modal;
  }

  // 实现界面拖动功能
  let isDragging = false;
  let offsetX, offsetY;

  pluginUI.addEventListener('mousedown', (e) => {
    if (e.target === pluginUI || e.target === title) {
      isDragging = true;
      offsetX = e.clientX - pluginUI.offsetLeft;
      offsetY = e.clientY - pluginUI.offsetTop;
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      pluginUI.style.left = `${e.clientX - offsetX}px`;
      pluginUI.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // 实现K键打开/关闭界面
  document.addEventListener('keydown', (e) => {
    if (e.key === 'k' || e.key === 'K') {
      pluginUI.style.display = pluginUI.style.display === 'none' ? 'block' : 'none';
    }
  });
})();
