# 18Comic 之路：车牌号划词查询工具

![](./assets/preview.png)

划词可查询 JM / 18Comic 车牌号对应的漫画，便于分享或自行查询。

## 使用方法
> [!WARNING]
> 本脚本仅在 Tampermonkey 管理器下测试通过，其他管理器*可能*存在兼容性问题。

[安装任意用户脚本管理器](https://greasyfork.org/zh-CN/#home-step-1) 后，访问 [Github Latest Release](https://github.com/zyf722/rt18/releases/latest/download/rt18.user.js) 或在 [Greasyfork](https://greasyfork.org/zh-CN/scripts/487982-18comic-%E4%B9%8B%E8%B7%AF) 安装本脚本的最新发行版。

划词时将读取选中文本中的数字并拼接（忽略前导零和非数字字符），随后调用对应的 18Comic API 以获取其对应的漫画信息。

目前脚本将默认在 **微博**、**贴吧**、**哔哩哔哩** 页面下运行。编辑脚本头部的 `@match` 规则可以添加更多网站。

> ~~查询时可能提示 *自动获取失败，请手动点击链接*，这是由于 18Comic 使用 Cloudflare 反爬虫保护，需要手动访问一次页面以获取 `cf_clearance` Cookie 以绕过验证。~~
>
> 1.0 版本起脚本底层已改用 18Comic 的移动端 API 绕过反爬虫保护，查询时不再需要手动访问。

在脚本管理器菜单中可选择**打开配置菜单**来显示配置对话框，配置存储在浏览器的 localStorage 中。

![](./assets/config.png)

脚本默认采用含漫画详细信息的详细布局，若希望回到旧版仅包含标题的紧凑布局，可在配置中进行修改。

## 特别致谢
### 「能不能好好说话？」
本脚本部分受 **[😩「能不能好好说话？」 拼音首字母缩写翻译工具](https://github.com/itorr/nbnhhsh)** 启发，在此特别致谢。

本脚本已对「能不能好好说话？」进行适配，划词窗口不会相互干扰。

![](./assets/preview-nbnhhsh-support.png)

### JMComic-Crawler-Python
本脚本使用了 18Comic 的移动端 API 来绕过 Cloudflare 反爬虫保护，部分代码移植自 [JMComic-Crawler-Python](https://github.com/hect0x7/JMComic-Crawler-Python) 项目。

## Github 仓库
[zyf722/rt18](https://github.com/zyf722/rt18)

## 许可证
[MIT](LICENSE)
