const express = require('express');
const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: '127.0.0.1',
        user: 'root', // Prilagodite po potrebi
        password: 'Smetar245', // Prilagodite po potrebi
        database: 'sportaj_si',
    }
});
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


app.use(express.static(path.join(__dirname, '../spletnaStran2')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../spletnaStran2/html/index.html'));
});

app.post('/api/prijava', async (req, res) => {
    const { email, geslo } = req.body;

    if (!email || !geslo) {
        return res.status(400).json({ message: 'Email in geslo sta obvezna.' });
    }

    try {
        const uporabnik = await knex('Uporabniki').where({ email: email }).first();

        if (uporabnik) {
            if (uporabnik.geslo === geslo) {
                const dummyToken = 'testni_jwt_token_12345';
                res.json({ message: 'Prijava uspešna!', token: dummyToken, userId: uporabnik.id, username: uporabnik.username });
            } else {
                res.status(401).json({ message: 'Napačen email ali geslo.' });
            }
        } else {
            res.status(401).json({ message: 'Napačen email ali geslo.' });
        }
    } catch (error) {
        console.error('Napaka pri prijavi:', error);
        res.status(500).json({ message: 'Napaka na strežniku pri prijavi.' });
    }
});

app.post('/api/registracija', async (req, res) => {
    const { ime, priimek, email, geslo } = req.body;

    if (!ime || !email || !geslo) {
        return res.status(400).json({ message: 'Ime, email in geslo so obvezni.' });
    }

    try {
        const obstojecUporabnik = await knex('Uporabniki').where({ email: email }).first();
        if (obstojecUporabnik) {
            return res.status(409).json({ message: 'Uporabnik s tem emailom že obstaja.' });
        }

        const novUporabnik = {
            username: ime,
            email: email,
            geslo: geslo,
            JeAdmin: 0
        };

        const [uporabnikId] = await knex('Uporabniki').insert(novUporabnik);
        res.status(201).json({ message: 'Registracija uspešna!', userId: uporabnikId });

    } catch (error) {
        console.error('Napaka pri registraciji:', error);
        res.status(500).json({ message: 'Napaka na strežniku pri registraciji.' });
    }
});

app.listen(PORT, () => {
    console.log(`Strežnik teče na http://localhost:${PORT}`);
});