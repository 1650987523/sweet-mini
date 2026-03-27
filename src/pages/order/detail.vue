<script lang="ts" setup>
import type { ApplyRefundRequest, OrderDetail } from '@/api/types'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { applyRefund, cancelOrder, getOrderDetail } from '@/api/order'
import { getPayParams } from '@/api/pay'
import { OrderStatusColorMap, OrderStatusEnum, OrderStatusIconMap, OrderStatusTextMap } from '@/http/tools/enum'
import { useUserStore } from '@/store/user'
import { formatPrice } from '@/utils'

definePage({
  style: {
    navigationBarTitleText: '订单详情',
  },
})

const userStore = useUserStore()
const userId = computed(() => userStore.userInfo.userId)

const orderNo = ref('')
const order = ref<OrderDetail | null>(null)
const loading = ref(false)

/**
 * 格式化商品规格
 */
function formatSkuSpecs(specs?: Array<{ attrName?: string, value?: string }>): string {
  if (!specs || specs.length === 0) {
    return '规格商品'
  }
  return specs.map(s => `${s.attrName}:${s.value}`).join(' ')
}

/**
 * 加载订单详情
 */
async function loadOrderDetail() {
  if (!orderNo.value || loading.value)
    return

  loading.value = true
  try {
    const res = await getOrderDetail(orderNo.value, userId.value)
    console.log('订单详情原始数据:', res.orderMain)
    order.value = {
      ...res.orderMain,
      skus: res.orderDetails || [],
    }
  }
  catch (err) {
    console.error('Failed to load order detail:', err)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
  finally {
    loading.value = false
  }
}

// 页面加载时加载数据
onLoad((options: { orderNo?: string }) => {
  orderNo.value = options.orderNo || ''
  loadOrderDetail()
})

/**
 * 支付
 */
async function handlePay() {
  if (loading.value || !order.value)
    return

  loading.value = true
  try {
    const payParams = await getPayParams(order.value.orderNo, order.value.userId)
    uni.requestPayment({
      provider: 'wxpay',
      ...payParams,
      orderInfo: payParams.package,
      success: () => {
        uni.showToast({ title: '支付成功', icon: 'success' })
        setTimeout(() => loadOrderDetail(), 1500)
      },
      fail: () => {
        uni.showToast({ title: '已取消支付', icon: 'none' })
      },
    })
  }
  catch {
    uni.showToast({ title: '支付失败', icon: 'none' })
  }
  finally {
    loading.value = false
  }
}

/**
 * 取消订单
 */
async function handleCancel() {
  if (!order.value)
    return

  const res = await uni.showModal({ title: '提示', content: '确定要取消订单吗？' })
  if (!res.confirm)
    return

  try {
    await cancelOrder(order.value.orderNo, order.value.userId)
    uni.showToast({ title: '订单已取消', icon: 'success' })
    loadOrderDetail()
  }
  catch {
    uni.showToast({ title: '取消失败', icon: 'none' })
  }
}

// 订单状态
const status = computed(() => {
  if (!order.value)
    return null
  console.log('订单状态值:', order.value.orderStatus)
  console.log('状态文本:', OrderStatusTextMap[order.value.orderStatus])
  console.log('OrderStatusTextMap:', OrderStatusTextMap)
  return {
    text: OrderStatusTextMap[order.value.orderStatus],
    color: OrderStatusColorMap[order.value.orderStatus],
    icon: OrderStatusIconMap[order.value.orderStatus],
  }
})

// 是否显示操作按钮（待支付状态）
const isUnpaid = computed(() => order.value?.orderStatus === OrderStatusEnum.UNPAID)

// 是否显示退款按钮（制作中、已完成状态可以退款）
const canRefund = computed(() => {
  const refundableStatuses = [
    OrderStatusEnum.MAKING, // 制作中
    OrderStatusEnum.COMPLETED, // 已完成
  ]
  return refundableStatuses.includes(order.value?.orderStatus)
})

// 退款弹窗相关
const showRefundDialog = ref(false)
const refundForm = ref<Partial<ApplyRefundRequest>>({
  refundReason: '',
})

/**
 * 打开退款申请弹窗
 */
function openRefundDialog() {
  if (!order.value)
    return

  refundForm.value = {
    orderNo: order.value.orderNo,
    userId: userId.value,
    storeId: order.value.storeId,
    orderAmount: order.value.totalAmount,
    refundAmount: order.value.payAmount,
    refundType: 2,
    refundReason: '',
  }
  showRefundDialog.value = true
}

/**
 * 提交退款申请
 */
async function submitRefund() {
  if (!refundForm.value.refundReason) {
    uni.showToast({ title: '请选择或填写退款原因', icon: 'none' })
    return
  }

  try {
    await applyRefund(refundForm.value as ApplyRefundRequest)
    uni.showToast({ title: '退款申请已提交', icon: 'success' })
    showRefundDialog.value = false
    loadOrderDetail() // 刷新订单状态
  }
  catch (e) {
    console.error('提交退款申请失败', e)
  }
}
</script>

<template>
  <view class="pb-safe">
    <!-- 订单状态 -->
    <view v-if="status" class="status-section">
      <up-icon :color="status.color" size="80" :name="status.icon" />
      <text class="status-text" :style="{ color: status.color }">{{ status.text }}</text>
    </view>

    <!-- 商品信息 -->
    <up-card title="商品信息" margin="16rpx" :border="false">
      <template #body>
        <view v-for="item in order?.skus" :key="item.skuId" class="product-item">
          <image
            v-if="item.skuImages?.[0]?.url"
            class="product-image"
            :src="item.skuImages[0].url"
            mode="aspectFill"
          />
          <view class="product-info">
            <text class="product-name">{{ item.productName }}</text>
            <text class="product-spec">{{ formatSkuSpecs(item.skuSpecs) }}</text>
            <view class="product-bottom">
              <text class="product-price">¥{{ formatPrice(item.subtotal) }}</text>
              <text class="product-count">×{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </template>
    </up-card>

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

    <!-- 订单信息 -->
    <up-card title="订单信息" margin="16rpx" :border="false">
      <template #body>
        <view class="order-info">
          <view class="info-row">
            <text class="info-label">订单编号</text>
            <text class="info-value">{{ order?.orderNo || '-' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">下单时间</text>
            <text class="info-value">{{ order?.createTime || '-' }}</text>
          </view>
          <view v-if="order?.tableNo" class="info-row">
            <text class="info-label">桌号</text>
            <text class="info-value">{{ order.tableNo }}</text>
          </view>
          <view v-if="order?.remark" class="info-row">
            <text class="info-label">备注</text>
            <text class="info-value">{{ order.remark }}</text>
          </view>
        </view>
      </template>
    </up-card>

    <!-- 底部操作栏 -->
    <view v-if="isUnpaid" class="action-bar">
      <up-button class="action-btn cancel-btn" plain @click="handleCancel">
        取消订单
      </up-button>
      <up-button class="action-btn pay-btn" color="var(--theme-color)" @click="handlePay">
        立即支付
      </up-button>
    </view>

    <!-- 退款按钮（已完成订单） -->
    <view v-if="canRefund" class="action-bar">
      <up-button class="action-btn refund-btn" plain color="#ff9900" @click="openRefundDialog">
        申请退款
      </up-button>
    </view>

    <!-- 退款申请弹窗 -->
    <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
    <!-- @ts-ignore -->
    <up-popup v-model:show="showRefundDialog" round>
      <view class="refund-dialog">
        <view class="dialog-title">
          申请退款
        </view>
        <view class="dialog-content">
          <view class="form-item">
            <text class="form-label">退款金额</text>
            <text class="form-value">¥{{ formatPrice(refundForm.refundAmount || 0) }}</text>
          </view>
          <view class="form-item">
            <text class="form-label">订单金额</text>
            <text class="form-value">¥{{ formatPrice(refundForm.orderAmount || 0) }}</text>
          </view>
          <view class="form-item">
            <text class="form-label required">退款原因</text>
            <textarea
              v-model="refundForm.refundReason"
              class="form-textarea"
              placeholder="请输入退款原因"
              :maxlength="200"
              :auto-height="true"
            />
          </view>
        </view>
        <view class="dialog-actions">
          <up-button class="dialog-btn" plain @click="showRefundDialog = false">
            取消
          </up-button>
          <up-button class="dialog-btn" color="#ff9900" @click="submitRefund">
            提交申请
          </up-button>
        </view>
      </view>
    </up-popup>
  </view>
</template>

<style lang="scss" scoped>
.pb-safe {
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
}

.status-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0;
  background-color: #fff;
  gap: 16rpx;
}

.status-text {
  font-size: 36rpx;
  font-weight: bold;
}

.product-item {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
  padding: 24rpx 32rpx;

  &:not(:last-child) {
    border-bottom: 1rpx solid #f5f5f5;
  }
}

.product-image {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  background-color: #f5f5f5;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.product-name {
  font-size: 30rpx;
  font-weight: bold;
}

.product-spec {
  font-size: 24rpx;
  color: #999;
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8rpx;
}

.product-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #ef4444;
}

.product-count {
  font-size: 26rpx;
  color: #999;
}

.fee-section {
  background-color: #fff;
  margin: 16rpx;
  padding: 24rpx;
  border-radius: 16rpx;
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

.order-info {
  padding: 0 32rpx 16rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
}

.info-label {
  font-size: 28rpx;
  color: #999;
}

.info-value {
  font-size: 28rpx;
  color: #333;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16rpx;
  background-color: #fff;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.1);
}

.action-btn {
  height: 64rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
}

.cancel-btn {
  width: 180rpx;
}

.pay-btn {
  width: 200rpx;
}

.refund-btn {
  width: 200rpx;
}

.refund-dialog {
  padding: 32rpx;
  background-color: #fff;
  min-height: 600rpx;
  border-radius: 24rpx 24rpx 0 0;
}

.dialog-title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 32rpx;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.form-label {
  font-size: 28rpx;
  color: #666;
}

.form-label.required::before {
  content: '*';
  color: #ff4444;
  margin-right: 4rpx;
}

.form-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.reason-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.reason-option {
  padding: 12rpx 24rpx;
  background-color: #f5f5f5;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #666;
  transition: all 0.2s;
}

.reason-option.selected {
  background-color: #ff9900;
  color: #fff;
}

.form-textarea {
  width: 100%;
  min-height: 200rpx;
  padding: 16rpx;
  border: 2rpx solid #f0f0f0;
  border-radius: 12rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
  margin-top: 12rpx;
}

.dialog-actions {
  display: flex;
  gap: 16rpx;
  justify-content: space-between;
}

.dialog-btn {
  flex: 1;
  height: 72rpx;
  border-radius: 36rpx;
  font-size: 30rpx;
}
</style>
