<template lang="pug">
.resource-panel
  program-list(v-show="view === 'programs'")
  asset-list(v-show="view === 'assets'")
  .resource-panel__tabs
    button.resource-panel__programs(@click="view = 'programs'" type='button')
    button.resource-panel__assets(@click="view = 'assets'" type='button')
</template>

<script>
import AssetList from '@/components/ide/AssetList.vue'
import ProgramList from '@/components/ide/ProgramList.vue'

export default {
  data () {
    return {
      view: 'programs',
    }
  },
  components: {
    AssetList,
    ProgramList,
  },
}
</script>

<style lang="sass">
@import '~@/assets/styles/mixins'

.resource-panel
  display: grid
  height: 100%
  grid-template-columns: 230px auto
  grid-template-rows: 100%
  background: #a6a1a6

.resource-panel__tabs
  display: flex
  flex-direction: column
  background: #ddd6dd

.resource-panel__tabs > *
  height: 45px
  width: 65px

.resource-panel
  &__programs
    +image-button('~@/assets/images/programs.png')
  &__assets
    +image-button('~@/assets/images/assets.png')
</style>
