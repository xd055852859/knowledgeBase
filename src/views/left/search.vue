<script setup lang="ts">
import Avatar from "@/components/avatar.vue";
import FontIcon from "@/components/fontIcon.vue";
import { ResultProps } from "@/interface/Common";
import { SpaceMember } from "@/interface/Space";
import api from "@/services/api";
import appStore from "@/store";
import { Search } from "@element-plus/icons-vue";
import { storeToRefs } from "pinia";
const { spaceKey } = storeToRefs(appStore.spaceStore);
const searchType = ref<string>("book");
const searchName = ref<string>("");
const searhcList = ref<any>([]);
const selectedPath = ref<any>([]);
const searchNode = async () => {
  if (searchName.value) {
    const nodeRes = (await api.request.get("book/search", {
      spaceKey: spaceKey.value,
      keyWord: searchName.value,
      page: 1,
      limit: 1000,
      type: searchType.value,
    })) as ResultProps;
    if (nodeRes.msg === "OK") {
      searhcList.value = nodeRes.data;
    }
  }
  
};
watch(searchName, (newName) => {
  if (!newName) {
    searhcList.value = [];
  }
});
</script>
<template>
  <div class="search">
    <div class="search-input">
      <el-input
        v-model="searchName"
        :placeholder="`请输入${searchType === 'book' ? '目录' : '节点'}`"
        :suffix-icon="Search"
        @change="searchNode"
      >
        <template #prepend>
          <el-dropdown style="margin-right: 10px">
            <div class="select-third-item">
              <div
                class="select-item-name single-to-long"
                style="font-size: 14px"
              >
                {{ searchType === "book" ? "目录" : "节点" }}
              </div>

              <div
                class="select-item-icon dp-center-center"
                style="width: 15px"
              >
                <FontIcon iconName="xiala" />
              </div>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="searchType = 'book'"
                  >目录</el-dropdown-item
                >
                <el-dropdown-item @click="searchType = 'node'"
                  >节点</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-input>
    </div>
    <div class="search-table">
      <el-table
        :data="searhcList"
        style="width: 100%; height: 100%"
        fit
        highlight-current-row
      >
        <el-table-column label="名称" align="center">
          <template #default="scope">
            <div class="dp--center">
              <FontIcon
                :iconName="scope.row.docType ? scope.row.docType : 'wenjianjia'"
                :iconStyle="{
                  fontSize: '22px',
                  color: '#333',
                  marginRight: '10px',
                }"
              />
              <div v-if="searchType === 'node'">
                <div
                  v-for="(item, index) in selectedPath"
                  :key="`'path'+index˝`"
                >
                  <div>
                    {{ item.name }}
                  </div>
                  <div style="margin-bottom: 3px">
                    {{ index !== selectedPath.length - 1 ? " > " : "" }}
                  </div>
                </div>
              </div>
              <div v-else>{{ scope.row.name }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="创建人" align="center">
          <template #default="scope">
            <div class="dp-center-center">
              <Avatar
                :src="scope.row.creatorInfo?.userAvatar"
                :alt="scope.row.creatorInfo?.userName"
                type="person"
                :size="30"
                :imgStyle="{ marginRight: '10px' }"
              />
              {{ scope.row.creatorInfo?.userName }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<style scoped lang="scss">
.search {
  width: 660px;
  height: 60vh;
  .search-input {
    width: 600px;
    height: 35px;

    margin-bottom: 15px;
    @include flex(flex-start, center, null);
  }
  .search-table {
    width: 600px;
    height: calc(100% - 50px);
  }
}
</style>
<style lang="scss">
.search-input {
  .el-input__wrapper {
    border-top-right-radius: 24px;
    border-bottom-right-radius: 24px;
  }
  .el-input-group__prepend {
    width: 60px;
    background-color: transparent;
    border-top-left-radius: 24px;
    border-bottom-left-radius: 24px;
  }
}
</style>
