(function () {
  'use strict';

  let pluginContainer = null;
  let isPluginOpen = false;

  // 动态加载 JSON 数据
  async function loadJSON() {
    try {
      const response = await fetch('https://raw.githubusercontent.com/Bilibilizm/GeoFS-zms-fans-addon/main/data.json');
      if (!response.ok) {
        throw new Error('Failed to load JSON');
      }
      const data = await response.json();
      console.log('JSON loaded successfully:', data);
      return data;
    } catch (error) {
      console.error('Error loading JSON:', error);
      return null;
    }
  }

  // 处理排行榜数据：排序并处理相同积分的名次
  function processLeaderboard(leaderboard) {
    leaderboard.sort((a, b) => b.points - a.points);
    let rank = 1;
    for (let i = 0; i < leaderboard.length; i++) {
      if (i > 0 && leaderboard[i].points < leaderboard[i - 1].points) {
        rank = i + 1;
      }
      leaderboard[i].rank = rank;
    }
    return leaderboard;
  }

  // 创建可拖动的现代化弹出界面
  function createModal(title, content) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = '#ffffff';
    modal.style.color = '#333333';
    modal.style.padding = '20px';
    modal.style.borderRadius = '15px';
    modal.style.zIndex = '10000';
    modal.style.fontFamily = 'Arial, sans-serif';
    modal.style.width = '400px';
    modal.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
    modal.style.display = 'none';
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.3s ease';

    // 标题
    const modalTitle = document.createElement('h2');
    modalTitle.innerText = title;
    modalTitle.style.marginTop = '0';
    modalTitle.style.color = '#00a1d6';
    modalTitle.style.fontSize = '20px';

    // 关闭按钮
    const closeButton = document.createElement('button');
    closeButton.innerText = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = '#333333';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '24px';
    closeButton.addEventListener('click', () => {
      modal.style.opacity = '0';
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    });

    // 内容
    const modalContent = document.createElement('div');
    modalContent.innerHTML = content;
    modalContent.style.maxHeight = '400px'; // 设置最大高度
    modalContent.style.overflowY = 'auto'; // 添加滚动条

    // 将标题、关闭按钮和内容添加到模态框
    modal.appendChild(modalTitle);
    modal.appendChild(closeButton);
    modal.appendChild(modalContent);

    // 实现模态框拖动
    let isDragging = false;
    let offsetX, offsetY;

    modalTitle.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - modal.getBoundingClientRect().left;
      offsetY = e.clientY - modal.getBoundingClientRect().top;
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        modal.style.left = `${e.clientX - offsetX}px`;
        modal.style.top = `${e.clientY - offsetY}px`;
        modal.style.transform = 'none';
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    document.body.appendChild(modal);
    return modal;
  }

  // 创建广告模态框
  function createAdModal(content) {
    const adModal = document.createElement('div');
    adModal.style.position = 'fixed';
    adModal.style.top = '50%';
    adModal.style.left = '50%';
    adModal.style.transform = 'translate(-50%, -50%)';
    adModal.style.backgroundColor = '#ffffff';
    adModal.style.color = '#333333';
    adModal.style.padding = '20px';
    adModal.style.borderRadius = '15px';
    adModal.style.zIndex = '10001'; // 确保广告在最上层
    adModal.style.fontFamily = 'Arial, sans-serif';
    adModal.style.width = '400px';
    adModal.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
    adModal.style.display = 'none';
    adModal.style.opacity = '0';
    adModal.style.transition = 'opacity 0.3s ease';

    // 广告内容
    const adContent = document.createElement('p');
    adContent.innerText = content;
    adContent.style.textAlign = 'center';
    adContent.style.fontSize = '16px';

    // 关闭按钮
    const closeButton = document.createElement('button');
    closeButton.innerText = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = '#333333';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '24px';
    closeButton.addEventListener('click', () => {
      adModal.style.opacity = '0';
      setTimeout(() => {
        adModal.style.display = 'none';
      }, 300);
    });

    adModal.appendChild(adContent);
    adModal.appendChild(closeButton);
    document.body.appendChild(adModal);

    return adModal;
  }

  // 创建主插件界面
  async function createPluginUI(data) {
    if (!data) {
      console.error('No data provided');
      return;
    }
    if (pluginContainer) {
      console.log('Plugin container already exists');
      pluginContainer.style.display = 'block';
      return;
    }
    console.log('Creating plugin container');

    pluginContainer = document.createElement('div');
    pluginContainer.style.position = 'fixed';
    pluginContainer.style.top = '20px';
    pluginContainer.style.right = '20px';
    pluginContainer.style.backgroundColor = '#ffffff';
    pluginContainer.style.color = '#333333';
    pluginContainer.style.padding = '20px';
    pluginContainer.style.borderRadius = '15px';
    pluginContainer.style.zIndex = '10000';
    pluginContainer.style.fontFamily = 'Arial, sans-serif';
    pluginContainer.style.width = '300px';
    pluginContainer.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
    pluginContainer.style.maxHeight = '80vh'; // 设置最大高度
    pluginContainer.style.overflowY = 'auto'; // 添加滚动条

    // 实现主界面拖动
    let isDragging = false;
    let offsetX, offsetY;

    pluginContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - pluginContainer.getBoundingClientRect().left;
      offsetY = e.clientY - pluginContainer.getBoundingClientRect().top;
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        pluginContainer.style.left = `${e.clientX - offsetX}px`;
        pluginContainer.style.top = `${e.clientY - offsetY}px`;
        pluginContainer.style.right = 'auto';
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // 关闭按钮
    const closeButton = document.createElement('button');
    closeButton.innerText = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = '#333333';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '24px';
    closeButton.addEventListener('click', () => {
      pluginContainer.style.display = 'none';
      isPluginOpen = false;
    });

    // 主界面标题
    const mainTitle = document.createElement('h2');
    mainTitle.innerText = 'zm 粉丝专属插件';
    mainTitle.style.marginTop = '0';
    mainTitle.style.color = '#00a1d6';
    mainTitle.style.fontSize = '20px';

    // 更新内容
    const updateContent = document.createElement('h3');
    updateContent.innerText = '更新内容';
    updateContent.style.marginTop = '0';
    updateContent.style.fontSize = '16px';

    const updateText = document.createElement('p');
    updateText.innerText = data.updateContent;

    // 插件留言
    const pluginMessageTitle = document.createElement('h3');
    pluginMessageTitle.innerText = '插件使用须知';
    pluginMessageTitle.style.marginTop = '20px';
    pluginMessageTitle.style.fontSize = '16px';

    const pluginMessageText = document.createElement('p');
    pluginMessageText.innerText = data.pluginMessage;

    // 互动部分
    const interaction = document.createElement('h3');
    interaction.innerText = '互动';
    interaction.style.fontSize = '16px';

    const memberButton = document.createElement('button');
    memberButton.innerText = '会员';
    memberButton.style.marginRight = '10px';
    memberButton.style.backgroundColor = '#00a1d6';
    memberButton.style.border = 'none';
    memberButton.style.color = '#ffffff';
    memberButton.style.padding = '10px 20px';
    memberButton.style.borderRadius = '5px';
    memberButton.style.cursor = 'pointer';
    memberButton.style.transition = 'background-color 0.3s ease';
    memberButton.addEventListener('mouseenter', () => {
      memberButton.style.backgroundColor = '#008cba';
    });
    memberButton.addEventListener('mouseleave', () => {
      memberButton.style.backgroundColor = '#00a1d6';
    });

    const leaderboardButton = document.createElement('button');
    leaderboardButton.innerText = '排行榜';
    leaderboardButton.style.marginRight = '10px';
    leaderboardButton.style.backgroundColor = '#00a1d6';
    leaderboardButton.style.border = 'none';
    leaderboardButton.style.color = '#ffffff';
    leaderboardButton.style.padding = '10px 20px';
    leaderboardButton.style.borderRadius = '5px';
    leaderboardButton.style.cursor = 'pointer';
    leaderboardButton.style.transition = 'background-color 0.3s ease';
    leaderboardButton.addEventListener('mouseenter', () => {
      leaderboardButton.style.backgroundColor = '#008cba';
    });
    leaderboardButton.addEventListener('mouseleave', () => {
      leaderboardButton.style.backgroundColor = '#00a1d6';
    });

    const eventButton = document.createElement('button');
    eventButton.innerText = '活动';
    eventButton.style.backgroundColor = '#00a1d6';
    eventButton.style.border = 'none';
    eventButton.style.color = '#ffffff';
    eventButton.style.padding = '10px 20px';
    eventButton.style.borderRadius = '5px';
    eventButton.style.cursor = 'pointer';
    eventButton.style.transition = 'background-color 0.3s ease';
    eventButton.addEventListener('mouseenter', () => {
      eventButton.style.backgroundColor = '#008cba';
    });
    eventButton.addEventListener('mouseleave', () => {
      eventButton.style.backgroundColor = '#00a1d6';
    });

    // 新视频
    const newVideo = document.createElement('h3');
    newVideo.innerText = '新视频';
    newVideo.style.fontSize = '16px';

    const videoLink = document.createElement('a');
    videoLink.href = data.newVideo;
    videoLink.innerText = data.newVideo;
    videoLink.style.color = '#00a1d6';
    videoLink.target = '_blank';

    // 处理排行榜数据
    const processedLeaderboard = processLeaderboard(data.leaderboard);

    // 创建会员、排行榜、活动模态框
    const memberModal = createModal(
      '会员',
      `
      <div style="margin-bottom: 20px;">
        ${data.members
          .map(
            (member) => `
          <div style="display: flex; align-items: center; margin-bottom: 10px; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
            <span style="font-weight: bold;">${member}</span>
          </div>
        `
          )
          .join('')}
      </div>
      <p style="text-align: center; color: #888; font-size: 14px;">想加入会员的私信 zm！</p>
    `
    );

    const leaderboardModal = createModal(
      '排行榜',
      processedLeaderboard
        .map(
          (user) => `
          <div style="display: flex; align-items: center; margin-bottom: 10px; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
            <span style="width: 30px; font-weight: bold;">${user.rank}</span>
            <img src="${user.avatar}" alt="${user.name}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;">
            <div>
              <p style="margin: 0;">${user.name}</p>
              <p style="margin: 0; color: #888;">积分：${user.points}</p>
            </div>
          </div>
        `
        )
        .join('')
    );

    const eventModal = createModal('活动', `<p>${data.event}</p>`);

    // 按钮点击事件
    memberButton.addEventListener('click', () => {
      memberModal.style.display = 'block';
      setTimeout(() => {
        memberModal.style.opacity = '1';
      }, 10);
    });

    leaderboardButton.addEventListener('click', () => {
      leaderboardModal.style.display = 'block';
      setTimeout(() => {
        leaderboardModal.style.opacity = '1';
      }, 10);
    });

    eventButton.addEventListener('click', () => {
      eventModal.style.display = 'block';
      setTimeout(() => {
        eventModal.style.opacity = '1';
      }, 10);
    });

    // 将内容添加到容器
    pluginContainer.appendChild(closeButton);
    pluginContainer.appendChild(mainTitle);
    pluginContainer.appendChild(updateContent);
    pluginContainer.appendChild(updateText);
    pluginContainer.appendChild(pluginMessageTitle);
    pluginContainer.appendChild(pluginMessageText);
    pluginContainer.appendChild(interaction);
    pluginContainer.appendChild(memberButton);
    pluginContainer.appendChild(leaderboardButton);
    pluginContainer.appendChild(eventButton);
    pluginContainer.appendChild(newVideo);
    pluginContainer.appendChild(videoLink);

    document.body.appendChild(pluginContainer);

    // 显示广告模态框
    const adModal = createAdModal(data.adContent);
    adModal.style.display = 'block';
    setTimeout(() => {
      adModal.style.opacity = '1';
    }, 10);
  }

  // 初始化插件
  async function initPlugin() {
    if (isPluginOpen) {
      console.log('Closing plugin');
      pluginContainer.style.display = 'none';
      isPluginOpen = false;
    } else {
      console.log('Opening plugin');
      const data = await loadJSON();
      if (data) {
        createPluginUI(data);
        isPluginOpen = true;
      }
    }
  }

  // 监听按键 K 打开插件
  document.addEventListener('keydown', (event) => {
    if (event.key === 'k' || event.key === 'K') {
      console.log('K key pressed');
      initPlugin();
    }
  });

  // 调试信息
  console.log('GeoFS 粉丝专属插件已加载！');
})();

    // Addons

(function() {
    'use strict';

    // 插件URL
    const cabinSoundsUrl = 'https://raw.githubusercontent.com/Bilibilizm/GeoFS-zms-fans-addon/main/Addons/CabinSounds.js';
    const checklistUrl = 'https://raw.githubusercontent.com/Bilibilizm/GeoFS-zms-fans-addon/main/Addons/Checklist.js';
    const FlightRcorderUrl = 'https://raw.githubusercontent.com/Bilibilizm/GeoFS-zms-fans-addon/refs/heads/main/Addons/FlightRcorder.js';
    const VideoUrl = 'https://raw.githubusercontent.com/Bilibilizm/GeoFS-zms-fans-addon/refs/heads/main/Addons/Video.js';
    const LiverySelectorUrl = 'https://raw.githubusercontent.com/Bilibilizm/GeoFS-zms-fans-addon/refs/heads/main/Addons/LiverySelector.js';

    // 动态加载并运行JS代码
    function loadAndRunScript(url) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`网络响应不正常: ${response.statusText}`);
                }
                return response.text();
            })
            .then(code => {
                const script = document.createElement('script');
                script.textContent = code;
                document.head.appendChild(script);
                console.log(`插件加载成功: ${url}`);
            })
            .catch(error => {
                console.error(`插件加载失败: ${url}`, error);
            });
    }


    loadAndRunScript(cabinSoundsUrl);
    loadAndRunScript(checklistUrl);
    loadAndRunScript(FlightRcorderUrl);
    loadAndRunScript(VideoUrl);
    loadAndRunScript(LiverySelectorUrl);
    console.log('GeoFS 插件加载器已启动');
})();
