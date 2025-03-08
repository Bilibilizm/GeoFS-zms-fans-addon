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
        menu.style.top = "10px"; // 使用 top 而不是 bottom
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
            <h3 style="margin: 0; font-size: 16px; text-align: center;">【Q】GeoFS飞行时间计时器</h3>
            <p style="text-align: center; font-size: 12px; color: #ccc;">作者：bilibili-蜂蜜水的冬日航线123</p>
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

        // 设置按钮功能
        document.getElementById("startTimerButton").addEventListener("click", startTimer);
        document.getElementById("pauseTimerButton").addEventListener("click", pauseTimer);
        document.getElementById("resetTimerButton").addEventListener("click", resetTimer);
        document.getElementById("simplifyButton").addEventListener("click", toggleSimplify);

        // 实时更新电脑当前时间
        setInterval(updateCurrentTime, 1000);

        // 添加拖动功能
        addDraggable(menu);
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
                menu.style.position = "absolute";
                menu.style.width = "auto";
                menu.style.padding = "5px";
                menu.innerHTML = `<span id="elapsedTime" style="cursor: pointer; display: inline-block;">${elapsedTimeElement.textContent}</span>`;
                // 动态添加点击事件
                const simplifiedElement = document.getElementById("elapsedTime");
                simplifiedElement.addEventListener("click", toggleSimplify);
                // 添加拖动功能
                addDraggable(simplifiedElement);
                isSimplified = true;
            } else {
                // 退出简化模式
                menu.style.position = "absolute";
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
                // 添加拖动功能
                addDraggable(menu);
                isSimplified = false;
            }
        }
    }

    // 添加拖动功能
    function addDraggable(element) {
        let isDragging = false;
        let offsetX, offsetY;

        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - element.getBoundingClientRect().left;
            offsetY = e.clientY - element.getBoundingClientRect().top;
            // 防止拖动时选中文本
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                // 计算新的位置
                const newLeft = e.clientX - offsetX;
                const newTop = e.clientY - offsetY;

                // 更新菜单的位置
                element.style.left = `${newLeft}px`;
                element.style.top = `${newTop}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
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




// ==UserScript==
// @name         GeoFS mini map
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  nothing
// @author      bilibili蜂蜜水的冬日航线123
// @match       http://*/geofs.php*
// @match       https://*/geofs.php*
// @grant        none


// ==/UserScript==
(function() {
    'use strict';

    function injectScript(fn) {
        const script = document.createElement('script');
        script.textContent = `(${fn.toString()})();`;
        document.documentElement.appendChild(script);
        script.remove();
    }

    function main() {
        // 绕过
        (function () {
            'use strict';
            var asddda = 0;

            function updateExperiment() {
                if (typeof L === 'undefined') {
                    console.log('Leaflet库未加载，无法初始化地图');
                } else if (typeof L != 'undefined' && asddda >= 5) {
                    console.log('初始化地图成功');
                } else if (typeof L != 'undefined' && asddda < 5) {
                    asddda += 1;

                    // 配置参数集中管理
                    const CONFIG = {
                        animateView: true,      // 改为控制是否启用动画
                        trackingMode: 'strict', // 强制严格跟踪模式
                        updateInterval: 100,    // 提高更新频率
                        mapContainer: {
                            id: 'geoFsLiveMap',
                            style: {
                                height: '200px',
                                width: '20%',
                                position: 'fixed',
                                top: '0%',       // 默认在左上角
                                left: '0%',
                                transform: 'translate(0%, 0%)',
                                zIndex: 9999,
                                borderRadius: '10px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                                backgroundColor: '#f8f9fa'
                            }
                        },
                        smoothPan: true,     // 启用平滑移动
                        mapProviders: {
                            osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                attribution: '© OpenStreetMap'
                            }),
                            satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                                attribution: '© Esri'
                            })
                        }
                    };

                    // 等待地理数据就绪
                    async function checkDataReady() {
                        const MAX_WAIT_TIME = 5000; // 最大等待时间5秒
                        const startTime = Date.now();

                        return new Promise((resolve, reject) => {
                            const check = () => {
                                const aircraftData = window.geofs?.aircraft?.instance;
                                if (aircraftData?.llaLocation && aircraftData.animationValue?.heading360 !== undefined) {
                                    resolve();
                                } else if (Date.now() - startTime > MAX_WAIT_TIME) {
                                    reject(new Error('等待飞行数据超时'));
                                } else {
                                    setTimeout(check, 100);
                                }
                            };
                            check();
                        });
                    }

                    // 创建地图容器
                    function createMapContainer() {
                        const existing = document.getElementById(CONFIG.mapContainer.id);
                        if (existing) existing.remove();

                        const container = document.createElement('div');
                        container.id = CONFIG.mapContainer.id;
                        Object.assign(container.style, CONFIG.mapContainer.style);
                        document.body.appendChild(container);

                        // 添加可拖动功能
                        let isDragging = false;
                        let offsetX, offsetY;

                        container.addEventListener('mousedown', (e) => {
                            if (e.target.classList.contains('leaflet-control-layers')) return; // 防止拖动图层控制
                            isDragging = true;
                            offsetX = e.clientX - container.getBoundingClientRect().left;
                            offsetY = e.clientY - container.getBoundingClientRect().top;
                        });

                        document.addEventListener('mousemove', (e) => {
                            if (isDragging) {
                                container.style.left = `${e.clientX - offsetX}px`;
                                container.style.top = `${e.clientY - offsetY}px`;
                            }
                        });

                        document.addEventListener('mouseup', () => {
                            isDragging = false;
                        });

                        return container;
                    }

                    // 自定义飞机图标
                    function createAircraftIcon() {
                        return L.divIcon({
                            className: 'aircraft-marker',
                            html: `
                            <div class="aircraft-wrapper">
                                <div class="direction-arrow"></div>
                                <div class="position-circle"></div>
                            </div>
                        `,
                            iconSize: [40, 40],
                            iconAnchor: [20, 20]
                        });
                    }

                    // 创建自定义图层切换按钮
                    function createCustomLayerSwitch(map) {
                        const button = document.createElement('button');
                        button.textContent = 'Map display';
                        button.style.position = 'absolute';
                        button.style.top = '10px';
                        button.style.right = '10px';
                        button.style.zIndex = '10001';
                        button.style.padding = '5px 10px';
                        button.style.fontSize = '14px';
                        button.style.backgroundColor = '#3498db';
                        button.style.color = 'white';
                        button.style.border = 'none';
                        button.style.borderRadius = '5px';
                        button.style.cursor = 'pointer';
                        button.title = 'Switch between Map display and Satellite display';

                        button.addEventListener('click', () => {
                            if (button.textContent === 'Map display') {
                                map.removeLayer(CONFIG.mapProviders.satellite);
                                map.addLayer(CONFIG.mapProviders.osm);
                                button.textContent = 'Satellite display';
                            } else {
                                map.removeLayer(CONFIG.mapProviders.osm);
                                map.addLayer(CONFIG.mapProviders.satellite);
                                button.textContent = 'Map display';
                            }
                        });

                        map.getContainer().appendChild(button);
                    }

                    // 主初始化函数
                    async function initFlightMap() {
                        try {
                            // 数据准备
                            await checkDataReady();
                            const aircraft = geofs.aircraft.instance;

                            // 创建地图容器
                            const container = createMapContainer();

                            // 初始化地图
                            const map = L.map(container.id, {
                                layers: [CONFIG.mapProviders.osm],
                                fadeAnimation: false,
                                preferCanvas: true
                            }).setView([aircraft.llaLocation[0], aircraft.llaLocation[1]], 14);

                            // 创建自定义图层切换按钮
                            createCustomLayerSwitch(map);

                            // 创建飞机标记
                            const aircraftIcon = createAircraftIcon();
                            const marker = L.marker(
                                [aircraft.llaLocation[0], aircraft.llaLocation[1]],
                                {
                                    icon: aircraftIcon,
                                    rotationOrigin: 'center center',
                                    rotationAngle: aircraft.animationValue.heading360
                                }
                            ).addTo(map);

                            // 实时更新逻辑
                            let lastUpdate = 0;
                            const updatePosition = () => {
                                const now = Date.now();
                                if (now - lastUpdate < CONFIG.updateInterval) return;

                                try {
                                    const newLat = aircraft.llaLocation[0];
                                    const newLng = aircraft.llaLocation[1];
                                    const newHeading = aircraft.animationValue.heading360;

                                    // 强制更新地图中心
                                    map.setView([newLat, newLng], map.getZoom(), {
                                        animate: CONFIG.animateView, // 由配置控制动画
                                        duration: 0.3,               // 更短动画时间
                                        easeLinearity: 0.1
                                    });

                                    // 更新标记位置
                                    marker.setLatLng([newLat, newLng])
                                        .setRotationAngle(newHeading);

                                    lastUpdate = now;
                                } catch (e) {
                                    console.warn('位置更新失败:', e);
                                }
                            };

                            // 使用 RAF 优化性能
                            const animateUpdate = () => {
                                requestAnimationFrame(animateUpdate);
                                updatePosition();
                            };
                            animateUpdate();

                            // 窗口大小调整处理
                            const resizeHandler = () => map.invalidateSize({ debounceMoveend: true });
                            window.addEventListener('resize', resizeHandler);

                        } catch (error) {
                            console.error('飞行地图初始化失败:', error);
                            const container = document.getElementById(CONFIG.mapContainer.id);
                            if (container) {
                                container.innerHTML = `
                                <div style="
                                    padding: 15px;
                                    color: #dc3545;
                                    background: #fff;
                                    border-radius: 8px;
                                    text-align: center;
                                ">
                                    ✈️ 地图加载失败: ${error.message}
                                </div>
                            `;
                            }
                        }
                    }

                    // 注入样式
                    const style = document.createElement('style');
                    style.textContent = `
                        .aircraft-marker {
                            transition: transform 0.5s ease-out;
                        }
                        .direction-arrow {
                            width: 0;
                            height: 0;
                            border-left: 12px solid transparent;
                            border-right: 12px solid transparent;
                            border-bottom: 24px solid #e74c3c;
                            position: absolute;
                            top: 2px;
                            left: 50%;
                            transform: translateX(-50%);
                            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                        }
                        .position-circle {
                            width: 10px;
                            height: 10px;
                            background: #2c3e50;
                            border-radius: 50%;
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            border: 2px solid white;
                        }
                    `;
                    document.head.appendChild(style);

                    // 使用 Alt+M 打开/关闭地图
                    document.addEventListener('keydown', (e) => {
                        if (e.altKey && e.code === 'KeyM') {
                            const container = document.getElementById(CONFIG.mapContainer.id);
                            if (container.style.display === 'none') {
                                container.style.display = 'block';
                            } else {
                                container.style.display = 'none';
                            }
                        }
                    });

                    // 启动初始化
                    if (document.readyState === 'complete') {
                        initFlightMap();
                    } else {
                        window.addEventListener('load', () => {
                            initFlightMap();
                        });
                    }
                }
            }
            setInterval(updateExperiment, 2000);
        })();
        console.log("GeoFS Mini Map addon have been added");
    }

    injectScript(main);
})();

