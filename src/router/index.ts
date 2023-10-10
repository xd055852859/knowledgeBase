import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/home.vue"),
    redirect: "/detail",
    children: [
      {
        path: "detail",
        name: "index",
        component: () => import("@/views/right/index.vue"),
        redirect: "/detail/spaceTable",
        children: [
          {
            path: "spaceTable",
            name: "spaceTable",
            component: () => import("@/views/right/spaceTable.vue"),
            children: [],
          },
          {
            path: "unjoinTable",
            name: "unjoinTable",
            component: () => import("@/views/right/unjoinTable.vue"),
            children: [],
          },
          {
            path: "recovery",
            name: "recovery",
            component: () => import("@/views/right/recovery.vue"),
            children: [],
          },
          {
            path: "nodeTable",
            name: "nodeTable",
            component: () => import("@/views/right/nodeTable.vue"),
            children: [],
          },
          {
            path: "nodeDetail",
            name: "nodeDetail",
            component: () => import("@/views/right/nodeDetail.vue"),
            children: [],
          },
        ],
      },
    ],
  },
  {
    path: "/manage",
    name: "manage",
    component: () => import("@/views/manage/index.vue"),
    redirect: "/manage/basic",
    children: [
      {
        path: "basic",
        name: "basic",
        component: () => import("@/views/manage/basic.vue"),
        children: [],
      },
      {
        path: "member",
        name: "member",
        component: () => import("@/views/manage/member.vue"),
        children: [],
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/login/index.vue"),
    children: [],
  },
];
const routerHistory = createWebHashHistory();
const router = createRouter({
  history: routerHistory,
  routes,
});
//全局后置守卫
router.afterEach((to, from, failure) => {
  if (window.parent != window.self && from.fullPath !== "/") {
    window.parent.postMessage({ url: location.href }, "*");
    localStorage.setItem("url", to.fullPath);
  }
});
export default router;
