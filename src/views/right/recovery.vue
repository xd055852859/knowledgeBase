<script setup lang="ts">
import FontIcon from "@/components/fontIcon.vue";

import Header from "@/components/header.vue";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import appStore from "@/store";
import { ElMessage, ElMessageBox } from "element-plus";
import _ from "lodash";
import { storeToRefs } from "pinia";
const dayjs: any = inject("dayjs");
const { spaceKey, spaceDetail, spaceList } = storeToRefs(appStore.spaceStore);
const recoveryBookList = ref<any>([]);
const recoveryNodeList = ref<any>([]);
const recoveryIndex = ref<number>(0);
const menuVisible = ref<boolean>(false);
const recoveryType = ref<string>("board");

const getData = async (key) => {
  let boardRes = (await api.request.get("recycleBin", {
    spaceKey: key,
  })) as ResultProps;
  if (boardRes.msg === "OK") {
    // dispatch(setBoardList(boardRes.data));
    recoveryBookList.value = boardRes.data.bookList;
    recoveryNodeList.value = boardRes.data.nodeList;
  }
};
const reductData = async (type, index) => {
  let boardRes = (await api.request.patch("recycleBin/single", {
    spaceKey: spaceKey,
    dataKey:
      type === "book"
        ? recoveryBookList.value[index]._key
        : recoveryNodeList.value[index]._key,
  })) as ResultProps;
  if (boardRes.msg === "OK") {
    if (type === "book") {
      ElMessage.success("还原目录成功");
      recoveryBookList.value.splice(index, 1);
    } else {
      ElMessage.success("还原节点成功");
      recoveryNodeList.value.splice(index, 1);
    }
  }
};
const deleteAllData = async () => {
  ElMessageBox.confirm(`是否永久删除所有资源`, "删除所有资源", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
  }).then(async () => {
    let boardRes = (await api.request.delete("recycleBin", {
      spaceKey: spaceKey.value,
    })) as ResultProps;
    if (boardRes.msg === "OK") {
      // dispatch(setBoardList(boardRes.data));
      recoveryBookList.value = [];
      recoveryNodeList.value = [];
    }
  });
};
const deleteData = async (type, index) => {
  ElMessageBox.confirm(
    `是否永久删除${type === "book" ? "资源库" : "节点"}`,
    "删除资源",
    {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
    }
  ).then(async () => {
    let boardRes = (await api.request.delete("recycleBin/single", {
      spaceKey: spaceKey.value,
      dataKey:
        type === "book"
          ? recoveryBookList.value[index]._key
          : recoveryNodeList.value[index]._key,
      type: type,
    })) as ResultProps;
    if (boardRes.msg === "OK") {
      if (type === "book") {
        ElMessage.success("删除目录成功");
        recoveryBookList.value.splice(index, 1);
      } else {
        ElMessage.success("删除节点成功");
        recoveryNodeList.value.splice(index, 1);
      }
    }
  });
};
watch(
  spaceKey,
  (newKey) => {
    if (newKey) {
      getData(newKey);
    }
  },
  { immediate: true }
);
</script>
<template>
  <div className="recovery">
    <Header title="回收站">
      <template #button>
        <el-button type="primary" @click="deleteAllData()">
          一键清空
        </el-button>
      </template>
    </Header>
    <div className="recovery-box">
      <div className="recovery-title">资源库</div>

      <el-row :gutter="20">
        <el-col
          :xs="12"
          :sm="8"
          :md="6"
          v-for="(item, index) in recoveryBookList"
          :key="`recovery${index}`"
        >
          <div className="recovery-item">
            <div className="item-top">
              <div className="top-left dp-center-center">
                <FontIcon
                  customClassName="dp-center-center"
                  iconName="wenjianjia"
                  :iconStyle="{
                    // fontSize: '22px',
                    color: '#333',
                  }"
                />
              </div>
              <div className="top-right">{{ item.name }}</div>
              <div className="top-button">
                <el-dropdown
                  trigger="click"
                  :teleported="false"
                  class="noArrow"
                >
                  <FontIcon
                    iconName="gengduo"
                    :iconStyle="{ fontSize: '18px' }"
                  />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="reductData('book', index)">
                        <FontIcon
                          iconName="shuaxin"
                          :iconStyle="{ fontSize: '18px', marginRight: '5px' }"
                        />还原</el-dropdown-item
                      >
                      <el-dropdown-item @click="deleteData('book', index)">
                        <FontIcon
                          iconName="shanchu"
                          :iconStyle="{ fontSize: '18px', marginRight: '5px' }"
                        />删除</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            <div className="item-bottom">
              {{ dayjs(item.updateTime).fromNow() }} 更新
            </div>
          </div></el-col
        >
      </el-row>

      <div className="recovery-title">文件</div>
      <el-row :gutter="20">
        <el-col
          :xs="12"
          :sm="8"
          :md="6"
          v-for="(item, index) in recoveryNodeList"
          :key="`recovery${index}`"
        >
          <div className="recovery-item">
            <div className="item-top">
              <div className="top-left dp-center-center">
                <FontIcon
                  customClassName="dp-center-center"
                  :iconName="item.docType ? item.docType : 'wenjianjia'"
                  :iconStyle="{
                    fontSize: item.docType ? '13px' : '15px',
                    color: '#333',
                  }"
                />
              </div>
              <div className="top-right">{{ item.name }}</div>
              <div className="top-button">
                <el-dropdown
                  trigger="click"
                  :teleported="false"
                  class="noArrow"
                >
                  <FontIcon
                    iconName="gengduo"
                    :iconStyle="{ fontSize: '18px' }"
                  />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="reductData('node', index)">
                        <FontIcon
                          iconName="shuaxin"
                          :iconStyle="{ fontSize: '18px', marginRight: '5px' }"
                        />还原</el-dropdown-item
                      >
                      <el-dropdown-item @click="deleteData('node', index)">
                        <FontIcon
                          iconName="shanchu"
                          :iconStyle="{ fontSize: '18px', marginRight: '5px' }"
                        />删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            <div className="item-bottom">
              {{ dayjs(item.updateTime).fromNow() }} 更新
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    <!-- <Popover
        anchorEl={anchorEl}
        open={menuVisible}
        onClose={() => {
          setMenuVisible(false);
        }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        container={anchorEl}
      >
        <MenuItem
          onClick={() => {
            setMenuVisible(false);
            reductData();
          }}
        >
          <FontIcon
            iconName="shuaxin"
            iconStyle={{
              fontSize: "22px",
              marginRight: "8px",
            }}
          />
          还原
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuVisible(false);
            setDeleteVisible(true);
          }}
        >
          <FontIcon
            iconName="shanchu"
            iconStyle={{
              fontSize: "22px",
              marginRight: "8px",
            }}
          />
          删除
        </MenuItem>
      </Popover> -->
    <!-- <Modal
        visible={deleteVisible}
        title={"删除资源"}
        content={`是否永久删除${recoveryType === "board" ? "资源库" : "节点"}`}
        onClose={() => {
          setDeleteVisible(false);
        }}
        onOk={() => {
          deleteData();
        }}
      />
      <Modal
        visible={deleteAllVisible}
        title={"删除所有资源"}
        content={`是否永久删除所有资源`}
        onClose={() => {
          setDeleteVisible(false);
        }}
        onOk={() => {
          deleteAllData();
        }}
      /> -->
  </div>
</template>
<style scoped lang="scss">
.recovery {
  width: 100%;
  height: 100%;
  background: #f9f9f9;
  .recovery-box {
    width: 100%;
    height: calc(100% - 65px);
    padding: 0px 37px 20px 37px;
    box-sizing: border-box;
    @include scroll();
    .recovery-title {
      width: 100%;
      height: 20px;
      font-size: 14px;
      font-weight: 600;
      line-height: 20px;
      letter-spacing: 0.23px;
      margin: 20px 10px;
    }
    .recovery-item {
      // width: 407px;
      height: 86px;
      background: #ffffff;
      flex-shrink: 0;
      border-radius: 8px;
      margin-bottom: 22px;
      padding: 13px;
      box-sizing: border-box;
      // margin-right: 22px;
      .item-top {
        width: 100%;
        height: 30px;
        font-size: 22px;
        margin-bottom: 10px;
        @include flex(space-between, center, null);
        .top-left {
          width: 28px;
          height: 28px;
          background: #f4f4f4;
          border-radius: 15px;
          margin-right: 6px;
        }
        .top-right {
          width: calc(100% - 34px);
          height: 100%;
          font-size: 14px;
          color: #000000;
          line-height: 22px;
          @include flex(flex-start, center, null);
        }
        .top-button {
          .top-icon {
            display: none;
          }
        }
      }
      .item-bottom {
        width: 100%;
        height: 20px;
        font-size: 12px;
        color: #999999;
        padding-left: 34px;
        box-sizing: border-box;
        @include flex(flex-start, center, null);
        .item-button {
          height: 20px;
          @include flex(flex-start, center, null);
        }
      }
      &:nth-child(4n) {
        margin-right: 0px;
      }
      &:hover {
        box-shadow: 0px 2px 6px 0px rgba(178, 178, 178, 0.66);
        .item-top {
          .top-button {
            .top-icon {
              display: flex;
            }
          }
        }
      }
    }
  }
}
</style>
<style></style>
