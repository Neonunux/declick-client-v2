<template lang="pug">
.resource-panel(:class='`resource-panel--${view}`')
  program-list(v-show="view === 'programs'")
  asset-list(v-show="view === 'assets'")
  .resource-panel__tabs
    button.resource-panel__switch-programs(@click="view = 'programs'" type='button')
    button.resource-panel__switch-assets(@click="view = 'assets'" type='button')
</template>

<script>
import AssetList from './AssetList.vue'
import ProgramList from './ProgramList.vue'

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

// TODO: Find a better solution to handle buttons active state.

.resource-panel
  &__switch-programs
    +image-button('~@/assets/images/programs.png')
  &__switch-assets
    +image-button('~@/assets/images/assets.png')

.resource-panel--programs
  .resource-panel__switch-programs
    background-color: #a6a1a6
    background-image: url('~@/assets/images/programs-hover.png')

.resource-panel--assets
  .resource-panel__switch-assets
    background-color: #a6a1a6
    background-image: url('~@/assets/images/assets-hover.png')
</style>
