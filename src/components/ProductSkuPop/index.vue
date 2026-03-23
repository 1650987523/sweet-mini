<script lang="ts" setup>
import type { ProductSkuDetail, SkuInfo } from '@/api/types/product'
import { computed, nextTick, ref, watch } from 'vue'
import { getProductSkuDetail, getSkuBySpecs } from '@/api/product'
import { ZIndex } from '@/config/z-index'
import { formatPrice } from '@/utils'

interface Props {
  show?: boolean
  productId?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  productId: null,
})

const emit = defineEmits<{
  'close': []
  'update:show': [value: boolean]
  'confirm': [data: {
    productId: number
    productName: string
    productImage: string
    productPrice: number
    sku: Array<{
      attributeId: number
      attributeValueId: number
    }>
    count: number
    skuInfo?: SkuInfo
    skuAttributeNames?: string
  }]
}>()

// ============ 核心状态 ============
const skuDetail = ref<ProductSkuDetail | null>(null)
const loading = ref(false)
const selectedAttributes = ref<Record<number, number>>({})
const selectedCount = ref(1)
const currentSkuInfo = ref<SkuInfo | null>(null)

// ============ 计算属性 ============
const isAllSelected = computed(() => {
  if (!skuDetail.value)
    return false
  return skuDetail.value.attributes.every(attr =>
    attr.required ? selectedAttributes.value[attr.attributeId] !== undefined : true,
  )
})

const selectedSpecText = computed(() => {
  if (!skuDetail.value)
    return ''
  return skuDetail.value.attributes
    .map((attr) => {
      const value = attr.attributeValues.find(v => v.id === selectedAttributes.value[attr.attributeId])
      return value ? value.value : ''
    })
    .filter(Boolean)
    .join('，')
})

const displayPrice = computed(() => {
  if (!skuDetail.value)
    return 0
  const unitPrice = currentSkuInfo.value?.price ?? skuDetail.value.product.price
  return unitPrice * selectedCount.value
})

function buildSkuData() {
  return Object.entries(selectedAttributes.value).map(([id, val]) => ({
    attributeId: Number(id),
    attributeValueId: val,
  }))
}

// ============ 业务方法 ============
async function loadSkuDetail() {
  if (!props.productId)
    return

  loading.value = true
  try {
    skuDetail.value = await getProductSkuDetail(props.productId)

    // 默认选中每个规格的第一个值
    selectedAttributes.value = skuDetail.value.attributes
      .filter(attr => attr.attributeValues.length > 0)
      .reduce((acc, attr) => {
        acc[attr.attributeId] = attr.attributeValues[0].id
        return acc
      }, {} as Record<number, number>)

    // 默认选中后，加载 SKU 信息（价格、库存等）
    // 使用 nextTick 确保 selectedAttributes 已经更新
    await nextTick()
    if (isAllSelected.value) {
      await loadSkuInfo()
    }
  }
  catch (err) {
    console.error('Failed to load SKU detail:', err)
  }
  finally {
    loading.value = false
  }
}

async function loadSkuInfo() {
  if (!props.productId || !isAllSelected.value)
    return

  try {
    const skuInfo = await getSkuBySpecs({
      productId: props.productId,
      sku: buildSkuData(),
      count: selectedCount.value,
    })
    currentSkuInfo.value = skuInfo
  }
  catch (err) {
    console.error('Failed to load SKU info:', err)
  }
}

function resetState() {
  skuDetail.value = null
  selectedAttributes.value = {}
  selectedCount.value = 1
  currentSkuInfo.value = null
}

function handleClose() {
  emit('close')
  emit('update:show', false)
}

async function handleConfirm() {
  if (!isAllSelected.value || !skuDetail.value)
    return

  if (!currentSkuInfo.value) {
    await loadSkuInfo()
    if (!currentSkuInfo.value) {
      uni.showToast({ title: '获取规格信息失败', icon: 'none' })
      return
    }
  }

  emit('confirm', {
    productId: skuDetail.value.product.id,
    productName: skuDetail.value.product.productName,
    productImage: skuDetail.value.product.images[0]?.url,
    productPrice: skuDetail.value.product.price,
    sku: buildSkuData(),
    count: selectedCount.value,
    skuInfo: currentSkuInfo.value,
    skuAttributeNames: selectedSpecText.value,
  })
  emit('close')
  emit('update:show', false)
}

async function selectAttribute(attributeId: number, valueId: number) {
  selectedAttributes.value[attributeId] = valueId
  selectedCount.value = 1
  if (props.productId && isAllSelected.value && skuDetail.value) {
    await loadSkuInfo()
  }
}

// ============ Watch ============
watch(
  () => props.show,
  (isVisible) => {
    if (isVisible) {
      loadSkuDetail()
    }
    else {
      resetState()
    }
  },
)
</script>

<template>
  <up-popup
    :show="show"
    mode="bottom"
    :close-on-click-overlay="true"
    :round="16"
    :z-index="ZIndex.popup"
    :custom-style="{ padding: 0 }"
    @close="handleClose"
  >
    <view class="p-4">
      <!-- 商品信息 -->
      <view v-if="skuDetail?.product" class="mb-4 flex items-center gap-3">
        <image
          class="h-20 w-20 rounded-lg bg-gray-100"
          :src="skuDetail.product.images[0]?.url"
          mode="aspectFill"
        />
        <view class="flex-1">
          <text class="text-base font-bold">{{ skuDetail.product.productName }}</text>
          <text v-if="selectedSpecText" class="mt-1 block text-xs text-gray-400">
            已选：{{ selectedSpecText }}
          </text>
        </view>
      </view>

      <!-- 加载中 -->
      <view v-if="loading" class="py-8 text-center">
        <up-loading-icon size="32" />
      </view>

      <!-- 规格选择 -->
      <view v-else-if="skuDetail" class="max-h-64 overflow-y-auto space-y-4">
        <view
          v-for="attr in skuDetail.attributes"
          :key="attr.attributeId"
        >
          <text class="mb-2 block text-sm text-gray-500">
            {{ attr.attributeName }}
            <text v-if="attr.required" class="text-red-500">*</text>
          </text>
          <view class="flex flex-wrap gap-2">
            <up-tag
              v-for="value in attr.attributeValues"
              :key="value.id"
              :text="value.value"
              :type="selectedAttributes[attr.attributeId] === value.id ? 'primary' : 'info'"
              :bg-color="selectedAttributes[attr.attributeId] === value.id ? 'var(--theme-color)' : '#ecf5ff'"
              :color="selectedAttributes[attr.attributeId] === value.id ? '#fff' : '#374151'"
              :border-color="selectedAttributes[attr.attributeId] === value.id ? 'var(--theme-color)' : '#ecf5ff'"
              size="mini"
              @click="selectAttribute(attr.attributeId, value.id)"
            />
          </view>
        </view>
      </view>

      <!-- 底部操作栏 -->
      <view class="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4">
        <view class="flex items-center justify-between">
          <text class="text-xl text-red-500 font-bold">¥{{ formatPrice(displayPrice) }}</text>
          <NumberBox v-model="selectedCount" :min="1" />
        </view>
        <up-button
          class="btn-disabled rounded-full px-6"
          type="primary"
          text="添加"
          :disabled="!isAllSelected"
          @click="handleConfirm"
        />
      </view>
    </view>
  </up-popup>
</template>

<style lang="scss" scoped>
.btn-disabled {
  opacity: 0.5;
}
</style>
