<script setup lang="ts">
import Header from "@/components/header.vue";
import { ROLE_OPTIONS, ResultProps } from "@/interface/Common";
import { Search } from "@element-plus/icons-vue";
import { SpaceMember } from "@/interface/Space";
import Avatar from "@/components/avatar.vue";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import api from "@/services/api";
import _ from "lodash";
import { ElMessage, ElMessageBox } from "element-plus";
import { Member } from "@/interface/Book";
const { spaceKey, spaceMemberList, spaceRole } = storeToRefs(
  appStore.spaceStore
);
const { setSpaceMemberList, getSpaceMemberList } = appStore.spaceStore;
const name = ref<string>("");
const memberList = ref<SpaceMember[]>([]);
const memberInput = ref<string>("");
const searchList = ref<any>([]);
const addVisible = ref<boolean>(false);

const searchName = (value: string) => {
  name.value = value;
  if (value) {
    let list = _.cloneDeep(spaceMemberList.value).filter((item) => {
      return item.userName && item.userName.includes(value);
    });
    memberList.value = [...list];
  } else {
    memberList.value = _.cloneDeep(spaceMemberList.value);
  }
};
const searchMember = async () => {
  if (memberInput.value) {
    const searchRes = (await api.request.get("user/search", {
      keyWord: memberInput.value,
    })) as ResultProps;
    if (searchRes.msg === "OK") {
      searchList.value = searchRes.data;
    }
  } else {
    searchList.value = [];
  }
};
const addMember = async (type, params: any) => {
  let obj: any = { spaceKey: spaceKey.value, role: 4 };
  if (type === "inner") {
    obj.memberKey = params.userKey;
  } else {
    let reg = /^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/g;
    if (reg.test(params.mobile)) {
      obj.mobile = params.mobile;
      obj.mobileArea = "+86";
    } else {
      ElMessage.error("外部添加成员只能使用手机号");
      return;
    }
  }
  const memberRes = (await api.request.post("spaceMember", {
    spaceKey: spaceKey.value,
    ...obj,
  })) as ResultProps;
  if (memberRes.msg === "OK") {
    ElMessage.success("添加成员成功");
    if (params.index !== -1) {
      searchList.value.splice(params.index, 1);
    }
    memberList.value.push(memberRes.data);
    setSpaceMemberList(_.cloneDeep(memberList.value));
    addVisible.value = false;
  }
};
const changeRole = async (val, index) => {
  let list = _.cloneDeep(spaceMemberList.value);
  console.log(list);
  console.log(list[index]);
  const roleRes = (await api.request.patch("spaceMember/role", {
    spaceKey: spaceKey.value,
    memberKey: list[index].userKey,
    newRole: val,
  })) as ResultProps;
  if (roleRes.msg === "OK") {
    list[index].role = val;
    setSpaceMemberList(list);
  }
};
const deleteMember = (index) => {
  ElMessageBox.confirm("是否删除该空间成员", "删除成员", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
  }).then(async () => {
    let list: any = _.cloneDeep(spaceMemberList.value);
    const memberRes = (await api.request.delete("spaceMember", {
      spaceKey: spaceKey.value,
      memberKeyArr: [list[index].userKey],
    })) as ResultProps;
    if (memberRes.msg === "OK") {
      ElMessage.success("删除空间成员成功");
      list.splice(index, 1);
      setSpaceMemberList(list);
    }
  });
};

watch(
  spaceMemberList,
  (newList) => {
    if (newList && newList.length > 0) {
      memberList.value = _.cloneDeep(newList);
    }
  },
  { immediate: true }
);
</script>
<template>
  <div class="manage-member box">
    <Header title="成员管理" />
    <div class="member-header">
      <el-input
        v-model="name"
        placeholder="请输入用户名"
        :prefix-icon="Search"
        :style="{ width: '250px', height: '40px' }"
        @input="searchName"
      />

      <div>
        <el-button
          type="primary"
          style="
             {
              margin: '0px 15px';
            }
          "
        >
          excel导入
        </el-button>
        <el-button type="primary" @click="addVisible = true"> 添加 </el-button>
      </div>
    </div>
    <div class="member-table box-table">
      <el-table
        :data="memberList"
        class="story-table"
        fit
        highlight-current-row
      >
        <el-table-column prop="userName" label="成员名称" />
        <el-table-column label="头像" align="center">
          <template #default="scope">
            <div class="dp-center-center">
              <Avatar :src="scope.row.userAvatar" :alt="scope.row.userName" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="mobile" label="手机号" align="center" />
        <el-table-column label="权限" align="center">
          <template #default="scope">
            <div
              class="icon-point dp-center-center"
              v-if="spaceRole < scope.row.role"
            >
              <el-dropdown>
                <div
                  class="dp-center-center"
                  style="
                     {
                      height: 100%;
                    }
                  "
                >
                  {{
                    scope.row.role === 0
                      ? "超管"
                      : ROLE_OPTIONS[scope.row.role - 1]?.label
                  }}
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-for="(item, index) in ROLE_OPTIONS"
                      :key="item.value"
                      @click="changeRole(item.value, scope.$index)"
                      >{{ item.label }}</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>

            <div v-else class="dp-center-center">
              {{
                scope.row.role === 0
                  ? "超管"
                  : ROLE_OPTIONS[scope.row.role - 1]?.label
              }}
            </div>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="180" align="center">
          <template #default="scope">
            <el-button
              type="primary"
              @click="deleteMember(scope.$index)"
              v-if="scope.row.role > spaceRole"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog
      v-model="addVisible"
      title="搜索用户"
      width="40%"
      @close="addVisible = false"
    >
      <div class="member-search">
        <div class="member-search-title dp-space-center">
          <el-input
            v-model="memberInput"
            placeholder="请输入用户名"
            :prefix-icon="Search"
            @change="searchMember()"
            :style="{ width: 'calc(100% - 100px)', height: '40px' }"
          />

          <el-button
            type="primary"
            @click="addMember('outer', { mobile: memberInput })"
          >
            外部添加
          </el-button>
        </div>
        <div class="member-search-container">
          <template v-if="searchList.length > 0">
            <div
              class="member-search-item"
              v-for="(item, index) in searchList"
              :key="`search${index}`"
            >
              <div class="member-search-left">
                <div class="member-search-avatar">
                  <Avatar :src="item.userAvatar" :alt="item.userName" />
                </div>
                <div>{{ item.userName }}</div>
              </div>
              <div class="member-search-right">
                <el-button
                  type="primary"
                  @click="addMember('inner', { index, userKey: item._key })"
                >
                  添加
                </el-button>
              </div>
            </div>
          </template>
          <div class="dp-center-center" :style="{ height: '100%' }" v-else>
            未搜索到尚未加入该空间的系统用户
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<style scoped lang="scss">
.manage-member {
  width: 100%;
  height: calc(100% - 50px);
  font-size: 18px;
  .member-header {
    width: 100%;
    height: 60px;
    margin: 10px 0px;
    @include p-number(0px, 15px);
    @include flex(space-between, center, null);
  }
  .member-table {
    width: 100%;
    height: calc(100% - 150px);
    @include scroll();
    .member-logo {
      width: 100%;
      height: 100%;
      @include flex(center, center, null);
      .logo-box {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }
}
.member-search {
  width: 100%;
  .member-search-title {
    width: 100%;
    height: 50px;
    margin-bottom: 10px;
  }
  .member-search-container {
    width: 100%;
    height: 50vh;
    @include scroll();
    .member-search-item {
      width: 100%;
      height: 70px;
      @include flex(space-between, center, null);
      .member-search-left {
        @include flex(space-between, center, null);
        .member-search-avatar {
          width: 50px;
          height: 50px;
          margin-right: 10px;
        }
      }
      .member-search-right {
        height: 100%;
        @include flex(center, center, null);
      }
    }
  }
}
</style>
<style></style>
