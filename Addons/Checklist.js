(function () {
    'use strict';

    // 定义检查单内容
    const checklist = {
        'zh-CN': {
            '准备': ['飞行计划................导入', '高度速度................输入'],
            '推出前': ['停留刹车................提起', '舱门....................关闭'],
            '推出后': ['停留刹车................放下'],
            '滑行\\起飞前': ['两个引擎................开', '襟翼....................起飞位', '安定面配平..............按需', '飞行操纵................检查'],
            '起飞后': ['起落架...................收上', '襟翼....................收上', '自动驾驶................接通'],
            '巡航': ['自动驾驶仪..............检查', 'FMC面板.................检查'],
            '下降': ['FMC面板.................检查'],
            '进近': ['襟翼....................按需放下', '起落架...................放下', '扰流板...................预位'],
            '着陆后': ['反推....................关', '襟翼....................收上', '扰流板...................压下'],
            '关车': ['停留刹车................开', '两个引擎................关', '舱门....................开']
        }
    };

    // 标题和作者信息
    const titles = {
        'zh-CN': {
            title: 'GeoFS 飞行检查单',
            author: '作者: 開飛機のzm（ZMNB!)',
            opacityLabel: '透明度',
            fontSizeLabel: '字体大小',
            addItemLabel: '添加项目',
            resetLabel: '重置',
            resetConfirm: '你确认清除它们吗？',
            discordLink: '加入我们 Discord 群组',
            lockLabel: '锁定菜单',
            unlockLabel: '菜单已解锁',
            versionLabel: '1.2 版本更新内容',
            versionContent: '1. 按钮改为 L 来打开关闭菜单\n2. 修复了已知 bug\n3. 新增锁定功能，按 Shift + L 解锁菜单'
        }
    };

    // 当前语言
    let currentLang = 'zh-CN';

    // 获取检查单数据
    function getChecklistData(lang) {
        const storedData = localStorage.getItem(`checklist_${lang}`);
        return storedData ? JSON.parse(storedData) : checklist[lang];
    }

    // 保存检查单数据
    function saveChecklistData(lang, data) {
        localStorage.setItem(`checklist_${lang}`, JSON.stringify(data));
    }

    // 获取勾选状态
    function getChecklistState(lang) {
        const storedState = localStorage.getItem(`checklist_state_${lang}`);
        return storedState ? JSON.parse(storedState) : {};
    }

    // 保存勾选状态
    function saveChecklistState(lang, state) {
        localStorage.setItem(`checklist_state_${lang}`, JSON.stringify(state));
    }

    // 创建菜单
    function createMenu() {
        const menu = document.createElement('div');
        menu.style.position = 'fixed';
        menu.style.top = '10px';
        menu.style.left = '10px';
        menu.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        menu.style.padding = '10px';
        menu.style.borderRadius = '5px';
        menu.style.zIndex = '1000';
        menu.style.fontFamily = 'Arial, sans-serif';
        menu.style.color = '#333';
        menu.style.width = '300px';
        menu.style.height = '500px';
        menu.style.overflowY = 'auto';
        menu.style.userSelect = 'none';
        menu.style.display = 'none'; // 默认隐藏

        // 使菜单可拖动
        let isDragging = false;
        let offsetX, offsetY;
        menu.addEventListener('mousedown', (e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
                isDragging = true;
                offsetX = e.clientX - menu.offsetLeft;
                offsetY = e.clientY - menu.offsetTop;
            }
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

        // 标题
        const title = document.createElement('h3');
        title.textContent = titles[currentLang].title;
        title.style.marginBottom = '5px';
        menu.appendChild(title);

        // 作者信息
        const author = document.createElement('p');
        author.textContent = titles[currentLang].author;
        author.style.fontSize = '12px';
        author.style.color = '#666';
        author.style.marginBottom = '10px';
        menu.appendChild(author);

        // 透明度调整
        const opacityLabel = document.createElement('p');
        opacityLabel.textContent = `${titles[currentLang].opacityLabel}: 100%`;
        opacityLabel.style.fontSize = '12px';
        opacityLabel.style.marginBottom = '5px';
        menu.appendChild(opacityLabel);

        const opacitySlider = document.createElement('input');
        opacitySlider.type = 'range';
        opacitySlider.min = '0';
        opacitySlider.max = '100';
        opacitySlider.value = '100';
        opacitySlider.style.width = '100%';
        opacitySlider.style.marginBottom = '10px';
        opacitySlider.addEventListener('input', () => {
            const opacity = opacitySlider.value / 100;
            menu.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
            opacityLabel.textContent = `${titles[currentLang].opacityLabel}: ${opacitySlider.value}%`;
        });
        menu.appendChild(opacitySlider);

        // 字体大小调整
        const fontSizeLabel = document.createElement('p');
        fontSizeLabel.textContent = `${titles[currentLang].fontSizeLabel}: 14px`;
        fontSizeLabel.style.fontSize = '12px';
        fontSizeLabel.style.marginBottom = '5px';
        menu.appendChild(fontSizeLabel);

        const fontSizeSlider = document.createElement('input');
        fontSizeSlider.type = 'range';
        fontSizeSlider.min = '10';
        fontSizeSlider.max = '20';
        fontSizeSlider.value = '14';
        fontSizeSlider.style.width = '100%';
        fontSizeSlider.style.marginBottom = '10px';
        fontSizeSlider.addEventListener('input', () => {
            menu.style.fontSize = `${fontSizeSlider.value}px`;
            fontSizeLabel.textContent = `${titles[currentLang].fontSizeLabel}: ${fontSizeSlider.value}px`;
        });
        menu.appendChild(fontSizeSlider);

        // 检查单内容
        const checklistContainer = document.createElement('div');
        checklistContainer.style.marginTop = '10px';
        menu.appendChild(checklistContainer);

        // 重置按钮
        const resetButton = document.createElement('button');
        resetButton.textContent = titles[currentLang].resetLabel;
        resetButton.style.marginTop = '10px';
        resetButton.style.width = '100%';
        resetButton.style.padding = '5px';
        resetButton.style.backgroundColor = '#ff4444';
        resetButton.style.color = '#fff';
        resetButton.style.border = 'none';
        resetButton.style.borderRadius = '3px';
        resetButton.style.cursor = 'pointer';
        resetButton.addEventListener('click', () => {
            if (confirm(titles[currentLang].resetConfirm)) {
                const lang = currentLang;
                localStorage.removeItem(`checklist_state_${lang}`);
                updateChecklist(lang);
            }
        });
        menu.appendChild(resetButton);

        // 锁定按钮
        const lockButton = document.createElement('button');
        lockButton.textContent = titles[currentLang].lockLabel;
        lockButton.style.marginTop = '10px';
        lockButton.style.width = '100%';
        lockButton.style.padding = '5px';
        lockButton.style.backgroundColor = '#444';
        lockButton.style.color = '#fff';
        lockButton.style.border = 'none';
        lockButton.style.borderRadius = '3px';
        lockButton.style.cursor = 'pointer';
        lockButton.addEventListener('click', () => {
            isLocked = true;
            menu.remove();
            menu = null;
            alert(titles[currentLang].unlockLabel);
        });
        menu.appendChild(lockButton);

        // Discord 群组链接
        const discordLink = document.createElement('p');
        discordLink.innerHTML = `<a href="https://discord.gg/4dGHsNqgCH" target="_blank" style="color: blue; text-decoration: underline;">${titles[currentLang].discordLink}</a>`;
        discordLink.style.fontSize = '12px';
        discordLink.style.color = '#666';
        discordLink.style.marginTop = '10px';
        menu.appendChild(discordLink);

        // 版本更新内容按钮
        const versionButton = document.createElement('button');
        versionButton.textContent = titles[currentLang].versionLabel;
        versionButton.style.marginTop = '10px';
        versionButton.style.width = '100%';
        versionButton.style.padding = '5px';
        versionButton.style.backgroundColor = '#444';
        versionButton.style.color = '#fff';
        versionButton.style.border = 'none';
        versionButton.style.borderRadius = '3px';
        versionButton.style.cursor = 'pointer';
        versionButton.addEventListener('click', () => {
            showVersionPopup(currentLang);
        });
        menu.appendChild(versionButton);

        // 更新检查单内容
        function updateChecklist(lang) {
            checklistContainer.innerHTML = '';
            const data = getChecklistData(lang);
            const state = getChecklistState(lang);

            for (const [section, items] of Object.entries(data)) {
                const sectionTitle = document.createElement('h4');
                sectionTitle.textContent = section;
                sectionTitle.style.marginBottom = '5px';
                checklistContainer.appendChild(sectionTitle);

                const sectionContainer = document.createElement('div');
                sectionContainer.style.marginBottom = '10px';

                items.forEach((item, index) => {
                    const itemContainer = document.createElement('div');
                    itemContainer.style.display = 'flex';
                    itemContainer.style.alignItems = 'center';
                    itemContainer.style.marginBottom = '5px';

                    // 打勾功能
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.style.marginRight = '10px';
                    checkbox.checked = state[`${section}_${index}`] || false;
                    checkbox.addEventListener('change', () => {
                        state[`${section}_${index}`] = checkbox.checked;
                        saveChecklistState(lang, state);
                    });
                    itemContainer.appendChild(checkbox);

                    const itemText = document.createElement('span');
                    itemText.textContent = item;
                    itemContainer.appendChild(itemText);

                    sectionContainer.appendChild(itemContainer);
                });

                checklistContainer.appendChild(sectionContainer);
            }
        }

        // 初始加载当前语言
        updateChecklist(currentLang);

        document.body.appendChild(menu);
        return menu;
    }

    // 显示版本更新内容弹窗
    function showVersionPopup(lang) {
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        popup.style.padding = '20px';
        popup.style.borderRadius = '10px';
        popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        popup.style.width = '400px';
        popup.style.maxHeight = '80vh';
        popup.style.overflowY = 'auto';
        popup.style.fontFamily = 'Arial, sans-serif';
        popup.style.color = '#333';
        popup.style.zIndex = '1001';

        // 弹窗标题
        const popupTitle = document.createElement('h3');
        popupTitle.textContent = titles[lang].versionLabel;
        popupTitle.style.marginBottom = '10px';
        popup.appendChild(popupTitle);

        // 弹窗内容
        const popupContent = document.createElement('p');
        popupContent.textContent = titles[lang].versionContent;
        popupContent.style.whiteSpace = 'pre-line';
        popup.appendChild(popupContent);

        // 关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.style.marginTop = '10px';
        closeButton.style.width = '100%';
        closeButton.style.padding = '5px';
        closeButton.style.backgroundColor = '#444';
        closeButton.style.color = '#fff';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '3px';
        closeButton.style.cursor = 'pointer';
        closeButton.addEventListener('click', () => {
            popup.remove();
            overlay.remove();
        });
        popup.appendChild(closeButton);

        // 添加到页面
        document.body.appendChild(popup);

        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '1000';
        overlay.addEventListener('click', () => {
            popup.remove();
            overlay.remove();
        });
        document.body.appendChild(overlay);
    }

    // 创建检查单按钮
    const checklistButton = document.createElement('button');
    checklistButton.innerText = '飞行检查单';
    checklistButton.style.position = 'fixed';
    checklistButton.style.bottom = '20px';
    checklistButton.style.left = '20px';
    checklistButton.style.backgroundColor = '#1DB954';
    checklistButton.style.color = '#fff';
    checklistButton.style.border = 'none';
    checklistButton.style.borderRadius = '25px';
    checklistButton.style.padding = '10px 20px';
    checklistButton.style.cursor = 'pointer';
    checklistButton.addEventListener('click', () => {
        const menu = createMenu();
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });

    document.body.appendChild(checklistButton);
})();
