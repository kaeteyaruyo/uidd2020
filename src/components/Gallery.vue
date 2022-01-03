<template lang="pug">
div.gallery(:id="color")
  div.gallery__colorbar(:id="`colorbar_${ color }`")
  button.gallery__button.gallery__button--close(@click="closeDisplay()")
    svg(style="width:24px;height:24px" viewBox="0 0 24 24")
      path(fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z")
  h2.gallery__title {{ title }}
  div.gallery__container
    div.gallery__scroller.gallery__scroller--left(@mouseover="moveLeft()")
    div.gallery__scroller.gallery__scroller--right(@mouseover="moveRight()")
    img.gallery__photo(ref="photo" :src="require(`@/assets/img/${ color }.png`)" :alt="title")
  div.gallery__actions
    button.gallery__button.gallery__button--left(@click="moveLeft()")
      svg(style="width:24px;height:24px" viewBox="0 0 24 24")
        path(fill="currentColor" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z")
    button.gallery__button.gallery__button--right(@click="moveRight()")
      svg(style="width:24px;height:24px" viewBox="0 0 24 24")
        path(fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z")
</template>

<script>
export default {
  name: 'Gallery',
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false
    },
    color: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  },
  watch: {
    visible (value) {
      if (value === true) {
        this.$el.classList.add('onoverlay')
      } else {
        this.$el.classList.remove('onoverlay')
      }
    }
  },
  methods: {
    moveLeft () {
      const photo = this.$refs.photo
      photo.style.transform = 'translateX(0px)'
    },
    moveRight () {
      const photo = this.$refs.photo
      const overflow = photo.width - window.innerWidth
      photo.style.transform = `translateX(-${overflow}px)`
    },
    closeDisplay () {
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang="scss">
$red: rgb(200, 89, 61);
$pink: rgb(226, 207, 202);
$green: rgb(95, 141, 142);
$blue: rgb(8, 53, 81);
$grey: rgb(102, 102, 102);

.gallery {
  display: grid;
  grid-template-rows: min-content 10vh min-content 50vh auto;
  position: absolute;
  top: 0;
  margin: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(255, 255, 255, 0.5);
  transform: translateY(100%);
  transition: all 1.5s ease-out;

  &.onoverlay {
    transform: translateY(0);
  }

  .gallery__colorbar {
    width: 25vw;
    min-width: 200px;
    height: 20px;
    justify-self: start;
    align-self: start;
  }

  .gallery__button--close {
    background: none;
    border: none;
    font-size: 32px;
    color: $grey;

    & > svg {
      transform: scale(1.5, 1.5);
    }
  }

  .gallery__title {
    margin: 30px 0;
    font-family: harmony;
    font-size: 120px;
    max-height: 120px;
    font-weight: normal;
    justify-self: center;
    color: $grey;
  }

  .gallery__container {
    position: relative;
    overflow: hidden;
    min-width: 100vw;
    height: 50vh;
  }

  .gallery__scroller {
    position: absolute;
    top: 0;
    width: 33%;
    height: 100%;
    z-index: 2;

    &.gallery__scroller--left {
      left: 0;
    }

    &.gallery__scroller--right {
      right: 0;
    }
  }

  .gallery__photo {
    justify-self: start;
    object-fit: cover;
    min-width: 100vw;
    height: 100%;
    transition: all 2s ease-out;
  }

  .gallery__actions {
    justify-self: center;
    width: 150px;
    display: flex;
    justify-content: space-between;

    .gallery__button {
      align-self: center;
      background: none;
      border: none;
      color: $grey;

      & > svg {
        transform: scale(2, 2);
      }
    }
  }
}

.gallery__button {
  cursor: pointer;
}

#colorbar_coral {
  background-image: linear-gradient(to right, $red, $pink);
}

#colorbar_blue_coral {
  background-image: linear-gradient(to right, $red, $blue);
}

#colorbar_coral_green {
  background-image: linear-gradient(to right, $red, $green);
}

#colorbar_blue_coral_green {
  background-image: linear-gradient(to right, $red, $green, $blue);
}
</style>
