<script setup lang="ts">
import appStore from "@/store";
import { storeToRefs } from "pinia";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { ElMessage, ElMessageBox } from "element-plus";
import _ from "lodash";
import { SpaceDetail } from "@/interface/Space";
import { uploadFile } from "@/services/util";
import { Plus } from "@element-plus/icons-vue";
import router from "@/router";
import Header from "@/components/header.vue";
const { user } = storeToRefs(appStore.authStore);
const { spaceKey, spaceDetail, spaceList } = storeToRefs(appStore.spaceStore);
const { setSpaceDetail, setSpaceList } = appStore.spaceStore;
const name = ref<string>("");
const logo = ref<string>("");
const outVisible = ref<boolean>(false);
const updateSpace = async () => {
  let updateRes = (await api.request.patch("space", {
    spaceKey: spaceKey.value,
    name: name.value,
    logo: logo.value,
  })) as ResultProps;
  if (updateRes.msg === "OK") {
    ElMessage.success("编辑空间成功");
    let detail: any = _.cloneDeep(spaceDetail.value);
    detail.spaceInfo = {
      ...detail.spaceInfo,
      name: name.value,
      logo: logo.value,
    };
    setSpaceDetail(detail);
    let list: any = _.cloneDeep(spaceList.value);
    let index = list?.findIndex((item) => item._key === detail.spaceInfo._key);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        name: name.value,
        logo: logo.value,
      };
      setSpaceList(list);
    }
  }
};
const uploadImage = (file, type) => {
  let mimeType = ["image/*"];
  if (file) {
    uploadFile(file, mimeType, async (url, name) => {
      logo.value = url;
    });
  }
};
const outSpace = async () => {
  ElMessageBox.prompt(
    "确定要解散空间吗？请手动输入空间名称，确认后解散",
    "解散空间",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    }
  )
    .then(async ({ value }) => {
      if (value === name.value) {
        let updateRes = (await api.request.delete("space", {
          spaceKey: spaceKey,
        })) as ResultProps;
        if (updateRes.msg === "OK") {
          const list = _.cloneDeep(spaceList.value);
          ElMessage.success("解散空间成功");
          outVisible.value = false;
          let index = list.findIndex((item) => item._key === spaceKey.value);
          if (index !== -1) {
            if (user.value?.privateSpace) {
              spaceKey.value = user.value?.privateSpace;
            }
            list.splice(index, 1);
            setSpaceList(list);
            router.replace("/detail");
          }
        }
      } else {
        ElMessage.error("请输入正确的空间名");
      }
    })
    .catch(() => {});
};
watch(
  spaceDetail,
  (newDetail) => {
    if (newDetail?.spaceInfo) {
      name.value = newDetail.spaceInfo.name;
      logo.value = newDetail.spaceInfo.logo;
    }
  },
  { immediate: true }
);
</script>
<template>
  <div class="basic">
    <Header title="基础设置">
      <template #button>
        <el-button type="primary" @click="updateSpace()"> 保存 </el-button>
      </template>
    </Header>
    <div class="basic-container">
      <div class="basic-logo">
        <div class="upload-button upload-img-button logo-box">
          <img
            :src="logo"
            alt=""
            :style="{ width: '100%', height: '100%' }"
            class="upload-cover"
            v-if="logo"
          />
          <el-icon :size="50" color="#ebebeb" v-else>
            <Plus />
          </el-icon>
          <input
            type="file"
            accept="image/*"
            @change="
              //@ts-ignore
              uploadImage($event.target.files[0], 'space')
            "
            class="upload-img"
          />
        </div>
      </div>
      <div class="basic-input">
        <div>拥有者 :</div>
        <div>{{ spaceDetail?.spaceInfo.ownerInfo.userName }}</div>
      </div>
      <div class="basic-input">
        <div>空间名 :</div>
        <div>
          <el-input v-model="name" placeholder="请输入空间名" size="large" />
          <!-- <template #prepend>
        <el-select v-model="mobileArea" placeholder="请选择区号" :style="{width:'70px'}">
          <el-option label="86" value="+86" />
        </el-select> 
        </template> -->
        </div>
      </div>
      <div class="basic-input">
        <div>成员数 :</div>
        <div>{{ spaceDetail?.spaceInfo.memberCount }}</div>
      </div>
      <div class="basic-input">
        <div>空间容量 :</div>
        <div></div>
      </div>
      <div class="basic-input">
        <div>解散空间 :</div>
        <div>
          <el-button @click="outSpace()" type="primary"> 解散空间 </el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.basic {
  width: 100%;
  height: 100%;
  font-size: 16px;
  @include flex(center, center, wrap);
  .basic-container {
    width: 80%;
    height: calc(100% - 70px);
    .basic-logo {
      width: 100%;
      height: 300px;
      @include flex(flex-start, center, null);
      .logo-box {
        width: 250px;
        height: 250px;
        border-radius: 12px;
        overflow: hidden;
        .logo-item {
          font-size: 50px;
          color: #ebebeb;
        }
      }
    }
    .basic-input {
      width: 100%;
      height: 45px;
      margin-bottom: 15px;
      @include flex(flex-start, center, null);
      > div:nth-child(1) {
        width: 120px;
      }
      > div:nth-child(2) {
        width: calc(100% - 90px);
      }
    }
  }
}
</style>
<style></style>
