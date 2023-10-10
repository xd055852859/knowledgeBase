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
import Drawer from "@/components/drawer.vue";
const { chooseKey, chooseType, overKey, overType } = storeToRefs(
  appStore.commonStore
);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { bookKey, createBookVisible } = storeToRefs(appStore.bookStore);
const { nodes, nodeKey } = storeToRefs(appStore.nodeStore);
const { setChoose, setFullState } = appStore.commonStore;
const { setNodeKey, getNodes, setNodes, setNodeRefresh } = appStore.nodeStore;
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
const overE = ref<any>(null);
const overEkey = ref<string>("");
const bookDropdownRef = ref<any>(null);
const treeDropdownRef = ref<any>(null);
const iframeRefs = {};

const chooseNode = (data) => {
  setChoose(data._key, props.type);
  setBookKey(data.bookKey);
  setNodeKey(data._key);
  if (data.docType) {
    router.push("/detail/nodeDetail");
  } else {
    router.push("/detail/nodeTable");
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
    bookKey: props.list[index].bookKey,
    showInHomePage: props.type === "book" ? false : true,
  })) as ResultProps;
  if (bookRes.msg === "OK") {
    ElMessage.success(`${props.type === "book" ? "折叠" : "取消折叠"}目录成功`);
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
  docType?: string
) => {
  //peer弟弟 elder-peer哥哥
  let obj: any = {
    type: nodeType,
    nodeKey: selectedId,
    fatherKey: selectedId,
    addType: "child",
    name: "新文件夹",
  };
  if (docType) {
    obj.docType = docType;
    switch (docType) {
      case "mind":
        obj.name = "脑图";
        break;
      case "draw":
        obj.name = "绘图";
        break;
      case "text":
        obj.name = "文本";
        break;
    }
  }
  let addTaskRes: any = await api.request.post("node", { ...obj });
  if (addTaskRes.msg === "OK") {
    ElMessage.success("创建新节点成功");
    addTaskRes.data.leaf = true;
    let childData = { ...addTaskRes.data };
    let newDate = _.cloneDeep(data);
    console.log(data);
    treeRef.value.append(childData, newDate);
    treeRef.value.setCurrentKey(childData._key);
    if (!docType) {
      setNodeRefresh(true);
    }
    // loadNode(treeRef.value.getNode(data._key))
    // treeRef.value.updateKeyChildren(data._key, newData);
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
const editNodeText = (data) => {
  updateNode("name", nodeText.value, () => {
    data.name = nodeText.value;
    nodeId.value = "";
  });
};
const chooseNodeText = (data) => {
  let newDate = _.cloneDeep(data);
  nodeId.value = newDate._key;
  nodeText.value = newDate.name;
  textState.value = true;
  document.getElementById("nodeName" + newDate._key)?.focus();
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
      let newDate = _.cloneDeep(data);
      treeRef.value.remove(newDate);
    });
  });
};
const dragNode = async (dragNode, dropNode, type, e) => {
  let dragData = dragNode.data;
  let dropData = dropNode.data;
  if (dragData.isRoot && dropData.isRoot) {
    let order = props.list.map((item) => item.bookKey);
    console.log(order);
    let drageRes: any = await api.request.patch("book/order", {
      bookKeyArr: order,
    });
    if (drageRes.msg === "OK") {
    }
  } else {
    let drageRes: any = await api.request.patch("node/drag", {
      nodeKey: dragData._key,
      targetNodeKey: dropData._key,
      placement: type === "before" ? "up" : type === "after" ? "down" : "in",
    });
    if (drageRes.msg === "OK") {
    }
  }
  if (type === "inner") {
    dropNode.isLeaf = false;
  }
  e.target.style.backgroundColor = "transparent";
  e.target.style.color = "#333";
  if (overE.value) {
    overE.value.style.backgroundColor = "transparent";
    overE.value.style.color = "#333";
  }
  overE.value = null;
  // overE.value = [];
};
const showDropdown = (e, data) => {
  console.log(iframeRefs[`${props.type}${data._key}`]);
  if (!iframeRefs[`${props.type}${data._key}`]) return;
  console.log("???");
  iframeRefs[`${props.type}${data._key}`].handleOpen();
};

const loadNode = async (node, resolve) => {
  console.log(node);
  if (node.loading) {
    let dataRes: any = (await api.request.get("node/list", {
      nodeKey: node.data._key,
    })) as ResultProps;
    if (dataRes.msg === "OK") {
      dataRes.data = dataRes.data.map((item) => {
        item.leaf = item.childNum === 0;
        return item;
      });
      resolve(dataRes.data);
    }
  }
};

const allowNode = (dragNode, dropNode, type) => {
  let dragData = dragNode.data;
  let dropData = dropNode.data;
  // // console.log(type);
  if (type === "prev" || type === "next") {
    if (dragData.isRoot && dropData.isRoot) {
      return true;
    } else if (
      dragData.bookKey !== dropData.bookKey ||
      (dragData.isRoot && !dropData.isRoot) ||
      (!dragData.isRoot && dropData.isRoot)
    ) {
      return false;
    }
  } else if (type === "inner") {
    if (dragData.bookKey !== dropData.bookKey) {
      // ElMessage.error("不能跨目录拖动文件");
      return false;
    }
  }
  return true;
};
const enterNode = (dragNode, dropNode, e) => {
  e.target.style.backgroundColor = "#0091ff";
  e.target.style.color = "#fff";
  console.log("Xxxxx", e.target);
  // overEkey.value = e.target.parentNode.dataset.key;
  if (overE.value) {
    overE.value.style.backgroundColor = "transparent";
    overE.value.style.color = "#333";
  }
  overE.value = e.target;
  // console.log(1, overE.value);
};
const leaveNode = (dragNode, dropNode, e) => {
  console.log(2, overE.value);
};
const editFullScreen = (data) => {
  if (props.type === "book") {
    getNodes(data._key);
    setFullState(true);
  } else {
    setNodes([]);
    setFullState(false);
  }
};
const setItemRef = (el, key) => {
  if (el) {
    iframeRefs[key] = el;
  }
};
// watch(nodeKey, (newKey) => {
//   if (newKey) {
//     chooseKey.value = newKey;
//   }
// });
console.log(props.list);
</script>
<template>
  <div class="menu-file">
    <div class="menu-tree" v-if="list">
      <el-tree
        :data="list"
        :load="type !== 'left' ? loadNode : null"
        :lazy="type !== 'left'"
        :accordion="true"
        :indent="15"
        node-key="_key"
        :default-expand-all="type === 'left'"
        :expand-on-click-node="false"
        ref="treeRef"
        :draggable="type === 'book' || type === 'left'"
        :allow-drop="allowNode"
        @node-click="chooseNode"
        @node-contextmenu="showDropdown"
        @node-drop="dragNode"
        @node-drag-enter="enterNode"
        @node-drag-leave="leaveNode"
        :props="
          type !== 'left'
            ? {
                isLeaf: 'leaf',
                label: 'name',
                children: 'sortList',
              }
            : {}
        "
      >
        <template #default="{ node, data }">
          <!-- :style="chooseKey === data._key ? { background: '#ebebeb' } : {}" -->
          <!--  @mouseenter="setOver(data._key, type)" -->
          <div class="menu-tree-item">
            <div
              class="tree-item-left"
              @dblclick="data.isRoot ? null : chooseNodeText(data)"
            >
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
              <div
                v-else
                class="single-to-long"
                style="max-width: calc(100% - 30px)"
              >
                {{ data.name }}
              </div>
              <div
                @click="memberVisible = true"
                class="dp-center-center"
                v-if="data.memberCount"
              >
                <FontIcon
                  :iconName="
                    data.memberCount > 1 ? 'xiezuozhe' : 'sheweishenqingjiaru'
                  "
                  :iconStyle="{
                    fontSize: '14px',
                    color: '#333',
                    margin: '0px 5px 0px 10px',
                  }"
                />
                <!-- <span v-if="data.memberCount > 1">{{ data.memberCount }}</span> -->
              </div>
            </div>
            <div class="tree-item-right">
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
                    <el-dropdown-item @click="addNode(data._key, 'fold', data)"
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
                :ref="(el) => setItemRef(el, `${type}${data._key}`)"
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
                    <el-dropdown-item
                      @click="
                        data.isRoot
                          ? chooseBookDetail(data, data.index)
                          : chooseNodeText(data)
                      "
                      >重命名</el-dropdown-item
                    >
                    <el-dropdown-item
                      v-if="data.isRoot"
                      @click="memberVisible = true"
                      >协作者</el-dropdown-item
                    >
                    <el-dropdown-item @click="">分享</el-dropdown-item>
                    <el-dropdown-item
                      v-if="type !== 'fast' && data.isRoot"
                      @click="chooseBookDetail(data, data.index)"
                      >设置</el-dropdown-item
                    >
                    <el-dropdown-item
                      divided
                      v-if="type === 'left' || type === 'book'"
                      @click="editFullScreen(data)"
                    >
                      {{ type === "book" ? "全屏" : "缩小" }}
                    </el-dropdown-item>
                    <!--   -->
                    <el-dropdown-item
                      divided
                      @click="
                        type === 'book'
                          ? fastBook(data.index, data._key, data)
                          : deleteFastBook(data.index, data._key)
                      "
                      v-if="
                        (type === 'fast' && node.level === 1) || type === 'book'
                      "
                      >{{
                        type === "book" ? "快捷访问" : "取消快捷访问"
                      }}</el-dropdown-item
                    >
                    <el-dropdown-item
                      @click="
                        data.isRoot
                          ? deleteBook(data.index)
                          : deleteNode(node, data)
                      "
                      v-if="
                        !(
                          (type === 'fast' || type === 'left') &&
                          (data.isRoot || node.level === 1)
                        )
                      "
                    >
                      删除</el-dropdown-item
                    >
                    <!--  && type !== 'fold' && data.isRoot -->
                    <el-dropdown-item
                      @click="foldBook(data.index)"
                      v-if="type !== 'fast'"
                      >{{
                        type === "book" ? "折叠" : "取消折叠"
                      }}</el-dropdown-item
                    >
                    <el-dropdown-item
                      v-if="type === 'book'"
                      @click="outBook(data.index, data._key)"
                      >退出协作</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </template>
      </el-tree>
    </div>
    <Drawer
      title="目录成员"
      :visible="memberVisible"
      @close="memberVisible = false"
      :drawerStyle="{ width: '365px', left: '244px' }"
    >
      <template #content> <TreeMember /></template>
    </Drawer>
    <el-dialog title="编辑目录" v-model="infoVisible" width="358px">
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
      <template #footer>
        <div class="dp-center-center">
          <el-button type="primary" @click="editBook()" style="width: 208px"
            >保存</el-button
          >
        </div>
      </template>
    </el-dialog>
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
    .menu-tree-item {
      width: calc(100% - 25px);
      height: 100%;
      @include flex(space-between, center, null);
      .tree-item-left {
        width: calc(100% - 35px);
        @include flex(flex-start, center, null);
      }
      .tree-item-right {
        width: 30px;
        display: none;
      }
      &:hover {
        .tree-item-right {
          @include flex(flex-end, center, null);
        }
      }
    }
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
