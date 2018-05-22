<template lang="pug">
.ide
  editor.ide__editor
  main-bar.ide__main-bar
  resource-panel.ide__resource-panel
</template>

<script>
import Editor from '@/components/ide/Editor.vue'
import MainBar from '@/components/ide/MainBar.vue'
import ResourcePanel from '@/components/ide/ResourcePanel.vue'

export default {
  components: {
    Editor,
    MainBar,
    ResourcePanel,
  },
}
</script>

<style lang="sass">
.ide
  display: grid
  box-sizing: border-box
  height: 100%
  width: 100%
  padding: 9px
  grid-template-areas: 'editor resource-panel' 'main-bar resource-panel'
  grid-template-columns: 1fr auto
  grid-template-rows: 1fr auto

.ide__editor
  grid-area: editor

.ide__resource-panel
  grid-area: resource-panel

.ide__main-bar
  grid-area: main-bar
</style>
