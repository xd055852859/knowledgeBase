<script setup lang="ts">
import { storeToRefs } from "pinia";
import appStore from "@/store";
import router from "@/router";
const route = useRoute();
import leftSvg from "@/assets/svg/left.svg";
import rightSvg from "@/assets/svg/right.svg";
import leftOverSvg from "@/assets/svg/leftOver.svg";
import rightOverSvg from "@/assets/svg/rightOver.svg";
import FontIcon from "@/components/fontIcon.vue";
const { closeNum } = storeToRefs(appStore.commonStore);
const mouseState = ref<boolean>(false);
onMounted(() => {
  console.log(route);
  if (route.name === "nodeTable" || route.name === "nodeDetail") {
    router.replace("/detail/spaceTable");
  }
});
</script>
<template>
  <div class="right">
    <router-view></router-view>
    <div
      class="expand-button"
      @mouseenter="mouseState = true"
      @mouseleave="mouseState = false"
      @click="closeNum=closeNum === 0?1:0"
    >
      <img
       :src="
          mouseState
            ? closeNum === 0
              ?leftOverSvg
              :rightOverSvg
            : closeNum === 0
            ? leftSvg
            : rightSvg
        "
      />
    </div>
  </div>
</template>
<style scoped lang="scss">
.right {
  flex: 1;
  height: 100vh;
  position: relative;
  z-index: 1;
  .expand-button {
    width: 16px;
    height: 40px;
    position: absolute;
    left: 0px;
    top: 84px;
    z-index: 10;
    cursor: pointer;
    img{
      width:100%;
      height:100%;
    }
  }
}
</style>
<style></style>
