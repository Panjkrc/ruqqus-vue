<template>
  <Popover v-slot="{ open }" class="relative inline-block text-left">
    <PopoverButton class="flex items-center justify-center bg-white border border-dashed group focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 rounded-sm w-[34px] h-[34px]" :style="{ 'color': primaryColor }">
      <i class="fas fa-fill-drip fa-fw"></i>
    </PopoverButton>

    <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="translate-y-1 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-1 opacity-0"
    >
    <PopoverPanel class="absolute right-0 origin-top-right w-56 z-10 mt-2 bg-white border rounded shadow-lg">
      <ul class="inline-flex flex-wrap gap-2 mb-0 p-3">
        <li v-for="swatch in primarySwatches" :key="swatch">
          <label :for="swatch" class="flex flex-shrink-0 w-5 h-5 shadow-inner rounded-sm" :style="{ 'background-color': swatch }">
            <input type="checkbox" class="invisible" :id="swatch" :value="swatch" v-model="primaryColor"/>
          </label>
        </li>
      </ul>
      <div class="flex items-center border-t p-3">
        <div class="uppercase tracking-wide font-semibold leading-none text-2xs text-gray-500">
          Custom
        </div>
        <div class="relative ml-8">
          <input type="color" id="color" name="color" class="w-[18px] h-[23px] rounded-full absolute left-2 top-[6px] bg-transparent" v-model="primaryColor">
          <input type="text" class="form-input light pl-8" :placeholder="primaryColor" v-model="primaryColor"/>
        </div>
      </div>
    </PopoverPanel>
  </transition>
</Popover>
</template>

<script>
  import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'

  export default {
    components: { Popover, PopoverButton, PopoverPanel },
    props: {
      color: String
    },
    data() {
      return {
        primaryColor: '#C53030',
        primarySwatches: ['#C53030', '#F97316', '#ECC94B', '#22C55E', '#14B8A6', '#0EA5E9', '#6366F1', '#8B5CF6', '#EC4899', '#9B2C2C', '#C2410C', '#B7791F','#15803D', '#0F766E', '#0369A1', '#4338CA', '#5B21B6', '#9D174D']
      }
    }
  }
</script>
