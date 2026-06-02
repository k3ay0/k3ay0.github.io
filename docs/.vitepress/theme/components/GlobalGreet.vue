<script setup lang="ts" name="GlobalGreet">
import { TkMessage, isClient } from "vitepress-theme-teek";
import { ref, watch } from "vue";
import { useRoute } from "vitepress";

const route = useRoute();

const hasGreet = ref(false);
const duration = 4000;

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const greet = () => {
  if (hasGreet.value || !isClient) return;

  // 仅在首页触发
  if (route.path !== "/" && route.path !== "/index.html") return;

  hasGreet.value = true;
  setTimeout(() => {
    hasGreet.value = false;
  }, duration);

  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();

  const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
  const message = getGreetingMessage(hours, timeStr);

  TkMessage.primary({ message, duration, plain: true, offset: 80 });
};

const getGreetingMessage = (hours: number, timeStr: string) => {
  if (hours >= 6 && hours < 10) {
    return getRandomItem([
      `早上好！现在是 ${timeStr}，新的一天从代码开始 ☕`,
      `早安！现在是 ${timeStr}，今天也要元气满满 🌅`,
      `早上好！现在是 ${timeStr}，准备好迎接新的挑战了吗 💪`,
      `早安！现在是 ${timeStr}，一杯咖啡开启高效的一天 🎯`,
    ]);
  }

  if (hours >= 10 && hours < 12) {
    return getRandomItem([
      `上午好！现在是 ${timeStr}，保持专注，继续 coding 🚀`,
      `上午好！现在是 ${timeStr}，灵感来了就赶紧抓住 ✨`,
      `上午好！现在是 ${timeStr}，代码写得怎么样了 🔥`,
      `上午好！现在是 ${timeStr}，摸鱼时间到（不是）😄`,
    ]);
  }

  if (hours >= 12 && hours <= 16) {
    return getRandomItem([
      `下午好！现在是 ${timeStr}，注意休息，保护眼睛 🖥️`,
      `下午好！现在是 ${timeStr}，午饭吃饱了吗 🍜`,
      `下午好！现在是 ${timeStr}，来杯下午茶提提神 🧋`,
      `下午好！现在是 ${timeStr}，困了就眯一会儿 😴`,
    ]);
  }

  if (hours >= 16 && hours <= 19) {
    return getRandomItem([
      `傍晚好！现在是 ${timeStr}，该放松一下了 🌅`,
      `傍晚好！现在是 ${timeStr}，夕阳无限好 🌇`,
      `傍晚好！现在是 ${timeStr}，准备收工去吃饭吧 🍲`,
      `傍晚好！现在是 ${timeStr}，今天辛苦了，犒劳一下自己 🎉`,
    ]);
  }

  if (hours >= 19 && hours < 24) {
    return getRandomItem([
      `晚上好！现在是 ${timeStr}，今天有什么收获吗 📝`,
      `晚上好！现在是 ${timeStr}，夜深了还在 coding 吗 🌙`,
      `晚上好！现在是 ${timeStr}，别忘了适当休息 🛋️`,
      `晚上好！现在是 ${timeStr}，晚上适合学习新知识 📚`,
    ]);
  }

  if (hours >= 0 && hours < 6) {
    return getRandomItem([
      `夜深了！现在是 ${timeStr}，早点休息，明天继续奋斗 💤`,
      `这么晚了！现在是 ${timeStr}，身体是革命的本钱 🏥`,
      `夜猫子！现在是 ${timeStr}，该睡觉啦 🌟`,
      `还没睡？现在是 ${timeStr}，熬夜会变秃的（认真脸）🧑‍🦲`,
    ]);
  }

  return `你好！现在是 ${timeStr}。`;
};

watch(route, greet, { immediate: true });
</script>

<template></template>
