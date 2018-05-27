<template lang="pug">
.main-bar
  button.main-bar__help(
    @click="$emit('toggle-help')"
    type='button'
    :class="helpVisible ? 'main-bar__help--active': null"
  )
  button.main-bar__hints(type='button')
  button.main-bar__play(type='button')
  button.main-bar__save(type='button')
</template>

<script>
export default {
  props: [
    'helpVisible'
  ],
}
</script>

<style lang="sass">
@import '~@/assets/styles/mixins'

.main-bar
  +items-hgap(9px)
  display: flex
  padding: 9px
  align-items: center
  justify-items: center
  background: #ddd6dd

.main-bar > *
  height: 36px
  width: 36px

//         ,~,
//         )))Y
//        ((((,\________________
//        \)/( [_____________
//        (   \  |  [_]   [_]
//         )___\ |   |     |
//         (| (\ |   |     |
//  ejm    q`_ q`_  _|_   _|_

.main-bar
  &__help
    +image-button('~@/assets/images/buoy.png')
  &__hints
    +image-button('~@/assets/images/help.png')
    margin-right: auto
  &__play
    +image-button('~@/assets/images/play.png')
  &__save
    +image-button('~@/assets/images/save.png')
    margin-left: auto

.main-bar__help--active
  background-image: url('~@/assets/images/buoy-hover.png')
</style>
