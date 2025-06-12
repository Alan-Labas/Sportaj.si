// ==========================================================
// server.js - POPRAVLJENA IN VARNA RAZLIČICA ZA PRODUKCIJO
// Uporablja okoljske spremenljivke in varno SSL povezavo z Azure
// ==========================================================

// --- Osnovni moduli ---
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

// --- Varnost in avtentikacija ---
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fileUpload = require('express-fileupload');

// --- Komunikacija in Baza ---
const nodemailer = require('nodemailer');
const knexDriver = require('knex');

// --- Konfiguracija okoljskih spremenljivk ---
// To mora biti na samem vrhu, da so spremenljivke na voljo povsod
//require('dotenv').config();

// --- Inicializacija Express in Socket.IO ---
const app = express();
const server = http.createServer(app);
const io = new Server(server);
require('dotenv').config();

// --- Konstante iz .env datoteke ---
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'MocnoGeslo1';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'MocnoGeslo2';
//const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const saltKodiranje = 12;

// --- Nastavitev Knex povezave z Azure bazo ---
const knex = knexDriver({
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT,
        timezone: '+00:00',
    }
});

// Preverimo povezavo z bazo ob zagonu
knex.raw('SELECT 1').then(() => {
    console.log('Uspešno povezan z Azure bazo podatkov!');
}).catch((err) => {
    console.error('NAPAKA PRI POVEZOVANJU Z AZURE BAZO PODATKOV:', err);
    process.exit(1);
});


// --- Nodemailer transporter ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Uporabite App Password, če imate 2FA
    },
    tls: {
        rejectUnauthorized: false
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('Napaka pri povezovanju z e-poštnim strežnikom:', error);
    } else {
        console.log('E-poštni strežnik je pripravljen za pošiljanje sporočil.');
    }
});


// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({ createParentPath: true }));

app.use((req, res, next) => {
    console.log(`[LOGGER] ${req.method} ${req.originalUrl} | Status: ${res.statusCode}`);
    next();
});

// Postrežba statičnih datotek iz 'www' mape
app.use(express.static(path.join(__dirname, '../www')));


// ===============================================
// === API TOČKE (Endpoints) =====================
// ===============================================
// Vsa vaša obstoječa koda za API točke pride sem.
// Ker se ta del ni spreminjal, ga lahko preprosto
// prekopirate iz vaše obstoječe datoteke.
// Začnite od:
// app.get('/', (req, res) => { ... });
// in končajte pred:
// io.on('connection', (socket) => { ... });
// ===============================================

// Za primer sem vključil eno pot, da vidite, kje se začne
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../www/html/index.html'));
});

// ... TUKAJ VSTAVITE VSE VAŠE OBSTOJEČE app.get, app.post, app.put, app.delete TOČKE ...
// (Pustil sem originalno kodo od tukaj naprej, kot ste jo poslali)

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../www/html/index.html'));
});
app.get('/uredi-profil.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../www/html/uredi-profil.html'));
});
app.get('/prijava.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../www/html/prijava.html'));
});
app.get('/registracija.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../www/html/registracija.html'));
});
app.get('/pozabljeno-geslo.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../www/html/pozabljeno-geslo.html'));
});
app.get('/ponastavi-geslo.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../www/html/ponastavi-geslo.html'));
});
app.get('/search-stran.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../www/html/search-stran.html'));
});
app.get('/profilTrener.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../www/html/profilTrener.html'));
});
app.get('/admin-panel.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../www/html/admin-panel.html'));
});
app.get('/pregledAktivnosti.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../www/html/pregledAktivnosti.html'));
});
app.get('/pregledSporta.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../www/html/pregledSporta.html'));
});
app.get('/postani-trener.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../www/html/postani-trener.html'));
});
app.get('/dodaj-aktivnost.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../www/html/dodaj-aktivnost.html'));
});

function normalizirajImgPath(originalPath, defaultPath = '/slike/placeholder.png') {
    if (originalPath === null || originalPath === undefined) {
        return defaultPath;
    }
    if (typeof originalPath === 'string' && originalPath.startsWith('data:image')) {
        return originalPath;
    }
    if (Buffer.isBuffer(originalPath)) {
        const isEmptyBuffer = originalPath.every(byte => byte === 0);
        if (originalPath.length === 0 || isEmptyBuffer) {
            return defaultPath;
        }
        let mimeType = 'image/png';
        if (originalPath.length > 2 && originalPath[0] === 0xFF && originalPath[1] === 0xD8 && originalPath[2] === 0xFF) {
            mimeType = 'image/jpeg';
        }
        return `data:${mimeType};base64,${originalPath.toString('base64')}`;
    }
    if (typeof originalPath === 'string') {
        if (originalPath.trim() === '') return defaultPath;
        if (originalPath.startsWith('http://') || originalPath.startsWith('https://')) {
            return originalPath;
        }
        if (!originalPath.startsWith('/')) {
            return `/${originalPath}`;
        }
        return originalPath;
    }
    return defaultPath;
}

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
function preveriZetonOpcijsko(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        req.uporabnik = null; // Uporabnik ni prijavljen, a nadaljujemo
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err || payload.type !== 'access') {
            req.uporabnik = null; // Žeton je neveljaven, a nadaljujemo
        } else {
            req.uporabnik = payload; // Uporabnik je prijavljen
        }
        next();
    });
}


function preveriAdmin(req, res, next) {
    if (!req.uporabnik) {
        return res.status(401).json({ message: 'Napaka pri avtentikaciji.' });
    }
    if (req.uporabnik.JeAdmin !== 1 && req.uporabnik.JeAdmin !== true) {
        return res.status(403).json({ message: 'Dostop zavrnjen. Zahtevane so administratorske pravice.' });
    }
    next();
}

function preveriAdminAliTrener(req, res, next) {
    if (!req.uporabnik) {
        console.error('[AVTORIZACIJA NAPAKA] Objekt req.uporabnik ni na voljo.');
        return res.status(401).json({ message: 'Napaka pri avtentikaciji: podatki o uporabniku manjkajo.' });
    }
    const jeAdmin = req.uporabnik.JeAdmin === 1 || req.uporabnik.JeAdmin === true;
    const jeTrener = req.uporabnik.jeTrener === 1 || req.uporabnik.jeTrener === true;
    if (!jeAdmin && !jeTrener) {
        console.log(`[AVTORIZACIJA ZAVRNJENA] Uporabnik ${req.uporabnik.username || req.uporabnik.email} (JeAdmin: ${req.uporabnik.JeAdmin}, jeTrener: ${req.uporabnik.jeTrener}) nima ustreznih pravic.`);
        return res.status(403).json({ message: 'Dostop zavrnjen. Zahtevane so administratorske ali trenerske pravice.' });
    }
    next();
}

function preveriTrener(req, res, next) {
    if (!req.uporabnik) {
        return res.status(401).json({ message: 'Napaka pri avtentikaciji.' });
    }
    if (req.uporabnik.jeTrener !== 1 && req.uporabnik.jeTrener !== true) {
        return res.status(403).json({ message: 'Dostop zavrnjen. Zahtevane so trenerske pravice.' });
    }
    next();
}

// === API TOČKE ZA ŠPORTE ===
app.get('/api/vsi-sporti', async (req, res) => {
    try {
        const sporti = await knex('Sport').select('id', 'Sport as ime_sporta', 'Opis as opis_sporta');
        const sportiSlike = sporti.map(s => {
            const imageName = s.ime_sporta.toLowerCase().replace(/\s+/g, '-').replace(/[čć]/g, 'c').replace(/[š]/g, 's').replace(/[ž]/g, 'z');
            return {
                ...s,
                slika: normalizirajImgPath(`../slike/${imageName}.png`, '../slike/default-sport.png')
            };
        });
        res.json(sportiSlike);
    } catch (error) {
        console.error('Napaka pri pridobivanju vseh športov:', error);
        res.status(500).json({ message: 'Napaka na strežniku pri pridobivanju športov.' });
    }
});

app.get('/api/sport/:id/details', async (req, res) => {
    const { id } = req.params;
    try {
        const sport = await knex('Sport').where({ id }).first();
        if (!sport) {
            return res.status(404).json({ message: 'Šport ni najden.' });
        }
        const sportDetails = {
            id: sport.id,
            ime_sporta: sport.Sport,
            opis_sporta: sport.Opis,
        };
        const aktivnosti = await knex('Sportna_Aktivnost as sa')
            .leftJoin('Trenerji as t', 'sa.TK_Trener', 't.id')
            .leftJoin('Uporabniki as u', 't.TK_Uporabnik', 'u.id')
            .where({ 'sa.TK_TipAktivnosti': id })
            .select('sa.id', 'sa.Naziv', 'sa.Lokacija', 'sa.Cena', 'sa.slika as slika_aktivnosti',
                't.ime as trener_ime', 't.priimek as trener_priimek', 'u.slika as slika_trenerja_profilna')
            .limit(10);
        const aktivnostiSpremenjeneSlike = aktivnosti.map(akt => ({
            ...akt,
            slika_aktivnosti: normalizirajImgPath(akt.slika_aktivnosti, '../slike/default-sport.png'),
            slika_trenerja_profilna: normalizirajImgPath(akt.slika_trenerja_profilna, '../slike/default-profile.png')
        }));
        res.json({ ...sportDetails, aktivnosti: aktivnostiSpremenjeneSlike });
    } catch (error) {
        console.error(`Napaka pri pridobivanju podrobnosti športa ${id}:`, error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});

// === API TOČKA ZA ISKANJE ===
app.get('/api/search/:table', async (req, res) => {
    const { table } = req.params;
    const filters = { ...req.query };
    const allowedTables = ['sport', 'Sportna_Aktivnost', 'trenerji'];
    if (!allowedTables.includes(table)) {
        return res.status(400).json({ error: `Tabela ${table} ni dostopna za iskanje`, filters });
    }
    try {
        let queryBuilder;
        let defaultImgPath = '/slike/placeholder.png';

        if (table === 'trenerji') {
            defaultImgPath = '../slike/default-profile.png';
            queryBuilder = knex('Trenerji as t')
                .join('Uporabniki as u', 't.TK_Uporabnik', 'u.id')
                .select('t.id', 't.ime', 't.priimek', 't.OpisProfila as specializacija', 't.urnik', 't.email as kontakt_email', 't.telefon', 't.Lokacija as lokacija_trenerja', 'u.username as uporabnisko_ime_prijave', 'u.slika as slika_profila');
            if (filters.term) {
                queryBuilder.where(builder =>
                    builder.where('t.ime', 'like', `%${filters.term}%`)
                        .orWhere('t.priimek', 'like', `%${filters.term}%`)
                        .orWhere('t.OpisProfila', 'like', `%${filters.term}%`)
                        .orWhere('u.username', 'like', `%${filters.term}%`)
                );
            }
            if (filters.location) {
                queryBuilder.where('t.Lokacija', 'like', `%${filters.location}%`);
            }
            if (filters.sportType) {
                queryBuilder.whereExists(function() {
                    this.select('*').from('TrenerSport as ts')
                        .join('Sport as s_filter', 'ts.TK_Sport', 's_filter.id')
                        .whereRaw('ts.TK_Trener = t.id')
                        .andWhere('s_filter.Sport', filters.sportType);
                });
            }
        } else if (table === 'Sportna_Aktivnost') {
            defaultImgPath = '../slike/default-sport.png';
            queryBuilder = knex('Sportna_Aktivnost as sa')
                .join('Sport as s', 'sa.TK_TipAktivnosti', 's.id')
                .leftJoin('Trenerji as t', 'sa.TK_Trener', 't.id')
                .select('sa.id', 'sa.Naziv as ime_aktivnosti', 'sa.Opis as opis_aktivnosti', 'sa.Lokacija as lokacija_aktivnosti', 'sa.Cena as cena', 'sa.ProstaMesta as prosta_mesta', 'sa.slika', 's.Sport as ime_sporta', 'sa.Datum_Cas_Izvedbe as datum_zacetka', knex.raw("CONCAT(t.ime, ' ', t.priimek) as ime_trenerja"));
            if (filters.term) {
                queryBuilder.where(builder =>
                    builder.where('sa.Naziv', 'like', `%${filters.term}%`)
                        .orWhere('sa.Opis', 'like', `%${filters.term}%`)
                        .orWhere('s.Sport', 'like', `%${filters.term}%`)
                );
            }
            if (filters.location) {
                queryBuilder.where('sa.Lokacija', 'like', `%${filters.location}%`);
            }
            if (filters.minPrice) queryBuilder.where('sa.Cena', '>=', parseFloat(filters.minPrice));
            if (filters.maxPrice) queryBuilder.where('sa.Cena', '<=', parseFloat(filters.maxPrice));
            if (filters.sportType) queryBuilder.where('s.Sport', filters.sportType);

            if (filters.tip && (filters.tip === 'individualno' || filters.tip === 'skupinsko')) {
                queryBuilder.where('sa.Nacin_Izvedbe', filters.tip);
            }
            if (filters.datum === 'danes') {
                queryBuilder.whereRaw('DATE(sa.Datum_Cas_Izvedbe) = CURDATE()');
            }

        } else if (table === 'sport') {
            defaultImgPath = '../slike/default-sport.png';
            queryBuilder = knex('Sport').select('id', 'Sport as ime_sporta', 'Opis as opis_sporta');
            if (filters.term) {
                queryBuilder.where(builder =>
                    builder.where('Sport', 'like', `%${filters.term}%`)
                        .orWhere('Opis', 'like', `%${filters.term}%`)
                );
            }
            if (filters.sportType) {
                queryBuilder.where('Sport', 'like', `%${filters.sportType}%`);
            }
        }

        const searchResult = await queryBuilder;
        const formattedResult = searchResult.map(item => {
            let itemDefaultImg = defaultImgPath;
            if (table === 'trenerji') itemDefaultImg = '../slike/default-profile.png';
            else if (table === 'Sportna_Aktivnost') itemDefaultImg = '../slike/default-sport.png';
            else if (table === 'sport') itemDefaultImg = '../slike/default-sport.png';
            let finalSlikaPath;
            const slikaField = table === 'trenerji' ? item.slika_profila : item.slika;
            if (table === 'sport') {
                const imageName = item.ime_sporta ? item.ime_sporta.toLowerCase().replace(/\s+/g, '-').replace(/[čć]/g, 'c').replace(/[š]/g, 's').replace(/[ž]/g, 'z') : 'default-sport';
                finalSlikaPath = normalizirajImgPath(`../slike/${imageName}.png`, itemDefaultImg);
            } else {
                finalSlikaPath = normalizirajImgPath(slikaField, itemDefaultImg);
            }
            return { ...item, slika: finalSlikaPath };
        });
        res.json([formattedResult, filters]);
    } catch (error) {
        console.error('Napaka pri poizvedbi v bazi med iskanjem: ', error);
        res.status(500).json({ error: 'Interna napaka strežnika pri iskanju.', details: error.message, filters });
    }
});
app.post('/api/komentiraj', preveriZeton, async (req, res) => {
    try {
        const komentar = req.body.komentar;
        const userId = req.uporabnik.userId;
        const activityId = req.body.activityId;
        if (!komentar || !activityId) {
            return res.status(400).json({ status: 'error', message: 'Komentar in ID aktivnosti sta obvezna.' });
        }
        await knex('Komentarji').insert({ komentar: komentar, TK_Uporabnik: userId, TK_Aktivnost: activityId, Datum_Komentarja: new Date() });
        res.status(201).json({ status: 'success', message: 'Komentar uspešno dodan.' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', message: 'Napaka pri shranjevanju komentarja.' });
    }
});

app.get('/api/getKomentarji', async (req, res) => {
    try {
        const activityId = req.query.activityId;
        if (!activityId) {
            return res.status(400).json({ napaka: 'Manjka ID aktivnosti.' });
        }
        const comments = await knex('Komentarji')
            .join('Uporabniki', 'Komentarji.TK_Uporabnik', 'Uporabniki.id')
            .select('Komentarji.id as komentar_id', 'Komentarji.komentar', 'Komentarji.Datum_Komentarja as datum', 'Uporabniki.username', 'Uporabniki.slika as slika_uporabnika')
            .where('Komentarji.TK_Aktivnost', activityId)
            .orderBy('Komentarji.Datum_Komentarja', 'desc');
        const processedComments = comments.map(comment => ({
            ...comment,
            slika_uporabnika: normalizirajImgPath(comment.slika_uporabnika, '../slike/default-profile.png')
        }));
        res.json(processedComments);
    } catch (error) {
        console.error("Napaka pri pridobivanju komentarjev:", error);
        res.status(500).json({ napaka: 'Napaka na strežniku pri pridobivanju komentarjev.' });
    }
});

// === API TOČKE ZA ŠPORTNE AKTIVNOSTI (javne, za search-stran) ===
app.get('/api/prihajajoce-dejavnosti', async (req, res) => {
    try {
        const aktivnosti = await knex('Sportna_Aktivnost as sa')
            .join('Sport as s', 'sa.TK_TipAktivnosti', 's.id')
            .select('sa.id', 'sa.Naziv as ime_aktivnosti', 'sa.Opis as opis_aktivnosti', 'sa.Lokacija as lokacija_aktivnosti', 'sa.Cena as cena', 'sa.ProstaMesta as prosta_mesta', 'sa.slika', 's.Sport as ime_sporta', 'sa.Datum_Cas_Izvedbe as datum_zacetka')
            .where('sa.Datum_Cas_Izvedbe', '>=', knex.raw('NOW()'))
            .orderBy('sa.Datum_Cas_Izvedbe', 'asc')
            .limit(12);
        const obdelaneAktivnosti = aktivnosti.map(a => ({
            ...a,
            slika: normalizirajImgPath(a.slika, '../slike/default-sport.png')
        }));
        res.json(obdelaneAktivnosti);
    } catch (error) {
        console.error('Napaka pri pridobivanju prihajajočih dejavnosti (search):', error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});

app.get('/api/dejavnosti-okolica', async (req, res) => {
    try {
        const { lokacija } = req.query;
        let query = knex('Sportna_Aktivnost as sa')
            .join('Sport as s', 'sa.TK_TipAktivnosti', 's.id')
            .select('sa.id', 'sa.Naziv as ime_aktivnosti', 'sa.Opis as opis_aktivnosti', 'sa.Lokacija as lokacija_aktivnosti', 'sa.Cena as cena', 'sa.ProstaMesta as prosta_mesta', 'sa.slika', 's.Sport as ime_sporta', 'sa.Datum_Cas_Izvedbe as datum_zacetka');
        if (lokacija) {
            query.where('sa.Lokacija', 'like', `%${lokacija}%`);
        }
        query.orderBy('sa.Datum_Cas_Izvedbe', 'asc').limit(12);
        const aktivnosti = await query;
        const obdelaneAktivnosti = aktivnosti.map(a => ({
            ...a,
            slika: normalizirajImgPath(a.slika, '../slike/default-sport.png')
        }));
        res.json(obdelaneAktivnosti);
    } catch (error) {
        console.error('Napaka pri pridobivanju dejavnosti v okolici:', error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});

app.get('/api/vse-aktivnosti', async (req, res) => {
    try {
        const vseAktivnosti = await knex('Sportna_Aktivnost as sa')
            .join('Sport as s', 'sa.TK_TipAktivnosti', 's.id')
            .select('sa.id', 'sa.Naziv as ime_aktivnosti', 'sa.Opis as opis_aktivnosti', 'sa.Lokacija as lokacija_aktivnosti', 'sa.Cena as cena', 'sa.ProstaMesta as prosta_mesta', 'sa.slika', 's.Sport as ime_sporta', 'sa.Datum_Cas_Izvedbe as datum_zacetka')
            .orderBy('sa.Naziv', 'asc');
        const obdelaneAktivnosti = vseAktivnosti.map(a => ({
            ...a,
            slika: normalizirajImgPath(a.slika, '../slike/default-sport.png')
        }));
        res.json(obdelaneAktivnosti);
    } catch (err) {
        console.error('Napaka pri pridobivanju vseh aktivnosti:', err);
        res.status(500).json({ napaka: err.message })
    }
});

app.get('/api/aktivnost/:id/details', preveriZetonOpcijsko, async (req, res) => {
    const { id } = req.params;
    const userId = req.uporabnik ? req.uporabnik.userId : null;

    try {
        const aktivnost = await knex('Sportna_Aktivnost as sa')
            .where('sa.id', id)
            .join('Sport as s', 'sa.TK_TipAktivnosti', 's.id')
            .leftJoin('Trenerji as t', 'sa.TK_Trener', 't.id')
            .leftJoin('Uporabniki as u_trener', 't.TK_Uporabnik', 'u_trener.id')
            .select('sa.*',
                's.Sport as ime_sporta_aktivnosti',
                't.id as trener_id',
                't.ime as trener_ime', 't.priimek as trener_priimek',
                't.email as trener_kontakt_email', 't.telefon as trener_telefon', 't.urnik as urnik_trenerja', 't.OpisProfila as trener_opis_profila',
                'u_trener.slika as slika_trenerja'
            )
            .first();

        if (!aktivnost) {
            return res.status(404).json({ message: 'Športna aktivnost ni najdena.' });
        }

        const ocene = await knex('Ocena_Sporta as os')
            .join('Uporabniki as u', 'os.TK_Uporabnik', 'u.id')
            .where({ 'os.TK_SportnaAktivnost': id })
            .select('os.id as ocena_id', 'os.Komentar as komentar_ocene', 'os.Ocena as ocena_vrednost', 'os.Datum as datum_ocene', 'u.username as username_uporabnika', 'u.id as uporabnik_id_ocene', 'u.slika as slika_uporabnika_ocene')
            .orderBy('os.Datum', 'desc');

        let jePrijavljen = false;
        if (userId) {
            const prijava = await knex('PrijaveNaAktivnosti')
                .where({ TK_Uporabnik: userId, TK_Aktivnost: id })
                .first();
            jePrijavljen = !!prijava;
        }

        const obdelaneOcene = ocene.map(o => ({
            ...o,
            slika_uporabnika_ocene: normalizirajImgPath(o.slika_uporabnika_ocene, '../slike/default-profile.png')
        }));

        res.json({
            ...aktivnost,
            slika: normalizirajImgPath(aktivnost.slika, '../slike/default-sport.png'),
            slika_trenerja: normalizirajImgPath(aktivnost.slika_trenerja, '../slike/default-profile.png'),
            ocene: obdelaneOcene,
            jePrijavljen: jePrijavljen // Dodan podatek o prijavi
        });
    } catch (error) {
        console.error(`Napaka pri pridobivanju podrobnosti aktivnosti ${id}:`, error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});


// === API TOČKE ZA TRENERJE (javne, za search-stran) ===
app.get('/api/vsi-trenerji', async (req, res) => {
    try {
        const subqueryOcene = knex('Ocena_Trenerja')
            .select('TK_Trener')
            .avg('Ocena as povprecna_ocena')
            .groupBy('TK_Trener')
            .as('o');
        const trenerji = await knex('Trenerji as t')
            .join('Uporabniki as u', 't.TK_Uporabnik', 'u.id')
            .leftJoin(subqueryOcene, 't.id', 'o.TK_Trener')
            .select(
                't.id', 't.ime', 't.priimek', 't.OpisProfila as specializacija', 'u.slika as slika_profila',
                'o.povprecna_ocena', 't.urnik', 't.email as kontakt_email', 't.telefon', 't.Lokacija as lokacija_trenerja'
            )
            .orderByRaw('COALESCE(o.povprecna_ocena, 0) DESC, t.priimek ASC, t.ime ASC');
        const obdelaniTrenerji = trenerji.map(t => ({
            ...t,
            slika: normalizirajImgPath(t.slika_profila, '../slike/default-profile.png'),
            povprecna_ocena: t.povprecna_ocena ? parseFloat(t.povprecna_ocena).toFixed(1) : null
        }));
        res.json(obdelaniTrenerji);
    } catch (error) {
        console.error('Napaka pri pridobivanju vseh trenerjev:', error);
        res.status(500).json({ message: 'Napaka na strežniku pri pridobivanju vseh trenerjev.' });
    }
});

app.get('/api/priporoceni-trenerji', async (req, res) => {
    try {
        const subqueryOcene = knex('Ocena_Trenerja')
            .select('TK_Trener')
            .avg('Ocena as povprecna_ocena')
            .groupBy('TK_Trener')
            .as('o');
        const trenerji = await knex('Trenerji as t')
            .join('Uporabniki as u', 't.TK_Uporabnik', 'u.id')
            .leftJoin(subqueryOcene, 't.id', 'o.TK_Trener')
            .select('t.id', 't.ime', 't.priimek', 't.OpisProfila as specializacija', 'u.slika as slika_profila',
                'o.povprecna_ocena', 't.urnik', 't.Lokacija as lokacija_trenerja')
            .orderBy([{ column: 'o.povprecna_ocena', order: 'desc', nulls: 'last' }, { column: 't.priimek', order: 'asc' }])
            .limit(12);
        const obdelaniTrenerji = trenerji.map(t => ({
            ...t,
            slika: normalizirajImgPath(t.slika_profila, '../slike/default-profile.png'),
            povprecna_ocena: t.povprecna_ocena ? parseFloat(t.povprecna_ocena).toFixed(1) : null
        }));
        res.json(obdelaniTrenerji);
    } catch (error) {
        console.error('Napaka pri pridobivanju priporočenih trenerjev:', error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});

app.get('/api/trenerji-okolica', async (req, res) => {
    try {
        const { lokacija } = req.query;
        const subqueryOcene = knex('Ocena_Trenerja')
            .select('TK_Trener')
            .avg('Ocena as povprecna_ocena')
            .groupBy('TK_Trener')
            .as('o');
        let query = knex('Trenerji as t')
            .join('Uporabniki as u', 't.TK_Uporabnik', 'u.id')
            .leftJoin(subqueryOcene, 't.id', 'o.TK_Trener')
            .select('t.id', 't.ime', 't.priimek', 't.OpisProfila as specializacija', 'u.slika as slika_profila',
                'o.povprecna_ocena', 't.urnik', 't.Lokacija as lokacija_trenerja');
        if (lokacija) {
            query.where('t.Lokacija', 'like', `%${lokacija}%`);
        }
        query.orderBy('t.priimek', 'asc').limit(12);
        const trenerji = await query;
        const obdelaniTrenerji = trenerji.map(t => ({
            ...t,
            slika: normalizirajImgPath(t.slika_profila, '../slike/default-profile.png'),
            povprecna_ocena: t.povprecna_ocena ? parseFloat(t.povprecna_ocena).toFixed(1) : null
        }));
        res.json(obdelaniTrenerji);
    } catch (error) {
        console.error('Napaka pri pridobivanju trenerjev v okolici:', error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});

app.get('/api/trener/:id/details', async (req, res) => {
    const { id } = req.params;
    try {
        const trener = await knex('Trenerji as t')
            .join('Uporabniki as u', 't.TK_Uporabnik', 'u.id')
            .where('t.id', id)
            .select('t.*', 'u.slika as slika_uporabnika', 'u.username as uporabnisko_ime_prijave')
            .first();
        if (!trener) {
            return res.status(404).json({ message: 'Trener ni najden.' });
        }
        const aktivnosti = await knex('Sportna_Aktivnost as sa')
            .join('Sport as s', 'sa.TK_TipAktivnosti', 's.id')
            .where({ 'sa.TK_Trener': id })
            .select('sa.id', 'sa.Naziv as ime_aktivnosti', 'sa.Lokacija as lokacija_aktivnosti', 'sa.Cena as cena', 's.Sport as ime_sporta', 'sa.slika as slika_aktivnosti', 'sa.Datum_Cas_Izvedbe as datum_zacetka_aktivnosti');
        const obdelaneAktivnosti = aktivnosti.map(a => ({
            ...a,
            slika_aktivnosti: normalizirajImgPath(a.slika_aktivnosti, '../slike/default-sport.png')
        }));
        const ocene = await knex('Ocena_Trenerja as ot')
            .join('Uporabniki as u_ocenjevalec', 'ot.TK_Uporabnik', 'u_ocenjevalec.id')
            .where({ 'ot.TK_Trener': id })
            .select('ot.id as ocena_id', 'ot.Komentar as komentar_ocene', 'ot.Ocena as ocena_vrednost', 'ot.Datum as datum_ocene', 'u_ocenjevalec.username as username_ocenjevalca', 'u_ocenjevalec.id as uporabnik_id_ocenjevalca', 'u_ocenjevalec.slika as slika_ocenjevalca')
            .orderBy('ot.Datum', 'desc');
        const obdelaneOcene = ocene.map(o => ({
            ...o,
            slika_ocenjevalca: normalizirajImgPath(o.slika_ocenjevalca, '../slike/default-profile.png')
        }));
        const sportiTrenerja = await knex('TrenerSport as ts')
            .join('Sport as s', 'ts.TK_Sport', 's.id')
            .where('ts.TK_Trener', id)
            .select('s.Sport as ime_sporta', 's.id as sport_id');
        const trenerZaPosiljanje = {
            ...trener,
            slika: normalizirajImgPath(trener.slika_uporabnika, '../slike/default-profile.png'),
            aktivnosti: obdelaneAktivnosti,
            ocene: obdelaneOcene,
            sporti: sportiTrenerja,
            specializacija: trener.OpisProfila,
            kontakt_email: trener.email,
            lokacija_trenerja: trener.Lokacija
        };
        delete trenerZaPosiljanje.slika_uporabnika;
        delete trenerZaPosiljanje.OpisProfila;
        delete trenerZaPosiljanje.email;
        delete trenerZaPosiljanje.Lokacija;
        res.json(trenerZaPosiljanje);
    } catch (error) {
        console.error(`Napaka pri pridobivanju podrobnosti trenerja ${id}:`, error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});

// === API TOČKE ZA UPORABNIKE (Profil, Prijava, Registracija, itd.) ===
app.get('/api/profil', preveriZeton, async (req, res) => {
    try {
        const uporabnikOsnovno = await knex('Uporabniki')
            .where({ id: req.uporabnik.userId })
            .select('id', 'username', 'email', 'slika', 'JeAdmin', 'jeTrener')
            .first();
        if (!uporabnikOsnovno) {
            return res.status(404).json({ message: 'Uporabnik ni najden.' });
        }
        let profilZaPosiljanje = {
            userId: uporabnikOsnovno.id,
            username: uporabnikOsnovno.username,
            email: uporabnikOsnovno.email,
            slika_base64: normalizirajImgPath(uporabnikOsnovno.slika, '../slike/default-profile.png'),
            JeAdmin: uporabnikOsnovno.JeAdmin === 1,
            jeTrener: uporabnikOsnovno.jeTrener === 1
        };
        if (profilZaPosiljanje.jeTrener) {
            const trenerPodatki = await knex('Trenerji').where({ TK_Uporabnik: req.uporabnik.userId }).first();
            if (trenerPodatki) {
                profilZaPosiljanje.trenerId = trenerPodatki.id;
                profilZaPosiljanje.trenerIme = trenerPodatki.ime;
                profilZaPosiljanje.trenerPriimek = trenerPodatki.priimek;
                profilZaPosiljanje.trenerTelefon = trenerPodatki.telefon;
                profilZaPosiljanje.trenerKontaktEmail = trenerPodatki.email;
                profilZaPosiljanje.trenerUrnik = trenerPodatki.urnik;
                profilZaPosiljanje.trenerOpisProfila = trenerPodatki.OpisProfila;
                profilZaPosiljanje.trenerLokacija = trenerPodatki.Lokacija;
            } else {
                console.warn(`Uporabnik ID ${req.uporabnik.userId} je označen kot trener, a nima povezanega vnosa v tabeli Trenerji.`);
            }
        }
        res.json(profilZaPosiljanje);
    } catch (error) {
        console.error('Napaka pri pridobivanju profila:', error);
        res.status(500).json({ message: 'Napaka na strežniku pri pridobivanju profila.', details: error.message });
    }
});

app.put('/api/profil/info', preveriZeton, async (req, res) => {
    const {
        username, email,
        trainerIme, trainerPriimek, trainerTelefon, trainerKontaktEmail, trainerUrnik, trainerOpisProfila, trainerLokacija
    } = req.body;
    const userId = req.uporabnik.userId;
    if (!username || !email) {
        return res.status(400).json({ message: 'Uporabniško ime in email za prijavo sta obvezna.' });
    }
    try {
        const currentUserData = await knex('Uporabniki').where({ id: userId }).first();
        if (!currentUserData) return res.status(404).json({ message: "Uporabnik ni najden."});
        const uporabnikUpdateData = {};
        if (email.toLowerCase() !== currentUserData.email.toLowerCase()) {
            const obstojecEmail = await knex('Uporabniki').whereRaw('LOWER(email) = ?', [email.toLowerCase()]).whereNot({ id: userId }).first();
            if (obstojecEmail) {
                return res.status(409).json({ message: 'Ta email naslov (za prijavo) je že v uporabi.' });
            }
            uporabnikUpdateData.email = email;
        }
        if (username.toLowerCase() !== currentUserData.username.toLowerCase()) {
            const obstojeceIme = await knex('Uporabniki').whereRaw('LOWER(username) = ?', [username.toLowerCase()]).whereNot({ id: userId }).first();
            if (obstojeceIme) {
                return res.status(409).json({ message: 'To uporabniško ime je že v uporabi.' });
            }
            uporabnikUpdateData.username = username;
        }
        if (Object.keys(uporabnikUpdateData).length > 0) {
            await knex('Uporabniki').where({ id: userId }).update(uporabnikUpdateData);
        }
        let jeTrenerPoPosodobitvi = currentUserData.jeTrener === 1;
        if (jeTrenerPoPosodobitvi) {
            const trenerPodatkiPreverba = await knex('Trenerji').where({ TK_Uporabnik: userId }).first();
            if (trenerPodatkiPreverba) {
                const podatkiZaPosodobitevTrenerja = {};
                if (trainerIme !== undefined && trainerIme !== trenerPodatkiPreverba.ime) podatkiZaPosodobitevTrenerja.ime = trainerIme;
                if (trainerPriimek !== undefined && trainerPriimek !== trenerPodatkiPreverba.priimek) podatkiZaPosodobitevTrenerja.priimek = trainerPriimek;
                if (trainerTelefon !== undefined && trainerTelefon !== trenerPodatkiPreverba.telefon) podatkiZaPosodobitevTrenerja.telefon = trainerTelefon;
                if (trainerKontaktEmail !== undefined && trainerKontaktEmail.toLowerCase() !== trenerPodatkiPreverba.email.toLowerCase()) {
                    const obstojecKontaktniEmail = await knex('Trenerji')
                        .whereRaw('LOWER(email) = ?', [trainerKontaktEmail.toLowerCase()])
                        .whereNot({ TK_Uporabnik: userId }).first();
                    if (obstojecKontaktniEmail) {
                        return res.status(409).json({ message: 'Ta kontaktni email za trenerja je že v uporabi.' });
                    }
                    podatkiZaPosodobitevTrenerja.email = trainerKontaktEmail;
                }
                if (trainerUrnik !== undefined && trainerUrnik !== trenerPodatkiPreverba.urnik) podatkiZaPosodobitevTrenerja.urnik = trainerUrnik;
                if (trainerOpisProfila !== undefined && trainerOpisProfila !== trenerPodatkiPreverba.OpisProfila) podatkiZaPosodobitevTrenerja.OpisProfila = trainerOpisProfila;
                if (trainerLokacija !== undefined && trainerLokacija !== trenerPodatkiPreverba.Lokacija) podatkiZaPosodobitevTrenerja.Lokacija = trainerLokacija;
                if (Object.keys(podatkiZaPosodobitevTrenerja).length > 0) {
                    await knex('Trenerji').where({ TK_Uporabnik: userId }).update(podatkiZaPosodobitevTrenerja);
                }
            }
        }
        const posodobljenUporabnikRaw = await knex('Uporabniki').where({ id: userId }).select('username', 'email', 'slika', 'JeAdmin', 'jeTrener').first();
        const novAccessToken = jwt.sign(
            {
                userId: userId,
                username: posodobljenUporabnikRaw.username,
                email: posodobljenUporabnikRaw.email,
                type: 'access',
                JeAdmin: posodobljenUporabnikRaw.JeAdmin === 1,
                jeTrener: posodobljenUporabnikRaw.jeTrener === 1
            },
            JWT_SECRET, { expiresIn: '30m' }
        );
        let uporabnikZaOdziv = {
            userId: userId,
            username: posodobljenUporabnikRaw.username,
            email: posodobljenUporabnikRaw.email,
            slika_base64: normalizirajImgPath(posodobljenUporabnikRaw.slika, '../slike/default-profile.png'),
            JeAdmin: posodobljenUporabnikRaw.JeAdmin === 1,
            jeTrener: posodobljenUporabnikRaw.jeTrener === 1
        };
        if (uporabnikZaOdziv.jeTrener) {
            const posodobljeniTrenerPodatki = await knex('Trenerji').where({ TK_Uporabnik: userId }).first();
            if (posodobljeniTrenerPodatki) {
                uporabnikZaOdziv.trenerId = posodobljeniTrenerPodatki.id;
                uporabnikZaOdziv.trenerIme = posodobljeniTrenerPodatki.ime;
                uporabnikZaOdziv.trenerPriimek = posodobljeniTrenerPodatki.priimek;
                uporabnikZaOdziv.trenerKontaktEmail = posodobljeniTrenerPodatki.email;
                uporabnikZaOdziv.trenerTelefon = posodobljeniTrenerPodatki.telefon;
                uporabnikZaOdziv.trenerUrnik = posodobljeniTrenerPodatki.urnik;
                uporabnikZaOdziv.trenerOpisProfila = posodobljeniTrenerPodatki.OpisProfila;
                uporabnikZaOdziv.trenerLokacija = posodobljeniTrenerPodatki.Lokacija;
            }
        }
        res.json({ message: 'Podatki uspešno posodobljeni.', accessToken: novAccessToken, uporabnik: uporabnikZaOdziv });
    } catch (error) {
        console.error('Napaka pri posodabljanju informacij o profilu:', error);
        res.status(500).json({ message: 'Napaka na strežniku pri posodabljanju informacij o profilu.' });
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
        await knex('Uporabniki').where({ id: userId }).update({ geslo: novoHashiranoGeslo });
        res.json({ message: 'Geslo uspešno spremenjeno.' });
    } catch (error) {
        console.error('Napaka pri spreminjanju gesla:', error);
        res.status(500).json({ message: 'Napaka na strežniku pri spreminjanju gesla.' });
    }
});

app.post('/api/profil/slika', preveriZeton, async (req, res) => {
    const userId = req.uporabnik.userId;
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.profilePicture) {
        return res.status(400).json({ message: 'Nobena datoteka ni bila naložena.' });
    }
    const profilePicture = req.files.profilePicture;
    const slikaBuffer = Buffer.from(profilePicture.data);
    const dovoljeniTipi = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!dovoljeniTipi.includes(profilePicture.mimetype)) {
        return res.status(400).json({ message: 'Nedovoljen tip datoteke. Prosimo, naložite JPG, PNG, GIF ali WEBP.' });
    }
    const maxVelikost = 5 * 1024 * 1024;
    if (profilePicture.size > maxVelikost) {
        return res.status(400).json({ message: `Datoteka je prevelika. Največja dovoljena velikost je ${maxVelikost / (1024 * 1024)}MB.` });
    }
    try {
        await knex('Uporabniki').where({ id: userId }).update({ slika: slikaBuffer });
        const formattedSlikaZaOdziv = normalizirajImgPath(slikaBuffer, '../slike/default-profile.png');
        res.json({ message: 'Profilna slika uspešno naložena v bazo.', slika_base64: formattedSlikaZaOdziv });
    } catch (dbError) {
        console.error('Napaka pri shranjevanju slike v bazo:', dbError);
        res.status(500).json({ message: 'Napaka pri shranjevanju slike v bazo.' });
    }
});

app.post('/api/prijava', async (req, res) => {
    const email = req.body.email;
    const geslo = req.body.geslo;
    const rememberMe = req.body.rememberMe === true || req.body.rememberMe === 'true';
    if (!email || !geslo) {
        return res.status(400).json({ message: 'Email in geslo sta obvezna.' });
    }
    try {
        const uporabnik = await knex('Uporabniki').whereRaw('LOWER(email) = ?', [email.toLowerCase()]).first();
        if (uporabnik) {
            const pravilnoGeslo = bcrypt.compareSync(geslo, uporabnik.geslo);
            if (pravilnoGeslo) {
                const accessTokenPayload = {
                    userId: uporabnik.id,
                    username: uporabnik.username,
                    email: uporabnik.email,
                    type: 'access',
                    JeAdmin: uporabnik.JeAdmin === 1,
                    jeTrener: uporabnik.jeTrener === 1
                };
                const accessToken = jwt.sign(accessTokenPayload, JWT_SECRET, { expiresIn: '30m' });
                let osvezilniToken = null;
                if (rememberMe) {
                    const refreshTokenPayload = { userId: uporabnik.id, type: 'refresh' };
                    osvezilniToken = jwt.sign(refreshTokenPayload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
                    const hashiranOsvezilniToken = bcrypt.hashSync(osvezilniToken, saltKodiranje);
                    const datumPoteka = new Date();
                    datumPoteka.setDate(datumPoteka.getDate() + 7);
                    await knex('osvezilniTokens').where({ user_id: uporabnik.id }).del();
                    await knex('osvezilniTokens').insert({
                        user_id: uporabnik.id, hashiranToken: hashiranOsvezilniToken, expires_at: datumPoteka
                    });
                }
                let uporabnikZaOdziv = {
                    userId: uporabnik.id,
                    username: uporabnik.username,
                    email: uporabnik.email,
                    slika_base64: normalizirajImgPath(uporabnik.slika, '../slike/default-profile.png'),
                    JeAdmin: uporabnik.JeAdmin === 1,
                    jeTrener: uporabnik.jeTrener === 1
                };
                if (uporabnikZaOdziv.jeTrener) {
                    const trenerPodatki = await knex('Trenerji').where({ TK_Uporabnik: uporabnik.id }).first();
                    if (trenerPodatki) {
                        uporabnikZaOdziv.trenerId = trenerPodatki.id;
                        uporabnikZaOdziv.trenerIme = trenerPodatki.ime;
                        uporabnikZaOdziv.trenerPriimek = trenerPodatki.priimek;
                    }
                }
                res.json({
                    message: 'Prijava uspešna!', accessToken: accessToken,
                    ...(osvezilniToken && { osvezilniToken: osvezilniToken }),
                    uporabnik: uporabnikZaOdziv
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
            await knex('osvezilniTokens').where({ user_id: userId }).del();
            return res.status(403).json({ message: 'Osvežilni žeton ni veljaven, ne obstaja v bazi ali je potekel. Vsi žetoni za uporabnika so bili preklicani.' });
        }
        await knex('osvezilniTokens').where({ id: shranjenTokenId }).del();
        const uporabnik = await knex('Uporabniki').where({ id: userId }).select('id', 'username', 'email', 'slika', 'JeAdmin', 'jeTrener').first();
        if (!uporabnik) {
            return res.status(403).json({ message: 'Povezan uporabnik ne obstaja več.' });
        }
        const novOsvezilniTokenPayload = { userId: userId, type: 'refresh' };
        const novGeneratedOsvezilniToken = jwt.sign(novOsvezilniTokenPayload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        const hashiranNovOsvezilniToken = bcrypt.hashSync(novGeneratedOsvezilniToken, saltKodiranje);
        const novDatumPoteka = new Date();
        novDatumPoteka.setDate(novDatumPoteka.getDate() + 7);
        await knex('osvezilniTokens').insert({
            user_id: userId, hashiranToken: hashiranNovOsvezilniToken, expires_at: novDatumPoteka
        });
        const novAccesTokenPayload = {
            userId: userId,
            username: uporabnik.username,
            email: uporabnik.email,
            type: 'access',
            JeAdmin: uporabnik.JeAdmin === 1,
            jeTrener: uporabnik.jeTrener === 1
        };
        const novAccesToken = jwt.sign(novAccesTokenPayload, JWT_SECRET, { expiresIn: '30m' });
        let uporabnikZaOdziv = {
            userId: uporabnik.id,
            username: uporabnik.username,
            email: uporabnik.email,
            slika_base64: normalizirajImgPath(uporabnik.slika, '../slike/default-profile.png'),
            JeAdmin: uporabnik.JeAdmin === 1,
            jeTrener: uporabnik.jeTrener === 1
        };
        if (uporabnikZaOdziv.jeTrener) {
            const trenerPodatki = await knex('Trenerji').where({ TK_Uporabnik: userId }).first();
            if (trenerPodatki){
                uporabnikZaOdziv.trenerId = trenerPodatki.id;
                uporabnikZaOdziv.trenerIme = trenerPodatki.ime;
                uporabnikZaOdziv.trenerPriimek = trenerPodatki.priimek;
            }
        }
        res.json({
            accessToken: novAccesToken,
            osvezilniToken: novGeneratedOsvezilniToken,
            uporabnik: uporabnikZaOdziv
        });
    } catch (error) {
        console.error('Napaka pri osveževanju žetona:', error.message);
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            try {
                const payload = jwt.decode(osvezilniToken);
                if (payload && payload.userId) {
                    await knex('osvezilniTokens').where({ user_id: payload.userId }).del();
                    console.log(`Vsi osvežilni žetoni za uporabnika ${payload.userId} izbrisani zaradi napake pri verifikaciji.`);
                }
            } catch (decodeError) {
                console.error("Napaka pri dekodiranju neveljavnega osvežilnega žetona med obravnavo napake:", decodeError);
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(403).json({ message: 'Osvežilni žeton je potekel. Prijavite se ponovno.' });
            }
            return res.status(403).json({ message: 'Osvežilni žeton ni veljaven. Prijavite se ponovno.' });
        }
        return res.status(500).json({ message: 'Napaka na strežniku pri osveževanju žetona.' });
    }
});

app.post('/api/odjava', async (req, res) => {
    const { osvezilniToken } = req.body;
    if (!osvezilniToken) {
        return res.status(200).json({ message: 'Odjava: osvežilni žeton ni bil posredovan s strani klienta.' });
    }
    try {
        let userIdFromToken = null;
        try {
            const decoded = jwt.verify(osvezilniToken, REFRESH_TOKEN_SECRET, { ignoreExpiration: true });
            userIdFromToken = decoded.userId;
        } catch (e) {
            const payload = jwt.decode(osvezilniToken);
            if (payload && payload.userId) userIdFromToken = payload.userId;
            console.log("Osvežilni žeton pri odjavi ni veljaven JWT ali je potekel, a poskušamo brisati na podlagi ID-ja:", e.message);
        }
        let steviloIzbrisanihTokenov = 0;
        if (userIdFromToken) {
            const zgodovinaShranjenihTokenov = await knex('osvezilniTokens')
                .where({ user_id: userIdFromToken }).select('id', 'hashiranToken');
            for (const record of zgodovinaShranjenihTokenov) {
                if (bcrypt.compareSync(osvezilniToken, record.hashiranToken)) {
                    await knex('osvezilniTokens').where({ id: record.id }).del();
                    console.log(`Osvežilni žeton ID ${record.id} za uporabnika ${userIdFromToken} izbrisan ob odjavi.`);
                    steviloIzbrisanihTokenov++;
                    break;
                }
            }
        }
        if (steviloIzbrisanihTokenov > 0) {
            res.status(200).json({ message: 'Odjava uspešna, osvežilni žeton je bil preklican.' });
        } else {
            res.status(200).json({ message: 'Odjava: osvežilni žeton ni bil najden v bazi, se ne ujema, ali pa je bil že preklican.' });
        }
    } catch (error) {
        console.error('Napaka pri odjavi (brisanje osvežilnega žetona):', error);
        res.status(500).json({ message: 'Napaka na strežniku pri odjavi.' });
    }
});

app.post('/api/registracija', async (req, res) => {
    const { ime, priimek, email, geslo } = req.body;
    if (!ime || !email || !geslo) {
        return res.status(400).json({ message: 'Uporabniško ime (ime), email in geslo so obvezni.' });
    }
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Neveljaven format e-poštnega naslova.' });
    }
    const gesloRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!gesloRegex.test(geslo)) {
        return res.status(400).json({ message: 'Geslo mora vsebovati vsaj 6 znakov, eno veliko črko in eno številko.' });
    }
    try {
        const obstojecUporabnikPoEmailu = await knex('Uporabniki').whereRaw('LOWER(email) = ?', [email.toLowerCase()]).first();
        if (obstojecUporabnikPoEmailu) {
            return res.status(409).json({ message: 'Uporabnik s tem emailom že obstaja.' });
        }
        const obstojecUporabnikPoImenu = await knex('Uporabniki').whereRaw('LOWER(username) = ?', [ime.toLowerCase()]).first();
        if (obstojecUporabnikPoImenu) {
            return res.status(409).json({ message: 'Uporabnik s tem uporabniškim imenom že obstaja.' });
        }
        const novUporabnik = {
            username: ime,
            email: email,
            geslo: bcrypt.hashSync(geslo, saltKodiranje),
            JeAdmin: 0,
            jeTrener: 0,
        };
        const [uporabnikId] = await knex('Uporabniki').insert(novUporabnik);

        try {
            const mailOptions = {
                from: `"Sportaj.si" <${process.env.EMAIL_USER}>`, // Ime pošiljatelja in e-mail
                to: email, // E-mail prejemnika (novo registriranega uporabnika)
                subject: 'Dobrodošli na Sportaj.si!', // Zadeva sporočila
                text: `Pozdravljeni ${ime},\n\Hvala za vašo registracijo na platformi Sportaj.si. Želimo vam veliko uspehov pri iskanju pravega trenerja ali aktivnosti!\n\nLep pozdrav,\nEkipa Sportaj.si`, // Plain text vsebina
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <h2>Dobrodošli na Sportaj.si, ${ime}!</h2>
                        <p>Zahvaljujemo se vam za registracijo na naši platformi. Veseli nas, da ste se nam pridružili.</p>
                        <p>Na Sportaj.si lahko preprosto najdete najboljše osebne trenerje, se prijavite na vodene vadbe in odkrijete nove športne aktivnosti v vaši bližini.</p>
                        <p>Želimo vam veliko uspehov in športnih užitkov!</p>
                        <p>Lep pozdrav,<br><b>Ekipa Sportaj.si</b></p>
                        <a href="http://localhost:3000" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Obišči stran</a>
                    </div>
                ` // HTML vsebina
            };

            await transporter.sendMail(mailOptions);
            console.log(`Potrditveni e-mail uspešno poslan na: ${email}`);

        } catch (emailError) {
            // Pomembno: Registracija je bila uspešna, a e-mail ni bil poslan.
            // Zapišemo napako v konzolo, a uporabniku ne vrnemo napake, saj je že registriran.
            console.error(`Napaka pri pošiljanju e-maila za registracijo na ${email}:`, emailError);
        }

        res.status(201).json({ message: 'Registracija uspešna!', userId: uporabnikId });
    } catch (error) {
        console.error('Napaka pri registraciji:', error);
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            if (error.message.toLowerCase().includes('email')) return res.status(409).json({ message: 'Uporabnik s tem emailom že obstaja (DB).' });
            else if (error.message.toLowerCase().includes('username')) return res.status(409).json({ message: 'Uporabnik s tem uporabniškim imenom že obstaja (DB).' });
        }
        res.status(500).json({ message: 'Napaka na strežniku pri registraciji.' });
    }
});

app.post('/api/trener/:id/ocena', preveriZeton, async (req, res) => {
    const trenerId = req.params.id;
    const uporabnikId = req.uporabnik.userId;
    const { ocena, komentar } = req.body;
    if (!ocena || ocena < 1 || ocena > 5) {
        return res.status(400).json({ message: 'Ocena mora biti število med 1 in 5.' });
    }
    try {
        const trener = await knex('Trenerji').where({ id: trenerId }).first();
        if (!trener) {
            return res.status(404).json({ message: 'Trener s tem ID-jem ni najden.' });
        }
        const obstojecaOcena = await knex('Ocena_Trenerja')
            .where({ TK_Trener: trenerId, TK_Uporabnik: uporabnikId })
            .first();
        if (obstojecaOcena) {
            await knex('Ocena_Trenerja')
                .where({ id: obstojecaOcena.id })
                .update({ Ocena: ocena, Komentar: komentar || null, Datum: new Date() });
            res.status(200).json({ message: 'Ocena uspešno posodobljena.' });
        } else {
            await knex('Ocena_Trenerja').insert({
                TK_Trener: trenerId, TK_Uporabnik: uporabnikId, Ocena: ocena, Komentar: komentar || null, Datum: new Date()
            });
            res.status(201).json({ message: 'Ocena in komentar sta bila uspešno oddana.' });
        }
    } catch (error) {
        console.error(`Napaka pri oddaji/posodobitvi ocene za trenerja ${trenerId}:`, error);
        res.status(500).json({ message: 'Napaka na strežniku pri oddaji ocene.' });
    }
});

app.get('/api/aktivnosti/:id/ocene', async (req, res) => {
    try {
        const ocene = await knex('Ocene_Aktivnosti')
            .join('Uporabniki', 'Ocene_Aktivnosti.TK_Uporabnik', 'Uporabniki.id')
            .select('Ocene_Aktivnosti.*', 'Uporabniki.uporabnisko_ime')
            .where('TK_Aktivnost', req.params.id)
            .orderBy('Datum', 'desc');
        res.json(ocene);
    } catch (error) {
        console.error("Napaka pri pridobivanju ocen:", error);
        res.status(500).json({ message: 'Napaka na strežniku' });
    }
});

app.post('/api/aktivnosti/:id/ocene', preveriZeton, async (req, res) => {
    const aktivnostId = req.params.id;
    const uporabnikId = req.uporabnik.userId;
    const { ocena, komentar } = req.body;

    if (ocena === undefined || ocena < 1 || ocena > 5) {
        return res.status(400).json({ message: 'Ocena (število zvezdic) je obvezna in mora biti med 1 in 5.' });
    }

    try {
        const aktivnost = await knex('Sportna_Aktivnost').where({ id: aktivnostId }).first();
        if (!aktivnost) {
            return res.status(404).json({ message: 'Aktivnost s tem ID-jem ni najdena.' });
        }

        const obstojecaOcena = await knex('Ocena_Sporta')
            .where({ TK_SportnaAktivnost: aktivnostId, TK_Uporabnik: uporabnikId })
            .first();

        if (obstojecaOcena) {
            await knex('Ocena_Sporta')
                .where({ id: obstojecaOcena.id })
                .update({ Ocena: ocena, Komentar: komentar || null, Datum: new Date() });
            res.status(200).json({ message: 'Ocena aktivnosti uspešno posodobljena.' });
        } else {
            await knex('Ocena_Sporta').insert({
                TK_SportnaAktivnost: aktivnostId,
                TK_Uporabnik: uporabnikId,
                Ocena: ocena,
                Komentar: komentar || null,
                Datum: new Date()
            });
            res.status(201).json({ message: 'Ocena aktivnosti uspešno oddana.' });
        }
    } catch (error) {
        console.error(`Napaka pri oddaji/posodobitvi ocene za aktivnost ${aktivnostId}:`, error);
        res.status(500).json({ message: 'Napaka na strežniku pri oddaji ocene aktivnosti.' });
    }
});


app.post('/api/postaniTrener', preveriZeton, async (req, res) => {
    // Podatki iz obrazca
    const { ime, priimek, telefon, kontakt_email, urnik, opis, lokacija, sporti } = req.body;
    const userId = req.uporabnik.userId;

    // Validacija
    if (!ime || !priimek || !telefon || !kontakt_email || !urnik || !opis || !lokacija || !sporti || !Array.isArray(sporti) || sporti.length === 0) {
        return res.status(400).json({ message: "Vsa polja so obvezna." });
    }

    const trx = await knex.transaction();
    try {
        // 1. Pridobimo originalne podatke uporabnika, vključno z njegovim PRAVIM emailom
        const originalUser = await trx('Uporabniki').where({ id: userId }).first();
        if (!originalUser) {
            await trx.rollback();
            return res.status(404).json({ message: 'Uporabnik ni najden.' });
        }
        const originalEmail = originalUser.email; // Shranimo pravi email za pošiljanje obvestila

        const obstojecTrener = await trx('Trenerji').where({ TK_Uporabnik: userId }).first();
        if (obstojecTrener) {
            await trx.rollback();
            return res.status(409).json({ message: 'Uporabnik je že registriran kot trener.' });
        }

        // 2. Generiramo nov, trenerski prijavni email in preverimo unikatnost
        let baseTrainerEmail = (ime + priimek).toLowerCase()
            .replace(/\s+/g, '') // Odstrani presledke
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Odstrani šumnike (čšž -> csz)
            .replace(/đ/g, 'd'); // Posebej za đ

        let finalTrainerEmail = `${baseTrainerEmail}@trener.si`;
        let counter = 1;
        while (await trx('Uporabniki').where({ email: finalTrainerEmail }).first()) {
            finalTrainerEmail = `${baseTrainerEmail}${counter}@trener.si`;
            counter++;
        }

        // 3. Posodobimo uporabnikov račun z NOVIM emailom za prijavo in statusom trenerja
        // Geslo ostane isto!
        await trx('Uporabniki').where({ id: userId }).update({
            email: finalTrainerEmail,
            jeTrener: 1,
            updated_at: new Date()
        });

        // 4. Ustvarimo zapis v tabeli Trenerji (to že imamo)
        const [trenerId] = await trx("Trenerji").insert({
            ime, priimek, telefon, email: kontakt_email, urnik, OpisProfila: opis, Lokacija: lokacija, TK_Uporabnik: userId
        });

        // 5. Povežemo trenerja s športi (to že imamo)
        const trenerSportPodatki = sporti.map(sportId => ({ TK_Trener: trenerId, TK_Sport: parseInt(sportId) }));
        await trx('TrenerSport').insert(trenerSportPodatki);

        // 6. Pošljemo potrditveni email na UPORABNIKOV ORIGINALNI NASLOV
        try {
            const mailOptions = {
                from: `"Sportaj.si" <${process.env.EMAIL_USER}>`,
                to: originalEmail, // POZOR: Pošljemo na pravi, stari email!
                subject: 'Potrditev: Postali ste trener na Sportaj.si!',
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <h2>Čestitamo, ${ime}!</h2>
                        <p>Vaša prošnja za trenerja na platformi Sportaj.si je bila uspešno obdelana in potrjena.</p>
                        <p>Za vas smo ustvarili poseben trenerski dostop. Od zdaj naprej se v sistem prijavljate z naslednjimi podatki:</p>
                        <div style="background-color: #f2f2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 0;"><strong>Nov prijavni e-mail:</strong> ${finalTrainerEmail}</p>
                            <p style="margin: 5px 0 0 0;"><strong>Geslo:</strong> Ostaja enako kot doslej.</p>
                        </div>
                        <p>Vaš stari prijavni e-mail (${originalEmail}) ni več v uporabi za prijavo.</p>
                        <p>Zdaj lahko dodajate svoje športne aktivnosti in urejate svoj trenerski profil.</p>
                        <p>Želimo vam veliko uspeha!</p>
                        <p>Lep pozdrav,<br><b>Ekipa Sportaj.si</b></p>
                    </div>
                `
            };
            await transporter.sendMail(mailOptions);
            console.log(`Potrditveni trenerski e-mail uspešno poslan na: ${originalEmail}`);
        } catch (emailError) {
            console.error(`Napaka pri pošiljanju trenerskega e-maila na ${originalEmail}:`, emailError);
            // Ne prekinemo procesa, ker je uporabnik tehnično že postal trener.
        }

        // Potrdimo vse spremembe v bazi
        await trx.commit();

        // 7. Pripravimo nov JWT žeton s posodobljenimi podatki
        const novAccessToken = jwt.sign(
            {
                userId: userId,
                username: originalUser.username,
                email: finalTrainerEmail, // POZOR: Žetonu damo nov (trenerski) email!
                type: 'access',
                JeAdmin: originalUser.JeAdmin === 1,
                jeTrener: true
            },
            JWT_SECRET, { expiresIn: '30m' }
        );

        const posodobljenUporabnikInfo = {
            userId: userId,
            username: originalUser.username,
            email: finalTrainerEmail, // Tudi v odgovor damo nov email
            slika_base64: normalizirajImgPath(originalUser.slika, '../slike/default-profile.png'),
            JeAdmin: originalUser.JeAdmin === 1,
            jeTrener: true,
            trenerId: trenerId,
            trenerIme: ime,
            trenerPriimek: priimek
        };

        res.status(200).json({ message: "Uspešno ste postali trener! Podatki za prijavo so bili poslani na vaš e-mail.", accessToken: novAccessToken, uporabnik: posodobljenUporabnikInfo });

    } catch (error) {
        await trx.rollback();
        console.error('Napaka pri postopku "postani trener": ', error);
        res.status(500).json({ error: 'Napaka na strežniku pri registraciji za trenerja.' });
    }
});

// === API TOČKE ZA OSNOVNO STRAN (INDEX.HTML) ===
app.get('/api/index/dejavnosti/prihajajoce', async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    try {
        const aktivnosti = await knex('Sportna_Aktivnost as sa')
            .join('Sport as s', 'sa.TK_TipAktivnosti', 's.id')
            .where('sa.Datum_Cas_Izvedbe', '>=', knex.raw('NOW()'))
            .select('sa.id as Aktivnosti_ID', 'sa.Naziv as naziv', 'sa.Opis as opis', 'sa.Datum_Cas_Izvedbe as datum_cas_izvedbe', 'sa.Lokacija as lokacija_naziv', 'sa.slika', 's.Sport as ime_sporta', 'sa.Cena as cena', 'sa.ProstaMesta', 'sa.MaxMesta')
            .orderBy('sa.Datum_Cas_Izvedbe', 'asc')
            .limit(limit);
        const obdelaneAktivnosti = aktivnosti.map(a => ({
            ...a,
            slika_url: normalizirajImgPath(a.slika, '../slike/default-sport.png'),
            slika: undefined
        }));
        res.json(obdelaneAktivnosti);
    } catch (error) {
        console.error('Napaka pri pridobivanju prihajajočih dejavnosti za index:', error);
        res.status(500).json({ message: 'Napaka na strežniku pri pridobivanju prihajajočih dejavnosti.' });
    }
});


app.get('/api/index/trenerji/top', async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    try {
        const subqueryOcene = knex('Ocena_Trenerja')
            .select('TK_Trener')
            .avg('Ocena as povprecna_ocena_numeric')
            .groupBy('TK_Trener')
            .as('o');
        const trenerji = await knex('Trenerji as t')
            .join('Uporabniki as u', 't.TK_Uporabnik', 'u.id')
            .leftJoin(subqueryOcene, 't.id', 'o.TK_Trener')
            .select('t.id as TrenerID', 't.ime as Ime', 't.priimek as Priimek', 't.OpisProfila as Specializacija', 'u.slika as slika_profila_buffer', 'o.povprecna_ocena_numeric as PovprecnaOcena', ' t.Lokacija as lokacija_trenerja')
            .orderByRaw('COALESCE(o.povprecna_ocena_numeric, 0) DESC, t.priimek ASC, t.ime ASC')
            .limit(limit);
        const obdelaniTrenerji = trenerji.map(t => ({
            ...t,
            PovprecnaOcena: t.PovprecnaOcena ? parseFloat(t.PovprecnaOcena).toFixed(1) : null,
            ProfilnaSlikaURL: normalizirajImgPath(t.slika_profila_buffer, '../slike/default-profile.png'),
            slika_profila_buffer: undefined
        }));
        res.json(obdelaniTrenerji);
    } catch (error) {
        console.error('Napaka pri pridobivanju top trenerjev za index:', error);
        res.status(500).json({ message: 'Napaka na strežniku pri pridobivanju top trenerjev.' });
    }
});

app.get('/api/index/sporti/top', async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    try {
        const sporti = await knex('Sport as s')
            .leftJoin('Sportna_Aktivnost as sa', 's.id', 'sa.TK_TipAktivnosti')
            .select('s.id as Sport_ID', 's.Sport as Naziv_Sporta')
            .count('sa.id as stevilo_aktivnosti')
            .groupBy('s.id', 's.Sport')
            .orderBy('stevilo_aktivnosti', 'desc')
            .limit(limit);
        const sportiSlike = sporti.map(s => {
            const imageName = s.Naziv_Sporta.toLowerCase().replace(/\s+/g, '-').replace(/[čć]/g, 'c').replace(/[š]/g, 's').replace(/[ž]/g, 'z');
            return {
                ...s,
                slika: normalizirajImgPath(`../slike/${imageName}.png`, '../slike/default-sport.png')
            };
        });
        res.json(sportiSlike);
    } catch (error) {
        console.error('Napaka pri pridobivanju top športov za index:', error);
        res.status(500).json({ message: 'Napaka na strežniku pri pridobivanju top športov.' });
    }
});

// === ADMIN API TOČKE ===
app.get('/api/admin/ocene/trenerjev', preveriZeton, preveriAdmin, async (req, res) => {
    try {
        const ocene = await knex('Ocena_Trenerja as ot')
            .join('Uporabniki as u', 'ot.TK_Uporabnik', 'u.id')
            .join('Trenerji as t', 'ot.TK_Trener', 't.id')
            .select('ot.id', 'ot.Komentar', 'ot.Ocena', 'ot.Datum', 'u.username as uporabnik_username', 'u.email as uporabnik_email', 't.ime as trener_ime', 't.priimek as trener_priimek')
            .orderBy('ot.Datum', 'desc');
        res.json(ocene);
    } catch (error) {
        console.error('Admin napaka pri pridobivanju ocen trenerjev:', error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});

app.get('/api/admin/ocene/aktivnosti', preveriZeton, preveriAdmin, async (req, res) => {
    try {
        const ocene = await knex('Ocena_Sporta as os')
            .join('Uporabniki as u', 'os.TK_Uporabnik', 'u.id')
            .join('Sportna_Aktivnost as sa', 'os.TK_SportnaAktivnost', 'sa.id')
            .select('os.id', 'os.Komentar', 'os.Ocena', 'os.Datum', 'u.username as uporabnik_username', 'u.email as uporabnik_email', 'sa.Naziv as aktivnost_naziv')
            .orderBy('os.Datum', 'desc');
        res.json(ocene);
    } catch (error) {
        console.error('Admin napaka pri pridobivanju ocen aktivnosti:', error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});

app.put('/api/admin/ocene/trenerja/:id', preveriZeton, preveriAdmin, async (req, res) => {
    const { id } = req.params;
    const { Komentar, Ocena } = req.body;
    try {
        const updatedCount = await knex('Ocena_Trenerja')
            .where({ id })
            .update({ Komentar, Ocena, Datum: new Date() });
        if (updatedCount === 0) return res.status(404).json({ message: 'Ocena trenerja ni najdena.' });
        res.json({ message: 'Ocena trenerja uspešno posodobljena.' });
    } catch (error) {
        console.error(`Admin napaka pri urejanju ocene trenerja ${id}:`, error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});

app.put('/api/admin/ocene/aktivnosti/:id', preveriZeton, preveriAdmin, async (req, res) => {
    const { id } = req.params;
    const { Komentar, Ocena } = req.body;
    try {
        const updatedCount = await knex('Ocena_Sporta')
            .where({ id })
            .update({ Komentar, Ocena, Datum: new Date() });
        if (updatedCount === 0) return res.status(404).json({ message: 'Ocena aktivnosti ni najdena.' });
        res.json({ message: 'Ocena aktivnosti uspešno posodobljena.' });
    } catch (error) {
        console.error(`Admin napaka pri urejanju ocene aktivnosti ${id}:`, error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});

app.delete('/api/admin/ocene/trenerja/:id', preveriZeton, preveriAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCount = await knex('Ocena_Trenerja').where({ id }).del();
        if (deletedCount === 0) return res.status(404).json({ message: 'Ocena trenerja ni najdena.' });
        res.json({ message: 'Ocena trenerja uspešno izbrisana.' });
    } catch (error) {
        console.error(`Admin napaka pri brisanju ocene trenerja ${id}:`, error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});

app.delete('/api/admin/ocene/aktivnosti/:id', preveriZeton, preveriAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCount = await knex('Ocena_Sporta').where({ id }).del();
        if (deletedCount === 0) return res.status(404).json({ message: 'Ocena aktivnosti ni najdena.' });
        res.json({ message: 'Ocena aktivnosti uspešno izbrisana.' });
    } catch (error) {
        console.error(`Admin napaka pri brisanju ocene aktivnosti ${id}:`, error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});

app.get('/api/admin/aktivnosti', preveriZeton, preveriAdminAliTrener, async (req, res) => {

    try {
        let query = knex('Sportna_Aktivnost as sa')
            .leftJoin('Sport as s', 'sa.TK_TipAktivnosti', 's.id')
            .leftJoin('Trenerji as t', 'sa.TK_Trener', 't.id')
            .select('sa.id', 'sa.Naziv', 'sa.Opis', 'sa.Lokacija', 'sa.Cena', 'sa.ProstaMesta', 'sa.Datum_Cas_Izvedbe', 'sa.slika',
                's.Sport as ime_sporta', 's.id as sport_id',
                knex.raw("CONCAT(t.ime, ' ', t.priimek) as ime_trenerja"), 't.id as trener_id_aktivnosti');
        if (req.uporabnik.jeTrener === 1 && req.uporabnik.JeAdmin !== 1) {
            const trenerInfo = await knex('Trenerji').where({TK_Uporabnik: req.uporabnik.userId}).first();
            if(trenerInfo){
                query.where('sa.TK_Trener', trenerInfo.id);
            } else {
                return res.json([]);
            }
        }
        query.orderBy('sa.id', 'desc');
        const aktivnosti = await query;
        const obdelaneAktivnosti = aktivnosti.map(a => ({
            ...a,

            slika: normalizirajImgPath(a.slika, '../slike/default-sport.png')
        }));
        res.json(obdelaneAktivnosti);
    } catch (error) {
        console.error('Admin/Trener napaka pri pridobivanju aktivnosti:', error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});

app.post('/api/admin/aktivnosti', preveriZeton, preveriAdminAliTrener, async (req, res) => {
    const { Naziv, Opis, Lokacija, Cena, ProstaMesta, TK_TipAktivnosti, TK_Trener_Select, Datum_Cas_Izvedbe, Nacin_Izvedbe } = req.body;
    let slikaBuffer = null;
    if (!Naziv || !Opis || !Lokacija || Cena === undefined || ProstaMesta === undefined || !TK_TipAktivnosti || !Datum_Cas_Izvedbe || !Nacin_Izvedbe) {
        return res.status(400).json({ message: 'Manjkajoči obvezni podatki za aktivnost (Naziv, Opis, Lokacija, Cena, ProstaMesta, TipAktivnosti, Datum_Cas_Izvedbe so obvezni).' });
    }
    if (isNaN(parseFloat(Cena)) || isNaN(parseInt(ProstaMesta)) || isNaN(parseInt(TK_TipAktivnosti))) {
        return res.status(400).json({ message: 'Cena, ProstaMesta in TK_TipAktivnosti morajo biti veljavna števila.' });
    }
    if (!Date.parse(Datum_Cas_Izvedbe)) {
        return res.status(400).json({ message: 'Neveljaven format datuma in časa izvedbe.' });
    }
    if (req.files && req.files.slikaAktivnosti) {
        const slikaDatoteka = req.files.slikaAktivnosti;
        slikaBuffer = slikaDatoteka.data;
    }
    let dejanskiTrenerId = null;
    if (req.uporabnik.JeAdmin === 1 && TK_Trener_Select && TK_Trener_Select !== 'brez') {
        dejanskiTrenerId = parseInt(TK_Trener_Select);
    } else if (req.uporabnik.jeTrener) {
        const trenerInfo = await knex('Trenerji').where({TK_Uporabnik: req.uporabnik.userId}).first();

        if (trenerInfo) {
            dejanskiTrenerId = trenerInfo.id;
            console.log('Line 1472: ',dejanskiTrenerId)
        } else {
            return res.status(403).json({message: "Vaš trenerski profil ni pravilno nastavljen."});
        }
    }
    console.log()
    console.log(req.body)
    console.log(req.uporabnik)
    try {
        const [id] = await knex('Sportna_Aktivnost').insert({
            Naziv, Opis, Lokacija, Cena: parseFloat(Cena), ProstaMesta: parseInt(ProstaMesta), slika: slikaBuffer,
            TK_TipAktivnosti: parseInt(TK_TipAktivnosti), TK_Trener: dejanskiTrenerId, Datum_Cas_Izvedbe: new Date(Datum_Cas_Izvedbe),
            Nacin_Izvedbe: Nacin_Izvedbe
        });
        res.status(201).json({ message: 'Aktivnost uspešno dodana.', id });
    } catch (error) {
        console.error('Admin/Trener napaka pri dodajanju aktivnosti:', error);
        res.status(500).json({ message: `Napaka na strežniku pri dodajanju aktivnosti: ${error.message}` });
    }
});

app.put('/api/admin/aktivnosti/:id', preveriZeton, preveriAdminAliTrener, async (req, res) => {
    const { id } = req.params;
    const { Naziv, Opis, Lokacija, Cena, ProstaMesta, TK_TipAktivnosti, TK_Trener_Select, Datum_Cas_Izvedbe, odstraniSliko, Nacin_izvedbe } = req.body;
    if (!Naziv || !Opis || !Lokacija || Cena === undefined || ProstaMesta === undefined || !TK_TipAktivnosti || !Datum_Cas_Izvedbe || !Nacin_izvedbe) {
        return res.status(400).json({ message: 'Manjkajoči obvezni podatki.' });
    }
    if (isNaN(parseFloat(Cena)) || isNaN(parseInt(ProstaMesta)) || isNaN(parseInt(TK_TipAktivnosti))) {
        return res.status(400).json({ message: 'Cena, ProstaMesta in TK_TipAktivnosti morajo biti veljavna števila.' });
    }
    if (!Date.parse(Datum_Cas_Izvedbe)) {
        return res.status(400).json({ message: 'Neveljaven format datuma in časa izvedbe.' });
    }
    let podatkiZaPosodobitev = {
        Naziv, Opis, Lokacija, Cena: parseFloat(Cena), ProstaMesta: parseInt(ProstaMesta),
        TK_TipAktivnosti: parseInt(TK_TipAktivnosti), Datum_Cas_Izvedbe: new Date(Datum_Cas_Izvedbe), Nacin_izvedbe: Nacin_izvedbe,
        updated_at: new Date()
    };
    if (req.uporabnik.JeAdmin === 1) {
        podatkiZaPosodobitev.TK_Trener = (TK_Trener_Select && TK_Trener_Select !== 'brez') ? parseInt(TK_Trener_Select) : null;
    } else if (req.uporabnik.jeTrener === 1) {
        const trenerInfo = await knex('Trenerji').where({TK_Uporabnik: req.uporabnik.userId}).first();
        const aktivnost = await knex('Sportna_Aktivnost').where({id: parseInt(id)}).first();
        if (!aktivnost || (trenerInfo && aktivnost.TK_Trener !== trenerInfo.id)) {
            return res.status(403).json({message: "Nimate pravic za urejanje te aktivnosti."});
        }
    }
    if (req.files && req.files.slikaAktivnosti) {
        podatkiZaPosodobitev.slika = req.files.slikaAktivnosti.data;
    } else if (odstraniSliko === 'true' || odstraniSliko === true) {
        podatkiZaPosodobitev.slika = null;
    }
    try {
        const updatedCount = await knex('Sportna_Aktivnost')
            .where({ id: parseInt(id) })
            .update(podatkiZaPosodobitev);
        if (updatedCount === 0) return res.status(404).json({ message: 'Aktivnost ni najdena ali pa ni bilo sprememb za posodobitev.' });
        res.json({ message: 'Aktivnost uspešno posodobljena.' });
    } catch (error) {
        console.error(`Admin/Trener napaka pri urejanju aktivnosti ${id}:`, error);
        res.status(500).json({ message: `Napaka na strežniku pri urejanju aktivnosti: ${error.message}` });
    }
});

app.delete('/api/admin/aktivnosti/:id', preveriZeton, preveriAdminAliTrener, async (req, res) => {
    const { id } = req.params;
    const trx = await knex.transaction();
    try {
        const aktivnost = await trx('Sportna_Aktivnost').where({ id }).first();
        if (!aktivnost) {
            await trx.rollback(); return res.status(404).json({ message: 'Aktivnost ni najdena.' });
        }
        if(req.uporabnik.jeTrener === 1 && req.uporabnik.JeAdmin !== 1) {
            const trenerInfo = await trx('Trenerji').where({TK_Uporabnik: req.uporabnik.userId}).first();
            if(!trenerInfo || aktivnost.TK_Trener !== trenerInfo.id) {
                await trx.rollback(); return res.status(403).json({message: "Nimate pravic za brisanje te aktivnosti."});
            }
        }
        await trx('Ocena_Sporta').where({ TK_SportnaAktivnost: id }).del();
        await trx('Komentarji').where({TK_Aktivnost: id}).del();
        await trx('Sportna_Aktivnost').where({ id }).del();
        await trx.commit();
        res.json({ message: 'Aktivnost, povezane ocene in komentarji uspešno izbrisani.' });
    } catch (error) {
        await trx.rollback();
        console.error(`Admin/Trener napaka pri brisanju aktivnosti ${id}:`, error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});

// --- Upravljanje trenerjev (Samo Admin) ---
app.get('/api/admin/trenerji', preveriZeton, preveriAdmin, async (req, res) => {
    try {
        const trenerji = await knex('Trenerji as t')
            .leftJoin('Uporabniki as u', 't.TK_Uporabnik', 'u.id')
            .select('t.id', 't.ime', 't.priimek', 't.telefon', 't.email as kontakt_email_trenerja', 't.urnik', 't.OpisProfila', 't.Lokacija as lokacija_trenerja',
                'u.id as uporabnik_id', 'u.username as uporabnisko_ime', 'u.email as login_email_uporabnika', 'u.JeAdmin', 'u.jeTrener', 'u.slika as slika_profila_buffer')
            .orderBy('t.priimek', 'asc');
        const obdelaniTrenerji = trenerji.map(t => ({
            ...t,
            slika_profila_base64: normalizirajImgPath(t.slika_profila_buffer, '../slike/default-profile.png'),
            JeAdmin: t.JeAdmin === 1, jeTrener: t.jeTrener === 1
        }));
        res.json(obdelaniTrenerji);
    } catch (error) {
        console.error('Admin napaka pri pridobivanju trenerjev:', error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});

app.post('/api/admin/trenerji', preveriZeton, preveriAdmin, async (req, res) => {
    const {
        username, login_email, geslo, ime, priimek, telefon, kontakt_email, urnik, OpisProfila, lokacija_trenerja, isAdmin
    } = req.body;
    if (!username || !login_email || !geslo || !ime || !priimek || !telefon || !kontakt_email || !urnik || !lokacija_trenerja) {
        return res.status(400).json({ message: 'Manjkajoči obvezni podatki za trenerja ali uporabniški račun.' });
    }
    const trx = await knex.transaction();
    try {
        let obstojecUporabnik = await trx('Uporabniki').whereRaw('LOWER(username) = ?', [username.toLowerCase()]).first();
        if (obstojecUporabnik) { await trx.rollback(); return res.status(409).json({ message: 'Uporabniško ime za prijavo že obstaja.' }); }
        obstojecUporabnik = await trx('Uporabniki').whereRaw('LOWER(email) = ?', [login_email.toLowerCase()]).first();
        if (obstojecUporabnik) { await trx.rollback(); return res.status(409).json({ message: 'Email za prijavo že obstaja.' }); }
        const obstojecTrenerEmail = await trx('Trenerji').whereRaw('LOWER(email) = ?', [kontakt_email.toLowerCase()]).first();
        if (obstojecTrenerEmail) { await trx.rollback(); return res.status(409).json({ message: 'Kontaktni email trenerja že obstaja.' }); }
        const hashiranoGeslo = bcrypt.hashSync(geslo, saltKodiranje);
        const [novUporabnikId] = await trx('Uporabniki').insert({
            username: username, email: login_email, geslo: hashiranoGeslo,
            JeAdmin: isAdmin === true || isAdmin === 'true' ? 1 : 0, jeTrener: 1
        });
        const [novTrenerId] = await trx('Trenerji').insert({
            ime, priimek, telefon, email: kontakt_email, urnik, OpisProfila, Lokacija: lokacija_trenerja, TK_Uporabnik: novUporabnikId
        });
        await trx.commit();
        res.status(201).json({ message: 'Trener in povezan uporabniški račun uspešno dodana.', trenerId: novTrenerId, uporabnikId: novUporabnikId });
    } catch (error) {
        await trx.rollback(); console.error('Admin napaka pri dodajanju trenerja:', error);
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) { return res.status(409).json({message: 'Podvojen vnos, preverite uporabniško ime ali email (DB).'}); }
        res.status(500).json({message: 'Napaka na strežniku pri dodajanju trenerja.'});
    }
});

app.put('/api/admin/trenerji/:id', preveriZeton, preveriAdmin, async (req, res) => {
    const trenerId = parseInt(req.params.id);
    const { username, login_email, novo_geslo, ime, priimek, telefon, kontakt_email, urnik, OpisProfila, lokacija_trenerja, JeAdmin, jeTrener } = req.body;
    const trx = await knex.transaction();
    try {
        const trener = await trx('Trenerji').where({ id: trenerId }).first();
        if (!trener) { await trx.rollback(); return res.status(404).json({ message: 'Trener ni najden.' }); }
        const uporabnikId = trener.TK_Uporabnik;
        if (uporabnikId) {
            const trenutniUporabnik = await trx('Uporabniki').where({ id: uporabnikId }).first();
            if (!trenutniUporabnik) { await trx.rollback(); return res.status(404).json({ message: `Povezan uporabniški račun (ID: ${uporabnikId}) za trenerja ni bil najden.` }); }
            const uporabnikUpdateData = {};
            if (username && username.toLowerCase() !== trenutniUporabnik.username.toLowerCase()) { uporabnikUpdateData.username = username; }
            if (login_email && login_email.toLowerCase() !== trenutniUporabnik.email.toLowerCase()) { uporabnikUpdateData.email = login_email; }
            if (novo_geslo) { uporabnikUpdateData.geslo = bcrypt.hashSync(novo_geslo, saltKodiranje); }
            if (JeAdmin !== undefined) uporabnikUpdateData.JeAdmin = (JeAdmin === true || JeAdmin === 'true' || JeAdmin === 1) ? 1 : 0;
            if (jeTrener !== undefined) uporabnikUpdateData.jeTrener = (jeTrener === true || jeTrener === 'true' || jeTrener === 1) ? 1 : 0;
            if (Object.keys(uporabnikUpdateData).length > 0) { await trx('Uporabniki').where({ id: uporabnikId }).update(uporabnikUpdateData); }
        }
        const trenerUpdateData = {};
        if (ime !== undefined) trenerUpdateData.ime = ime;
        if (priimek !== undefined) trenerUpdateData.priimek = priimek;
        if (telefon !== undefined) trenerUpdateData.telefon = telefon;
        if (kontakt_email && kontakt_email.toLowerCase() !== trener.email.toLowerCase()) { trenerUpdateData.email = kontakt_email; }
        if (urnik !== undefined) trenerUpdateData.urnik = urnik;
        if (OpisProfila !== undefined) trenerUpdateData.OpisProfila = OpisProfila;
        if (lokacija_trenerja !== undefined) trenerUpdateData.Lokacija = lokacija_trenerja;
        if (Object.keys(trenerUpdateData).length > 0) { await trx('Trenerji').where({ id: trenerId }).update(trenerUpdateData); }
        await trx.commit();
        res.json({ message: 'Podatki o trenerju in uporabniškem računu uspešno posodobljeni.' });
    } catch (error) {
        await trx.rollback(); console.error(`Admin napaka pri urejanju trenerja ${trenerId}:`, error);
        res.status(500).json({message: 'Napaka na strežniku pri urejanju trenerja.'});
    }
});

app.delete('/api/admin/trenerji/:id', preveriZeton, preveriAdmin, async (req, res) => {
    const trenerId = req.params.id;
    const trx = await knex.transaction();
    try {
        const trener = await trx('Trenerji').where({ id: trenerId }).first();
        if (!trener) { await trx.rollback(); return res.status(404).json({ message: 'Trener ni najden.' }); }
        const uporabnikId = trener.TK_Uporabnik;
        await trx('Ocena_Trenerja').where({ TK_Trener: trenerId }).del();
        await trx('Sportna_Aktivnost').where({ TK_Trener: trenerId }).update({ TK_Trener: null });
        await trx('TrenerSport').where({TK_Trener: trenerId}).del();
        await trx('Trenerji').where({ id: trenerId }).del();
        if (uporabnikId) {
            const uporabnik = await trx('Uporabniki').where({id: uporabnikId}).first();
            if (uporabnik) {
                await trx('Uporabniki').where({ id: uporabnikId }).update({ jeTrener: 0 });
                console.log(`Uporabniški račun ID ${uporabnikId} posodobljen (jeTrener=0) po brisanju trenerja ID ${trenerId}.`);
            }
        }
        await trx.commit();
        res.json({ message: 'Trener in povezave uspešno izbrisane/posodobljene.' });
    } catch (error) {
        await trx.rollback(); console.error(`Admin napaka pri brisanju trenerja ${trenerId}:`, error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});

// === UPRAVLJANJE S ŠPORTI (ADMIN) ===
app.post('/api/admin/sporti', preveriZeton, preveriAdmin, async (req, res) => {
    const { ime_sporta, opis_sporta } = req.body;
    if (!ime_sporta) { return res.status(400).json({ message: "Ime športa je obvezno." }); }
    try {
        const obstojecSport = await knex('Sport').whereRaw('LOWER(Sport) = ?', [ime_sporta.toLowerCase()]).first();
        if (obstojecSport) { return res.status(409).json({ message: "Šport s tem imenom že obstaja." }); }
        const [id] = await knex('Sport').insert({ Sport: ime_sporta, Opis: opis_sporta || null });
        res.status(201).json({ message: "Šport uspešno dodan.", id });
    } catch (error) {
        console.error("Admin napaka pri dodajanju športa:", error);
        res.status(500).json({ message: "Napaka na strežniku pri dodajanju športa." });
    }
});

app.put('/api/admin/sporti/:id', preveriZeton, preveriAdmin, async (req, res) => {
    const { id } = req.params;
    const { ime_sporta, opis_sporta } = req.body;
    if (!ime_sporta) { return res.status(400).json({ message: "Ime športa je obvezno." }); }
    try {
        const sport = await knex('Sport').where({id}).first();
        if(!sport) return res.status(404).json({message: "Šport ni najden."});
        if (ime_sporta.toLowerCase() !== sport.Sport.toLowerCase()) {
            const obstojecSport = await knex('Sport').whereRaw('LOWER(Sport) = ?', [ime_sporta.toLowerCase()]).whereNot({id}).first();
            if (obstojecSport) { return res.status(409).json({ message: "Šport s tem imenom že obstaja." }); }
        }
        await knex('Sport').where({ id }).update({ Sport: ime_sporta, Opis: opis_sporta || null });
        res.json({ message: "Šport uspešno posodobljen." });
    } catch (error) {
        console.error(`Admin napaka pri urejanju športa ${id}:`, error);
        res.status(500).json({ message: "Napaka na strežniku pri urejanju športa." });
    }
});

app.delete('/api/admin/sporti/:id', preveriZeton, preveriAdmin, async (req, res) => {
    const { id } = req.params;
    const trx = await knex.transaction();
    try {
        const sport = await trx('Sport').where({id}).first();
        if(!sport) { await trx.rollback(); return res.status(404).json({message: "Šport ni najden."}); }
        const uporabljenVAktivnostih = await trx('Sportna_Aktivnost').where({TK_TipAktivnosti: id}).first();
        const uporabljenVTrenerjih = await trx('TrenerSport').where({TK_Sport: id}).first();
        if(uporabljenVAktivnostih || uporabljenVTrenerjih) {
            await trx.rollback(); return res.status(400).json({message: "Športa ni mogoče izbrisati, ker je v uporabi pri aktivnostih ali trenerjih."});
        }
        await trx('Sport').where({ id }).del();
        await trx.commit();
        res.json({ message: "Šport uspešno izbrisan." });
    } catch (error) {
        await trx.rollback(); console.error(`Admin napaka pri brisanju športa ${id}:`, error);
        res.status(500).json({ message: "Napaka na strežniku pri brisanju športa." });
    }
});

// === UPRAVLJANJE Z UPORABNIKI (ADMIN) ===
app.get('/api/admin/uporabniki', preveriZeton, preveriAdmin, async (req, res) => {
    try {
        const uporabniki = await knex('Uporabniki')
            .select('id', 'username', 'email', 'JeAdmin', 'jeTrener', 'created_at', 'updated_at', 'slika')
            .orderBy('id', 'asc');
        const obdelaniUporabniki = uporabniki.map(u => ({
            ...u, slika_base64: normalizirajImgPath(u.slika, '../slike/default-profile.png'),
            JeAdmin: u.JeAdmin === 1, jeTrener: u.jeTrener === 1, slika: undefined
        }));
        res.json(obdelaniUporabniki);
    } catch (error) {
        console.error("Admin napaka pri pridobivanju uporabnikov:", error);
        res.status(500).json({ message: "Napaka na strežniku." });
    }
});

app.put('/api/admin/uporabniki/:id', preveriZeton, preveriAdmin, async (req, res) => {
    const { id } = req.params;
    const { username, email, JeAdmin, jeTrener, novo_geslo } = req.body;
    try {
        const uporabnik = await knex('Uporabniki').where({id}).first();
        if(!uporabnik) return res.status(404).json({message: "Uporabnik ni najden."});
        const updateData = {};
        if (username && username.toLowerCase() !== uporabnik.username.toLowerCase()) {
            const obstojec = await knex('Uporabniki').whereRaw('LOWER(username) = ?', [username.toLowerCase()]).whereNot({id}).first();
            if(obstojec) return res.status(409).json({message: "Uporabniško ime je že zasedeno."});
            updateData.username = username;
        }
        if (email && email.toLowerCase() !== uporabnik.email.toLowerCase()) {
            const obstojec = await knex('Uporabniki').whereRaw('LOWER(email) = ?', [email.toLowerCase()]).whereNot({id}).first();
            if(obstojec) return res.status(409).json({message: "Email je že zaseden."});
            updateData.email = email;
        }
        if (JeAdmin !== undefined) updateData.JeAdmin = (JeAdmin === true || JeAdmin === 'true' || JeAdmin === 1) ? 1 : 0;
        if (jeTrener !== undefined) updateData.jeTrener = (jeTrener === true || jeTrener === 'true' || jeTrener === 1) ? 1 : 0;
        if (novo_geslo) { updateData.geslo = bcrypt.hashSync(novo_geslo, saltKodiranje); }
        if (Object.keys(updateData).length > 0) { await knex('Uporabniki').where({id}).update(updateData); }
        if (updateData.jeTrener === 1 && !(await knex('Trenerji').where({TK_Uporabnik: id}).first())) {
            await knex('Trenerji').insert({
                ime: uporabnik.username, priimek: '', email: `trener-${uporabnik.email}`, TK_Uporabnik: id
            });
        } else if (updateData.jeTrener === 0 && (await knex('Trenerji').where({TK_Uporabnik: id}).first())) {
            await knex('TrenerSport').whereIn('TK_Trener', function() { this.select('id').from('Trenerji').where('TK_Uporabnik', id); }).del();
            await knex('Trenerji').where({TK_Uporabnik: id}).del();
        }
        res.json({message: "Uporabnik uspešno posodobljen."});
    } catch (error) {
        console.error(`Admin napaka pri urejanju uporabnika ${id}:`, error);
        res.status(500).json({message: "Napaka na strežniku."});
    }
});

app.delete('/api/admin/uporabniki/:id', preveriZeton, preveriAdmin, async (req, res) => {
    const { id } = req.params;
    if (parseInt(id) === req.uporabnik.userId) {
        return res.status(403).json({message: "Administrator ne more izbrisati lastnega računa."});
    }
    const trx = await knex.transaction();
    try {
        const uporabnik = await trx('Uporabniki').where({id}).first();
        if(!uporabnik) { await trx.rollback(); return res.status(404).json({message: "Uporabnik ni najden."}); }
        await trx('osvezilniTokens').where({user_id: id}).del();
        await trx('Ocena_Sporta').where({TK_Uporabnik: id}).del();
        await trx('Ocena_Trenerja').where({TK_Uporabnik: id}).del();
        await trx('Komentarji').where({TK_Uporabnik: id}).del();
        if (uporabnik.jeTrener === 1) {
            const trenerInfo = await trx('Trenerji').where({TK_Uporabnik: id}).first();
            if(trenerInfo){
                await trx('Sportna_Aktivnost').where({TK_Trener: trenerInfo.id}).update({TK_Trener: null});
                await trx('TrenerSport').where({TK_Trener: trenerInfo.id}).del();
                await trx('Trenerji').where({TK_Uporabnik: id}).del();
            }
        }
        await trx('Uporabniki').where({id}).del();
        await trx.commit();
        res.json({message: "Uporabnik in vsi povezani podatki uspešno izbrisani."});
    } catch (error) {
        await trx.rollback(); console.error(`Admin napaka pri brisanju uporabnika ${id}:`, error);
        res.status(500).json({message: "Napaka na strežniku."});
    }
});

app.get('/api/trener/count', async (req, res) => {
    try {
        const rezultat = await knex('Trenerji').count('id as count').first();
        const steviloTrenerjev = rezultat ? parseInt(rezultat.count, 10) : 0;

        // Onemogoči predpomnjenje za ta odgovor
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // HTTP 1.1.
        res.setHeader('Pragma', 'no-cache'); // HTTP 1.0.
        res.setHeader('Expires', '0'); // Proxies.

        res.json({ steviloTrenerjev: steviloTrenerjev });
    } catch (error) {
        console.error('Napaka pri pridobivanju števila trenerjev:', error);
        res.status(500).json({ message: 'Napaka na strežniku pri pridobivanju števila trenerjev.' });
    }
});

app.get('/api/ocene/count', async (req, res) => {
    try {
        const rezultatOcenTrenera = await knex('Ocena_Trenerja').count('id as count').first();
        const rezultatOcenSporta = await knex('Ocena_Sporta').count('id as count').first(); // Preimenovano za jasnost
        const steviloOcenTrenerjev = rezultatOcenTrenera ? parseInt(rezultatOcenTrenera.count, 10) : 0;
        const steviloOcenSportnihAktivnosti = rezultatOcenSporta ? parseInt(rezultatOcenSporta.count, 10) : 0;
        const skupnoSteviloOcen = steviloOcenTrenerjev + steviloOcenSportnihAktivnosti;
        res.json({ skupnoSteviloOcen: skupnoSteviloOcen });

    } catch (error) {
        console.error('Napaka pri pridobivanju skupnega števila ocen:', error);
        res.status(500).json({ message: 'Napaka na strežniku pri pridobivanju skupnega števila ocen.' });
    }
});

app.get('/api/aktivnost/count', async (req, res) => { // Dodana začetna poševnica
    try{
        const rezultat = await knex('Sportna_Aktivnost').count('id as count').first();
        const steviloAktivnosti = rezultat ? parseInt(rezultat.count, 10) : 0; // Dodan parseInt za vsak slučaj
        res.json({steviloAktivnosti: steviloAktivnosti});

    } catch (error) {
        console.error('Napaka pri pridobivanju števila aktivnosti:', error);
        // Popravljeno sporočilo o napaki
        res.status(500).json({ message: 'Napaka na strežniku pri pridobivanju števila aktivnosti.' });
    }
});

app.get('/api/klepeti', preveriZeton, async (req, res) => {
    const userId = req.uporabnik.userId;
    try {
        const trenerZapis = await knex('Trenerji').where({ TK_Uporabnik: userId }).first();
        const trenerId = trenerZapis ? trenerZapis.id : null;

        let klepetiQuery = knex('Klepeti as k')
            .join('Uporabniki as u', 'k.uporabnik_id', 'u.id')
            .join('Trenerji as t', 'k.trener_id', 't.id')
            .join('Uporabniki as ut', 't.TK_Uporabnik', 'ut.id')
            .select(
                'k.id as klepet_id',
                'u.id as uporabnik_id', 'u.username as uporabnik_username', 'u.slika as uporabnik_slika',
                't.id as trener_db_id', 't.ime as trener_ime', 't.priimek as trener_priimek', 'ut.slika as trener_slika',
                'ut.id as trener_povezan_uporabnik_id'
            );

        if (trenerId) {
            klepetiQuery.where('k.uporabnik_id', userId).orWhere('k.trener_id', trenerId);
        } else {
            klepetiQuery.where('k.uporabnik_id', userId);
        }

        const klepeti = await klepetiQuery;

        const klepetiZaPosiljanje = await Promise.all(klepeti.map(async (klepet) => {
            const zadnjeSporocilo = await knex('Sporočila')
                .where({ klepet_id: klepet.klepet_id })
                .orderBy('created_at', 'desc')
                .first();

            let sogovornik = {};
            if (req.uporabnik.userId === klepet.uporabnik_id) {
                sogovornik = {
                    id: klepet.trener_povezan_uporabnik_id,
                    ime: `${klepet.trener_ime} ${klepet.trener_priimek}`,
                    slika: normalizirajImgPath(klepet.trener_slika),
                };
            } else {
                sogovornik = {
                    id: klepet.uporabnik_id,
                    ime: klepet.uporabnik_username,
                    slika: normalizirajImgPath(klepet.uporabnik_slika),
                };
            }

            return {
                klepet_id: klepet.klepet_id,
                sogovornik: sogovornik,
                zadnje_sporocilo: zadnjeSporocilo || null
            };
        }));

        klepetiZaPosiljanje.sort((a, b) => {
            if (!a.zadnje_sporocilo) return 1;
            if (!b.zadnje_sporocilo) return -1;
            return new Date(b.zadnje_sporocilo.created_at) - new Date(a.zadnje_sporocilo.created_at);
        });

        res.json(klepetiZaPosiljanje);
    } catch (error) {
        console.error('Napaka pri pridobivanju klepetov:', error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});

// Pridobi vsa sporočila za določen klepet
app.get('/api/klepeti/:klepetId/sporocila', preveriZeton, async (req, res) => {
    const { klepetId } = req.params;
    const userId = req.uporabnik.userId;
    try {
        const klepet = await knex('Klepeti').where({ id: klepetId }).first();
        if (!klepet) return res.status(404).json({ message: 'Klepet ni najden.' });

        const trenerZapis = await knex('Trenerji').where({ id: klepet.trener_id }).first();

        if (klepet.uporabnik_id !== userId && trenerZapis.TK_Uporabnik !== userId) {
            return res.status(403).json({ message: 'Nimate dostopa do tega klepeta.' });
        }

        const sporocila = await knex('Sporočila')
            .where({ klepet_id: klepetId })
            .orderBy('created_at', 'asc');

        res.json(sporocila);
    } catch (error) {
        console.error('Napaka pri pridobivanju sporočil:', error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});

// Pošlji novo sporočilo
app.post('/api/klepeti/sporocila', preveriZeton, async (req, res) => {
    const posiljateljId = req.uporabnik.userId;
    const jePosiljateljTrener = req.uporabnik.jeTrener;
    const { prejemnikUporabnikId, vsebina } = req.body;

    if (!prejemnikUporabnikId || !vsebina) {
        return res.status(400).json({ message: 'Prejemnik in vsebina sta obvezna.' });
    }
    if (posiljateljId === prejemnikUporabnikId) {
        return res.status(400).json({ message: 'Ne morete pošiljati sporočil samemu sebi.' });
    }

    const trx = await knex.transaction();
    try {
        const prejemnik = await trx('Uporabniki').where({id: prejemnikUporabnikId}).first();
        if(!prejemnik) {
            await trx.rollback();
            return res.status(404).json({message: "Prejemnik ni najden"});
        }

        let uporabnikId;
        let trenerDbId;

        if(jePosiljateljTrener) {
            uporabnikId = prejemnikUporabnikId;
            const trenerZapis = await trx('Trenerji').where({TK_Uporabnik: posiljateljId}).first();
            if(!trenerZapis) { throw new Error("Vaš trenerski profil ni bil najden."); }
            trenerDbId = trenerZapis.id;
        } else {
            uporabnikId = posiljateljId;
            const trenerZapis = await trx('Trenerji').where({TK_Uporabnik: prejemnikUporabnikId}).first();
            if(!trenerZapis) { throw new Error("Ciljni uporabnik ni trener."); }
            trenerDbId = trenerZapis.id;
        }

        let klepet = await trx('Klepeti').where({ uporabnik_id: uporabnikId, trener_id: trenerDbId }).first();
        let klepetId;

        if (klepet) {
            klepetId = klepet.id;
        } else {
            const [novKlepetId] = await trx('Klepeti').insert({ uporabnik_id: uporabnikId, trener_id: trenerDbId });
            klepetId = novKlepetId;
        }

        const [sporociloId] = await trx('Sporočila').insert({
            klepet_id: klepetId,
            vsebina: vsebina,
            posiljatelj_id: posiljateljId,
            tip_posiljatelja: jePosiljateljTrener ? 'trener' : 'uporabnik'
        });

        const novoSporocilo = await trx('Sporočila').where({id: sporociloId}).first();
        await trx.commit();

        // Pošlji sporočilo preko Socket.IO vsem v sobi
        const chatRoom = `klepet_${klepetId}`;
        io.to(chatRoom).emit('receive_message', novoSporocilo);

        res.status(201).json(novoSporocilo);

    } catch (error) {
        await trx.rollback();
        console.error('Napaka pri pošiljanju sporočila (POST):', error);
        res.status(500).json({ message: 'Napaka na strežniku pri pošiljanju sporočila.', details: error.message });
    }
});

app.get('/api/uporabnik/:id/details', preveriZeton, async (req, res) => {
    const { id } = req.params;
    try {
        const uporabnik = await knex('Uporabniki').where({id}).first();
        if(!uporabnik) return res.status(404).json({message: "Uporabnik ni najden"});

        let ime_prikazno = uporabnik.username;
        if(uporabnik.jeTrener) {
            const trener = await knex('Trenerji').where({TK_Uporabnik: id}).first();
            if(trener) {
                ime_prikazno = `${trener.ime} ${trener.priimek}`;
            }
        }
        res.json({id: uporabnik.id, ime_prikazno: ime_prikazno});
    } catch(e) {
        res.status(500).json({message: "Napaka strežnika"});
    }
});

app.post('/api/pozabljeno-geslo', async (req, res) => {
    const { email } = req.body;
    try {
        const uporabnik = await knex('Uporabniki').where({ email }).first();

        if (uporabnik) {
            const resetToken = jwt.sign(
                { userId: uporabnik.id, type: 'password-reset' },
                JWT_SECRET,
                { expiresIn: '15m' }
            );

            // === TUKAJ JE POPRAVEK ===
            const resetLink = `/html/ponastavi-geslo.html?token=${resetToken}`;

            const mailOptions = {
                from: `"Sportaj.si" <${process.env.EMAIL_USER}>`,
                to: uporabnik.email,
                subject: 'Zahteva za ponastavitev gesla',
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <h2>Pozdravljeni, ${uporabnik.username}!</h2>
                        <p>Prejeli smo zahtevo za ponastavitev vašega gesla. Če zahteve niste podali vi, to sporočilo ignorirajte.</p>
                        <p>Za ponastavitev gesla kliknite na spodnjo povezavo. Povezava je veljavna 15 minut.</p>
                        <p style="text-align: center;">
                            <a href="${resetLink}" style="display: inline-block; padding: 12px 25px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                                Ponastavi geslo
                            </a>
                        </p>
                        <p>Če gumb ne deluje, kopirajte in prilepite naslednjo povezavo v vaš brskalnik:<br>
                        <a href="${resetLink}">${resetLink}</a></p>
                        <p>Lep pozdrav,<br><b>Ekipa Sportaj.si</b></p>
                    </div>
                `
            };
            await transporter.sendMail(mailOptions);
        }
        res.status(200).json({ message: 'Če je vaš e-poštni naslov v naši bazi, smo vam poslali navodila za ponastavitev.' });
    } catch (error) {
        console.error('Napaka pri pošiljanju emaila za ponastavitev:', error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});

// 2. Uporabnik ponastavi geslo z žetonom
app.post('/api/ponastavi-geslo', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Manjkajo podatki za ponastavitev.' });
    }

    try {
        // Preverimo veljavnost žetona
        const payload = jwt.verify(token, JWT_SECRET);

        if(payload.type !== 'password-reset'){
            return res.status(400).json({ message: 'Neveljaven tip žetona.' });
        }

        const userId = payload.userId;

        // Hashiramo novo geslo
        const hashedPassword = await bcrypt.hash(newPassword, saltKodiranje);

        // Posodobimo geslo v bazi
        await knex('Uporabniki')
            .where({ id: userId })
            .update({ geslo: hashedPassword });

        // (Opcijsko) Pošljemo potrditveni email, da je bilo geslo spremenjeno
        const uporabnik = await knex('Uporabniki').where({id: userId}).first();
        if(uporabnik){
            const confirmationMailOptions = {
                from: `"Sportaj.si" <${process.env.EMAIL_USER}>`,
                to: uporabnik.email,
                subject: 'Vaše geslo je bilo uspešno spremenjeno',
                html: `<p>Pozdravljeni ${uporabnik.username}, vaše geslo za dostop do platforme Sportaj.si je bilo uspešno spremenjeno.</p>`
            };
            await transporter.sendMail(confirmationMailOptions);
        }

        res.status(200).json({ message: 'Geslo je bilo uspešno ponastavljeno. Preusmerjam na prijavo...' });

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(400).json({ message: 'Povezava za ponastavitev je potekla. Prosimo, zahtevajte novo.' });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({ message: 'Povezava za ponastavitev ni veljavna.' });
        }
        console.error('Napaka pri ponastavljanju gesla:', error);
        res.status(500).json({ message: 'Napaka na strežniku.' });
    }
});
app.post('/api/aktivnosti/:id/prijava', preveriZeton, async (req, res) => {
    const aktivnostId = parseInt(req.params.id);
    const userId = req.uporabnik.userId;

    const trx = await knex.transaction();
    try {
        const aktivnost = await trx('Sportna_Aktivnost').where('id', aktivnostId).forUpdate().first();

        if (!aktivnost) {
            await trx.rollback();
            return res.status(404).json({ message: 'Aktivnost ni najdena.' });
        }

        if (aktivnost.ProstaMesta <= 0) {
            await trx.rollback();
            return res.status(400).json({ message: 'Za to aktivnost ni več prostih mest.' });
        }

        const obstojecaPrijava = await trx('PrijaveNaAktivnosti')
            .where({ TK_Uporabnik: userId, TK_Aktivnost: aktivnostId })
            .first();

        if (obstojecaPrijava) {
            await trx.rollback();
            return res.status(409).json({ message: 'Na to aktivnost ste že prijavljeni.' });
        }

        await trx('PrijaveNaAktivnosti').insert({
            TK_Uporabnik: userId,
            TK_Aktivnost: aktivnostId
        });

        const novaProstaMesta = aktivnost.ProstaMesta - 1;
        await trx('Sportna_Aktivnost').where('id', aktivnostId).update({ ProstaMesta: novaProstaMesta });

        await trx.commit();

        io.emit('spots-updated', {
            aktivnostId: aktivnostId,
            prostaMesta: novaProstaMesta
        });

        const uporabnik = await knex('Uporabniki').where('id', userId).first();
        if (uporabnik) {
            const mailOptions = {
                from: `"Sportaj.si" <vunic.alan@gmail.com>`,
                to: uporabnik.email,
                subject: `Potrditev prijave na ${aktivnost.Naziv}`,
                html: `<h1>Pozdravljeni, ${uporabnik.username}!</h1><p>Uspešno ste se prijavili na aktivnost: <strong>${aktivnost.Naziv}</strong>.</p><p>Hvala za prijavo!</p><p>Ekipa Sportaj.si</p>`
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) console.error("Napaka pri pošiljanju emaila:", error);
                else console.log('Email poslan: ' + info.response);
            });
        }

        res.status(200).json({
            message: 'Uspešno ste se prijavili na aktivnost!',
            prostaMesta: novaProstaMesta
        });

    } catch (error) {
        await trx.rollback();
        console.error('Napaka pri prijavi na aktivnost:', error);
        res.status(400).json({ message: error.message || 'Napaka na strežniku.' });
    }
});


// Pot za odjavo uporabnika z aktivnosti
app.post('/api/aktivnosti/:id/odjava', preveriZeton, async (req, res) => {
    const aktivnostId = parseInt(req.params.id);
    const userId = req.uporabnik.userId;

    const trx = await knex.transaction();
    try {
        const prijava = await trx('PrijaveNaAktivnosti')
            .where({ TK_Uporabnik: userId, TK_Aktivnost: aktivnostId })
            .first();

        if (!prijava) {
            throw new Error('Niste prijavljeni na to aktivnost.');
        }

        await trx('PrijaveNaAktivnosti').where('id', prijava.id).del();
        await trx('Sportna_Aktivnost').where('id', aktivnostId).increment('ProstaMesta', 1);

        const posodobljenaAktivnost = await trx('Sportna_Aktivnost').where('id', aktivnostId).first();
        const novaProstaMesta = posodobljenaAktivnost.ProstaMesta;


        await trx.commit();

        io.emit('spots-updated', {
            aktivnostId: aktivnostId,
            prostaMesta: novaProstaMesta
        });

        res.status(200).json({
            message: 'Uspešno ste se odjavili z aktivnosti.',
            prostaMesta: novaProstaMesta
        });

    } catch (error) {
        await trx.rollback();
        console.error('Napaka pri odjavi z aktivnosti:', error.message);
        res.status(400).json({ message: error.message || 'Napaka na strežniku.' });
    }
});



// ===============================================
// === Socket.IO in zagon strežnika ============
// ===============================================

io.on('connection', (socket) => {
    console.log('[SOCKET.IO] Uporabnik povezan:', socket.id);

    socket.on('join_chat_room', (data) => {
        if (data && data.klepetId) {
            const chatRoom = `klepet_${data.klepetId}`;
            socket.join(chatRoom);
            console.log(`[SOCKET.IO] Uporabnik ${socket.id} se je pridružil sobi ${chatRoom}`);
        }
    });

    socket.on('leave_chat_room', (data) => {
        if (data && data.klepetId) {
            const chatRoom = `klepet_${data.klepetId}`;
            socket.leave(chatRoom);
            console.log(`[SOCKET.IO] Uporabnik ${socket.id} je zapustil sobo ${chatRoom}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('[SOCKET.IO] Uporabnik je prekinil povezavo:', socket.id);
    });
});

// Zaganjanje strežnika
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Strežnik teče na vratih ${PORT} in je pripravljen za povezave.`);
});