# tfjs-yolov5-example

## Usage
Export TensorFlow.js model as described in https://github.com/ultralytics/yolov5/pull/1127

After exported the tfjs model, clone this repo:
```
git clone https://github.com/zldrobit/tfjs-yolov5-example.git
cd tfjs-yolov5-example
```
Install packages with npm:
```
npm install
```
Link YOLOv5 weights directory into public directory:
```
ln -s ../../yolov5/weights public/weights
```
Run YOLOv5 detection web service with:
```
npm start
```

PS: This repo assumes the model input is 320x320.
If you change the `--img` value in exporting `*.pb`, change `modelWidth` and `modelHeight` in `src/index.js` accordingly.

## Reference
https://medium.com/hackernoon/tensorflow-js-real-time-object-detection-in-10-lines-of-code-baf15dfb95b2
