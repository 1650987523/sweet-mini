// 分页响应接口
export interface Page<T> {
  records: T[] // 数据列表
  total: number // 总记录数
  size: number // 每页大小
  current: number // 当前页码
  pages: number // 总页数
}

// 导出支付相关类型
export type { PayOrderResponse, WxPayCallbackRequest } from './pay'

// 轮播图跳转类型枚举
export enum BannerLinkType {
  PRODUCT = 1, // 商品
  CATEGORY = 2, // 分类
  ACTIVITY = 3, // 活动
  EXTERNAL = 4, // 外链
  PAGE = 5, // 页面
}

// 轮播图信息响应实体（对应后端 Banner 实体）
export interface BannerInfo {
  id: number // 轮播图 ID
  imageUrl: string // 图片 URL
  linkUrl: string // 跳转链接 URL
  linkType: BannerLinkType // 跳转类型：1-商品 2-分类 3-活动 4-外链 5-页面
  linkParams: string | null // 跳转参数（JSON 格式）
  title: string // 轮播图标题
  sortOrder: number // 排序序号（越大越靠前）
  status: number // 状态：0-下架 1-上架
  startTime: string | null // 开始时间
  endTime: string | null // 结束时间
  createTime: string // 创建时间
  updateTime: string // 更新时间
}

// 首页轮播图参数
export interface BannerListParams {
  storeId?: number
  status?: number
}

// 获取商品分类列表参数
export interface ProductWithCategoriesParams {
  storeId: number // 门店 ID
  productName?: string // 商品名称（可选）
}

// 导出商品相关类型（包含订单和分页）
export type {
  Attribute,
  AttributeValue,
  CreateOrderRequest,
  CreateOrderResponse,
  OrderDetail,
  OrderDetailResponse,
  OrderListItem,
  OrderMain,
  OrderPageRequest,
  OrderPageResponse,
  OrderSkuItem,
  PageResponse,
  ProductCategoryVO,
  ProductImage,
  ProductInfo,
  ProductInfoVO,
  ProductSkuDetail,
  ProductSkuInfo,
  SkuBySpecsRequest,
  SkuInfo,
} from './product'

// 门店信息
export type { Store } from './store'
