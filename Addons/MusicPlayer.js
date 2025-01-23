(function () {
    'use strict';

    // 初始化变量
    let isDarkTheme = true;
    let volume = 0.5;
    let playlist = JSON.parse(localStorage.getItem('playlist')) || [];
    let currentSongIndex = 0;
    let playMode = 'Sequential';
    let currentPage = 1;
    const itemsPerPage = 8;

    // 创建播放器容器
    const playerContainer = document.createElement('div');
    playerContainer.style.position = 'fixed';
    playerContainer.style.bottom = '20px';
    playerContainer.style.right = '20px';
    playerContainer.style.backgroundColor = isDarkTheme ? '#181818' : '#fff';
    playerContainer.style.padding = '20px';
    playerContainer.style.borderRadius = '15px';
    playerContainer.style.color = isDarkTheme ? '#fff' : '#000';
    playerContainer.style.zIndex = '1000';
    playerContainer.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
    playerContainer.style.width = '400px';
    playerContainer.style.height = 'auto';
    playerContainer.style.display = 'none'; // 默认隐藏

    // 标题
    const title = document.createElement('div');
    title.innerText = 'GeoFS Music Player';
    title.style.fontSize = '20px';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '5px';
    playerContainer.appendChild(title);

    // 副标题
    const subtitle = document.createElement('div');
    subtitle.innerText = 'Made by 開飛機のzm';
    subtitle.style.fontSize = '12px';
    subtitle.style.color = isDarkTheme ? '#b3b3b3' : '#666';
    subtitle.style.marginBottom = '15px';
    playerContainer.appendChild(subtitle);

    // 音频播放器
    const audioPlayer = document.createElement('audio');
    audioPlayer.style.width = '100%';
    audioPlayer.volume = volume;
    playerContainer.appendChild(audioPlayer);

    // 控制按钮
    const controls = document.createElement('div');
    controls.style.marginTop = '15px';
    controls.style.display = 'flex';
    controls.style.justifyContent = 'space-between';
    controls.style.alignItems = 'center';

    const prevButton = document.createElement('button');
    prevButton.innerText = '⏮';
    prevButton.style.padding = '10px';
    prevButton.style.backgroundColor = '#1DB954';
    prevButton.style.color = '#fff';
    prevButton.style.border = 'none';
    prevButton.style.borderRadius = '5px';
    prevButton.style.cursor = 'pointer';
    prevButton.addEventListener('click', () => {
        if (playMode === 'Shuffle') {
            currentSongIndex = Math.floor(Math.random() * playlist.length);
        } else {
            currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
        }
        playSong(currentSongIndex);
    });
    controls.appendChild(prevButton);

    const playPauseButton = document.createElement('button');
    playPauseButton.innerText = '⏯';
    playPauseButton.style.padding = '10px';
    playPauseButton.style.backgroundColor = '#1DB954';
    playPauseButton.style.color = '#fff';
    playPauseButton.style.border = 'none';
    playPauseButton.style.borderRadius = '5px';
    playPauseButton.style.cursor = 'pointer';
    playPauseButton.addEventListener('click', () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseButton.innerText = '⏸';
        } else {
            audioPlayer.pause();
            playPauseButton.innerText = '⏯';
        }
    });
    controls.appendChild(playPauseButton);

    const nextButton = document.createElement('button');
    nextButton.innerText = '⏭';
    nextButton.style.padding = '10px';
    nextButton.style.backgroundColor = '#1DB954';
    nextButton.style.color = '#fff';
    nextButton.style.border = 'none';
    nextButton.style.borderRadius = '5px';
    nextButton.style.cursor = 'pointer';
    nextButton.addEventListener('click', () => {
        if (playMode === 'Shuffle') {
            currentSongIndex = Math.floor(Math.random() * playlist.length);
        } else {
            currentSongIndex = (currentSongIndex + 1) % playlist.length;
        }
        playSong(currentSongIndex);
    });
    controls.appendChild(nextButton);

    playerContainer.appendChild(controls);

    // 歌单容器
    const playlistContainer = document.createElement('div');
    playlistContainer.style.marginTop = '15px';
    playlistContainer.style.maxHeight = '200px';
    playlistContainer.style.overflowY = 'auto';
    playlistContainer.style.borderTop = `1px solid ${isDarkTheme ? '#333' : '#ddd'}`;
    playlistContainer.style.paddingTop = '10px';
    playerContainer.appendChild(playlistContainer);

    // 分页按钮
    const paginationContainer = document.createElement('div');
    paginationContainer.style.marginTop = '10px';
    paginationContainer.style.display = 'flex';
    paginationContainer.style.justifyContent = 'center';
    paginationContainer.style.alignItems = 'center';

    const prevPageButton = document.createElement('button');
    prevPageButton.innerText = '◀';
    prevPageButton.style.padding = '10px';
    prevPageButton.style.backgroundColor = '#1DB954';
    prevPageButton.style.color = '#fff';
    prevPageButton.style.border = 'none';
    prevPageButton.style.borderRadius = '5px';
    prevPageButton.style.cursor = 'pointer';
    prevPageButton.addEventListener('click', () => {
        currentPage = Math.max(1, currentPage - 1);
        updatePlaylist();
    });
    paginationContainer.appendChild(prevPageButton);

    const pageInfo = document.createElement('span');
    pageInfo.style.margin = '0 10px';
    pageInfo.style.color = isDarkTheme ? '#b3b3b3' : '#666';
    paginationContainer.appendChild(pageInfo);

    const nextPageButton = document.createElement('button');
    nextPageButton.innerText = '▶';
    nextPageButton.style.padding = '10px';
    nextPageButton.style.backgroundColor = '#1DB954';
    nextPageButton.style.color = '#fff';
    nextPageButton.style.border = 'none';
    nextPageButton.style.borderRadius = '5px';
    nextPageButton.style.cursor = 'pointer';
    nextPageButton.addEventListener('click', () => {
        currentPage += 1;
        updatePlaylist();
    });
    paginationContainer.appendChild(nextPageButton);

    playerContainer.appendChild(paginationContainer);

    // 导入文件按钮
    const importButton = document.createElement('button');
    importButton.innerText = 'Import Files';
    importButton.style.padding = '10px';
    importButton.style.backgroundColor = '#1DB954';
    importButton.style.color = '#fff';
    importButton.style.border = 'none';
    importButton.style.borderRadius = '5px';
    importButton.style.cursor = 'pointer';
    importButton.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.mp3,.mp4';
        input.multiple = true;
        input.onchange = (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                Array.from(files).forEach((file) => {
                    const url = URL.createObjectURL(file);
                    playlist.push({ name: file.name, file: url });
                });
                updatePlaylist();
                savePlaylistToLocal();
            }
        };
        input.click();
    });
    playerContainer.appendChild(importButton);

    // 设置按钮
    const settingsButton = document.createElement('button');
    settingsButton.innerText = 'Settings';
    settingsButton.style.padding = '10px';
    settingsButton.style.backgroundColor = '#1DB954';
    settingsButton.style.color = '#fff';
    settingsButton.style.border = 'none';
    settingsButton.style.borderRadius = '5px';
    settingsButton.style.cursor = 'pointer';
    settingsButton.addEventListener('click', () => {
        toggleSettings();
    });
    playerContainer.appendChild(settingsButton);

    // 更新歌单显示
    function updatePlaylist() {
        playlistContainer.innerHTML = '';
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        playlist.slice(startIndex, endIndex).forEach((song, index) => {
            const songItem = document.createElement('div');
            songItem.innerText = `${startIndex + index + 1}. ${song.name}`;
            songItem.style.cursor = 'pointer';
            songItem.style.padding = '8px';
            songItem.style.borderBottom = `1px solid ${isDarkTheme ? '#333' : '#ddd'}`;
            songItem.style.transition = 'background 0.2s ease';
            songItem.onclick = () => playSong(startIndex + index);
            songItem.oncontextmenu = (e) => {
                e.preventDefault();
                showSongContextMenu(e, songItem, startIndex + index);
            };
            songItem.draggable = true;
            songItem.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', startIndex + index);
            });
            songItem.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            songItem.addEventListener('drop', (e) => {
                e.preventDefault();
                const fromIndex = e.dataTransfer.getData('text/plain');
                const toIndex = startIndex + index;
                moveSong(fromIndex, toIndex);
            });
            playlistContainer.appendChild(songItem);
        });
        updatePagination();
    }

    // 更新分页显示
    function updatePagination() {
        const totalPages = Math.ceil(playlist.length / itemsPerPage);
        pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
    }

    // 播放歌曲
    function playSong(index) {
        currentSongIndex = index;
        const song = playlist[index];
        if (song.file) {
            audioPlayer.src = song.file;
            audioPlayer.play()
                .then(() => {
                    playPauseButton.innerText = '⏸';
                })
                .catch((error) => {
                    console.error('Playback error:', error);
                });
        }
    }

    // 保存歌单到本地存储
    function savePlaylistToLocal() {
        localStorage.setItem('playlist', JSON.stringify(playlist));
    }

    // 显示右键菜单
    function showSongContextMenu(e, songItem, index) {
        const contextMenu = document.createElement('div');
        contextMenu.style.position = 'absolute';
        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.top = `${e.clientY}px`;
        contextMenu.style.backgroundColor = isDarkTheme ? '#333' : '#f0f0f0';
        contextMenu.style.color = isDarkTheme ? '#fff' : '#333';
        contextMenu.style.borderRadius = '5px';
        contextMenu.style.padding = '8px';
        contextMenu.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.2)';
        contextMenu.style.zIndex = '1001';

        const renameOption = document.createElement('div');
        renameOption.innerText = 'Rename';
        renameOption.style.cursor = 'pointer';
        renameOption.style.padding = '4px';
        renameOption.onclick = () => {
            const newName = prompt('Enter new name:', playlist[index].name);
            if (newName) {
                playlist[index].name = newName;
                updatePlaylist();
                savePlaylistToLocal();
            }
            contextMenu.remove();
        };
        contextMenu.appendChild(renameOption);

        const deleteOption = document.createElement('div');
        deleteOption.innerText = 'Delete';
        deleteOption.style.cursor = 'pointer';
        deleteOption.style.padding = '4px';
        deleteOption.onclick = () => {
            playlist.splice(index, 1);
            updatePlaylist();
            savePlaylistToLocal();
            contextMenu.remove();
        };
        contextMenu.appendChild(deleteOption);

        document.body.appendChild(contextMenu);

        document.addEventListener('click', () => contextMenu.remove(), { once: true });
    }

    // 移动歌曲位置
    function moveSong(fromIndex, toIndex) {
        const song = playlist.splice(fromIndex, 1)[0];
        playlist.splice(toIndex, 0, song);
        updatePlaylist();
        savePlaylistToLocal();
    }

    // 切换设置界面
    function toggleSettings() {
        const settingsContainer = document.querySelector('.settings-container');
        if (settingsContainer) {
            settingsContainer.remove();
            playlistContainer.style.display = 'block';
        } else {
            openSettings();
        }
    }

    // 打开设置界面
    function openSettings() {
        playlistContainer.style.display = 'none';

        const settingsContainer = document.createElement('div');
        settingsContainer.className = 'settings-container';
        settingsContainer.style.marginTop = '15px';

        // 主题切换
        const themeButton = document.createElement('button');
        themeButton.innerText = `Toggle Theme (Current: ${isDarkTheme ? 'Dark' : 'Light'})`;
        themeButton.style.padding = '10px';
        themeButton.style.backgroundColor = '#1DB954';
        themeButton.style.color = '#fff';
        themeButton.style.border = 'none';
        themeButton.style.borderRadius = '5px';
        themeButton.style.cursor = 'pointer';
        themeButton.addEventListener('click', () => {
            isDarkTheme = !isDarkTheme;
            updateTheme();
            themeButton.innerText = `Toggle Theme (Current: ${isDarkTheme ? 'Dark' : 'Light'})`;
        });
        settingsContainer.appendChild(themeButton);

        // 更新主题
        function updateTheme() {
            playerContainer.style.backgroundColor = isDarkTheme ? '#181818' : '#fff';
            playerContainer.style.color = isDarkTheme ? '#fff' : '#000';
            bottomBar.style.backgroundColor = isDarkTheme ? '#181818' : '#fff';
            bottomBar.style.color = isDarkTheme ? '#fff' : '#000';
            playlistContainer.style.borderTop = `1px solid ${isDarkTheme ? '#333' : '#ddd'}`;
            timeDisplay.style.color = isDarkTheme ? '#b3b3b3' : '#666';
        }

        playerContainer.appendChild(settingsContainer);
    }

    // 添加到页面
    document.body.appendChild(playerContainer);
    document.body.appendChild(bottomBar);

    // 初始化
    updatePlaylist();
})();
