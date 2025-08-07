const mongoose = require('mongoose');

// Definimos el esquema para coincidir con sample_mflix.movies
const peliculaSchema = new mongoose.Schema({
    title: { type: String, required: true },
    plot: String,
    genres: [String],
    poster: String
}, { collection: 'peliculas' }); // 👈 Muy importante: usar la colección real

module.exports = mongoose.model('Pelicula', peliculaSchema);