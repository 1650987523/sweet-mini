import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'
import { tabBar } from './src/tabbar/config'

export default defineUniPages({
  pages: [
    {
      path: 'pages/order/index',
      style: { navigationBarTitleText: '订单列表' },
    },
    {
      path: 'pages/order/detail',
      style: { navigationBarTitleText: '订单详情' },
    },
    {
      path: 'pages/order/confirm',
      style: { navigationBarTitleText: '确认订单' },
    },
    {
      path: 'pages/order/pay-result',
      style: { navigationBarTitleText: '支付结果' },
    },
  ],
  globalStyle: {
    navigationStyle: 'default',
    navigationBarTitleText: 'unibest',
    navigationBarBackgroundColor: '#f8f8f8',
    navigationBarTextStyle: 'black',
    backgroundColor: '#FFFFFF',
  },
  easycom: {
    autoscan: true,
    custom: {
      '^fg-(.*)': '@/components/fg-$1/fg-$1.vue',
      '^(?!z-paging-refresh|z-paging-load-more)z-paging(.*)':
        'z-paging/components/z-paging$1/z-paging$1.vue',
      '^u--(.*)': 'uview-plus/components/u-$1/u-$1.vue',
      '^up-(.*)': 'uview-plus/components/u-$1/u-$1.vue',
      '^u-([^-].*)': 'uview-plus/components/u-$1/u-$1.vue',
      '^number-box': '@/components/NumberBox/index.vue',
    },
  },
  // tabbar 的配置统一在 “./src/tabbar/config.ts” 文件中
  tabBar: tabBar as any,
})
