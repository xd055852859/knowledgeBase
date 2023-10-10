<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import dayjs from "dayjs";

const props = defineProps<{
  item: any;
}>();
const emits = defineEmits<{
  (e: "flashArray", key: string, type: string, data: any): void;
}>();
const applyMessage = async (type) => {
  let noticeRes = (await api.request.patch("message/handle", {
    messageKey: props.item._key,
    operate: type,
  })) as ResultProps;
  if (noticeRes.msg === "OK") {
    emits("flashArray", props.item._key, "edit", {
      needReply: type === "refuse" ? 0 : 2,
    });
    // flashArray(item._key)
    // dispatch(setMessage([true,"success","]))
  }
};
</script>
<template>
  <div className="noticeItem">
    <div className="noticeItem-top">
      <div>{{ item.fromUserInfo?.userName }}</div>
      <div>{{ item.log }}</div>
    </div>
    <div className="noticeItem-bottom">
      <div className="noticeItem-bottom-left">
        {{ dayjs(item.createTime).format("YYYY/M/D") }} ·
        {{ item.bookInfo?.name }}
      </div>
      <template v-if="item.type === 'applyJoin'">
        <div className="noticeItem-bottom-right" v-if="item.needReply === 1">
          <div
            className="noticeItem-bottom-button"
            @click="applyMessage('agree')"
          >
            同意
          </div>
          <div
            className="noticeItem-bottom-button"
            :style="{ background: '#939393' }"
            @click="applyMessage('refuse')"
          >
            拒绝
          </div>
        </div>
        <div
          className="noticeItem-bottom-text"
          v-else-if="item.needReply === 0"
        >
          已拒绝
        </div>

        <div
          className="noticeItem-bottom-text"
          v-else-if="item.needReply === 2"
        >
          已同意
        </div>
      </template>
    </div>
  </div>
</template>
<style scoped lang="scss">
.noticeItem {
  width: 310px;
  height: 77px;
  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 6px;
  padding: 18px 14px;
  box-sizing: border-box;
  margin-bottom: 15px;
  .noticeItem-top {
    width: 100%;
    height: 20px;
    line-height: 20px;
    margin-bottom: 7px;

    @include flex(flex-start, center, null);
    > div:nth-child(1) {
      font-weight: 500;
      margin-right: 10px;
      font-size: 14px;
      // color: #333333;
    }
    > div:nth-child(2) {
      font-size: 13px;
      color: #666;
    }
  }
  .noticeItem-bottom {
    width: 100%;
    height: 17px;
    @include flex(space-between, center, null);
    .noticeItem-bottom-left {
      flex: 1;
      height: 100%;
      font-size: 12px;
      color: #999999;
    }
    .noticeItem-bottom-right {
      width: 90px;
      height: 100%;
      @include flex(space-between, center, null);
      font-size: 12px;
      color: #999999;
      .noticeItem-bottom-button {
        width: 40px;
        height: 22px;
        color: #fff;
        font-size: 12px;
        text-align: center;
        line-height: 22px;
        cursor: pointer;
        background-color: #0091ff;
      }
    }
    .noticeItem-bottom-text {
      width: 40px;
      height: 100%;
      font-size: 12px;
      color: #999999;
    }
  }
}
</style>
<style></style>
