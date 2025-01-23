(function () {
  'use strict';

  // JSON文件路径
  const jsonUrl = "https://raw.githubusercontent.com/Bilibilizm/GeoFS-zms-fans-addon/main/data.json";

  // 插件界面HTML
  const pluginHTML = `
    <div id="zm-plugin" style="display: none; position: fixed; top: 20px; right: 20px; width: 300px; background: rgba(255, 255, 255, 0.9); border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); z-index: 1000; font-family: Arial, sans-serif; overflow: hidden;">
      <div id="zm-plugin-header" style="padding: 10px; background: #007bff; color: white; font-size: 16px; font-weight: bold; cursor: move; border-top-left-radius: 10px; border-top-right-radius: 10px;">
        GeoFS-zm粉丝专属插件
      </div>
      <div style="padding: 10px;">
        <div id="update-content" style="margin-bottom: 20px; font-size: 14px; color: #333;"></div>
        <div>
          <h3 style="font-size: 16px; margin-bottom: 10px;">活动</h3>
          <button id="members-btn" style="margin-right: 10px; padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">会员</button>
          <button id="rankings-btn" style="padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">排行榜</button>
        </div>
        <div style="margin-top: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;">插件</h3>
          <div id="plugins-list"></div>
        </div>
      </div>
    </div>
  `;

  // 会员列表HTML
  const membersHTML = `
    <div id="members-modal" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 300px; background: rgba(255, 255, 255, 0.95); border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); z-index: 1001; font-family: Arial, sans-serif;">
      <div style="padding: 10px; background: #007bff; color: white; font-size: 16px; font-weight: bold; border-top-left-radius: 10px; border-top-right-radius: 10px;">
        会员列表
        <button id="close-members" style="float: right; background: none; border: none; color: white; font-size: 16px; cursor: pointer;">×</button>
      </div>
      <div style="padding: 10px;">
        <ul id="members-list" style="list-style: none; padding: 0; margin: 0;"></ul>
        <p style="text-align: center; font-size: 12px; color: #666; margin-top: 10px;">如要加入会员请私信zm添加！</p>
      </div>
    </div>
  `;

  // 排行榜HTML
  const rankingsHTML = `
    <div id="rankings-modal" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 300px; background: rgba(255, 255, 255, 0.95); border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); z-index: 1001; font-family: Arial, sans-serif;">
      <div style="padding: 10px; background: #007bff; color: white; font-size: 16px; font-weight: bold; border-top-left-radius: 10px; border-top-right-radius: 10px;">
        会员排行榜
        <button id="close-rankings" style="float: right; background: none; border: none; color: white; font-size: 16px; cursor: pointer;">×</button>
      </div>
      <div style="padding: 10px;">
        <table id="rankings-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background: #f1f1f1;">排名</th>
              <th style="border: 1px solid #ddd; padding: 8px; background: #f1f1f1;">会员</th>
              <th style="border: 1px solid #ddd; padding: 8px; background: #f1f1f1;">积分</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  `;

  // 插入HTML到页面
  document.body.insertAdjacentHTML("beforeend", pluginHTML);
  document.body.insertAdjacentHTML("beforeend", membersHTML);
  document.body.insertAdjacentHTML("beforeend", rankingsHTML);

  // 获取元素
  const plugin = document.getElementById("zm-plugin");
  const membersModal = document.getElementById("members-modal");
  const rankingsModal = document.getElementById("rankings-modal");
  const pluginHeader = document.getElementById("zm-plugin-header");

  // 插件界面拖动功能
  let isDragging = false;
  let offsetX, offsetY;

  pluginHeader.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - plugin.getBoundingClientRect().left;
    offsetY = e.clientY - plugin.getBoundingClientRect().top;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      plugin.style.left = `${e.clientX - offsetX}px`;
      plugin.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // 打开/关闭插件界面
  document.addEventListener("keydown", (e) => {
    if (e.key === "k" || e.key === "K") {
      plugin.style.display = plugin.style.display === "none" ? "block" : "none";
      if (plugin.style.display === "block") {
        fetchData();
      }
    }
  });

  // 关闭会员列表和排行榜
  document.addEventListener("click", (e) => {
    if (e.target.id === "close-members") {
      membersModal.style.display = "none";
    }
    if (e.target.id === "close-rankings") {
      rankingsModal.style.display = "none";
    }
  });

  // 加载JSON数据
  function fetchData() {
    fetch(jsonUrl)
      .then((response) => response.json())
      .then((data) => {
        // 更新内容
        document.getElementById("update-content").innerText = data.update;

        // 会员列表
        const membersList = document.getElementById("members-list");
        membersList.innerHTML = data.members.map((member) => `<li style="padding: 5px 0; border-bottom: 1px solid #eee;">${member.name}</li>`).join("");

        // 排行榜
        const rankingsTable = document.getElementById("rankings-table").querySelector("tbody");
        rankingsTable.innerHTML = data.rankings
          .sort((a, b) => b.score - a.score)
          .map((member, index) => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index + 1}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${member.name}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${member.score}</td>
            </tr>
          `)
          .join("");

        // 插件列表
        const pluginsList = document.getElementById("plugins-list");
        if (data.plugins && data.plugins.length > 0 && data.plugins[0].plugins) {
            pluginsList.innerHTML = data.plugins[0].plugins
                .map((plugin) => `
                    <button onclick="loadScript('${plugin.url}')" style="display: block; width: 100%; padding: 5px 10px; margin-bottom: 5px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        ${plugin.name}
                    </button>
                `)
                .join("");
        } else {
            pluginsList.innerHTML = `<p style="color: red;">插件数据加载失败，请检查 JSON 文件结构。</p>`;
        }
      })
      .catch((error) => {
        console.error("Error fetching JSON:", error);
        document.getElementById("update-content").innerText = "加载失败，请检查网络连接或 JSON 文件路径。";
      });
  }

  // 加载插件脚本
  function loadScript(url) {
    const script = document.createElement("script");
    script.src = url;
    script.onload = () => {
      console.log(`插件 ${url} 加载成功`);
    };
    script.onerror = () => {
      console.error(`插件 ${url} 加载失败，请检查 URL 是否正确`);
    };
    document.body.appendChild(script);
  }

  // 打开会员列表
  document.getElementById("members-btn").addEventListener("click", () => {
    membersModal.style.display = "block";
  });

  // 打开排行榜
  document.getElementById("rankings-btn").addEventListener("click", () => {
    rankingsModal.style.display = "block";
  });
})();
