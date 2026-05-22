export interface ConvertParams {
  quality: number
  fps: number
  lossless: boolean
  width: number
  height: number
  loop: number
  compressionLevel: number
  preset: 'default' | 'picture' | 'photo' | 'drawing' | 'icon' | 'text'
}

const defaults: ConvertParams = {
  quality: 80,
  fps: 15,
  lossless: false,
  width: -1,
  height: -1,
  loop: 0,
  compressionLevel: 4,
  preset: 'picture',
}

const file = ref<File | null>(null)
const params = ref<ConvertParams>({ ...defaults })
const status = ref<'idle' | 'converting' | 'done' | 'error'>('idle')
const resultUrl = ref<string | null>(null)
const resultSize = ref<number>(0)
const error = ref<string | null>(null)
const inputPreviewUrl = ref<string | null>(null)
const authKey = ref<string | null>(null)

export function useConverter() {
  function setAuthKey(key: string) {
    authKey.value = key
  }

  function setFile(f: File) {
    file.value = f
    status.value = 'idle'
    error.value = null
    if (resultUrl.value) {
      URL.revokeObjectURL(resultUrl.value)
      resultUrl.value = null
    }
    if (inputPreviewUrl.value) {
      URL.revokeObjectURL(inputPreviewUrl.value)
    }
    inputPreviewUrl.value = URL.createObjectURL(f)
  }

  function clearFile() {
    file.value = null
    status.value = 'idle'
    error.value = null
    if (resultUrl.value) {
      URL.revokeObjectURL(resultUrl.value)
      resultUrl.value = null
    }
    if (inputPreviewUrl.value) {
      URL.revokeObjectURL(inputPreviewUrl.value)
      inputPreviewUrl.value = null
    }
  }

  function resetParams() {
    params.value = { ...defaults }
  }

  async function convert() {
    if (!file.value || !authKey.value) return

    status.value = 'converting'
    error.value = null

    try {
      const formData = new FormData()
      formData.append('file', file.value)
      formData.append('params', JSON.stringify(params.value))

      const response = await $fetch<Blob>('/api/convert', {
        method: 'POST',
        body: formData,
        responseType: 'blob',
        headers: { 'x-auth-key': authKey.value },
      })

      if (resultUrl.value) {
        URL.revokeObjectURL(resultUrl.value)
      }
      resultSize.value = response.size
      resultUrl.value = URL.createObjectURL(response)
      status.value = 'done'
    } catch (err: any) {
      error.value = err?.data?.statusMessage ?? err?.message ?? '转换失败'
      status.value = 'error'
    }
  }

  function download() {
    if (!resultUrl.value) return
    const a = document.createElement('a')
    a.href = resultUrl.value
    a.download = 'converted.webp'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const inputSize = computed(() => file.value?.size ?? 0)

  return {
    file,
    params,
    status,
    resultUrl,
    resultSize,
    error,
    inputPreviewUrl,
    inputSize,
    authKey,
    defaults,
    setAuthKey,
    setFile,
    clearFile,
    resetParams,
    convert,
    download,
  }
}
