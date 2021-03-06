const ctx = document.createElement('canvas').getContext('2d');
ctx.font = 'normal 20px adobe-garamond-pro';
const TEXT_TEXT = 'Some test text;';
const initialWidth = ctx.measureText(TEXT_TEXT).width;
let isFontLoaded = false;

function whenFontIsLoaded(callback, attemptCount = 0) {
    if (attemptCount >= 20) {
        callback();
        return;
    }
    if (isFontLoaded) {
        callback();
        return;
    }
    if (ctx.measureText(TEXT_TEXT).width !== initialWidth) {
        isFontLoaded = true;
        callback();
    }
    else {
        setTimeout(function() {
            whenFontIsLoaded(callback, attemptCount + 1);
        }, 100);
    }
}

const stage = new Konva.Stage({
    container: 'main__palette',
    width: window.innerWidth,
    height: window.innerHeight,
});
stage.initWidth = stage.width();
stage.initHeight = stage.height();

const layer = new Konva.Layer();
stage.add(layer);

const tempLayer = new Konva.Layer();
stage.add(tempLayer);

const circleRadius = Math.min(400, window.innerWidth / 2 - 10, window.innerHeight / 2 - 10);
const timer = new Konva.Circle({
    x: stage.width() * 0.5,
    y: stage.height() * 0.475,
    radius: circleRadius,
    strokeWidth: 5,
    stroke: 'rgb(225, 225, 225)',
    opacity: 0.4,
    fill: null,
});
layer.add(timer);

const loader = new Konva.Arc({
    x: stage.width() * 0.5,
    y: stage.height() * 0.475,
    innerRadius: circleRadius - 4,
    outerRadius: circleRadius + 4,
    angle: 0,
    rotation: -90,
    stroke: null,
    fill: 'rgb(255, 255, 255)',
});
layer.add(loader);

const angularSpeed = 360 / 5;
const loading = new Konva.Animation(function(frame) {
    loader.angle(loader.angle() + (frame.timeDiff * angularSpeed) / 1000);
    if(loader.angle() >= 360){
        loading.stop();
        loader.angle(0);
        openDisplay();
    }
}, layer);

const palette = new Konva.Circle({
    x: stage.width() * 0.5,
    y: stage.height() * 0.475,
    radius: circleRadius - 40,
    stroke: null,
    fill: 'rgb(225, 225, 225)',
    opacity: 0.3,
});
layer.add(palette);

const colors = [
    {
        hex:  'rgb(229, 125, 108)',
        name: 'coral',
    },
    {
        hex:  'rgb(8, 53, 81)',
        name: 'blue',
    },
    {
        hex:  'rgb(95, 141, 142)',
        name: 'green',
    },
];

const colorLoaders = colors.map(color => new Konva.Arc({
    name: color.name,
    x: stage.width() * 0.5,
    y: stage.height() * 0.475,
    innerRadius: 0,
    outerRadius: 0,
    angle: 360,
    rotation: -90,
    stroke: null,
    fill: color.hex,
    opacity: 0.3,
}));

colorLoaders.forEach((loader, idx) => {
    layer.add(loader);
    loader.colorIndex = idx;
    loader.toWhole = new Konva.Tween({
        node: loader,
        outerRadius: circleRadius - 40,
        easing: Konva.Easings.EaseOut,
        duration: 0.5,
    });
});

const dropArea = new Konva.Circle({
    x: stage.width() * 0.5,
    y: stage.height() * 0.475,
    radius: circleRadius - 40,
    stroke: null,
    fill: 'rgb(255, 255, 255)',
    opacity: 0,
});
layer.add(dropArea);

dropArea.highlight = new Konva.Tween({
    node: dropArea,
    opacity: 0.2,
    easing: Konva.Easings.EaseOut,
    duration: 0.25,
});

const colorOptions = colors.map((color, idx) => new Konva.Circle({
    x: stage.width() * 0.5 + (idx - 1) * circleRadius * 0.6,
    y: stage.height() * 0.85,
    radius: circleRadius * 0.15,
    stroke: null,
    fill: color.hex,
    opacity: 0.7,
    draggable: true,
}));

colorOptions.forEach((option, idx) => {
    option.initX = option.x();
    option.initY = option.y();
    option.colorIndex = idx;
    layer.add(option);
    option.highlight = new Konva.Tween({
        node: option,
        opacity: 1,
        easing: Konva.Easings.EaseOut,
        duration: 0.25,
    });
    option.on('mouseover', () => {
        document.body.style.cursor = 'pointer';
        option.highlight.play();
    });
    option.on('mouseout', () => {
        document.body.style.cursor = 'default';
        option.highlight.reverse();
    });
});

const title = new Konva.Text({
    x: palette.x(),
    y: palette.y(),
    fill: 'rgb(102, 102, 102)',
    text: 'Color your life',
    fontSize: circleRadius * 0.2,
});
title.offsetX(title.width() * 0.5);
title.offsetY(title.height() * 0.5);
layer.add(title);

let previousShape = null;
let draggingShape = null;

stage.on('dragstart', e => {
    draggingShape = e.target;
    draggingShape.moveTo(tempLayer);
    layer.draw();
    document.body.style.cursor = 'move';
});

stage.on('dragmove', e => {
    const shape = layer.getIntersection(stage.getPointerPosition());
    if (previousShape && shape) {
        if (previousShape !== shape) {
            previousShape.fire(
                'dragleave',
                {
                    type: 'dragleave',
                    target: previousShape,
                    evt: e.evt
                },
                true
            );
            shape.fire(
                'dragenter',
                {
                    type: 'dragenter',
                    target: shape,
                    evt: e.evt
                },
                true
            );
            previousShape = shape;
        }
        else {
            previousShape.fire(
                'dragover',
                {
                    type: 'dragover',
                    target: previousShape,
                    evt: e.evt
                },
                true
            );
        }
    }
    else if (!previousShape && shape) {
        previousShape = shape;
        shape.fire(
            'dragenter',
            {
                type: 'dragenter',
                target: shape,
                evt: e.evt
            },
            true
        );
    }
    else if (previousShape && !shape) {
        previousShape.fire(
            'dragleave',
            {
                type: 'dragleave',
                target: previousShape,
                evt: e.evt
            },
            true
        );
        previousShape = undefined;
    }
});

stage.on('dragend', e => {
    const shape = layer.getIntersection(stage.getPointerPosition());
    if (shape) {
        previousShape.fire(
            'drop',
            {
                type: 'drop',
                target: previousShape,
                evt: e.evt
            },
            true
        );
    }
    if(shape === dropArea || shape === title){
        e.target.visible(false);
    }
    previousShape = null;
    e.target.x(e.target.initX);
    e.target.y(e.target.initY);
    e.target.moveTo(layer);
    layer.draw();
    tempLayer.draw();
    document.body.style.cursor = 'default';
});

stage.on('dragenter', function(e) {
    if(e.target === dropArea){
        dropArea.highlight.play();
    }
    layer.draw();
});

stage.on('dragleave', function(e) {
    if(e.target === dropArea){
        dropArea.highlight.reverse();
    }
    layer.draw();
});

stage.on('dragover', function(e) {
    layer.draw();
});

let droppedColor = [];
stage.on('drop', function(e) {
    if(e.target === dropArea || e.target === title){
        palette.visible(false);
        dropArea.highlight.reset();
        droppedColor.push(colorLoaders[draggingShape.colorIndex]);
        if(droppedColor.length === 1){
            document.querySelector('#main__shadow').className = 'onoverlay';
            droppedColor[0].toWhole.play();
            title.fill('rgb(241, 241, 241)');
            loading.start();
        }
        else if(droppedColor.length === 2){
            droppedColor[1].angle(0);
            droppedColor[1].rotation(90);
            droppedColor[1].outerRadius(circleRadius - 40);
            droppedColor[1].scaleX(-1);
            droppedColor.forEach(loader => {
                loader.toHalf = new Konva.Tween({
                    node: loader,
                    angle: 180,
                    easing: Konva.Easings.EaseOut,
                    duration: 0.5,
                });
                loader.toHalf.play();
            });
        }
        else if(droppedColor.length === 3){
            droppedColor[1].scaleX(1);
            droppedColor[2].angle(0);
            droppedColor[2].rotation(90);
            droppedColor[2].outerRadius(circleRadius - 40);
            droppedColor[2].scaleX(-1);
            droppedColor.forEach((loader, idx) => {
                loader.toHalf = null;
                loader.toThird = new Konva.Tween({
                    node: loader,
                    angle: 120,
                    rotation: -90 + (60 * (!!idx) + 60 * idx),
                    easing: Konva.Easings.EaseOut,
                    duration: 0.5,
                });
                loader.toThird.play();
            });
        }
        draggingShape = null;
    }
    layer.draw();
});

function openDisplay(){
    document.querySelector(`#${ droppedColor.map(loader => loader.name()).sort((a, b) => a > b ? 1 : -1).join('_') }`).classList.add('onoverlay');
    document.querySelector('#main__palette').className = 'onoverlay';
}

function moveLeft(){
    const image = document.querySelector('.onoverlay .display__gallery--image');
    image.style.transform = 'translateX(0px)';
}

function moveRight(){
    const image = document.querySelector('.onoverlay .display__gallery--image');
    let overflow = image.width - window.innerWidth;
    image.style.transform = `translateX(-${ overflow }px)`
}

function closeDisplay(){
    colorOptions.forEach(option => {
        option.visible(true);
    });
    colorLoaders.forEach(loader => {
        loader.outerRadius(0);
        loader.angle(360);
        loader.rotation(-90);
        loader.scaleX(1);
    });
    droppedColor = [];
    palette.visible(true);
    title.fill('rgb(102, 102, 102)');
    layer.draw();

    const elements = Array.from(document.querySelectorAll('.onoverlay'))
    elements.forEach(element => element.classList.remove('onoverlay'));
}

function fitStageIntoParentContainer() {
    const scale = document.querySelector('body').offsetWidth / stage.initWidth;
    stage.width(stage.initWidth * scale);
    stage.height(stage.initHeight * scale);
    stage.scale({ x: scale, y: scale });
    stage.draw();
}

whenFontIsLoaded(function() {
    title.fontFamily('adobe-garamond-pro');
    layer.draw();
});

fitStageIntoParentContainer();
window.addEventListener('resize', fitStageIntoParentContainer);