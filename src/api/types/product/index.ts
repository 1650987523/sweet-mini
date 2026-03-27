// 商品信息（后端返回）
export interface ProductInfo {
  id: number // 商品 ID
  categoryId: number | null // 分类 ID
  productName: string // 商品名称
  productDescription: string | null // 商品描述
  productPrice: number // 价格（分）
  images: Array<{
    url: string
    sort: number
    description: string | null
  }>
}

// 商品分类信息（后端返回）
export interface ProductCategory {
  categoryId: number // 分类 ID
  categoryName: string // 分类名称
  products: ProductInfo[] // 该分类下的商品列表
}

// 商品信息（前端展示用）
export interface ProductInfoVO {
  id: number // 商品 ID
  productName: string // 商品名称
  productDescription: string // 商品描述
  productPrice: number // 价格（分）
  productImage: string // 商品图片 URL
}

// 商品分类信息（前端展示用）
export interface ProductCategoryVO {
  categoryId: number // 分类 ID
  categoryName: string // 分类名称
  categoryIcon: string // 分类图标（前端计算）
  products: ProductInfoVO[] // 该分类下的商品列表
}

// 商品图片
export interface ProductImage {
  url: string
  sort: number
  description: string | null
}

// 商品详情信息（SKU 弹窗用）
export interface ProductSkuInfo {
  id: number
  storeId: number
  productName: string
  subTitle: string
  categoryId: number
  description: string
  price: number
  marketPrice: number
  memberPrice: number
  costPrice: number
  stock: number
  sales: number
  unit: string
  images: ProductImage[]
  sliderImages: ProductImage[]
  detail: string
  tags: string[]
  sort: number
  isHot: boolean
  isRecommend: boolean
  isNew: boolean
  status: number
  deleteTime: string | null
  createTime: string
  updateTime: string
  createBy: string | null
  updateBy: string | null
}

// 规格值
export interface AttributeValue {
  id: number
  attributeId: string
  value: string
  sort: number
  status: boolean
}

// 规格属性（分组）
export interface Attribute {
  id: number | null
  productId: number | null
  attributeId: number
  attributeName: string
  attributeValues: AttributeValue[]
  required: boolean
  sort: number
}

// 商品 SKU 详情响应
export interface ProductSkuDetail {
  product: ProductSkuInfo
  attributes: Attribute[]
}

// 根据规格查询 SKU 信息请求参数
export interface SkuBySpecsRequest {
  productId: number
  sku: Array<{
    attributeId: number
    attributeValueId: number
  }>
  count: number
}

// SKU 信息响应
export interface SkuInfo {
  id?: number // 后端返回的 SKU ID
  skuId?: number // 兼容字段
  price: number
  stock: number
  skuCode?: string
  skuImages?: ProductImage[]
}

// 创建订单项（SKU 信息）
export interface CreateOrderSkuItem {
  productId: number
  skuId: number
  count: number
  price: number
}

// 创建订单请求参数
export interface CreateOrderRequest {
  storeId: number
  userId: number
  tableNo: string
  payType: number
  couponId: string
  discountAmount: number
  remark: string
  skus: CreateOrderSkuItem[]
}

// 创建订单响应
export interface CreateOrderResponse {
  orderId: number
  orderNo: string
  totalAmount: number
  payAmount: number
  payTime?: string
  status: number
}

// 获取支付参数请求
export interface PayOrderRequest {
  orderNo: string
}

// 微信支付参数响应
export interface PayOrderResponse {
  appId: string
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}

// 订单明细项（对应后端 OrderDetail 实体）
export interface OrderSkuItem {
  id?: number // 明细 ID
  productId: number
  productName: string
  productImage: string
  skuId: number
  skuName: string
  skuSpecs?: Array<{
    specId?: number
    attrId?: number
    attrName?: string
    attrValueId?: number
    value?: string
    valueName?: string
  }> // SKU 规格详情
  quantity: number // 购买数量
  price: number // 商品单价（单位：分）
  subtotal?: number // 小计金额
  itemRemark?: string // 商品项备注
  skuImages?: Array<{
    url: string
    sort?: number
    description?: string
  }> // SKU 图片列表
}

// 订单主表（对应后端 OrderMain 实体）
export interface OrderDetail {
  orderId: number
  orderNo: string
  storeId: number
  storeName: string
  tableNo: string
  userId: number
  totalAmount: number // 订单总额（单位：分）
  discountAmount: number // 优惠金额（单位：分）
  payAmount: number // 实付金额（单位：分）
  orderStatus: number // 订单状态：0-待支付，1-制作中，2-已完成，3-已取消，4-退款中，5-已退款
  payType: number
  remark?: string // 订单备注
  payTime?: string
  createTime: string
  skus?: OrderSkuItem[] // 订单明细列表
}

// 订单列表项（后端订单列表接口返回的扁平结构）
export interface OrderMain {
  id: number
  orderNo: string
  userId: number
  storeId: number
  customerName?: string
  customerPhone?: string
  totalAmount: number
  goodsAmount: number
  deliveryFee: number
  discountAmount: number
  payAmount: number
  payType: number
  payStatus: number
  orderStatus: number
  orderType: number
  deliveryAddr: string
  takeTime?: string
  storeName: string
  couponId?: string
  remark?: string
  cancelReason?: string
  createTime: string
  updateTime: string
}

// 获取订单详情响应（后端返回 orderMain + orderDetails）
export interface OrderDetailResponse {
  orderMain: OrderDetail
  orderDetails: OrderSkuItem[]
}

// 订单列表分页请求参数
export interface OrderPageRequest {
  current?: number // 当前页码
  size?: number // 每页大小
  orderNo?: string
  userId?: number
  storeId?: number
  orderStatus?: number
  payStatus?: number
  // 兼容旧字段
  pageNo?: number
  pageSize?: number
}

// 订单列表项（包含主表和明细）
export interface OrderListItem {
  orderMain: OrderDetail
  orderDetails: OrderSkuItem[]
}

// 分页响应（通用）
export interface PageResponse<T> {
  records: T[] // 数据列表
  total: number // 总记录数
  size: number // 每页大小
  current: number // 当前页码
  pages: number // 总页数
}

// 订单列表相响应返回
export interface OrderPageVo {
  orderMain: OrderDetail
  orderDetails: OrderSkuItem[]
}

// 订单列表分页响应
export type OrderPageResponse = PageResponse<OrderPageVo>

// 申请退款请求参数（对应后端 /order/refund/apply）
export interface ApplyRefundRequest {
  orderNo: string // 订单号
  userId: number // 用户 ID
  storeId: number // 门店 ID
  orderAmount: number // 订单总金额（单位：分）
  refundAmount: number // 申请退款金额（单位：分）
  refundType: number // 退款类型：1=门店后台发起，2=用户发起
  refundReason: string // 退款原因
}
