export enum ResultEnum {
  // 0和200当做成功都很普遍，这里直接兼容两者（PS：0和200通常都不会当做错误码，但是有的接口会返回0，有的接口会返回200）
  Success0 = 0, // 成功
  Success200 = 200, // 成功
  Error = 400, // 错误
  Unauthorized = 401, // 未授权
  Forbidden = 403, // 禁止访问（原为forbidden）
  NotFound = 404, // 未找到（原为notFound）
  MethodNotAllowed = 405, // 方法不允许（原为methodNotAllowed）
  RequestTimeout = 408, // 请求超时（原为requestTimeout）
  InternalServerError = 500, // 服务器错误（原为internalServerError）
  NotImplemented = 501, // 未实现（原为notImplemented）
  BadGateway = 502, // 网关错误（原为badGateway）
  ServiceUnavailable = 503, // 服务不可用（原为serviceUnavailable）
  GatewayTimeout = 504, // 网关超时（原为gatewayTimeout）
  HttpVersionNotSupported = 505, // HTTP版本不支持（原为httpVersionNotSupported）
}
export enum ContentTypeEnum {
  JSON = 'application/json;charset=UTF-8',
  FORM_URLENCODED = 'application/x-www-form-urlencoded;charset=UTF-8',
  FORM_DATA = 'multipart/form-data;charset=UTF-8',
}

/**
 * 订单状态枚举（对应后端 OrderStatus）
 */
export enum OrderStatusEnum {
  /** 待支付 */
  UNPAID = 0,
  /** 制作中 */
  MAKING = 1,
  /** 已完成 */
  COMPLETED = 2,
  /** 已取消 */
  CANCELLED = 3,
  /** 退款中 */
  REFUNDING = 4,
  /** 已退款 */
  REFUNDED = 5,
  /** 驳回 */
  REJECTED = 6,
}

/**
 * 订单状态文本映射
 */
export const OrderStatusTextMap: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.UNPAID]: '待支付',
  [OrderStatusEnum.MAKING]: '制作中',
  [OrderStatusEnum.COMPLETED]: '已完成',
  [OrderStatusEnum.CANCELLED]: '已取消',
  [OrderStatusEnum.REFUNDING]: '退款中',
  [OrderStatusEnum.REFUNDED]: '已退款',
  [OrderStatusEnum.REJECTED]: '驳回',
}

/**
 * 订单状态颜色映射
 */
export const OrderStatusColorMap: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.UNPAID]: '#ff6b00',
  [OrderStatusEnum.MAKING]: '#007aff',
  [OrderStatusEnum.COMPLETED]: '#07c160',
  [OrderStatusEnum.CANCELLED]: '#999',
  [OrderStatusEnum.REFUNDING]: '#ff9500',
  [OrderStatusEnum.REFUNDED]: '#07c160',
  [OrderStatusEnum.REJECTED]: '#ee0a24',
}

/**
 * 订单状态图标映射
 */
export const OrderStatusIconMap: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.UNPAID]: 'clock', // 待支付 → 时钟
  [OrderStatusEnum.MAKING]: 'hourglass', // 制作中 → 沙漏
  [OrderStatusEnum.COMPLETED]: 'checkmark-circle', // 已完成 → 勾
  [OrderStatusEnum.CANCELLED]: 'close-circle', // 已取消 → 叉
  [OrderStatusEnum.REFUNDING]: 'reload', // 退款中 → 循环
  [OrderStatusEnum.REFUNDED]: 'checkmark-circle', // 已退款 → 勾
  [OrderStatusEnum.REJECTED]: 'close-circle', // 驳回 → 叉
}
/**
 * 根据状态码，生成对应的错误信息
 * @param {number|string} status 状态码
 * @returns {string} 错误信息
 */
export function ShowMessage(status: number | string): string {
  let message: string
  switch (status) {
    case 400:
      message = '请求错误(400)'
      break
    case 401:
      message = '未授权，请重新登录(401)'
      break
    case 403:
      message = '拒绝访问(403)'
      break
    case 404:
      message = '请求出错(404)'
      break
    case 408:
      message = '请求超时(408)'
      break
    case 500:
      message = '服务器错误(500)'
      break
    case 501:
      message = '服务未实现(501)'
      break
    case 502:
      message = '网络错误(502)'
      break
    case 503:
      message = '服务不可用(503)'
      break
    case 504:
      message = '网络超时(504)'
      break
    case 505:
      message = 'HTTP版本不受支持(505)'
      break
    default:
      message = `连接出错(${status})!`
  }
  return `${message}，请检查网络或联系管理员！`
}
