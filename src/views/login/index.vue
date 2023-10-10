<script setup lang="ts">
import router from "@/router";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import Login from "./login.vue";
import Reset from "./reset.vue";

const { loginState } = storeToRefs(appStore.authStore);
// const { setToken, getUserInfo } = appStore.authStore;
onMounted(() => {
  if (localStorage.getItem("auth_token")) {
    router.replace("/detail");
  }
});
</script>
<template>
  <div class="login">
    <div class="login-box">
      <div class="login-logo">
        <img src="/common/logoTitle.svg" alt="" />
      </div>
      <div class="login-container">
        <Login v-if="loginState === 'login'" /> <Reset v-else />
      </div>
      <div class="login-bottom">登录或注册代表你同意 用户条款</div>
    </div>
  </div>
</template>
<style lang="scss">
.login {
  width: 100vw;
  height: 100vh;
  background: #ffffff;

  @include flex(center, center, null);
  .login-box {
    width: 387px;
    height: 579px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0px 2px 14px 0px rgba(0, 0, 0, 0.11);
    padding-top: 44px;
    box-sizing: border-box;
    position: relative;
    z-index: 1;
    .login-logo {
      width: 100%;
      height: 58px;
      margin-bottom: 25px;
      @include flex(center, center, null);
      img {
        width: 163px;
        height: 58px;
      }
    }
    .login-container {
      width: 100%;
      height: calc(100% - 127px);
      padding: 0px 34px;
      box-sizing: border-box;
      .login-input {
        width: 100%;
        height: 50px;
        margin-bottom: 25px;
        border-radius: 4px;
        color: #999999;
        @include flex(space-between, center, null);
        .el-input__wrapper {
          height: 100%;
          background-color: $loginInput;
        }
      }
      .login-button {
        width: 318px;
        height: 48px;
        border-radius: 4px;
      }
      .login-prompt {
        width: 100%;
        height: 20px;
        font-size: 14px;
        text-align: center;
        cursor: pointer;
        line-height: 20px;
        margin-top: 16px;
        > span {
          color: $commonColor;
        }
      }
    }
    .login-bottom {
      width: 100%;
      height: 47px;
      background: $loginInput;
      border-radius: 0px 0px 12px 12px;
      line-height: 47px;
      font-size: 12px;
      color: #999999;
      text-align: center;
      position: absolute;
      z-index: 2;
      left: 0px;
      bottom: 0px;
    }
  }
}
</style>
<style></style>
