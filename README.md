# Image Cropping Library

### Set up:
You will need browser-sync
```
npm install -g browser-sync
```
Serve folder with broswer-sync and allow hot reloads.
```
browser-sync start --server --files="**/*"
```

### How to use this library
You will need these dom elements in place before running image cropping library.
```
<canvas id="canvas"></canvas>
<img src="#" alt="your image" id="img-cropped" width="100%" />
```
In your javascript, create new canvas object from image croppping library 
which takes two arguments: 
1) canvasId - id of the canvas element you have added to your html.
2) croppedImageId - id of the image element which will show the newly cropped image.
```
let canvas = new Canvas([canvasId], coppedImageId);
```
Last you will need to send the canvas object your image data.
```
canvas.imgSrc = imageData;
```
Once this is done the image cropping will render your image and allow you to crop it using your mouse.
