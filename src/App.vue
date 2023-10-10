<script setup lang="ts">
import router from "@/router";
import api from "./services/api";
import appStore from "./store";
import { storeToRefs } from "pinia";
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { token } = storeToRefs(appStore.authStore);
const { setToken, getUserInfo } = appStore.authStore;
const { getSpaceList, getSpaceMemberList, getSpaceDetail } =
  appStore.spaceStore;
onMounted(() => {
  if (localStorage.getItem("auth_token")) {
    let token = localStorage.getItem("auth_token") as string;
    setToken(token);
    api.setToken(token);
    // navigate("/home");
  } else {
    router.push("/login");
  }
});
watch(
  token,
  (newToken) => {
    if (newToken) {
      getUserInfo();
      getSpaceList();
    }
  },
  { immediate: true }
);
watch(
  spaceKey,
  (newKey) => {
    if (newKey && token.value) {
      getSpaceDetail();
      getSpaceMemberList();
    }
  },
  { immediate: true }
);
</script>

<template>
  <router-view></router-view>
</template>

<style lang="scss">
#app {
  -webkit-tap-highlight-color: transparent;
  font-family: PingFang SC, PingFang SC-Semibold;
}
*::-webkit-scrollbar {
  width: 4px;
  height: 2px;
}
*::-webkit-scrollbar-thumb {
  // background: #86b93f;
  border-radius: 100px;
}
</style>
