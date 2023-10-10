<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import Avatar from "@/components/avatar.vue";
import FontIcon from "@/components/fontIcon.vue";
import Notice from "@/views/notice/notice.vue";
import _ from "lodash";
import appStore from "@/store";
import { Close, Plus } from "@element-plus/icons-vue";
import { formatData, uploadFile } from "@/services/util";
import { storeToRefs } from "pinia";
import { ElMessage, ElMessageBox } from "element-plus";
import api from "@/services/api";
import Tree from "../tree/tree.vue";
import Search from "./search.vue";

import Drawer from "@/components/drawer.vue";
import router from "@/router";
const { closeNum } = storeToRefs(appStore.commonStore);
const { user } = storeToRefs(appStore.authStore);
const { spaceKey, spaceDetail, spaceList } = storeToRefs(appStore.spaceStore);
const { bookList, foldBookList, fastBookList, bookKey, createBookVisible } =
  storeToRefs(appStore.bookStore);
const { setUserInfo } = appStore.authStore;
const {
  getBookList,
  setBookKey,
  setBookList,
  getFoldBookList,
  setFoldBookList,
  getFastBookList,
  setFastBookList,
  setBookDetail,
  setCreateBookVisible,
} = appStore.bookStore;
const { setSpaceKey, setSpaceList } = appStore.spaceStore;
const { setNodes, setNodeDetail, setNodeKey } = appStore.nodeStore;

const noticeVisible = ref<boolean>(false);
const spaceVisible = ref<boolean>(false);
const memberVisible = ref<boolean>(false);
const noVerify = ref<boolean>(false);
const isPublic = ref<boolean>(false);
const userVisible = ref<boolean>(false);
const clearNum = ref<number>(0);
const defaultRole = ref<number>(4);
const bookIndex = ref<number>(-1);
const spaceName = ref<string>("");
const spaceLogo = ref<string>("");
const bookName = ref<string>("");
const infoState = ref<string>("create");
const userName = ref<string>("");
const userAvatar = ref<string>("");
const showFast = ref<boolean>(true);
const showBook = ref<boolean>(true);
const showFold = ref<boolean>(true);
const searchVisible = ref<boolean>(false);
const chooseSpace = (key) => {
  setSpaceKey(key);
  setBookKey("");
  setBookDetail(null);
  setNodeDetail(null);
  setNodeKey("");
  router.replace("/detail/spaceTable");
};
const outSpace = (index) => {
  ElMessageBox.confirm("是否退出该空间", "退出空间", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
  }).then(async () => {
    let outRes = (await api.request.delete("spaceMember/exit", {
      spaceKey: spaceKey.value,
    })) as ResultProps;
    if (outRes.msg === "OK") {
      ElMessage.success("退出空间成功");
      const list = _.cloneDeep(spaceList.value);
      list.splice(index, 1);
      setSpaceKey(list[0]._key);
      setSpaceList(list);
    }
  });
};
const createSpace = async () => {
  let createRes = (await api.request.post("space", {
    name: spaceName.value,
    logo: spaceLogo.value,
  })) as ResultProps;
  if (createRes.msg === "OK") {
    ElMessage.success("新建空间成功");
    setSpaceKey(createRes.data._key);
    spaceVisible.value = false;
    const list = _.cloneDeep(spaceList.value);
    list.push(createRes.data);
    setSpaceList(list);
    router.replace("/detail/spaceTable");
  }
};
const uploadImage = (file, type) => {
  let mimeType = ["image/*"];
  if (file) {
    uploadFile(file, mimeType, async (url, name) => {
      switch (type) {
        case "space":
          spaceLogo.value = url;
          break;
        case "avatar":
          userAvatar.value = url;
          break;
      }
    });
  }
};
const createBook = async () => {
  if (!bookName.value) {
    ElMessage.error("请输入目录名称");
    return;
  }
  let obj: any = {
    spaceKey: spaceKey.value,
    name: bookName.value,
    isPublic: isPublic.value,
    noVerify: noVerify.value,
    defaultRole: defaultRole.value,
    showInHomePage: true,
  };

  const bookRes = (await api.request.post("book", {
    ...obj,
  })) as ResultProps;
  if (bookRes.msg === "OK") {
    let list = _.cloneDeep(bookList.value);
    ElMessage.success("新建目录成功");
    bookRes.data.leaf = true;
    list.push(bookRes.data);
    setBookList(list);
    setCreateBookVisible(false);
    clearBook();
  }
};
const clearBook = () => {
  bookName.value = "";
  isPublic.value = false;
  noVerify.value = false;
  defaultRole.value = 4;
  setBookKey("");
  setNodes([]);
  bookIndex.value = -1;
};
const flashArray = (
  index: number,
  type: string,
  listType: string,
  data?: any
) => {
  switch (type) {
    case "delete":
      if (listType === "book") {
        let list = _.cloneDeep(bookList.value);
        list.splice(index, 1);
        setBookList(list);
      } else if (listType === "fold") {
        let list = _.cloneDeep(foldBookList.value);
        list.splice(index, 1);
        setFoldBookList(list);
      }
      setBookKey("");
      setBookDetail(null);
      setNodeDetail(null);
      break;
    case "edit":
      if (listType === "book") {
        let list = _.cloneDeep(bookList.value);
        list[index] = { ...list[index], ...data };
        console.log(list);
        setBookList(list);
      } else if (listType === "fold") {
        let list = _.cloneDeep(foldBookList.value);
        list[index] = { ...list[index], ...data };
        console.log(list);
        setFoldBookList(list);
      } else if (listType === "fast") {
        let list = _.cloneDeep(fastBookList.value);
        list[index] = { ...list[index], ...data };
        console.log(list);
        setFastBookList(list);
      }
      break;
    case "fold":
      let list1 = _.cloneDeep(bookList.value);
      let foldlist = _.cloneDeep(foldBookList.value);
      if (listType === "book") {
        let item: any = list1.splice(index, 1);
        console.log(item);
        foldlist.unshift(...item);
      } else if (listType === "fold") {
        let item: any = foldlist.splice(index, 1);
        list1.unshift(...item);
      }
      setBookList(list1);
      setFoldBookList(foldlist);
      break;
    case "fast":
      let fastlist = _.cloneDeep(fastBookList.value);
      if (listType === "book") {
        fastlist.unshift(data);
      } else if (listType === "fast") {
        fastlist.splice(index, 1);
      }
      setFastBookList(fastlist);
  }
};
const updateUser = async () => {
  if (!userName.value) {
    ElMessage.error("请输入用户名");
    return;
  }
  let userRes = (await api.request.patch("user", {
    userName: userName.value,
    userAvatar: userAvatar.value,
  })) as ResultProps;
  if (userRes.msg === "OK") {
    //@ts-ignore
    let newUser: User = {
      ...user,
      userName: userName.value,
      userAvatar: userAvatar.value,
    };
    ElMessage.success("编辑用户成功");
    userVisible.value = false;
    setUserInfo(newUser);
  }
};
watch(
  spaceKey,
  (newKey) => {
    if (newKey) {
      getBookList(newKey);
      getFoldBookList(newKey);
      getFastBookList(newKey);
    }
  },
  { immediate: true }
);
watch(
  user,
  (newUser) => {
    if (newUser) {
      if (newUser?.userAvatar) {
        userAvatar.value = newUser.userAvatar;
      }
      if (newUser?.userName) {
        userName.value = newUser.userName;
      }
      if (newUser && !newUser.userAvatar && !newUser.userName) {
        userVisible.value = true;
      }
    }
  },
  { immediate: true }
);
</script>
<template>
  <div
    class="left"
    :style="
      closeNum !== -1
        ? {
            animation: `${
              closeNum === 0 ? 'moveLeft' : 'moveRight'
            } 1s forwards`,
          }
        : {}
    "
  >
    <div class="title icon-point">
      <el-dropdown trigger="click">
        <div class="select-third-item">
          <div class="select-item-logo">
            <Avatar
              :src="spaceDetail?.spaceInfo.logo"
              :alt="spaceDetail?.spaceInfo.name"
              type="group"
              :size="26"
            />
          </div>
          <div class="select-item-name single-to-long">
            {{ spaceDetail?.spaceInfo.name }}
          </div>

          <div class="select-item-icon dp-center-center">
            <FontIcon iconName="xiala" />
          </div>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <div
              class="user-space icon-point"
              @click="
                userVisible = true;
                userName = user?.userName ? user.userName : '';
                userAvatar = user?.userAvatar ? user.userAvatar : '';
              "
            >
              <Avatar
                :src="user?.userAvatar"
                :alt="user?.userName"
                :size="45"
                :imgStyle="{ marginRight: '5px' }"
              />

              {{ user?.userName }}
            </div>
            <el-dropdown-item
              v-for="(item, index) in spaceList"
              :key="item._key"
              @click="chooseSpace(item._key)"
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
              <div
                class="select-icon-hover"
                v-if="item._key !== user?.privateSpace"
              >
                <div
                  @click="outSpace(index)"
                  class="select-item-icon"
                  v-if="item.creatorInfo?._key !== user?._key && item.role > 1"
                >
                  <FontIcon
                    iconName="tuichukongjian"
                    :iconStyle="{
                      fontSize: '22px',
                    }"
                  />
                </div>

                <div
                  class="select-item-icon"
                  @click="$router.push('/manage')"
                  v-if="item.role < 2"
                >
                  <FontIcon
                    iconName="shezhi"
                    :iconStyle="{
                      fontSize: '22px',
                    }"
                  />
                </div>
              </div>
            </el-dropdown-item>
            <div class="dp-center-center" style="height: 60px; width: 100%">
              <el-button
                type="primary"
                plain
                @click="spaceVisible = true"
                style="width: 150px"
              >
                创建空间
              </el-button>
            </div>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="icon">
      <div @click="searchVisible = true"><FontIcon iconName="sousuo" /></div>

      <div @click="noticeVisible = true">
        <FontIcon
          iconName="xiaoxi"
          :iconStyle="{
            fontSize: '18px',
          }"
        />
      </div>
      <div @click="$router.push('/manage')">
        <FontIcon
          iconName="shezhi"
          :iconStyle="{
            fontSize: '22px',
          }"
        />
      </div>
    </div>
    <el-divider />
    <div class="menu">
      <div class="menu-title">
        <div class="menu-title-text icon-point" @click="showFast = !showFast">
          快捷访问
        </div>
      </div>
      <Tree
        :list="fastBookList"
        type="fast"
        @flashArray="flashArray"
        v-show="showFast"
      />
      <div class="menu-title">
        <div class="menu-title-text icon-point" @click="showBook = !showBook">
          协作目录
        </div>
        <div class="icon">
          <FontIcon
            iconName="tianjiawenjianjia"
            :iconStyle="{
              // fontSize: '22px',
              cursor: 'pointer',
              color: '#666',
            }"
            @iconClick="
              infoState = 'create';
              setCreateBookVisible(true);
            "
          />
        </div>
      </div>
      <Tree
        :list="bookList"
        type="book"
        @flashArray="flashArray"
        v-show="showBook"
      />
      <div class="menu-title">
        <div class="menu-title-text icon-point" @click="showFold = !showFold">
          已折叠 ( {{ foldBookList.length }} )
        </div>
        <div class="icon"></div>
      </div>
      <Tree
        :list="foldBookList"
        type="fold"
        @flashArray="flashArray"
        v-show="showFold"
      />
      <div class="menu-title" @click="$router.push('/detail/unjoinTable')">
        <div class="menu-title-text">待加入</div>
        <div class="icon"></div>
      </div>
    </div>
    <div class="bottom icon-point" @click="$router.push('/detail/recovery')">
      <FontIcon iconName="shanchu" :boxStyle="{ marginRight: '10px' }" />回收站
    </div>
    <Drawer
      :visible="noticeVisible"
      @close="noticeVisible = false"
      :drawerStyle="{ width: '365px', left: '244px' }"
      title="通知"
    >
      <template #button>
        <el-button
          type="primary"
          @click="clearNum = clearNum + 1"
          :style="{
            marginRight: '10px',
          }"
          >全部已读</el-button
        ></template
      >
      <template #content> <Notice :clearNum="clearNum" /></template>
    </Drawer>
    <el-dialog v-model="spaceVisible" title="空间设置" width="450px">
      <div class="space-create">
        <div class="create-logo">
          <div class="upload-button upload-img-button logo-box">
            <img
              :src="spaceLogo"
              alt=""
              :style="{ width: '100%', height: '100%' }"
              class="upload-cover"
              v-if="spaceLogo"
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
        <div class="create-name">
          <el-input v-model="spaceName" placeholder="请输入空间名" />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="spaceVisible = false">取消</el-button>
          <el-button type="primary" @click="createSpace()">确认</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="userVisible" title="用户设置" width="450px">
      <div className="space-create">
        <div className="create-logo">
          <div className="upload-button upload-img-button logo-box">
            <img
              :src="userAvatar"
              alt=""
              style="width: 100%, height:100%"
              class="upload-cover"
              v-if="userAvatar"
            />
            <el-icon :size="50" color="#ebebeb" v-else>
              <Plus />
            </el-icon>
            <input
              type="file"
              accept="image/*"
              @change="
                //@ts-ignore
                uploadImage($event.target.files[0], 'avatar')
              "
              class="upload-img"
            />
          </div>
        </div>
        <div className="create-name">
          <el-input v-model="userName" placeholder="请输入用户名" />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="userVisible = false">取消</el-button>
          <el-button type="primary" @click="updateUser()">确认</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="searchVisible" title="" width="660px">
      <div><Search /></div>
    </el-dialog>
    <el-dialog title="新建目录" v-model="createBookVisible" width="358px">
      <div className="book-create form">
        <div class="book-name" style="marginbottom: '20px'">
          <el-input v-model="bookName" placeholder="请输入目录名" />
        </div>
        <div>
          <div className="form-left">新成员默认权限</div>
          <div className="form-right">
            <el-select
              v-model="defaultRole"
              placeholder="请选择默认权限"
              style="width: 250px"
              placement="bottom"
            >
              <el-option label="编辑" :value="2" />
              <el-option label="作者" :value="3" />
              <el-option label="成员" :value="4" />
            </el-select>
          </div>
        </div>
        <div>
          <div className="form-left">内部公开</div>
          <div className="form-right">
            <el-switch v-model="noVerify" />
          </div>
        </div>
        <div>
          <div className="form-left">外部公开</div>
          <div className="form-right">
            <el-switch v-model="isPublic" />
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dp-center-center">
          <el-button type="primary" @click="createBook()" style="width: 208px"
            >保存</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<style scoped lang="scss">
.left {
  width: 240px;
  height: 100vh;
  padding: 20px 0px 10px 0px;
  box-sizing: border-box;
  background: #f9f9f9;
  box-shadow: 1px 0px 0px 0px #e1e1e1;
  position: relative;
  z-index: 10;
  .title {
    width: 100%;
    margin-bottom: 20px;
    padding: 0px 20px;
    box-sizing: border-box;
  }

  > .icon {
    width: 100%;
    height: 20px;
    margin-bottom: 16px;
    @include flex(space-between, center, null);
    > div {
      width: 33%;
      height: 100%;
      cursor: pointer;
      @include flex(center, center, null);
    }
  }
  > .menu {
    width: 100%;
    height: calc(100vh - 165px);
    box-sizing: border-box;
    @include scroll();
    .menu-title {
      width: 100%;
      height: 35px;
      // background: #ebebeb;
      padding: 0px 10px;
      box-sizing: border-box;
      cursor: pointer;
      @include flex(space-between, center, null);
      .menu-title-text {
        height: 20px;
        background: #ebebeb;
        border-radius: 4px;
        font-size: 12px;
        color: #999999;
        line-height: 20px;
        padding: 0px 7px;
      }
      > .icon {
        width: 18px;
        height: 18px;
        @include flex(center, center, null);
      }
    }

    &::-webkit-scrollbar {
      width: 0px;
      height: 0px;
    }
  }
  .bottom {
    width: 100vw;
    height: 32px;
    font-size: 14px;
    color: #999999;
    line-height: 32px;
    padding-left: 20px;
    box-sizing: border-box;
    @include flex(flex-start, center, null);
    > .icon {
      width: 18px;
      height: 18px;
      margin-right: 6px;
    }
  }
}
.space-create {
  width: 400px;
  height: 400px;
  .create-logo {
    width: 100%;
    height: 300px;
    @include flex(center, center, null);
    .logo-box {
      width: 250px;
      height: 250px;
      border-radius: 12px;
      overflow: hidden;
    }
  }
  .create-name {
    width: 100%;
    height: 50px;
    margin: 10px 0px;
  }
}
.book-create {
  width: 100%;
  height: 100%;
  padding: 0px 27px 15px 27px;
  box-sizing: border-box;
  @include scroll();
}
</style>
<style lang="scss">
.title-space {
  width: 200px;
}
.user-space {
  width: 100%;
  height: 60px;
  padding: 0px 10px;
  box-sizing: border-box;
  font-size: 18px;
  margin-bottom: 10px;
  @include flex(flex-start, center, null);
}
.notice-drawer {
  width: 365px !important;
  .el-drawer__header {
    background-color: #f9f9f9;
  }
}

@keyframes moveLeft {
  0% {
    width: 240px;
    opacity: 1;
  }
  100% {
    width: 0px;
    opacity: 0;
  }
}
@keyframes moveRight {
  0% {
    width: 0px;
    opacity: 0;
  }
  50% {
    width: 240px;
    opacity: 1;
  }
}
</style>
