(function () {
    'use strict';

    let isTimerRunning = false; // 计时器状态
    let timerInterval = null; // 计时器 interval
    let elapsedTime = 0; // 已计时间，单位秒

    let planeTimerMenuVisible = true; // 菜单初始可见状态
    let isSimplified = false; // 简化模式状态

    // 等待 GeoFS 加载完成
    const waitForGeoFS = setInterval(() => {
        if (window.geofs && geofs.aircraft && geofs.aircraft.instance) {
            clearInterval(waitForGeoFS);
            createPlaneTimerMenu();
            setupToggleTimerShortcut();
        }
    }, 1000);

    // 创建飞行时间计时器菜单
    function createPlaneTimerMenu() {
        const menu = document.createElement("div");
        menu.id = "planeTimerMenu"; // 设置 ID，以便控制显示和隐藏
        menu.style.position = "absolute";
        menu.style.bottom = "10px";
        menu.style.left = "10px";
        menu.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        menu.style.color = "white";
        menu.style.padding = "10px";
        menu.style.borderRadius = "8px";
        menu.style.zIndex = "9999";
        menu.style.width = "250px";
        menu.style.fontFamily = "Arial, sans-serif";
        menu.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.5)";
        menu.style.fontSize = "14px";
        menu.innerHTML = `
            <h3 style="margin: 0; font-size: 16px; text-align: center;">飞行时间计时器</h3>
            <p style="text-align: center; font-size: 12px; color: #ccc;">作者：蜂蜜水的冬日航线123</p>
            <hr style="margin: 5px 0;">
            <div>
                <p>计时器: <span id="elapsedTime">00:00:00</span></p>
                <button id="startTimerButton" style="
                    width: 30%;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    padding: 8px;
                    cursor: pointer;
                    margin-right: 3%;
                ">开始</button>
                <button id="pauseTimerButton" style="
                    width: 30%;
                    background-color: #f44336;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    padding: 8px;
                    cursor: pointer;
                    margin-right: 3%;
                ">暂停</button>
                <button id="resetTimerButton" style="
                    width: 30%;
                    background-color: #2196F3;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    padding: 8px;
                    cursor: pointer;
                ">重置</button>
                <button id="simplifyButton" style="
                    width: 30%;
                    background-color: #333;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    padding: 8px;
                    cursor: pointer;
                    margin-top: 10px;
                ">简化</button>
                <hr style="margin: 10px 0;">
                <p>当前时间: <span id="currentTime">加载中...</span></p>
            </div>
        `;

        document.body.appendChild(menu);

        // 设置开始按钮功能
        document.getElementById("startTimerButton").addEventListener("click", startTimer);

        // 设置暂停按钮功能
        document.getElementById("pauseTimerButton").addEventListener("click", pauseTimer);

        // 设置重置按钮功能
        document.getElementById("resetTimerButton").addEventListener("click", resetTimer);

        // 设置简化按钮功能
        document.getElementById("simplifyButton").addEventListener("click", toggleSimplify);

        // 实时更新电脑当前时间
        setInterval(updateCurrentTime, 1000);
    }

    // 开始计时器功能
    function startTimer() {
        if (!isTimerRunning) {
            isTimerRunning = true;
            timerInterval = setInterval(() => {
                elapsedTime++;
                updateElapsedTime();
            }, 1000);
        }
    }

    // 暂停计时器功能
    function pauseTimer() {
        if (isTimerRunning) {
            isTimerRunning = false;
            clearInterval(timerInterval);
        }
    }

    // 重置计时器功能
    function resetTimer() {
        isTimerRunning = false;
        clearInterval(timerInterval);
        elapsedTime = 0;
        updateElapsedTime();
    }

    // 更新计时器显示
    function updateElapsedTime() {
        const elapsedTimeElement = document.getElementById("elapsedTime");
        if (elapsedTimeElement) {
            const hours = Math.floor(elapsedTime / 3600);
            const minutes = Math.floor((elapsedTime % 3600) / 60);
            const seconds = elapsedTime % 60;
            elapsedTimeElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }

    // 更新电脑当前时间显示
    function updateCurrentTime() {
        const currentTimeElement = document.getElementById("currentTime");
        if (currentTimeElement) {
            const now = new Date();
            currentTimeElement.textContent = now.toLocaleTimeString(); // 显示格式化的当前时间
        }
    }

    // 切换简化模式
    function toggleSimplify() {
        const menu = document.getElementById("planeTimerMenu");
        const elapsedTimeElement = document.getElementById("elapsedTime");
        if (menu && elapsedTimeElement) {
            if (!isSimplified) {
                // 进入简化模式
                menu.style.bottom = "50px"; // 向下移动一点
                menu.style.left = "10px";
                menu.style.width = "auto";
                menu.style.padding = "5px";
                menu.innerHTML = `<span id="elapsedTime" style="cursor: pointer;">${elapsedTimeElement.textContent}</span>`;
                // 动态添加点击事件
                document.getElementById("elapsedTime").addEventListener("click", toggleSimplify);
                isSimplified = true;
            } else {
                // 退出简化模式
                menu.style.bottom = "10px";
                menu.style.left = "10px";
                menu.style.width = "250px";
                menu.style.padding = "10px";
                menu.innerHTML = `
                    <h3 style="margin: 0; font-size: 16px; text-align: center;">飞行时间计时器</h3>
                    <p style="text-align: center; font-size: 12px; color: #ccc;">作者：蜂蜜水的冬日航线123</p>
                    <hr style="margin: 5px 0;">
                    <div>
                        <p>计时器: <span id="elapsedTime">${elapsedTimeElement.textContent}</span></p>
                        <button id="startTimerButton" style="
                            width: 30%;
                            background-color: #4CAF50;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            padding: 8px;
                            cursor: pointer;
                            margin-right: 3%;
                        ">开始</button>
                        <button id="pauseTimerButton" style="
                            width: 30%;
                            background-color: #f44336;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            padding: 8px;
                            cursor: pointer;
                            margin-right: 3%;
                        ">暂停</button>
                        <button id="resetTimerButton" style="
                            width: 30%;
                            background-color: #2196F3;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            padding: 8px;
                            cursor: pointer;
                        ">重置</button>
                        <button id="simplifyButton" style="
                            width: 30%;
                            background-color: #333;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            padding: 8px;
                            cursor: pointer;
                            margin-top: 10px;
                        ">简化</button>
                        <hr style="margin: 10px 0;">
                        <p>当前时间: <span id="currentTime">加载中...</span></p>
                    </div>
                `;
                // 重新绑定事件
                document.getElementById("startTimerButton").addEventListener("click", startTimer);
                document.getElementById("pauseTimerButton").addEventListener("click", pauseTimer);
                document.getElementById("resetTimerButton").addEventListener("click", resetTimer);
                document.getElementById("simplifyButton").addEventListener("click", toggleSimplify);
                isSimplified = false;
            }
        }
    }

    // 设置快捷键切换飞行时间计时器菜单显示/隐藏
    function setupToggleTimerShortcut() {
        document.addEventListener("keydown", (event) => {
            if (event.key === "q" || event.key === "Q") {
                const menu = document.getElementById("planeTimerMenu");
                if (menu) {
                    planeTimerMenuVisible = !planeTimerMenuVisible;
                    menu.style.display = planeTimerMenuVisible ? "block" : "none";
                }
            }
        });
    }
})();
