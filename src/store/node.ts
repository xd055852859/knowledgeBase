import { ref } from "vue";
import { defineStore } from "pinia";

import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
// import { Node, NodeDetail, NodeMember } from "@/interface/Node";
import { authStore } from "./auth";
import { formatData } from "@/services/util";
import _ from "lodash";
// 使用setup模式定义
export const nodeStore = defineStore("nodeStore", () => {
  const nodes = ref<any>([]);
  const nodeKey = ref<string>("");
  const nodeDetail = ref<any>(null);
  const nodeRefresh = ref<boolean>(false);
  const setNodeKey = (newKey) => {
    nodeKey.value = newKey;
  };
  const setNodes = async (newList) => {
    nodes.value = _.cloneDeep(newList);
  };
  const getNodes = async (newKey) => {
    let dataRes: any = (await api.request.get("node/tree", {
      nodeKey: newKey,
    })) as ResultProps;
    if (dataRes.msg === "OK") {
      nodes.value = [formatData(dataRes.data, newKey)];
    }
  };
  const getNodeDetail = async (newKey) => {
    let detailRes = (await api.request.get("node/detail", {
      nodeKey: newKey,
    })) as ResultProps;
    if (detailRes.msg === "OK") {
      nodeDetail.value = detailRes.data;
    }
  };
  const setNodeDetail = (newDetail) => {
    nodeDetail.value = newDetail;
  };
  const setNodeRefresh = (newRefresh) => {
    nodeRefresh.value = newRefresh;
  };
  watch(nodeKey, (newKey) => {
    if (newKey) {
      getNodeDetail(newKey);
    }
  });
  return {
    nodeKey,
    setNodeKey,
    nodes,
    setNodes,
    getNodes,
    nodeDetail,
    setNodeDetail,
    getNodeDetail,
    nodeRefresh,
    setNodeRefresh,
  };
});
