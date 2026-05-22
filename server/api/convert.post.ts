import config from '../../config'

const ALLOWED_MIME: Record<string, string> = {
  'image/gif': 'gif',
  'image/apng': 'apng',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'video/x-msvideo': 'avi',
  'video/x-matroska': 'mkv',
}

const PRESETS = ['default', 'picture', 'photo', 'drawing', 'icon', 'text'] as const
type Preset = (typeof PRESETS)[number]

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, message: '请上传文件' })
  }

  let fileBuffer: Buffer | null = null
  let fileType = ''
  let rawParams: Record<string, string> = {}

  for (const part of formData) {
    if (part.name === 'file' && part.data) {
      fileBuffer = part.data
      fileType = part.type ?? ''
    } else if (part.name === 'params' && part.data) {
      rawParams = JSON.parse(part.data.toString('utf8'))
    }
  }

  if (!fileBuffer) {
    throw createError({ statusCode: 400, message: '未找到文件' })
  }

  if (fileBuffer.length > config.maxFileSize) {
    throw createError({ statusCode: 413, message: `文件大小超过${Math.round(config.maxFileSize / 1024 / 1024)}MB限制` })
  }

  const ext = ALLOWED_MIME[fileType]
  if (!ext) {
    throw createError({
      statusCode: 400,
      message: `不支持的文件类型: ${fileType || '未知'}`,
    })
  }

  function isPreset(v: string | undefined): v is Preset {
    return v != null && (PRESETS as readonly string[]).includes(v)
  }

  const params = {
    quality: Math.min(100, Math.max(0, Number(rawParams.quality) || 80)),
    fps: Math.min(60, Math.max(1, Number(rawParams.fps) || 15)),
    lossless: rawParams.lossless === 'true',
    width: Math.min(4096, Math.max(-1, Number(rawParams.width) || -1)),
    height: Math.min(4096, Math.max(-1, Number(rawParams.height) || -1)),
    loop: Math.min(65535, Math.max(0, Number(rawParams.loop) || 0)),
    compressionLevel: Math.min(6, Math.max(0, Number(rawParams.compressionLevel) || 4)),
    preset: isPreset(rawParams.preset) ? rawParams.preset : 'picture',
  }

  const { runConvert } = await import('../utils/ffmpeg')

  try {
    const outputBuffer = await runConvert(fileBuffer, ext, params, config.ffmpegTimeout)
    setResponseHeader(event, 'Content-Type', 'image/webp')
    setResponseHeader(event, 'Content-Disposition', 'attachment; filename="converted.webp"')
    return new Uint8Array(outputBuffer)
  } catch (err: any) {
    console.error('Conversion error:', err)
    throw createError({
      statusCode: 500,
      message: `转换失败: ${err.message || '未知错误'}`,
    })
  }
})
