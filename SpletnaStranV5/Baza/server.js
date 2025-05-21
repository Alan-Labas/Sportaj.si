// server.js

const express = require('express');
const app = express();
const PORT = 3000;
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs'); // Za delo z datotečnim sistemom (shranjevanje slik)

const JWT_SECRET = "MocnoGeslo11";
const REFRESH_TOKEN_SECRET = "MocnoGeslo12";

const bcrypt = require('bcryptjs');
const saltKodiranje = 12;

const fileUpload = require('express-fileupload');

const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: 'geslo', // Prilagodite geslo
        database: 'sportaj_si', // Prilagodite ime baze
    }
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(fileUpload({ createParentPath: true }));

app.use(express.static(path.join(__dirname, '../spletnaStran2')));
app.use('/slike/profilne', express.static(path.join(__dirname, '../spletnaStran2/slike/profilne')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../spletnaStran2/html/index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../spletnaStran2/html/index.html'));
});

app.get('/uredi-profil.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../spletnaStran2/html/uredi-profil.html'));
});

function preveriZeton(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err) {
            console.error('Napaka pri preverjanju dostopnega žetona:', err.message);
            return res.status(403).json({ message: 'Dostopni žeton je neveljaven ali potekel.' });
        }
        if (payload.type !== 'access') {
            console.error('Napačen tip žetona poslan kot dostopni žeton.');
            return res.status(403).json({ message: 'Neveljaven tip dostopnega žetona.' });
        }
        req.uporabnik = payload;
        next();
    });
}

app.get('/api/profil', preveriZeton, async (req, res) => {
    try {
        const uporabnik = await knex('Uporabniki')
            .where({ id: req.uporabnik.userId })
            .select('id', 'username', 'email', 'slika_profila_url')
            .first();

        if (!uporabnik) {
            return res.status(404).json({ message: 'Uporabnik ni najden.' });
        }
        res.json(uporabnik);
    } catch (error) {
        console.error('Napaka pri pridobivanju profila:', error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});

app.put('/api/profil/info', preveriZeton, async (req, res) => {
    const { username, email } = req.body;
    const userId = req.uporabnik.userId;

    if (!username || !email) {
        return res.status(400).json({ message: 'Uporabniško ime in email sta obvezna.' });
    }

    try {
        if (email !== req.uporabnik.email) {
            const obstojecEmail = await knex('Uporabniki').where({ email: email }).whereNot({ id: userId }).first();
            if (obstojecEmail) {
                return res.status(409).json({ message: 'Ta email naslov je že v uporabi.' });
            }
        }
        if (username !== req.uporabnik.username) {
            const obstojeceIme = await knex('Uporabniki').where({ username: username }).whereNot({ id: userId }).first();
            if (obstojeceIme) {
                return res.status(409).json({ message: 'To uporabniško ime je že v uporabi.' });
            }
        }

        await knex('Uporabniki')
            .where({ id: userId })
            .update({ username: username, email: email });

        const novAccessToken = jwt.sign(
            { userId: userId, username: username, email: email, type: 'access' },
            JWT_SECRET,
            { expiresIn: '30m' }
        );

        res.json({ message: 'Podatki uspešno posodobljeni.', accessToken: novAccessToken, uporabnik: { username, email } });
    } catch (error) {
        console.error('Napaka pri posodabljanju informacij o profilu:', error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});

app.put('/api/profil/geslo', preveriZeton, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.uporabnik.userId;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Trenutno in novo geslo sta obvezna.' });
    }

    const gesloRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!gesloRegex.test(newPassword)) {
        return res.status(400).json({ message: 'Novo geslo mora vsebovati vsaj 6 znakov, eno veliko črko in eno številko.' });
    }

    try {
        const uporabnik = await knex('Uporabniki').where({ id: userId }).first();
        if (!uporabnik) {
            return res.status(404).json({ message: 'Uporabnik ni najden.' });
        }

        const pravilnoGeslo = bcrypt.compareSync(currentPassword, uporabnik.geslo);
        if (!pravilnoGeslo) {
            return res.status(401).json({ message: 'Trenutno geslo ni pravilno.' });
        }

        const novoHashiranoGeslo = bcrypt.hashSync(newPassword, saltKodiranje);
        await knex('Uporabniki')
            .where({ id: userId })
            .update({ geslo: novoHashiranoGeslo });

        res.json({ message: 'Geslo uspešno spremenjeno.' });
    } catch (error) {
        console.error('Napaka pri spreminjanju gesla:', error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});

app.post('/api/profil/slika', preveriZeton, async (req, res) => {
    const userId = req.uporabnik.userId;

    if (!req.files || Object.keys(req.files).length === 0 || !req.files.profilePicture) {
        return res.status(400).json({ message: 'Nobena datoteka ni bila naložena.' });
    }

    const profilePicture = req.files.profilePicture;
    const uploadPathBase = path.join(__dirname, '../spletnaStran2/slike/profilne/');
    const fileName = `${userId}_${Date.now()}${path.extname(profilePicture.name)}`;
    const uploadPath = path.join(uploadPathBase, fileName);
    const imageUrl = `/slike/profilne/${fileName}`;

    if (!fs.existsSync(uploadPathBase)) {
        fs.mkdirSync(uploadPathBase, { recursive: true });
    }

    profilePicture.mv(uploadPath, async (err) => {
        if (err) {
            console.error('Napaka pri nalaganju slike:', err);
            return res.status(500).json({ message: 'Napaka pri nalaganju slike.' });
        }

        try {
            await knex('Uporabniki')
                .where({ id: userId })
                .update({ slika_profila_url: imageUrl });

            res.json({ message: 'Profilna slika uspešno naložena.', slika_profila_url: imageUrl });
        } catch (dbError) {
            console.error('Napaka pri shranjevanju poti slike v bazo:', dbError);
            res.status(500).json({ message: 'Napaka pri shranjevanju podatkov o sliki.' });
        }
    });
});

app.post('/api/prijava', async (req, res) => {
    const { email, geslo, rememberMe } = req.body;

    if (!email || !geslo) {
        return res.status(400).json({ message: 'Email in geslo sta obvezna.' });
    }

    try {
        const uporabnik = await knex('Uporabniki').where({ email: email }).first();

        if (uporabnik) {
            const pravilnoGeslo = bcrypt.compareSync(geslo, uporabnik.geslo);
            if (pravilnoGeslo) {
                const accessToken = jwt.sign(
                    { userId: uporabnik.id, username: uporabnik.username, email: uporabnik.email, type: 'access' },
                    JWT_SECRET,
                    { expiresIn: '30m' }
                );

                let osvezilniToken = null;
                if (rememberMe) {
                    osvezilniToken = jwt.sign({ userId: uporabnik.id, type: 'refresh' }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
                    const hashiranOsvezilniToken = bcrypt.hashSync(osvezilniToken, saltKodiranje);
                    const datumPoteka = new Date();
                    datumPoteka.setDate(datumPoteka.getDate() + 7);

                    await knex('osvezilniTokens').where({ user_id: uporabnik.id }).del();
                    await knex('osvezilniTokens').insert({
                        user_id: uporabnik.id,
                        hashiranToken: hashiranOsvezilniToken,
                        expires_at: datumPoteka
                    });
                }

                res.json({
                    message: 'Prijava uspešna!',
                    accessToken: accessToken,
                    ...(osvezilniToken && { osvezilniToken: osvezilniToken }),
                    uporabnik: {
                        userId: uporabnik.id,
                        username: uporabnik.username,
                        email: uporabnik.email,
                        slika_profila_url: uporabnik.slika_profila_url
                    }
                });

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

app.post('/api/token/refresh', async (req, res) => {
    const { osvezilniToken } = req.body;

    if (!osvezilniToken) {
        return res.status(401).json({ message: 'Osvežilni žeton je potreben.' });
    }

    try {
        const dekodiranOsvezilniToken = jwt.verify(osvezilniToken, REFRESH_TOKEN_SECRET);

        if (dekodiranOsvezilniToken.type !== 'refresh') {
            return res.status(403).json({ message: 'Neveljaven tip osvežilnega žetona.' });
        }
        const userId = dekodiranOsvezilniToken.userId;

        const zgodovinaShranjenihTokenov = await knex('osvezilniTokens')
            .where({ user_id: userId })
            .andWhere('expires_at', '>', new Date())
            .select('id', 'hashiranToken');

        let najdenValidiranShranjenToken = false;
        let shranjenTokenId = null;

        for (const record of zgodovinaShranjenihTokenov) {
            if (bcrypt.compareSync(osvezilniToken, record.hashiranToken)) {
                najdenValidiranShranjenToken = true;
                shranjenTokenId = record.id;
                break;
            }
        }

        if (!najdenValidiranShranjenToken) {
            return res.status(403).json({ message: 'Osvežilni žeton ni veljaven, ne obstaja v bazi ali je potekel.' });
        }

        await knex('osvezilniTokens').where({ id: shranjenTokenId }).del();

        const novOsvezilniToken = jwt.sign({ userId: userId, type: 'refresh' }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        const hashiranNovOsvezilniToken = bcrypt.hashSync(novOsvezilniToken, saltKodiranje);
        const novDatumPoteka = new Date();
        novDatumPoteka.setDate(novDatumPoteka.getDate() + 7);

        await knex('osvezilniTokens').insert({
            user_id: userId,
            hashiranToken: hashiranNovOsvezilniToken,
            expires_at: novDatumPoteka
        });

        const uporabnik = await knex('Uporabniki').where({ id: userId }).first();
        if (!uporabnik) {
            return res.status(403).json({ message: 'Povezan uporabnik ne obstaja več.' });
        }

        const novAccesToken = jwt.sign(
            { userId: uporabnik.id, username: uporabnik.username, email: uporabnik.email, type: 'access' },
            JWT_SECRET,
            { expiresIn: '30m' }
        );

        res.json({
            accessToken: novAccesToken,
            osvezilniToken: novOsvezilniToken,
            uporabnik: {
                userId: uporabnik.id,
                username: uporabnik.username,
                email: uporabnik.email,
                slika_profila_url: uporabnik.slika_profila_url
            }
        });

    } catch (error) {
        console.error('Napaka pri osveževanju žetona:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'Osvežilni žeton je potekel (preverjanje JWT).' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: 'Osvežilni žeton ni veljaven (preverjanje JWT).' });
        }
        return res.status(500).json({ message: 'Napaka na strežniku pri osveževanju žetona.' });
    }
});

app.post('/api/odjava', async (req, res) => {
    const { osvezilniToken } = req.body;

    if (!osvezilniToken) {
        return res.status(200).json({ message: 'Odjava: osvežilni žeton ni bil posredovan.' });
    }

    try {
        let userIdFromToken = null;
        try {
            const decoded = jwt.verify(osvezilniToken, REFRESH_TOKEN_SECRET);
            userIdFromToken = decoded.userId;
        } catch (e) {
            console.log("Neveljaven refresh token pri odjavi, morda je že potekel ali pa ni JWT.");
        }

        const zgodovina = await knex('osvezilniTokens')
            .where(builder => {
                if (userIdFromToken) {
                    builder.where({ user_id: userIdFromToken });
                }
            })
            .select('id', 'hashiranToken', 'user_id');

        let steviloIzbrisanihTokenov = 0;
        for (const record of zgodovina) {
            if (bcrypt.compareSync(osvezilniToken, record.hashiranToken)) {
                await knex('osvezilniTokens').where({ id: record.id }).del();
                console.log(`Osvežilni žeton ${record.id} za uporabnika ${record.user_id} izbrisan ob odjavi.`);
                steviloIzbrisanihTokenov++;
                break;
            }
        }

        if (steviloIzbrisanihTokenov > 0) {
            res.status(200).json({ message: 'Odjava uspešna, osvežilni žeton je bil preklican.' });
        } else {
            res.status(200).json({ message: 'Odjava: osvežilni žeton ni bil najden v bazi ali se ne ujema.' });
        }

    } catch (error) {
        console.error('Napaka pri odjavi (brisanje osvežilnega žetona):', error);
        res.status(500).json({ message: 'Napaka na strežniku pri odjavi.' });
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
            username: ime, // Uporabniško ime je 'ime'
            email: email,
            geslo: bcrypt.hashSync(geslo, saltKodiranje),
            JeAdmin: 0,
            // slika_profila_url: '/slike/profilne/default-profile.png' // Dodajte privzeto sliko, če želite
        };
        const [uporabnikId] = await knex('Uporabniki').insert(novUporabnik);
        res.status(201).json({ message: 'Registracija uspešna!', userId: uporabnikId });
    } catch (error) {
        console.error('Napaka pri registraciji:', error);
        res.status(500).json({ message: 'Napaka na strežniku pri registraciji.' });
    }
});

// Samo en klic app.listen
app.listen(PORT, () => {
    console.log(`Strežnik teče na http://localhost:${PORT}`);

    knex.schema.hasTable('osvezilniTokens').then(exists => {
        if (!exists) {
            console.log('Tabela osvezilniTokens ne obstaja, ustvarjam jo...');
            return knex.schema.createTable('osvezilniTokens', table => {
                table.increments('id').primary();
                table.integer('user_id').unsigned().notNullable()
                    .references('id').inTable('Uporabniki').onDelete('CASCADE');
                table.string('hashiranToken').notNullable().unique();
                table.timestamp('expires_at').notNullable();
                table.timestamps(true, true);
            }).then(() => {
                console.log('Tabela osvezilniTokens uspešno ustvarjena.');
            }).catch(err => {
                console.error("Napaka pri ustvarjanju tabele osvezilniTokens:", err);
            });
        } else {
            console.log('Tabela osvezilniTokens že obstaja.');
        }
    }).catch(err => {
        console.error("Napaka pri preverjanju tabele osvezilniTokens:", err);
    });

    knex.schema.hasColumn('Uporabniki', 'slika_profila_url').then(exists => {
        if (!exists) {
            console.log("Stolpec 'slika_profila_url' ne obstaja v tabeli 'Uporabniki', dodajam ga...");
            return knex.schema.alterTable('Uporabniki', table => {
                table.string('slika_profila_url').nullable();
            }).then(() => {
                console.log("Stolpec 'slika_profila_url' uspešno dodan.");
            }).catch(err => {
                console.error("Napaka pri dodajanju stolpca 'slika_profila_url':", err);
            });
        } else {
            console.log("Stolpec 'slika_profila_url' že obstaja v tabeli 'Uporabniki'.");
        }
    }).catch(err => {
        console.error("Napaka pri preverjanju stolpca 'slika_profila_url':", err);
    });
});