const path = require("path");
const dotenv = require("dotenv");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3"); // can uninstall aws-sdk

dotenv.config({
  path: path.join(__dirname, "secrets.env"),
});

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_PUBLIC_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  sslEnabled: false,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});

async function getBuckets() {
  return new Promise((resolve, reject) => {
    s3.listBuckets((err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function upload(bucket) {
  return multer({
    storage: multerS3({
      s3: s3,
      bucket: bucket,
      acl: "public-read",
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      contentType: function (req, file, cb) {
        cb(null, file.mimetype);
      },
      key: function (req, file, cb) {
        cb(null, `${Date.now().toString()}-${file.originalname}`);
      },
    }),
  });
}

module.exports = { upload, getBuckets };
