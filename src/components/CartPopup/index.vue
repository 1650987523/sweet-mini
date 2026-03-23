<script lang="ts" setup>
import type { CartItem } from '@/store/cart'
import { computed } from 'vue'
import NumberBox from '@/components/NumberBox/index.vue'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/utils'

interface Props {
  show?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  'close': []
  'checkout': []
}>()

const cartStore = useCartStore()

const showPopup = computed({
  get: () => props.show,
  set: val => emit('update:show', val),
})

function getItemTotalPrice(item: CartItem) {
  const price = item.skuInfo?.price ?? item.productPrice
  return price * item.count
}

function handleClearCart() {
  uni.showModal({
    title: '提示',
    content: '确定要清空购物车吗？',
    success: (res) => {
      if (res.confirm) {
        cartStore.clearCart()
        showPopup.value = false
        uni.showToast({ title: '已清空', icon: 'success' })
      }
    },
  })
}

function updateCartCount(item: CartItem, count: number) {
  if (count <= 0) {
    cartStore.removeFromCart(item.productId, item.sku)
  }
  else {
    cartStore.updateCount(item.productId, item.sku, count)
  }
}

function handleSwipeDel(item: CartItem) {
  uni.showModal({
    title: '提示',
    content: '确定要删除这个商品吗？',
    success: (res) => {
      if (res.confirm) {
        cartStore.removeFromCart(item.productId, item.sku)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    },
  })
}

function handleCheckout() {
  if (!cartStore.selectedCount) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }
  emit('checkout')
  emit('update:show', false)
}

function handleClose() {
  emit('close')
}

const swipeOptions = [{ text: '删除', style: { backgroundColor: '#ef4444' } }]
</script>

<template>
  <up-popup v-model:show="showPopup" mode="bottom" :close-on-click-overlay="true" :round="12" @close="handleClose">
    <view class="h-[85vh] flex flex-col">
      <!-- 购物车和清空行 -->
      <view class="flex items-center justify-between p-4">
        <text class="text-lg font-bold">购物车</text>
        <text v-if="cartStore.totalCount > 0" class="text-sm text-red-500" @click="handleClearCart">
          清空
        </text>
      </view>

      <!-- 滚动列表组件 -->
      <scroll-view v-if="cartStore.totalCount > 0" scroll-y class="w-full" style="height: calc(100% - 120px);">
        <view class="p-4">
          <!-- 全选 -->
          <view class="mb-2 flex items-center">
            <up-checkbox
              used-alone :checked="cartStore.isAllSelected"
              @change="(val: boolean) => cartStore.toggleSelectAll(val)"
            />
            <text class="text-sm text-gray-600">全选</text>
          </view>

          <!-- 购物车商品列表 -->
          <up-swipe-action>
            <up-swipe-action-item
              v-for="(item, index) in cartStore.cartItems"
              :key="index"
              :index="index"
              :show="false"
              :options="swipeOptions"
              @click="() => handleSwipeDel(item)"
            >
              <view class="h-20 w-full flex items-center gap-3">
                <up-checkbox
                  used-alone
                  :checked="item.selected !== false"
                  @click.stop
                  @change="(val: boolean) => cartStore.toggleSelect(item.productId, item.sku, val)"
                />
                <image
                  class="h-16 w-16 rounded-lg bg-gray-100"
                  :src="item.productImage"
                  mode="aspectFill"
                />
                <view class="flex flex-1 flex-col justify-between">
                  <text class="text-sm font-bold">{{ item.productName }}</text>
                  <text class="text-xs text-gray-400">
                    {{ item.skuAttributeNames || item.skuInfo?.skuCode || '规格商品' }}
                  </text>
                  <text class="text-base text-red-500 font-bold">
                    ¥{{ formatPrice(getItemTotalPrice(item)) }}
                  </text>
                </view>
                <view class="mr-8">
                  <NumberBox
                    :model-value="item.count"
                    :min="1"
                    :max="99"
                    @update:model-value="(val) => updateCartCount(item, val)"
                    @click.stop
                  />
                </view>
              </view>
            </up-swipe-action-item>
          </up-swipe-action>
        </view>
      </scroll-view>

      <view v-else class="py-12 text-center text-gray-400">
        <view class="mb-4 text-6xl">
          🛒
        </view>
        <text class="text-sm">购物车空空如也~</text>
      </view>

      <view v-if="cartStore.totalCount > 0" class="cart-action-bar mt-auto">
        <view class="cart-bar-main" @click="handleClose">
          <view class="cart-icon-wrap">
            <up-icon name="shopping-cart-fill" size="24" color="#fff" />
            <view class="cart-badge">
              <text class="badge-text">{{ cartStore.selectedCount }}</text>
            </view>
          </view>
          <text class="cart-price">¥{{ formatPrice(cartStore.totalPrice) }}</text>
        </view>
        <view class="cart-bar-checkout" @click="handleCheckout">
          <text class="checkout-text">去结算</text>
        </view>
      </view>
    </view>
  </up-popup>
</template>

<style lang="scss" scoped>
.cart-action-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  margin: 16px -16px -16px;
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
