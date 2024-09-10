const path = require("path");
const dotenv = require("dotenv");
const multer = require("multer");
const multerS3 = require("multer-s3");
const {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3"); // can uninstall aws-sdk
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

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

async function getUrl(bucket, filename) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: filename,
    });

    // Generate the presigned URL
    const url = await getSignedUrl(s3, command, { expiresIn: 28800 }); // 8 hours
    return url;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function deleteFile(bucket, filename) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: filename,
    });

    const response = await s3.send(command);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = { upload, getBuckets, getUrl, deleteFile };
