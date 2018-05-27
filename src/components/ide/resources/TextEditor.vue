<template lang="pug">
.editor
  .editor__disabled-message(v-show='disabled') {{ disabledMessage }}
</template>

<script>
export default {
  props: [
    'programId'
  ],
  data () {
    return {
      disabledMessage: 'Create a new program or open it to edit.',
    }
  },
  computed: {
    disabled () {
      return !this.programId
    },
  },
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
  font-size: .8em
  color: white
  opacity: 0.3
</style>
