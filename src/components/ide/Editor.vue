<template lang="pug">
.editor
  .editor__disabled-message(v-show='isDisabledMessage')
    p
      | {{ disabledMessage }}
</template>

<script>
import { EventBus } from '@/utils/EventBus'

export default {
  data () {
    return {
      disabledMessage: 'Create a new program or open it to edit.',
      isDisabledMessage: true
    }
  },
  mounted(){
    EventBus.$on('editor-set-state', editorState => {
      this.isDisabledMessage = editorState
    })
  }
}
</script>

<style lang="sass">
.editor
  background: #141414
  
.editor__disabled-message
  height: 100%
  width: 100%
  display: flex
  align-items: center
  justify-content: center
  color: white
  opacity: 0.3
  font-size: .8em
</style>
