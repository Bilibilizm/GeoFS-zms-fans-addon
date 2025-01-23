(function () {
    'use strict';

    // JSON 文件的 URL
    const jsonUrl = "https://raw.githubusercontent.com/Bilibilizm/GeoFS-zms-fans-addon/main/data.json";

    // 创建插件界面
    function createPluginUI(data) {
        const container = document.createElement('div');
        container.id = 'zm-plugin-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        container.style.color = 'white';
        container.style.padding = '10px';
        container.style.borderRadius = '10px';
        container.style.zIndex = '1000';
        container.style.width = '300px';
        container.style.display = 'none';

        // 更新内容
        const updateContent = document.createElement('div');
        updateContent.innerHTML = `<strong>更新内容：</strong><br>${data.updateContent}`;
        container.appendChild(updateContent);

        // 活动标题
        const activityTitle = document.createElement('div');
        activityTitle.innerHTML = `<strong>活动</strong>`;
        activityTitle.style.marginTop = '10px';
        container.appendChild(activityTitle);

        // 会员按钮
        const memberButton = document.createElement('button');
        memberButton.innerText = '会员';
        memberButton.style.marginRight = '10px';
        memberButton.style.marginTop = '5px';
        memberButton.style.padding = '5px 10px';
        memberButton.style.backgroundColor = '#4CAF50';
        memberButton.style.color = 'white';
        memberButton.style.border = 'none';
        memberButton.style.borderRadius = '5px';
        memberButton.style.cursor = 'pointer';
        memberButton.onclick = () => showMemberList(data.members);
        container.appendChild(memberButton);

        // 排行榜按钮
        const leaderboardButton = document.createElement('button');
        leaderboardButton.innerText = '排行榜';
        leaderboardButton.style.marginTop = '5px';
        leaderboardButton.style.padding = '5px 10px';
        leaderboardButton.style.backgroundColor = '#008CBA';
        leaderboardButton.style.color = 'white';
        leaderboardButton.style.border = 'none';
        leaderboardButton.style.borderRadius = '5px';
        leaderboardButton.style.cursor = 'pointer';
        leaderboardButton.onclick = () => showLeaderboard(data.leaderboard);
        container.appendChild(leaderboardButton);

        // 将容器添加到页面
        document.body.appendChild(container);

        // 监听按键 K 打开/关闭界面
        document.addEventListener('keydown', (e) => {
            if (e.key === 'k' || e.key === 'K') {
                container.style.display = container.style.display === 'none' ? 'block' : 'none';
            }
        });
    }

    // 显示会员列表
    function showMemberList(members) {
        const memberListContainer = document.createElement('div');
        memberListContainer.style.position = 'fixed';
        memberListContainer.style.top = '50%';
        memberListContainer.style.left = '50%';
        memberListContainer.style.transform = 'translate(-50%, -50%)';
        memberListContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        memberListContainer.style.color = 'white';
        memberListContainer.style.padding = '20px';
        memberListContainer.style.borderRadius = '10px';
        memberListContainer.style.zIndex = '1001';
        memberListContainer.style.width = '300px';

        // 关闭按钮
        const closeButton = document.createElement('button');
        closeButton.innerText = '×';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.backgroundColor = 'transparent';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = () => document.body.removeChild(memberListContainer);
        memberListContainer.appendChild(closeButton);

        // 会员列表
        const memberList = document.createElement('div');
        memberList.innerHTML = `<strong>会员列表：</strong><br>`;
        members.forEach(member => {
            memberList.innerHTML += `${member.name}<br>`;
        });
        memberList.innerHTML += `<small>如要加入会员请私信 zm 添加！</small>`;
        memberListContainer.appendChild(memberList);

        // 添加到页面
        document.body.appendChild(memberListContainer);
    }

    // 显示排行榜
    function showLeaderboard(leaderboard) {
        const leaderboardContainer = document.createElement('div');
        leaderboardContainer.style.position = 'fixed';
        leaderboardContainer.style.top = '50%';
        leaderboardContainer.style.left = '50%';
        leaderboardContainer.style.transform = 'translate(-50%, -50%)';
        leaderboardContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        leaderboardContainer.style.color = 'white';
        leaderboardContainer.style.padding = '20px';
        leaderboardContainer.style.borderRadius = '10px';
        leaderboardContainer.style.zIndex = '1001';
        leaderboardContainer.style.width = '300px';

        // 关闭按钮
        const closeButton = document.createElement('button');
        closeButton.innerText = '×';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.backgroundColor = 'transparent';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = () => document.body.removeChild(leaderboardContainer);
        leaderboardContainer.appendChild(closeButton);

        // 排行榜内容
        const leaderboardContent = document.createElement('div');
        leaderboardContent.innerHTML = `<strong>排行榜：</strong><br>`;
        leaderboard.sort((a, b) => b.score - a.score).forEach((member, index) => {
            leaderboardContent.innerHTML += `${index + 1}. ${member.name} - ${member.score} 分<br>`;
        });
        leaderboardContainer.appendChild(leaderboardContent);

        // 添加到页面
        document.body.appendChild(leaderboardContainer);
    }

    // 加载 JSON 数据
    GM_xmlhttpRequest({
        method: 'GET',
        url: jsonUrl,
        onload: function (response) {
            const data = JSON.parse(response.responseText);
            createPluginUI(data);
        },
        onerror: function (error) {
            console.error('加载 JSON 文件失败:', error);
        }
    });
})();
