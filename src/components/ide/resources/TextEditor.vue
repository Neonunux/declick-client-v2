<template lang="pug">
.editor
  .editor__disabled-message(v-show='disabled') {{ $t('message.editor.no-program-opened') }}
</template>

<script>
export default {
  props: [
    'programId'
  ],
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
  font-size: 1em
  color: white
  opacity: 0.3
</style>
