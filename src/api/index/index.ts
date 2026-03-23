import type { BannerInfo, BannerListParams } from '../types'
import { http } from '@/http/http'

/**
 * 获取轮播图列表
 * @param data 请求参数（可选）
 * @returns 轮播图列表
 */
export function getBannerList(data?: BannerListParams) {
  return http.get<BannerInfo[]>('/banner/list', data)
}
