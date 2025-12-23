// Interface cho extension settings
interface ExtensionSettings {
  autoRedirect: boolean;
  showOverlay: boolean;
  whitelistedDomains: string[];
  blacklistedDomains: string[];
  hotkey: string;
}

// Default settings
const DEFAULT_SETTINGS: ExtensionSettings = {
  autoRedirect: false,
  showOverlay: true,
  whitelistedDomains: [],
  blacklistedDomains: [],
  hotkey: 'Alt+F'
};

// URL conversion utilities
const MEDIUM_DOMAINS = [
  'medium.com',
  'hackernoon.com',
  'towardsdatascience.com',
  'betterprogramming.pub',
  'bettermarketing.pub',
  'betterhumans.pub',
  'psiloveyou.xyz',
  'writingcooperative.com',
  'uxdesign.cc',
  'levelup.gitconnected.com',
  'aninjusticemag.com',
  'datadriveninvestor.com',
  'startup.grind.com',
  'the-ascent.pub',
  'codeburst.io',
  'infosecwriteups.com',
  'plainenglish.io'
];

// Kiểm tra xem URL có phải là Medium không
function isMediumUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return MEDIUM_DOMAINS.some(domain =>
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

// Chuyển đổi URL Medium sang Freedium
function convertToFreediumUrl(mediumUrl: string): string {
  try {
    const urlObj = new URL(mediumUrl);
    // Xử lý các subdomain của Medium
    if (urlObj.hostname.includes('medium.com') ||
        MEDIUM_DOMAINS.some(domain => urlObj.hostname.includes(domain))) {
      return `https://freedium.cfd/${urlObj.pathname}${urlObj.search}`;
    }
    return mediumUrl;
  } catch {
    return mediumUrl;
  }
}

// Cập nhật badge text
async function updateBadge(tabId: number, url: string) {
  try {
    const settings = await getSettings();
    if (!isMediumUrl(url)) {
      chrome.action.setBadgeText({ tabId, text: '' });
      return;
    }

    // Đếm số lượng link Medium trên trang
    const badgeCount = '1'; // Hiển thị badge khi trang là Medium
    chrome.action.setBadgeText({ tabId, text: badgeCount });
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#4CAF50' });
  } catch (error) {
    console.error('Error updating badge:', error);
  }
}

// Lấy settings từ storage
async function getSettings(): Promise<ExtensionSettings> {
  try {
    const result = await chrome.storage.sync.get('settings');
    return { ...DEFAULT_SETTINGS, ...result.settings };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Tạo context menu
function createContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'open-in-freedium',
      title: 'Đọc miễn phí trên Freedium',
      contexts: ['link', 'selection', 'page'],
      documentUrlPatterns: ['*://*.medium.com/*', '*://medium.com/*']
    });

    chrome.contextMenus.create({
      id: 'open-all-links',
      title: 'Mở tất cả link Medium trong tabs mới',
      contexts: ['page'],
      documentUrlPatterns: ['*://*/*']
    });

    chrome.contextMenus.create({
      id: 'separator',
      type: 'separator',
      contexts: ['page']
    });

    chrome.contextMenus.create({
      id: 'settings',
      title: 'Cài đặt',
      contexts: ['action']
    });
  });
}

// Extension installation và setup
chrome.runtime.onInstalled.addListener(async (details) => {
  // Initialize default settings
  const settings = await getSettings();
  await chrome.storage.sync.set({ settings });

  // Create context menus
  createContextMenus();

  // Log installation
  console.log('Medium to Freedium extension installed:', details.reason);
});

// Tab update listener - detect Medium pages and update badge
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    await updateBadge(tabId, tab.url);

    // Auto redirect nếu được bật
    const settings = await getSettings();
    if (settings.autoRedirect && isMediumUrl(tab.url)) {
      const freediumUrl = convertToFreediumUrl(tab.url);
      chrome.tabs.update(tabId, { url: freediumUrl });
    }
  }
});

// Tab activated listener - update badge for active tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      await updateBadge(activeInfo.tabId, tab.url);
    }
  } catch (error) {
    console.error('Error updating badge on tab activation:', error);
  }
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab) return;

  switch (info.menuItemId) {
    case 'open-in-freedium':
      let targetUrl = '';

      if (info.linkUrl) {
        // Right-click on link
        targetUrl = info.linkUrl;
      } else if (info.selectionText) {
        // Selected text
        // Kiểm tra xem có phải URL không
        if (info.selectionText.startsWith('http')) {
          targetUrl = info.selectionText;
        } else {
          // Thử prefix với https://
          targetUrl = `https://${info.selectionText}`;
        }
      } else if (tab.url) {
        // Current page
        targetUrl = tab.url;
      }

      if (isMediumUrl(targetUrl)) {
        const freediumUrl = convertToFreediumUrl(targetUrl);
        chrome.tabs.create({ url: freediumUrl });
      }
      break;

    case 'open-all-links':
      if (tab.id) {
        // Inject script để tìm tất cả link Medium
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const links = Array.from(document.querySelectorAll('a[href]'));
            const mediumLinks = new Set<string>();

            links.forEach(link => {
              const href = link.getAttribute('href');
              if (href && (
                href.includes('medium.com') ||
                href.includes('towardsdatascience.com') ||
                href.includes('hackernoon.com') ||
                href.includes('betterprogramming.pub') ||
                href.includes('bettermarketing.pub') ||
                href.includes('psiloveyou.xyz') ||
                href.includes('writingcooperative.com') ||
                href.includes('uxdesign.cc') ||
                href.includes('levelup.gitconnected.com') ||
                href.includes('codeburst.io') ||
                href.includes('infosecwriteups.com') ||
                href.includes('plainenglish.io')
              )) {
                let fullUrl = href;
                if (href.startsWith('/')) {
                  fullUrl = new URL(href, window.location.origin).href;
                } else if (!href.startsWith('http')) {
                  fullUrl = `https://${href}`;
                }
                mediumLinks.add(fullUrl);
              }
            });

            return Array.from(mediumLinks);
          }
        }, (result) => {
          if (result && result[0] && result[0].result) {
            const mediumLinks = result[0].result;
            mediumLinks.forEach((link: string) => {
              const freediumUrl = convertToFreediumUrl(link);
              chrome.tabs.create({ url: freediumUrl });
            });
          }
        });
      }
      break;

    case 'settings':
      chrome.tabs.create({
        url: chrome.runtime.getURL('src/options/index.html')
      });
      break;
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  console.log('Extension icon clicked!', tab);
  console.log('Current URL:', tab.url);
  console.log('Is Medium URL:', isMediumUrl(tab.url || ''));

  if (tab.url && isMediumUrl(tab.url)) {
    const freediumUrl = convertToFreediumUrl(tab.url);
    console.log('Opening Freedium URL:', freediumUrl);
    chrome.tabs.create({ url: freediumUrl });
  } else {
    console.log('Not a Medium page, showing notification');
    // If not a Medium page, show a notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icons/icon-128.png',
      title: 'Medium to Freedium',
      message: 'Trang hiện tại không phải là Medium. Vui lòng truy cập trang Medium để sử dụng extension.'
    });
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_SETTINGS':
      getSettings().then(sendResponse);
      return true; // Keep message channel open for async response

    case 'UPDATE_SETTINGS':
      chrome.storage.sync.set({ settings: message.settings }, () => {
        sendResponse({ success: true });
        // Recreate context menus if needed
        createContextMenus();
      });
      return true;

    case 'CONVERT_URL':
      if (message.url) {
        const freediumUrl = convertToFreediumUrl(message.url);
        sendResponse({ freediumUrl });
      }
      return true;

    case 'OPEN_FREEDIUM':
      if (message.url) {
        const freediumUrl = convertToFreediumUrl(message.url);
        chrome.tabs.create({ url: freediumUrl }, (tab) => {
          sendResponse({ success: true, tabId: tab.id });
        });
      }
      return true;

    default:
      return false;
  }
});

// Storage change listener
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.settings) {
    // Settings changed, you might want to update some state here
    console.log('Settings updated:', changes.settings.newValue);
  }
});

export {};