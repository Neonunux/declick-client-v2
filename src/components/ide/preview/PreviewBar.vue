<template lang="pug">
.preview-bar
  button.preview-bar__wiki(type='button')
  button.preview-bar__hints(type='button')
  button.preview-bar__design-mode(type='button')
  button.preview-bar__floating-controller(type='button')
</template>

<style lang="sass">
@import '~@/assets/styles/mixins'

.preview-bar
  +items-hgap(9px)
  display: flex
  padding: 9px
  align-items: center
  justify-items: center
  background: #ddd6dd

.preview-bar > *
  height: 36px
  width: 36px

.preview-bar
  &__wiki
    +image-button('~@/assets/images/buoy.png')
  &__hints
    +image-button('~@/assets/images/help.png')
    margin-right: auto
  &__design-mode
    +image-button('~@/assets/images/crane.png')
    margin-left: auto
  &__floating-controller
    +image-button('~@/assets/images/floating_controller.png')
</style>
