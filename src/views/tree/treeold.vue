<script setup lang="ts">
import FontIcon from "@/components/fontIcon.vue";
import api from "@/services/api";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import _ from "lodash";
import { ElMessage, ElMessageBox } from "element-plus";
import TreeMember from "./treeMember.vue";
import { ResultProps } from "@/interface/Common";
import router from "@/router";
const { chooseKey, chooseType, overKey, overType } = storeToRefs(
  appStore.commonStore
);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { bookKey, createBookVisible } = storeToRefs(appStore.bookStore);
const { nodes, nodeKey } = storeToRefs(appStore.nodeStore);
const { setChoose, setOver } = appStore.commonStore;
const { setNodeKey, getNodes, setNodes } = appStore.nodeStore;
const { getBookList, setBookKey, setCreateBookVisible } = appStore.bookStore;
const props = defineProps<{
  list: any;
  type: string;
}>();
const emits = defineEmits<{
  (
    e: "flashArray",
    index: number,
    type: string,
    listType: string,
    data?: any
  ): void;
}>();
const treeRef = ref<any>(null);
const chooseIndex = ref<number>(-1);
const showState = ref<boolean>(false);
const nodeId = ref<string>("");
const nodeText = ref<string>("");
const textState = ref<boolean>(false);
const memberVisible = ref<boolean>(false);
const infoVisible = ref<boolean>(false);
const editTextState = ref<boolean>(false);
const bookName = ref<string>("");
const noVerify = ref<boolean>(false);
const isPublic = ref<boolean>(false);
const defaultRole = ref<number>(4);
const bookIndex = ref<number>(-1);
const bookDropdownRef = ref<any>(null);
const treeDropdownRef = ref<any>(null);
const chooseBook = (item, index, type) => {
  //   setBookKey("");
  //   nodes.value = [];
  setChoose(item._key, props.type);
  chooseIndex.value = index;
  if (bookKey.value !== item._key) {
    if (type === "book") {
      setBookKey(item._key);
      setNodeKey(item.rootKey);
    } else {
      setBookKey(item.bookKey);
      setNodeKey(item._key);
    }
    if (item.hasChild) {
      getNodes(type === "book" ? item.rootKey : item._key);
    } else {
      setNodes([]);
    }
    if (item.docType) {
      router.push("/detail/nodeDetail");
    } else {
      router.push("/detail/nodeTable");
    }
  }
};
const chooseBookDetail = (bookItem, index) => {
  bookName.value = bookItem.name;
  isPublic.value = bookItem.isPublic;
  noVerify.value = bookItem.noVerify;
  defaultRole.value = bookItem.defaultRole;
  bookIndex.value = index;
  infoVisible.value = true;
};

const deleteBook = async (index) => {
  ElMessageBox.confirm("是否删除该目录", "删除目录", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
  }).then(async () => {
    let list = _.cloneDeep(props.list);
    let bookRes = (await api.request.delete("book", {
      bookKey: list[index],
    })) as ResultProps;
    if (bookRes.msg === "OK") {
      ElMessage.success("删除目录成功");
      list.splice(index, 1);
      clearBook();
      emits("flashArray", index, "delete", props.type);
    }
  });
};
const outBook = async (index, key) => {
  ElMessageBox.confirm("是否退出目录协作", "退出协作", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
  }).then(async () => {
    let list = _.cloneDeep(props.list);
    let bookRes = (await api.request.delete("bookMember/exit", {
      bookKey: key,
    })) as ResultProps;
    if (bookRes.msg === "OK") {
      ElMessage.success("删除目录成功");
      list.splice(index, 1);
      clearBook();
      emits("flashArray", index, "delete", props.type);
    }
  });
};
const editBook = async (type?: string, key?: string, value?: any) => {
  let obj: any = null;
  if (!bookName.value) {
    ElMessage.error("请输入目录名称");
    return;
  }
  if (type) {
    if (key) {
      obj = {
        [key]: value,
      };
    } else {
      obj = {
        name: bookName.value,
      };
    }
  } else {
    obj = {
      name: bookName.value,
      isPublic: isPublic.value,
      noVerify: noVerify.value,
      defaultRole: defaultRole.value,
    };
  }
  const bookRes = (await api.request.patch("book", {
    spaceKey: spaceKey.value,
    bookKey: bookKey.value,
    ...obj,
  })) as ResultProps;
  if (bookRes.msg === "OK") {
    if (!type) {
      ElMessage.success("编辑目录成功");
      infoVisible.value = false;
    } else if (type === "text") {
      editTextState.value = false;
    }
    emits("flashArray", bookIndex.value, "edit", props.type, obj);
    clearBook();
    setChoose("", props.type);
    bookIndex.value = -1;
  }
};
const editNode = async () => {
  let obj: any = null;
  if (!bookName.value) {
    ElMessage.error("请输入节点名称");
    return;
  }
  const node = (await api.request.patch("node", {
    nodeKey: chooseKey.value,
    name: bookName.value,
  })) as ResultProps;
  if (node.msg === "OK") {
    emits("flashArray", chooseIndex.value, "edit", props.type, obj);
    setChoose("", props.type);
    chooseIndex.value = -1;
  }
};
const foldBook = async (index) => {
  const bookRes = (await api.request.patch("book/showInHomePage", {
    bookKey: props.list[index]._key,
    showInHomePage: props.type === "book" ? false : true,
  })) as ResultProps;
  if (bookRes.msg === "OK") {
    ElMessage.success(
      `${props.type === "book" ? "折叠" : "取消折叠"}目录成功"`
    );
    emits("flashArray", index, "fold", props.type);
    setChoose("", "");
  }
};
const fastBook = async (index, key, data) => {
  const bookRes = (await api.request.post("quickAccess", {
    spaceKey: spaceKey.value,
    nodeKey: key,
  })) as ResultProps;
  if (bookRes.msg === "OK") {
    ElMessage.success("设置快捷访问成功");
    emits("flashArray", index, "fast", props.type, data);
    setChoose("", "");
  }
};
const deleteFastBook = async (index, key) => {
  const bookRes = (await api.request.delete("quickAccess", {
    nodeKey: key,
  })) as ResultProps;
  if (bookRes.msg === "OK") {
    ElMessage.success("取消快捷访问成功");
    emits("flashArray", index, "fast", props.type);
    setChoose("", "");
  }
};
const clearBook = () => {
  bookName.value = "";
  isPublic.value = false;
  noVerify.value = false;
  defaultRole.value = 4;
  bookIndex.value = -1;
};
const addNode = async (
  selectedId: any,
  nodeType: string,
  data,
  docType?: string,
  titleType?: string
) => {
  console.log(data);
  //peer弟弟 elder-peer哥哥
  let obj: any = {
    type: nodeType,
    nodeKey: selectedId,
    fatherKey: selectedId,
    addType: "child",
  };
  if (docType) {
    obj.docType = docType;
  }
  let addTaskRes: any = await api.request.post("node", { ...obj });
  if (addTaskRes.msg === "OK") {
    ElMessage.success("创建新节点成功");
    // let list = _.cloneDeep(nodes);
    let childData = { ...addTaskRes.data, children: [], label: "" };
    if (titleType) {
      let newNodes = _.cloneDeep(nodes.value);
      newNodes.push(childData);
      setNodes(newNodes);
    } else {
      data.children.push(childData);
    }
  }
};
const updateNode = async (key: string, value, callback, nodeKey?: string) => {
  let updateRes: any = await api.request.patch("node", {
    nodeKey: nodeId.value,
    [key]: value,
  });
  if (updateRes.msg === "OK") {
    callback();
  }
};
const editNodeText = async (data) => {
  updateNode("name", nodeText.value, () => {
    data.name = nodeText;
    data.label = nodeText;
    nodeId.value = "";
  });
};
const chooseNodeText = async (data) => {
  nodeId.value = data._key;
  nodeText.value = data.label;
  textState.value = true;
  document.getElementById("nodeName" + data._key)?.focus();
};
// const moveNode = (node, data) => {
//   ElMessage.success("删除成功");
//   const parent = node.parent;
//   const children = parent.data.children || parent.data;
//   const index = children.findIndex((d) => d._key === data._key);
//   console.log(index);
//   children.splice(index, 1);
//   setNodeKey(parent.data._key);
// };
const deleteNode = (node, data) => {
  nodeId.value = data._key;
  // if (data.children.length > 0) {
  ElMessageBox.confirm("是否删除该节点", "删除节点", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
  }).then(async () => {
    updateNode("status", 0, () => {
      ElMessage.success("删除成功");
      const parent = node.parent;
      const children = parent.data.children || parent.data;
      const index = children.findIndex((d) => d._key === data._key);
      console.log(index);
      children.splice(index, 1);
      setNodeKey(parent.data._key);
    });
  });
  // } else {
  //   updateNode("status", 0, () => {
  //     moveNode(node, data);
  //   });
  // }
};
const showDropdown = (e, type, index) => {
  e.preventDefault();
  if (type === "book") {
    if (!bookDropdownRef.value[index]) return;
    bookDropdownRef.value[index].handleOpen();
  } else {
    if (!treeDropdownRef.value[index]) return;
    treeDropdownRef.value[index].handleOpen();
  }
};
const hiddenDropdown = (index) => {
  // if (treeDropdownRef.value && !bookDropdownRef.value[index]) return;
  // bookDropdownRef.value[index].handleClose();
  // if (treeDropdownRef.value && !treeDropdownRef.value[index]) return;
  // treeDropdownRef.value[index].handleClose();
};

// watch(nodeKey, (newKey) => {
//   if (newKey) {
//     chooseKey.value = newKey;
//   }
// });
</script>
<template>
  <div class="menu-file">
    <div v-for="(item, index) in list" :key="item._key">
      <div
        class="menu-item"
        :style="
          chooseKey === item._key && chooseType === type
            ? { background: '#ebebeb' }
            : item.hasChild
            ? {}
            : { paddingLeft: '16px' }
        "
        @click="
          chooseBook(
            item,
            index,
            type === 'fast' && !item.isRoot ? 'node' : 'book'
          )
        "
        @contextmenu="
          chooseBook(
            item,
            index,
            type === 'fast' && !item.isRoot ? 'node' : 'book'
          );
          showDropdown($event, 'book', index);
        "
        @mouseenter="setOver(item._key, type)"
        @mouseleave="hiddenDropdown(index)"
      >
        <div class="menu-left">
          <div
            v-if="editTextState && chooseKey === item._key && type !== 'fast'"
          >
            <el-input
              v-model="bookName"
              placeholder="请输入目录名"
              autofocus
              @change="editBook('text')"
              @blur="editTextState = false"
              size="small"
            />
          </div>
          <div
            class="dp--center"
            v-else
            @dblclick="
              type !== 'fast'
                ? () => {
                    editTextState = true;
                    bookName = item.name;
                    chooseIndex = index;
                  }
                : null
            "
          >
            <div @click="showState = !showState">
              <FontIcon
                :iconName="
                  chooseKey === item._key && chooseType === type && showState
                    ? 'shusanjiao'
                    : 'hengsanjiao'
                "
                :iconStyle="{
                  // fontSize: '22px',
                  color: '#333',
                }"
                v-if="item.hasChild"
              />
            </div>

            {{ item.name }}
            <div
              @click="memberVisible = true"
              class="dp-center-center"
              v-if="(type === 'fast' && item.isRoot) || type !== 'fast'"
            >
              <FontIcon
                :iconName="
                  item.memberCount > 1 ? 'xiezuozhe' : 'sheweishenqingjiaru'
                "
                :iconStyle="{
                  fontSize: '14px',
                  color: '#333',
                  margin: '0px 5px 0px 10px',
                }"
              />
              <span v-if="item.memberCount > 1">{{ item.memberCount }}</span>
            </div>
          </div>
        </div>
        <div
          class="menu-right"
          v-if="overKey === item._key && overType === type"
        >
          <el-dropdown
            trigger="click"
            :teleported="false"
            class="noArrow"
            placement="bottom-start"
          >
            <FontIcon
              iconName="tianjia1"
              :iconStyle="{
                cursor: 'pointer',
                color: '#666',
              }"
            />

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  @click="addNode(chooseKey, 'fold', nodes, '', 'title')"
                  >文件夹</el-dropdown-item
                >
                <el-dropdown-item
                  @click="addNode(chooseKey, 'doc', nodes, 'draw', 'title')"
                  >绘图</el-dropdown-item
                >
                <el-dropdown-item
                  @click="addNode(chooseKey, 'doc', nodes, 'mind', 'title')"
                  >脑图</el-dropdown-item
                >
                <el-dropdown-item
                  @click="addNode(chooseKey, 'doc', nodes, 'text', 'title')"
                  >文本</el-dropdown-item
                >
                <el-dropdown-item
                  @click="addNode(chooseKey, 'doc', nodes, 'ppt', 'title')"
                  >PPT</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-dropdown
            trigger="click"
            :teleported="false"
            class="noArrow"
            ref="bookDropdownRef"
            placement="bottom-start"
          >
            <FontIcon
              iconName="sangedian"
              :iconStyle="{
                // fontSize: '22px',
                cursor: 'pointer',
                color: '#666',
              }"
            />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  @click="
                    editTextState = true;
                    bookName = item.name;
                    chooseIndex = index;
                  "
                  v-if="type !== 'fast'"
                  >更名</el-dropdown-item
                >
                <el-dropdown-item
                  v-if="(type === 'fast' && item.isRoot) || type !== 'fast'"
                  @click="memberVisible = true"
                  >协作者</el-dropdown-item
                >
                <el-dropdown-item @click="">分享</el-dropdown-item>
                <el-dropdown-item
                  v-if="type !== 'fast'"
                  @click="chooseBookDetail(item, index)"
                  >设置</el-dropdown-item
                >
                <el-dropdown-item
                  @click="deleteBook(index)"
                  v-if="type !== 'fast'"
                >
                  <span style="color: #9e9e9e">删除</span>
                </el-dropdown-item>
                <el-dropdown-item divided>全屏打开</el-dropdown-item>
                <el-dropdown-item
                  divided
                  @click="
                    type === 'book'
                      ? fastBook(index, chooseKey, nodes[index])
                      : deleteFastBook(index, chooseKey)
                  "
                  >{{
                    type === "book" ? "快捷访问" : "取消快捷访问"
                  }}</el-dropdown-item
                >
                <el-dropdown-item
                  @click="foldBook(index)"
                  v-if="type !== 'fast'"
                  >{{ type === "book" ? "折叠" : "取消折叠" }}</el-dropdown-item
                >
                <el-dropdown-item
                  v-if="type === 'book'"
                  @click="outBook(index, item._key)"
                  >退出协作</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div
        class="menu-tree"
        v-if="
          chooseKey === item._key &&
          nodes.length > 0 &&
          chooseType === type &&
          showState
        "
      >
        <el-tree
          :data="nodes"
          @node-click="
            (node) => {
              setNodeKey(node._key);
              // chooseKey = node._key;
            }
          "
          :accordion="true"
          :expand-on-click-node="false"
          ref="treeRef"
        >
          <template #default="{ node, data }">
            <!-- :style="chooseKey === data._key ? { background: '#ebebeb' } : {}" -->
            <div
              class="menu-tree-item"
              @mouseenter="setOver(item._key, type)"
              @contextmenu="showDropdown($event, 'tree', 0)"
            >
              <div class="tree-item-left" @dblclick="chooseNodeText(data)">
                <FontIcon
                  :iconName="data.docType ? data.docType : 'wenjianjia'"
                  :iconStyle="{
                    // fontSize: '22px',
                    color: '#333',
                    marginRight: '5px',
                  }"
                />
                <div v-if="textState && nodeId === data._key">
                  <el-input
                    id="`nodeName${nodeId}`"
                    v-model="nodeText"
                    placeholder="请输入节点名"
                    autofocus
                    @change="editNodeText(data)"
                    @blur="
                      nodeId = '';
                      textState = false;
                    "
                    size="small"
                  />
                </div>
                <div v-else>{{ node.label }}</div>
              </div>
              <div
                class="tree-item-right"
                v-if="overKey === item._key && overType === type"
              >
                <el-dropdown
                  trigger="click"
                  :tabindex="500"
                  :teleported="false"
                  class="noArrow"
                  placement="bottom-start"
                >
                  <FontIcon
                    iconName="tianjia1"
                    :iconStyle="{
                      cursor: 'pointer',
                      color: '#666',
                    }"
                  />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        @click="addNode(data._key, 'fold', data)"
                        >文件夹</el-dropdown-item
                      >
                      <el-dropdown-item
                        @click="addNode(data._key, 'doc', data, 'draw')"
                        >绘图</el-dropdown-item
                      >
                      <el-dropdown-item
                        @click="addNode(data._key, 'doc', data, 'mind')"
                        >脑图</el-dropdown-item
                      >
                      <el-dropdown-item
                        @click="addNode(data._key, 'doc', data, 'text')"
                        >文本</el-dropdown-item
                      >
                      <el-dropdown-item
                        @click="addNode(data._key, 'doc', data, 'ppt')"
                        >PPT</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-dropdown
                  trigger="click"
                  :tabindex="500"
                  :teleported="false"
                  ref="treeDropdownRef"
                  class="noArrow"
                  placement="bottom-start"
                >
                  <FontIcon
                    iconName="sangedian"
                    :iconStyle="{
                      // fontSize: '22px',
                      cursor: 'pointer',
                      color: '#666',
                    }"
                  />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="chooseNodeText(data)"
                        >重命名</el-dropdown-item
                      >
                      <el-dropdown-item
                        divided
                        @click="
                          type === 'book'
                            ? fastBook(index, data._key, data)
                            : deleteFastBook(index, data._key)
                        "
                        >{{
                          type === "book" ? "快捷访问" : "取消快捷访问"
                        }}</el-dropdown-item
                      >
                      <el-dropdown-item @click="deleteNode(node, data)"
                        >删除</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </template>
        </el-tree>
      </div>
    </div>
    <el-drawer
      title="目录成员"
      v-model="memberVisible"
      :size="360"
      destroy-on-close
    >
      <div><TreeMember /></div>
    </el-drawer>
    <el-drawer title="编辑目录" v-model="infoVisible" :size="360">
      <template #default>
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
                <el-option label="编辑（可改）" :value="2" />
                <el-option label="作者（可新增节点）" :value="3" />
                <el-option label="成员（只读）" :value="4" />
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
      </template>
      <template #footer>
        <div class="dp-center-center">
          <el-button type="primary" @click="editBook()" style="width: 250px"
            >保存</el-button
          >
        </div>
      </template>
    </el-drawer>
  </div>
</template>
<style scoped lang="scss">
.menu-file {
  width: 100%;
  box-sizing: border-box;
  font-size: 14px;
  padding: 0px 10px;
  box-sizing: border-box;
  .menu-item {
    width: 100%;
    height: 30px;
    line-height: 30px;
    border-radius: 4px;
    box-sizing: border-box;
    cursor: pointer;
    @include flex(space-between, center, null);

    .menu-left {
      font-size: 12px;
      color: #333333;
      @include flex(flex-start, center, null);
      span {
        color: #999999;
      }
    }
    .menu-right {
      display: none;
    }
    &:hover {
      background: #ebebeb;
      .menu-right {
        @include flex(flex-start, center, null);
      }
    }
  }
  .menu-tree {
    padding: 0px 0px 0px 10px;
    box-sizing: border-box;
    .menu-tree-item {
      width: 100%;
      height: 100%;
      @include flex(space-between, center, null);
      .tree-item-left {
        flex: 1;
        @include flex(flex-start, center, null);
      }
      .tree-item-right {
        width: 40px;
        @include flex(flex-end, center, null);
      }
    }
  }
}
.book-create {
  width: 350px;
  height: 100%;
  padding: 15px 27px;
  box-sizing: border-box;
  @include scroll();
  .book-logo {
    width: 100%;
    height: 300px;
    @include flex(center, center, null);
    .logo-box {
      width: 250px;
      height: 250px;
      border-radius: 12px;
      .logo-item {
        font-size: 50px;
        color: #ebebeb;
      }
    }
  }
  .book-name {
  }
}
</style>
<style lang="scss">
.menu-file {
  .el-tree {
    background-color: #f9f9f9;
    font-size: 12px;
    color: #333;
    --el-tree-node-hover-bg-color: #ebebeb;
    .el-tree-node__children {
      overflow: inherit !important;
    }
  }
}
</style>
