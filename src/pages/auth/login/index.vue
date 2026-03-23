<script lang="ts" setup>
import { useTokenStore } from '@/store/token'

definePage({
  style: {
    navigationBarTitleText: '登录',
  },
})

const tokenStore = useTokenStore()

// 控制绑定引导弹出层显示
const showBindGuide = ref(false)

async function handleWxLogin() {
  try {
    await tokenStore.wxLogin()
    uni.switchTab({
      url: '/pages/index/index',
    })
  }
  catch (error) {
    console.log('微信登录失败', error)
  }
}
</script>

<template>
  <view class="min-h-screen center">
    <view class="w-1/2">
      <u-button type="primary" text="立即登录" @click="handleWxLogin" />
    </view>
  </view>
</template>
