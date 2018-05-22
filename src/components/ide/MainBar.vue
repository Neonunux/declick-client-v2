<template lang="pug">
.main-bar
  button.main-bar__wiki(type='button')
  button.main-bar__hints(type='button')
  button.main-bar__play(type='button')
  button.main-bar__save(type='button')
</template>

<script>
</script>

<style lang="sass">
@import '~@/assets/styles/mixins'

.main-bar
  height: 50px
  background: #ddd6dd

.main-bar
  & > button
    height: 36px
    width: 36px
    border: 0
  &__wiki
    +image-button('~@/assets/images/play.png')
  &__hints
    +image-button('~@/assets/images/help.png')
  &__play
    +image-button('~@/assets/images/play.png')
  &__save
    +image-button('~@/assets/images/save.png')
</style>
