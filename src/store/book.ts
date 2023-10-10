import { ref } from "vue";
import { defineStore } from "pinia";

import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { Book, BookDetail } from "@/interface/Book";
import _ from "lodash";
// 使用setup模式定义
export const bookStore = defineStore(
  "bookStore",
  () => {
    const bookKey = ref<string>("");
    const bookList = ref<Book[]>([]);
    const foldBookList = ref<Book[]>([]);
    const fastBookList = ref<any>([]);
    const bookMemberList = ref<any>([]);
    const bookDetail = ref<BookDetail | null>(null);
    const bookRole = ref<number>(5);
    const createBookVisible = ref<boolean>(false);
    const setCreateBookVisible = (visible) => {
      createBookVisible.value = visible;
    };
    const setBookKey = (newKey) => {
      bookKey.value = newKey;
    };
    const setBookList = async (list) => {
      bookList.value = _.cloneDeep(list);
    };
    const getBookList = async (spaceKey) => {
      let bookRes = (await api.request.get("book", {
        spaceKey: spaceKey,
        showInHomePage: true,
        page: 1,
        limit: 1000,
      })) as ResultProps;
      if (bookRes.msg === "OK") {
        bookList.value = bookRes.data.map((item, index) => {
          item.index = index;
          item.leaf = !item.hasChild;
          item.sortList = item.sortList ? item.sortList : [];
          return item;
        });
      }
    };
    const setFoldBookList = async (list) => {
      foldBookList.value = _.cloneDeep(list);
    };
    const getFoldBookList = async (spaceKey) => {
      let bookRes = (await api.request.get("book", {
        spaceKey: spaceKey,
        showInHomePage: false,
        page: 1,
        limit: 1000,
      })) as ResultProps;
      if (bookRes.msg === "OK") {
        foldBookList.value = bookRes.data.map((item, index) => {
          item.index = index;
          item.leaf = !item.hasChild;
          item.sortList = item.sortList ? item.sortList : [];
          return item;
        });
      }
    };
    const setFastBookList = async (list) => {
      fastBookList.value = _.cloneDeep(list);
    };
    const getFastBookList = async (spaceKey) => {
      let bookRes = (await api.request.get("quickAccess/list", {
        spaceKey: spaceKey,
      })) as ResultProps;
      if (bookRes.msg === "OK") {
        fastBookList.value = bookRes.data.map((item, index) => {
          item.index = index;
          item.leaf = !item.hasChild;
          item.sortList = item.sortList ? item.sortList : [];
          return item;
        });
      }
    };
    const setBookMemberList = async (list) => {
      console.log(list);
      bookMemberList.value = _.cloneDeep(list);
    };
    const getBookMemberList = async (newKey) => {
      let memberRes = (await api.request.get("bookMember", {
        bookKey: newKey,
      })) as ResultProps;
      if (memberRes.msg === "OK") {
        bookMemberList.value = memberRes.data;
      }
    };
    const setBookDetail = async (detail) => {
      bookDetail.value = _.cloneDeep(detail);
    };
    const getBookDetail = async (newKey) => {
      let dataRes = (await api.request.get("book/detail", {
        bookKey: newKey,
      })) as ResultProps;
      if (dataRes.msg === "OK") {
        bookDetail.value = dataRes.data;
        bookRole.value = dataRes.data.role;
      }
    };
    watch(
      bookKey,
      (newKey) => {
        if (newKey) {
          getBookMemberList(newKey);
          getBookDetail(newKey);
        }
      },
      { immediate: true }
    );
    return {
      createBookVisible,
      setCreateBookVisible,
      bookKey,
      setBookKey,
      bookList,
      setBookList,
      getBookList,
      foldBookList,
      setFoldBookList,
      getFoldBookList,
      fastBookList,
      setFastBookList,
      getFastBookList,
      bookMemberList,
      setBookMemberList,
      getBookMemberList,
      bookRole,
      bookDetail,
      setBookDetail,
      getBookDetail,
    };
  }
  // {
  //   persist: {
  //     // storage: window.sessionStorage,
  //     // 部分持久化状态的点符号路径数组，[]意味着没有状态被持久化(默认为undefined，持久化整个状态)
  //     // paths: ['nested.data'],
  //   },
  // }
);
