(function () {
  'use strict';

  // 加载JSON文件
  const jsonUrl = "https://raw.githubusercontent.com/Bilibilizm/GeoFS-zms-fans-addon/main/data.json";

  // 插件界面HTML
  const pluginHTML = `
    <div id="zm-plugin" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); z-index: 1000;">
      <h2 style="text-align: center; margin-bottom: 20px;">GeoFS-zm粉丝专属插件</h2>
      <div id="update-content" style="margin-bottom: 20px;"></div>
      <div>
        <h3>活动</h3>
        <button id="members-btn" style="margin-right: 10px;">会员</button>
        <button id="rankings-btn">排行榜</button>
      </div>
      <div style="margin-top: 20px;">
        <h3>插件</h3>
        <div id="plugins-list"></div>
      </div>
    </div>
  `;

  // 会员列表HTML
  const membersHTML = `
    <div id="members-modal" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); z-index: 1001;">
      <h3 style="text-align: center;">会员列表</h3>
      <ul id="members-list" style="list-style: none; padding: 0;"></ul>
      <p style="text-align: center; font-size: 12px; color: #666;">如要加入会员请私信zm添加！</p>
      <button id="close-members" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 16px; cursor: pointer;">×</button>
    </div>
  `;

  // 排行榜HTML
  const rankingsHTML = `
    <div id="rankings-modal" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); z-index: 1001;">
      <h3 style="text-align: center;">会员排行榜</h3>
      <table id="rankings-table" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px;">排名</th>
            <th style="border: 1px solid #ddd; padding: 8px;">会员</th>
            <th style="border: 1px solid #ddd; padding: 8px;">积分</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
      <button id="close-rankings" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 16px; cursor: pointer;">×</button>
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

  // 打开插件界面
  document.addEventListener("keydown", (e) => {
    if (e.key === "k" || e.key === "K") {
      plugin.style.display = "block";
      fetchData();
    }
  });

  // 关闭插件界面
  document.addEventListener("click", (e) => {
    if (e.target === plugin || e.target.id === "close-members" || e.target.id === "close-rankings") {
      plugin.style.display = "none";
      membersModal.style.display = "none";
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
        membersList.innerHTML = data.members.map((member) => `<li>${member.name}</li>`).join("");

        // 排行榜
        const rankingsTable = document.getElementById("rankings-table").querySelector("tbody");
        rankingsTable.innerHTML = data.rankings
          .sort((a, b) => b.score - a.score)
          .map((member, index) => `<tr><td>${index + 1}</td><td>${member.name}</td><td>${member.score}</td></tr>`)
          .join("");

        // 插件列表
        const pluginsList = document.getElementById("plugins-list");
        pluginsList.innerHTML = data.plugins
          .map((plugin) => `<button onclick="loadScript('${plugin.url}')">${plugin.name}</button>`)
          .join("");
      });
  }

  // 加载插件脚本
  function loadScript(url) {
    const script = document.createElement("script");
    script.src = url;
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
