<template lang="pug">
.program-list
  .program-list__content
    program-item(
      v-for='program in orderedPrograms'
      @select='select (program.id)'
      @rename='name => renameProgram(program.id, name)'
      @destroy='destroyProgram(program.id)'
      :key='program.id'
      :name='program.name'
      :selected='selectedId === program.id'
    )
  .program-list__controls
    button.program-list__new(@click='createProgram' type='button')
    button.program-list__delete(@click='destroySelectedProgram' type='button')
</template>

<script>
import ProgramItem from '@/components/ide/resources/ProgramItem.vue'

export default {
  data () {
    return {
      programs: [
        { id: 1, name: 'new 01' },
        { id: 2, name: 'new 02' },
        { id: 3, name: 'new 03' },
        { id: 4, name: 'new 04' },
        { id: 5, name: 'new 05' },
      ],
      selectedId: null,
    }
  },
  methods: {
    select (id) {
      this.selectedId = id
    },
    renameProgram (id, newName) {
      this.programs.find(program => program.id === id).name = newName
    },
    createProgram () {
      this.programs.push({
        id: this.generateId(),
        name: this.generateName(),
      })
    },
    destroySelectedProgram () {
      this.destroyProgram(this.selectedId)
    },
    destroyProgram (id) {
      this.programs = this.programs.filter(program => program.id !== id)
      if (this.selectedId === id) {
        this.selectedId = null
      }
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
