import { defineTeekConfig } from "vitepress-theme-teek/config";

export const teekConfig = defineTeekConfig({
  pageStyle: "segment-nav",
  author: { name: "k3ay0", link: "https://github.com/k3ay0" },
  wallpaper: {
    enabled: true,
  },
  banner: {
    name: "🎉 珪瞳雑感",
    bgStyle: "fullImg",
    imgSrc: ["/banner/banner-bg1.webp", "/banner/banner-bg2.webp"],
    description: [
      "前端探索，安全攻防，AI思考 —— 技术之路永无止境",
      "代码是诗，安全是盾，智能是翼 —— 构建未来",
      "每一次调试都是与机器的对话，每一次突破都是思维的飞跃",
    ],
    descStyle: "types",
  },
  blogger: {
    avatar: "avatar.webp",
    shape: "square",
    name: "k3ay0",
    slogan: "探索前端边界，守护安全底线，思考AI未来",
  },
  docAnalysis: {
    createTime: "2026-06-01",
    statistics: {
      provider: "busuanzi",
    },
  },
  footerInfo: {
    copyright: {
      createYear: 2026,
      suffix: "k3ay0",
    },
    customHtml: `<span id="runtime"></span>`, // 搭配 .vitepress/theme/helper/useRuntime.ts 使用
  },
  social: [
    {
      icon: "mdi:github",
      name: "GitHub",
      link: "https://github.com/k3ay0",
    },
  ],
  codeBlock: {
    copiedDone: TkMessage => TkMessage.success("复制成功！"),
  },
  articleShare: { enabled: true },
  vitePlugins: {
    sidebarOption: {
      initItems: false,
      collapsed: true,
    },
  },
  siteAnalytics: [
    {
      provider: "baidu",
      options: {
        id: "83ffffafdd0510006f0ecd327cde6750",
      },
    },
  ],
});
