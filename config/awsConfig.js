const AWS = require("aws-sdk");

AWS.config.update({ region: "us-east-2" });

const s3 = new AWS.S3({ apiversion: "2006-03-01" });

export async function getBuckets() {
  try {
    const data = await s3.listBuckets();
    console.log(data);
  } catch (err) {
    console.log(err);
  }
}
