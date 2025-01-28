(function () {
    'use strict';

    let videoList = [];
    const maxVideos = 15;
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    let currentLanguage = 'en'; // 默认语言为英语

    // 语言文本
    const languageText = {
        'zh-CN': {
            title: '【J】GeoFS视频播放器',
            subtitle: '作者：開飛機のzm',
            upload: '上传视频',
            namePlaceholder: '输入视频名称',
            addButton: '添加到列表',
            play: '播放',
            pause: '暂停',
            close: '关闭',
            fileSizeError: '最大50MB！请降低清晰度到360P',
            delete: '删除',
            language: '语言',
            zhCN: '简体中文',
            zhTW: '繁體中文',
            en: 'English'
        },
        'zh-TW': {
            title: 'GeoFS視頻播放器',
            subtitle: '作者：開飛機のzm',
            upload: '上傳視頻',
            namePlaceholder: '輸入視頻名稱',
            addButton: '添加到列表',
            play: '播放',
            pause: '暫停',
            close: '關閉',
            fileSizeError: '最大50MB！請降低清晰度到360P',
            delete: '刪除',
            language: '語言',
            zhCN: '简体中文',
            zhTW: '繁體中文',
            en: 'English'
        },
        'en': {
            title: 'GeoFS Video Player',
            subtitle: 'Author: 開飛機のzm',
            upload: 'Upload Video',
            namePlaceholder: 'Enter video name',
            addButton: 'Add to List',
            play: 'Play',
            pause: 'Pause',
            close: 'Close',
            fileSizeError: 'Maximum 50MB! Please reduce quality to 360P',
            delete: 'Delete',
            language: 'Language',
            zhCN: '简体中文',
            zhTW: '繁體中文',
            en: 'English'
        }
    };

    // 更新界面语言
    function updateLanguage(lang) {
        currentLanguage = lang;
        title.textContent = languageText[lang].title;
        subtitle.textContent = languageText[lang].subtitle;
        uploadInput.setAttribute('title', languageText[lang].upload);
        nameInput.placeholder = languageText[lang].namePlaceholder;
        addButton.textContent = languageText[lang].addButton;
        languageLabel.textContent = languageText[lang].language;
    }

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
    title.textContent = languageText[currentLanguage].title;
    title.style.marginTop = '0';
    title.style.textAlign = 'center';
    menu.appendChild(title);

    // 添加副标题
    const subtitle = document.createElement('p');
    subtitle.textContent = languageText[currentLanguage].subtitle;
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

    // 创建语言设置
    const languageLabel = document.createElement('p');
    languageLabel.textContent = languageText[currentLanguage].language;
    languageLabel.style.marginTop = '10px';
    menu.appendChild(languageLabel);

    const languageSelect = document.createElement('select');
    languageSelect.style.width = '100%';
    languageSelect.style.padding = '5px';
    languageSelect.style.marginBottom = '10px';
    languageSelect.innerHTML = `
        <option value="en">English</option>
        <option value="zh-CN">简体中文</option>
        <option value="zh-TW">繁體中文</option>
    `;
    languageSelect.addEventListener('change', function () {
        updateLanguage(this.value);
    });
    menu.appendChild(languageSelect);

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
    nameInput.placeholder = languageText[currentLanguage].namePlaceholder;
    nameInput.style.display = 'none';
    nameInput.style.marginBottom = '10px';
    nameInput.style.width = '100%';
    nameInput.style.padding = '5px';
    menu.appendChild(nameInput);

    // 创建添加到列表按钮
    const addButton = document.createElement('button');
    addButton.textContent = languageText[currentLanguage].addButton;
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
            alert(languageText[currentLanguage].fileSizeError);
        }
    });

    // 创建视频列表容器
    const videoListContainer = document.createElement('div');
    videoListContainer.style.marginTop = '20px';
    menu.appendChild(videoListContainer);

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

    // 创建进度条
    const progressBar = document.createElement('input');
    progressBar.type = 'range';
    progressBar.min = '0';
    progressBar.max = '100';
    progressBar.value = '0';
    progressBar.style.width = '100%';
    progressBar.style.marginTop = '10px';
    progressBar.style.cursor = 'pointer';
    progressBar.style.display = 'block';
    videoPlayer.appendChild(progressBar);

    // 处理进度条点击事件
    progressBar.addEventListener('input', function () {
        const time = (progressBar.value / 100) * videoElement.duration;
        videoElement.currentTime = time;
    });

    // 处理进度条拖动事件
    progressBar.addEventListener('change', function () {
        const time = (progressBar.value / 100) * videoElement.duration;
        videoElement.currentTime = time;
    });

    // 更新进度条
    videoElement.addEventListener('timeupdate', function () {
        const value = (videoElement.currentTime / videoElement.duration) * 100;
        progressBar.value = value;
    });

    // 处理文件上传
    uploadInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file && file.size <= maxFileSize) {
            nameInput.style.display = 'block';
            addButton.style.display = 'block';
            nameInput.value = ''; // 清除输入框内容
            addButton.disabled = false; // 启用添加按钮
        } else {
            alert(languageText[currentLanguage].fileSizeError);
        }
    });

    // 添加视频到列表
    function addVideoToList(name, data) {
        if (videoList.length >= maxVideos) {
            alert(languageText[currentLanguage].fileSizeError);
            return;
        }

        const videoItem = document.createElement('div');
        videoItem.textContent = name;

        const playButton = document.createElement('button');
        playButton.textContent = languageText[currentLanguage].play;
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
        deleteButton.textContent = languageText[currentLanguage].delete;
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
                localStorage.removeItem(name); // 从 localStorage 中移除
            }
        });

        videoItem.appendChild(playButton);
        videoItem.appendChild(deleteButton);
        videoListContainer.appendChild(videoItem);
        videoList.push({ name, data });
    }

    // 处理按键事件
    document.addEventListener('keydown', function (event) {
        if (event.key === 'j' || event.key === 'J') {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        }
        if (event.key === 'p' || event.key === 'P') {
            if (videoElement.paused) {
                videoElement.play();
            } else {
                videoElement.pause();
            }
        }
    });

    // 拖动菜单
    let isDraggingMenu = false;
    let offsetX, offsetY;

    menu.addEventListener('mousedown', function (event) {
        isDraggingMenu = true;
        offsetX = event.clientX - menu.offsetLeft;
        offsetY = event.clientY - menu.offsetTop;
    });

    document.addEventListener('mousemove', function (event) {
        if (isDraggingMenu) {
            menu.style.left = (event.clientX - offsetX) + 'px';
            menu.style.top = (event.clientY - offsetY) + 'px';
        }
    });

    document.addEventListener('mouseup', function () {
        isDraggingMenu = false;
    });

    // 拖动视频播放器
    let isDraggingVideo = false;
    let videoOffsetX, videoOffsetY;

    videoPlayer.addEventListener('mousedown', function (event) {
        if (event.target === progressBar) return;
        isDraggingVideo = true;
        videoOffsetX = event.clientX - videoPlayer.offsetLeft;
        videoOffsetY = event.clientY - videoPlayer.offsetTop;
    });

    document.addEventListener('mousemove', function (event) {
        if (isDraggingVideo) {
            videoPlayer.style.left = (event.clientX - videoOffsetX) + 'px';
            videoPlayer.style.top = (event.clientY - videoOffsetY) + 'px';
        }
    });

    document.addEventListener('mouseup', function () {
        isDraggingVideo = false;
    });

    // 调整视频播放器大小
    const resizeHandle = document.createElement('div');
    resizeHandle.style.width = '10px';
    resizeHandle.style.height = '10px';
    resizeHandle.style.backgroundColor = 'red';
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.right = '0';
    resizeHandle.style.cursor = 'se-resize';
    videoPlayer.appendChild(resizeHandle);

    let isResizing = false;

    resizeHandle.addEventListener('mousedown', function (event) {
        isResizing = true;
        event.stopPropagation(); // 阻止事件冒泡
    });

    document.addEventListener('mousemove', function (event) {
        if (isResizing) {
            const width = event.clientX - videoPlayer.offsetLeft;
            const height = event.clientY - videoPlayer.offsetTop;
            videoPlayer.style.width = width + 'px';
            videoPlayer.style.height = height + 'px';
        }
    });

    document.addEventListener('mouseup', function () {
        isResizing = false;
    });

    // 输入框优化：点击输入框时自动暂停游戏，点击输入框外时自动取消暂停
    nameInput.addEventListener('focus', function () {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
    });

    nameInput.addEventListener('blur', function () {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
    });

    // 初始化界面语言
    updateLanguage(currentLanguage);
})();






     //Airmap

(function () {
    'use strict';

    // 创建主界面容器
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.right = '0';
    overlay.style.width = '300px'; // 缩小界面宽度
    overlay.style.height = '100%';
    overlay.style.backgroundColor = '#f5f5f5';
    overlay.style.zIndex = '1001';
    overlay.style.boxShadow = '-2px 0 10px rgba(0, 0, 0, 0.1)';
    overlay.style.display = 'none';
    overlay.style.flexDirection = 'column';
    overlay.style.fontFamily = 'Arial, sans-serif';
    overlay.style.overflow = 'hidden';
    document.body.appendChild(overlay);

    // 创建标题和副标题
    const title = document.createElement('div');
    title.style.padding = '15px';
    title.style.textAlign = 'center';
    title.style.backgroundColor = '#007BFF';
    title.style.color = '#FFF';
    title.style.fontSize = '18px';
    title.style.fontWeight = 'bold';
    title.textContent = 'GeoFS航图查看器';
    overlay.appendChild(title);

    const subtitle = document.createElement('div');
    subtitle.style.textAlign = 'center';
    subtitle.style.color = '#666';
    subtitle.style.fontSize = '12px';
    subtitle.style.marginBottom = '10px';
    subtitle.textContent = '作者：開飛機のzm';
    overlay.appendChild(subtitle);

    // 创建关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '15px';
    closeButton.style.right = '15px';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.color = '#666';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
        overlay.style.display = 'none';
    });
    overlay.appendChild(closeButton);

    // 创建文件夹列表容器
    const folderList = document.createElement('div');
    folderList.style.padding = '0 20px';
    folderList.style.overflowY = 'auto';
    folderList.style.flex = '1';
    overlay.appendChild(folderList);

    // 创建“新建文件夹”按钮
    const createFolderButton = document.createElement('button');
    createFolderButton.textContent = '新建文件夹';
    createFolderButton.style.padding = '10px';
    createFolderButton.style.backgroundColor = '#007BFF';
    createFolderButton.style.color = '#FFF';
    createFolderButton.style.border = 'none';
    createFolderButton.style.borderRadius = '5px';
    createFolderButton.style.cursor = 'pointer';
    createFolderButton.style.width = '100%';
    createFolderButton.style.marginBottom = '20px';
    createFolderButton.style.fontSize = '14px';
    createFolderButton.style.transition = 'background-color 0.3s';
    createFolderButton.addEventListener('mouseenter', () => {
        createFolderButton.style.backgroundColor = '#0056b3';
    });
    createFolderButton.addEventListener('mouseleave', () => {
        createFolderButton.style.backgroundColor = '#007BFF';
    });
    createFolderButton.addEventListener('click', () => {
        const folderName = prompt('请输入文件夹名称：');
        if (folderName) {
            addFolder(folderName);
        }
    });
    folderList.appendChild(createFolderButton);

    // 添加文件夹
    function addFolder(name) {
        const folder = document.createElement('div');
        folder.style.marginBottom = '15px';
        folder.style.backgroundColor = '#FFF';
        folder.style.borderRadius = '8px';
        folder.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
        folder.style.overflow = 'hidden';

        const folderHeader = document.createElement('div');
        folderHeader.style.display = 'flex';
        folderHeader.style.justifyContent = 'space-between';
        folderHeader.style.alignItems = 'center';
        folderHeader.style.padding = '10px';
        folderHeader.style.cursor = 'pointer';
        folderHeader.style.backgroundColor = '#f8f9fa';
        folderHeader.style.borderBottom = '1px solid #ddd';

        const folderNameDisplay = document.createElement('span');
        folderNameDisplay.textContent = name;
        folderNameDisplay.style.fontWeight = 'bold';
        folderNameDisplay.style.fontSize = '14px';

        const folderActions = document.createElement('div');
        folderActions.style.display = 'flex';
        folderActions.style.gap = '5px';

        const uploadButton = document.createElement('button');
        uploadButton.textContent = '上传';
        uploadButton.style.padding = '5px 10px';
        uploadButton.style.backgroundColor = '#28a745';
        uploadButton.style.color = '#FFF';
        uploadButton.style.border = 'none';
        uploadButton.style.borderRadius = '4px';
        uploadButton.style.cursor = 'pointer';
        uploadButton.style.fontSize = '12px';
        uploadButton.style.transition = 'background-color 0.3s';
        uploadButton.addEventListener('mouseenter', () => {
            uploadButton.style.backgroundColor = '#218838';
        });
        uploadButton.addEventListener('mouseleave', () => {
            uploadButton.style.backgroundColor = '#28a745';
        });
        uploadButton.addEventListener('click', (e) => {
            e.stopPropagation();
            uploadChart(folder);
        });

        const renameButton = document.createElement('button');
        renameButton.textContent = '重命名';
        renameButton.style.padding = '5px 10px';
        renameButton.style.backgroundColor = '#ffc107';
        renameButton.style.color = '#000';
        renameButton.style.border = 'none';
        renameButton.style.borderRadius = '4px';
        renameButton.style.cursor = 'pointer';
        renameButton.style.fontSize = '12px';
        renameButton.style.transition = 'background-color 0.3s';
        renameButton.addEventListener('mouseenter', () => {
            renameButton.style.backgroundColor = '#e0a800';
        });
        renameButton.addEventListener('mouseleave', () => {
            renameButton.style.backgroundColor = '#ffc107';
        });
        renameButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const newName = prompt('请输入新的文件夹名称：', folderNameDisplay.textContent);
            if (newName) {
                folderNameDisplay.textContent = newName;
            }
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '删除';
        deleteButton.style.padding = '5px 10px';
        deleteButton.style.backgroundColor = '#dc3545';
        deleteButton.style.color = '#FFF';
        deleteButton.style.border = 'none';
        deleteButton.style.borderRadius = '4px';
        deleteButton.style.cursor = 'pointer';
        deleteButton.style.fontSize = '12px';
        deleteButton.style.transition = 'background-color 0.3s';
        deleteButton.addEventListener('mouseenter', () => {
            deleteButton.style.backgroundColor = '#c82333';
        });
        deleteButton.addEventListener('mouseleave', () => {
            deleteButton.style.backgroundColor = '#dc3545';
        });
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('确定删除此文件夹吗？')) {
                folder.remove();
            }
        });

        folderActions.appendChild(uploadButton);
        folderActions.appendChild(renameButton);
        folderActions.appendChild(deleteButton);
        folderHeader.appendChild(folderNameDisplay);
        folderHeader.appendChild(folderActions);
        folder.appendChild(folderHeader);

        const folderContent = document.createElement('div');
        folderContent.style.display = 'none';
        folderContent.style.padding = '10px';
        folderContent.className = 'folder-content';
        folder.appendChild(folderContent);

        folderHeader.addEventListener('click', () => {
            folderContent.style.display = folderContent.style.display === 'none' ? 'block' : 'none';
        });

        folderList.appendChild(folder);
    }

    // 上传航图
    function uploadChart(folder) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'application/pdf';
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', () => {
            const file = fileInput.files[0];
            const name = prompt('请输入航图名称：');
            if (file && name) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const chartItem = document.createElement('div');
                    chartItem.style.marginBottom = '10px';
                    chartItem.style.padding = '10px';
                    chartItem.style.backgroundColor = '#f8f9fa';
                    chartItem.style.borderRadius = '5px';
                    chartItem.style.border = '1px solid #ddd';
                    chartItem.style.cursor = 'pointer';
                    chartItem.style.transition = 'background-color 0.3s';
                    chartItem.addEventListener('mouseenter', () => {
                        chartItem.style.backgroundColor = '#e9ecef';
                    });
                    chartItem.addEventListener('mouseleave', () => {
                        chartItem.style.backgroundColor = '#f8f9fa';
                    });

                    const chartName = document.createElement('div');
                    chartName.textContent = name;
                    chartName.style.fontWeight = 'bold';
                    chartName.style.fontSize = '14px';
                    chartItem.appendChild(chartName);

                    chartItem.addEventListener('click', () => {
                        showPdfViewer(e.target.result);
                    });

                    folder.querySelector('.folder-content').appendChild(chartItem);
                };
                reader.readAsDataURL(file);
            }
        });
        fileInput.click();
    }

    // 显示PDF大图查看器
    function showPdfViewer(pdfUrl) {
        const pdfViewer = document.createElement('div');
        pdfViewer.style.position = 'fixed';
        pdfViewer.style.top = '0';
        pdfViewer.style.left = '0';
        pdfViewer.style.width = '100%';
        pdfViewer.style.height = '100%';
        pdfViewer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        pdfViewer.style.zIndex = '1002';
        pdfViewer.style.display = 'flex';
        pdfViewer.style.justifyContent = 'center';
        pdfViewer.style.alignItems = 'center';

        const iframe = document.createElement('iframe');
        iframe.src = pdfUrl;
        iframe.style.width = '90%';
        iframe.style.height = '90%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '10px';
        pdfViewer.appendChild(iframe);

        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '20px';
        closeButton.style.right = '20px';
        closeButton.style.backgroundColor = 'transparent';
        closeButton.style.border = 'none';
        closeButton.style.fontSize = '30px';
        closeButton.style.color = '#FFF';
        closeButton.style.cursor = 'pointer';
        closeButton.addEventListener('click', () => {
            pdfViewer.remove();
        });
        pdfViewer.appendChild(closeButton);

        document.body.appendChild(pdfViewer);
    }

    // 添加快捷键功能
    document.addEventListener('keydown', (e) => {
        if (e.key === '/') {
            if (overlay.style.display === 'none') {
                overlay.style.display = 'flex';
            } else {
                overlay.style.display = 'none';
            }
        }
    });
})();
