require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const Multimedia = require('./Multimedia');

const app = express();

app.use(cors());
app.use(express.json());

// Servir carpeta uploads
app.use('/uploads', express.static('uploads'));

// Configuración de Multer
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }

});

const upload = multer({ storage });

console.log('URI cargada:', process.env.MONGODB_URI);

// Conexión MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('MongoDB conectado correctamente');
})
.catch((error) => {
    console.log('Error de conexión:', error);
});

// Mostrar index.html
app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, 'index.html'));

});

// ==========================
// CREATE
// ==========================

app.post(
    '/api/multimedia',

    upload.fields([
        { name: 'imagen', maxCount: 1 },
        { name: 'audio', maxCount: 1 }
    ]),

    async (req, res) => {

        try {

            const {
                titulo,
                descripcion,
                tags
            } = req.body;

            const listaTags = tags
                ? tags.split(',').map(tag => tag.trim())
                : [];

            const imagenUrl =
                '/uploads/' + req.files.imagen[0].filename;

            const audioUrl =
                '/uploads/' + req.files.audio[0].filename;

            const nuevoElemento = new Multimedia({

                titulo,
                descripcion,
                imagenUrl,
                audioUrl,
                tags: listaTags

            });

            await nuevoElemento.save();

            console.log('Documento guardado en MongoDB');

            res.redirect('/');

        } catch (error) {

            console.error(error);

            res.status(500).send('Error al guardar');

        }

    }
);

// ==========================
// READ
// ==========================

app.get('/api/multimedia', async (req, res) => {

    try {

        const elementos = await Multimedia.find();

        res.json(elementos);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Error al obtener elementos'
        });

    }

});

// ==========================
// UPDATE
// ==========================

app.put('/api/multimedia/:id', async (req, res) => {

    try {

        const { titulo, descripcion } = req.body;

        await Multimedia.findByIdAndUpdate(

            req.params.id,

            {
                titulo,
                descripcion
            }

        );

        console.log('Elemento actualizado');

        res.json({
            mensaje: 'Elemento actualizado correctamente'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Error al actualizar'
        });

    }

});

// ==========================
// DELETE
// ==========================

app.delete('/api/multimedia/:id', async (req, res) => {

    try {

        await Multimedia.findByIdAndDelete(req.params.id);

        console.log('Elemento eliminado');

        res.json({
            mensaje: 'Elemento eliminado correctamente'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Error al eliminar'
        });

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Servidor corriendo en puerto ${PORT}`);

});