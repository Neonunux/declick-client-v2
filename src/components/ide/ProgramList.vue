<template lang="pug">
.program-list
  .program-list__content
    program-item(
      v-for='program in orderedPrograms'
      @select='select (program.id)'
      @rename='name => rename (program.name, name)'
      :key='program.id'
      :name='program.name'
      :selected='selectedId === program.id'
    )
  .program-list__controls
    button.program-list__new(@click='createProgram' type='button')
    button.program-list__delete(@click='destroyProgram' type='button')
</template>

<script>
import ProgramItem from '@/components/ide/ProgramItem.vue'

export default {
  data () {
    return {
      programs: [
        { id: 1, name: 'new 1' },
      ],
      selectedId: null,
    }
  },
  methods: {
    select (id) {
      this.selectedId = id
    },
    rename (oldName, newName) {
      this.programs.find(program => program.name === oldName).name = newName
    },
    createProgram () {
      this.programs.push({
        id: this.generateId(),
        name: this.generateName(),
      })
    },
    destroyProgram () {
      this.programs = this.programs.filter(({ id }) => id !== this.selectedId)
      this.selectedId = null
    },
    generateName () {
      let i = 1
      while (this.programs.some(({ name }) => name === `new ${i}`)) {
        i++
      }
      return `new ${i}`
    },
    generateId () {
      let i = 1
      while (this.programs.some(({ id }) => id === i)) {
        i++
      }
      return i
    },
  },
  computed: {
    orderedPrograms () {
      return this.programs.sort((a, b) => a.name.localeCompare(b.name))
    },
  },
  components: {
    ProgramItem,
  },
}
</script>

<style lang="sass">
@import '~@/assets/styles/mixins'

.program-list
  display: grid
  height: 100%
  grid-template-rows: 1fr auto

.program-list__content
  overflow: auto

.program-list__controls
  +items-hgap(9px)
  display: flex
  height: 36px
  padding: 9px
  flex-direction: row
  justify-content: flex-end

.program-list__controls > *
  height: 36px
  width: 36px

.program-list
  &__new
    +image-button('~@/assets/images/new.png')
  &__delete
    +image-button('~@/assets/images/delete.png')
</style>
