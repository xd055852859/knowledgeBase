<script setup lang="ts">
import Avatar from "@/components/avatar.vue";
import {
  ROLE_OPTIONS,
  ResultProps,
  SPACE_ROLE_OPTIONS,
} from "@/interface/Common";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import _ from "lodash";
import api from "@/services/api";
import FontIcon from "@/components/fontIcon.vue";
import { ElMessage, ElMessageBox } from "element-plus";
const { spaceMemberList } = storeToRefs(appStore.spaceStore);
const { bookMemberList, bookRole, bookKey, bookDetail } = storeToRefs(
  appStore.bookStore
);
const { setBookMemberList } = appStore.bookStore;
const searchMemberList = ref<any>([]);
const searchName = ref<string>("");
const chooseKey = ref<string>("");

const addMember = async (index) => {
  let list = _.cloneDeep(searchMemberList.value);
  const memberRes = (await api.request.post("bookMember", {
    bookKey: bookKey.value,
    memberKey: list[index].userKey,
    role: bookDetail.value?.defaultRole,
  })) as ResultProps;
  if (memberRes.msg === "OK") {
    ElMessage.success("添加知识库成员成功");
    let bookList = _.cloneDeep(bookMemberList.value);
    bookList.push(list[index]);
    setBookMemberList(bookList);
    list.splice(index, 1);
    searchMemberList.value = list;
  }
};
const changeRole = async (val, index) => {
  let list = _.cloneDeep(bookMemberList.value);
  const roleRes = (await api.request.patch("bookMember/role", {
    bookKey: bookKey.value,
    memberKey: list[index].userKey,
    newRole: val,
  })) as ResultProps;
  if (roleRes.msg === "OK") {
    list[index].role = val;
    setBookMemberList(list);
  }
};
const deleteMember = async (index) => {
  ElMessageBox.confirm("是否删除该目录协作成员", "删除成员", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
  }).then(async () => {
    let list = _.cloneDeep(bookMemberList.value);
    const memberRes = (await api.request.delete("bookMember", {
      bookKey: bookKey.value,
      memberKeyArr: [list[index].userKey],
    })) as ResultProps;
    if (memberRes.msg === "OK") {
      ElMessage.success("删除目录成员成功");
      list.splice(index, 1);
      setBookMemberList(list);
    }
  });
};
watch(
  searchName,
  (newName) => {
    let memberList: any = [];
    spaceMemberList.value.forEach((spaceItem) => {
      if (
        bookMemberList.value.findIndex(
          (item) => item.userKey === spaceItem.userKey
        ) === -1
      ) {
        memberList.push(spaceItem);
      }
    });
    if (newName) {
      // let list = _.cloneDeep(searchMemberList);
      memberList = memberList.filter((item) => {
        console.log(item.userName);
        console.log(newName);

        return item.userName && item.userName.includes(newName);
      });
    }
    searchMemberList.value = memberList;
  },
  { immediate: true }
);
</script>
<template>
  <div class="member" v-if="bookMemberList.length > 0">
    <div class="member-title">已添加的协作者</div>

    <div
      class="member-item"
      v-for="(item, index) in bookMemberList"
      :key="`board${item.userKey}`"
      @mouseenter="chooseKey = item._key"
    >
      <div class="member-item-left">
        <Avatar
          :src="item?.userAvatar"
          :alt="item?.userName"
          :size="28"
          :imgStyle="{ marginRight: '10px' }"
        />
        <div class="member-item-nickName">{{ item.userName }}</div>
      </div>
      <div class="member-item-role icon-point">
        <el-dropdown
          v-if="
            chooseKey === item._key &&
            bookRole < 2 &&
            item.role > 0 &&
            bookRole < item.role
          "
        >
          <div class="icon-point dp-center-center">
            {{ SPACE_ROLE_OPTIONS[item.role + 2]?.label }}
            <FontIcon
              iconName="xiala"
              :iconStyle="{
                marginLeft: '5px',
              }"
            />
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="(item, index) in ROLE_OPTIONS"
                :key="item.value"
                @click="changeRole(item.value, index)"
                >{{ item.label }}</el-dropdown-item
              >
              <el-dropdown-item @click="deleteMember(index)" divided>
                <span style="color: #9e9e9e">删除</span></el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <div class="dp-center-center" v-else>
          {{ SPACE_ROLE_OPTIONS[item.role + 2]?.label }}
          <FontIcon
            iconName="xiala"
            :iconStyle="{
              marginLeft: '5px',
            }"
            v-if="bookRole < 2 && item.role > 0 && bookRole < item.role"
          />
        </div>
      </div>
    </div>
    <el-input
      v-model="searchName"
      placeholder="请输入空间用户名"
      style="margin: 20px 0px"
    />
    <div class="member-title">空间成员</div>
    <template v-if="searchMemberList.length > 0">
      <div
        v-for="(item, index) in searchMemberList"
        class="member-item"
        :key="`search${item.userKey}`"
      >
        <div class="member-item-left" style="width: calc(100% - 40px)">
          <Avatar
            :src="item?.userAvatar"
            :alt="item?.userName"
            :size="28"
            :imgStyle="{ marginRight: '10px' }"
          />
          <div class="member-item-nickName">{{ item.userName }}</div>
        </div>

        <el-button type="primary" plain @click="addMember(index)" size="small">
          + 协作
        </el-button>
      </div>
    </template>
    <div class="search" v-else><el-empty description="无数据" /></div>
  </div>
</template>
<style scoped lang="scss">
.member {
  width: 350px;
  height: calc(100vh - 50px);
  padding: 0px 15px;
  box-sizing: border-box;
  @include scroll();
  .member-title {
    color: #606266;
    font-size: 12px;
    margin: 10px 0px 25px 0px;
  }
  .member-item {
    width: 100%;
    height: 40px;
    margin-bottom: 10px;
    font-size: 14px;
    @include flex(space-between, center, null);
    .member-item-left {
      height: 60px;
      @include flex(flex-start, center, null);
      .member-item-avatar {
        width: 35px;
        height: 35px;
        overflow: hidden;
        margin-right: 8px;
        border-radius: 50%;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      .member-item-nickName {
        // width: 150px;
        height: 40px;
        color: #000000;
        line-height: 40px;
      }
    }
    .member-item-button {
      width: 40px;
      display: none;
    }
    &:hover {
      .member-item-button {
        @include flex(center, center, null);
      }
    }
    .member-item-role {
      color: #606266;
      @include flex(flex-start, center, null);
    }
  }
}
</style>
<style></style>
