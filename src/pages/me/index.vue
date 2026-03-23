<script lang="ts" setup>
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '我的',
  },
})

const userStore = useUserStore()
const userCardTitle = ref('用户信息')
const userCardSubTitle = ref('')
const funcitonCardTitle = ref('我的功能')
const funcitonCardSubTitle = ref('')

const menuItems = [
  {
    icon: 'setting',
    text: '设置',
    url: '/pages/settings/settings',
  },
  {
    icon: 'map',
    text: '版本信息',
    url: '/pages/address/address',
  },
]

// 页面显示时确保用户信息已加载（pinia 插件会自动从本地存储恢复）
onShow(() => {
  console.log('用户信息:', userStore.userInfo)
})

function handleMenuClick(url: string) {
  uni.navigateTo({ url })
}
</script>

<template>
  <view class="page-bg min-h-screen p-4 pt-[10vh]">
    <!-- 用户信息卡片 -->
    <up-card :title="userCardTitle" :sub-title="userCardSubTitle" :border="false">
      <template #body>
        <view class="flex items-center">
          <up-avatar
            :size="60"
            :src="userStore.userInfo.avatar || '/static/default-avatar.png'"
          />
          <view class="ml-4 flex-1">
            <view class="text-lg font-bold">
              {{ userStore.userInfo.nickname }}
            </view>
            <view class="mt-2">
              <up-tag
                text="普通会员"
                plain
                type="primary"
                size="mini"
              />
            </view>
          </view>
        </view>
      </template>
    </up-card>

    <!-- 我的功能卡片 -->
    <up-card :title="funcitonCardTitle" :sub-title="funcitonCardSubTitle" :border="false">
      <template #body>
        <view class="flex flex-wrap">
          <view
            v-for="item in menuItems"
            :key="item.text"
            class="w-1/3 flex flex-col items-center py-4"
            @click="handleMenuClick(item.url)"
          >
            <up-icon :name="item.icon" size="24" />
            <text class="mt-2 text-sm">{{ item.text }}</text>
          </view>
        </view>
      </template>
    </up-card>
  </view>
</template>
