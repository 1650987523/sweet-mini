<script lang="ts" setup>
import type { CartItem } from '@/store/cart'
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { createOrder } from '@/api/order'
import { useStoreStore } from '@/store/store'
import { useUserStore } from '@/store/user'
import { formatPrice } from '@/utils'

definePage({
  style: {
    navigationBarTitleText: '确认订单',
  },
})

const storeStore = useStoreStore()
const userStore = useUserStore()

const remark = ref('')
const payType = ref(1)
const couponId = ref('')
const discountAmount = ref(0)
const deliveryFee = ref(0)

// 选中的商品列表和总金额（从上一页传入）
const selectedItems = ref<CartItem[]>([])
const itemsTotalPrice = ref(0)

const currentStore = computed(() => storeStore.currentStore)
const userId = computed(() => userStore.userInfo!.userId)
const tableNo = computed(() => currentStore.value?.qrcodeNo || '')
const storeName = computed(() => currentStore.value?.name || '')
const finalPrice = computed(() => itemsTotalPrice.value + deliveryFee.value - discountAmount.value)

// 接收上一页传入的选中商品
onShow(() => {
  selectedItems.value = uni.getStorageSync('orderSelectedItems') || []
  itemsTotalPrice.value = uni.getStorageSync('orderTotalPrice') || 0
})

function buildOrderSkus() {
  return selectedItems.value.map(({ productId, skuId, skuInfo, count, productPrice }) => ({
    productId,
    skuId: skuId || skuInfo?.id || 0,
    count,
    price: skuInfo?.price ?? productPrice,
  }))
}

async function submitOrder() {
  if (!selectedItems.value.length)
    return void uni.showToast({ title: '请选择商品', icon: 'none' })

  if (!currentStore.value?.id)
    return void uni.showToast({ title: '请先选择门店', icon: 'none' })

  uni.showLoading({ title: '提交中...' })

  try {
    const { orderNo } = await createOrder({
      storeId: currentStore.value.id,
      userId: userId.value,
      tableNo: tableNo.value,
      payType: payType.value,
      couponId: couponId.value,
      discountAmount: discountAmount.value,
      remark: remark.value,
      skus: buildOrderSkus(),
    })

    uni.hideLoading()
    // 跳转到支付页面（不在这里清空购物车，等支付成功后再清空）
    uni.navigateTo({ url: `/pages/order/pay?orderNo=${orderNo}` })
  }
  catch {
    uni.hideLoading()
    uni.showToast({ title: '提交失败，请重试', icon: 'none' })
  }
}
</script>

<template>
  <view class="pb-safe">
    <!-- 1. 门店和桌号信息 -->
    <view class="store-section">
      <view class="store-info">
        <view class="store-title">
          <up-icon name="order" size="32" color="var(--theme-color)" />
          <text>{{ storeName }}</text>
        </view>
        <text class="table-no">桌号：{{ tableNo }}</text>
      </view>
    </view>

    <!-- 2. 商品列表信息 -->
    <up-card title="商品信息" margin="16rpx" :border="false">
      <template #body>
        <view v-if="!selectedItems.length" class="empty-tip">
          <text>购物车空空如也~</text>
        </view>
        <view
          v-for="(item, index) in selectedItems"
          :key="index"
          class="product-item"
        >
          <image class="product-image" :src="item.productImage" mode="aspectFill" />
          <view class="product-info">
            <text class="product-name">{{ item.productName }}</text>
            <text v-if="item.skuAttributeNames" class="product-spec">{{ item.skuAttributeNames }}</text>
            <view class="product-bottom">
              <text class="product-price">¥{{ formatPrice(item.skuInfo?.price ?? item.productPrice) }}</text>
              <text class="product-count">×{{ item.count }}</text>
            </view>
          </view>
        </view>
      </template>
    </up-card>

    <!-- 3. 备注信息 -->
    <up-card title="备注信息" margin="16rpx" :border="false">
      <template #body>
        <textarea
          v-model="remark"
          class="remark-input"
          placeholder="选填：对本订单的说明（如不要香菜、少糖等）"
          :maxlength="200"
          :cursor-spacing="100"
        />
      </template>
    </up-card>

    <!-- 4. 费用明细 -->
    <view class="fee-section">
      <view class="fee-row">
        <text class="fee-label">商品总额</text>
        <text class="fee-value">¥{{ formatPrice(itemsTotalPrice) }}</text>
      </view>
    </view>

    <!-- 底部支付操作栏 -->
    <view class="cart-bar-fixed">
      <view class="total-wrap">
        <text class="total-label">合计：</text>
        <text class="total-price">¥{{ formatPrice(finalPrice) }}</text>
      </view>
      <view class="btn-wrap">
        <up-button class="submit-btn" color="var(--theme-color)" @click="submitOrder">
          立即支付
        </up-button>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.pb-safe {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.store-section {
  background-color: #fff;
  margin: 16rpx;
  padding: 24rpx;
  border-radius: 16rpx;
}

.store-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.store-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 30rpx;
  font-weight: bold;
}

.table-no {
  font-size: 26rpx;
  color: #999;
}

.empty-tip {
  padding: 40rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

.product-item {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
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

.remark-input {
  width: 100%;
  height: 160rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
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
}

.fee-label {
  font-size: 28rpx;
  color: #666;
}

.fee-value {
  font-size: 28rpx;
  color: #333;
}

.cart-bar-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.1);
}

.total-wrap {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex: 1;
}

.total-label {
  font-size: 28rpx;
  color: #999;
  flex-shrink: 0;
}

.total-price {
  font-size: 40rpx;
  font-weight: bold;
  color: #ef4444;
  flex-shrink: 0;
}

.btn-wrap {
  width: 200rpx;
  flex-shrink: 0;
}

.submit-btn {
  width: 100%;
  height: 64rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
}
</style>
