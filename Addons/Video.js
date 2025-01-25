(function () {
    'use strict';

    let videoList = [];
    const maxVideos = 15;
    const maxFileSize = 100 * 1024 * 1024; 

    // 语言文本（仅保留简体中文）
    const languageText = {
        'zh-CN': {
            title: 'GeoFS 安全须知演示',
            subtitle: '作者：開飛機のzm',
            upload: '上传视频',
            namePlaceholder: '输入视频名称',
            addButton: '添加到列表',
            play: '播放',
            pause: '暂停',
            close: '关闭',
            fileSizeError: '最大100MB！请降低清晰度到360P',
            delete: '删除'
        }
    };

    // 创建菜单
    const menu = document.createElement('div');
    menu.style.position = 'fixed';
    menu.style.top = '20px';
    menu.style.right = '20px';
    menu.style.backgroundColor = '#f0f0f0';
    menu.style.padding = '20px';
    menu.style.border = '1px solid #ccc';
    menu.style.borderRadius = '10px';
    menu.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    menu.style.zIndex = '1000';
    menu.style.display = 'none';
    menu.style.fontFamily = 'Arial, sans-serif';
    menu.style.cursor = 'move';
    document.body.appendChild(menu);

    // 添加标题
    const title = document.createElement('h2');
    title.textContent = languageText['zh-CN'].title;
    title.style.marginTop = '0';
    title.style.textAlign = 'center';
    menu.appendChild(title);

    // 添加副标题
    const subtitle = document.createElement('p');
    subtitle.textContent = languageText['zh-CN'].subtitle;
    subtitle.style.marginTop = '5px';
    subtitle.style.textAlign = 'center';
    subtitle.style.fontSize = '14px';
    subtitle.style.color = '#666';
    menu.appendChild(subtitle);

    // 创建关闭菜单按钮
    const closeMenuButton = document.createElement('button');
    closeMenuButton.textContent = '×';
    closeMenuButton.style.position = 'absolute';
    closeMenuButton.style.top = '5px';
    closeMenuButton.style.right = '5px';
    closeMenuButton.style.backgroundColor = 'transparent';
    closeMenuButton.style.color = '#333';
    closeMenuButton.style.border = 'none';
    closeMenuButton.style.fontSize = '20px';
    closeMenuButton.style.cursor = 'pointer';
    closeMenuButton.addEventListener('click', function () {
        menu.style.display = 'none';
    });
    menu.appendChild(closeMenuButton);

    // 创建上传文件输入框
    const uploadInput = document.createElement('input');
    uploadInput.type = 'file';
    uploadInput.accept = 'video/mp4';
    uploadInput.style.display = 'block';
    uploadInput.style.marginBottom = '10px';
    uploadInput.style.width = '100%';
    menu.appendChild(uploadInput);

    // 创建视频名称输入框
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = languageText['zh-CN'].namePlaceholder;
    nameInput.style.display = 'none';
    nameInput.style.marginBottom = '10px';
    nameInput.style.width = '100%';
    nameInput.style.padding = '5px';
    menu.appendChild(nameInput);

    // 创建添加到列表按钮
    const addButton = document.createElement('button');
    addButton.textContent = languageText['zh-CN'].addButton;
    addButton.style.display = 'none';
    addButton.style.width = '100%';
    addButton.style.padding = '10px';
    addButton.style.backgroundColor = '#008CBA';
    addButton.style.color = 'white';
    addButton.style.border = 'none';
    addButton.style.borderRadius = '5px';
    addButton.style.cursor = 'pointer';
    addButton.disabled = true;
    menu.appendChild(addButton);

    // 绑定点击事件
    addButton.addEventListener('click', function () {
        const file = uploadInput.files[0];
        if (file && file.size <= maxFileSize) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const videoData = e.target.result;
                const videoName = nameInput.value || file.name;
                addVideoToList(videoName, videoData);
                uploadInput.value = ''; // 清除文件输入框
                nameInput.style.display = 'none';
                addButton.style.display = 'none';
            };
            reader.readAsDataURL(file);
        } else {
            alert(languageText['zh-CN'].fileSizeError);
        }
    });

    // 创建视频列表容器
    const videoListContainer = document.createElement('div');
    videoListContainer.style.marginTop = '20px';
    menu.appendChild(videoListContainer);

    // 添加视频到列表
    function addVideoToList(name, data) {
        if (videoList.length >= maxVideos) {
            alert(languageText['zh-CN'].fileSizeError);
            return;
        }

        const videoItem = document.createElement('div');
        videoItem.textContent = name;

        const playButton = document.createElement('button');
        playButton.textContent = languageText['zh-CN'].play;
        playButton.style.marginLeft = '10px';
        playButton.style.padding = '5px 10px';
        playButton.style.backgroundColor = '#4CAF50';
        playButton.style.color = 'white';
        playButton.style.border = 'none';
        playButton.style.borderRadius = '5px';
        playButton.style.cursor = 'pointer';
        playButton.addEventListener('click', function () {
            videoElement.src = data;
            videoPlayer.style.display = 'block';
            videoElement.play();
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = languageText['zh-CN'].delete;
        deleteButton.style.marginLeft = '10px';
        deleteButton.style.padding = '5px 10px';
        deleteButton.style.backgroundColor = '#f44336';
        deleteButton.style.color = 'white';
        deleteButton.style.border = 'none';
        deleteButton.style.borderRadius = '5px';
        deleteButton.style.cursor = 'pointer';
        deleteButton.addEventListener('click', function () {
            videoListContainer.removeChild(videoItem);
            const index = videoList.findIndex(video => video.name === name);
            if (index !== -1) {
                videoList.splice(index, 1);
            }
        });

        videoItem.appendChild(playButton);
        videoItem.appendChild(deleteButton);
        videoListContainer.appendChild(videoItem);
        videoList.push({ name, data });
    }

    // 创建视频播放器
    const videoPlayer = document.createElement('div');
    videoPlayer.style.position = 'fixed';
    videoPlayer.style.top = '20px';
    videoPlayer.style.left = '20px';
    videoPlayer.style.backgroundColor = 'black';
    videoPlayer.style.zIndex = '1000';
    videoPlayer.style.display = 'none';
    videoPlayer.style.borderRadius = '10px';
    videoPlayer.style.overflow = 'hidden';
    document.body.appendChild(videoPlayer);

    const videoElement = document.createElement('video');
    videoElement.controls = true; // 启用控制条
    videoElement.style.width = '100%';
    videoElement.style.height = '100%';
    videoPlayer.appendChild(videoElement);

    // 创建关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '5px';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', function () {
        videoPlayer.style.display = 'none';
        videoElement.pause();
    });
    videoPlayer.appendChild(closeButton);

    // 创建控制菜单显示的按钮
    const controlButton = document.createElement('button');
    controlButton.textContent = '安全须知演示';
    controlButton.style.position = 'fixed';
    controlButton.style.bottom = '20px';
    controlButton.style.right = '20px';
    controlButton.style.backgroundColor = '#1DB954';
    controlButton.style.color = '#fff';
    controlButton.style.border = 'none';
    controlButton.style.borderRadius = '25px';
    controlButton.style.padding = '10px 20px';
    controlButton.style.cursor = 'pointer';
    controlButton.addEventListener('click', function () {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });
    document.body.appendChild(controlButton);

    // 处理文件上传
    uploadInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file && file.size <= maxFileSize) {
            nameInput.style.display = 'block';
            addButton.style.display = 'block';
            nameInput.value = ''; // 清除输入框内容
            addButton.disabled = false; // 启用添加按钮
        } else {
            alert(languageText['zh-CN'].fileSizeError);
        }
    });
})();
