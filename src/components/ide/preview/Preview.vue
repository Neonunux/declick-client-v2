<template lang="pug">
.preview
	canvas.preview__canvas
	preview-bar
</template>

<script>
import PreviewBar from '@/components/ide/preview/PreviewBar.vue'

export default {
  components: {
    PreviewBar,
  },
}
</script>

<style lang="sass">
.preview
  display: grid
  height: 100%
  width: 100%
  padding: 9px
  box-sizing: border-box
  grid-template-rows: 1fr auto

.preview__canvas
	height: 100%
	width: 100%
	background-color: white
</style>
