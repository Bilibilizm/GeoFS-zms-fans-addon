(function () {
    'use strict';

    // 定义飞行状态标题
    const flightStates = [
        "待机",
        "登机",
        "滑行",
        "起飞",
        "爬升",
        "巡航",
        "下降",
        "着陆",
        "已接地",
        "停车下客",
    ];
    let currentStateIndex = 0; // 当前状态索引

    // 飞行时间计时器变量
    let isTimerRunning = false; // 计时器状态
    let timerInterval = null; // 计时器 interval
    let elapsedTime = 0; // 已计时间，单位秒

    // 创建菜单
    const createMenu = () => {
        const menu = document.createElement('div');
        menu.id = 'geofs-custom-menu';
        menu.style.position = 'absolute';
        menu.style.top = '10px';
        menu.style.left = '10px';
        menu.style.padding = '10px';
        menu.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        menu.style.color = 'white'; // 默认字体颜色为白色
        menu.style.fontSize = '14px';
        menu.style.borderRadius = '8px';
        menu.style.zIndex = '1000';
        menu.innerHTML = `
            <h2 style="margin: 0 0 10px 0; font-size: 18px; color: white;">【Q】GeoFS飞行辅助插件（by bilibili-蜂蜜水的冬日航线123）</h2>
            <h3 id="flight-state" style="margin: 0; font-size: 16px; color: yellow;">飞行状态: ${flightStates[currentStateIndex]}</h3>
            <p id="airspeed" style="color: white;">空速: 加载中...</p>
            <p id="altitude" style="color: white;">高度: 加载中...</p>
            <button id="reset-state" style="margin-top: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer; background-color: #333; color: yellow; border: none; border-radius: 5px;">重置状态</button>
            <hr style="border: none; border-top: 1px solid #555; margin: 10px 0;">
            <h3 style="margin: 0; font-size: 16px; color: white;">飞行时间</h3>
            <p>计时器: <span id="elapsedTime">00:00:00</span></p>
            <button id="start-timer" style="margin-top: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer; background-color: #4CAF50; color: white; border: none; border-radius: 5px;">开始</button>
            <button id="pause-timer" style="margin-top: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer; background-color: #f44336; color: white; border: none; border-radius: 5px;">暂停</button>
            <button id="reset-timer" style="margin-top: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer; background-color: #2196F3; color: white; border: none; border-radius: 5px;">重置</button>
            <hr style="border: none; border-top: 1px solid #555; margin: 10px 0;">
            <p style="color: red; font-size: 12px; margin: 0;">📌Alt+L 切换飞行状态，Q 键隐藏/显示菜单。</p>
        `;
        document.body.appendChild(menu);

        // 设置按钮功能
        document.getElementById('start-timer').addEventListener('click', startTimer);
        document.getElementById('pause-timer').addEventListener('click', pauseTimer);
        document.getElementById('reset-timer').addEventListener('click', resetTimer);
    };

    // 更新菜单信息
    const updateMenu = () => {
        try {
            const aircraft = geofs?.aircraft?.instance;
            if (!aircraft) return;

            // 获取数据
            const trueAirSpeed = aircraft?.trueAirSpeed || 0; // 空速（米/秒）
            const altitudeMeters = aircraft?.llaLocation?.[2] || 0; // 高度（米）
            const airspeedKts = (trueAirSpeed * 1.94384).toFixed(2); // 米/秒 转 海里/小时
            const altitudeFeet = (altitudeMeters * 3.28084).toFixed(2); // 米 转 英尺

            // 更新显示
            document.getElementById('airspeed').innerText = `空速: ${airspeedKts} kts`;
            document.getElementById('altitude').innerText = `高度: ${altitudeMeters.toFixed(2)} 米 / ${altitudeFeet} 英尺`;
        } catch (e) {
            console.error('GeoFS 飞行状态菜单插件错误:', e);
        }
    };

    // 检测键盘按键（切换菜单显示）
    const detectKeyPress = (event) => {
        if (event.key === 'q') {
            const menu = document.getElementById('geofs-custom-menu');
            if (menu.style.display === 'none') {
                menu.style.display = 'block';
            } else {
                menu.style.display = 'none';
            }
        }

        if (event.altKey && event.key === 'l') {
            currentStateIndex = (currentStateIndex + 1) % flightStates.length; // 切换到下一个状态
            const stateElement = document.getElementById('flight-state');
            stateElement.innerText = `飞行状态: ${flightStates[currentStateIndex]}`;
            stateElement.style.color = "yellow"; // 设置状态标题为黄色
        }
    };

    // 重置飞行状态为“待机”
    const resetState = () => {
        currentStateIndex = 0; // 重置为第一个状态
        const stateElement = document.getElementById('flight-state');
        stateElement.innerText = `飞行状态: ${flightStates[currentStateIndex]}`;
        stateElement.style.color = "yellow"; // 设置状态标题为黄色
    };

    // 开始计时器
    const startTimer = () => {
        if (!isTimerRunning) {
            isTimerRunning = true;
            timerInterval = setInterval(() => {
                elapsedTime++;
                updateElapsedTime();
            }, 1000);
        }
    };

    // 暂停计时器
    const pauseTimer = () => {
        if (isTimerRunning) {
            isTimerRunning = false;
            clearInterval(timerInterval);
        }
    };

    // 重置计时器
    const resetTimer = () => {
        isTimerRunning = false;
        clearInterval(timerInterval);
        elapsedTime = 0;
        updateElapsedTime();
    };

    // 更新计时器显示
    const updateElapsedTime = () => {
        const elapsedTimeElement = document.getElementById('elapsedTime');
        if (elapsedTimeElement) {
            const hours = Math.floor(elapsedTime / 3600);
            const minutes = Math.floor((elapsedTime % 3600) / 60);
            const seconds = elapsedTime % 60;
            elapsedTimeElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    };

    // 初始化菜单和功能
    const init = () => {
        createMenu();
        setInterval(updateMenu, 500); // 每0.5秒更新一次空速和高度数据
        document.addEventListener('keydown', detectKeyPress); // 检测按键事件
        document.getElementById('reset-state').addEventListener('click', resetState); // 绑定重置状态按钮
    };

    // 延迟加载，确保 GeoFS 环境加载完毕
    setTimeout(init, 5000);
})();
