const multer = require("multer");
const storageConfiguration = multer.memoryStorage({
  destination: (request, file, callback) => {
    callback(null, "");
  },
});

module.exports = { upload: multer({ storage: storageConfiguration }) };
