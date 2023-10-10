<script setup lang="ts">
import Left from "@/views/left/index.vue";
import Right from "@/views/right/index.vue";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import Tree from "./tree/tree.vue";
const { fullState } = storeToRefs(appStore.commonStore);
const { nodes } = storeToRefs(appStore.nodeStore);
const { setFullState } = appStore.commonStore;
</script>
<template>
  <div class="home">
    <div class="treeLeft" v-if="fullState">
      <Tree :list="nodes" type="left" />
    </div>
    <Left v-else />
    <Right />
  </div>
</template>
<style scoped lang="scss">
.home {
  width: 100vw;
  height: 100vh;
  @include flex(space-between, center, null);
  .treeLeft {
    width: 240px;
    height: 100vh;
    padding: 20px 0px 10px 0px;
    box-sizing: border-box;
    background: #f9f9f9;
    box-shadow: 1px 0px 0px 0px #e1e1e1;
    position: relative;
    z-index: 10;
  }
}
</style>
<style></style>
