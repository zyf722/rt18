import { defineConfig } from 'vite';
import monkey, { cdn } from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: '18Comic 之路',
        description: 'JM / 18Comic 车牌号划词查询工具',
        license: 'MIT',
        version: '1.0',
        author: 'zyf722',
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=18comic.vip',
        namespace: 'https://github.com/zyf722',
        match: [
          '*://weibo.com/*',
          '*://*.weibo.com/*',
          '*://*.weibo.cn/*',
          '*://tieba.baidu.com/*',
          '*://*.bilibili.com/',
          '*://*.bilibili.com/*',
        ],
      },
      build: {
        externalGlobals: {
          'crypto-js': cdn.jsdelivr('crypto-js'),
        },
      },
    }),
  ],
});
