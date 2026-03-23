<script lang="ts" setup>
import type { Store } from '@/api/types/store'
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { getStorePage } from '@/api/store'
import { useStoreStore } from '@/store/store'

definePage({
  style: {
    navigationBarTitleText: '门店',
  },
})

const storeStore = useStoreStore()

// 当前选择的门店
const currentStore = computed(() => storeStore.currentStore)

// 搜索关键词
const storeName = ref('')
const storeList = ref<Store[]>([])
const pageNo = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const loading = ref(false)

/**
 * 加载门店列表
 */
async function loadStoreList() {
  if (loading.value)
    return

  // 加载中
  loading.value = true

  // 请求数据
  try {
    const res = await getStorePage({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      storeName: storeName.value,
    })

    if (pageNo.value === 1) {
      storeList.value = res.records
    }
    else {
      storeList.value = [...storeList.value, ...res.records]
    }

    if (res.records.length < pageSize.value) {
      hasMore.value = false
    }
  }
  catch (error) {
    console.error('加载门店列表失败:', error)
  }
  finally {
    loading.value = false
  }
}

/**
 * 滚动到底部，加载更多
 */
function scrolltolower() {
  if (!hasMore.value) {
    uni.showToast({
      title: '没有更多了',
      icon: 'none',
    })
    return
  }
  pageNo.value++
  loadStoreList()
}

/**
 * 搜索
 */
function onSearch() {
  pageNo.value = 1
  storeList.value = []
  hasMore.value = true
  loadStoreList()
}

/**
 * 清空搜索
 */
function onClear() {
  storeName.value = ''
  onSearch()
}

/**
 * 选择门店
 */
function selectStore(store: Store) {
  storeStore.setCurrentStore(store)
  uni.switchTab({
    url: '/pages/product/index',
  })
}

onShow(() => {
  onSearch()
})
</script>

<template>
  <view>
    <!-- 吸顶搜索栏 -->
    <up-sticky>
      <up-search
        v-model="storeName"
        placeholder="搜索门店"
        shape="round"
        :clearabled="true"
        @search="onSearch"
        @clear="onClear"
      />
    </up-sticky>

    <!-- 门店列表 -->
    <up-list enable-flex @scroll-to-lower="scrolltolower">
      <up-list-item
        v-for="item in storeList"
        :key="item.id"
        :class="{ selected: currentStore?.id === item.id }"
      >
        <up-cell
          :title="item.name"
          :label="item.address"
          @click="selectStore(item)"
        >
          <template #icon>
            <up-avatar
              shape="square"
              :text="item.name.charAt(0)"
              font-size="18"
              random-bg-color
            />
          </template>
        </up-cell>
        <!-- <view class="flex items-center">
          <up-avatar
            shape="square"
            :text="item.name.charAt(0)"
            font-size="18"
            random-bg-color
          />
          <view class="ml-3 flex-1">
            <view class="text-base">
              {{ item.name }}
            </view>
            <view class="text-sm text-gray-500">
              {{ item.address }}
            </view>
          </view>
          <up-icon v-if="currentStore?.id === item.id" name="checkmark" color="#19be6b" />
        </view> -->
      </up-list-item>

      <!-- 加载更多 -->
      <view v-if="loading" class="py-4 text-center">
        <up-loading-icon text="加载中..." />
      </view>

      <!-- 没有更多 -->
      <view v-if="!hasMore && storeList.length > 0" class="py-4 text-center text-gray-400">
        没有更多了
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && storeList.length === 0" class="pt-20">
        <u-empty text="暂无门店" mode="list" />
      </view>
    </up-list>
  </view>
</template>

<style lang="scss" scoped>
.selected {
  background-color: #e8f5e9;
}
</style>
