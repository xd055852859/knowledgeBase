<script setup lang="ts">
import FontIcon from "@/components/fontIcon.vue";
import Header from "@/components/header.vue";
import { Book } from "@/interface/Book";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import appStore from "@/store";
import dayjs from "dayjs";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
const unJoinedList = ref<Book[]>([]);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const getBookList = async (spaceKey) => {
  let boardRes = (await api.request.get("book", {
    spaceKey: spaceKey,
    joined: false,
    page: 1,
    limit: 1000,
  })) as ResultProps;
  if (boardRes.msg === "OK") {
    unJoinedList.value = boardRes.data;
  }
};
const joinBoard = async (index) => {
  let boardRes = (await api.request.post("bookMember/apply", {
    bookKey: unJoinedList[index]._key,
  })) as ResultProps;
  if (boardRes.msg === "OK") {
    ElMessage.success(
      unJoinedList.value[index].noVerify ||
        (!unJoinedList.value[index].noVerify && boardRes.data)
        ? "加入成功"
        : "申请成功,请等待回复"
    );
    if (boardRes.data) {
      unJoinedList.value.splice(index, 1);
    }
  }
};
watch(
  spaceKey,
  (newKey) => {
    getBookList(newKey);
  },
  { immediate: true }
);
</script>
<template>
  <div class="spaceTable box">
    <Header title="待加入" />
    <div class="box-table">
      <el-table :data="unJoinedList" fit highlight-current-row>
        <el-table-column prop="name" label="目录名称" align="center" />
        <el-table-column label="对外开放" align="center">
          <template #default="scope">
            <FontIcon
              iconName="a-duihao2"
              :iconStyle="{
                fontSize: '22px',
              }"
              v-if="scope.row.isPublic"
            />
          </template>
        </el-table-column>
        <el-table-column label="对内开放" align="center">
          <template #default="scope">
            <FontIcon
              iconName="a-duihao2"
              :iconStyle="{
                fontSize: '22px',
              }"
              v-if="scope.row.noVerify"
            />
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
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <el-button
              type="primary"
              plain
              @click="joinBoard(scope.$index)"
              v-if="scope.row.role === null"
              >{{ scope.row.noVerify ? "加入" : "申请" }}</el-button
            >
            <div v-else>{{ "申请中" }}</div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<style scoped lang="scss">
.spaceTable {
  .spaceTable-button {
    width: 100%;
    height: 100%;
    @include flex(center, center, null);
  }
}
</style>
<style></style>
