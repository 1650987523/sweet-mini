/**
 * 分转元（后端价格单位为分，前端展示为元）
 * @param price 价格（分）
 * @returns 价格（元，保留两位小数）
 */
export function formatPrice(price: number): string {
  return (price / 100).toFixed(2)
}

/**
 * 元转分（前端输入元，后端接收分）
 * @param yuan 价格（元）
 * @returns 价格（分，整数）
 */
export function parsePrice(yuan: number | string): number {
  return Math.round(Number(yuan) * 100)
}
