import type { SkuInfo } from '@/api/types/product'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface CartItem {
  productId: number
  productName: string
  productImage: string
  productPrice: number
  sku: Array<{
    attributeId: number
    attributeValueId: number
  }>
  skuId?: number // SKU ID
  skuInfo?: SkuInfo
  skuAttributeNames?: string // 规格属性名称，如 "小杯，常温，七分糖"
  count: number
  selected?: boolean // 是否选中
}

/**
 * 生成购物车商品的唯一标识
 */
function getCartItemKey(productId: number, sku?: CartItem['sku']) {
  return `${productId}-${sku ? JSON.stringify(sku) : ''}`
}

/**
 * 查找购物车商品索引
 */
function findCartItemIndex(items: CartItem[], productId: number, sku?: CartItem['sku']) {
  const key = getCartItemKey(productId, sku)
  return items.findIndex(item => getCartItemKey(item.productId, item.sku) === key)
}

/**
 * 购物车 Store
 */
export const useCartStore = defineStore(
  'cart',
  () => {
    const cartItems = ref<CartItem[]>([])

    // 确保 cartItems 是数组（处理缓存数据异常的情况）
    if (!Array.isArray(cartItems.value)) {
      cartItems.value = []
    }

    const totalCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.count, 0))

    const totalPrice = computed(() => {
      return cartItems.value
        .filter(item => item.selected !== false)
        .reduce((sum, item) => sum + (item.skuInfo?.price ?? item.productPrice) * item.count, 0)
    })

    const selectedCount = computed(() => {
      return cartItems.value
        .filter(item => item.selected !== false)
        .reduce((sum, item) => sum + item.count, 0)
    })

    const isAllSelected = computed(() => {
      return cartItems.value.length > 0 && cartItems.value.every(item => item.selected !== false)
    })

    const getItemCount = (productId: number, sku?: CartItem['sku']) => {
      const index = findCartItemIndex(cartItems.value, productId, sku)
      return index > -1 ? cartItems.value[index].count : 0
    }

    const removeFromCart = (productId: number, sku?: CartItem['sku']) => {
      const index = findCartItemIndex(cartItems.value, productId, sku)
      if (index > -1)
        cartItems.value.splice(index, 1)
    }

    const addToCart = (item: CartItem) => {
      const index = findCartItemIndex(cartItems.value, item.productId, item.sku)
      if (index > -1) {
        cartItems.value[index].count += item.count
      }
      else {
        cartItems.value.push({ ...item, selected: true })
      }
    }

    const updateCount = (productId: number, sku: CartItem['sku'] | undefined, count: number) => {
      const index = findCartItemIndex(cartItems.value, productId, sku)
      if (index > -1) {
        cartItems.value[index].count = count
        if (count <= 0)
          removeFromCart(productId, sku)
      }
    }

    const toggleSelect = (productId: number, sku: CartItem['sku'] | undefined, selected: boolean) => {
      const index = findCartItemIndex(cartItems.value, productId, sku)
      if (index > -1) {
        cartItems.value = cartItems.value.map((item, i) =>
          i === index ? { ...item, selected } : item,
        )
      }
    }

    const toggleSelectAll = (selected: boolean) => {
      cartItems.value = cartItems.value.map(item => ({ ...item, selected }))
    }

    const getSelectedItems = () => cartItems.value.filter(item => item.selected !== false)

    const clearCart = () => {
      cartItems.value = []
    }

    const getProductTotalCount = (productId: number): number => {
      return cartItems.value
        .filter(item => item.productId === productId)
        .reduce((sum, item) => sum + item.count, 0)
    }

    return {
      cartItems,
      totalCount,
      totalPrice,
      selectedCount,
      isAllSelected,
      getItemCount,
      addToCart,
      updateCount,
      removeFromCart,
      toggleSelect,
      toggleSelectAll,
      clearCart,
      getProductTotalCount,
      getSelectedItems,
    }
  },
  {
    persist: true,
  },
)
