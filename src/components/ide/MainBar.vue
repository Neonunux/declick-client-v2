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
  display: flex
  align-items: center
  justify-items: center
  background: #ddd6dd

.main-bar > *
  height: 36px
  width: 36px
  margin: 9px
  border: 0
  cursor: pointer
  outline: 0

.main-bar
  & > * + *
    margin-left: 0

/*
             .-----.
            /       `\
          _|_         |
         /   \        |
         '==='        |
         . ' .        |
        . : ' .       |
           '.         |
       . '    .       |
        .-"""-.       |
       /  \___ \      |
       |/`    \|      |
       (  a  a )      |
       |   _\ |       |
       )\  =  /       |
   _.-'  '---;        |
 /`           `-.     |
|                \    |
|    |   .  & .   \   |
\    /      &   |  ;  |
|   |           |  ;  |
|   /\          /  |  |
\   \ )   -:-  /\  \  |
 `.  `-.  -:-  | \  \_|
   '-.  `-.    (  './\`\
    / `'-. `\  |    \/_/
    |    \  |  |      |
    |    /'-\  /      |
     \   \   | |      |
      \   )_/\ |      |
       \      \|      |
        \      \      |
         '.     |     |
           /   /      |
          /  .';      |
        /`  /  |      |
       /   /   |      |
 jgs  |  .' \  |      |
      /  \  )  |      |
      \   \ /  '-.._  |
       '.ooO\__._.Ooo |
*/

.main-bar
  &__wiki
    +image-button('~@/assets/images/wiki.png')
  &__hints
    +image-button('~@/assets/images/help.png')
    margin-right: auto
  &__play
    +image-button('~@/assets/images/play.png')
  &__save
    +image-button('~@/assets/images/save.png')
    margin-left: auto
</style>
