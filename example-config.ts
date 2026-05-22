export default {
  /** 是否启用密钥验证 */
  enableAuth: true,

  /** 访问密钥 */
  secretKey: 'change-me',

  /** 最大上传文件大小 (字节), 默认 50MB */
  maxFileSize: 50 * 1024 * 1024,

  /** ffmpeg 转换超时时间 (毫秒) */
  ffmpegTimeout: 60000,

  /** 开发服务器端口 */
  port: 3000,
}
