const githubRepo = 'https://raw.githubusercontent.com/kolos26/GEOFS-LiverySelector/main';
const version = '3.2.0';

const liveryobj = {};
const mpLiveryIds = {};
const mLiveries = {};
const origHTMLs = {};
const uploadHistory = JSON.parse(localStorage.lsUploadHistory || '{}');
const liveryIdOffset = 10e3;
const mlIdOffset = 1e3;
let links = [];
let airlineobjs = [];
let whitelist;

(function init() {
    // 样式
    fetch(`${githubRepo}/styles.css?` + Date.now()).then(async data => {
        const styleTag = createTag('style', { type: 'text/css' });
        styleTag.innerHTML = await data.text();
        document.head.appendChild(styleTag);
    });
    appendNewChild(document.head, 'link', { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css' });

    // 列表面板
    const listDiv = appendNewChild(document.querySelector('.geofs-ui-left'), 'div', {
        id: 'listDiv',
        class: 'geofs-list geofs-toggle-panel livery-list',
        'data-noblur': 'true',
        'data-onshow': '{geofs.initializePreferencesPanel()}',
        'data-onhide': '{geofs.savePreferencesPanel()}'
    });
    listDiv.innerHTML = generateListHTML();

    // 面板按钮
    const geofsUiButton = document.querySelector('.geofs-ui-bottom');
    const insertPos = geofs.version >= 3.6 ? 4 : 3;
    geofsUiButton.insertBefore(generatePanelButtonHTML(), geofsUiButton.children[insertPos]);

    // 删除原始按钮
    const origButtons = document.getElementsByClassName('geofs-liveries geofs-list-collapsible-item');
    Object.values(origButtons).forEach(btn => btn.parentElement.removeChild(btn));

    // 加载涂装（@todo: 考虑移动到listLiveries）
    fetch(`${githubRepo}/livery.json?` + Date.now()).then(handleLiveryJson);

    // 初始化航空公司数据库
    if (localStorage.getItem('links') === null) {
        localStorage.links = '';
    } else {
        links = localStorage.links.split(",");
        links.forEach(async function (e) {
            await fetch(e).then(res => res.json()).then(data => airlineobjs.push(data));
            airlineobjs[airlineobjs.length - 1].url = e.trim();
        });
    }
    fetch(`${githubRepo}/whitelist.json?` + Date.now()).then(res => res.json()).then(data => whitelist = data);

    // 开始多人游戏
    setInterval(updateMultiplayer, 5000);
})();

/**
 * @param {Response} data
 */
async function handleLiveryJson(data) {
    const json = await data.json();
    Object.keys(json).forEach(key => liveryobj[key] = json[key]);

    if (liveryobj.version != version) {
        document.querySelector('.livery-list h3').appendChild(
            createTag('a', {
                href: 'https://github.com/kolos26/GEOFS-LiverySelector',
                target: '_blank',
                style: 'display:block;width:100%;text-decoration:none;text-align:center;'
            }, '有可用更新：' + liveryobj.version)
        );
    }
    // 为有涂装的飞机标记图标
    Object.keys(liveryobj.aircrafts).forEach(aircraftId => {
        if (liveryobj.aircrafts[aircraftId].liveries.length < 2) {
            return; // 只有当涂装数量超过一个时才显示图标
        }
        const element = document.querySelector(`[data-aircraft='${aircraftId}']`);
        // 保存原始HTML以便后续使用（重新加载、更换飞机等）
        if (!origHTMLs[aircraftId]) {
            origHTMLs[aircraftId] = element.innerHTML;
        }

        // 使用原始HTML进行拼接，确保只显示一个图标
        element.innerHTML = origHTMLs[aircraftId] +
            createTag('img', {
                src: `${githubRepo}/liveryselector-logo-small.svg`,
                style: 'height:30px;width:auto;margin-left:20px;',
                title: '有可用的涂装'
            }).outerHTML;

        if (liveryobj.aircrafts[aircraftId].mp != "disabled")
            element.innerHTML += createTag('small', {
                title: '涂装在多人游戏中兼容\n（其他玩家可见）'
            }, '支持其他玩家看到你的涂装').outerHTML;
    });
}

/**
 * 触发GeoFS API加载纹理
 *
 * @param {string[]} texture
 * @param {number[]} index
 * @param {number[]} parts
 * @param {Object[]} mats
 */
function loadLivery(texture, index, parts, mats) {
    // 更改涂装
    for (let i = 0; i < texture.length; i++) {
        const model3d = geofs.aircraft.instance.definition.parts[parts[i]]['3dmodel'];
        // 检查材质定义（对于未贴图的部分）
        if (typeof texture[i] === 'object') {
            if (texture[i].material !== undefined) {
                const mat = mats[texture[i].material];
                model3d._model.getMaterial(mat.name)
                    .setValue('diffuse', new Cesium.Cartesian4(...mat.diffuse, 1.0));
            }
            continue;
        }
        if (geofs.version == 2.9) {
            geofs.api.Model.prototype.changeTexture(texture[i], index[i], model3d);
        } else if (geofs.version >= 3.0 && geofs.version <= 3.7) {
            geofs.api.changeModelTexture(model3d._model, texture[i], index[i]);
        } else {
            geofs.api.changeModelTexture(model3d._model, texture[i], { index: index[i] });
        }
    }
}

/**
 * 从文本输入字段加载涂装
 */
function inputLivery() {
    const airplane = getCurrentAircraft();
    const textures = airplane.liveries[0].texture;
    const inputFields = document.getElementsByName('textureInput');
    if (textures.filter(x => x === textures[0]).length === textures.length) { // 所有索引和部分使用相同的纹理
        const texture = inputFields[0].value;
        loadLivery(Array(textures.length).fill(texture), airplane.index, airplane.parts);
    } else {
        const texture = [];
        inputFields.forEach(e => texture.push(e.value));
        loadLivery(texture, airplane.index, airplane.parts);
    }
}

/**
 * 提交涂装进行审核
 */
function submitLivery() {
    const airplane = getCurrentAircraft();
    const textures = airplane.liveries[0].texture;
    const inputFields = document.getElementsByName('textureInput');
    const formFields = {};
    document.querySelectorAll('.livery-submit input').forEach(f => formFields[f.id.replace('livery-submit-', '')] = f);
    if (!localStorage.liveryDiscordId || localStorage.liveryDiscordId.length < 6) {
        return alert('无效的Discord用户ID！');
    }
    if (formFields.liveryname.value.trim().length < 3) {
        return alert('无效的涂装名称！');
    }
    if (!formFields['confirm-perms'].checked || !formFields['confirm-legal'].checked) {
        return alert('请确认所有复选框！');
    }
    const json = {
        name: formFields.liveryname.value.trim(),
        credits: formFields.credits.value.trim(),
        texture: []
    };
    if (!json.name || json.name.trim() == '') {
        return;
    }
    const hists = [];
    const embeds = [];
    inputFields.forEach((f, i) => {
        f.value = f.value.trim();
        if (f.value.match(/^https:\/\/.+/i)) {
            const hist = Object.values(uploadHistory).find(o => o.url == f.value);
            if (!hist) {
                return alert('只有自己上传的imgbb链接才能提交！');
            }
            if (hist.expiration > 0) {
                return alert('不能提交会过期的链接！请禁用“一小时后过期链接”选项并重新上传纹理：\n' + airplane.labels[i]);
            }
            const embed = {
                title: airplane.labels[i] + ' (' + (Math.ceil(hist.size / 1024 / 10.24) / 100) + 'MB, ' + hist.width + 'x' + hist.height + ')',
                description: f.value,
                image: { url: f.value },
                fields: [
                    { name: '时间戳', value: new Date(hist.time * 1e3), inline: true },
                    { name: '文件ID', value: hist.id, inline: true },
                ]
            };
            if (hist.submitted) {
                if (!confirm('以下纹理已经提交过：\n' + f.value + '\n是否继续？')) {
                    return;
                }
                embed.fields.push({ name: '首次提交', value: new Date(hist.submitted * 1e3) });
            }
            embeds.push(embed);
            hists.push(hist);
            json.texture.push(f.value);
        } else {
            json.texture.push(textures[i]);
        }
    });
    if (!embeds.length)
        return alert('没有可提交的内容，请先上传图片！');

    let content = [
        `涂装上传用户：<@${localStorage.liveryDiscordId}>`,
        `__飞机：__ \`${geofs.aircraft.instance.id}\` ${geofs.aircraft.instance.aircraftRecord.name}`,
        `__涂装名称：__ \`${json.name}\``,
        '```json\n' + JSON.stringify(json, null, 2) + '```'
    ];

    fetch(atob(liveryobj.dapi), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.join('\n'), embeds })
    }).then(res => {
        hists.forEach(hist => {
            hist.submitted = hist.submitted || Math.round(new Date() / 1000);
        });
        localStorage.lsUploadHistory = JSON.stringify(uploadHistory);
    });
}

function sortList(id) {
    const list = domById(id);
    let i, switching, b, shouldSwitch;
    switching = true;
    while (switching) {
        switching = false;
        b = list.getElementsByTagName('LI');
        for (i = 0; i < (b.length - 1); i++) {
            shouldSwitch = false;
            if (b[i].innerHTML.toLowerCase() > b[i + 1].innerHTML.toLowerCase()) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            b[i].parentNode.insertBefore(b[i + 1], b[i]);
            switching = true;
        }
    }
}

/**
 * 主涂装列表
 */
function listLiveries() {
    domById('liverylist').innerHTML = '';

    const thumbsDir = [githubRepo, 'thumbs'].join('/');
    const defaultThumb = [thumbsDir, geofs.aircraft.instance.id + '.png'].join('/');
    const airplane = getCurrentAircraft();
    airplane.liveries.forEach(function (e, idx) {
        if (e.disabled) return;
        let listItem = appendNewChild(domById('liverylist'), 'li', {
            id: [geofs.aircraft.instance.id, e.name, 'button'].join('_'),
            class: 'livery-list-item'
        });
        listItem.dataset.idx = idx;
        listItem.onclick = () => {
            loadLivery(e.texture, airplane.index, airplane.parts, e.materials);
            if (e.mp != 'disabled') {
                // 使用原版ID以保持与基础游戏兼容
                setInstanceId(idx + (e.credits?.toLowerCase() == 'geofs' ? '' : liveryIdOffset));
            }
        };
        listItem.innerHTML = createTag('span', { class: 'livery-name' }, e.name).outerHTML;
        if (geofs.aircraft.instance.id < 1000) {
            listItem.classList.add('offi');
            const thumb = createTag('img');
            thumb.onerror = () => {
                thumb.onerror = null;
                thumb.src = defaultThumb;
            };
            thumb.src = [thumbsDir, geofs.aircraft.instance.id, geofs.aircraft.instance.id + '-' + idx + '.png'].join('/');
            listItem.appendChild(thumb);
        } else {
            listItem.classList.remove('offi');
        }
        if (e.credits && e.credits.length) {
            listItem.innerHTML += `<small>作者：${e.credits}</small>`;
        }

        appendNewChild(listItem, 'span', {
            id: [geofs.aircraft.instance.id, e.name].join('_'),
            class: 'fa fa-star nocheck',
            onclick: 'LiverySelector.star(this)'
        });
    });
    sortList('liverylist');
    loadFavorites();
    sortList('favorites');
    loadAirlines();
    addCustomForm();
}

function loadFavorites() {
    if (localStorage.getItem('favorites') === null) {
        localStorage.favorites = '';
    }
    domById('favorites').innerHTML = '';
    const list = localStorage.favorites.split(',');
    const airplane = geofs.aircraft.instance.id;
    list.forEach(function (e) {
        if ((airplane == e.slice(0, airplane.length)) && (e.charAt(airplane.length) == '_')) {
            star(domById(e));
        }
    });
}

function loadAirlines() {
    domById("airlinelist").innerHTML = '';
    const airplane = getCurrentAircraft();
    const textures = airplane.liveries[0].texture;
    airlineobjs.forEach(function (airline) {
        let airlinename = appendNewChild(domById('airlinelist'), 'li', {
            style: "color:" + airline.color + ";background-color:" + airline.bgcolor + "; font-weight: bold;"
        });
        airlinename.innerText = airline.name;
        let removebtn = appendNewChild(airlinename, "button", {
            class: "mdl-button mdl-js-button mdl-button--raised mdl-button",
            style: "float: right; margin-top: 6px; background-color: #9e150b;",
            onclick: `LiverySelector.removeAirline("${airline.url}")`
        });
        removebtn.innerText = "- 删除航空公司";
        airline.aircrafts[geofs.aircraft.instance.id].liveries.forEach(function (e) {
            let listItem = appendNewChild(domById('airlinelist'), 'li', {
                id: [geofs.aircraft.instance.id, e.name, 'button'].join('_'),
                class: 'livery-list-item'
            });
            if (textures.filter(x => x === textures[0]).length === textures.length) { // 所有索引和部分使用相同的纹理
                const texture = e.texture[0];
                listItem.onclick = () => {
                    loadLivery(Array(textures.length).fill(texture), airplane.index, airplane.parts);
                    if (airplane.mp != 'disabled' && whitelist.includes(airline.url.trim())) {
                        setInstanceId(texture);
                    }
                }
            } else {
                listItem.onclick = () => {
                    let textureIndex = airplane.labels.indexOf("Texture");
                    loadLivery(e.texture, airplane.index, airplane.parts);
                    if (airplane.mp != 'disabled' && whitelist.includes(airline.url.trim())) {
                        setInstanceId(e.texture[textureIndex]);
                    }
                }
            }
            listItem.innerHTML = createTag('span', { class: 'livery-name' }, e.name).outerHTML;
            if (e.credits && e.credits.length) {
                listItem.innerHTML += `<small>作者：${e.credits}</small>`;
            }
        });
    });
}

function addCustomForm() {
    document.querySelector('#livery-custom-tab-upload .upload-fields').innerHTML = '';
    document.querySelector('#livery-custom-tab-direct .upload-fields').innerHTML = '';
    const airplane = getCurrentAircraft();
    const textures = airplane.liveries[0].texture.filter(t => typeof t !== 'object');
    if (!textures.length) {
        return; // 忽略材质定义
    }
    const placeholders = airplane.labels;
    if (textures.filter(x => x === textures[0]).length === textures.length) { // 所有索引和部分使用相同的纹理
        createUploadButton(placeholders[0]);
        createDirectButton(placeholders[0]);
    } else {
        placeholders.forEach((placeholder, i) => {
            createUploadButton(placeholder);
            createDirectButton(placeholder, i);
        });
    }
    // 点击第一个标签以刷新按钮状态
    document.querySelector('.livery-custom-tabs li').click();
}

function search(text) {
    if (text === '') {
        listLiveries();
    } else {
        const liveries = domById('liverylist').childNodes;
        liveries.forEach(function (e) {
            const found = e.innerText.toLowerCase().includes(text.toLowerCase());
            e.style.display = found ? 'block' : 'none';
        });
    }
}

/**
 * 标记为收藏
 *
 * @param {HTMLElement} element
 */
function star(element) {
    const e = element.classList;
    const elementId = [element.id, 'favorite'].join('_');
    if (e == 'fa fa-star nocheck') {
        const btn = domById([element.id, 'button'].join('_'));
        const fbtn = appendNewChild(domById('favorites'), 'li', { id: elementId, class: 'livery-list-item' });
        fbtn.onclick = btn.onclick;
        fbtn.innerText = btn.children[0].innerText;

        let list = localStorage.favorites.split(',');
        list.push(element.id);
        list = [...new Set(list)];
        localStorage.favorites = list;

    } else if (e == 'fa fa-star checked') {
        domById('favorites').removeChild(domById(elementId));
        const list = localStorage.favorites.split(',');
        const index = list.indexOf(element.id);
        if (index !== -1) {
            list.splice(index, 1);
        }
        localStorage.favorites = list;
    }
    // 样式动画
    e.toggle('checked');
    e.toggle('nocheck');
}

/**
 * @param {string} id
 */
function createUploadButton(id) {
    const customDiv = document.querySelector('#livery-custom-tab-upload .upload-fields');
    appendNewChild(customDiv, 'input', {
        type: 'file',
        onchange: 'LiverySelector.uploadLivery(this)'
    });
    appendNewChild(customDiv, 'input', {
        type: 'text',
        name: 'textureInput',
        class: 'mdl-textfield__input address-input',
        placeholder: id,
        id: id
    });
    appendNewChild(customDiv, 'br');
}

/**
 * @param {string} id
 * @param {number} i
 */
function createDirectButton(id, i) {
    const customDiv = document.querySelector('#livery-custom-tab-direct .upload-fields');
    appendNewChild(customDiv, 'input', {
        type: 'file',
        onchange: 'LiverySelector.loadLiveryDirect(this,' + i + ')'
    });
    appendNewChild(customDiv, 'span').innerHTML = id;
    appendNewChild(customDiv, 'br');
}

/**
 * @param {HTMLInputElement} fileInput
 * @param {number} i
 */
function loadLiveryDirect(fileInput, i) {
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
        const airplane = getCurrentAircraft();
        const textures = airplane.liveries[0].texture;
        const newTexture = event.target.result;
        if (i === undefined) {
            loadLivery(Array(textures.length).fill(newTexture), airplane.index, airplane.parts);
        } else {
            geofs.api.changeModelTexture(
                geofs.aircraft.instance.definition.parts[airplane.parts[i]]["3dmodel"]._model,
                newTexture,
                { index: airplane.index[i] }
            );
        }
        fileInput.value = null;
    });
    // 读取文件（如果存在）
    fileInput.files.length && reader.readAsDataURL(fileInput.files[0]);
}

/**
 * @param {HTMLInputElement} fileInput
 */
function uploadLivery(fileInput) {
    if (!fileInput.files.length)
        return;
    if (!localStorage.imgbbAPIKEY) {
        alert('未保存imgbb API密钥！请检查API标签');
        fileInput.value = null;
        return;
    }
    const form = new FormData();
    form.append('image', fileInput.files[0]);
    if (localStorage.liveryAutoremove)
        form.append('expiration', (new Date() / 1000) * 60 * 60);

    const settings = {
        'url': `https://api.imgbb.com/1/upload?key=${localStorage.imgbbAPIKEY}`,
        'method': 'POST',
        'timeout': 0,
        'processData': false,
        'mimeType': 'multipart/form-data',
        'contentType': false,
        'data': form
    };

    $.ajax(settings).done(function (response) {
        const jx = JSON.parse(response);
        console.log(jx.data.url);
        fileInput.nextSibling.value = jx.data.url;
        fileInput.value = null;
        if (!uploadHistory[jx.data.id] || (uploadHistory[jx.data.id].expiration !== jx.data.expiration)) {
            uploadHistory[jx.data.id] = jx.data;
            localStorage.lsUploadHistory = JSON.stringify(uploadHistory);
        }
    });
}

function handleCustomTabs(e) {
    e = e || window.event;
    const src = e.target || e.srcElement;
    const tabId = src.innerHTML.toLocaleLowerCase();
    // 遍历所有div并检查是否是点击的那一个，隐藏其他
    domById('customDiv').querySelectorAll(':scope > div').forEach(tabDiv => {
        if (tabDiv.id != ['livery-custom-tab', tabId].join('-')) {
            tabDiv.style.display = 'none';
            return;
        }
        tabDiv.style.display = '';
        // 每个标签的特殊处理，可以提取出来
        switch (tabId) {
            case 'upload': {
                const fields = tabDiv.querySelectorAll('input[type="file"]');
                fields.forEach(f => localStorage.imgbbAPIKEY ? f.classList.remove('err') : f.classList.add('err'));
                const apiKeys = !!localStorage.liveryDiscordId && !!localStorage.imgbbAPIKEY;
                tabDiv.querySelector('.livery-submit .api').style.display = apiKeys ? '' : 'none';
                tabDiv.querySelector('.livery-submit .no-api').style.display = apiKeys ? 'none' : '';
            } break;

            case 'download': {
                reloadDownloadsForm(tabDiv);
            } break;

            case 'api': {
                reloadSettingsForm();
            } break;
        }
    });

}

/**
 * 重新加载当前飞机的纹理文件
 *
 * @param {HTMLElement} tabDiv
 */
function reloadDownloadsForm(tabDiv) {
    const airplane = getCurrentAircraft();
    const liveries = airplane.liveries;
    const defaults = liveries[0];
    const fields = tabDiv.querySelector('.download-fields');
    fields.innerHTML = '';
    liveries.forEach((livery, liveryNo) => {
        const textures = livery.texture.filter(t => typeof t !== 'object');
        if (!textures.length) return; // 忽略材质定义
        appendNewChild(fields, 'h7').innerHTML = livery.name;
        const wrap = appendNewChild(fields, 'div');
        textures.forEach((href, i) => {
            if (typeof href === 'object') return;
            if (liveryNo > 0 && href == defaults.texture[i]) return;
            const link = appendNewChild(wrap, 'a', { href, target: '_blank',
                class: "mdl-button mdl-button--raised mdl-button--colored"
            });
            link.innerHTML = airplane.labels[i];
        });
    });
}

/**
 * 重新加载设置表单
 */
function reloadSettingsForm() {
    const apiInput = domById('livery-setting-apikey');
    apiInput.placeholder = localStorage.imgbbAPIKEY ?
        'API 密钥已保存 ✓ (输入 CLEAR 以删除)' :
        '在此输入 API 密钥';

    const removeCheckbox = domById('livery-setting-remove');
    removeCheckbox.checked = (localStorage.liveryAutoremove == 1);

    const discordInput = domById('livery-setting-discordid');
    discordInput.value = localStorage.liveryDiscordId || '';
}

/**
 * 保存设置，从事件元素获取设置键
 *
 * @param {HTMLElement} element
 */
function saveSetting(element) {
    const id = element.id.replace('livery-setting-', '');
    switch (id) {
        case 'apikey': {
            if (element.value.length) {
                if (element.value.trim().toLowerCase() == 'clear') {
                    delete localStorage.imgbbAPIKEY;
                } else {
                    localStorage.imgbbAPIKEY = element.value.trim();
                }
                element.value = '';
            }
        } break;

        case 'remove': {
            localStorage.liveryAutoremove = element.checked ? '1' : '0';
        } break;

        case 'discordid': {
            localStorage.liveryDiscordId = element.value.trim();
        } break;
    }
    reloadSettingsForm();
}

async function addAirline() {
    let url = prompt("输入航空公司的json文件URL:");
    if (!links.includes(url)) {
        links.push(url);
        localStorage.links += `,${url}`;
        await fetch(url).then(res => res.json()).then(data => airlineobjs.push(data));
        airlineobjs[airlineobjs.length - 1].url = url.trim();
        loadAirlines();
    } else {
        alert("航空公司已添加");
    }
}

function removeAirline(url) {
    removeItem(links, url.trim());
    localStorage.links = links.toString();
    airlineobjs.forEach(function (e, index) {
        if (e.url.trim() === url.trim()) {
            airlineobjs.splice(index, 1);
        }
    });
    loadAirlines();
}

/**
 * @returns {object} 当前飞机从liveryobj
 */
function getCurrentAircraft() {
    return liveryobj.aircrafts[geofs.aircraft.instance.id];
}

function setInstanceId(id) {
    geofs.aircraft.instance.liveryId = id;
}

function updateMultiplayer() {
    Object.values(multiplayer.visibleUsers).forEach(u => {
        const liveryEntry = liveryobj.aircrafts[u.aircraft];
        let textures = [];
        let otherId = u.currentLivery;
        if (!liveryEntry || !u.model || liveryEntry.mp == 'disabled') {
            return; // 没有涂装或已禁用
        }
        if (mpLiveryIds[u.id] === otherId) {
            return; // 已更新
        }
        mpLiveryIds[u.id] = otherId;
        if (otherId >= mlIdOffset && otherId < liveryIdOffset) {
            textures = getMLTexture(u, liveryEntry); // ML范围 1k-10k
        } else if ((otherId >= liveryIdOffset && otherId < liveryIdOffset * 2) || typeof (otherId == "string")) {
            textures = getMPTexture(u, liveryEntry); // LS范围 10k+10k
        } else {
            return; // 游戏管理的涂装
        }
        textures.forEach(texture => {
            applyMPTexture(
                texture.uri,
                texture.tex,
                img => u.model.changeTexture(img, { index: texture.index })
            );
        });
    });
}

/**
 * 获取并调整纹理到预期格式
 * @param {string} url
 * @param {sd} tex
 * @param {function} cb
 */
function applyMPTexture(url, tex, cb) {
    try {
        Cesium.Resource.fetchImage({ url }).then(img => {
            const canvas = createTag('canvas', { width: tex._width, height: tex._height });
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            cb(canvas.toDataURL('image/png'));
        });
    } catch (e) {
        console.log('LSMP', !!tex, url, e);
    }
}

/**
 * @param {object} u
 * @param {object} liveryEntry
 */
function getMPTexture(u, liveryEntry) {
    const otherId = u.currentLivery - liveryIdOffset;
    const textures = [];
    // 检查模型的预期纹理
    const uModelTextures = u.model._model._rendererResources.textures;
    console.log(u.currentLivery);
    console.log(typeof (u.currentLivery));
    if (typeof (u.currentLivery[0]) == "string") {
        console.log("VA 检测到");
        console.log(u.currentLivery);
        // 尝试在单条目中使用主纹理
        textures.push({
            uri: u.currentLivery,
            tex: uModelTextures[0],
            index: 0
        });
    } else {
        if (liveryEntry.mp == 'multi') {
            // 尝试在多条目中映射纹理
            liveryEntry.index.forEach((index, pos) => {
                textures.push({
                    uri: liveryEntry.liveries[otherId].texture[pos],
                    tex: uModelTextures[index],
                    index
                });
            });
        } else {
            const texIdx = liveryEntry.labels.indexOf('Texture');
            // 尝试在单条目中使用主纹理
            textures.push({
                uri: liveryEntry.liveries[otherId].texture[texIdx],
                tex: uModelTextures[0],
                index: 0
            });
        }
    }
    console.log(textures);
    return textures;
}

/**
 * @param {object} u
 * @param {object} liveryEntry
 */
function getMLTexture(u, liveryEntry) {
    if (!mLiveries.aircraft) {
        fetch(atob(liveryobj.mapi)).then(data => data.json()).then(json => {
            Object.keys(json).forEach(key => mLiveries[key] = json[key]);
        });
        return [];
    }
    const liveryId = u.currentLivery - mlIdOffset;
    const textures = [];
    const texIdx = liveryEntry.labels.indexOf('Texture');
    if (texIdx !== -1) {
        textures.push({
            uri: mLiveries.aircraft[liveryId].mptx,
            tex: u.model._model._rendererResources.textures[liveryEntry.index[texIdx]],
            index: liveryEntry.index[texIdx]
        });
    }
    return textures;
}

/******************* 工具函数 *********************/

/**
 * @param {string} id Div ID 切换，除了点击的元素
 */
function toggleDiv(id) {
    const div = domById(id);
    const target = window.event.target;
    if (target.classList.contains('closed')) {
        target.classList.remove('closed');
        div.style.display = '';
    } else {
        target.classList.add('closed');
        div.style.display = 'none';
    }
}

/**
 * 创建标签 <name attributes=...
 *
 * @param {string} name
 * @param {Object} attributes
 * @param {string|number} content
 * @returns {HTMLElement}
 */
function createTag(name, attributes = {}, content = '') {
    const el = document.createElement(name);
    Object.keys(attributes || {}).forEach(k => el.setAttribute(k, attributes[k]));
    if (('' + content).length) {
        el.innerHTML = content;
    }
    return el;
}

/**
 * 创建新元素 <tagName attributes=...
 * 添加到父级并返回子级以便后续访问
 *
 * @param {HTMLElement} parent
 * @param {string} tagName
 * @param {object} attributes
 * @param {number} pos 在第N个位置插入（默认追加）
 * @returns {HTMLElement}
 */
function appendNewChild(parent, tagName, attributes = {}, pos = -1) {
    const child = createTag(tagName, attributes);
    if (pos < 0) {
        parent.appendChild(child);
    } else {
        parent.insertBefore(child, parent.children[pos]);
    }

    return child;
}

function removeItem(array, itemToRemove) {
    const index = array.indexOf(itemToRemove);
    if (index !== -1) {
        array.splice(index, 1);
    }
}

/**
 * @param {string} elementId
 * @returns {HTMLElement}
 */
function domById(elementId) {
    return document.getElementById(elementId);
}

/******************* HTML & CSS 模板 *********************/

/**
 * @returns {string} 主面板的HTML模板
 */
function generateListHTML() {
    return `
        <h3><img src="${githubRepo}/liveryselector-logo.svg" class="livery-title" title="涂装选择器" /></h3>
        <h2 class="livery-selector-title">涂装选择器（zm粉丝专属中文版）</h2>
        <div class="livery-searchbar mdl-textfield mdl-js-textfield geofs-stopMousePropagation geofs-stopKeyupPropagation">
            <input class="mdl-textfield__input address-input" type="text" placeholder="搜索涂装" onkeyup="LiverySelector.search(this.value)" id="searchlivery">
            <label class="mdl-textfield__label" for="searchlivery">搜索涂装</label>
        </div>

        <h6 onclick="LiverySelector.toggleDiv('favorites')">收藏的涂装</h6>
        <ul id="favorites" class="geofs-list geofs-visible"></ul>

        <h6 onclick="LiverySelector.toggleDiv('liverylist')">可用的涂装</h6>
        <ul id="liverylist" class="geofs-list geofs-visible"></ul>

        <h6 onclick="LiverySelector.toggleDiv('airlinelist')">虚拟航空公司</h6><button class="mdl-button mdl-js-button mdl-button--raised mdl-button" style="background-color: #096628; color: white;" onclick="LiverySelector.addAirline()">+ 添加航空公司</button>
        <ul id="airlinelist" class="geofs-list geofs-visible"></ul>

        <h6 onclick="LiverySelector.toggleDiv('customDiv')" class="closed">加载外部涂装</h6>
        <div id="customDiv" class="mdl-textfield mdl-js-textfield geofs-stopMousePropagation geofs-stopKeyupPropagation" style="display:none;">
            <ul class="livery-custom-tabs" onclick="LiverySelector.handleCustomTabs()">
                <li>上传</li>
                <li>直接加载</li>
                <li>下载</li>
                <li>API</li>
            </ul>
            <div id="livery-custom-tab-upload" style="display:none;">
                <div>粘贴URL或上传图片以生成imgbb URL</div>
                <div class="upload-fields"></div>
                <div><button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" onclick="LiverySelector.inputLivery()">加载涂装</button></div>
                <div class="livery-submit geofs-list-collapsible-item">为LiverySelector数据库贡献涂装
                    <div class="geofs-collapsible no-api">-&gt; 在API标签中填写API密钥和Discord用户ID。</div>
                    <div class="geofs-collapsible api">
                        <label for="livery-submit-liveryname">涂装名称</label>
                        <input type="text" id="livery-submit-liveryname" class="mdl-textfield__input address-input">
                        <label for="livery-submit-credits">作者</label>
                        <input type="text" id="livery-submit-credits" class="mdl-textfield__input address-input">
                        <input type="checkbox" id="livery-submit-confirm-perms">
                        <label for="livery-submit-confirm-perms">我是作者，我自己创建了这些纹理，或者我有作者的许可使用这些纹理。</label><br>
                        <input type="checkbox" id="livery-submit-confirm-legal">
                        <label for="livery-submit-confirm-legal">我确认这些纹理适合所有年龄段，不包含冒犯性内容，符合游戏要求，且不违反任何法律或其他规定。</label>
                        <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" onclick="LiverySelector.submitLivery()">提交涂装审核</button>
                        <small>
                          加入我们的<a href="https://discord.gg/2tcdzyYaWU" target="_blank">Discord服务器</a>以跟进您的贡献。
                          提交即表示您同意遵守Discord服务器规则。违反规则可能导致您无法继续提交。
                        </small>
                    </div>
                </div>
            </div>
            <div id="livery-custom-tab-direct" style="display:none;">
                <div>直接在客户端加载纹理，无需上传。</div>
                <div class="upload-fields"></div>
            </div>
            <div id="livery-custom-tab-download" style="display:none;">
                <div>下载当前飞机的纹理：</div>
                <div class="download-fields"></div>
            </div>
            <div id="livery-custom-tab-api" style="display:none;">
              <div>
                <label for="livery-setting-apikey">在此粘贴您的imgbb API密钥 (<a href="https://api.imgbb.com" target="_blank">获取密钥</a>)</label>
                <input type="text" id="livery-setting-apikey" class="mdl-textfield__input address-input" onchange="LiverySelector.saveSetting(this)">
                <input type="checkbox" id="livery-setting-remove" onchange="LiverySelector.saveSetting(this)">
                <label for="livery-setting-remove">一小时后过期链接<br><small>(仅用于测试，提交到数据库时请禁用！)</small></label>
                <label for="livery-setting-discordid">Discord用户ID (<a href="https://support.discord.com/hc/en-us/articles/206346498" target="_blank">教程</a>)</label>
                <input type="number" id="livity-setting-discordid" class="mdl-textfield__input address-input" onchange="LiverySelector.saveSetting(this)">
              </div>
            </div>
        </div>
        <br/>
        <a href="https://raw.githubusercontent.com/kolos26/GEOFS-LiverySelector/refs/heads/main/tutorial.txt" target="_blank"><button class="mdl-button mdl-js-button mdl-button--raised mdl-button">打开教程</button></a><br/>
        <a href="https://discord.gg/2tcdzyYaWU" target="_blank"><button class="mdl-button mdl-js-button mdl-button--raised mdl-button">加入我们的Discord服务器</button></a><br/>
        <a href="https://github.com/kolos26/GEOFS-LiverySelector" target="_blank"><button class="mdl-button mdl-js-button mdl-button--raised mdl-button">访问我们的Github页面</button></a><br/>
        <a href="mailto:LiverySelector20220816@gmail.com" target="_blank"><button class="mdl-button mdl-js-button mdl-button--raised mdl-button">联系我们：LiverySelector20220816@gmail.com</button></a><br/>
`;
}

/**
 * @returns {HTMLElement} 主菜单涂装按钮的HTML模板
 */
function generatePanelButtonHTML() {
    const liveryButton = createTag('button', {
        title: '选择涂装',
        id: 'liverybutton',
        class: 'mdl-button mdl-js-button geofs-f-standard-ui geofs-mediumScreenOnly',
        onclick: 'LiverySelector.listLiveries()',
        'data-toggle-panel': '.livery-list',
        'data-tooltip-classname': 'mdl-tooltip--top',
        'data-upgraded': ',MaterialButton'
    });
    liveryButton.innerHTML = createTag('img', { src: `${githubRepo}/liveryselector-logo-small.svg`, height: '30px' }).outerHTML;

    return liveryButton;
}

window.LiverySelector = {
    liveryobj,
    saveSetting,
    toggleDiv,
    loadLiveryDirect,
    handleCustomTabs,
    listLiveries,
    star,
    search,
    inputLivery,
    uploadLivery,
    submitLivery,
    uploadHistory,
    loadAirlines,
    addAirline,
    removeAirline,
    airlineobjs
};
