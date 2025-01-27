(function () {
    'use strict';

    let flightTimeMenuVisible = true; // 菜单初始可见状态
    let currentStatusIndex = 0; // 当前状态的索引

    const statusList = [
        "登机",
        "滑行",
        "起飞",
        "爬升",
        "巡航",
        "下降",
        "进近",
        "落地",
        "关车",
        "待机",
    ];

    // 等待 GeoFS 加载完成
    const waitForGeoFS = setInterval(() => {
        if (window.geofs && geofs.aircraft && geofs.aircraft.instance) {
            clearInterval(waitForGeoFS);
            createFlightTimeMenu();
            setupToggleFlightTimeShortcut();
            setupStatusShortcut();
        }
    }, 1000);

    // 创建飞行时间菜单
    function createFlightTimeMenu() {
        const menu = document.createElement("div");
        menu.id = "flightTimeMenu"; // 设置 ID，以便控制显示和隐藏
        menu.style.position = "absolute";
        menu.style.top = "10px";
        menu.style.right = "10px";
        menu.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        menu.style.color = "white";
        menu.style.padding = "10px";
        menu.style.borderRadius = "8px";
        menu.style.zIndex = "9999";
        menu.style.width = "220px";
        menu.style.fontFamily = "Arial, sans-serif";
        menu.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.5)";
        menu.style.fontSize = "14px";
        menu.innerHTML = `
            <h3 style="margin: 0; font-size: 16px; text-align: center;">GeoFS飞行状态显示器</h3>
            <p style="margin: 0; font-size: 12px; text-align: center; color: #ccc;">作者：bilibili-蜂蜜水的冬日航线123</p>
            <hr style="margin: 5px 0;">
            <div>
                <p id="flightStatus">当前状态: <span style="color: yellow;">${statusList[currentStatusIndex]}</span></p>
                <p id="nextStatus" style="font-size: 12px; color: #ccc;">下一个：${statusList[(currentStatusIndex + 1) % statusList.length]}</p>
                <button id="resetStatusButton" style="
                    width: 100%;
                    background-color: #ff4d4d;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    padding: 8px;
                    cursor: pointer;
                ">重置状态</button>
            </div>
        `;

        // 添加重置状态功能
        menu.querySelector("#resetStatusButton").addEventListener("click", resetStatus);

        document.body.appendChild(menu);

        // 使菜单可拖动
        makeMenuDraggable(menu);
    }

    // 更新飞行状态显示
    function updateFlightStatus(status, color) {
        const statusElement = document.getElementById("flightStatus");
        const nextStatusElement = document.getElementById("nextStatus");
        if (statusElement && nextStatusElement) {
            statusElement.innerHTML = `当前状态: <span style="color: ${color};">${status}</span>`;
            nextStatusElement.innerHTML = `下一个：${statusList[(currentStatusIndex + 1) % statusList.length]}`;
        }
    }

    // 重置状态功能
    function resetStatus() {
        currentStatusIndex = 0; // 重置状态为“登机”
        updateFlightStatus(statusList[currentStatusIndex], "yellow");
    }

    // 设置快捷键切换飞行时间菜单显示/隐藏
    function setupToggleFlightTimeShortcut() {
        document.addEventListener("keydown", (event) => {
            if (event.key === "w" || event.key === "W") { 
                const menu = document.getElementById("flightTimeMenu");
                if (menu) {
                    flightTimeMenuVisible = !flightTimeMenuVisible;
                    menu.style.display = flightTimeMenuVisible ? "block" : "none";
                }
            }
        });
    }

    // 设置状态快捷键（Alt+Y 循环切换状态）
    function setupStatusShortcut() {
        document.addEventListener("keydown", (event) => {
            if (event.altKey && (event.key === "y" || event.key === "Y")) { 
                currentStatusIndex = (currentStatusIndex + 1) % statusList.length; 
                const newStatus = statusList[currentStatusIndex];
                updateFlightStatus(newStatus, "cyan");
            }
        });
    }

    // 使菜单可拖动
    function makeMenuDraggable(menu) {
        let isDragging = false;
        let offsetX, offsetY;

        menu.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - menu.getBoundingClientRect().left;
            offsetY = e.clientY - menu.getBoundingClientRect().top;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                menu.style.left = `${e.clientX - offsetX}px`;
                menu.style.top = `${e.clientY - offsetY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
})();
