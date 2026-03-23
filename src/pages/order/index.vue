<script lang="ts" setup>
import type { OrderPageVo, OrderSkuItem } from '@/api/types'
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { cancelOrder, getOrderList } from '@/api/order'
import { OrderStatusColorMap, OrderStatusEnum, OrderStatusTextMap } from '@/http/tools/enum'
import { useStoreStore } from '@/store/store'
import { useUserStore } from '@/store/user'
import { formatPrice } from '@/utils'

definePage({
  style: {
    navigationBarTitleText: '订单',
  },
})

// 订单 tab 配置
const orderTabs = [
  { id: 'all', name: '全部', status: undefined as number | undefined },
  { id: `${OrderStatusEnum.UNPAID}`, name: '待支付', status: OrderStatusEnum.UNPAID },
  { id: `${OrderStatusEnum.MAKING}`, name: '制作中', status: OrderStatusEnum.MAKING },
  { id: `${OrderStatusEnum.COMPLETED}`, name: '已完成', status: OrderStatusEnum.COMPLETED },
  { id: `${OrderStatusEnum.CANCELLED}`, name: '已取消', status: OrderStatusEnum.CANCELLED },
  { id: `${OrderStatusEnum.REFUNDING}`, name: '退款中', status: OrderStatusEnum.REFUNDING },
  { id: `${OrderStatusEnum.REFUNDED}`, name: '已退款', status: OrderStatusEnum.REFUNDED },
]

// 当前选中的分类索引
const currentTabIndex = ref(0)

// 分页状态
const pageNo = ref(1)
const pageSize = ref(10)
const total = ref(0)
const hasMore = ref(false)
const loading = ref(false)

// 订单列表数据
const orderList = ref<OrderPageVo[]>([])

const userStore = useUserStore()
const storeStore = useStoreStore()

// 获取 userId（从用户信息）
const userId = computed(() => {
  return userStore.userInfo!.userId
})

// 获取 storeId（从当前门店）
const storeId = computed(() => {
  return storeStore.currentStore?.id ?? 0
})

// 当前选中的状态值
const currentStatus = computed(() => {
  return orderTabs[currentTabIndex.value].status
})

/**
 * 构建订单列表请求参数
 */
function buildOrderParams() {
  const params: {
    pageNo: number
    pageSize: number
    userId: number
    storeId: number
    orderStatus?: number
  } = {
    pageNo: pageNo.value,
    pageSize: pageSize.value,
    userId: userId.value,
    storeId: storeId.value,
  }
  // 全部状态时不传 orderStatus
  if (currentStatus.value !== undefined) {
    params.orderStatus = currentStatus.value
  }
  return params
}

/**
 * 处理订单列表响应数据
 */
function handleOrderListResponse(newList: OrderPageVo[]) {
  // 第一页直接替换，否则追加
  orderList.value = pageNo.value === 1 ? newList : [...orderList.value, ...newList]
  total.value = newList.length > 0 ? total.value : 0
  // 判断是否还有更多数据
  hasMore.value = newList.length === pageSize.value
  if (hasMore.value) {
    pageNo.value++
  }
}

/**
 * 获取订单列表
 */
async function getOrderListData() {
  if (loading.value)
    return

  loading.value = true
  try {
    const params = buildOrderParams()
    const res = await getOrderList(params)
    handleOrderListResponse(res.records || [])
  }
  catch (err) {
    console.error('获取订单列表失败:', err)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
  finally {
    loading.value = false
  }
}

/**
 * 搜索订单（重置参数并获取列表）
 */
function onSearch() {
  pageNo.value = 1
  orderList.value = []
  hasMore.value = false
  getOrderListData()
}

/**
 * 点击顶部分类，切换订单列表
 */
function scrollToCategory(index: number) {
  if (currentTabIndex.value === index)
    return
  currentTabIndex.value = index
  onSearch()
}

/**
 * 滚动加载更多
 */
function onScrollToLower() {
  if (hasMore.value && !loading.value) {
    getOrderListData()
  }
}

/**
 * 取消订单
 */
async function handleCancel(orderNo: string) {
  const res = await uni.showModal({
    title: '提示',
    content: '确定要取消订单吗？',
  })
  if (res.confirm) {
    try {
      await cancelOrder(orderNo, userId.value)
      uni.showToast({ title: '订单已取消', icon: 'success' })
      onSearch()
    }
    catch (err) {
      console.error('取消订单失败:', err)
      uni.showToast({ title: '取消失败', icon: 'none' })
    }
  }
}

/**
 * 去支付
 */
function handlePay(orderNo: string) {
  uni.navigateTo({
    url: `/pages/order/pay?orderNo=${orderNo}`,
  })
}

/**
 * 查看订单详情
 */
function handleDetail(orderNo: string) {
  uni.navigateTo({
    url: `/pages/order/detail?orderNo=${orderNo}`,
  })
}

/**
 * 获取商品总数量
 */
function getTotalQuantity(orderDetails: OrderSkuItem[]): number {
  return orderDetails.reduce((sum, sku) => sum + sku.quantity, 0)
}

// 页面显示时加载数据
onShow(() => {
  onSearch()
})
</script>

<template>
  <!-- 容器：flex 列布局 -->
  <view class="h-screen flex flex-col overflow-hidden" style="height: calc(100vh - var(--window-top));">
    <!-- 顶部状态栏 -->
    <scroll-view
      class="h-14 w-full flex-shrink-0 bg-white"
      scroll-x
      :scroll-into-view="`menu-${currentTabIndex}`"
      scroll-with-animation
      show-scrollbar
    >
      <view class="h-full flex items-center whitespace-nowrap">
        <view
          v-for="(tab, index) in orderTabs"
          :id="`menu-${index}`"
          :key="tab.id"
          class="relative h-full flex items-center justify-center px-5 transition-all duration-300" :class="[
            currentTabIndex === index ? 'font-bold' : '',
          ]"
          @click="scrollToCategory(index)"
        >
          <text class="text-base text-gray-700">{{ tab.name }}</text>
          <!-- 选中时底部蓝色条 -->
          <view
            v-if="currentTabIndex === index"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
          />
        </view>
      </view>
    </scroll-view>

    <!-- 订单列表 -->
    <scroll-view
      class="flex-1 overflow-hidden bg-gray-50"
      scroll-y
      scroll-with-animation
      @scrolltolower="onScrollToLower"
    >
      <!-- 加载状态 -->
      <view v-if="loading && pageNo === 1" class="flex justify-center py-25">
        <up-loading-icon text="加载中..." />
      </view>

      <!-- 订单列表 -->
      <view v-else-if="orderList.length > 0" class="p-5">
        <view
          v-for="item in orderList"
          :key="item.orderMain.orderNo"
          class="mb-5 overflow-hidden rounded-3xl bg-white"
          @click="handleDetail(item.orderMain.orderNo)"
        >
          <!-- 方案 B：强调取餐信息（堂食版） -->
          <!-- 订单头部：店名 + 状态 -->
          <view class="flex items-center justify-between border-b border-gray-50 px-4 py-3">
            <text class="text-sm text-gray-900 font-bold">{{ item.orderMain.storeName }}</text>
            <text
              class="text-xs"
              :style="{ color: OrderStatusColorMap[item.orderMain.orderStatus] }"
            >
              {{ OrderStatusTextMap[item.orderMain.orderStatus] }}
            </text>
          </view>

          <!-- 桌号信息 -->
          <view v-if="item.orderMain.tableNo" class="border-b border-gray-50 px-4 py-2">
            <text class="text-sm text-gray-600">📦 桌号：{{ item.orderMain.tableNo }}</text>
          </view>

          <!-- 商品信息 -->
          <view class="border-b border-gray-50 px-4 py-3">
            <!-- 商品图片横向滚动：固定显示 3 个，第 4 个开始滚动 -->
            <scroll-view
              class="w-full whitespace-nowrap"
              scroll-x
              :show-scrollbar="false"
            >
              <view class="flex">
                <view
                  v-for="(sku, index) in item.orderDetails"
                  :key="sku.skuId"
                  class="flex-shrink-0"
                  :style="{ width: '4rem', marginRight: index < item.orderDetails.length - 1 ? '0.5rem' : '0' }"
                >
                  <image
                    v-if="sku.skuImages?.[0]?.url"
                    class="h-16 w-16 rounded-md bg-gray-100"
                    :src="sku.skuImages[0].url"
                    mode="aspectFill"
                  />
                  <text class="mt-1 block truncate text-xs text-gray-500">
                    {{ sku.productName || '商品' }}
                  </text>
                </view>
              </view>
            </scroll-view>
            <!-- 商品数量和价格 -->
            <view class="mt-2 flex items-center justify-between">
              <text class="text-xs text-gray-500">
                共 {{ getTotalQuantity(item.orderDetails) }} 件
              </text>
              <text class="text-sm text-red-500 font-bold">
                ¥{{ formatPrice(item.orderMain.payAmount || 0) }}
              </text>
            </view>
          </view>

          <!-- 订单底部 -->
          <view class="flex items-center justify-end border-t border-gray-50 px-4 py-3">
            <view class="flex gap-2">
              <!-- 待支付状态：显示取消和支付按钮 -->
              <template v-if="item.orderMain.orderStatus === OrderStatusEnum.UNPAID">
                <up-button
                  size="small"
                  plain
                  @click.stop="handleCancel(item.orderMain.orderNo)"
                >
                  取消订单
                </up-button>
                <up-button
                  size="small"
                  color="var(--theme-color)"
                  @click.stop="handlePay(item.orderMain.orderNo)"
                >
                  立即支付
                </up-button>
              </template>
              <!-- 其他状态：查看详情 -->
              <up-button
                v-else
                size="small"
                plain
                @click.stop="handleDetail(item.orderMain.orderNo)"
              >
                查看详情
              </up-button>
            </view>
          </view>

          <!--
            ==================== 方案 A 注释备份 ====================
            原始设计：简洁版（店名 + 状态在头部）

            <view class="flex items-center justify-between border-b border-gray-50 px-4 py-3">
              <text class="text-sm text-gray-900 font-bold">{{ item.orderMain.storeName }}</text>
              <text
                class="text-xs"
                :style="{ color: OrderStatusColorMap[item.orderMain.orderStatus] }"
              >
                {{ OrderStatusTextMap[item.orderMain.orderStatus] }}
              </text>
            </view>

            <view class="border-b border-gray-50 px-4 py-3">
              <scroll-view
                class="w-full whitespace-nowrap"
                scroll-x
                :show-scrollbar="false"
              >
                <view class="flex">
                  <view
                    v-for="(sku, index) in item.orderDetails"
                    :key="sku.skuId"
                    class="flex-shrink-0"
                    :style="{ width: '4rem', marginRight: index < item.orderDetails.length - 1 ? '0.5rem' : '0' }"
                  >
                    <image
                      v-if="sku.skuImages?.[0]?.url"
                      class="h-16 w-16 rounded-md bg-gray-100"
                      :src="sku.skuImages[0].url"
                      mode="aspectFill"
                    />
                    <text class="mt-1 block truncate text-xs text-gray-500">
                      {{ sku.productName || '商品' }}
                    </text>
                  </view>
                </view>
              </scroll-view>
              <view class="mt-2 flex items-center justify-between">
                <text class="text-xs text-gray-500">
                  共 {{ getTotalQuantity(item.orderDetails) }} 件
                </text>
                <text class="font-bold text-sm text-red-500">
                  ¥{{ formatPrice(item.orderMain.payAmount || 0) }}
                </text>
              </view>
            </view>

            <view class="flex items-center justify-end border-t border-gray-50 px-4 py-3">
              <view class="flex gap-2">
                <template v-if="item.orderMain.orderStatus === OrderStatusEnum.UNPAID">
                  <up-button size="small" plain @click.stop="handleCancel(item.orderMain.orderNo)">
                    取消订单
                  </up-button>
                  <up-button size="small" color="var(--theme-color)" @click.stop="handlePay(item.orderMain.orderNo)">
                    立即支付
                  </up-button>
                </template>
                <up-button
                  v-else
                  size="small"
                  plain
                  @click.stop="handleDetail(item.orderMain.orderNo)"
                >
                  查看详情
                </up-button>
              </view>
            </view>
            ==================== 方案 A 注释备份 ====================

            ==================== 方案 B 注释备份 ====================
            强调取餐信息（带订单号）

            <view class="flex items-center justify-between border-b border-gray-50 px-4 py-3">
              <view class="flex flex-col">
                <text class="text-xs text-gray-500">订单号</text>
                <text class="text-sm text-gray-900 font-bold">{{ item.orderMain.orderNo }}</text>
              </view>
              <text
                class="text-xs"
                :style="{ color: OrderStatusColorMap[item.orderMain.orderStatus] }"
              >
                {{ OrderStatusTextMap[item.orderMain.orderStatus] }}
              </text>
            </view>

            <view class="border-b border-gray-50 px-4 py-2">
              <view class="flex items-center gap-3">
                <text class="text-sm text-gray-600">🏪 {{ item.orderMain.storeName }}</text>
                <text v-if="item.orderMain.tableNo" class="text-sm text-gray-600">
                  📦 桌号：{{ item.orderMain.tableNo }}
                </text>
              </view>
            </view>
            ==================== 方案 B 注释备份 ====================
          -->
        </view>

        <!-- 加载更多提示 -->
        <view v-if="hasMore && !loading" class="py-4 text-center text-sm text-gray-400">
          加载更多...
        </view>
        <view v-if="!hasMore && orderList.length > 0" class="py-4 text-center text-sm text-gray-400">
          没有更多了
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else-if="!loading" class="py-25">
        <up-empty text="暂无订单" mode="order" />
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
// 使用 UnoCSS utility classes 为主，无需额外自定义样式
</style>
