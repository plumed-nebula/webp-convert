<template>
  <div class="auth-overlay">
    <div class="auth-card">
      <h2>输入访问密钥</h2>
      <p class="auth-hint">此工具需要密钥才能使用</p>
      <form @submit.prevent="onSubmit">
        <input
          v-model="inputKey"
          type="password"
          placeholder="请输入密钥"
          class="key-input"
          autofocus
        />
        <p v-if="errMsg" class="auth-error">{{ errMsg }}</p>
        <button type="submit" class="btn-submit" :disabled="checking">
          {{ checking ? '验证中...' : '验证' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ verified: [key: string] }>()

const inputKey = ref('')
const checking = ref(false)
const errMsg = ref('')

async function onSubmit() {
  const key = inputKey.value.trim()
  if (!key) {
    errMsg.value = '请输入密钥'
    return
  }

  checking.value = true
  errMsg.value = ''

  try {
    await $fetch('/api/verify', {
      headers: { 'x-auth-key': key },
    })
    emit('verified', key)
  } catch (err: any) {
    if (err?.response?.status === 401) {
      errMsg.value = '密钥无效'
    } else {
      errMsg.value = err?.data?.statusMessage ?? '验证失败，请重试'
    }
  } finally {
    checking.value = false
  }
}
</script>

<style scoped>
.auth-overlay {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  padding: 20px;
}
.auth-card {
  background: #fff;
  border-radius: 16px;
  padding: 36px 32px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  text-align: center;
}
.auth-card h2 {
  margin: 0 0 6px;
  font-size: 20px;
  color: #1e293b;
}
.auth-hint {
  margin: 0 0 20px;
  font-size: 13px;
  color: #94a3b8;
}
.key-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 15px;
  color: #1e293b;
  text-align: center;
  box-sizing: border-box;
}
.key-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}
.auth-error {
  margin: 8px 0 0;
  font-size: 13px;
  color: #ef4444;
}
.btn-submit {
  width: 100%;
  margin-top: 16px;
  padding: 10px 0;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.btn-submit:hover:not(:disabled) {
  background: #4f46e5;
}
.btn-submit:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}
</style>
