const QRCode = require('qrcode');

const generateQRCode = async (text) => {
    try {
        if (!text) return null;
        
        // Return text URL
        return await QRCode.toDataURL(text, {
            errorCorrectionLevel: 'H',
            type: 'image/jpeg',
            quality: 0.9,
            margin: 1,
            width: 300, 
            color: {
                dark: "#000000",
                light: "#FFFFFF"
            }
        });
    } catch (err) {
        console.error("QR Code Generation Error:", err);
        throw err;
    }
};

module.exports = { generateQRCode };