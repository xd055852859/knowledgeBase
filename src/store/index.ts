import { authStore } from "@/store/auth";
import { commonStore } from "@/store/common";
import { spaceStore } from "@/store/space";
import { bookStore } from "@/store/book";
import { nodeStore } from "@/store/node";
import { createPinia } from "pinia";
export interface IAppStore {
  authStore: ReturnType<typeof authStore>;
  commonStore: ReturnType<typeof commonStore>;
  spaceStore: ReturnType<typeof spaceStore>;
  bookStore: ReturnType<typeof bookStore>;
  nodeStore: ReturnType<typeof nodeStore>;
}

const appStore: IAppStore = {} as IAppStore;
/**
 * 注册app状态库
 */

export const registerStore = () => {
  appStore.authStore = authStore();
  appStore.commonStore = commonStore();
  appStore.spaceStore = spaceStore();
  appStore.bookStore = bookStore();
  appStore.nodeStore = nodeStore();
};

export default appStore;
