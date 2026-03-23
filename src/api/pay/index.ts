import type { PayOrderResponse, WxPayCallbackRequest } from '@/api/types/pay'
import { http } from '@/http/http'

/**
 * 获取支付参数
 * @param orderNo 订单号
 * @param userId 用户 ID
 * @returns 支付参数
 */
export function getPayParams(orderNo: string, userId: number) {
  return http.get<PayOrderResponse>('/pay/params', { orderNo, userId })
}

/**
 * 模拟微信支付回调（假支付）
 * @param data 支付回调请求参数
 */
export function mockWxPayCallback(data: WxPayCallbackRequest) {
  return http.post('/pay/callback', data)
}
