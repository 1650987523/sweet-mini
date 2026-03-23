import { getStoreById } from '@/api/store'
import { useStoreStore } from '@/store/store'

/**
 * 解析扫码 scene 参数，设置门店信息
 * @param scene 扫码场景参数，格式：storeId-qrcodeNo
 */
export async function parseScanCode(scene: string) {
  if (!scene) {
    throw new Error('未找到 scene 参数')
  }

  const decodedScene = decodeURIComponent(scene)
  const [storeIdStr, qrcodeNo] = decodedScene.split('-')
  const storeId = Number(storeIdStr)

  if (!storeId || !qrcodeNo) {
    throw new Error('scene 参数格式错误')
  }

  const storeStore = useStoreStore()
  const storeInfo = await getStoreById(storeId)
  storeStore.setCurrentStore({ ...storeInfo, qrcodeNo })

  return { storeId, qrcodeNo }
}

/**
 * 扫码选项配置
 */
export interface ScanCodeOptions {
  /** 扫码成功后的回调 */
  onSuccess?: (result: { storeId: number, qrcodeNo: string }) => void
  /** 扫码成功后跳转的页面路径 */
  redirectTo?: string
}

/**
 * 调用微信扫码，并解析结果
 * @param options 扫码选项配置
 * @returns 解析后的门店信息
 */
export async function scanCode(options?: ScanCodeOptions) {
  return new Promise<{ storeId: number, qrcodeNo: string }>((resolve, reject) => {
    uni.scanCode({
      success: async (res) => {
        try {
          const result = await parseScanCode(res.result)

          // 执行回调
          options?.onSuccess?.(result)

          // 跳转页面
          if (options?.redirectTo) {
            uni.redirectTo({ url: options.redirectTo })
          }

          resolve(result)
        }
        catch (error) {
          reject(error)
        }
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}
