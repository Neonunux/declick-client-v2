<template lang="pug">
.program-item(
  v-click-outside='cancelRename'
  @click='onClick'
  :class="selected ? 'program-item--selected' : null"
)
  template(v-if='inputMode === false')
    | {{ name }}
  template(v-else)
    input(
      @keyup.enter='validateRename'
      @keyup.esc='cancelRename'
      v-model='inputValue'
      ref='input'
      type='text'
    )
</template>

<script>
import 'font-awesome/css/font-awesome.css'
import ClickOutside from 'vue-click-outside'

export default {
  props: [
    'name',
    'selected',
  ],
  data () {
    return {
      inputMode: false,
      inputValue: null,
    }
  },
  methods: {
    onClick () {
      if (this.selected) {
        this.startRename()
      } else {
        this.select()
      }
    },
    select () {
      this.$emit('select')
    },
    startRename () {
      this.inputMode = true
      this.inputValue = this.name
      this.$nextTick(() => this.$refs.input.focus())
    },
    cancelRename () {
      this.inputMode = false
    },
    validateRename () {
      this.$emit('rename', this.inputValue)
      this.inputMode = false
    },
  },
  directives: {
    ClickOutside,
  },
}
</script>

<style lang="sass">
@import '~@/assets/styles/mixins'

.program-item
  color: #480a2a
  padding: 10px 20px
  cursor: pointer
  &:hover
    background: #ddd6dd

.program-item.program-item--selected
  background: white
</style>
