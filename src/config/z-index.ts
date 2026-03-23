/**
 * z-index 层级配置
 * 统一管理全站 z-index 层级
 */
export const ZIndex = {
  // 基础层 - 普通内容
  base: 1,

  // 固定层 - tabbar、导航栏
  fixed: 2,

  // 悬浮层 - 购物车条、悬浮按钮
  floating: 3,

  // 弹窗层 - SKU 弹窗、选择器
  popup: 4,

  // 覆盖层 - Toast、Loading
  overlay: 5,

  // 最高层 - 模态框、全局提示
  modal: 6,
} as const
