<template lang="pug">
div
  palette(
    :visible="isPaletteVisible"
    @loaded="openGallery")
  gallery(
    :visible="isGalleryVisible"
    :color="selectedColor"
    :title="title[selectedColor]"
    @close="openPalette")
</template>

<script>
import Palette from '@/components/Palette.vue'
import Gallery from '@/components/Gallery.vue'

export default {
  name: 'App',
  components: {
    Palette,
    Gallery
  },
  data () {
    return {
      isPaletteVisible: true,
      isGalleryVisible: false,
      selectedColor: 'coral',
      title: {
        coral: 'Living Coral',
        blue: 'Living Classic Blue',
        green: 'Living Greenery',
        blue_coral: 'Living Coral x Classic Blue',
        blue_green: 'Living Greenery x Classic Blue',
        coral_green: 'Living Coral x Greenery',
        blue_coral_green: 'Living Coral x Greenery x Classic Blue'
      }
    }
  },
  methods: {
    openGallery (payload) {
      this.selectedColor = payload
      this.isPaletteVisible = false
      this.isGalleryVisible = true
    },
    openPalette () {
      this.isGalleryVisible = false
      this.isPaletteVisible = true
    }
  }
}
</script>

<style lang="scss">
@font-face {
  font-family: harmony;
  src: url('~@/assets/font/harmony/Harmony.ttf');
}

body {
  margin: 0;
  padding: 0;
  position: relative;
  width: 100vw;
  height: 100vh;
  display: grid;
  background-image: url('~@/assets/img/background.png');
  background-size: cover;
  overflow: hidden;
}
</style>
