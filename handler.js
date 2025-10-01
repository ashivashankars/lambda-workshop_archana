// handler.js
const AWS = require('aws-sdk');
const S3 = new AWS.S3();
// You would install 'sharp' and use it here for image processing
// const sharp = require('sharp'); 

// The HTTP Endpoint Function (Your existing code)
module.exports.memes = async (event) => {
    // ... (Your HTTP code is correct for this) ...
    const PHRASES = [
        'such code',
        'very serverless',
        'wow much fast deploy', 
        'very cloud expert'
    ];
    
    const randomPhrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Hello from the serverless meme factory!',
            meme_phrase: randomPhrase,
            input_event: event 
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    };
};

// The S3 Triggered Function
module.exports.processImage = async (event) => {
    console.log('Received S3 event:', JSON.stringify(event, null, 2));

    for (const record of event.Records) {
        const srcBucket = record.s3.bucket.name;
        // The key is the file path (e.g., 'uploads/my-image.jpg')
        const srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

        const dstBucket = process.env.OUTPUT_BUCKET_NAME;
        const dstKey = 'processed-' + srcKey; // Naming the new file

        // 1. Get the image from the input bucket
        try {
            const data = await S3.getObject({ Bucket: srcBucket, Key: srcKey }).promise();

            // 2. Perform image processing (e.g., resize using sharp)
            // For a complete workshop, this is where the actual image processing logic goes.
            // Example:
            // const processedImageBuffer = await sharp(data.Body).resize(200, 200).toBuffer();
            const processedImageBuffer = data.Body; // Placeholder: just re-using the original body for now

            // 3. Put the processed image into the output bucket
            await S3.putObject({
                Bucket: dstBucket,
                Key: dstKey,
                Body: processedImageBuffer,
                ContentType: data.ContentType // Keep the original content type
            }).promise();

            console.log(`Successfully processed and saved ${dstKey} to ${dstBucket}`);

        } catch (error) {
            console.error('Error processing image:', error);
            // In a real app, you might re-throw the error or handle it (e.g., send a notification)
        }
    }
};