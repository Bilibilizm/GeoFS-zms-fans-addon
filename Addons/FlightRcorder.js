(function () {
    'use strict';

    // 初始化变量
    let menuOpen = false;
    let flights = JSON.parse(localStorage.getItem('flights')) || [];

    // 语言文本
    const texts = {
        '简体中文': {
            'menuTitle': 'GeoFS 飞行记录器（zm粉丝专属豪华至尊超级牛逼puls pro版）',
            'language': '语言',
            'previousFlights': '历史飞行',
            'import': '导入',
            'view': '查看',
            'edit': '编辑',
            'delete': '删除',
            'confirmDelete': '确定要删除此飞行记录吗？',
            'flightNumber': '航班号',
            'aircraftReg': '飞机注册号',
            'departureICAO': '起飞机场ICAO',
            'arrivalICAO': '降落机场ICAO',
            'route': '航路',
            'actualDeparture': '实际起飞时间',
            'actualArrival': '实际到达时间',
            'cruiseAltitude': '巡航高度',
            'importImage': '导入图片（选填）',
            'importJson': '导入JSON飞行计划（选填）',
            'save': '保存',
            'close': '关闭',
            'invalidICAO': 'ICAO代码必须为4个大写字母！',
            'invalidTime': '时间格式必须为HH:MM！',
            'requiredField': '所有字段必须填写！',
            'noFlights': '暂无飞行记录。',
            'joinQQGroup': '加入我们QQ交流群: 797834076',
            'joinDiscordGroup': '加入我们的Discord群组',
            'author': '作者',
            'maxImages': '最多只能上传6张图片！',
        },
    };

    // 创建菜单
    const menu = document.createElement('div');
    menu.style.position = 'fixed';
    menu.style.top = '20px';
    menu.style.right = '20px';
    menu.style.backgroundColor = '#f5f5f5';
    menu.style.color = '#333';
    menu.style.padding = '15px';
    menu.style.borderRadius = '10px';
    menu.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)';
    menu.style.zIndex = '10000';
    menu.style.display = 'none';
    menu.style.width = '300px';
    menu.style.maxHeight = '80vh';
    menu.style.overflowY = 'auto';
    menu.style.fontFamily = 'Arial, sans-serif';
    document.body.appendChild(menu);

    // 菜单标题（可拖动）
    const menuTitle = document.createElement('div');
    menuTitle.innerText = texts['简体中文'].menuTitle;
    menuTitle.style.fontSize = '18px';
    menuTitle.style.fontWeight = 'bold';
    menuTitle.style.marginBottom = '10px';
    menuTitle.style.cursor = 'move';
    menu.appendChild(menuTitle);

    // 作者信息
    const authorInfo = document.createElement('div');
    authorInfo.innerText = `${texts['简体中文'].author}：開飛機のzm`;
    authorInfo.style.fontSize = '12px';
    authorInfo.style.color = '#666';
    authorInfo.style.marginBottom = '10px';
    menu.appendChild(authorInfo);

    // 历史飞行记录
    const flightsList = document.createElement('div');
    flightsList.style.marginBottom = '10px';
    menu.appendChild(flightsList);

    // 导入按钮
    const importButton = document.createElement('button');
    importButton.innerText = texts['简体中文'].import;
    importButton.style.width = '100%';
    importButton.style.padding = '8px';
    importButton.style.backgroundColor = '#007BFF';
    importButton.style.color = 'white';
    importButton.style.border = 'none';
    importButton.style.borderRadius = '5px';
    importButton.style.cursor = 'pointer';
    importButton.addEventListener('click', showImportForm);
    menu.appendChild(importButton);

    // QQ 群和 Discord 群组信息
    const groupInfo = document.createElement('div');
    groupInfo.style.marginTop = '10px';
    groupInfo.style.fontSize = '12px';
    groupInfo.style.color = '#666';
    groupInfo.innerHTML = `
        <p>${texts['简体中文'].joinQQGroup}</p>
        <p><a href="https://discord.gg/4dGHsNqgCH" target="_blank" style="color: #007BFF; text-decoration: none;">${texts['简体中文'].joinDiscordGroup}</a></p>
    `;
    menu.appendChild(groupInfo);

    // 删除飞行记录
    window.deleteFlight = function (index) {
        console.log(`Attempting to delete flight at index ${index}`);
        if (confirm(texts['简体中文'].confirmDelete)) {
            console.log('User confirmed deletion'); 
            flights.splice(index, 1); 
            console.log('Updated flights array:', flights); 
            localStorage.setItem('flights', JSON.stringify(flights)); 
            console.log('Updated localStorage:', localStorage.getItem('flights')); 
            updateUI();
        } else {
            console.log('User canceled deletion');
        }
    };

    // 更新界面语言
    function updateUI() {
        console.log('Updating UI...'); 
        menuTitle.innerText = texts['简体中文'].menuTitle;
        authorInfo.innerText = `${texts['简体中文'].author}：開飛機のzm`;
        importButton.innerText = texts['简体中文'].import;
        flightsList.innerHTML = `<h3>${texts['简体中文'].previousFlights}</h3>`;
        if (flights.length === 0) {
            flightsList.innerHTML += `<p>${texts['简体中文'].noFlights}</p>`;
        } else {
            flights.forEach((flight, index) => {
                const flightItem = document.createElement('div');
                flightItem.style.marginBottom = '10px';
                flightItem.style.padding = '10px';
                flightItem.style.backgroundColor = '#fff';
                flightItem.style.borderRadius = '5px';
                flightItem.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
                flightItem.style.display = 'flex';
                flightItem.style.justifyContent = 'space-between';
                flightItem.style.alignItems = 'center';
                flightItem.innerHTML = `
                    <div>
                        <p><strong>${index + 1}. ${flight.flightNumber}</strong> - ${flight.departureICAO} → ${flight.arrivalICAO}</p>
                    </div>
                    <div>
                        <button onclick="viewFlightDetails(${index})" style="margin-right: 5px;">${texts['简体中文'].view}</button>
                        <button onclick="editFlight(${index})" style="margin-right: 5px;">${texts['简体中文'].edit}</button>
                        <button onclick="deleteFlight(${index})" style="background-color: #dc3545; color: white; border: none; border-radius: 5px; padding: 5px 10px; cursor: pointer;">❌</button>
                    </div>
                `;
                flightsList.appendChild(flightItem);
            });
        }
        console.log('UI updated successfully');
    }

    // 监听键盘事件
    document.addEventListener('keydown', (e) => {
        if (e.key === 'I' || e.key === 'i') {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
            menuOpen = !menuOpen;
        }
    });

    // 显示导入表单
    function showImportForm() {
        const formContainer = document.createElement('div');
        formContainer.style.position = 'fixed';
        formContainer.style.top = '50%';
        formContainer.style.left = '50%';
        formContainer.style.transform = 'translate(-50%, -50%)';
        formContainer.style.backgroundColor = '#f5f5f5';
        formContainer.style.color = '#333';
        formContainer.style.padding = '20px';
        formContainer.style.borderRadius = '10px';
        formContainer.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)';
        formContainer.style.zIndex = '10001';
        formContainer.style.width = '400px';
        formContainer.style.maxHeight = '80vh';
        formContainer.style.overflowY = 'auto';

        const form = document.createElement('div');
        form.innerHTML = `
            <h3>${texts['简体中文'].import}</h3>
            <label>${texts['简体中文'].flightNumber}: <input type="text" id="flightNumber"></label><br>
            <label>${texts['简体中文'].aircraftReg}: <input type="text" id="aircraftReg"></label><br>
            <label>${texts['简体中文'].departureICAO}: <input type="text" id="departureICAO"></label><br>
            <label>${texts['简体中文'].arrivalICAO}: <input type="text" id="arrivalICAO"></label><br>
            <label>${texts['简体中文'].route}: <textarea id="route"></textarea></label><br>
            <label>${texts['简体中文'].actualDeparture}: <input type="text" id="actualDeparture"></label><br>
            <label>${texts['简体中文'].actualArrival}: <input type="text" id="actualArrival"></label><br>
            <label>${texts['简体中文'].cruiseAltitude}: <input type="text" id="cruiseAltitude"></label><br>
            <label>${texts['简体中文'].importImage}: <input type="file" id="importImage" multiple></label><br>
            <label>${texts['简体中文'].importJson}: <input type="file" id="importJson"></label><br>
            <button onclick="saveFlight()" style="margin-right: 5px;">${texts['简体中文'].save}</button>
            <button onclick="closeForm()">${texts['简体中文'].close}</button>
        `;
        formContainer.appendChild(form);
        document.body.appendChild(formContainer);

        // 使表单可拖动
        let isDragging = false;
        let offsetX, offsetY;

        formContainer.addEventListener('mousedown', (e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') {
                isDragging = true;
                offsetX = e.clientX - formContainer.offsetLeft;
                offsetY = e.clientY - formContainer.offsetTop;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                formContainer.style.left = `${e.clientX - offsetX}px`;
                formContainer.style.top = `${e.clientY - offsetY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // 保存飞行记录
        window.saveFlight = function () {
            const flightNumber = document.getElementById('flightNumber').value;
            const aircraftReg = document.getElementById('aircraftReg').value;
            const departureICAO = document.getElementById('departureICAO').value;
            const arrivalICAO = document.getElementById('arrivalICAO').value;
            const route = document.getElementById('route').value;
            const actualDeparture = document.getElementById('actualDeparture').value;
            const actualArrival = document.getElementById('actualArrival').value;
            const cruiseAltitude = document.getElementById('cruiseAltitude').value;
            const imageFiles = document.getElementById('importImage').files;
            const jsonFile = document.getElementById('importJson').files[0];

            // 校验输入
            if (!flightNumber || !aircraftReg || !departureICAO || !arrivalICAO || !route || !actualDeparture || !actualArrival || !cruiseAltitude) {
                alert(texts['简体中文'].requiredField);
                return;
            }
            if (!/^[A-Z]{4}$/.test(departureICAO) || !/^[A-Z]{4}$/.test(arrivalICAO)) {
                alert(texts['简体中文'].invalidICAO);
                return;
            }
            if (!/^\d{2}:\d{2}$/.test(actualDeparture) || !/^\d{2}:\d{2}$/.test(actualArrival)) {
                alert(texts['简体中文'].invalidTime);
                return;
            }

            // 处理图片文件
            const images = [];
            if (imageFiles.length > 0) {
                if (imageFiles.length > 6) {
                    alert(texts['简体中文'].maxImages);
                    return;
                }
                for (let i = 0; i < imageFiles.length; i++) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        images.push(e.target.result);
                    };
                    reader.readAsDataURL(imageFiles[i]);
                }
            }

            // 处理 JSON 文件
            let jsonData = null;
            if (jsonFile) {
                if (jsonFile.name.endsWith('.json')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            jsonData = JSON.parse(e.target.result);
                        } catch (error) {
                            alert('Invalid JSON file!');
                        }
                    };
                    reader.readAsText(jsonFile);
                } else {
                    alert('Please upload a valid JSON file!');
                }
            }

            // 保存记录
            flights.push({
                flightNumber,
                aircraftReg,
                departureICAO,
                arrivalICAO,
                route,
                actualDeparture,
                actualArrival,
                cruiseAltitude,
                images,
                jsonData,
            });
            localStorage.setItem('flights', JSON.stringify(flights)); 
            updateUI();
            closeForm();
        };

        // 关闭表单
        window.closeForm = function () {
            document.body.removeChild(formContainer);
        };
    }

    // 查看飞行记录详情
    window.viewFlightDetails = function (index) {
        const flight = flights[index];
        const details = `
            <h3>${flight.flightNumber}</h3>
            <p><strong>${texts['简体中文'].aircraftReg}:</strong> ${flight.aircraftReg}</p>
            <p><strong>${texts['简体中文'].departureICAO}:</strong> ${flight.departureICAO}</p>
            <p><strong>${texts['简体中文'].arrivalICAO}:</strong> ${flight.arrivalICAO}</p>
            <p><strong>${texts['简体中文'].route}:</strong> ${flight.route}</p>
            <p><strong>${texts['简体中文'].actualDeparture}:</strong> ${flight.actualDeparture}</p>
            <p><strong>${texts['简体中文'].actualArrival}:</strong> ${flight.actualArrival}</p>
            <p><strong>${texts['简体中文'].cruiseAltitude}:</strong> ${flight.cruiseAltitude}</p>
            ${flight.images.length > 0 ? `<p><strong>${texts['简体中文'].importImage}:</strong></p>` : ''}
            ${flight.images.map((img, i) => `<img src="${img}" style="max-width: 100%; margin-bottom: 10px;">`).join('')}
            ${flight.jsonData ? `<p><strong>${texts['简体中文'].importJson}:</strong></p><pre>${JSON.stringify(flight.jsonData, null, 2)}</pre>` : ''}
        `;

        const detailsContainer = document.createElement('div');
        detailsContainer.style.position = 'fixed';
        detailsContainer.style.top = '50%';
        detailsContainer.style.left = '50%';
        detailsContainer.style.transform = 'translate(-50%, -50%)';
        detailsContainer.style.backgroundColor = '#f5f5f5';
        detailsContainer.style.color = '#333';
        detailsContainer.style.padding = '20px';
        detailsContainer.style.borderRadius = '10px';
        detailsContainer.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)';
        detailsContainer.style.zIndex = '10001';
        detailsContainer.style.width = '400px';
        detailsContainer.style.maxHeight = '80vh';
        detailsContainer.style.overflowY = 'auto';
        detailsContainer.innerHTML = details;

        const closeButton = document.createElement('button');
        closeButton.innerText = texts['简体中文'].close;
        closeButton.style.marginTop = '10px';
        closeButton.style.padding = '8px';
        closeButton.style.backgroundColor = '#007BFF';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(detailsContainer);
        });
        detailsContainer.appendChild(closeButton);

        document.body.appendChild(detailsContainer);
    };

    // 编辑飞行记录
    window.editFlight = function (index) {
        const flight = flights[index];
        const formContainer = document.createElement('div');
        formContainer.style.position = 'fixed';
        formContainer.style.top = '50%';
        formContainer.style.left = '50%';
        formContainer.style.transform = 'translate(-50%, -50%)';
        formContainer.style.backgroundColor = '#f5f5f5';
        formContainer.style.color = '#333';
        formContainer.style.padding = '20px';
        formContainer.style.borderRadius = '10px';
        formContainer.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)';
        formContainer.style.zIndex = '10001';
        formContainer.style.width = '400px';
        formContainer.style.maxHeight = '80vh';
        formContainer.style.overflowY = 'auto';

        const form = document.createElement('div');
        form.innerHTML = `
            <h3>${texts['简体中文'].edit}</h3>
            <label>${texts['简体中文'].flightNumber}: <input type="text" id="editFlightNumber" value="${flight.flightNumber}"></label><br>
            <label>${texts['简体中文'].aircraftReg}: <input type="text" id="editAircraftReg" value="${flight.aircraftReg}"></label><br>
            <label>${texts['简体中文'].departureICAO}: <input type="text" id="editDepartureICAO" value="${flight.departureICAO}"></label><br>
            <label>${texts['简体中文'].arrivalICAO}: <input type="text" id="editArrivalICAO" value="${flight.arrivalICAO}"></label><br>
            <label>${texts['简体中文'].route}: <textarea id="editRoute">${flight.route}</textarea></label><br>
            <label>${texts['简体中文'].actualDeparture}: <input type="text" id="editActualDeparture" value="${flight.actualDeparture}"></label><br>
            <label>${texts['简体中文'].actualArrival}: <input type="text" id="editActualArrival" value="${flight.actualArrival}"></label><br>
            <label>${texts['简体中文'].cruiseAltitude}: <input type="text" id="editCruiseAltitude" value="${flight.cruiseAltitude}"></label><br>
            <button onclick="saveEditedFlight(${index})" style="margin-right: 5px;">${texts['简体中文'].save}</button>
            <button onclick="closeForm()">${texts['简体中文'].close}</button>
        `;
        formContainer.appendChild(form);
        document.body.appendChild(formContainer);

        // 保存编辑后的飞行记录
        window.saveEditedFlight = function (index) {
            const flightNumber = document.getElementById('editFlightNumber').value;
            const aircraftReg = document.getElementById('editAircraftReg').value;
            const departureICAO = document.getElementById('editDepartureICAO').value;
            const arrivalICAO = document.getElementById('editArrivalICAO').value;
            const route = document.getElementById('editRoute').value;
            const actualDeparture = document.getElementById('editActualDeparture').value;
            const actualArrival = document.getElementById('editActualArrival').value;
            const cruiseAltitude = document.getElementById('editCruiseAltitude').value;

            // 校验输入
            if (!flightNumber || !aircraftReg || !departureICAO || !arrivalICAO || !route || !actualDeparture || !actualArrival || !cruiseAltitude) {
                alert(texts['简体中文'].requiredField);
                return;
            }
            if (!/^[A-Z]{4}$/.test(departureICAO) || !/^[A-Z]{4}$/.test(arrivalICAO)) {
                alert(texts['简体中文'].invalidICAO);
                return;
            }
            if (!/^\d{2}:\d{2}$/.test(actualDeparture) || !/^\d{2}:\d{2}$/.test(actualArrival)) {
                alert(texts['简体中文'].invalidTime);
                return;
            }

            // 更新记录
            flights[index] = {
                ...flights[index],
                flightNumber,
                aircraftReg,
                departureICAO,
                arrivalICAO,
                route,
                actualDeparture,
                actualArrival,
                cruiseAltitude,
            };
            localStorage.setItem('flights', JSON.stringify(flights));
            updateUI();
            closeForm();
        };

        // 关闭表单
        window.closeForm = function () {
            document.body.removeChild(formContainer);
        };
    };

    // 删除飞行记录
    window.deleteFlight = function (index) {
        if (confirm(texts['简体中文'].confirmDelete)) {
            flights.splice(index, 1);
            localStorage.setItem('flights', JSON.stringify(flights)); 
            updateUI();
        }
    };

    // 初始化界面
    updateUI();
})();
