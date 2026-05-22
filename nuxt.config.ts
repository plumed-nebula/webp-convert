// https://nuxt.com/docs/api/configuration/nuxt-config
import appConfig from './config'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  devServer: {
    port: appConfig.port,
  },

  nitro: {
    experimental: {
      openAPI: true,
    },
  },

  runtimeConfig: {
    maxFileSize: appConfig.maxFileSize,
    ffmpegTimeout: appConfig.ffmpegTimeout,

    public: {
      maxFileSize: appConfig.maxFileSize,
      enableAuth: appConfig.enableAuth,
    },
  },
})
