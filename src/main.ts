import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import { registerStore } from "@/store";
import router from "@/router";
import 'dayjs/locale/zh-cn'
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import ElementPlus from "element-plus";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "./styles/common/index.scss";
import "./styles/element/index.scss";
import "element-plus/dist/index.css";
const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

dayjs.extend(relativeTime);
dayjs.locale("zh-cn");
app.provide("dayjs", dayjs);

app
  .use(router)
  .use(ElementPlus, {
    locale: zhCn,
  })
  .use(pinia);
registerStore();
app.mount("#app");
