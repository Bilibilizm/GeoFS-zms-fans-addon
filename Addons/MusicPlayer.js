(function () {
    'use strict';

    // 创建音乐播放器容器
    const playerContainer = document.createElement('div');
    playerContainer.style.position = 'fixed';
    playerContainer.style.bottom = '20px';
    playerContainer.style.right = '20px';
    playerContainer.style.backgroundColor = '#181818';
    playerContainer.style.padding = '20px';
    playerContainer.style.borderRadius = '15px';
    playerContainer.style.color = '#fff';
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
    subtitle.style.color = '#b3b3b3';
    subtitle.style.marginBottom = '15px';
    playerContainer.appendChild(subtitle);

    // 音频播放器
    const audioPlayer = document.createElement('audio');
    audioPlayer.style.width = '100%';
    audioPlayer.volume = 0.5;
    playerContainer.appendChild(audioPlayer);

    // 控制按钮
    const controls = document.createElement('div');
    controls.style.marginTop = '15px';
    controls.style.display = 'flex';
    controls.style.justifyContent = 'space-between';
    controls.style.alignItems = 'center';

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

    playerContainer.appendChild(controls);

    // 添加到页面
    document.body.appendChild(playerContainer);

    // 创建控制按钮
    const playerButton = document.createElement('button');
    playerButton.innerText = '音乐播放器';
    playerButton.style.position = 'fixed';
    playerButton.style.bottom = '20px';
    playerButton.style.right = '20px';
    playerButton.style.backgroundColor = '#1DB954';
    playerButton.style.color = '#fff';
    playerButton.style.border = 'none';
    playerButton.style.borderRadius = '25px';
    playerButton.style.padding = '10px 20px';
    playerButton.style.cursor = 'pointer';
    playerButton.addEventListener('click', () => {
        playerContainer.style.display = playerContainer.style.display === 'none' ? 'block' : 'none';
    });

    document.body.appendChild(playerButton);
})();
