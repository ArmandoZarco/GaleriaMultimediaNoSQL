const mongoose = require('mongoose');

const MultimediaSchema = new mongoose.Schema({

  titulo: {
    type: String,
    required: true
  },

  descripcion: String,

  imagenUrl: {
    type: String,
    required: true
  },

  audioUrl: {
    type: String,
    required: true
  },

  // NUEVO
  tags: [String],

  fechaCreacion: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model('Multimedia', MultimediaSchema);