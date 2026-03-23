/**
 * 门店信息
 */
export interface Store {
  /**
   * 门店 ID
   */
  id: number

  /**
   * 门店名称
   */
  name: string

  /**
   * 门店地址
   */
  address: string

  /**
   * 门店联系人
   */
  contactMobile: string

  /**
   * 营业时间
   */
  businessHours: string

  /**
   * 门店 logo
   */
  logo: string

  /**
   * 门店状态
   */
  status: number

  /**
   * 是否支持扫码点餐
   */
  isSupportScan: boolean

  /**
   * 是否支持外送
   */
  isSupportTakeaway: boolean

  /**
   * 是否支持自提
   */
  isSupportSelfpick: boolean

  /**
   * 配送范围 (公里)
   */
  deliveryRange: number

  /**
   * 起送金额 (分)
   */
  deliveryMinAmount: number

  /**
   * 配送费规则
   */
  deliveryFeeRule: string

  /**
   * 备注
   */
  remark: string

  /**
   * 创建时间
   */
  createTime: string

  /**
   * 更新时间
   */
  updateTime: string

  /**
   * 桌码编号（可选，扫码点餐时才有）
   */
  qrcodeNo?: string
}

/**
 * 门店列表请求参数
 */
export interface StorePagetParams {
  pageNo: number
  pageSize: number
  storeName?: string
}
