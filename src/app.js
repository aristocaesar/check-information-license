require("dotenv").config();
const express = require("express");
const app = express();
const { upload } = require("./middleware/upload.middleware");
const { MulterError } = require("multer");
const middleUpload = upload.single("image");
const { GoogleAuth } = require("google-auth-library");
const { DocumentProcessorServiceClient } =
  require("@google-cloud/documentai").v1;

// Configuration cloud
const auth = new GoogleAuth({
  keyFilename: "./src/credential.json",
  scopes: "https://www.googleapis.com/auth/cloud-platform",
});
const client = new DocumentProcessorServiceClient({ auth });
const name = `projects/${process.env.PROJECT_ID}/locations/${process.env.LOCATION}/processors/${process.env.PROCESSOR_ID}`;

const processDocument = async (request) => {
  const [resultRaw] = await client.processDocument(request);
  const { document } = resultRaw;

  let index = 1;
  const result = {};
  const entities = document.entities;
  for (const entity of entities) {
    if (entity.mentionText != "") {
      index++;
      result[entity.type] = entity.mentionText;
    }
  }
  return index == 12 ? result : {};
};

app.post("/api/v1/check-information-license", (request, response) => {
  middleUpload(request, response, async function (error) {
    try {
      if (request.file != undefined) {
        const encodedImage = request.file.buffer.toString("base64");

        const result = await processDocument({
          name,
          rawDocument: {
            content: encodedImage,
            mimeType: "image/jpeg",
          },
        });

        return response.status(200).json({
          status: 200,
          data: result,
        });
      } else if (error instanceof MulterError) {
        throw new Error(error.message);
      } else if (error || request.file == undefined) {
        throw new Error("An unknown error occurred when uploading.");
      }
    } catch (error) {
      return response.status(400).json({
        status: 400,
        message: error.message,
      });
    }
  });
});

module.exports = { App: app };
