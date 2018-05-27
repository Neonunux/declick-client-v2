<template lang="pug">
.resource-manager
  text-editor.resource-manager__text-editor
  main-bar.resource-manager__main-bar(
    @toggle-help="$emit('toggle-help')"
    :helpVisible='helpVisible'
  )
  resource-panel.resource-manager__resource-panel
</template>

<script>
import MainBar from './MainBar.vue'
import ResourcePanel from './ResourcePanel.vue'
import TextEditor from './TextEditor.vue'

export default {
  props: [
    'helpVisible',
  ],
  components: {
    TextEditor,
    ResourcePanel,
    MainBar,
  },
}
</script>

<style lang="sass">
.resource-manager
  height: 100%
  width: 100%
  display: grid
  box-sizing: border-box
  padding: 9px
  grid-template-areas: 'text-editor resource-panel' 'main-bar resource-panel'
  grid-template-columns: 1fr auto
  grid-template-rows: 1fr auto

.resource-manager__text-editor
  grid-area: text-editor

.resource-manager__main-bar
  grid-area: main-bar

.resource-manager__resource-panel
  grid-area: resource-panel
</style>
