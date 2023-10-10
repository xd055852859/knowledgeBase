<script setup lang="ts">
import FontIcon from "@/components/fontIcon.vue";
import Header from "@/components/header.vue";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import appStore from "@/store";
import dayjs from "dayjs";
import { storeToRefs } from "pinia";
const { bookDetail } = storeToRefs(appStore.bookStore);
const { nodeKey, nodeDetail, nodeRefresh } = storeToRefs(appStore.nodeStore);
const { setNodeKey, setNodeRefresh } = appStore.nodeStore;
const nodeList = ref<any>([]);
const selectedPath = ref<any>([]);
const getNodeTable = async (key) => {
  const nodeRes = (await api.request.get("node/list", {
    nodeKey: key,
  })) as ResultProps;
  if (nodeRes.msg === "OK") {
    nodeList.value = nodeRes.data;
  }
};
const getNodePath = async (nodeKey, startNodeKey, includeStartNodeKey) => {
  let pathRes = (await api.request.get("node/way", {
    nodeKey: nodeKey,
    startNodeKey: startNodeKey,
    includeStartNodeKey: includeStartNodeKey,
  })) as ResultProps;
  if (pathRes.msg === "OK") {
    selectedPath.value = pathRes.data;
  }
};
const chooseNode = (key) => {
  setNodeKey(key);
};
watch(
  nodeKey,
  (newKey) => {
    if (newKey) {
      getNodeTable(newKey);
      getNodePath(newKey, bookDetail.value?.rootKey, true);
    }
  },
  { immediate: true }
);
watch(nodeRefresh, (newRefresh) => {
  if (newRefresh) {
    getNodeTable(nodeKey.value);
    getNodePath(nodeKey.value, bookDetail.value?.rootKey, true);
    setNodeRefresh(false);
  }
});
</script>
<template>
  <div class="nodeTable box">
    <div class="nodeTable-header dp--center">
      <div class="nodeTable-path">
        <div v-for="(item, index) in selectedPath" :key="`'path'+index˝`">
          <div
            @click="item._key !== nodeKey ? chooseNode(item._key) : null"
            :style="
              item._key === nodeKey
                ? { fontSize: '18px', fontWeight: 500, color: '#333' }
                : {}
            "
          >
            {{ item.name }}
          </div>
          <div style="margin-bottom: 3px">
            {{ index !== selectedPath.length - 1 ? " > " : "" }}
          </div>
        </div>
      </div>
    </div>
    <div class="nodeTable-table box-table">
      <el-table
        :data="nodeList"
        style="width: 100%; height: 100%"
        fit
        highlight-current-row
      >
        <el-table-column label="类型" align="center">
          <template #default="scope">
            <FontIcon
              :iconName="scope.row.docType ? scope.row.docType : 'wenjianjia'"
              :iconStyle="{
                fontSize: '22px',
                color: '#333',
              }"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="成员名称" />

        <el-table-column label="子文件" align="center">
          <template #default="scope">
            {{ scope.row.childNum }}个子文件
          </template>
        </el-table-column>
        <el-table-column label="最近编辑" align="center">
          <template #default="scope">
            {{ dayjs(scope.row.updateTime).format("YYYY-M-DD HH:mm") }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center">
          <template #default="scope">
            {{ dayjs(scope.row.createTime).format("YYYY-M-DD HH:mm") }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<style scoped lang="scss">
.nodeTable {
  .nodeTable-header {
    width: 100%;
    height: 40px;
    .nodeTable-path {
      width: 100%;
      height: 100%;
      font-size: 14px;
      color: #999;
      margin-left: 10px;
      font-weight: 400;
      @include flex(flex-start, center, null);
      > div {
        height: 100%;
        @include flex(center, center, null);
        > div {
          height: 100%;
          cursor: pointer;
          margin: 0px 3px;
          @include flex(center, center, null);
        }
      }
    }
  }
  .nodeTable-table {
  }
}
</style>
<style></style>
