<script setup lang="ts">
import FontIcon from "./fontIcon.vue";
import { OnClickOutside } from "@vueuse/components";
const props = defineProps<{
  visible: boolean;
  drawerStyle?: any;
  title?: string;
  showClose?: boolean;
}>();
const emits = defineEmits<{
  (e: "close"): void;
}>();
</script>
<template>
  <OnClickOutside @trigger="emits('close')" v-if="visible">
    <div class="drawer" :style="drawerStyle">
      <div class="drawer-header dp-space-center">
        <div class="drawer-header-left">{{ title }}</div>
        <div class="drawer-header-right">
          <slot name="button" />
          <!-- -->
          <div class="drawer-header-close" v-if="showClose">
            <FontIcon iconName="guanbi" />
          </div>
        </div>
      </div>
      <slot name="content" />
      <slot name="footer" />
    </div>
  </OnClickOutside>
</template>
<style scoped lang="scss">
.drawer {
  width: 300px;
  height: 100vh;
  background: #f9f9f9;
  box-shadow: 2px 2px 9px 0px rgba(178, 178, 178, 0.5);
  position: fixed;
  top: 0px;
  left: 0px;

  .drawer-header {
    width: 100%;
    height: 50px;
    font-size: 16px;
    font-weight: 500;
    color: #000000;
    padding: 0px 25px;
    box-sizing: border-box;
    .drawer-header-right {
      @include flex(flex-end, center, null);
    }
  }
}
</style>
<style></style>
