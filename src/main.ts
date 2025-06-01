import './style.css';
import loadingIcon from './icons/loading.svg';
import failIcon from './icons/fail.svg';
import successIcon from './icons/success.svg';
import warningIcon from './icons/warning.svg';
import doneIcon from './icons/done.svg';
import copyIcon from './icons/copy.svg';
import uiHtml from './ui.html?raw';

import { GM_registerMenuCommand } from '$';

import { JMFetchAlbumInfo } from './api';
import {
  openConfigDialog as _openConfigDialog,
  resetConfig,
  config,
  isConfigDialogOpen,
} from './config';

import type { JMAlbum } from './api';

const openConfigDialog = () => {
  window.getSelection()?.empty();
  if (popupWindow.checkVisibility()) {
    popupWindow.style.display = 'none';
  }
  _openConfigDialog();
};

GM_registerMenuCommand('⚙ 打开配置菜单', openConfigDialog);
GM_registerMenuCommand('⚠ 重置配置', resetConfig);

// UI
const setSVGWithColor = (wrapper: HTMLDivElement, svgUrl: string, color: string) => {
  wrapper.style.backgroundColor = color;
  wrapper.style.mask = `url("${svgUrl}") no-repeat center`;
  wrapper.style.webkitMask = `url("${svgUrl}") no-repeat center`; // For compatibility
};

const uiContainer = document.createElement('div');
uiContainer.innerHTML = uiHtml;
document.body.appendChild(uiContainer);

const popupWindow = document.getElementById('jm-popup') as HTMLDivElement;
const numberIcon = document.getElementById('jm-number-icon') as HTMLDivElement;
const numberText = document.getElementById('jm-number') as HTMLDivElement;
const titleText = document.getElementById('jm-title-text') as HTMLAnchorElement;
const titleLoadingText = document.getElementById('jm-title-loading') as HTMLDivElement;
const copyBtn = document.getElementById('jm-copy') as HTMLButtonElement;
const copyBtnIcon = document.getElementById('jm-copy-icon') as HTMLDivElement;

const detailsContainer = document.getElementById('jm-details-container') as HTMLDivElement;

setSVGWithColor(numberIcon, loadingIcon, 'black');

const populateDetails = (album: JMAlbum) => {
  detailsContainer.innerHTML = '';

  const createDetailRow = (field: string, value: string | string[], isHtml = false) => {
    const isValueArray = Array.isArray(value);
    if (!value || (isValueArray && value.length === 0)) return;

    const row = document.createElement('div');
    row.className = 'jm-detail-row';

    const labelSpan = document.createElement('span');
    labelSpan.className = 'jm-detail-label';
    labelSpan.textContent = `${field}:`;
    row.appendChild(labelSpan);

    const valueSpan = document.createElement('span');
    valueSpan.className = 'jm-detail-value';
    if (isHtml) {
      valueSpan.innerHTML = isValueArray ? value.join(', ') : value;
    } else {
      valueSpan.textContent = isValueArray ? value.join(', ') : value;
    }
    if (isValueArray) {
      valueSpan.classList.add('jm-tags-container');
      valueSpan.innerHTML = '';
      value.forEach((tag) => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'jm-tag-item';
        tagSpan.textContent = tag;
        valueSpan.appendChild(tagSpan);
      });
    }
    row.appendChild(valueSpan);
    detailsContainer.appendChild(row);
  };

  if (config.layout === 'details') {
    createDetailRow('作者', album.author);
    createDetailRow('标签', album.tags);
    createDetailRow('系列', album.works);
    createDetailRow('角色', album.actors);
    createDetailRow(
      '统计',
      `浏览: ${album.total_views || 0} / 喜欢: ${album.likes || 0} / 评论: ${
        album.comment_total || 0
      }`,
    );
    if (album.addtime) {
      const date = new Date(parseInt(album.addtime) * 1000);
      createDetailRow('上传于', date.toLocaleString());
    }
    detailsContainer.style.display = 'grid';
  } else {
    detailsContainer.style.display = 'none';
  }
};

const toggleLoading = async (
  status: 'loading' | 'fail' | 'done' | 'warning',
  albumOrMessage?: JMAlbum | string | null,
  link?: string,
) => {
  let numberIconUrl = loadingIcon;
  let numberTextColor = 'black';
  let titleTextColor: string | null = 'gray';

  detailsContainer.style.display = 'none';

  if (status === 'fail') {
    numberIconUrl = failIcon;
    numberTextColor = 'red';
    titleText.innerHTML = titleText.title =
      typeof albumOrMessage === 'string' ? albumOrMessage : '获取信息失败';
  } else if (status === 'done' && albumOrMessage && typeof albumOrMessage !== 'string') {
    const album = albumOrMessage as JMAlbum;
    numberIconUrl = successIcon;
    numberTextColor = 'green';
    titleTextColor = null;
    titleText.innerHTML = titleText.title = album.name;
    populateDetails(album);
  } else if (status === 'warning') {
    numberIconUrl = warningIcon;
    numberTextColor = 'orange';
    titleText.innerHTML = titleText.title =
      typeof albumOrMessage === 'string' ? albumOrMessage : '发生错误';
  } else if (status === 'loading') {
    titleText.innerHTML = titleText.title = '加载中...';
  }

  setSVGWithColor(numberIcon, numberIconUrl, numberTextColor);
  numberText.style.color = numberTextColor;

  const isLoading = status === 'loading';
  titleLoadingText.style.display = isLoading ? 'inline' : 'none';

  titleText.style.display = !isLoading ? 'inline' : 'none';
  titleText.style.color = titleTextColor || '';

  if (link) {
    titleText.href = link;
  }
};

setSVGWithColor(copyBtnIcon, copyIcon, 'dodgerblue');

const disableCopyBtn = (status: boolean) => {
  copyBtn.disabled = status;
  copyBtn.style.pointerEvents = status ? 'none' : 'auto';
  copyBtnIcon.style.backgroundColor = status ? 'gray' : 'dodgerblue';
};
disableCopyBtn(true);

const copyToClipboard = () => {
  navigator.clipboard.writeText(titleText.innerText);
  copyBtn.style.pointerEvents = 'none';
  copyBtnIcon.classList.toggle('jm-copy-icon-hide');
  setTimeout(() => {
    copyBtnIcon.classList.toggle('jm-copy-icon-hide');
    setSVGWithColor(copyBtnIcon, doneIcon, 'dodgerblue');
  }, 250);
  setTimeout(() => {
    copyBtnIcon.classList.toggle('jm-copy-icon-hide');
    setTimeout(() => {
      setSVGWithColor(copyBtnIcon, copyIcon, 'dodgerblue');
      copyBtnIcon.classList.toggle('jm-copy-icon-hide');
      copyBtn.style.pointerEvents = 'auto';
    }, 250);
  }, 1500);
};
copyBtn.addEventListener('click', copyToClipboard);

const showPopup = (event: MouseEvent | KeyboardEvent) => {
  const selectedText = window.getSelection();
  if (!event.target || !(event.target as HTMLElement).closest('#jm-popup')) {
    popupWindow.style.display = 'none';
    disableCopyBtn(true);
  }
  if (!isConfigDialogOpen && selectedText && selectedText.toString().trim() !== '') {
    const number = parseInt(selectedText.toString().replace(/\D/g, ''));
    if (popupWindow.style.display !== 'grid' && !Number.isNaN(number)) {
      const range = selectedText.getRangeAt(0);
      const activeEl = document.activeElement as HTMLElement;
      const rect =
        activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT'
          ? activeEl.getBoundingClientRect()
          : range.getBoundingClientRect();
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      let top = Math.floor(scrollTop + rect.top + rect.height);
      const left = Math.floor(rect.left);
      if (top === 0 && left === 0 && rect.width === 0 && rect.height === 0) return;

      popupWindow.style.left = `${left}px`;
      popupWindow.style.top = `${top}px`;
      numberText.innerHTML = number.toString();
      numberText.style.color = '';
      popupWindow.style.display = 'grid';

      // nbnhhsh 兼容
      const nbnhhsh = document.getElementsByClassName(
        'nbnhhsh-box nbnhhsh-box-pop',
      )[0] as HTMLElement;
      const originalNbnhhshTop = parseInt(nbnhhsh.style.top);
      const nbnhhshAdjust = () => {
        if (nbnhhsh) {
          const popupHeight = popupWindow.offsetHeight;
          const offset = popupHeight > 80 ? popupHeight + 10 : 80;

          if (!isNaN(originalNbnhhshTop)) {
            nbnhhsh.style.top = `${originalNbnhhshTop + offset}px`;
          } else {
            const rectNbnhhsh = nbnhhsh.getBoundingClientRect();
            const scrollTopNbnhhsh = document.documentElement.scrollTop || document.body.scrollTop;
            nbnhhsh.style.top = `${scrollTopNbnhhsh + rectNbnhhsh.top + offset}px`;
          }
        }
      };

      const configuredSources = config.sources;
      if (!configuredSources || configuredSources.length === 0) {
        toggleLoading('warning', '无可用线路，请先配置');
        disableCopyBtn(true);
        nbnhhshAdjust();
        return;
      }

      let sourceIndex = 0;
      toggleLoading('loading');
      nbnhhshAdjust();

      const tryNextSource = () => {
        if (sourceIndex >= configuredSources.length) {
          toggleLoading('fail', '获取信息失败或未找到车牌');
          disableCopyBtn(true);
          nbnhhshAdjust();
          return;
        }

        const currentSite = configuredSources[sourceIndex];
        JMFetchAlbumInfo(currentSite, number, (albumData) => {
          if (!albumData || albumData.id === 0 || !albumData.name) {
            sourceIndex++;
            tryNextSource();
            return;
          }
          toggleLoading('done', albumData, `${config.jmWebsiteUrl}/album/${albumData.id}`);
          disableCopyBtn(false);
          nbnhhshAdjust();
        });
      };
      tryNextSource();
    }
  }
};

const _showPopup = (event: MouseEvent | KeyboardEvent) => {
  setTimeout(() => {
    showPopup(event);
  }, 1);
};

document.addEventListener('mouseup', _showPopup);
document.addEventListener('keyup', _showPopup);
