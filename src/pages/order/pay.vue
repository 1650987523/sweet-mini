<script lang="ts" setup>
import type { OrderDetail } from '@/api/types'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { getOrderDetail } from '@/api/order'
import { getPayParams, mockWxPayCallback } from '@/api/pay'
import { useTokenStore } from '@/store/token'
import { formatPrice } from '@/utils'

definePage({
  style: {
    navigationBarTitleText: '支付',
  },
})

const tokenStore = useTokenStore()
const userId = computed(() => tokenStore.tokenInfo!.userId)

const orderNo = ref('')
const showMock = ref(false)
const payFailed = ref(false)
const order = ref<OrderDetail | null>(null)
const loading = ref(false)

async function handlePay() {
  if (loading.value)
    return

  if (!orderNo.value) {
    uni.showToast({ title: '订单号缺失', icon: 'none' })
    setTimeout(() => {
      showMock.value = true
    }, 1500)
    return
  }

  loading.value = true
  try {
    const payParams = await getPayParams(orderNo.value, userId.value)

    uni.requestPayment({
      provider: 'wxpay',
      ...payParams,
      orderInfo: payParams.package,
      success: () => {
        uni.showToast({ title: '支付成功', icon: 'success' })
        setTimeout(() => {
          uni.redirectTo({
            url: `/pages/order/pay-result?orderNo=${orderNo.value}&status=success`,
          })
        }, 1500)
      },
      fail: () => {
        payFailed.value = true
        showMock.value = true
      },
    })
  }
  catch (e) {
    console.error('支付接口调用失败', e)
    uni.showToast({ title: '获取支付参数失败', icon: 'none' })
    payFailed.value = true
    setTimeout(() => {
      showMock.value = true
    }, 1500)
  }
  finally {
    loading.value = false
  }
}

/**
 * Mock 支付 - 调用后端回调接口
 */
async function mockPay(success: boolean) {
  try {
    await mockWxPayCallback({
      outTradeNo: orderNo.value,
      transactionId: `mock_${Date.now()}`,
      tradeState: success ? 'SUCCESS' : 'FAILED',
      amount: order.value?.payAmount || 1,
    })
  }
  catch (e) {
    console.error('回调失败', e)
  }

  uni.redirectTo({
    url: `/pages/order/pay-result?orderNo=${orderNo.value}&status=${success ? 'success' : 'failed'}`,
  })
}

// 页面加载时获取参数并加载订单
onLoad(async (options: { orderNo?: string }) => {
  orderNo.value = options?.orderNo || ''

  // 先获取订单详情
  if (orderNo.value) {
    try {
      const res = await getOrderDetail(orderNo.value, userId.value)
      order.value = {
        ...res.orderMain,
        skus: res.orderDetails || [],
      }
    }
    catch (e) {
      console.error('获取订单详情失败', e)
    }
  }
})
</script>

<template>
  <view class="pay-container">
    <view class="pay-content">
      <!-- 订单信息 -->
      <view class="order-section">
        <text class="section-title">订单信息</text>
        <view class="order-info">
          <view class="info-row">
            <text class="info-label">订单编号</text>
            <text class="info-value">{{ order?.orderNo || '-' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">店铺名称</text>
            <text class="info-value">{{ order?.storeName || '-' }}</text>
          </view>
        </view>
      </view>

      <!-- 商品信息 -->
      <view class="goods-section">
        <text class="section-title">商品信息</text>
        <view v-for="item in order?.skus" :key="item.skuId" class="goods-item">
          <image
            v-if="item.skuImages?.[0]?.url"
            class="goods-image"
            :src="item.skuImages[0].url"
            mode="aspectFill"
          />
          <view class="goods-info">
            <text class="goods-name">{{ item.productName }}</text>
            <text class="goods-spec">{{ item.skuSpecs?.map(s => `${s.attrName}:${s.value}`).join(' ') || '规格商品' }}</text>
            <view class="goods-bottom">
              <text class="goods-price">¥{{ formatPrice(item.subtotal) }}</text>
              <text class="goods-count">×{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 费用明细 -->
      <view class="fee-section">
        <view class="fee-row">
          <text class="fee-label">商品总额</text>
          <text class="fee-value">¥{{ formatPrice(order?.totalAmount || 0) }}</text>
        </view>
        <view v-if="order?.discountAmount" class="fee-row">
          <text class="fee-label">优惠金额</text>
          <text class="fee-value text-green">-¥{{ formatPrice(order.discountAmount) }}</text>
        </view>
        <view class="fee-row total">
          <text class="fee-label">实付款</text>
          <text class="fee-value text-red">¥{{ formatPrice(order?.payAmount || 0) }}</text>
        </view>
      </view>

      <!-- 支付失败提示 -->
      <view v-if="payFailed" class="failed-tip">
        <up-icon name="close-circle" color="#ee0a24" size="32" />
        <text class="failed-tip-text">支付失败，请重新支付</text>
      </view>

      <!-- 操作按钮 -->
      <view class="actions">
        <up-button class="action-btn pay-btn" color="var(--theme-color)" @click="handlePay">
          立即支付
        </up-button>
      </view>

      <!-- Mock 支付弹窗 -->
      <view v-if="showMock" class="mock-dialog">
        <view class="mock-title">
          Mock 支付
        </view>
        <view class="mock-desc">
          后端支付接口未就绪，请选择：
        </view>
        <view class="mock-actions">
          <up-button type="primary" @click="mockPay(true)">
            支付成功
          </up-button>
          <up-button plain @click="mockPay(false)">
            支付失败
          </up-button>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.pay-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
}

.pay-content {
  padding: 32rpx;
}

.order-section,
.goods-section,
.fee-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 24rpx;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 28rpx;
  color: #999;
}

.info-value {
  font-size: 28rpx;
  color: #333;
}

.goods-item {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
  padding: 16rpx 0;

  &:not(:last-child) {
    border-bottom: 1rpx solid #f5f5f5;
  }
}

.goods-image {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  background-color: #f5f5f5;
  flex-shrink: 0;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.goods-name {
  font-size: 30rpx;
  font-weight: bold;
}

.goods-spec {
  font-size: 24rpx;
  color: #999;
}

.goods-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8rpx;
}

.goods-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #ef4444;
}

.goods-count {
  font-size: 26rpx;
  color: #999;
}

.fee-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
}

.fee-row.total {
  border-top: 1rpx solid #f5f5f5;
  margin-top: 12rpx;
  padding-top: 16rpx;
}

.fee-label {
  font-size: 28rpx;
  color: #666;
}

.fee-value {
  font-size: 28rpx;
  color: #333;
}

.text-green {
  color: #07c160;
}

.text-red {
  font-size: 32rpx;
  font-weight: bold;
  color: #ef4444;
}

.failed-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background-color: #fee;
  padding: 24rpx;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
}

.failed-tip-text {
  font-size: 28rpx;
  color: #ee0a24;
}

.actions {
  margin-top: 32rpx;
}

.action-btn {
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
}

.pay-btn {
  width: 100%;
}

.mock-dialog {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 48rpx 32rpx;
  border-radius: 24rpx 24rpx 0 0;
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.1);
}

.mock-title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
}

.mock-desc {
  font-size: 28rpx;
  color: #999;
  text-align: center;
  margin-top: 16rpx;
}

.mock-actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 24rpx;
}
</style>
