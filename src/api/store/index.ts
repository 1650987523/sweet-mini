import type { Page } from '../types'
import type { Store, StorePagetParams } from '../types/store'
import { http } from '@/http/http'

/**
 * 获取门店分页列表
 * @param params 请求参数
 * @returns 门店分页数据
 */
export function getStorePage(params: StorePagetParams) {
  return http.get<Page<Store>>('/store/page', params)
}

/**
 * 获取全部门店列表（不分页）
 * @returns 门店列表
 */
export function getAllStores() {
  return http.get<Store[]>('/store')
}

/**
 * 根据门店id获取门店详情
 * @param storeId
 * @returns
 */
export function getStoreById(storeId: number) {
  return http.get<Store>(`/store/${storeId}`)
}
