import React from "react";
import ReactDOM from "react-dom";
import MagicDropzone from "react-magic-dropzone";

import "./styles.css";
const tf = require('@tensorflow/tfjs');

const weights = '/web_model/model.json';

const names = ['person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light',
               'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow',
               'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
               'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard',
               'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
               'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
               'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone',
               'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear',
               'hair drier', 'toothbrush']

class App extends React.Component {
  state = {
    model: null,
    preview: "",
    predictions: []
  };

  componentDidMount() {
    tf.loadGraphModel(weights).then(model => {
      this.setState({
        model: model
      });
    });
  }

  onDrop = (accepted, rejected, links) => {
    this.setState({ preview: accepted[0].preview || links[0] });
  };

  cropToCanvas = (image, canvas, ctx) => {
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    // canvas.width = image.width;
    // canvas.height = image.height;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const ratio = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const newWidth = Math.round(naturalWidth * ratio);
    const newHeight = Math.round(naturalHeight * ratio);
    ctx.drawImage(
      image,
      0,
      0,
      naturalWidth,
      naturalHeight,
      (canvas.width - newWidth) / 2,
      (canvas.height - newHeight) / 2,
      newWidth,
      newHeight,
    );

  };

  onImageChange = e => {
    const c = document.getElementById("canvas");
    const ctx = c.getContext("2d");
    this.cropToCanvas(e.target, c, ctx);
    let [modelWidth, modelHeight] = this.state.model.inputs[0].shape.slice(1, 3);
    const input = tf.tidy(() => {
      return tf.image.resizeBilinear(tf.browser.fromPixels(c), [modelWidth, modelHeight])
        .div(255.0).expandDims(0);
    });
    this.state.model.executeAsync(input).then(res => {
      // Font options.
      const font = "16px sans-serif";
      ctx.font = font;
      ctx.textBaseline = "top";

      const [boxes, scores, classes, valid_detections] = res;
      const boxes_data = boxes.dataSync();
      const scores_data = scores.dataSync();
      const classes_data = classes.dataSync();
      const valid_detections_data = valid_detections.dataSync()[0];

      tf.dispose(res)

      var i;
      for (i = 0; i < valid_detections_data; ++i){
        let [x1, y1, x2, y2] = boxes_data.slice(i * 4, (i + 1) * 4);
        x1 *= c.width;
        x2 *= c.width;
        y1 *= c.height;
        y2 *= c.height;
        const width = x2 - x1;
        const height = y2 - y1;
        const klass = names[classes_data[i]];
        const score = scores_data[i].toFixed(2);

        // Draw the bounding box.
        ctx.strokeStyle = "#00FFFF";
        ctx.lineWidth = 4;
        ctx.strokeRect(x1, y1, width, height);

        // Draw the label background.
        ctx.fillStyle = "#00FFFF";
        const textWidth = ctx.measureText(klass + ":" + score).width;
        const textHeight = parseInt(font, 10); // base 10
        ctx.fillRect(x1, y1, textWidth + 4, textHeight + 4);

      }
      for (i = 0; i < valid_detections_data; ++i){
        let [x1, y1, , ] = boxes_data.slice(i * 4, (i + 1) * 4);
        x1 *= c.width;
        y1 *= c.height;
        const klass = names[classes_data[i]];
        const score = scores_data[i].toFixed(2);

        // Draw the text last to ensure it's on top.
        ctx.fillStyle = "#000000";
        ctx.fillText(klass + ":" + score, x1, y1);

      }
    });
  };

  render() {
    return (
      <div className="Dropzone-page">
        {this.state.model ? (
          <MagicDropzone
            className="Dropzone"
            accept="image/jpeg, image/png, .jpg, .jpeg, .png"
            multiple={false}
            onDrop={this.onDrop}
          >
            {this.state.preview ? (
              <img
                alt="upload preview"
                onLoad={this.onImageChange}
                className="Dropzone-img"
                src={this.state.preview}
              />
            ) : (
              "Choose or drop a file."
            )}
            <canvas id="canvas" width="640" height="640" />
          </MagicDropzone>
        ) : (
          <div className="Dropzone">Loading model...</div>
        )}
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
