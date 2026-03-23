<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useCartStore } from '@/store/cart'

const { navigateTo, redirectTo } = uni

definePage({
  style: {
    navigationBarTitleText: '支付结果',
  },
  onLoad: (options: { orderNo: string, status: 'success' | 'failed' }) => {
    orderNo.value = options.orderNo
    status.value = options.status
    // 支付成功时清空购物车
    if (options.status === 'success') {
      cartStore.clearCart()
    }
  },
})

const orderNo = ref('')
const status = ref<'success' | 'failed'>('success')
const cartStore = useCartStore()
const countdown = ref(3)

const isSuccess = computed(() => status.value === 'success')

// 倒计时结束后自动跳转到订单列表
onMounted(() => {
  if (!isSuccess.value)
    return

  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value === 0) {
      clearInterval(timer)
      backToOrderList()
    }
  }, 1000)
})

// 查看订单详情
function viewOrderDetail() {
  // 先回到订单列表，让用户手动点击查看详情
  // 因为 switchTab 后不能立即 navigateTo
  backToOrderList()
}

// 返回订单列表
function backToOrderList() {
  // 订单列表是 tabBar 页面，使用 switchTab
  uni.switchTab({ url: '/pages/order/index' })
}
</script>

<template>
  <view class="result-container">
    <view class="result-card">
      <up-icon
        :name="isSuccess ? 'checkmark-circle' : 'close-circle'"
        :color="isSuccess ? '#07c160' : '#ee0a24'"
        size="120"
      />
      <text class="result-title">{{ isSuccess ? '支付成功' : '支付失败' }}</text>
      <text v-if="isSuccess" class="countdown"> {{ countdown }}秒后自动返回订单列表</text>
      <text v-else class="result-desc">请稍后重试或联系商家</text>
      <view class="result-actions">
        <up-button
          v-if="!isSuccess"
          class="action-btn retry-btn"
          color="var(--theme-color)"
          @click="redirectTo({ url: `/pages/order/pay?orderNo=${orderNo}` })"
        >
          重新支付
        </up-button>
        <template v-else>
          <up-button
            class="action-btn"
            color="var(--theme-color)"
            @click="viewOrderDetail"
          >
            查看订单
          </up-button>
          <up-button
            class="action-btn"
            plain
            color="#999"
            @click="backToOrderList"
          >
            返回订单列表
          </up-button>
        </template>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.result-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 32rpx;
}

.result-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
  background-color: #fff;
  padding: 64rpx 48rpx;
  border-radius: 24rpx;
  width: 100%;
}

.result-title {
  font-size: 40rpx;
  font-weight: bold;
}

.countdown {
  font-size: 26rpx;
  color: #999;
  margin-top: 8rpx;
}

.result-desc {
  font-size: 28rpx;
  color: #999;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  width: 100%;
  margin-top: 16rpx;
}

.action-btn {
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
}

.retry-btn {
  width: 100%;
}
</style>
