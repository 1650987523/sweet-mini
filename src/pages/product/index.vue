<script lang="ts" setup>
import type { ProductCategoryVO } from '@/api/types'
import type { ProductInfoVO, SkuInfo } from '@/api/types/product'
import { computed, nextTick, ref, watch } from 'vue'
import { getProductWithCategories } from '@/api/product'
import CartBar from '@/components/CartBar/index.vue'
import CartPopup from '@/components/CartPopup/index.vue'
import ProductSkuPop from '@/components/ProductSkuPop/index.vue'
import { useCartStore } from '@/store/cart'
import { useStoreStore } from '@/store/store'
import { formatPrice, scanCode } from '@/utils'

definePage({
  style: {
    navigationBarTitleText: '点单',
  },
})

const storeStore = useStoreStore()
const currentStore = storeStore.currentStore
const cartStore = useCartStore()

const rawCategories = ref<ProductCategoryVO[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const currentCategoryIndex = ref(0)
const scrollToViewId = ref('')
const categoryOffsets = ref<number[]>([])

// 选规格弹出层相关
const isShowSkuPopup = ref(false)
const currentProductId = ref<number | null>(null)

// 购物车弹出层相关
const isShowCartPopup = ref(false)

/**
 * 打开选规格弹出层
 */
function openSkuPopup(product: ProductInfoVO) {
  currentProductId.value = product.id
  isShowSkuPopup.value = true
}

/**
 * 关闭选规格弹出层
 */
function closeSkuPopup() {
  isShowSkuPopup.value = false
  currentProductId.value = null
}

/**
 * 打开购物车弹出层
 */
function openCartPopup() {
  isShowCartPopup.value = true
}

/**
 * 关闭购物车弹出层
 */
function closeCartPopup() {
  isShowCartPopup.value = false
}

/**
 * 确认选规格，添加到购物车
 */
function handleSkuConfirm(data: {
  productId: number
  productName: string
  productImage: string
  productPrice: number
  sku: { attributeId: number, attributeValueId: number }[]
  count: number
  skuInfo?: SkuInfo
  skuAttributeNames?: string
}) {
  cartStore.addToCart({
    productId: data.productId,
    productName: data.productName,
    productImage: data.productImage,
    productPrice: data.productPrice,
    sku: data.sku,
    skuInfo: data.skuInfo,
    count: data.count,
    skuAttributeNames: data.skuAttributeNames,
  })

  uni.showToast({
    title: '已添加到购物车',
    icon: 'success',
  })
}

/**
 * 跳转到确认订单页面
 */
function goToCheckout() {
  const selectedItems = cartStore.getSelectedItems()
  if (!selectedItems.length) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }
  const totalPrice = selectedItems.reduce((sum, item) => {
    const price = item.skuInfo?.price ?? item.productPrice
    return sum + price * item.count
  }, 0)
  // 临时存储选中商品数据
  uni.setStorageSync('orderSelectedItems', selectedItems)
  uni.setStorageSync('orderTotalPrice', totalPrice)
  uni.navigateTo({ url: '/pages/order/confirm' })
}

/**
 * 滚动到指定分类
 */
function scrollToCategory(index: number) {
  currentCategoryIndex.value = index
  scrollToViewId.value = `category-${index}`
}

/**
 * 右侧滚动事件监听 - 联动左侧分类高亮
 */
function onRightScroll(e: any) {
  const scrollTop = e.detail.scrollTop

  // 从后往前找，找到最后一个偏移量小于等于 scrollTop 的分类
  // 这样当滚动超过某个分类的起始位置时，该分类会成为当前高亮
  for (let i = categoryOffsets.value.length - 1; i >= 0; i--) {
    if (scrollTop >= categoryOffsets.value[i]) {
      if (currentCategoryIndex.value !== i) {
        currentCategoryIndex.value = i
      }
      break
    }
  }
}

const filteredCategories = computed((): ProductCategoryVO[] => {
  if (!searchKeyword.value.trim()) {
    return rawCategories.value || []
  }

  const keyword = searchKeyword.value.toLowerCase()
  return rawCategories.value
    .map(category => ({
      ...category,
      products: (category.products || []).filter(product =>
        product.productName?.toLowerCase().includes(keyword),
      ),
    }))
    .filter(category => category.products.length > 0)
})

/**
 * 加载分类偏移量
 */
async function loadCategoryOffsets() {
  await nextTick()

  const offsets: number[] = []

  // 获取所有分类的 boundingClientRect
  const query = uni.createSelectorQuery()
  const count = filteredCategories.value?.length ?? 0
  for (let i = 0; i < count; i++) {
    query.select(`#category-${i}`).boundingClientRect()
  }

  query.exec((res: any[]) => {
    if (!res || res.length === 0)
      return

    // 以第一个分类的位置为基准，计算相对偏移量
    const firstTop = res[0]?.top || 0
    res.forEach((rect) => {
      if (rect) {
        // 相对偏移量 = 当前分类的 top - 第一个分类的 top
        offsets.push(rect.top - firstTop)
      }
    })
    categoryOffsets.value = offsets
  })
}

/**
 * 监听分类数据变化，重新计算偏移量
 */
watch(
  () => rawCategories.value.length,
  async () => {
    if (rawCategories.value.length > 0) {
      await nextTick()
      loadCategoryOffsets()
    }
  },
)

/**
 * 分类图标映射（根据分类名匹配 emoji）
 */
const categoryIconMap: Record<string, string> = {
  时令: '🍊',
  人气: '🔥',
  热饮: '☕',
  咖啡: '☕',
  植物茶: '🌿',
  鲜果茶: '🍹',
  小食: '🍪',
  奶茶: '🧋',
  果茶: '🍵',
  冰沙: '🍧',
}

/**
 * 页面显示加载数据
 */
onShow(() => {
  loadCategories()
})

/**
 * 进入扫码
 */
async function enterScanCode() {
  await scanCode({
    onSuccess: () => {
      uni.showToast({
        title: '扫码成功，正在加载数据...',
        icon: 'loading',
      })
    },
  })
}

/**
 * 加载分类数据
 */
async function loadCategories() {
  // 如果没有门店ID或桌码，进入扫码
  if (!currentStore?.id || !currentStore?.qrcodeNo) {
    enterScanCode()
    return
  }

  loading.value = true
  const data = await getProductWithCategories({ storeId: currentStore.id, productName: '' })

  // 映射后端数据到前端展示 VO
  rawCategories.value = data.map(category => ({
    categoryId: category.categoryId,
    categoryName: category.categoryName || '',
    categoryIcon: getCategoryIcon(category.categoryName),
    products: (category.products || []).map(product => ({
      id: product.id,
      productName: product.productName || '',
      productDescription: product.productDescription || '',
      productPrice: product.productPrice,
      productImage: product.images?.[0]?.url || '',
    })),
  }))

  loading.value = false

  // 数据加载完成后，计算分类偏移量
  nextTick(() => {
    loadCategoryOffsets()
  })
}

/**
 * 获取分类图标
 */
function getCategoryIcon(categoryName: string): string {
  if (!categoryName) {
    return '📋' // 默认图标
  }
  for (const [key, icon] of Object.entries(categoryIconMap)) {
    if (categoryName.includes(key)) {
      return icon
    }
  }
  return '📋' // 默认图标
}
</script>

<template>
  <!-- 容器：全屏 flex 列布局 -->
  <view class="h-screen flex flex-col overflow-hidden" style="height: calc(100vh - var(--window-top));">
    <!-- 顶部门店信息 -->
    <view v-if="currentStore" class="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
      <text class="text-base text-gray-900 font-bold">{{ currentStore.name }}</text>
      <view class="flex flex-col items-center" @click="enterScanCode">
        <up-icon name="scan" color="var(--theme-color)" size="40" />
        <text class="mt-1 text-xs text-blue-500">扫码</text>
      </view>
    </view>

    <!-- 搜索框 -->
    <view class="bg-white px-6 py-5">
      <up-search
        v-model="searchKeyword"
        placeholder="搜索商品"
        shape="round"
        bg-color="#f5f5f5"
        :show-action="false"
      />
    </view>

    <!-- 主体内容：左右布局 -->
    <view class="flex flex-1 overflow-hidden">
      <!-- 左边分类菜单 -->
      <scroll-view
        class="h-full w-20 bg-white"
        scroll-y
        :scroll-into-view="`menu-${currentCategoryIndex}`"
        scroll-with-animation
      >
        <view
          v-for="(category, index) in filteredCategories"
          :id="`menu-${index}`"
          :key="category.categoryId"
          class="relative h-20 flex flex-col items-center justify-center bg-white transition-all duration-300" :class="[
            currentCategoryIndex === index ? 'bg-gray-50 font-bold' : '',
          ]"
          @click="scrollToCategory(index)"
        >
          <!-- 选中时的左侧条,使用主题色 -->
          <view
            v-if="currentCategoryIndex === index"
            :style="{ backgroundColor: 'var(--theme-color)' }"
            class="absolute left-0 top-0 h-full w-1"
          />
          <text class="mb-1 text-lg">{{ category.categoryIcon }}</text>
          <text class="text-xs text-gray-600">{{ category.categoryName }}</text>
        </view>
      </scroll-view>

      <!-- 右边商品列表 -->
      <scroll-view
        class="product-scroll-view h-full flex-1 bg-white"
        scroll-y
        scroll-with-animation
        :scroll-into-view="scrollToViewId"
        @scroll="onRightScroll"
      >
        <view
          v-for="(category, index) in filteredCategories"
          :id="`category-${index}`"
          :key="category.categoryId"
          class="category-section mb-4"
        >
          <!-- 分类标题 -->
          <view class="flex items-center border-b border-gray-100 bg-white px-4 py-3">
            <text class="mr-2 text-base">{{ category.categoryIcon }}</text>
            <text class="text-sm text-gray-900 font-bold">{{ category.categoryName }}</text>
          </view>

          <!-- 商品列表 -->
          <view class="p-3">
            <view
              v-for="(product, productIndex) in category.products"
              :key="productIndex"
              class="mb-3 rounded-2xl bg-white p-3"
            >
              <!-- 商品信息 -->
              <view class="flex gap-3">
                <!-- 商品图片 -->
                <image
                  class="h-20 w-20 flex-shrink-0 rounded-2xl bg-gray-100"
                  :src="product.productImage"
                  mode="aspectFill"
                />

                <!-- 商品信息 -->
                <view class="flex flex-1 flex-col justify-between">
                  <view>
                    <text class="text-sm text-gray-900 font-bold">{{ product.productName }}</text>
                    <text class="mt-1 block text-xs text-gray-400">{{ product.productDescription }}</text>
                  </view>
                  <view class="flex items-center justify-between">
                    <text class="text-base text-red-500 font-bold">¥{{ formatPrice(product.productPrice) }}</text>
                    <button class="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-500" @click="openSkuPopup(product)">
                      选规格
                    </button>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>

  <!-- 选规格弹出层 -->
  <ProductSkuPop
    v-model:show="isShowSkuPopup"
    :product-id="currentProductId"
    @close="closeSkuPopup"
    @confirm="handleSkuConfirm"
  />

  <!-- 购物车弹出层 -->
  <CartPopup
    v-model:show="isShowCartPopup"
    @close="closeCartPopup"
    @checkout="goToCheckout"
  />

  <!-- 底部悬浮操作栏 -->
  <CartBar
    @click-cart="openCartPopup"
    @click-checkout="goToCheckout"
  />
</template>

<style lang="scss" scoped>
// 底部悬浮操作栏样式
.pb-safe {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
