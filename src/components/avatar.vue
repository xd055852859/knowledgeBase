<script setup lang="ts">
import defaultPersonPng from "@/assets/img/common/defaultPerson.png";
import defaultGroupPng from "@/assets/img/common/defaultGroup.png";
const props = withDefaults(
  defineProps<{
    src: any;
    alt?: string;
    type?: string;
    index?: number;
    size?: number;
    imgStyle?: any;
  }>(),
  { index: 0, type: "person", size: 35 }
);
const BgColorArray = [
  "#1890ff",
  "rgb(0,170,255)",
  "rgb(143,126,230)",
  "rgb(179,152,152)",
  "rgb(242,237,166)",
];
const bgColor = computed(() => {
  return BgColorArray[props.index % 5];
});
// const emits = defineEmits<{
//   (e: "setTargetIndex", index: number): void;
// }>();
</script>
<template>
  <div
    :style="{
      borderRadius: type === 'person' ? '50%' : '10%',
      width: size + 'px',
      height: size + 'px',
      ...props.imgStyle,
    }"
    class="avatar-content"
  >
    <template v-if="src">
      <img
        :alt="alt"
        :src="src"
        @error="(e: any) => {
                e.target.onerror = null;
                e.target.src =
                  type === 'person' ? defaultPersonPng : defaultGroupPng;
              }"
        class="avatar-img"
      />
    </template>
    <div className="avatar-img" :style="{ backgroundColor: bgColor }" v-else>
      {{ alt ? alt.substring(0, 1) : "无" }}
    </div>
  </div>
</template>
<style scoped lang="scss">
.avatar-content {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  object-fit: cover;
}
</style>
<style></style>
