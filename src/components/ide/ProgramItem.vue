<template lang="pug">
.program-item(
  v-click-outside='onClickOutside'
  @click='onClick'
  :class="selectedClass"
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
      documentListener: null,
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
    this.documentListener = event => {
      if (event.keyCode === 46) {
        this.onPressDelete()
      }
    }
    document.addEventListener('keyup', this.documentListener)
  },
  destroyed () {
    document.removeEventListener('keyup', this.documentListener)
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
        this.validateRename()
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
    validateRename () {
      this.$emit('rename', this.inputValue)
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
  &--selected-passive, &:hover
    background: #ddd6dd

.program-item.program-item--selected-active
  background: white
</style>
