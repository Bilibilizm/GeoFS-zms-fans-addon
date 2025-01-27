(function () {
    'use strict';

    // 锁定状态
    let isLocked = false;

    // 锁定快捷键
    function lockShortcuts() {
        document.addEventListener('keydown', preventDefault, true);
        document.addEventListener('keyup', preventDefault, true);
        document.addEventListener('keypress', preventDefault, true);
        isLocked = true;

        // 创建解锁按钮
        const unlockButton = document.createElement('button');
        unlockButton.textContent = '解锁快捷键';
        unlockButton.style.position = 'fixed';
        unlockButton.style.top = '20px';
        unlockButton.style.left = '20px';
        unlockButton.style.zIndex = '1000';
        unlockButton.style.padding = '10px 20px';
        unlockButton.style.backgroundColor = '#dc3545';
        unlockButton.style.color = '#FFF';
        unlockButton.style.border = 'none';
        unlockButton.style.borderRadius = '5px';
        unlockButton.style.cursor = 'pointer';
        unlockButton.style.fontSize = '14px';
        unlockButton.style.transition = 'background-color 0.3s';
        unlockButton.addEventListener('mouseenter', () => {
            unlockButton.style.backgroundColor = '#a71d2a';
        });
        unlockButton.addEventListener('mouseleave', () => {
            unlockButton.style.backgroundColor = '#dc3545';
        });
        unlockButton.addEventListener('click', () => {
            unlockShortcuts();
            document.body.removeChild(unlockButton);
        });
        document.body.appendChild(unlockButton);
    }

    // 解锁快捷键
    function unlockShortcuts() {
        document.removeEventListener('keydown', preventDefault, true);
        document.removeEventListener('keyup', preventDefault, true);
        document.removeEventListener('keypress', preventDefault, true);
        isLocked = false;
    }

    // 阻止默认键盘事件
    function preventDefault(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // 监听 Z 键点击事件
    document.addEventListener('keydown', (e) => {
        if (e.key === 'z' || e.key === 'Z') {
            if (!isLocked) {
                lockShortcuts();
            }
        }
    });
})();
