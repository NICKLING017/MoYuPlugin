let totalSeconds = 0;

document.addEventListener('DOMContentLoaded', function() {
    updateTime();

    document.getElementById('addSite').addEventListener('click', function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.runtime.sendMessage({action: "addMoyuSite", url: tabs[0].url}, function(response) {
          if (response.success) {
            alert('已添加到摸鱼列表');
          }
        });
      });
    });

    document.getElementById('resetTime').addEventListener('click', function() {
      chrome.runtime.sendMessage({action: "resetTime"}, function(response) {
        if (response.success) {
          totalSeconds = 0;
          updateTimeDisplay();
          alert('时间已重置');
        }
      });
    });
});

function updateTime() {
    chrome.storage.sync.get('totalTime').then(result => {
        totalSeconds = Math.floor(result.totalTime / 1000);
        updateTimeDisplay();
    });
}

function updateTimeDisplay() {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const timeString = [hours, minutes, seconds]
        .map(v => v < 10 ? "0" + v : v)
        .join(":");
    
    document.getElementById('timeDisplay').textContent = timeString;
}

// 监听来自background.js的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "updateTime") {
        totalSeconds = Math.floor(request.totalTime / 1000);
        updateTimeDisplay();
    }
});