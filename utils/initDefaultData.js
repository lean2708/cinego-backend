const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createDefaultAdmin = async () => {
    try {

        const adminName = process.env.DEFAULT_ADMIN_NAME;
        const adminPhone = process.env.DEFAULT_ADMIN_PHONE;
        const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
        const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;

        const existingAdmin = await User.findOne({
            where: { email: adminEmail }
        });

        if (existingAdmin) {
            console.log(`--- Admin account (${adminEmail}) already exists. Skipping creation. ---`);
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        await User.create({
            full_name: adminName,
             gender: 'MALE',
             phone: adminPhone,
             email: adminEmail,
             password_hash: hashedPassword,
             role: 'ADMIN',
             dob: '2000-01-01'
            });

        console.log(">>> INIT ADMIN CREATED SUCCESSFULLY:");
        console.log(`>>> Full Name: ${adminName}`);
        console.log(`>>> Email:     ${adminEmail}`);
        console.log(`>>> Password:  ${adminPassword}`);

    } catch (error) {
        console.error('Error creating default admin:', error);
    }
};

module.exports = createDefaultAdmin;