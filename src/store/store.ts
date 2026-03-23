import type { Store } from '@/api/types/store'
import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 门店管理 Store
 */
export const useStoreStore = defineStore(
  'store',
  () => {
    // 当前选择的门店
    const currentStore = ref<Store | null>(null)

    // 门店列表
    const storeList = ref<Store[]>([])

    /**
     * 设置当前门店
     */
    const setCurrentStore = (store: Store) => {
      currentStore.value = store
    }

    /**
     * 清除当前门店
     */
    const clearCurrentStore = () => {
      currentStore.value = null
    }

    /**
     * 设置门店列表
     */
    const setStoreList = (stores: Store[]) => {
      storeList.value = stores
    }

    /**
     * 获取当前门店 ID
     */
    const getCurrentStoreId = () => {
      return currentStore.value?.id ?? 0
    }

    /**
     * 根据 ID 获取门店信息
     */
    const getStoreById = (id: number) => {
      return storeList.value.find(store => store.id === id) || null
    }

    return {
      currentStore,
      storeList,
      setCurrentStore,
      clearCurrentStore,
      setStoreList,
      getCurrentStoreId,
      getStoreById,
    }
  },
  {
    persist: true, // 开启持久化
  },
)
