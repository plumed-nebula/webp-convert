<template>
  <div class="container">
    <header class="header">
      <h1>WebP 转换器</h1>
      <p class="subtitle">上传动图或视频，转换为 Animated WebP</p>
    </header>

    <main class="main">
      <section class="upload-section">
        <FileUpload
          :file="file"
          @select="setFile"
          @clear="clearFile"
        />
      </section>

      <section class="params-section">
        <ConvertParams
          :params="params"
          @update="onParamUpdate"
          @reset="resetParams"
        />
      </section>

      <section class="action-section">
        <button
          class="btn-convert"
          :disabled="!file || status === 'converting'"
          @click="convert"
        >
          {{ status === 'converting' ? '转换中...' : '开始转换' }}
        </button>
      </section>

      <section class="result-section">
        <ResultPreview
          :status="status"
          :resultUrl="resultUrl"
          :inputPreviewUrl="inputPreviewUrl"
          :resultSize="resultSize"
          :inputSize="inputSize"
          :error="error"
          :format="params.format"
          @download="download"
        />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
const {
  file,
  params,
  status,
  resultUrl,
  resultSize,
  error,
  inputPreviewUrl,
  inputSize,
  setFile,
  clearFile,
  resetParams,
  convert,
  download,
} = useConverter()

function onParamUpdate(key: string, value: unknown) {
  ;(params.value as unknown as Record<string, unknown>)[key] = value
}
</script>

<style scoped>
.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 40px 20px;
}
.header {
  text-align: center;
  margin-bottom: 32px;
}
.header h1 {
  margin: 0;
  font-size: 28px;
  color: #1e293b;
}
.subtitle {
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 14px;
}
.main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.btn-convert {
  width: 100%;
  padding: 14px;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-convert:hover:not(:disabled) {
  background: #4f46e5;
}
.btn-convert:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}
</style>
