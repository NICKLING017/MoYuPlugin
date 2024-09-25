let moyuSites = [];
let currentTabId = null;
let startTime = null;
let totalTime = 0;

// 从存储中加载摸鱼网站列表和总时间
chrome.storage.sync.get(['moyuSites', 'totalTime']).then((result) => {
  moyuSites = result.moyuSites || [];
  totalTime = result.totalTime || 0;
});

// 监听标签页切换
chrome.tabs.onActivated.addListener(function(activeInfo) {
  handleTabChange(activeInfo.tabId);
});

// 监听标签页更新
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tabId === currentTabId) {
    handleTabChange(tabId);
  }
});

function handleTabChange(tabId) {
  chrome.tabs.get(tabId).then((tab) => {
    const url = new URL(tab.url);
    const domain = url.hostname;

    if (moyuSites.includes(domain)) {
      startTimer();
    } else {
      stopTimer();
    }
    currentTabId = tabId;
  });
}

function startTimer() {
  if (!startTime) {
    startTime = Date.now();
  }
}

function stopTimer() {
  if (startTime) {
    totalTime += Date.now() - startTime;
    startTime = null;
    chrome.storage.sync.set({totalTime: totalTime});
    updatePopupTime();
  }
}

// 添加摸鱼网站
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "addMoyuSite") {
    const url = new URL(request.url);
    const domain = url.hostname;
    if (!moyuSites.includes(domain)) {
      moyuSites.push(domain);
      chrome.storage.sync.set({moyuSites: moyuSites});
    }
    sendResponse({success: true});
  } else if (request.action === "resetTime") {
    totalTime = 0;
    chrome.storage.sync.set({totalTime: totalTime});
    sendResponse({success: true});
  }
  return true; // 保持消息通道开放
});

// 每秒更新时间
setInterval(function() {
  if (startTime) {
    totalTime = totalTime + (Date.now() - startTime);
    startTime = Date.now();
    updatePopupTime();
  }
}, 1000);

// 添加这个新函数来更新弹出窗口的时间
function updatePopupTime() {
  chrome.runtime.sendMessage({action: "updateTime", totalTime: totalTime});
}
