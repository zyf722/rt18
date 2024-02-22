# 18Comic 之路：车牌号划词查询工具

![](assets/preview.png)

划词可查询 JM / 18Comic 车牌号对应的标题，便于分享或自行查询。

## 使用方法
> [!WARNING]
> 本脚本仅在 Tampermonkey 管理器下测试通过，其他管理器可能无法正常使用。

[安装任意用户脚本管理器](https://greasyfork.org/zh-CN/#home-step-1) 后，访问 [rt18.user.js](https://github.com/zyf722/rt18/raw/main/rt18.user.js) 或在 [Greasyfork](https://greasyfork.org/zh-CN/scripts/487982-18comic-%E4%B9%8B%E8%B7%AF) 安装本脚本。

划词时将读取选中文本中的数字并拼接，随后访问对应的 18Comic 页面以获取车牌号对应的标题。

在用户脚本管理器的菜单项可以切换可用线路，以适应不同地区的网络环境。编辑用户脚本的 `sources` 常量可以加入自定义线路。

目前脚本将默认在 **微博**、**贴吧**、**哔哩哔哩** 页面下运行。编辑脚本头部的 `@match` 规则可以添加更多网站。

![](assets/mirror.png)

查询时可能提示 *自动获取失败，请手动点击链接*，这是由于 18Comic 使用 Cloudflare 反爬虫保护，需要手动访问一次页面以获取 `cf_clearance` Cookie 以绕过验证。

## 特别致谢
本脚本部分受 **[😩「能不能好好说话？」 拼音首字母缩写翻译工具](https://github.com/itorr/nbnhhsh)** 启发，在此特别致谢。

本脚本已对「能不能好好说话？」进行适配，划词窗口不会相互干扰。

![](assets/preview-nbnhhsh-support.png)

## 许可证
[MIT](LICENSE)