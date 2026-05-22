<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <AuthGate v-if="!authenticated" @verified="onVerified" />
  </div>
</template>

<script setup lang="ts">
const { setAuthKey } = useConverter()
const config = useRuntimeConfig()
const authenticated = ref(false)

const authCookie = useCookie<string>('auth_key', {
  maxAge: 60 * 60 * 24 * 7, // 7 days
  sameSite: 'strict',
})

// Skip auth gate entirely if auth is disabled
if (!config.public.enableAuth) {
  authenticated.value = true
}

// Auto-login from cookie
if (authCookie.value) {
  setAuthKey(authCookie.value)
  authenticated.value = true
}

function onVerified(key: string) {
  authCookie.value = key
  setAuthKey(key)
  authenticated.value = true
}
</script>
