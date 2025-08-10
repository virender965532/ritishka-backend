// helper/s3Helper.js
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

const uploadToS3 = (file, folderPath) => {
  const fileExtension = file.originalname.split('.').pop();
  const key = `${folderPath}/${uuidv4()}.${fileExtension}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  return s3.upload(params).promise();
};

const uploadImageToS3 = (file, folderPath = 'categories') => {
  return uploadToS3(file, folderPath);
};

const uploadVideoToS3 = (file, folderPath = 'videos') => {
  return uploadToS3(file, folderPath);
};

// Modified to return only the key (directory/filename) instead of full URL
const uploadToS3ReturnKey = (file, folderPath) => {
  const fileExtension = file.originalname.split('.').pop();
  const key = `${folderPath}/${uuidv4()}.${fileExtension}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  return s3.upload(params).promise().then(result => ({
    ...result,
    Key: key // Return the key instead of Location
  }));
};

const uploadImageToS3ReturnKey = (file, folderPath = 'categories') => {
  return uploadToS3ReturnKey(file, folderPath);
};

const uploadVideoToS3ReturnKey = (file, folderPath = 'videos') => {
  return uploadToS3ReturnKey(file, folderPath);
};

const deleteFromS3 = (fileUrl) => {
  if (!fileUrl) return Promise.resolve();
  
  // Handle both full URLs and keys
  let key;
  if (fileUrl.includes('amazonaws.com')) {
    // Full URL - extract key
    key = fileUrl.split(`${BUCKET_NAME}/`)[1];
  } else {
    // Already a key
    key = fileUrl;
  }

  if (!key) return Promise.resolve(); // If no key, do nothing

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  return s3.deleteObject(params).promise();
};

const deleteImageFromS3 = (imageUrl) => {
  return deleteFromS3(imageUrl);
};

const deleteVideoFromS3 = (videoUrl) => {
  return deleteFromS3(videoUrl);
};

module.exports = { 
  uploadImageToS3, 
  uploadVideoToS3, 
  uploadToS3,
  uploadImageToS3ReturnKey,
  uploadVideoToS3ReturnKey,
  uploadToS3ReturnKey,
  deleteImageFromS3, 
  deleteVideoFromS3,
  deleteFromS3
};
