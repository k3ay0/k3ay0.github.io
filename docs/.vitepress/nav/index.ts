import frontEnd from "../nav/frontEnd";
import aiNav from "../nav/aiNav";
import securityNav from "../nav/securityNav";
import toolNav from "../nav/toolNav";
import moreNav from "../nav/moreNav";
import indexNav from "../nav/indexNav";
import essaysNav from "../nav/essaysNav";
import projectNav from "../nav/projectNav";

export default [
  {
    text: "首页",
    link: "/",
  },
  frontEnd, // 前端导航
  aiNav, // AI导航
  securityNav, // 安全导航
  toolNav, // 工具导航
  projectNav, // 项目导航
  essaysNav, // 随笔导航
  moreNav, // 更多导航
  indexNav, // 索引导航
];
