import Vue from "vue";
import App from "./App.vue";
import "@mdi/font/css/materialdesignicons.css";
import router from "./router";
import store from "./store";
import Buefy from "buefy";

Vue.config.productionTip = false;

Vue.use(Buefy);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
