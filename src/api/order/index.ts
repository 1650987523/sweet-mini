import type {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderDetailResponse,
  OrderPageRequest,
  OrderPageResponse,
} from '@/api/types'
import { http } from '@/http/http'

/**
 * 创建订单
 * @param data 创建订单请求参数
 * @returns 订单信息
 */
export function createOrder(data: CreateOrderRequest) {
  return http.post<CreateOrderResponse>('/product-business/order/create', data)
}

/**
 * 获取订单详情
 * @param orderNo 订单号
 * @param userId 用户 ID
 */
export function getOrderDetail(orderNo: string, userId: number) {
  return http.get<OrderDetailResponse>(`/order-business/detail`, {
    orderNo,
    userId,
  })
}

/**
 * 获取订单列表（分页）
 * @param params 分页请求参数
 */
export function getOrderList(params: OrderPageRequest) {
  return http.get<OrderPageResponse>('/order-business/page', {
    pageNo: params.pageNo || params.current,
    pageSize: params.pageSize || params.size,
    userId: params.userId,
    storeId: params.storeId,
    orderNo: params.orderNo,
    orderStatus: params.orderStatus,
    payStatus: params.payStatus,
  })
}

/**
 * 取消订单
 * @param orderNo 订单编号
 * @param userId 用户 ID
 */
export function cancelOrder(orderNo: string, userId: number) {
  return http.post(`/product-business/order/cancel`, null, {
    orderNo,
    userId,
  })
}
