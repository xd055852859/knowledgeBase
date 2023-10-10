<script setup lang="ts">
import FontIcon from "@/components/fontIcon.vue";
import Header from "@/components/header.vue";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import appStore from "@/store";
import dayjs from "dayjs";
import { storeToRefs } from "pinia";
const { bookList } = storeToRefs(appStore.bookStore);
const { spaceDetail } = storeToRefs(appStore.spaceStore);
const { setCreateBookVisible } = appStore.bookStore;
</script>
<template>
  <div class="spaceTable box">
    <Header
      :title="spaceDetail?.spaceInfo?.name ? spaceDetail.spaceInfo.name : ''"
    />
    <div class="box-table">
      <el-table
        :data="bookList"
        fit
        highlight-current-row
        v-if="bookList.length > 0"
      >
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
      </el-table>
      <div class="spaceTable-button" v-else>
        <el-button type="primary" @click="setCreateBookVisible(true)" size="large">+ 创建目录</el-button>
      </div>
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
