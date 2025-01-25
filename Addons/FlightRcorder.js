
(function () {
    'use strict';

    // 初始化变量
    let menuOpen = false;
    let language = 'English'; 
    let flights = JSON.parse(localStorage.getItem('flights')) || [];

    // 语言文本
    const texts = {
        'English': {
            'menuTitle': 'GeoFS Flight Recorder',
            'language': 'Language',
            'previousFlights': 'Previous Flights',
            'import': 'Import',
            'view': 'View',
            'edit': 'Edit',
            'delete': 'Delete',
            'confirmDelete': 'Are you sure you want to delete this flight?',
            'flightNumber': 'Flight Number',
            'aircraftReg': 'Aircraft Registration',
            'departureICAO': 'Departure ICAO',
            'arrivalICAO': 'Arrival ICAO',
            'route': 'Route',
            'actualDeparture': 'Actual Departure Time',
            'actualArrival': 'Actual Arrival Time',
            'cruiseAltitude': 'Cruise Altitude',
            'importImage': 'Import Image (Optional)',
            'importJson': 'Import JSON Flight Plan (Optional)',
            'save': 'Save',
            'close': 'Close',
            'invalidICAO': 'ICAO code must be 4 uppercase letters!',
            'invalidTime': 'Time format must be HH:MM!',
            'requiredField': 'All fields are required!',
            'noFlights': 'No flights recorded yet.',
            'joinQQGroup': 'Join our QQ group: 797834076',
            'joinDiscordGroup': 'Join our Discord Group',
            'author': 'Author',
            'maxImages': 'You can upload up to 6 images!',
        },
        '简体中文': {
            'menuTitle': 'GeoFS 飞行记录器',
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
        '繁體中文': {
            'menuTitle': 'GeoFS 飛行記錄器',
            'language': '語言',
            'previousFlights': '歷史飛行',
            'import': '導入',
            'view': '查看',
            'edit': '編輯',
            'delete': '刪除',
            'confirmDelete': '確定要刪除此飛行記錄嗎？',
            'flightNumber': '航班號',
            'aircraftReg': '飛機註冊號',
            'departureICAO': '起飛機場ICAO',
            'arrivalICAO': '降落機場ICAO',
            'route': '航路',
            'actualDeparture': '實際起飛時間',
            'actualArrival': '實際到達時間',
            'cruiseAltitude': '巡航高度',
            'importImage': '導入圖片（選填）',
            'importJson': '導入JSON飛行計劃（選填）',
            'save': '保存',
            'close': '關閉',
            'invalidICAO': 'ICAO代碼必須為4個大寫字母！',
            'invalidTime': '時間格式必須為HH:MM！',
            'requiredField': '所有欄位必須填寫！',
            'noFlights': '暫無飛行記錄。',
            'joinQQGroup': '加入我们QQ交流群: 797834076',
            'joinDiscordGroup': '加入我們的Discord群組',
            'author': '作者',
            'maxImages': '最多只能上傳6張圖片！',
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
    menuTitle.innerText = texts[language].menuTitle;
    menuTitle.style.fontSize = '18px';
    menuTitle.style.fontWeight = 'bold';
    menuTitle.style.marginBottom = '10px';
    menuTitle.style.cursor = 'move';
    menu.appendChild(menuTitle);

    // 作者信息
    const authorInfo = document.createElement('div');
    authorInfo.innerText = `${texts[language].author}：開飛機のzm`;
    authorInfo.style.fontSize = '12px';
    authorInfo.style.color = '#666';
    authorInfo.style.marginBottom = '10px';
    menu.appendChild(authorInfo);

    // 语言切换
    const languageSelect = document.createElement('select');
    languageSelect.innerHTML = `
        <option value="English">English</option>
        <option value="简体中文">简体中文</option>
        <option value="繁體中文">繁體中文</option>
    `;
    languageSelect.style.marginBottom = '10px';
    languageSelect.style.width = '100%';
    languageSelect.style.padding = '5px';
    languageSelect.addEventListener('change', () => {
        language = languageSelect.value;
        updateUI();
    });
    menu.appendChild(languageSelect);

    // 历史飞行记录
    const flightsList = document.createElement('div');
    flightsList.style.marginBottom = '10px';
    menu.appendChild(flightsList);

    // 导入按钮
    const importButton = document.createElement('button');
    importButton.innerText = texts[language].import;
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
        <p><a href="https://discord.gg/4dGHsNqgCH" target="_blank" style="color: #007BFF; text-decoration: none;">${texts[language].joinDiscordGroup}</a></p>
    `;
    menu.appendChild(groupInfo);

    // 删除飞行记录
    window.deleteFlight = function (index) {
        console.log(`Attempting to delete flight at index ${index}`);
        if (confirm(texts[language].confirmDelete)) {
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
        menuTitle.innerText = texts[language].menuTitle;
        authorInfo.innerText = `${texts[language].author}：開飛機のzm`;
        importButton.innerText = texts[language].import;
        flightsList.innerHTML = `<h3>${texts[language].previousFlights}</h3>`;
        if (flights.length === 0) {
            flightsList.innerHTML += `<p>${texts[language].noFlights}</p>`;
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
                        <button onclick="viewFlightDetails(${index})" style="margin-right: 5px;">${texts[language].view}</button>
                        <button onclick="editFlight(${index})" style="margin-right: 5px;">${texts[language].edit}</button>
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
        if (e.key === 'O' || e.key === 'o') {
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
            <h3>${texts[language].import}</h3>
            <label>${texts[language].flightNumber}: <input type="text" id="flightNumber"></label><br>
            <label>${texts[language].aircraftReg}: <input type="text" id="aircraftReg"></label><br>
            <label>${texts[language].departureICAO}: <input type="text" id="departureICAO"></label><br>
            <label>${texts[language].arrivalICAO}: <input type="text" id="arrivalICAO"></label><br>
            <label>${texts[language].route}: <textarea id="route"></textarea></label><br>
            <label>${texts[language].actualDeparture}: <input type="text" id="actualDeparture"></label><br>
            <label>${texts[language].actualArrival}: <input type="text" id="actualArrival"></label><br>
            <label>${texts[language].cruiseAltitude}: <input type="text" id="cruiseAltitude"></label><br>
            <label>${texts[language].importImage}: <input type="file" id="importImage" multiple></label><br>
            <label>${texts[language].importJson}: <input type="file" id="importJson"></label><br>
            <button onclick="saveFlight()" style="margin-right: 5px;">${texts[language].save}</button>
            <button onclick="closeForm()">${texts[language].close}</button>
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
                alert(texts[language].requiredField);
                return;
            }
            if (!/^[A-Z]{4}$/.test(departureICAO) || !/^[A-Z]{4}$/.test(arrivalICAO)) {
                alert(texts[language].invalidICAO);
                return;
            }
            if (!/^\d{2}:\d{2}$/.test(actualDeparture) || !/^\d{2}:\d{2}$/.test(actualArrival)) {
                alert(texts[language].invalidTime);
                return;
            }

            // 处理图片文件
            const images = [];
            if (imageFiles.length > 0) {
                if (imageFiles.length > 6) {
                    alert(texts[language].maxImages);
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
            <p><strong>${texts[language].aircraftReg}:</strong> ${flight.aircraftReg}</p>
            <p><strong>${texts[language].departureICAO}:</strong> ${flight.departureICAO}</p>
            <p><strong>${texts[language].arrivalICAO}:</strong> ${flight.arrivalICAO}</p>
            <p><strong>${texts[language].route}:</strong> ${flight.route}</p>
            <p><strong>${texts[language].actualDeparture}:</strong> ${flight.actualDeparture}</p>
            <p><strong>${texts[language].actualArrival}:</strong> ${flight.actualArrival}</p>
            <p><strong>${texts[language].cruiseAltitude}:</strong> ${flight.cruiseAltitude}</p>
            ${flight.images.length > 0 ? `<p><strong>${texts[language].importImage}:</strong></p>` : ''}
            ${flight.images.map((img, i) => `<img src="${img}" style="max-width: 100%; margin-bottom: 10px;">`).join('')}
            ${flight.jsonData ? `<p><strong>${texts[language].importJson}:</strong></p><pre>${JSON.stringify(flight.jsonData, null, 2)}</pre>` : ''}
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
        closeButton.innerText = texts[language].close;
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
            <h3>${texts[language].edit}</h3>
            <label>${texts[language].flightNumber}: <input type="text" id="editFlightNumber" value="${flight.flightNumber}"></label><br>
            <label>${texts[language].aircraftReg}: <input type="text" id="editAircraftReg" value="${flight.aircraftReg}"></label><br>
            <label>${texts[language].departureICAO}: <input type="text" id="editDepartureICAO" value="${flight.departureICAO}"></label><br>
            <label>${texts[language].arrivalICAO}: <input type="text" id="editArrivalICAO" value="${flight.arrivalICAO}"></label><br>
            <label>${texts[language].route}: <textarea id="editRoute">${flight.route}</textarea></label><br>
            <label>${texts[language].actualDeparture}: <input type="text" id="editActualDeparture" value="${flight.actualDeparture}"></label><br>
            <label>${texts[language].actualArrival}: <input type="text" id="editActualArrival" value="${flight.actualArrival}"></label><br>
            <label>${texts[language].cruiseAltitude}: <input type="text" id="editCruiseAltitude" value="${flight.cruiseAltitude}"></label><br>
            <button onclick="saveEditedFlight(${index})" style="margin-right: 5px;">${texts[language].save}</button>
            <button onclick="closeForm()">${texts[language].close}</button>
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
                alert(texts[language].requiredField);
                return;
            }
            if (!/^[A-Z]{4}$/.test(departureICAO) || !/^[A-Z]{4}$/.test(arrivalICAO)) {
                alert(texts[language].invalidICAO);
                return;
            }
            if (!/^\d{2}:\d{2}$/.test(actualDeparture) || !/^\d{2}:\d{2}$/.test(actualArrival)) {
                alert(texts[language].invalidTime);
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
        if (confirm(texts[language].confirmDelete)) {
            flights.splice(index, 1);
            localStorage.setItem('flights', JSON.stringify(flights)); 
            updateUI();
        }
    };

    // 初始化界面
    updateUI();
})();
