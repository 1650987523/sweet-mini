import type {
  ProductCategory,
  ProductSkuDetail,
  ProductWithCategoriesParams,
  SkuBySpecsRequest,
  SkuInfo,
} from '@/api/types'
import { http } from '@/http/http'

/**
 * 获取门店分类列表（包含商品）
 * @param params 查询参数
 * @returns 分类列表（包含商品）
 */
export function getProductWithCategories(params: ProductWithCategoriesParams) {
  return http.get<ProductCategory[]>(`/product-business/product-with-categories/${params.storeId}`, { productName: params.productName })
}

/**
 * 获取商品 SKU 详情（规格属性）
 * @param productId 商品 ID
 * @returns 商品信息和规格属性列表
 */
export function getProductSkuDetail(productId: number) {
  return http.get<ProductSkuDetail>(`/product-business/attribute-info/${productId}`)
}

/**
 * 根据选中的规格查询 SKU 信息
 * @param data 请求参数
 * @returns SKU 信息
 */
export function getSkuBySpecs(data: SkuBySpecsRequest) {
  return http.post<SkuInfo>('/product-business/sku-by-attrs', data)
}
