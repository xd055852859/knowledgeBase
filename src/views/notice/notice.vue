<script setup lang="ts">
import NoticeItem from "@/components/item/noticeItem.vue";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import _ from "lodash";
const { spaceKey } = storeToRefs(appStore.spaceStore);
const noticeList = ref<any>([]);
const hasRead = ref<number>(0);
const page = ref<number>(1);
const total = ref<number>(1);
const props = defineProps<{
  clearNum: number;
}>();
const getNotice = async () => {
  let noticeRes = (await api.request.get("message", {
    spaceKey: spaceKey.value,
    hasRead: +hasRead.value,
    page: page.value,
    limit: 30,
  })) as ResultProps;
  if (noticeRes.msg === "OK") {
    let list = _.cloneDeep(noticeList);
    if (page.value === 1) {
      list = [];
    }
    noticeList.value = [...list, ...noticeRes.data];
    total.value = noticeRes.total as number;
  }
};
const flashArray = (key, type: string, data: any) => {
  let list = _.cloneDeep(noticeList);
  let index = list.findIndex((item) => item._key === key);
  if (index !== -1) {
    if (type === "delete") {
      list.splice(index, 1);
    } else {
      list[index] = {
        ...list[index],
        ...data,
      };
    }
  }
  console.log(list);
  noticeList.value = list;
};
watch(
  () => props.clearNum,
  (newNum) => {
    if (newNum && !hasRead) {
      noticeList([]);
    }
  }
);
watch(
  page,
  () => {
    getNotice();
  },
  { immediate: true }
);
watch(hasRead, () => {
  if (page.value !== 1) {
    page.value = 1;
  } else {
    getNotice();
  }
});
</script>
<template>
  <div className="notice">
    <el-tabs v-model="hasRead">
      <el-tab-pane label="未读" :name="0">
        <template v-for="(item, index) in noticeList" :key="`notice${index}`">
          <NoticeItem :item="item" @flashArray="flashArray" />
        </template>
      </el-tab-pane>
      <el-tab-pane label="已读" :name="1">
        <template v-for="(item, index) in noticeList" :key="`notice${index}`">
          <NoticeItem :item="item" @flashArray="flashArray" /> </template
      ></el-tab-pane>
    </el-tabs>
  </div>
</template>
<style scoped lang="scss">
.notice {
  width: 100%;
  height: calc(100% - 50px);
  padding: 10px 25px;
  box-sizing: border-box;
  background: #f9f9f9;
  @include scroll();
  .notice-list {
    width: 100%;
    height: 100%;
    @include scroll();
  }
}
</style>
<style></style>
