<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app'
import { useTokenStore } from '@/store/token'

definePage({
  style: {
    navigationBarTitleText: '登录',
  },
})

const tokenStore = useTokenStore()

// 登录中状态
const loggingIn = ref(false)

let scene = ''

onLoad((options) => {
  console.log('================================')
  console.log('登录页onload, 完整参数:', options)
  console.log('================================')
  scene = options.scene || ''
  handleWxLogin()
})

async function handleWxLogin() {
  if (loggingIn.value)
    return
  loggingIn.value = true

  try {
    await tokenStore.wxLogin()

    // 如果有 scene，先存储起来，登录后带回首页
    if (scene) {
      uni.setStorageSync('scene', scene)
    }

    uni.switchTab({
      url: '/pages/index/index',
    })
  }
  catch (error) {
    console.log('微信登录失败', error)
    loggingIn.value = false
  }
}
</script>

<template>
  <view class="min-h-screen center">
    <view class="w-1/2">
      <u-button type="primary" text="立即登录" :loading="loggingIn" :disabled="loggingIn" @click="handleWxLogin" />
    </view>
  </view>
</template>
