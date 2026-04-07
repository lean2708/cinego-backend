const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const MovieActor = sequelize.define('MovieActor', {
    movie_id: {
        type: DataTypes.BIGINT,
        references: {
            model: 'Movies',
            key: 'id'
        }
    },
    actor_id: {
        type: DataTypes.BIGINT,
        references: {
            model: 'Actors',
            key: 'id'
        }
    }
}, {
    tableName: 'MovieActors',
    timestamps: false,
});




module.exports = MovieActor;