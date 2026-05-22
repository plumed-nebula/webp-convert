import config from '../../config'

export default defineEventHandler((event) => {
  if (!config.enableAuth) return
  if (!event.path.startsWith('/api/')) return

  const key = getHeader(event, 'x-auth-key')
  if (key !== config.secretKey) {
    throw createError({
      statusCode: 401,
      message: '密钥无效，拒绝访问',
    })
  }
})
