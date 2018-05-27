<template lang="pug">
.program-item(
  v-click-outside='onClickOutside'
  @click='onClick'
  :class="selectedClass"
)
  span(v-if='inputMode === false') {{ name }}
  input(
    v-else
    v-model='inputValue'
    @keyup.enter='endRename'
    @keyup.esc='cancelRename'
    ref='input'
    type='text'
  )
</template>

<script>
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
      selectedMode: null,
      onKeyUp: null,
    }
  },
  computed: {
    selectedClass () {
      switch (this.selectedMode) {
        case 'active':
          return 'program-item--selected-active'
        case 'passive':
          return 'program-item--selected-passive'
        default:
          return null
      }
    },
  },
  created () {
    this.onKeyUp = event => {
      if (event.keyCode === 46) {
        this.onPressDelete()
      }
    }
    document.addEventListener('keyup', this.onKeyUp)
  },
  destroyed () {
    document.removeEventListener('keyup', this.onKeyUp)
  },
  watch: {
    selected (value) {
      this.selectedMode = value ? 'active' : null
    },
  },
  methods: {
    onClick () {
      if (this.selectedMode === 'active' && !this.inputMode) {
        this.startRename()
      } else if (this.selectedMode === 'passive') {
        this.selectedMode = 'active'
      } else if (!this.selected) {
        this.select()
      }
    },
    onClickOutside () {
      if (this.inputMode) {
        this.endRename()
      }
      if (this.selectedMode === 'active') {
        this.selectedMode = 'passive'
      }
    },
    onPressDelete () {
      if (!this.inputMode && this.selectedMode === 'active') {
        this.destroy()
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
    endRename () {
      if (this.inputValue.length > 0) {
        this.$emit('rename', this.inputValue)
      }
      this.inputMode = false
    },
    destroy () {
      this.$emit('destroy')
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
  &--selected-passive
    background: #ddd6dd
  &--selected-active, &:hover
    background: #f0f0f0

.program-item > span
  display: inline-block
  padding-bottom: 2px
  user-select: none

.program-item > input
  margin-bottom: -1px
  padding: 0
  padding-bottom: 2px
  border: none
  border-bottom: 1px solid #a3a3a3
  font-size: inherit
  color: inherit
  background: transparent
  outline: 0
</style>
