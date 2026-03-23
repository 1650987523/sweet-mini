import { useStoreStore } from '@/store/store'
/**
 * by 菲鸽 on 2025-08-19
 * 路由拦截，通常也是登录拦截
 * 黑、白名单的配置，请看 config.ts 文件， EXCLUDE_LOGIN_PATH_LIST
 */
import { useTokenStore } from '@/store/token'
import { tabbarStore } from '@/tabbar/store'
import { getLastPage, parseUrlToObj } from '@/utils/index'
import { EXCLUDE_LOGIN_PATH_LIST, REQUIRE_STORE_PATH_LIST } from './config'

export const FG_LOG_ENABLE = false

export const navigateToInterceptor = {
  // 注意，这里的url是 '/' 开头的，如 '/pages/index/index'，跟 'pages.json' 里面的 path 不同
  // 增加对相对路径的处理，BY 网友 @ideal
  invoke({ url, query }: { url: string, query?: Record<string, string> }) {
    if (url === undefined) {
      return
    }
    let { path, query: _query } = parseUrlToObj(url)

    FG_LOG_ENABLE && console.log('\n\n路由拦截器:-------------------------------------')
    FG_LOG_ENABLE && console.log('路由拦截器 1: url->', url, ', query ->', query)
    const myQuery = { ..._query, ...query }
    // /pages/route-interceptor/index?name=feige&age=30
    FG_LOG_ENABLE && console.log('路由拦截器 2: path->', path, ', _query ->', _query)
    FG_LOG_ENABLE && console.log('路由拦截器 3: myQuery ->', myQuery)

    // 处理相对路径
    if (!path.startsWith('/')) {
      const currentPath = getLastPage()?.route || ''
      const normalizedCurrentPath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`
      const baseDir = normalizedCurrentPath.substring(0, normalizedCurrentPath.lastIndexOf('/'))
      path = `${baseDir}/${path}`
    }

    // ========== 登录检查逻辑 ==========
    const tokenStore = useTokenStore()

    // 检查是否在白名单内
    const isInWhiteList = EXCLUDE_LOGIN_PATH_LIST.includes(path)

    // 如果不在白名单且未登录，则跳转到登录页
    if (!isInWhiteList && !tokenStore.hasLogin) {
      uni.reLaunch({
        url: '/pages/auth/login/index',
      })
      return false // 阻止原导航
    }
    // ==================================

    // ========== 门店信息检查逻辑 ==========
    // 检查是否在需要门店的白名单内
    const isRequireStorePage = REQUIRE_STORE_PATH_LIST.includes(path as any)

    if (isRequireStorePage) {
      const storeStore = useStoreStore()
      const hasStoreInfo = storeStore.currentStore?.id && storeStore.currentStore?.qrcodeNo

      // 没有门店信息，重定向到扫码页
      if (!hasStoreInfo) {
        uni.reLaunch({
          url: '/pages/scan/index',
        })
        return false // 阻止原导航
      }
    }
    // ==================================

    // 处理直接进入路由非首页时，tabbarIndex 不正确的问题
    tabbarStore.setAutoCurIdx(path)
  },
}

export const routeInterceptor = {
  install() {
    uni.addInterceptor('navigateTo', navigateToInterceptor)
    uni.addInterceptor('reLaunch', navigateToInterceptor)
    uni.addInterceptor('redirectTo', navigateToInterceptor)
    uni.addInterceptor('switchTab', navigateToInterceptor)
  },
}
