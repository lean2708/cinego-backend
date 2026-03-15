const File = require('../models/File');
const AppError = require('../utils/appError');
const { uploadToCloudinary } = require('../utils/uploadFile');



const rootFolder = process.env.CLOUDINARY_FOLDER_NAME;


const uploadImage = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            throw new AppError(400, 'Please provide at least one image file.');
        }

        console.log("Received a request to upload image");

        const files = req.files;
        const isAllImages = files.every(file => file.mimetype.startsWith('image/'));
        if (!isAllImages) {
            throw new AppError(400, 'One or more files provided are not images.');
        }

        const folderName = `${rootFolder}/images`;
        
        // Upload image 
        const uploadPromises = files.map(file => 
            uploadToCloudinary(file.buffer, folderName, 'image')
        );

        const cloudinaryResults = await Promise.all(uploadPromises);

        // Convert data
        const dbData = cloudinaryResults.map((result, index) => ({
            public_id: result.public_id,
            url: result.secure_url,
            original_filename: files[index].originalname,
            resource_type: 'image',
            uploader_id: req.user.id
        }));

        // Save database
        const newFiles = await File.bulkCreate(dbData);

        console.log("Successfully uploaded ", newFiles.length," images.");

        res.status(201).json({
           success : true,
            message: 'Image uploaded successfully',
            data: newFiles
        });

    } catch (error) {
        next(error);
    }
};



const uploadVideo = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            throw new AppError(400, 'Please provide at least one video file.');
        }

        console.log("Received a request to upload video");

        const files = req.files;
        const isAllVideos = files.every(file => file.mimetype.startsWith('video/'));
        if (!isAllVideos) {
            throw new AppError(400, 'One or more files provided are not videos.');
        }

        const folderName = `${rootFolder}/videos`;

        // Upload video
        const uploadPromises = files.map(file => 
            uploadToCloudinary(file.buffer, folderName, 'video')
        );

        const cloudinaryResults = await Promise.all(uploadPromises);

        // Convert data
        const dbData = cloudinaryResults.map((result, index) => ({
            public_id: result.public_id,
            url: result.secure_url,
            original_filename: files[index].originalname,
            resource_type: 'video',
            uploader_id: req.user.id
        }));

        // Save Database
        const newFiles = await File.bulkCreate(dbData);

        console.log("Successfully uploaded ", newFiles.length," video.");

        return res.status(201).json({
            success : true,
            message: 'Video uploaded successfully',
            data: newFiles
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadImage,
    uploadVideo
};