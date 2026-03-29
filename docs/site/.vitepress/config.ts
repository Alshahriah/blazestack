import { defineConfig } from "vitepress";

export default defineConfig({
  title: "blazestack",
  description: "Blazing fast full-stack apps. Ship web, API, and mobile from one repo.",
  outDir: "./dist",
  ignoreDeadLinks: true,

  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["meta", { name: "og:image", content: "https://s6.imgcdn.dev/Y2Bbiu.png" }],
  ],

  themeConfig: {
    logo: "https://s6.imgcdn.dev/Y2Bbiu.png",
    siteTitle: "Blazestack",

    nav: [
      { text: "Guide", link: "/getting-started" },
      { text: "Packages", link: "/packages" },
      { text: "Deploying", link: "/deploying" },
      {
        text: "npm",
        link: "https://www.npmjs.com/package/create-blaze",
      },
    ],

    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Getting Started", link: "/getting-started" },
          { text: "Architecture", link: "/architecture" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "Packages", link: "/packages" },
          { text: "Authentication", link: "/authentication" },
          { text: "Adding Features", link: "/adding-features" },
        ],
      },
      {
        text: "Deployment",
        items: [
          { text: "Deploying", link: "/deploying" },
          { text: "Troubleshooting", link: "/troubleshooting" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/Alshahriah/blazestack" },
      { icon: "npm", link: "https://www.npmjs.com/package/create-blaze" },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2026 blazestack",
    },

    search: {
      provider: "local",
    },
  },
});
