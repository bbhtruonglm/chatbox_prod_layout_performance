<template>
  <iframe
    :src="$main.getUrl()"
    title="Agent Configuration"
    frameborder="0"
    class="rounded-lg min-h-0 flex-grow bg-white"
  />
</template>
<script setup lang="ts">
import { useOrgStore } from '@/stores'
import { Locale, type ILocale } from '@/utils/helper/Locale'
import { LocalStorage, type ILocalStorage } from '@/utils/helper/LocalStorage'
import { Parser, type IParser } from '@/utils/helper/Parser'
import { container } from 'tsyringe'

class Main {
  constructor(
    private readonly SERVICE_PARSER: IParser = container.resolve(Parser),
    private readonly SERVICE_LOCALE: ILocale = container.resolve(Locale),
    private readonly SERVICE_LOCALSTORAGE: ILocalStorage = container.resolve(
      LocalStorage
    ),
    private readonly STORE_ORG = useOrgStore()
  ) {}
  getUrl() {
    /**dữ liệu đính kèm url */
    const QS = this.SERVICE_PARSER.toQueryString({
      locale: this.SERVICE_LOCALE.get(),
      org_id: this.STORE_ORG.selected_org_id,
      token: this.SERVICE_LOCALSTORAGE.getItem('access_token'),
    })

    // trả về url
    return `${$env.host.agent_config}?${QS}`
  }
}
const $main = new Main()
</script>
