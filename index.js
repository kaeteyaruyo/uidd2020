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

const layer = new Konva.Layer();
stage.add(layer);

const tempLayer = new Konva.Layer();
stage.add(tempLayer);

const timer = new Konva.Circle({
    x: stage.width() * 0.5,
    y: stage.height() * 0.475,
    radius: 400,
    strokeWidth: 5,
    stroke: 'rgb(225, 225, 225)',
    opacity: 0.4,
    fill: null,
});
layer.add(timer);

const loader = new Konva.Arc({
    x: stage.width() * 0.5,
    y: stage.height() * 0.475,
    innerRadius: 396,
    outerRadius: 404,
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
    }
}, layer);

const palette = new Konva.Circle({
    x: stage.width() * 0.5,
    y: stage.height() * 0.475,
    radius: 360,
    stroke: null,
    fill: 'rgb(225, 225, 225)',
    opacity: 0.3,
});
layer.add(palette);

const colors = [
    'rgb(229, 125, 108)', // red
    'rgb(8, 53, 81)',     // blue
    'rgb(95, 141, 142)'   // green
];

const colorLoaders = colors.map(color => new Konva.Arc({
    x: stage.width() * 0.5,
    y: stage.height() * 0.475,
    innerRadius: 0,
    outerRadius: 0,
    angle: 360,
    rotation: -90,
    stroke: null,
    fill: color,
    opacity: 0.3,
}));

colorLoaders.forEach((loader, idx) => {
    layer.add(loader);
    loader.colorIndex = idx;
    loader.toWhole = new Konva.Tween({
        node: loader,
        outerRadius: 360,
        easing: Konva.Easings.EaseOut,
        duration: 0.5,
    });
});

const dropArea = new Konva.Circle({
    x: stage.width() * 0.5,
    y: stage.height() * 0.475,
    radius: 360,
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
    x: stage.width() * (0.35 + 0.15 * idx),
    y: stage.height() * 0.85,
    radius: 50,
    stroke: null,
    fill: color,
    opacity: 0.7,
    draggable: true,
}));

colorOptions.forEach((option, idx) => {
    option.initX = option.x();
    option.initY = option.y();
    option.colorIndex = idx;
    option.on('mouseover', () => {
        document.body.style.cursor = 'pointer';
    });
    option.on('mouseout', () => {
        document.body.style.cursor = 'default';
    });
    layer.add(option);
});

const title = new Konva.Text({
    x: palette.x(),
    y: palette.y(),
    fill: 'rgb(102, 102, 102)',
    text: 'Color your life',
    fontSize: 72,
});
title.offsetX(title.width() * 0.5);
title.offsetY(title.height() * 0.5);
layer.add(title);

let previousShape = null;
let draggingShape = null;

stage.on('dragstart', e => {
    draggingShape = e.target;
    draggingShape.moveTo(tempLayer);
    draggingShape.opacity(1);
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
    if(shape === dropArea){
        e.target.visible(false);
    }
    else {
        e.target.opacity(0.7);
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

const droppedColor = [];
stage.on('drop', async function(e) {
    if(e.target === dropArea){
        palette.visible(false);
        dropArea.highlight.reset();
        droppedColor.push(colorLoaders[draggingShape.colorIndex]);
        if(droppedColor.length === 1){
            droppedColor[0].toWhole.play();
            title.fill('rgb(241, 241, 241)');
            loading.start();
            }
        else if(droppedColor.length === 2){
            droppedColor[1].angle(0);
            droppedColor[1].rotation(90);
            droppedColor[1].outerRadius(360);
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
            droppedColor[2].outerRadius(360);
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

whenFontIsLoaded(function() {
    title.fontFamily('adobe-garamond-pro');
    layer.draw();
});