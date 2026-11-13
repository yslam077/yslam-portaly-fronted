import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";
import "./assets/main.css";
import "./assets/effects.css";
import fx from "./directives/fx";

const app = createApp(App);
const pinia = createPinia();

// Важен порядок: сначала плагины, потом mount!
app.use(pinia);
app.use(router);
app.use(i18n);
app.use(fx);
app.mount("#app");
