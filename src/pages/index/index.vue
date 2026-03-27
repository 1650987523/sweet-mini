<script lang="ts" setup>
import type { BannerInfo } from '@/api/types'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { getBannerList } from '@/api/index'
import { useStoreStore } from '@/store/store'
import { parseScanCode } from '@/utils/qrcode'

defineOptions({
  name: 'Home',
})

definePage({
  type: 'home',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
})

const storeStore = useStoreStore()
const currentStore = computed(() => storeStore.currentStore)
const bannerList = ref<BannerInfo[]>([])
const loading = ref(true)

/**
 * 处理扫码进入
 */
onLoad(async (options) => {
  console.log('================================')
  console.log('扫码进入小程序首页onload, 完整参数:', options)
  console.log('================================')

  // 优先从 options.scene 获取（首次扫码进入）
  // 其次从 storage 获取（登录后返回）
  const scene = options.scene || uni.getStorageSync('scene')

  if (scene) {
    await parseScanCode(scene)
  }

  loadBanner()
})

/**
 * 加载轮播图
 */
async function loadBanner() {
  loading.value = true

  getBannerList({ status: 1, storeId: 0 }).then((res) => {
    console.log('轮播图数据:', res)
    bannerList.value = res
  }).finally(() => {
    loading.value = false
  })
}

// 轮播图切换事件
function change(index: number) {
  // console.log('轮播图切换:', index)
}

// 轮播图点击事件
function click(item: BannerInfo) {
  console.log('点击了轮播图:', item)
  // TODO: 根据 linkType 和 linkParams 跳转
}

/**
 * 跳转到门店列表
 */
function goToStore() {
  uni.navigateTo({
    url: '/pages/store/index',
  })
}

/**
 * 跳转到点单页面
 */
function goToOrder() {
  if (!currentStore.value) {
    uni.showToast({ title: '请先选择门店', icon: 'none' })
    return
  }
  uni.switchTab({
    url: '/pages/product/index',
  })
}
</script>

<template>
  <view class="page-bg">
    <up-swiper
      :list="bannerList"
      key-name="imageUrl"
      height="50vh"
      interval="3000"
      indicator
      indicator-mode="line"
      :loading="loading"
      @change="change"
    />
    <!-- <up-gap height="2vh" /> -->

    <up-card :border="false" title="操作">
      <template #body>
        <view class="flex items-center">
          <view class="flex flex-1 flex-col items-center justify-center" @click="goToOrder">
            <up-icon name="shopping-cart-fill" size="32" color="#3b82f6" />
            <up-gap height="4px" />
            <text class="text-base">点单</text>
          </view>
          <up-line direction="col" length="40px" :hairline="false" color="#dcdcdc" margin="0 5px" />
          <view class="flex flex-1 flex-col items-center justify-center">
            <up-icon name="star-fill" size="32" color="#f59e0b" />
            <up-gap height="4px" />
            <text class="text-base">收藏</text>
          </view>
        </view>
      </template>
    </up-card>

    <up-card v-if="currentStore" title="门店信息" :border="false">
      <template #body>
        <view class="flex items-center justify-between py-2">
          <view class="flex flex-col">
            <text class="text-base">{{ currentStore.name }}</text>
            <text v-if="currentStore.qrcodeNo" class="text-sm text-gray-500">桌号：{{ currentStore.qrcodeNo }}</text>
          </view>
          <!-- <up-icon name="arrow-right" color="#999" /> -->
        </view>
      </template>
    </up-card>
    <up-card v-else title="门店信息" :border="false">
      <template #body>
        <view class="flex items-center justify-between py-2">
          <text class="text-gray-400">暂未选择门店</text>
          <!-- <up-icon name="arrow-right" color="#999" /> -->
        </view>
      </template>
    </up-card>
  </view>
</template>
