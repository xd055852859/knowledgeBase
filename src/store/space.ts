import { ref } from "vue";
import { defineStore } from "pinia";

import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { Space, SpaceDetail, SpaceMember } from "@/interface/Space";
import { authStore } from "./auth";
// 使用setup模式定义
export const spaceStore = defineStore(
  "spaceStore",
  () => {
    const spaceKey = ref<string>("");
    const spaceList = ref<Space[]>([]);
    const spaceMemberList = ref<SpaceMember[]>([]);
    const spaceDetail = ref<SpaceDetail | null>(null);
    const spaceRole = ref<number>(5);

    const setSpaceKey = (newKey) => {
      spaceKey.value = newKey;
      localStorage.setItem("spaceKey", newKey);
    };
    const getSpaceList = async () => {
      let spaceRes = (await api.request.get("space")) as ResultProps;
      if (spaceRes.msg === "OK") {
        spaceList.value = spaceRes.data;
      }
    };
    const setSpaceList = async (newList) => {
        spaceList.value = newList;
    };
    
    const getSpaceMemberList = async () => {
      let memberRes = (await api.request.get("spaceMember", {
        spaceKey: spaceKey.value,
      })) as ResultProps;
      if (memberRes.msg === "OK") {
        spaceMemberList.value = memberRes.data;
      }
    };
    const setSpaceMemberList= (newList) => {
      spaceMemberList.value = newList;
    };
    const getSpaceDetail = async () => {
      let spaceRes = (await api.request.get("space/home", {
        spaceKey: spaceKey.value,
      })) as ResultProps;
      if (spaceRes.msg === "OK") {
        spaceDetail.value = spaceRes.data;
        spaceRole.value = spaceRes.data.role;
      } else if (spaceRes.status === 202) {
        spaceKey.value = authStore().user?.privateSpace as string;
        localStorage.removeItem("spaceKey");
      }
    };
    const setSpaceDetail = (newDetail) => {
      spaceDetail.value = newDetail;
    };
    return {
      spaceKey,
      setSpaceKey,
      spaceRole,
      spaceDetail,
      setSpaceDetail,
      getSpaceDetail,
      spaceList,
      setSpaceList,
      getSpaceList,
      spaceMemberList,
      setSpaceMemberList,
      getSpaceMemberList,
    };
  },
  // {
  //   persist: {
  //     // storage: window.sessionStorage,
  //     // 部分持久化状态的点符号路径数组，[]意味着没有状态被持久化(默认为undefined，持久化整个状态)
  //     // paths: ['nested.data'],
  //   },
  // }
);
