<template lang="pug">
div.palette
  span.test-text some test text
  v-stage(
    ref="stage"
    :config="configuration.stage"
    @dragstart="onDragStart"
    @dragmove="onDragMove"
    @dragend="onDragEnd"
    @drop="onDrop")
    v-layer(ref="layer")
      v-circle(ref="timer" :config="configuration.timer")
      v-arc(ref="loader" :config="configuration.loader")
      v-circle(ref="palette" :config="configuration.palette")
      v-arc(
        v-for="(color, index) in colors"
        ref="colorLoaders"
        :key="`loader-${color.name}`"
        :config="configuration.colorLoaders[index]")
      v-circle(
        ref="dropArea"
        :config="configuration.dropArea"
        @dragenter="onDropAreaEnter"
        @dragleave="onDropAreaLeave")
      v-circle(
        v-for="(color, index) in colors"
        ref="colorOptions"
        :key="`option-${color.name}`"
        :config="configuration.colorOptions[index]"
        @mouseover="onOptionMouseOver"
        @mouseout="onOptionMouseOut")
      v-text(ref="title" :config="configuration.title")
    v-layer(ref="tempLayer")
  div.shadow(ref="shadow")
    img(src='@/assets/img/shadow.png')
</template>

<script>
import Konva from 'konva'

// Define constants
const width = window.innerWidth
const height = window.innerHeight
const centerX = width * 0.5
const centerY = height * 0.475
const circleRadius = Math.min(400, width / 2 - 10, height / 2 - 10)
const angularSpeed = 360 / 5
const white = 'rgb(225, 225, 225)'
const grey = 'rgb(102, 102, 102)'

export default {
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  data () {
    return {
      colors: [
        {
          RGBValue: 'rgb(229, 125, 108)',
          name: 'coral'
        },
        {
          RGBValue: 'rgb(8, 53, 81)',
          name: 'blue'
        },
        {
          RGBValue: 'rgb(95, 141, 142)',
          name: 'green'
        }
      ],
      loadingAnimation: null,
      previousShape: null,
      draggingShape: null,
      selectedColorOptions: []
    }
  },
  computed: {
    configuration () {
      return {
        stage: {
          width: width,
          height: height
        },
        timer: {
          x: centerX,
          y: centerY,
          radius: circleRadius,
          strokeWidth: 5,
          stroke: white,
          opacity: 0.4,
          fill: null
        },
        loader: {
          x: centerX,
          y: centerY,
          innerRadius: circleRadius - 4,
          outerRadius: circleRadius + 4,
          angle: 0,
          rotation: -90,
          stroke: null,
          fill: white
        },
        palette: {
          x: centerX,
          y: centerY,
          radius: circleRadius - 40,
          stroke: null,
          fill: white,
          opacity: 0.3
        },
        colorLoaders: this.colors.map((color, index) => ({
          name: color.name,
          x: centerX,
          y: centerY,
          innerRadius: 0,
          outerRadius: 0,
          angle: 360,
          rotation: -90,
          stroke: null,
          fill: color.RGBValue,
          opacity: 0.3,
          colorIndex: index
        })),
        dropArea: {
          x: centerX,
          y: centerY,
          radius: circleRadius - 40,
          stroke: null,
          fill: white,
          opacity: 0
        },
        colorOptions: this.colors.map((color, index) => ({
          x: centerX + (index - 1) * circleRadius * 0.6,
          y: height * 0.85,
          radius: circleRadius * 0.15,
          stroke: null,
          fill: color.RGBValue,
          opacity: 0.7,
          draggable: true,
          initX: centerX + (index - 1) * circleRadius * 0.6,
          initY: height * 0.85,
          colorIndex: index
        })),
        title: {
          x: -1000,
          y: -1000,
          fill: grey,
          text: 'Color your life',
          fontSize: circleRadius * 0.2
        }
      }
    },
    stage () {
      return this.$refs.stage.getNode()
    },
    layer () {
      return this.$refs.layer.getNode()
    },
    tempLayer () {
      return this.$refs.tempLayer.getNode()
    },
    timer () {
      return this.$refs.timer.getNode()
    },
    loader () {
      return this.$refs.loader.getNode()
    },
    palette () {
      return this.$refs.palette.getNode()
    },
    dropArea () {
      return this.$refs.dropArea.getNode()
    },
    colorLoaders () {
      return this.$refs.colorLoaders.map(element => element.getNode())
    },
    colorOptions () {
      return this.$refs.colorOptions.map(element => element.getNode())
    },
    title () {
      return this.$refs.title.getNode()
    },
    isDroppable () {
      return shape => (shape === this.dropArea || shape === this.title)
    },
    selectedColor () {
      return this.selectedColorOptions.map(loader => loader.name()).sort((a, b) => a > b ? 1 : -1).join('_')
    }
  },
  methods: {
    waitForFontLoaded () {
      // Observe the width of test text to know when the font resource is loaded.
      // Width of a text will change when its font resource is loaded.
      // Once the font is loaded, set up title.
      const resizeObserver = new ResizeObserver(this.setupTitle)
      resizeObserver.observe(document.querySelector('.test-text'))
    },
    setupTitle () {
      this.title.fontFamily('adobe-garamond-pro')
      this.title.x(this.palette.x())
      this.title.y(this.palette.y())
      this.title.offsetX(this.title.width() * 0.5)
      this.title.offsetY(this.title.height() * 0.5)
    },
    setupLoadingAnimation () {
      this.loadingAnimation = new Konva.Animation(frame => {
        this.loader.angle(this.loader.angle() + (frame.timeDiff * angularSpeed) / 1000)
        if (this.loader.angle() >= 360) {
          this.loadingAnimation.stop()
          this.loader.angle(0)
          this.$emit('loaded', this.selectedColor)
        }
      }, this.layer)
    },
    fireEvent (eventName, subject, event) {
      subject.fire(
        eventName,
        {
          type: eventName,
          target: subject,
          evt: event.evt
        },
        true
      )
    },
    onOptionMouseOver (event) {
      document.body.style.cursor = 'pointer'
      // Make the color of hovered colorOption opaque.
      event.target.to({
        opacity: 1,
        duration: 0.25,
        easing: Konva.Easings.EaseOut
      })
    },
    onOptionMouseOut (event) {
      document.body.style.cursor = 'default'
      // Make the color of hovered colorOption translucent.
      event.target.to({
        opacity: 0.7,
        duration: 0.25,
        easing: Konva.Easings.EaseOut
      })
    },
    onDropAreaEnter (event) {
      // When user drag an option onto drop area, make the color of the area translucent
      // to give user a visual cue that this is a droppable area.
      event.target.to({
        opacity: 0.2,
        duration: 0.25,
        easing: Konva.Easings.EaseOut
      })
    },
    onDropAreaLeave (event) {
      // When user drag an option and leave the drop area, make the color of the area transparent.
      event.target.to({
        opacity: 0,
        duration: 0.25,
        easing: Konva.Easings.EaseOut
      })
    },
    onDragStart (event) {
      this.draggingShape = event.target
      this.draggingShape.moveTo(this.tempLayer)
      document.body.style.cursor = 'move'
    },
    onDragMove (event) {
      const draggedOverShape = this.layer.getIntersection(this.stage.getPointerPosition())
      if (this.previousShape && draggedOverShape) {
        if (this.previousShape !== draggedOverShape) {
          this.fireEvent('dragleave', this.previousShape, event)
          this.fireEvent('dragenter', draggedOverShape, event)
          this.previousShape = draggedOverShape
        } else {
          this.fireEvent('dragover', this.previousShape, event)
        }
      } else if (!this.previousShape && draggedOverShape) {
        this.fireEvent('dragenter', draggedOverShape, event)
        this.previousShape = draggedOverShape
      } else if (this.previousShape && !draggedOverShape) {
        this.fireEvent('dragleave', this.previousShape, event)
        this.previousShape = null
      }
    },
    onDragEnd (event) {
      const draggedOverShape = this.layer.getIntersection(this.stage.getPointerPosition())
      if (this.isDroppable(draggedOverShape)) {
        this.draggingShape.visible(false)
      }
      this.draggingShape.x(this.draggingShape.attrs.initX)
      this.draggingShape.y(this.draggingShape.attrs.initY)
      this.draggingShape.moveTo(this.layer)

      if (draggedOverShape) {
        this.fireEvent('drop', this.previousShape, event)
      }
      this.previousShape = null
      document.body.style.cursor = 'default'
    },
    onDrop (event) {
      const droppedShape = event.target
      if (this.isDroppable(droppedShape)) {
        this.palette.visible(false)
        this.dropArea.opacity(0)
        this.selectedColorOptions.push(this.colorLoaders[this.draggingShape.attrs.colorIndex])
        if (this.selectedColorOptions.length === 1) {
          this.$refs.shadow.classList.add('onoverlay')
          this.title.fill('rgb(241, 241, 241)')
          this.selectedColorOptions[0].toWhole = new Konva.Tween({
            node: this.selectedColorOptions[0],
            outerRadius: circleRadius - 40,
            easing: Konva.Easings.EaseOut,
            duration: 0.75
          })
          this.selectedColorOptions[0].toWhole.play()
          this.loadingAnimation.start()
        } else if (this.selectedColorOptions.length === 2) {
          this.selectedColorOptions[1].angle(0)
          this.selectedColorOptions[1].rotation(90)
          this.selectedColorOptions[1].outerRadius(circleRadius - 40)
          this.selectedColorOptions[1].scaleX(-1)
          this.selectedColorOptions.forEach(loader => {
            loader.toHalf = new Konva.Tween({
              node: loader,
              angle: 180,
              easing: Konva.Easings.EaseOut,
              duration: 0.75
            })
            loader.toHalf.play()
          })
        } else if (this.selectedColorOptions.length === 3) {
          this.selectedColorOptions[1].scaleX(1)
          this.selectedColorOptions[2].angle(0)
          this.selectedColorOptions[2].rotation(90)
          this.selectedColorOptions[2].outerRadius(circleRadius - 40)
          this.selectedColorOptions[2].scaleX(-1)
          this.selectedColorOptions.forEach((loader, idx) => {
            loader.toHalf = null
            loader.toThird = new Konva.Tween({
              node: loader,
              angle: 120,
              rotation: -90 + (60 * (!!idx) + 60 * idx),
              easing: Konva.Easings.EaseOut,
              duration: 0.75
            })
            loader.toThird.play()
          })
        }
        this.draggingShape = null
      }
    },
    resetPalette () {
      // Reset the position of canvas and shadow
      this.$el.classList.remove('onoverlay')
      this.$refs.shadow.classList.remove('onoverlay')

      // Reset the position of colorOptions
      this.colorOptions.forEach(option => {
        option.visible(true)
      })

      // Reset the appearance of colorLoaders
      this.colorLoaders.forEach(loader => {
        loader.outerRadius(0)
        loader.angle(360)
        loader.rotation(-90)
        loader.scaleX(1)
      })

      // Empty selectedColorOptions
      this.selectedColorOptions = []

      // Make palette (the solid white circle) visible
      this.palette.visible(true)

      // Reset color of the title text to grey
      this.title.fill(grey)
    },
    fitStageIntoParentContainer () {
      const scale = document.querySelector('body').offsetWidth / width
      this.stage.width(width * scale)
      this.stage.height(height * scale)
      this.stage.scale({ x: scale, y: scale })
    }
  },
  watch: {
    visible (value) {
      // When the palette become visible (being opened), reset everything in the palette.
      // When the palette become invisible (being closed), slide the palette upward.
      if (value === true) {
        this.resetPalette()
      } else {
        // Slide the palette upward using css transition.
        this.$el.classList.add('onoverlay')
      }
    }
  },
  mounted () {
    this.waitForFontLoaded()
    this.setupLoadingAnimation()
    this.fitStageIntoParentContainer()
    window.addEventListener('resize', this.fitStageIntoParentContainer)
  }
}
</script>

<style lang="scss" scoped>
.palette {
  display: grid;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  transform: translateY(0);
  transition: all 1.5s ease-out;

  &.onoverlay {
    transform: translateY(-100%);
  }

  .test-text {
    visibility: hidden;
    font-family: adobe-garamond-pro;
  }

  .shadow {
    display: grid;
    position: fixed;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    top: -2.5%;
    transform: scale(0, 0);
    transition: all 1.5s ease-out;

    &.onoverlay {
      transform: scale(2.5, 2.5);
    }

    & > img {
      justify-self: center;
      align-self: center;
      border-radius: 50%;
      width: 100vh;
      height: 100vh;
    }
  }
}
</style>

<style>
.konvajs-content {
  justify-self: center;
  align-self: center;
}
</style>
