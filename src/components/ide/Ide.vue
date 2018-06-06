<template lang="pug">
.ide
  transition(name='ide__help')
    help.ide__help(v-show='helpVisible')
  preview.ide__preview(
    v-show="view === 'preview'" 
    @toggle-help='toggleHelp'
    :helpVisible='helpVisible'
  )
  resource-manager.ide__resource-manager(
    v-show="view === 'resource-manager'"
    @toggle-help='toggleHelp'
    :helpVisible='helpVisible'
  )
</template>

<script>
import Preview from '@/components/ide/preview/Preview.vue'
import ResourceManager from '@/components/ide/resources/ResourceManager.vue'
import Help from './Help.vue'

export default {
  data () {
    return {
      view: 'resource-manager', // 'resource-manager' | 'preview'
      helpVisible: false,
      onKeyUp: null,
    }
  },
  created () {
    this.onKeyUp = event => {
      if (event.ctrlKey && event.keyCode === 13) {
        this.toggleView()
      }
    }
    document.addEventListener('keyup', this.onKeyUp)
  },
  destroyed () {
    document.removeEventListener('keyup', this.onKeyUp)
  },
  methods: {
    toggleHelp () {
      this.helpVisible = !this.helpVisible
    },
    toggleView () {
      this.view = (this.view === 'resource-manager')
        ? 'preview'
        : 'resource-manager'
    },
  },
  components: {
    Help,
    Preview,
    ResourceManager,
  },
}
</script>

<style lang="sass">
.ide
  height: 100%
  width: 100%
  display: grid
  grid-template-areas: 'help content'
  grid-template-columns: auto 1fr
  grid-template-rows: 100%

.ide__help
  width: 350px
  grid-area: help

.ide__preview, .ide__resource-manager
  grid-area: content
</style>
