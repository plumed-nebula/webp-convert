import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import { tmpdir } from 'os'
import { join } from 'path'
import { mkdtemp, rm, writeFile, readFile } from 'fs/promises'

const ffmpegPath: string =
  typeof ffmpegStatic === 'string'
    ? ffmpegStatic
    : ((ffmpegStatic as unknown as Record<string, unknown> | null)?.default as string) ?? ''
ffmpeg.setFfmpegPath(ffmpegPath)

export interface ConvertParams {
  quality: number
  fps: number
  lossless: boolean
  width: number
  height: number
  loop: number
  compressionLevel: number
  preset: 'default' | 'picture' | 'photo' | 'drawing' | 'icon' | 'text'
  format: 'webp' | 'avif'
}

export async function runConvert(
  inputBuffer: Buffer,
  inputExt: string,
  params: ConvertParams,
  timeoutMs = 60000,
): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  const outExt = params.format === 'avif' ? 'avif' : 'webp'
  const contentType = params.format === 'avif' ? 'image/avif' : 'image/webp'
  const tmpDir = await mkdtemp(join(tmpdir(), `${params.format}-`))
  const inputPath = join(tmpDir, `input.${inputExt}`)
  const outputPath = join(tmpDir, `output.${outExt}`)

  try {
    await writeFile(inputPath, inputBuffer)

    const command = ffmpeg(inputPath)
    console.log('[ffmpeg] format:', params.format, 'lossless:', params.lossless, 'fps:', params.fps, 'quality:', params.quality)

    if (params.format === 'avif') {
      setupAvif(command, params)
    } else {
      setupWebp(command, params)
    }

    // Shared video filters (fps, scale)
    const vfParts: string[] = []
    if (params.fps > 0) {
      vfParts.push(`fps=${params.fps}`)
    }
    if (params.width > 0 || params.height > 0) {
      const w = params.width > 0 ? params.width : -1
      const h = params.height > 0 ? params.height : -1
      vfParts.push(`scale=${w}:${h}`)
    }
    if (vfParts.length > 0) {
      command.videoFilters(vfParts.join(','))
    }
    // Prevent ffmpeg from re-timing frames already processed by fps filter
    if (params.fps > 0) {
      command.addOutputOption('-vsync', '0')
    }

    command.save(outputPath)

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        command.kill('SIGKILL')
        reject(new Error('转换超时'))
      }, timeoutMs)

      command
        .on('end', () => {
          clearTimeout(timer)
          resolve()
        })
        .on('error', (err: Error) => {
          clearTimeout(timer)
          reject(err)
        })
    })

    const buffer = await readFile(outputPath)
    return { buffer, contentType, ext: outExt }
  } finally {
    await rm(tmpDir, { recursive: true, force: true })
  }
}

function setupWebp(command: ReturnType<typeof ffmpeg>, params: ConvertParams) {
  const outputOpts: string[] = [
    `-lossless ${params.lossless ? 1 : 0}`,
    `-compression_level ${params.compressionLevel}`,
    `-loop ${params.loop}`,
    '-an',
  ]
  if (!params.lossless) {
    outputOpts.push(`-q:v ${params.quality}`, `-preset ${params.preset}`)
  }
  command.videoCodec('libwebp_anim')
  command.addOutputOptions(outputOpts)
}

function setupAvif(command: ReturnType<typeof ffmpeg>, params: ConvertParams) {
  const outputOpts: string[] = [
    '-still-picture', '0',  // enable animation (libaom defaults to still)
    '-an',
  ]

  if (params.lossless) {
    // AVIF lossless: crf 0 + slowest cpu-used for best compression
    outputOpts.push('-crf', '0', '-cpu-used', '0')
  } else {
    // crf: 0-63, lower = better. Invert quality so 100 → crf 0, 0 → crf 63
    const crf = Math.round(63 * (1 - params.quality / 100))
    // cpu-used: 0-8, lower = better/slower. Invert compressionLevel so 6 → 0, 0 → 8
    const cpuUsed = Math.round(8 * (1 - params.compressionLevel / 6))
    outputOpts.push('-crf', String(crf), '-cpu-used', String(cpuUsed))
  }

  command.videoCodec('libaom-av1')
  command.format('avif')
  command.addOutputOptions(outputOpts)
}
