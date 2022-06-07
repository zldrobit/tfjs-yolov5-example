const tf = require("@tensorflow/tfjs");
const tfn = require("@tensorflow/tfjs-node");
const handler = tfn.io.fileSystem("./public/web_model/model.json");

async function run() {
  console.log(tf.getBackend());
  const img = tf.ones([1, 640, 640, 3]).toFloat();
  const model = await tf.loadGraphModel(handler);
  const prediction = await model.executeAsync(img);
  console.log(prediction);
}

run();
