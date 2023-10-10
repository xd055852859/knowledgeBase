<script setup lang="ts">
import api from "@/services/api";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import IframeView from "@/components/iframeView.vue";
const { token } = storeToRefs(appStore.authStore);
const { nodeDetail } = storeToRefs(appStore.nodeStore);
const nodeUrl = ref<string>("");
watch(
  nodeDetail,
  (newDetail) => {
    if (newDetail) {
      const getApi = api.API_URL + "node/detail";
      const getParams = `{"nodeKey": "${newDetail._key}" }`;
      const patchApi = api.API_URL + "node";
      const patchData = `["content", "name"]`;
      const uptokenApi = api.API_URL + "account/qiniuToken";
      const uptokenParams = `{"target": "cdn-org"}`;
      switch (newDetail.docType) {
        case "text":
          nodeUrl.value = `https://notecute.com/#/editor?token=${token.value}&getDataApi={"url":"${getApi}","params":${getParams}}&patchDataApi={"url":"${patchApi}","params":${getParams},"docDataName":"content"}&getUptokenApi={"url":"${uptokenApi}","params":${uptokenParams}}`;
          break;
        case "draw":
          nodeUrl.value = `https://draw.workfly.cn/?token=${token.value}&getDataApi={"url":"${getApi}","params":${getParams}}&patchDataApi={"url":"${patchApi}","params":${getParams},"docDataName":${patchData}}&getUptokenApi={"url":"${uptokenApi}","params":${uptokenParams}}&isEdit=2`;
          break;
        case "mind":
          nodeUrl.value = `https://mind.qingtime.cn/?token=${token.value}&getDataApi={"url":"${getApi}","params":${getParams}}&patchDataApi={"url":"${patchApi}","params":${getParams},"docDataName":"content"}&getUptokenApi={"url":"${uptokenApi}","params":${uptokenParams}}&isEdit=2&hideHead=1`;
          break;
      }
    }
  },
  { immediate: true }
);
</script>
<template>
  <IframeView :url="nodeUrl" :title="nodeDetail.name" v-if="nodeDetail" />
</template>
<style scoped lang="scss"></style>
<style></style>
