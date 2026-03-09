const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Contact = sequelize.define("Contact",{
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },

  senderName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "senderName is required"
      },
      len: {
        args: [2, 100],
        msg: "senderName must be between 2 and 100 characters"
      }
    }
  },

  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Email is required"
      },
      isEmail: {
        msg: "Invalid email format"
      }
    }
  },

  subject: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Subject is required"
      },
      len: {
        args: [5, 200],
        msg: "Subject must be between 5 and 200 characters"
      }
    }
  },

  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Message cannot be empty"
      },
      len: {
        args: [10, 2000],
        msg: "Message must be between 10 and 2000 characters"
      }
    }
  },

  status: {
    type: DataTypes.ENUM("PENDING", "PROCESSING", "RESOLVED"),
    defaultValue: "PENDING"
  },

  repliedBy: {
    type: DataTypes.BIGINT,
    allowNull: true
  },

  is_deleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  }

},
{
  tableName: "contacts",
  timestamps: true
});

module.exports = Contact;