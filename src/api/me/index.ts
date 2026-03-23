import type { IUploadAvatarRes } from '../types/login'
import { http } from '@/http/http'

/**
 * 上传用户头像
 * @param filePath 头像文件路径
 * @returns 上传成功后的文件信息
 */
export function uploadAvatar(filePath: string) {
  return http.post<IUploadAvatarRes>('/user/upload/avatar', {
    file: filePath,
  })
}

/**
 * 删除用户头像
 * @returns void
 */
export function deleteAvatar() {
  return http.delete<void>('/user/delete/avatar')
}
