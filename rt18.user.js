// ==UserScript==
// @name         18Comic 之路
// @namespace    http://tampermonkey.net/
// @version      0.1
// @license      MIT
// @description  JM / 18Comic 车牌号划词查询工具
// @author       zyf722
// @match        *://weibo.com/*
// @match        *://*.weibo.com/*
// @match        *://*.weibo.cn/*
// @match        *://tieba.baidu.com/*
// @match        *://*.bilibili.com/
// @match        *://*.bilibili.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=18comic.vip
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // Site source selection
    var JM_SITE = GM_getValue("JM_SITE", "18comic.vip");
    var JM_CURRENT = GM_getValue("JM_CURRENT", 0);
    const updateSite = (site) => {
        JM_SITE = site;
        GM_setValue("JM_SITE", JM_SITE);
    }
    const updateCurrent = (current) => {
        JM_CURRENT = current;
        GM_setValue("JM_CURRENT", JM_CURRENT);
    }
    const sources = [
        "18comic.vip",
        "18comic.org",
        "jmcomic1.me",
        "18comic-palworld.vip",
        "18comic-c.art"
    ];
    const updateMenuCommandFactory = (index) => {
        return () => {
            updateSite(sources[index]);
            GM_registerMenuCommand("线路 " + (JM_CURRENT + 1) + ": " + sources[JM_CURRENT], updateMenuCommandFactory(JM_CURRENT), {id: JM_CURRENT});
            updateCurrent(index);
            GM_registerMenuCommand("✅ 线路 " + (index + 1) + ": " + sources[index], updateMenuCommandFactory(index), {id: index});
        };
    }
    for (var i = 0; i < sources.length; i++) {
        GM_registerMenuCommand((JM_CURRENT === i ? "✅ " : "") + "线路 " + (i+1) + ": " + sources[i], updateMenuCommandFactory(i), {id: i});
    };

    // Util functions
    const createElementWithAttr = (tag, attr) => {
        const element = document.createElement(tag);

        if (attr) {
            Object.entries(attr).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        return element;
    };

    const createSVGElement = (path, viewBox, width, height, attr) => {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('viewBox', viewBox);
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        if (attr) {
            Object.entries(attr).forEach(([key, value]) => {
                svg.setAttribute(key, value);
            });
        }

        const p = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        p.setAttribute('d', path);
        p.setAttribute('fill', 'currentColor');
        svg.appendChild(p);
        return [svg, p];
    }

    const popupWindow = createElementWithAttr('div', {id: 'jm-popup', class: 'jm-select-none'});
    document.body.appendChild(popupWindow);

    const numberContainer = createElementWithAttr('div', {id: 'jm-number-container'});
    popupWindow.appendChild(numberContainer);

    const LOADING_ICON = "M512 170.666667a341.333333 341.333333 0 1 0 0 682.666666 341.333333 341.333333 0 0 0 0-682.666666zM85.333333 512C85.333333 276.352 276.352 85.333333 512 85.333333s426.666667 191.018667 426.666667 426.666667-191.018667 426.666667-426.666667 426.666667S85.333333 747.648 85.333333 512z m426.666667-256a42.666667 42.666667 0 0 1 42.666667 42.666667v195.669333l115.498666 115.498667a42.666667 42.666667 0 0 1-60.330666 60.330666l-128-128A42.666667 42.666667 0 0 1 469.333333 512V298.666667a42.666667 42.666667 0 0 1 42.666667-42.666667z";
    const FAIL_ICON = "M512 97.52381c228.912762 0 414.47619 185.563429 414.47619 414.47619s-185.563429 414.47619-414.47619 414.47619S97.52381 740.912762 97.52381 512 283.087238 97.52381 512 97.52381z m0 73.142857C323.486476 170.666667 170.666667 323.486476 170.666667 512s152.81981 341.333333 341.333333 341.333333 341.333333-152.81981 341.333333-341.333333S700.513524 170.666667 512 170.666667z m129.29219 160.304762l51.736381 51.736381L563.687619 512l129.316571 129.29219-51.73638 51.736381L512 563.687619l-129.29219 129.316571-51.736381-51.73638L460.312381 512l-129.316571-129.26781 51.73638-51.73638L512 460.263619l129.26781-129.29219z";
    const SUCCESS_ICON = 'M512 97.52381c228.912762 0 414.47619 185.563429 414.47619 414.47619s-185.563429 414.47619-414.47619 414.47619S97.52381 740.912762 97.52381 512 283.087238 97.52381 512 97.52381z m0 73.142857C323.486476 170.666667 170.666667 323.486476 170.666667 512s152.81981 341.333333 341.333333 341.333333 341.333333-152.81981 341.333333-341.333333S700.513524 170.666667 512 170.666667z m193.194667 145.188571l52.467809 50.956191-310.662095 319.683047-156.379429-162.230857 52.662858-50.761143 103.936 107.812572 257.974857-265.45981z';
    // Define the warning icon SVG path
    const WARNING_ICON = "M545.718857 130.608762c11.337143 6.265905 20.699429 15.555048 26.989714 26.819048l345.014858 617.667047a68.87619 68.87619 0 0 1-26.989715 93.915429c-10.313143 5.705143-21.942857 8.704-33.718857 8.704H166.985143A69.266286 69.266286 0 0 1 97.52381 808.643048c0-11.751619 2.998857-23.28381 8.752761-33.548191l344.990477-617.642667a69.656381 69.656381 0 0 1 94.451809-26.819047zM512 191.000381L166.985143 808.643048H856.990476L512 191.000381zM546.718476 670.47619v69.071239h-69.461333V670.47619h69.485714z m0-298.374095v252.318476h-69.461333V372.102095h69.485714z";

    // Create an SVG element for the number icon
    const [numberIcon, numberIconPath] = createSVGElement(LOADING_ICON, '0 0 1024 1024', '16px', '16px', {id: 'jm-number-icon'});
    numberContainer.appendChild(numberIcon);

    // Create a div element for the number text
    const numberText = createElementWithAttr('div', {id: 'jm-number', class: 'jm-select-none jm-overflow'});
    numberContainer.appendChild(numberText);

    // Create an anchor element for the title text
    const titleText = createElementWithAttr('a', {id: 'jm-title-text', class: 'jm-select-none jm-overflow jm-title'});
    popupWindow.appendChild(titleText);

    // Create a div element for the title loading text
    const titleLoadingText = createElementWithAttr('div', {id: 'jm-title-loading', class: 'jm-select-none jm-title'});
    titleLoadingText.innerHTML = '加载中...';
    popupWindow.appendChild(titleLoadingText);

    // Function to toggle the loading status
    const toggleLoading = (status) => {
        if (status === "loading") {
            titleLoadingText.style.display = 'inline';
            titleText.style.display = 'none';
            numberIconPath.setAttribute('d', LOADING_ICON);
            numberText.style.color = numberIcon.style.color = "black";
        } else if (status === "fail") {
            titleLoadingText.style.display = 'none';
            titleText.style.display = 'inline';
            numberIconPath.setAttribute('d', FAIL_ICON);
            numberText.style.color = numberIcon.style.color = "red";
        } else if (status === "done") {
            titleLoadingText.style.display = 'none';
            titleText.style.display = 'inline';
            numberIconPath.setAttribute('d', SUCCESS_ICON);
            numberText.style.color = numberIcon.style.color = "green";
        } else if (status === "warning") {
            titleLoadingText.style.display = 'none';
            titleText.style.display = 'inline';
            numberIconPath.setAttribute('d', WARNING_ICON);
            numberText.style.color = numberIcon.style.color = "orange";
        }
    };

    // Create a button element for the copy button
    const copyBtn = createElementWithAttr('button', {id: 'jm-copy'});
    popupWindow.appendChild(copyBtn);

    // Define the copy icon SVG path
    const DONE_ICON = "M512 16C238.066 16 16 238.066 16 512s222.066 496 496 496 496-222.066 496-496S785.934 16 512 16z m0 96c221.064 0 400 178.902 400 400 0 221.064-178.902 400-400 400-221.064 0-400-178.902-400-400 0-221.064 178.902-400 400-400m280.408 260.534l-45.072-45.436c-9.334-9.41-24.53-9.472-33.94-0.136L430.692 607.394l-119.584-120.554c-9.334-9.41-24.53-9.472-33.94-0.138l-45.438 45.072c-9.41 9.334-9.472 24.53-0.136 33.942l181.562 183.032c9.334 9.41 24.53 9.472 33.94 0.136l345.178-342.408c9.408-9.336 9.468-24.532 0.134-33.942z";
    const COPY_ICON = 'M931.882 131.882l-103.764-103.764A96 96 0 0 0 760.236 0H416c-53.02 0-96 42.98-96 96v96H160c-53.02 0-96 42.98-96 96v640c0 53.02 42.98 96 96 96h448c53.02 0 96-42.98 96-96v-96h160c53.02 0 96-42.98 96-96V199.764a96 96 0 0 0-28.118-67.882zM596 928H172a12 12 0 0 1-12-12V300a12 12 0 0 1 12-12h148v448c0 53.02 42.98 96 96 96h192v84a12 12 0 0 1-12 12z m256-192H428a12 12 0 0 1-12-12V108a12 12 0 0 1 12-12h212v176c0 26.51 21.49 48 48 48h176v404a12 12 0 0 1-12 12z m12-512h-128V96h19.264c3.182 0 6.234 1.264 8.486 3.514l96.736 96.736a12 12 0 0 1 3.514 8.486V224z';

    // Create an SVG element for the copy button icon
    const [copyBtnIcon, copyBtnIconPath] = createSVGElement(COPY_ICON, '0 0 1024 1024', '16px', '16px', {id: 'jm-copy-icon'});
    copyBtn.appendChild(copyBtnIcon);

    // Function to disable the copy button
    const disableBtn = (status) => {
        copyBtn.disabled = status;
        copyBtnIcon.setAttribute('color', status ? 'gray' : 'dodgerblue');
    };
    disableBtn(true);

    // Create a style element for the CSS styles
    const style = createElementWithAttr('style');
    style.innerHTML = `
        .jm-select-none {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }

        .jm-overflow {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        #jm-popup {
            position: absolute;
            background-color: #fff;
            padding: 10px;
            margin-top: 10px;
            border: 1px solid #ddd;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 999999999999;
            display: none;
            max-width: 25%;
            column-gap: 10px;
            align-items: center;
        }

        .jm-title {
            max-width: 100%;
            font-size: 14px;
            grid-column: 1;
            grid-row: 2;
        }

        #jm-title-text {
            display: none;
        }

        #jm-number-container {
            max-width: 100%;
            grid-column: 1;
            grid-row: 1;
            display: flex;
            align-items: center;
        }

        #jm-number {
            font-size: 18px;
            font-weight: bold;
        }

        #jm-number-icon {
            margin-right: 5px;
        }

        #jm-copy {
            border: none;
            background-color: #fff;
            width: 32px;
            height: 32px;
            font-size: 16px;
            cursor: pointer;
            grid-column: 2;
            grid-row: 1 / 3;
        }
    `;
    document.head.appendChild(style);

    // Function to fetch the title of a URL
    const fetchTitle = (url, callback) => {
        console.log("fetching " + url);
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            onload: function(response) {
                const title = response.responseText.match(/<title[^>]*>([^<]+)<\/title>/)[1];
                callback(title.replace(" Comics - 禁漫天堂", ""));
            }
        });
    }

    // Function to copy the title text to the clipboard
    const copyToClipboard = (event) => {
        navigator.clipboard.writeText(titleText.innerText);
        copyBtn.disabled = true;
        copyBtnIconPath.setAttribute('d', DONE_ICON);
        setTimeout(() => {
            copyBtnIconPath.setAttribute('d', COPY_ICON);
            copyBtn.disabled = false;
        }, 1500);
    }
    copyBtn.addEventListener('click', copyToClipboard);

    // Function to show the popup window
    const showPopup = (event) => {
        const selectedText = window.getSelection();

        // Check if mouse is inside the popup window
        if (!event.target.closest('#jm-popup')) {
            popupWindow.style.display = 'none';
            disableBtn(true);
        }

        if(selectedText.toString().trim() !== '') {
            const number = selectedText.toString().replace(/\D/g, '');

            if (popupWindow.style.display !== 'grid' && number !== "") {
                const range = selectedText.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                const url = "https://" + JM_SITE + "/album/" + number;

                const activeEl = document.activeElement;
                if(['TEXTAREA','INPUT'].includes(activeEl.tagName)) rect = activeEl.getBoundingClientRect();

                const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

                const top = Math.floor(scrollTop + rect.top + rect.height);
                const left = Math.floor(rect.left);

                if(top === 0 && left === 0){
                    return;
                }

                popupWindow.style.left = left + 'px';
                popupWindow.style.top = top + 'px';

                numberText.innerHTML = number;
                numberText.style.color = "";

                toggleLoading("loading");

                popupWindow.style.display = 'grid';

                // Special optimization for nbnhhsh
                const nbnhhsh = document.getElementsByClassName("nbnhhsh-box nbnhhsh-box-pop")[0];
                if (nbnhhsh) nbnhhsh.style.top = (parseInt(nbnhhsh.style.top) + 80) + "px";

                fetchTitle(url, (title) => {
                    titleText.href = url;
                    if (title === "Just a moment...") {
                        titleText.innerHTML = titleText.title = "自动获取失败，请手动点击链接";
                        toggleLoading("warning");
                    } else if (title === "禁漫天堂") {
                        titleText.innerHTML = titleText.title = "无效车牌"
                        toggleLoading("fail");
                    } else {
                        titleText.innerHTML = titleText.title = title
                        toggleLoading("done");
                        disableBtn(false);
                    }
                });
            }
        }
    }

    // Function to show the popup window after a delay
    const _showPopup = (event) => {
        // Delay window.getSelection() to get the correct selected text
        setTimeout(() => {
            showPopup(event);
        }, 1);
    }

    // Add event listeners to show the popup window
    document.addEventListener('mouseup', _showPopup);
    document.addEventListener('keyup', _showPopup);
})();