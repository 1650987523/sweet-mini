/**
 * 微信支付参数响应
 */
export interface PayOrderResponse {
  appId: string
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}

/**
 * 模拟微信支付回调请求参数（仿微信支付 V3 回调格式）
 */
export interface WxPayCallbackRequest {
  outTradeNo: string // 商户订单号
  transactionId: string // 微信支付订单号
  tradeState: string // 交易状态：SUCCESS-支付成功，FAILED-支付失败
  amount: number // 订单金额（单位：分）
}
