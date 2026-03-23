import { createPinia, setActivePinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate' // 数据持久化

const store = createPinia()
store.use(
  createPersistedState({
    storage: {
      getItem: (key: string) => {
        const item = uni.getStorageSync(key)
        // 如果缓存为空对象或 null，返回 null 让 pinia 使用默认值
        if (!item || item === '{}')
          return null
        return item
      },
      setItem: uni.setStorageSync,
    },
  }),
)
// 立即激活 Pinia 实例, 这样即使在 app.use(store)之前调用 store 也能正常工作 （解决APP端白屏问题）
setActivePinia(store)

export default store

export * from './store'
// 模块统一导出
export * from './token'
export * from './user'
