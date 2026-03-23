<script lang="ts" setup>
import { computed } from 'vue'
import { ZIndex } from '@/config/z-index'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/utils'

const emit = defineEmits<{
  'click-cart': []
  'click-checkout': []
}>()

const cartStore = useCartStore()

// 计算是否有购物车数据
const hasCart = computed(() => cartStore.totalCount > 0)
</script>

<template>
  <view
    v-if="hasCart"
    class="cart-bar-fixed pb-safe"
    :style="{ zIndex: ZIndex.floating }"
  >
    <view class="cart-bar-container">
      <!-- 左侧：购物袋图标 + 金额 -->
      <view class="cart-bar-main" @click="emit('click-cart')">
        <view class="cart-icon-wrap">
          <up-icon name="shopping-cart-fill" size="24" color="#fff" />
          <view
            v-if="cartStore.totalCount > 0"
            class="cart-badge"
          >
            <text class="badge-text">{{ cartStore.totalCount }}</text>
          </view>
        </view>
        <text class="cart-price">¥{{ formatPrice(cartStore.totalPrice) }}</text>
      </view>

      <!-- 右侧：去结算按钮 -->
      <view class="cart-bar-checkout" @click="emit('click-checkout')">
        <text class="checkout-text">去结算</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.cart-bar-fixed {
  position: fixed;
  bottom: 60px;
  left: 0;
  right: 0;
}

.pb-safe {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.cart-bar-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-radius: 12px;
  overflow: hidden;
}

.cart-bar-main {
  background-color: #1a1a1a;
  padding: 12px 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  box-sizing: border-box;
  border-radius: 12px 0 0 12px;
}

.cart-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #ef4444;
  border-radius: 10px;
  padding: 2px 6px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-text {
  font-size: 10px;
  font-weight: bold;
  color: #fff;
}

.cart-price {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.cart-bar-checkout {
  background-color: $uni-color-primary;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  box-sizing: border-box;
  border-radius: 0 12px 12px 0;
}

.checkout-text {
  font-size: 15px;
  font-weight: 500;
  color: #fff;
}
</style>
