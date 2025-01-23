(function () {
    'use strict';

    // 定义插件数据（通过 JSON 动态加载）
    let pluginData = {
        update: '',   
        members: [],     
        rankings: [], 
        plugins: []    
    };

    // 从 JSON 文件加载数据
    fetch('https://your-github-repo-url/data.json') 
        .then(response => response.json())
        .then(data => {
            pluginData = data;
            initializePlugins(); 
        })
        .catch(error => console.error('加载数据失败:', error));

    // 创建集合插件主界面
    const mainMenu = document.createElement('div');
    mainMenu.style.position = 'fixed';
    mainMenu.style.top = '20px';
    mainMenu.style.right = '20px';
    mainMenu.style.backgroundColor = '#f0f0f0';
    mainMenu.style.padding = '20px';
    mainMenu.style.border = '1px solid #ccc';
    mainMenu.style.borderRadius = '10px';
    mainMenu.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    mainMenu.style.zIndex = '1000';
    mainMenu.style.display = 'none';
    mainMenu.style.fontFamily = 'Arial, sans-serif';
    document.body.appendChild(mainMenu);

    // 标题
    const title = document.createElement('h2');
    title.textContent = '集合插件';
    title.style.marginTop = '0';
    title.style.textAlign = 'center';
    mainMenu.appendChild(title);

    // 更新信息
    const updateInfo = document.createElement('p');
    updateInfo.style.textAlign = 'center';
    updateInfo.style.color = '#666';
    mainMenu.appendChild(updateInfo);

    // 创建按钮
    const createButton = (text, onClick) => {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.width = '100%';
        button.style.padding = '10px';
        button.style.marginBottom = '10px';
        button.style.backgroundColor = '#008CBA';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.addEventListener('click', onClick);
        return button;
    };

    // 初始化插件
    function initializePlugins() {
        // 清空主界面
        mainMenu.innerHTML = '';
        mainMenu.appendChild(title);

        // 显示更新信息
        updateInfo.textContent = pluginData.update || '暂无更新信息';
        mainMenu.appendChild(updateInfo);

        // 会员列表按钮
        if (pluginData.members && pluginData.members.length > 0) {
            mainMenu.appendChild(createButton('会员列表', () => {
                showMembers(pluginData.members);
            }));
        }

        // 排行榜按钮
        if (pluginData.rankings && pluginData.rankings.length > 0) {
            mainMenu.appendChild(createButton('排行榜', () => {
                showRankings(pluginData.rankings);
            }));
        }

        // 插件按钮
        if (pluginData.plugins && pluginData.plugins.length > 0) {
            mainMenu.appendChild(createButton('插件', () => {
                showPlugins(pluginData.plugins);
            }));
        }
    }

    // 按 K 键打开/关闭集合插件界面
    document.addEventListener('keydown', (event) => {
        if (event.key === 'k' || event.key === 'K') {
            mainMenu.style.display = mainMenu.style.display === 'none' ? 'block' : 'none';
        }
    });

    // 显示会员列表
    function showMembers(data) {
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        popup.style.padding = '20px';
        popup.style.borderRadius = '10px';
        popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        popup.style.width = '400px';
        popup.style.maxHeight = '80vh';
        popup.style.overflowY = 'auto';
        popup.style.zIndex = '1001';

        // 标题
        const title = document.createElement('h3');
        title.textContent = '会员列表';
        popup.appendChild(title);

        // 内容
        const content = document.createElement('div');
        content.innerHTML = data.map(item => `<p>${item.name}</p>`).join('');
        popup.appendChild(content);

        // 关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.style.width = '100%';
        closeButton.style.padding = '10px';
        closeButton.style.backgroundColor = '#f44336';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.addEventListener('click', () => {
            popup.remove();
        });
        popup.appendChild(closeButton);

        document.body.appendChild(popup);
    }

    // 显示排行榜
    function showRankings(data) {
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        popup.style.padding = '20px';
        popup.style.borderRadius = '10px';
        popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        popup.style.width = '400px';
        popup.style.maxHeight = '80vh';
        popup.style.overflowY = 'auto';
        popup.style.zIndex = '1001';

        // 标题
        const title = document.createElement('h3');
        title.textContent = '排行榜';
        popup.appendChild(title);

        // 内容
        const content = document.createElement('div');
        content.innerHTML = data.map(item => `<p>${item.name}: ${item.score}</p>`).join('');
        popup.appendChild(content);

        // 关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.style.width = '100%';
        closeButton.style.padding = '10px';
        closeButton.style.backgroundColor = '#f44336';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.addEventListener('click', () => {
            popup.remove();
        });
        popup.appendChild(closeButton);

        document.body.appendChild(popup);
    }

    // 显示插件列表
    function showPlugins(data) {
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        popup.style.padding = '20px';
        popup.style.borderRadius = '10px';
        popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        popup.style.width = '400px';
        popup.style.maxHeight = '80vh';
        popup.style.overflowY = 'auto';
        popup.style.zIndex = '1001';

        // 标题
        const title = document.createElement('h3');
        title.textContent = '插件列表';
        popup.appendChild(title);

        // 内容
        const content = document.createElement('div');
        content.innerHTML = data.map(item => `<p><a href="${item.url}" target="_blank">${item.name}</a></p>`).join('');
        popup.appendChild(content);

        // 关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.style.width = '100%';
        closeButton.style.padding = '10px';
        closeButton.style.backgroundColor = '#f44336';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.addEventListener('click', () => {
            popup.remove();
        });
        popup.appendChild(closeButton);

        document.body.appendChild(popup);
    }
})();
