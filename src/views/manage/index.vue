<script setup lang="ts">
import appStore from "@/store";
import { storeToRefs } from "pinia";
import arrowdownSvg from "@/assets/svg/common/arrowdown.svg";
import Avatar from "@/components/avatar.vue";
import FontIcon from "@/components/fontIcon.vue";
const { setSpaceKey } = appStore.spaceStore;
const { user } = storeToRefs(appStore.authStore);
const { spaceKey, spaceDetail, spaceList } = storeToRefs(appStore.spaceStore);
const { bookList, bookKey } = storeToRefs(appStore.bookStore);
</script>
<template>
  <div class="manage">
    <div class="manage-left">
      <el-dropdown trigger="click">
        <div class="select-third-item left-title">
          <div class="select-item-logo">
            <Avatar
              :src="
                spaceDetail?.spaceInfo.logo ? spaceDetail?.spaceInfo.logo : ''
              "
              :alt="
                spaceDetail?.spaceInfo.name ? spaceDetail?.spaceInfo.name : ''
              "
              type="group"
              :size="30"
            />
          </div>
          <div class="select-item-name dp--center">
            {{ spaceDetail?.spaceInfo.name }}
          </div>
          <div class="select-item-icon dp-center-center">
            <FontIcon iconName="xiala" />
          </div>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <template v-for="(item, index) in spaceList" :key="item._key">
              <el-dropdown-item
                v-if="item._key !== user?.privateSpace"
                @click="setSpaceKey(item._key)"
                class="select-third-item title-space"
              >
                <div class="select-item-logo">
                  <Avatar
                    :src="item.logo"
                    :alt="item.name"
                    type="group"
                    :size="30"
                  />
                </div>
                <div class="select-item-name">{{ item.name }}</div>
              </el-dropdown-item>
            </template>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-menu class="left-menu" :default-active="$route.fullPath" router>
        <el-menu-item index="/manage/basic"> 基础设置 </el-menu-item>
        <el-menu-item index="/manage/member"> 成员管理 </el-menu-item>
      </el-menu>

      <el-tooltip content="退出中台">
        <div class="left-bottom" @click="$router.replace('/')">
          <FontIcon
            iconName="tuichuzhongtai"
            :iconStyle="{
              fontSize: '40px',
            }"
          />
        </div>
      </el-tooltip>
    </div>
    <div class="manage-right">
      <router-view></router-view>
    </div>
  </div>
</template>
<style scoped lang="scss">
.manage {
  width: 100vw;
  height: 100vh;
  @include flex(space-between, center, null);
  .manage-left {
    width: 250px;
    height: 100vh;
    padding: 0px 13px 10px 13px;
    box-sizing: border-box;
    background: #f9f9f9;
    box-shadow: 1px 0px 0px 0px #e1e1e1;
    position: relative;
    z-index: 20;
    .left-title {
      width: 200px;
      height: 70px;
      border-bottom: 1px solid #e5e5e5;
    }

    .left-menu {
      padding: 12px 0px;
      box-sizing: border-box;
      border: 0px;
    }
    .left-bottom {
      width: 100%;
      height: 32px;
      position: absolute;
      z-index: 2;
      left: 0px;
      bottom: 20px;
      font-size: 30px;
      cursor: pointer;
      @include flex(center, center, null);
    }
  }
  .manage-right {
    width: calc(100vw - 250px);
    height: 100vh;
  }
}
</style>
<style lang="scss">
.manage {
  .manage-left {
    .el-menu {
      background-color: #f9f9f9;
    }
  }
}
</style>
