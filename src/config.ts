import configHtml from './config-ui.html?raw';
import './config-style.css';

interface Config {
  sources: string[];
  timeout: number;
  jmWebsiteUrl: string;
  layout: 'compact' | 'details';
}

const defaultConfig: Config = {
  sources: ['www.cdnmhwscc.vip', 'www.cdnblackmyth.club', 'www.cdnmhws.cc', 'www.cdnuc.vip'],
  timeout: 5000,
  jmWebsiteUrl: 'https://18comic.vip',
  layout: 'details',
};

const loadConfig = (): Config => {
  const configString = localStorage.getItem('rt18_config');
  if (configString) {
    const parsedConfig = JSON.parse(configString);
    return { ...defaultConfig, ...parsedConfig };
  }
  return { ...defaultConfig };
};

export const config = loadConfig();
export let isConfigDialogOpen = false;

const saveConfig = () => {
  localStorage.setItem('rt18_config', JSON.stringify(config));
};

export const resetConfig = () => {
  if (confirm('确定要重置所有配置吗？')) {
    localStorage.removeItem('rt18_config');
    alert('配置已重置为默认值，请刷新页面以应用更改。');
  }
};

export const openConfigDialog = () => {
  const dialogContainerId = 'rt18-config-dialog-container';
  let dialogContainer = document.getElementById(dialogContainerId);

  if (dialogContainer) {
    dialogContainer.style.display = 'flex';
    return;
  }

  dialogContainer = document.createElement('div');
  dialogContainer.id = dialogContainerId;
  dialogContainer.innerHTML = configHtml;
  document.body.appendChild(dialogContainer);

  isConfigDialogOpen = true;

  const closeButton = document.getElementById('rt18-config-close-btn') as HTMLButtonElement;
  const sourceList = document.getElementById('rt18-source-list') as HTMLUListElement;
  const addSourceInput = document.getElementById('rt18-add-source-input') as HTMLInputElement;
  const addSourceButton = document.getElementById('rt18-add-source-btn') as HTMLDivElement;
  const timeoutInput = document.getElementById('rt18-config-timeout-input') as HTMLInputElement;
  const jmWebsiteUrlInput = document.getElementById('rt18-config-jm-url-input') as HTMLInputElement;
  const layoutSelect = document.getElementById('rt18-config-layout-select') as HTMLSelectElement;

  // Timeout
  if (timeoutInput) {
    timeoutInput.value = String(config.timeout);

    timeoutInput.addEventListener('change', () => {
      const newTimeout = parseInt(timeoutInput.value, 10);
      if (!isNaN(newTimeout) && newTimeout > 0) {
        config.timeout = newTimeout;
        localStorage.setItem('rt18_config', JSON.stringify(config));
        config.timeout = newTimeout;
      } else {
        timeoutInput.value = String(config.timeout);
        alert('请输入有效的超时毫秒数。');
      }
    });
  }

  // JM Website URL
  if (jmWebsiteUrlInput) {
    jmWebsiteUrlInput.value = config.jmWebsiteUrl;

    jmWebsiteUrlInput.addEventListener('change', () => {
      const newUrl = jmWebsiteUrlInput.value.trim();
      if (newUrl) {
        try {
          new URL(newUrl);
          config.jmWebsiteUrl = newUrl;
          localStorage.setItem('rt18_config', JSON.stringify(config));
        } catch (e) {
          jmWebsiteUrlInput.value = config.jmWebsiteUrl;
          alert('请输入有效的 URL。');
        }
      } else {
        jmWebsiteUrlInput.value = config.jmWebsiteUrl;
        alert('URL 不能为空。');
      }
    });
  }

  // Layout
  if (layoutSelect) {
    layoutSelect.value = config.layout;

    layoutSelect.addEventListener('change', () => {
      const newLayout = layoutSelect.value as 'compact' | 'details';
      if (newLayout === 'compact' || newLayout === 'details') {
        config.layout = newLayout;
        localStorage.setItem('rt18_config', JSON.stringify(config));
      } else {
        layoutSelect.value = config.layout;
      }
    });
  }

  // Source List
  const renderSourceList = () => {
    sourceList.innerHTML = '';
    config.sources.forEach((source, index) => {
      const listItem = document.createElement('li');
      listItem.className = 'rt18-source-list-item';

      const sourceText = document.createElement('span');
      sourceText.className = 'rt18-source-text';
      sourceText.textContent = source;
      listItem.appendChild(sourceText);

      const controlsContainer = document.createElement('div');
      controlsContainer.className = 'rt18-source-controls';

      const upButton = document.createElement('div');
      upButton.className = 'rt18-source-button rt18-source-button-up';
      upButton.innerHTML = '<span>↑</span>';
      if (index === 0) {
        upButton.classList.add('rt18-button-disabled');
      } else {
        upButton.addEventListener('click', () => {
          const temp = config.sources[index];
          config.sources[index] = config.sources[index - 1];
          config.sources[index - 1] = temp;
          saveConfig();
          renderSourceList();
        });
      }

      const downButton = document.createElement('div');
      downButton.className = 'rt18-source-button rt18-source-button-down';
      downButton.innerHTML = '<span>↓</span>';
      if (index === config.sources.length - 1) {
        downButton.classList.add('rt18-button-disabled');
      } else {
        downButton.addEventListener('click', () => {
          const temp = config.sources[index];
          config.sources[index] = config.sources[index + 1];
          config.sources[index + 1] = temp;
          saveConfig();
          renderSourceList();
        });
      }

      const deleteButton = document.createElement('div');
      deleteButton.className = 'rt18-source-button rt18-source-button-delete';
      deleteButton.textContent = '删除';
      deleteButton.addEventListener('click', () => {
        if (confirm(`确定删除源 "${source}" 吗？`)) {
          config.sources.splice(index, 1);
          saveConfig();
          renderSourceList();
        }
      });

      controlsContainer.appendChild(upButton);
      controlsContainer.appendChild(downButton);
      controlsContainer.appendChild(deleteButton);
      listItem.appendChild(controlsContainer);
      sourceList.appendChild(listItem);
    });
  };

  addSourceButton.addEventListener('click', () => {
    const newSource = addSourceInput.value.trim();
    if (newSource && !config.sources.includes(newSource)) {
      config.sources.push(newSource);
      saveConfig();
      config.sources = [...config.sources];
      renderSourceList();
      addSourceInput.value = '';
    }
  });

  renderSourceList();

  // Close dialog
  closeButton.addEventListener('click', () => {
    if (dialogContainer) {
      dialogContainer.style.display = 'none';
      dialogContainer.remove();
      isConfigDialogOpen = false;
    }
  });
};
