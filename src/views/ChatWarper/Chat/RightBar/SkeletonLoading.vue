<template>
  <div
    class="w-[400px] flex-shrink-0 h-full flex flex-col gap-2 overflow-hidden"
  >
    <div
      v-for="i in 3"
      :key="i"
      class="rounded-lg bg-white overflow-hidden flex-shrink-0 flex flex-col border-none border-slate-100"
      :class="{
        'flex-grow': i === 1,
      }"
    >
      <div
        class="w-full py-2.5 px-3 flex items-center justify-between bg-white"
        :class="{
          'border-b border-slate-50': i === 1,
        }"
      >
        <div class="w-32 h-4 bg-slate-200 rounded animate-pulse"></div>
        <div class="flex gap-3">
          <div class="size-8 bg-slate-200 rounded animate-pulse"></div>
        </div>
      </div>
      <div
        v-if="i === 1"
        class="w-full flex-grow bg-slate-50 animate-pulse"
      ></div>
    </div>
  </div>
</template>
