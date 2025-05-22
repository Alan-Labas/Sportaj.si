const express = require('express');
const app = express();
const PORT = 3000;
const jwt = require('jsonwebtoken');
const path = require('path');

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
        password: 'Smetar245',
        database: 'sportaj_si',
    }
});

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(fileUpload({createParentPath: true}));

app.use(express.static(path.join(__dirname, '../www')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../www/html/index.html'));
});
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../www/html/index.html'));
});
app.get('/uredi-profil.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../www/html/uredi-profil.html'));
});
app.get('/html/uredi-profil.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../www/html/uredi-profil.html'));
});
app.get('/html/profilTrener.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../www/html/profilTrener.html'));
});
app.get('/html/admin-panel.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../www/html/admin-panel.html'));
});


function preveriZeton(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err) {
            console.error('Napaka pri preverjanju dostopnega žetona:', err.message);
            return res.status(403).json({message: 'Dostopni žeton je neveljaven ali potekel.'});
        }
        if (payload.type !== 'access') {
            console.error('Napačen tip žetona poslan kot dostopni žeton.');
            return res.status(403).json({message: 'Neveljaven tip dostopnega žetona.'});
        }
        req.uporabnik = payload;
        next();
    });
}

function preveriAdmin(req, res, next) {
    if (!req.uporabnik || req.uporabnik.JeAdmin !== 1) {
        return res.status(403).json({message: 'Dostop zavrnjen. Zahtevane so administratorske pravice.'});
    }
    next();
}

// === API TOČKE ZA ŠPORTE ===
app.get('/api/vsi-sporti', async (req, res) => {
    try {
        const sporti = await knex('Sport').select('id', 'Sport');
        const sportiSlike = sporti.map(s => ({
            ...s,
            slika: `/slike/${s.Sport.toLowerCase().replace(/\s+/g, '-').replace(/č/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z')}.png`
        }));
        res.json(sportiSlike);
    } catch (error) {
        console.error('Napaka pri pridobivanju vseh športov:', error);
        res.status(500).json({message: 'Napaka na strežniku pri pridobivanju športov.'});
    }
});

app.get('/api/sport/:id/details', async (req, res) => {
    const {id} = req.params;
    try {
        const sport = await knex('Sport').where({id}).first();
        if (!sport) {
            return res.status(404).json({message: 'Šport ni najden.'});
        }
        const aktivnosti = await knex('Sportna_Aktivnost as sa')
            .leftJoin('Trenerji as t', 'sa.TK_Trener', 't.id')
            .where({'sa.TK_TipAktivnosti': id})
            .select('sa.id', 'sa.Naziv', 'sa.Lokacija', 'sa.Cena', 'sa.slika',
                't.ime as trener_ime', 't.priimek as trener_priimek')
            .limit(10);
        const aktivnostiSpremenjeneSlike = aktivnosti.map(akt => {
            let slikaPath = akt.slika;
            if (slikaPath && slikaPath.startsWith('../slike/')) {
                slikaPath = slikaPath.replace('../slike/', '/slike/');
            } else if (slikaPath && !slikaPath.startsWith('/slike/')) {
                slikaPath = `/slike/${slikaPath}`;
            }
            return {...akt, slika: slikaPath || '/slike/default-sport.png'};
        });
        res.json({...sport, aktivnosti: aktivnostiSpremenjeneSlike});
    } catch (error) {
        console.error(`Napaka pri pridobivanju podrobnosti športa ${id}:`, error);
        res.status(500).json({message: 'Napaka na strežniku.'});
    }
});

// === API TOČKE ZA ŠPORTNE AKTIVNOSTI (javne) ===
app.get('/api/prihajajoce-dejavnosti', async (req, res) => {
    try {
        const aktivnosti = await knex('Sportna_Aktivnost as sa')
            .join('Sport as s', 'sa.TK_TipAktivnosti', 's.id')
            .select('sa.id', 'sa.Naziv', 'sa.Opis', 'sa.Lokacija', 'sa.Cena', 'sa.ProstaMesta', 'sa.slika', 's.Sport as ime_sporta')
            .orderBy('sa.id', 'desc')
            .limit(12);
        const obdelaneAktivnosti = aktivnosti.map(a => {
            let slikaPath = a.slika;
            if (slikaPath && slikaPath.startsWith('../slike/')) {
                slikaPath = slikaPath.replace('../slike/', '/slike/');
            } else if (slikaPath && !slikaPath.startsWith('/slike/')) {
                slikaPath = `/slike/${slikaPath}`;
            }
            return {...a, slika: slikaPath || '/slike/default-sport.png'}
        });
        res.json(obdelaneAktivnosti);
    } catch (error) {
        console.error('Napaka pri pridobivanju prihajajočih dejavnosti:', error);
        res.status(500).json({message: 'Napaka na strežniku.'});
    }
});

app.get('/api/dejavnosti-okolica', async (req, res) => {
    try {
        const aktivnosti = await knex('Sportna_Aktivnost as sa')
            .join('Sport as s', 'sa.TK_TipAktivnosti', 's.id')
            .select('sa.id', 'sa.Naziv', 'sa.Opis', 'sa.Lokacija', 'sa.Cena', 'sa.ProstaMesta', 'sa.slika', 's.Sport as ime_sporta')
            .limit(12);
        const obdelaneAktivnosti = aktivnosti.map(a => {
            let slikaPath = a.slika;
            if (slikaPath && slikaPath.startsWith('../slike/')) {
                slikaPath = slikaPath.replace('../slike/', '/slike/');
            } else if (slikaPath && !slikaPath.startsWith('/slike/')) {
                slikaPath = `/slike/${slikaPath}`;
            }
            return {...a, slika: slikaPath || '/slike/default-sport.png'}
        });
        res.json(obdelaneAktivnosti);
    } catch (error) {
        console.error('Napaka pri pridobivanju dejavnosti v okolici:', error);
        res.status(500).json({message: 'Napaka na strežniku.'});
    }
});

app.get('/api/aktivnost/:id/details', async (req, res) => {
    const {id} = req.params;
    try {
        const aktivnost = await knex('Sportna_Aktivnost as sa')
            .where('sa.id', id)
            .join('Sport as s', 'sa.TK_TipAktivnosti', 's.id')
            .leftJoin('Trenerji as t', 'sa.TK_Trener', 't.id')
            .select('sa.*', 's.Sport as ime_sporta',
                't.id as TK_Trener',
                't.ime as trener_ime', 't.priimek as trener_priimek',
                't.email as trener_email', 't.telefon as trener_telefon', 't.urnik as urnik_trenerja')
            .first();
        if (!aktivnost) {
            return res.status(404).json({message: 'Športna aktivnost ni najdena.'});
        }
        const ocene = await knex('Ocena_Sporta as os')
            .join('Uporabniki as u', 'os.TK_Uporabnik', 'u.id')
            .where({'os.TK_SportnaAktivnost': id})
            .select('os.id as ocena_id', 'os.Komentar', 'os.Ocena', 'os.Datum', 'u.username as username_uporabnika', 'u.id as uporabnik_id')
            .orderBy('os.created_at', 'desc');
        let slikaPath = aktivnost.slika;
        if (slikaPath && slikaPath.startsWith('../slike/')) {
            slikaPath = slikaPath.replace('../slike/', '/slike/');
        } else if (slikaPath && !slikaPath.startsWith('/slike/')) {
            slikaPath = `/slike/${slikaPath}`;
        }
        aktivnost.slika = slikaPath || '/slike/default-sport.png';
        res.json({...aktivnost, ocene});
    } catch (error) {
        console.error(`Napaka pri pridobivanju podrobnosti aktivnosti ${id}:`, error);
        res.status(500).json({message: 'Napaka na strežniku.'});
    }
});

// === API TOČKE ZA TRENERJE (javne) ===
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
                't.id', 't.ime', 't.priimek', 't.OpisProfila', 'u.slika',
                'o.povprecna_ocena', 't.urnik', 't.email as kontakt_email', 't.telefon'
            )
            .orderByRaw('COALESCE(o.povprecna_ocena, 0) DESC, t.priimek ASC, t.ime ASC');
        const obdelaniTrenerji = trenerji.map(t => ({
            ...t,
            slika: t.slika ? t.slika.toString('base64') : null
        }));
        res.json(obdelaniTrenerji);
    } catch (error) {
        console.error('Napaka pri pridobivanju vseh trenerjev:', error);
        res.status(500).json({message: 'Napaka na strežniku pri pridobivanju vseh trenerjev.'});
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
            .select('t.id', 't.ime', 't.priimek', 't.OpisProfila', 'u.slika',
                'o.povprecna_ocena', 't.urnik')
            .orderBy([{column: 'o.povprecna_ocena', order: 'desc', nulls: 'last'}, {column: 't.priimek', order: 'asc'}])
            .limit(12);
        const obdelaniTrenerji = trenerji.map(t => ({
            ...t,
            slika: t.slika ? t.slika.toString('base64') : null
        }));
        res.json(obdelaniTrenerji);
    } catch (error) {
        console.error('Napaka pri pridobivanju priporočenih trenerjev:', error);
        res.status(500).json({message: 'Napaka na strežniku.'});
    }
});

app.get('/api/trenerji-okolica', async (req, res) => {
    try {
        const subqueryOcene = knex('Ocena_Trenerja')
            .select('TK_Trener')
            .avg('Ocena as povprecna_ocena')
            .groupBy('TK_Trener')
            .as('o');
        const trenerji = await knex('Trenerji as t')
            .join('Uporabniki as u', 't.TK_Uporabnik', 'u.id')
            .leftJoin(subqueryOcene, 't.id', 'o.TK_Trener')
            .select('t.id', 't.ime', 't.priimek', 't.OpisProfila', 'u.slika',
                'o.povprecna_ocena', 't.urnik')
            .limit(12);
        const obdelaniTrenerji = trenerji.map(t => ({
            ...t,
            slika: t.slika ? t.slika.toString('base64') : null
        }));
        res.json(obdelaniTrenerji);
    } catch (error) {
        console.error('Napaka pri pridobivanju trenerjev v okolici:', error);
        res.status(500).json({message: 'Napaka na strežniku.'});
    }
});

app.get('/api/trener/:id/details', async (req, res) => {
    const {id} = req.params;
    try {
        const trener = await knex('Trenerji as t')
            .join('Uporabniki as u', 't.TK_Uporabnik', 'u.id')
            .where('t.id', id)
            .select('t.*', 'u.slika as slika_uporabnika')
            .first();
        if (!trener) {
            return res.status(404).json({message: 'Trener ni najden.'});
        }
        const aktivnosti = await knex('Sportna_Aktivnost as sa')
            .join('Sport as s', 'sa.TK_TipAktivnosti', 's.id')
            .where({'sa.TK_Trener': id})
            .select('sa.id', 'sa.Naziv', 'sa.Lokacija', 'sa.Cena', 's.Sport as ime_sporta', 'sa.slika as slika_aktivnosti');
        const ocene = await knex('Ocena_Trenerja as ot')
            .join('Uporabniki as u_ocenjevalec', 'ot.TK_Uporabnik', 'u_ocenjevalec.id')
            .where({'ot.TK_Trener': id})
            .select('ot.id as ocena_id', 'ot.Komentar', 'ot.Ocena', 'ot.Datum', 'u_ocenjevalec.username as username_uporabnika', 'u_ocenjevalec.id as uporabnik_id')
            .orderBy('ot.created_at', 'desc');
        const trenerZaPosiljanje = {
            ...trener,
            slika: trener.slika_uporabnika ? trener.slika_uporabnika.toString('base64') : null,
            aktivnosti: aktivnosti.map(a => {
                let slikaPath = a.slika_aktivnosti;
                if (slikaPath && slikaPath.startsWith('../slike/')) {
                    slikaPath = slikaPath.replace('../slike/', '/slike/');
                } else if (slikaPath && !slikaPath.startsWith('/slike/')) {
                    slikaPath = `/slike/${slikaPath}`;
                }
                return {...a, slika_aktivnosti: slikaPath || '/slike/default-sport.png'}
            }),
            ocene
        };
        delete trenerZaPosiljanje.slika_uporabnika;
        res.json(trenerZaPosiljanje);
    } catch (error) {
        console.error(`Napaka pri pridobivanju podrobnosti trenerja ${id}:`, error);
        res.status(500).json({message: 'Napaka na strežniku.'});
    }
});

// === API TOČKE ZA UPORABNIKE (Profil, Prijava, Registracija, itd.) ===
app.get('/api/profil', preveriZeton, async (req, res) => {
    try {
        const uporabnikOsnovno = await knex('Uporabniki')
            .where({id: req.uporabnik.userId})
            .select('id', 'username', 'email', 'slika', 'JeAdmin')
            .first();
        if (!uporabnikOsnovno) {
            return res.status(404).json({message: 'Uporabnik ni najden.'});
        }
        let profilZaPosiljanje = {
            userId: uporabnikOsnovno.id, username: uporabnikOsnovno.username, email: uporabnikOsnovno.email,
            slika_base64: uporabnikOsnovno.slika ? uporabnikOsnovno.slika.toString('base64') : null,
            JeAdmin: uporabnikOsnovno.JeAdmin, isTrainer: false
        };
        const trenerPodatki = await knex('Trenerji').where({TK_Uporabnik: req.uporabnik.userId}).first();
        if (trenerPodatki) {
            profilZaPosiljanje.isTrainer = true;
            profilZaPosiljanje.trenerId = trenerPodatki.id;
            profilZaPosiljanje.trenerIme = trenerPodatki.ime;
            profilZaPosiljanje.trenerPriimek = trenerPodatki.priimek;
            profilZaPosiljanje.trenerTelefon = trenerPodatki.telefon;
            profilZaPosiljanje.trenerKontaktEmail = trenerPodatki.email;
            profilZaPosiljanje.trenerUrnik = trenerPodatki.urnik;
            profilZaPosiljanje.trenerOpisProfila = trenerPodatki.OpisProfila;
        }
        res.json(profilZaPosiljanje);
    } catch (error) {
        console.error('Napaka pri pridobivanju profila:', error);
        res.status(500).json({message: 'Napaka na strežniku.'});
    }
});

app.put('/api/profil/info', preveriZeton, async (req, res) => {
    const {
        username, email,
        trainerIme, trainerPriimek, trainerTelefon, trainerKontaktEmail, trainerUrnik, trainerOpisProfila
    } = req.body;
    const userId = req.uporabnik.userId;
    if (!username || !email) {
        return res.status(400).json({message: 'Uporabniško ime in email za prijavo sta obvezna.'});
    }
    try {
        if (email.toLowerCase() !== req.uporabnik.email.toLowerCase()) {
            const obstojecEmail = await knex('Uporabniki').whereRaw('LOWER(email) = ?', [email.toLowerCase()]).whereNot({id: userId}).first();
            if (obstojecEmail) {
                return res.status(409).json({message: 'Ta email naslov (za prijavo) je že v uporabi.'});
            }
        }
        if (username.toLowerCase() !== req.uporabnik.username.toLowerCase()) {
            const obstojeceIme = await knex('Uporabniki').whereRaw('LOWER(username) = ?', [username.toLowerCase()]).whereNot({id: userId}).first();
            if (obstojeceIme) {
                return res.status(409).json({message: 'To uporabniško ime je že v uporabi.'});
            }
        }
        await knex('Uporabniki').where({id: userId}).update({username: username, email: email});
        const trenerPodatkiPreverba = await knex('Trenerji').where({TK_Uporabnik: userId}).first();
        if (trenerPodatkiPreverba) {
            const podatkiZaPosodobitevTrenerja = {};
            if (trainerIme !== undefined) podatkiZaPosodobitevTrenerja.ime = trainerIme;
            if (trainerPriimek !== undefined) podatkiZaPosodobitevTrenerja.priimek = trainerPriimek;
            if (trainerTelefon !== undefined) podatkiZaPosodobitevTrenerja.telefon = trainerTelefon;
            if (trainerKontaktEmail !== undefined) {
                if (trainerKontaktEmail.toLowerCase() !== trenerPodatkiPreverba.email.toLowerCase()) {
                    const obstojecKontaktniEmail = await knex('Trenerji')
                        .whereRaw('LOWER(email) = ?', [trainerKontaktEmail.toLowerCase()])
                        .whereNot({TK_Uporabnik: userId}).first();
                    if (obstojecKontaktniEmail) {
                        return res.status(409).json({message: 'Ta kontaktni email za trenerja je že v uporabi.'});
                    }
                }
                podatkiZaPosodobitevTrenerja.email = trainerKontaktEmail;
            }
            if (trainerUrnik !== undefined) podatkiZaPosodobitevTrenerja.urnik = trainerUrnik;
            if (trainerOpisProfila !== undefined) podatkiZaPosodobitevTrenerja.OpisProfila = trainerOpisProfila;
            if (Object.keys(podatkiZaPosodobitevTrenerja).length > 0) {
                await knex('Trenerji').where({TK_Uporabnik: userId}).update(podatkiZaPosodobitevTrenerja);
            }
        }
        const novAccessToken = jwt.sign(
            {
                userId: userId,
                username: username,
                email: email,
                type: 'access',
                JeAdmin: req.uporabnik.JeAdmin,
                isTrainer: !!trenerPodatkiPreverba
            },
            JWT_SECRET, {expiresIn: '30m'}
        );
        const posodobljenUporabnikRaw = await knex('Uporabniki').where({id: userId}).select('username', 'email', 'slika', 'JeAdmin').first();
        let uporabnikZaOdziv = {
            username: posodobljenUporabnikRaw.username, email: posodobljenUporabnikRaw.email,
            slika_base64: posodobljenUporabnikRaw.slika ? posodobljenUporabnikRaw.slika.toString('base64') : null,
            JeAdmin: posodobljenUporabnikRaw.JeAdmin, isTrainer: false
        };
        if (trenerPodatkiPreverba) {
            const posodobljeniTrenerPodatki = await knex('Trenerji').where({TK_Uporabnik: userId}).first();
            uporabnikZaOdziv.isTrainer = true;
            uporabnikZaOdziv.trenerId = posodobljeniTrenerPodatki.id;
            uporabnikZaOdziv.trenerIme = posodobljeniTrenerPodatki.ime;
            uporabnikZaOdziv.trenerPriimek = posodobljeniTrenerPodatki.priimek;
            uporabnikZaOdziv.trenerKontaktEmail = posodobljeniTrenerPodatki.email;
            uporabnikZaOdziv.trenerTelefon = posodobljeniTrenerPodatki.telefon;
            uporabnikZaOdziv.trenerUrnik = posodobljeniTrenerPodatki.urnik;
            uporabnikZaOdziv.trenerOpisProfila = posodobljeniTrenerPodatki.OpisProfila;
        }
        res.json({message: 'Podatki uspešno posodobljeni.', accessToken: novAccessToken, uporabnik: uporabnikZaOdziv});
    } catch (error) {
        console.error('Napaka pri posodabljanju informacij o profilu:', error);
        res.status(500).json({message: 'Napaka na strežniku pri posodabljanju informacij o profilu.'});
    }
});

app.put('/api/profil/geslo', preveriZeton, async (req, res) => {
    const {currentPassword, newPassword} = req.body;
    const userId = req.uporabnik.userId;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({message: 'Trenutno in novo geslo sta obvezna.'});
    }
    const gesloRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!gesloRegex.test(newPassword)) {
        return res.status(400).json({message: 'Novo geslo mora vsebovati vsaj 6 znakov, eno veliko črko in eno številko.'});
    }
    try {
        const uporabnik = await knex('Uporabniki').where({id: userId}).first();
        if (!uporabnik) {
            return res.status(404).json({message: 'Uporabnik ni najden.'});
        }
        const pravilnoGeslo = bcrypt.compareSync(currentPassword, uporabnik.geslo);
        if (!pravilnoGeslo) {
            return res.status(401).json({message: 'Trenutno geslo ni pravilno.'});
        }
        const novoHashiranoGeslo = bcrypt.hashSync(newPassword, saltKodiranje);
        await knex('Uporabniki').where({id: userId}).update({geslo: novoHashiranoGeslo});
        res.json({message: 'Geslo uspešno spremenjeno.'});
    } catch (error) {
        console.error('Napaka pri spreminjanju gesla:', error);
        res.status(500).json({message: 'Napaka na strežniku pri spreminjanju gesla.'});
    }
});

app.post('/api/profil/slika', preveriZeton, async (req, res) => {
    const userId = req.uporabnik.userId;
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.profilePicture) {
        return res.status(400).json({message: 'Nobena datoteka ni bila naložena.'});
    }
    const profilePicture = req.files.profilePicture;
    const slikaBuffer = Buffer.from(profilePicture.data);
    const dovoljeniTipi = ['image/jpeg', 'image/png', 'image/gif'];
    if (!dovoljeniTipi.includes(profilePicture.mimetype)) {
        return res.status(400).json({message: 'Nedovoljen tip datoteke. Prosimo, naložite JPG, PNG ali GIF.'});
    }
    const maxVelikost = 5 * 1024 * 1024;
    if (profilePicture.size > maxVelikost) {
        return res.status(400).json({message: `Datoteka je prevelika. Največja dovoljena velikost je ${maxVelikost / (1024 * 1024)}MB.`});
    }
    try {
        await knex('Uporabniki').where({id: userId}).update({slika: slikaBuffer});
        res.json({message: 'Profilna slika uspešno naložena v bazo.', slika_base64: slikaBuffer.toString('base64')});
    } catch (dbError) {
        console.error('Napaka pri shranjevanju slike v bazo:', dbError);
        res.status(500).json({message: 'Napaka pri shranjevanju slike v bazo.'});
    }
});

app.post('/api/prijava', async (req, res) => {
    const {email, geslo, rememberMe} = req.body;
    if (!email || !geslo) {
        return res.status(400).json({message: 'Email in geslo sta obvezna.'});
    }
    try {
        const uporabnik = await knex('Uporabniki').whereRaw('LOWER(email) = ?', [email.toLowerCase()]).first();
        if (uporabnik) {
            const pravilnoGeslo = bcrypt.compareSync(geslo, uporabnik.geslo);
            if (pravilnoGeslo) {
                const trenerPodatki = await knex('Trenerji').where({TK_Uporabnik: uporabnik.id}).first();
                const isTrainer = !!trenerPodatki;
                const accessTokenPayload = {
                    userId: uporabnik.id, username: uporabnik.username, email: uporabnik.email,
                    type: 'access', JeAdmin: uporabnik.JeAdmin, isTrainer: isTrainer
                };
                const accessToken = jwt.sign(accessTokenPayload, JWT_SECRET, {expiresIn: '30m'});
                let osvezilniToken = null;
                if (rememberMe) {
                    const refreshTokenPayload = {
                        userId: uporabnik.id,
                        type: 'refresh',
                        JeAdmin: uporabnik.JeAdmin,
                        isTrainer: isTrainer
                    };
                    osvezilniToken = jwt.sign(refreshTokenPayload, REFRESH_TOKEN_SECRET, {expiresIn: '7d'});
                    const hashiranOsvezilniToken = bcrypt.hashSync(osvezilniToken, saltKodiranje);
                    const datumPoteka = new Date();
                    datumPoteka.setDate(datumPoteka.getDate() + 7);
                    await knex('osvezilniTokens').where({user_id: uporabnik.id}).del();
                    await knex('osvezilniTokens').insert({
                        user_id: uporabnik.id, hashiranToken: hashiranOsvezilniToken, expires_at: datumPoteka
                    });
                }
                let uporabnikZaOdziv = {
                    userId: uporabnik.id, username: uporabnik.username, email: uporabnik.email,
                    slika_base64: uporabnik.slika ? uporabnik.slika.toString('base64') : null,
                    JeAdmin: uporabnik.JeAdmin, isTrainer: isTrainer
                };
                if (isTrainer) {
                    uporabnikZaOdziv.trenerId = trenerPodatki.id;
                    uporabnikZaOdziv.trenerIme = trenerPodatki.ime;
                    uporabnikZaOdziv.trenerPriimek = trenerPodatki.priimek;
                }
                res.json({
                    message: 'Prijava uspešna!', accessToken: accessToken,
                    ...(osvezilniToken && {osvezilniToken: osvezilniToken}),
                    uporabnik: uporabnikZaOdziv
                });
            } else {
                res.status(401).json({message: 'Napačen email ali geslo.'});
            }
        } else {
            res.status(401).json({message: 'Napačen email ali geslo.'});
        }
    } catch (error) {
        console.error('Napaka pri prijavi:', error);
        res.status(500).json({message: 'Napaka na strežniku pri prijavi.'});
    }
});

app.post('/api/token/refresh', async (req, res) => {
    const {osvezilniToken} = req.body;
    if (!osvezilniToken) {
        return res.status(401).json({message: 'Osvežilni žeton je potreben.'});
    }
    try {
        const dekodiranOsvezilniToken = jwt.verify(osvezilniToken, REFRESH_TOKEN_SECRET);
        if (dekodiranOsvezilniToken.type !== 'refresh') {
            return res.status(403).json({message: 'Neveljaven tip osvežilnega žetona.'});
        }
        const userId = dekodiranOsvezilniToken.userId;
        const zgodovinaShranjenihTokenov = await knex('osvezilniTokens')
            .where({user_id: userId}).andWhere('expires_at', '>', new Date()).select('id', 'hashiranToken');
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
            await knex('osvezilniTokens').where({user_id: userId}).del();
            return res.status(403).json({message: 'Osvežilni žeton ni veljaven, ne obstaja v bazi ali je potekel. Vsi žetoni za uporabnika so bili preklicani.'});
        }
        await knex('osvezilniTokens').where({id: shranjenTokenId}).del();
        const uporabnik = await knex('Uporabniki').where({id: userId}).select('id', 'username', 'email', 'slika', 'JeAdmin').first();
        if (!uporabnik) {
            return res.status(403).json({message: 'Povezan uporabnik ne obstaja več.'});
        }
        const trenerPodatki = await knex('Trenerji').where({TK_Uporabnik: userId}).first();
        const isTrainer = !!trenerPodatki;
        const novOsvezilniTokenPayload = {
            userId: userId,
            type: 'refresh',
            JeAdmin: uporabnik.JeAdmin,
            isTrainer: isTrainer
        };
        const novOsvezilniToken = jwt.sign(novOsvezilniTokenPayload, REFRESH_TOKEN_SECRET, {expiresIn: '7d'});
        const hashiranNovOsvezilniToken = bcrypt.hashSync(novOsvezilniToken, saltKodiranje);
        const novDatumPoteka = new Date();
        novDatumPoteka.setDate(novDatumPoteka.getDate() + 7);
        await knex('osvezilniTokens').insert({
            user_id: userId, hashiranToken: hashiranNovOsvezilniToken, expires_at: novDatumPoteka
        });
        const novAccesTokenPayload = {
            userId: uporabnik.id, username: uporabnik.username, email: uporabnik.email,
            type: 'access', JeAdmin: uporabnik.JeAdmin, isTrainer: isTrainer
        };
        const novAccesToken = jwt.sign(novAccesTokenPayload, JWT_SECRET, {expiresIn: '30m'});
        let uporabnikZaOdziv = {
            userId: uporabnik.id, username: uporabnik.username, email: uporabnik.email,
            slika_base64: uporabnik.slika ? uporabnik.slika.toString('base64') : null,
            JeAdmin: uporabnik.JeAdmin, isTrainer: isTrainer
        };
        if (isTrainer) {
            uporabnikZaOdziv.trenerId = trenerPodatki.id;
            uporabnikZaOdziv.trenerIme = trenerPodatki.ime;
            uporabnikZaOdziv.trenerPriimek = trenerPodatki.priimek;
        }
        res.json({
            accessToken: novAccesToken, osvezilniToken: novOsvezilniToken,
            uporabnik: uporabnikZaOdziv
        });
    } catch (error) {
        console.error('Napaka pri osveževanju žetona:', error.message);
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            try {
                const payload = jwt.decode(osvezilniToken);
                if (payload && payload.userId) {
                    await knex('osvezilniTokens').where({user_id: payload.userId}).del();
                    console.log(`Vsi osvežilni žetoni za uporabnika ${payload.userId} izbrisani zaradi napake pri verifikaciji.`);
                }
            } catch (decodeError) {
                console.error("Napaka pri dekodiranju neveljavnega osvežilnega žetona:", decodeError);
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(403).json({message: 'Osvežilni žeton je potekel. Prijavite se ponovno.'});
            }
            return res.status(403).json({message: 'Osvežilni žeton ni veljaven. Prijavite se ponovno.'});
        }
        return res.status(500).json({message: 'Napaka na strežniku pri osveževanju žetona.'});
    }
});

app.post('/api/odjava', async (req, res) => {
    const {osvezilniToken} = req.body;
    if (!osvezilniToken) {
        return res.status(200).json({message: 'Odjava: osvežilni žeton ni bil posredovan.'});
    }
    try {
        let userIdFromToken = null;
        try {
            const decoded = jwt.verify(osvezilniToken, REFRESH_TOKEN_SECRET, {ignoreExpiration: true});
            userIdFromToken = decoded.userId;
        } catch (e) {
            const payload = jwt.decode(osvezilniToken);
            if (payload && payload.userId) userIdFromToken = payload.userId;
            console.log("Refresh token pri odjavi ni veljaven JWT ali je potekel, a poskušamo brisati na podlagi ID-ja:", e.message);
        }
        let steviloIzbrisanihTokenov = 0;
        if (userIdFromToken) {
            const zgodovinaShranjenihTokenov = await knex('osvezilniTokens')
                .where({user_id: userIdFromToken}).select('id', 'hashiranToken');
            for (const record of zgodovinaShranjenihTokenov) {
                if (bcrypt.compareSync(osvezilniToken, record.hashiranToken)) {
                    await knex('osvezilniTokens').where({id: record.id}).del();
                    console.log(`Osvežilni žeton ID ${record.id} za uporabnika ${userIdFromToken} izbrisan ob odjavi.`);
                    steviloIzbrisanihTokenov++;
                    break;
                }
            }
        }
        if (steviloIzbrisanihTokenov > 0) {
            res.status(200).json({message: 'Odjava uspešna, osvežilni žeton je bil preklican.'});
        } else {
            res.status(200).json({message: 'Odjava: osvežilni žeton ni bil najden v bazi, se ne ujema, ali pa je bil že preklican.'});
        }
    } catch (error) {
        console.error('Napaka pri odjavi (brisanje osvežilnega žetona):', error);
        res.status(500).json({message: 'Napaka na strežniku pri odjavi.'});
    }
});

app.post('/api/registracija', async (req, res) => {
    const {ime, priimek, email, geslo} = req.body;
    if (!ime || !email || !geslo) {
        return res.status(400).json({message: 'Uporabniško ime (ime), email in geslo so obvezni.'});
    }
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({message: 'Neveljaven format e-poštnega naslova.'});
    }
    const gesloRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!gesloRegex.test(geslo)) {
        return res.status(400).json({message: 'Geslo mora vsebovati vsaj 6 znakov, eno veliko črko in eno številko.'});
    }
    try {
        const obstojecUporabnikPoEmailu = await knex('Uporabniki').whereRaw('LOWER(email) = ?', [email.toLowerCase()]).first();
        if (obstojecUporabnikPoEmailu) {
            return res.status(409).json({message: 'Uporabnik s tem emailom že obstaja.'});
        }
        const obstojecUporabnikPoImenu = await knex('Uporabniki').whereRaw('LOWER(username) = ?', [ime.toLowerCase()]).first();
        if (obstojecUporabnikPoImenu) {
            return res.status(409).json({message: 'Uporabnik s tem uporabniškim imenom že obstaja.'});
        }
        const novUporabnik = {
            username: ime, email: email, geslo: bcrypt.hashSync(geslo, saltKodiranje), JeAdmin: 0,
        };
        const [uporabnikId] = await knex('Uporabniki').insert(novUporabnik);
        res.status(201).json({message: 'Registracija uspešna!', userId: uporabnikId});
    } catch (error) {
        console.error('Napaka pri registraciji:', error);
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            if (error.message.includes('email')) return res.status(409).json({message: 'Uporabnik s tem emailom že obstaja (DB).'});
            else if (error.message.includes('username')) return res.status(409).json({message: 'Uporabnik s tem uporabniškim imenom že obstaja (DB).'});
        }
        res.status(500).json({message: 'Napaka na strežniku pri registraciji.'});
    }
});

app.post('/api/trener/:id/ocena', preveriZeton, async (req, res) => {
    const trenerId = req.params.id;
    const uporabnikId = req.uporabnik.userId;
    const {ocena, komentar} = req.body;
    if (!ocena || ocena < 1 || ocena > 5) {
        return res.status(400).json({message: 'Ocena mora biti število med 1 in 5.'});
    }
    try {
        const trener = await knex('Trenerji').where({id: trenerId}).first();
        if (!trener) {
            return res.status(404).json({message: 'Trener s tem ID-jem ni najden.'});
        }
        await knex('Ocena_Trenerja').insert({
            TK_Trener: trenerId, TK_Uporabnik: uporabnikId, Ocena: ocena,
            Komentar: komentar || null, Datum: new Date(),
        });
        res.status(201).json({message: 'Ocena in komentar sta bila uspešno oddana.'});
    } catch (error) {
        console.error(`Napaka pri oddaji ocene za trenerja ${trenerId}:`, error);
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            return res.status(409).json({message: 'Za tega trenerja ste že oddali oceno.'});
        }
        res.status(500).json({message: 'Napaka na strežniku pri oddaji ocene.'});
    }
});

// === ADMIN API TOČKE ===

// --- Upravljanje komentarjev/ocen ---
app.get('/api/admin/ocene/trenerjev', preveriZeton, preveriAdmin, async (req, res) => {
    try {
        const ocene = await knex('Ocena_Trenerja as ot')
            .join('Uporabniki as u', 'ot.TK_Uporabnik', 'u.id')
            .join('Trenerji as t', 'ot.TK_Trener', 't.id')
            .select('ot.id', 'ot.Komentar', 'ot.Ocena', 'ot.Datum',
                'u.username as uporabnik_username', 'u.email as uporabnik_email',
                't.ime as trener_ime', 't.priimek as trener_priimek')
            .orderBy('ot.created_at', 'desc');
        res.json(ocene);
    } catch (error) {
        console.error('Admin napaka pri pridobivanju ocen trenerjev:', error);
        res.status(500).json({message: 'Napaka na strežniku.'});
    }
});

app.get('/api/admin/ocene/aktivnosti', preveriZeton, preveriAdmin, async (req, res) => {
    try {
        const ocene = await knex('Ocena_Sporta as os')
            .join('Uporabniki as u', 'os.TK_Uporabnik', 'u.id')
            .join('Sportna_Aktivnost as sa', 'os.TK_SportnaAktivnost', 'sa.id')
            .select('os.id', 'os.Komentar', 'os.Ocena', 'os.Datum',
                'u.username as uporabnik_username', 'u.email as uporabnik_email',
                'sa.Naziv as aktivnost_naziv')
            .orderBy('os.created_at', 'desc');
        res.json(ocene);
    } catch (error) {
        console.error('Admin napaka pri pridobivanju ocen aktivnosti:', error);
        res.status(500).json({message: 'Napaka na strežniku.'});
    }
});

app.put('/api/admin/ocene/trenerja/:id', preveriZeton, preveriAdmin, async (req, res) => {
    const {id} = req.params;
    const {Komentar, Ocena} = req.body;
    try {
        const updatedCount = await knex('Ocena_Trenerja')
            .where({id})
            .update({Komentar, Ocena, Datum: new Date()});
        if (updatedCount === 0) return res.status(404).json({message: 'Ocena trenerja ni najdena.'});
        res.json({message: 'Ocena trenerja uspešno posodobljena.'});
    } catch (error) {
        console.error(`Admin napaka pri urejanju ocene trenerja ${id}:`, error);
        res.status(500).json({message: 'Napaka na strežniku.'});
    }
});

app.put('/api/admin/ocene/aktivnosti/:id', preveriZeton, preveriAdmin, async (req, res) => {
    const {id} = req.params;
    const {Komentar, Ocena} = req.body;
    try {
        const updatedCount = await knex('Ocena_Sporta')
            .where({id})
            .update({Komentar, Ocena, Datum: new Date()});
        if (updatedCount === 0) return res.status(404).json({message: 'Ocena aktivnosti ni najdena.'});
        res.json({message: 'Ocena aktivnosti uspešno posodobljena.'});
    } catch (error) {
        console.error(`Admin napaka pri urejanju ocene aktivnosti ${id}:`, error);
        res.status(500).json({message: 'Napaka na strežniku.'});
    }
});

app.delete('/api/admin/ocene/trenerja/:id', preveriZeton, preveriAdmin, async (req, res) => {
    const {id} = req.params;
    try {
        const deletedCount = await knex('Ocena_Trenerja').where({id}).del();
        if (deletedCount === 0) return res.status(404).json({message: 'Ocena trenerja ni najdena.'});
        res.json({message: 'Ocena trenerja uspešno izbrisana.'});
    } catch (error) {
        console.error(`Admin napaka pri brisanju ocene trenerja ${id}:`, error);
        res.status(500).json({message: 'Napaka na strežniku.'});
    }
});

app.delete('/api/admin/ocene/aktivnosti/:id', preveriZeton, preveriAdmin, async (req, res) => {
    const {id} = req.params;
    try {
        const deletedCount = await knex('Ocena_Sporta').where({id}).del();
        if (deletedCount === 0) return res.status(404).json({message: 'Ocena aktivnosti ni najdena.'});
        res.json({message: 'Ocena aktivnosti uspešno izbrisana.'});
    } catch (error) {
        console.error(`Admin napaka pri brisanju ocene aktivnosti ${id}:`, error);
        res.status(500).json({message: 'Napaka na strežniku.'});
    }
});

// --- Upravljanje športnih aktivnosti ---
app.get('/api/admin/aktivnosti', preveriZeton, preveriAdmin, async (req, res) => {
    try {
        const aktivnosti = await knex('Sportna_Aktivnost as sa')
            .leftJoin('Sport as s', 'sa.TK_TipAktivnosti', 's.id')
            .leftJoin('Trenerji as t', 'sa.TK_Trener', 't.id')
            .select('sa.id', 'sa.Naziv', 'sa.Opis', 'sa.Lokacija', 'sa.Cena', 'sa.ProstaMesta', 'sa.slika',
                's.Sport as ime_sporta', 's.id as sport_id',
                knex.raw("CONCAT(t.ime, ' ', t.priimek) as ime_trenerja"), 't.id as trener_id')
            .orderBy('sa.id', 'desc');
        res.json(aktivnosti);
    } catch (error) {
        console.error('Admin napaka pri pridobivanju aktivnosti:', error);
        res.status(500).json({message: 'Napaka na strežniku.'});
    }
});

app.post('/api/admin/aktivnosti', preveriZeton, preveriAdmin, async (req, res) => {
    const {Naziv, Opis, Lokacija, Cena, ProstaMesta, slika, TK_TipAktivnosti, TK_Trener} = req.body;
    if (!Naziv || !Opis || !Lokacija || Cena === undefined || ProstaMesta === undefined || !TK_TipAktivnosti) {
        return res.status(400).json({message: 'Manjkajoči obvezni podatki za aktivnost.'});
    }
    try {
        const [id] = await knex('Sportna_Aktivnost').insert({
            Naziv, Opis, Lokacija, Cena, ProstaMesta,
            slika: slika || null,
            TK_TipAktivnosti,
            TK_Trener: TK_Trener || null
        });
        res.status(201).json({message: 'Aktivnost uspešno dodana.', id});
    } catch (error) {
        console.error('Admin napaka pri dodajanju aktivnosti:', error);
        res.status(500).json({message: 'Napaka na strežniku.'});
    }
});

app.put('/api/admin/aktivnosti/:id', preveriZeton, preveriAdmin, async (req, res) => {
    const {id} = req.params;
    const {Naziv, Opis, Lokacija, Cena, ProstaMesta, slika, TK_TipAktivnosti, TK_Trener} = req.body;
    try {
        const updatedCount = await knex('Sportna_Aktivnost')
            .where({id})
            .update({
                Naziv, Opis, Lokacija, Cena, ProstaMesta, slika, TK_TipAktivnosti,
                TK_Trener: TK_Trener || null,
                updated_at: new Date()
            });
        if (updatedCount === 0) return res.status(404).json({message: 'Aktivnost ni najdena.'});
        res.json({message: 'Aktivnost uspešno posodobljena.'});
    } catch (error) {
        console.error(`Admin napaka pri urejanju aktivnosti ${id}:`, error);
        res.status(500).json({message: 'Napaka na strežniku.'});
    }
});

app.delete('/api/admin/aktivnosti/:id', preveriZeton, preveriAdmin, async (req, res) => {
    const {id} = req.params;
    try {
        await knex('Ocena_Sporta').where({TK_SportnaAktivnost: id}).del();
        const deletedCount = await knex('Sportna_Aktivnost').where({id}).del();
        if (deletedCount === 0) return res.status(404).json({message: 'Aktivnost ni najdena.'});
        res.json({message: 'Aktivnost uspešno izbrisana.'});
    } catch (error) {
        console.error(`Admin napaka pri brisanju aktivnosti ${id}:`, error);
        res.status(500).json({message: 'Napaka na strežniku.'});
    }
});

// --- Upravljanje trenerjev ---
app.get('/api/admin/trenerji', preveriZeton, preveriAdmin, async (req, res) => {
    try {
        const trenerji = await knex('Trenerji as t')
            .leftJoin('Uporabniki as u', 't.TK_Uporabnik', 'u.id')
            .select('t.id', 't.ime', 't.priimek', 't.telefon', 't.email as kontakt_email_trenerja', 't.urnik', 't.OpisProfila',
                'u.id as uporabnik_id', 'u.username as uporabnisko_ime', 'u.email as login_email_uporabnika', 'u.JeAdmin',
                'u.slika as slika_profila_base64')
            .orderBy('t.priimek', 'asc');
        const obdelaniTrenerji = trenerji.map(t => ({
            ...t,
            slika_profila_base64: t.slika_profila_base64 ? t.slika_profila_base64.toString('base64') : null
        }));
        res.json(obdelaniTrenerji);
    } catch (error) {
        console.error('Admin napaka pri pridobivanju trenerjev:', error);
        res.status(500).json({message: 'Napaka na strežniku.'});
    }
});

app.post('/api/admin/trenerji', preveriZeton, preveriAdmin, async (req, res) => {
    const {
        username, login_email, geslo,
        ime, priimek, telefon, kontakt_email, urnik, OpisProfila
    } = req.body;
    if (!username || !login_email || !geslo || !ime || !priimek || !telefon || !kontakt_email || !urnik) {
        return res.status(400).json({message: 'Manjkajoči obvezni podatki za trenerja ali uporabniški račun.'});
    }
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(login_email) || !emailRegex.test(kontakt_email)) {
        return res.status(400).json({message: 'Neveljaven format enega od e-poštnih naslovov.'});
    }
    const gesloRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!gesloRegex.test(geslo)) {
        return res.status(400).json({message: 'Geslo mora vsebovati vsaj 6 znakov, eno veliko črko in eno številko.'});
    }
    const trx = await knex.transaction();
    try {
        let obstojecUporabnik = await trx('Uporabniki').whereRaw('LOWER(username) = ?', [username.toLowerCase()]).first();
        if (obstojecUporabnik) {
            await trx.rollback();
            return res.status(409).json({message: 'Uporabniško ime za prijavo že obstaja.'});
        }
        obstojecUporabnik = await trx('Uporabniki').whereRaw('LOWER(email) = ?', [login_email.toLowerCase()]).first();
        if (obstojecUporabnik) {
            await trx.rollback();
            return res.status(409).json({message: 'Email za prijavo že obstaja.'});
        }
        const obstojecTrenerEmail = await trx('Trenerji').whereRaw('LOWER(email) = ?', [kontakt_email.toLowerCase()]).first();
        if (obstojecTrenerEmail) {
            await trx.rollback();
            return res.status(409).json({message: 'Kontaktni email trenerja že obstaja.'});
        }
        const hashiranoGeslo = bcrypt.hashSync(geslo, saltKodiranje);
        const [novUporabnikId] = await trx('Uporabniki').insert({
            username: username, email: login_email, geslo: hashiranoGeslo, JeAdmin: 0
        });
        const [novTrenerId] = await trx('Trenerji').insert({
            ime, priimek, telefon, email: kontakt_email, urnik, OpisProfila, TK_Uporabnik: novUporabnikId
        });
        await trx.commit();
        res.status(201).json({
            message: 'Trener in povezan uporabniški račun uspešno dodana.',
            trenerId: novTrenerId,
            uporabnikId: novUporabnikId
        });
    } catch (error) {
        await trx.rollback();
        console.error('Admin napaka pri dodajanju trenerja:', error);
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            return res.status(409).json({message: 'Podvojen vnos, preverite uporabniško ime ali email (DB).'});
        }
        res.status(500).json({message: 'Napaka na strežniku pri dodajanju trenerja.'});
    }
});

app.put('/api/admin/trenerji/:id', preveriZeton, preveriAdmin, async (req, res) => {
    const trenerId = req.params.id;
    const {
        username, login_email,
        ime, priimek, telefon, kontakt_email, urnik, OpisProfila
    } = req.body;

    const trx = await knex.transaction();
    try {
        const trener = await trx('Trenerji').where({id: trenerId}).first();
        if (!trener) {
            await trx.rollback();
            return res.status(404).json({message: 'Trener ni najden.'});
        }
        const uporabnikId = trener.TK_Uporabnik;

        if (uporabnikId) {
            const uporabnikUpdateData = {};
            const trenutniUporabnik = await trx('Uporabniki').where({id: uporabnikId}).first();

            if (!trenutniUporabnik) {
                await trx.rollback();
                return res.status(404).json({message: `Povezan uporabniški račun (ID: ${uporabnikId}) za trenerja ni bil najden.`});
            }

            if (username && username !== trenutniUporabnik.username) {
                const obstojeceIme = await trx('Uporabniki').whereRaw('LOWER(username) = ?', [username.toLowerCase()]).whereNot({id: uporabnikId}).first();
                if (obstojeceIme) {
                    await trx.rollback();
                    return res.status(409).json({message: 'To uporabniško ime je že v uporabi.'});
                }
                uporabnikUpdateData.username = username;
            }
            if (login_email && login_email !== trenutniUporabnik.email) {
                const obstojecEmail = await trx('Uporabniki').whereRaw('LOWER(email) = ?', [login_email.toLowerCase()]).whereNot({id: uporabnikId}).first();
                if (obstojecEmail) {
                    await trx.rollback();
                    return res.status(409).json({message: 'Ta email naslov (za prijavo) je že v uporabi.'});
                }
                uporabnikUpdateData.email = login_email;
            }
            if (Object.keys(uporabnikUpdateData).length > 0) {
                await trx('Uporabniki').where({id: uporabnikId}).update(uporabnikUpdateData);
            }
        } else if ((username || login_email) && !uporabnikId) {
            console.warn(`Admin poskus posodobitve Uporabniki za Trener ID ${trenerId}, ampak TK_Uporabnik je NULL.`);
        }

        const trenerUpdateData = {};
        if (ime !== undefined && ime !== trener.ime) trenerUpdateData.ime = ime;
        if (priimek !== undefined && priimek !== trener.priimek) trenerUpdateData.priimek = priimek;
        if (telefon !== undefined && telefon !== trener.telefon) trenerUpdateData.telefon = telefon;
        if (kontakt_email !== undefined && kontakt_email !== trener.email) {
            const obstojecKontaktniEmail = await trx('Trenerji').whereRaw('LOWER(email) = ?', [kontakt_email.toLowerCase()]).whereNot({id: trenerId}).first();
            if (obstojecKontaktniEmail) {
                await trx.rollback();
                return res.status(409).json({message: 'Ta kontaktni email za trenerja je že v uporabi.'});
            }
            trenerUpdateData.email = kontakt_email;
        }
        if (urnik !== undefined && urnik !== trener.urnik) trenerUpdateData.urnik = urnik;
        if (OpisProfila !== undefined && OpisProfila !== trener.OpisProfila) trenerUpdateData.OpisProfila = OpisProfila;

        if (Object.keys(trenerUpdateData).length > 0) {
            await trx('Trenerji').where({id: trenerId}).update(trenerUpdateData);
        }

        await trx.commit();
        res.json({message: 'Podatki o trenerju uspešno posodobljeni.'});

    } catch (error) {
        await trx.rollback();
        console.error(`Admin napaka pri urejanju trenerja ${trenerId}:`, error);
        res.status(500).json({message: 'Napaka na strežniku pri urejanju trenerja.'});
    }
});


app.delete('/api/admin/trenerji/:id', preveriZeton, preveriAdmin, async (req, res) => {
    const trenerId = req.params.id;
    const trx = await knex.transaction();
    try {
        const trener = await trx('Trenerji').where({id: trenerId}).first();
        if (!trener) {
            await trx.rollback();
            return res.status(404).json({message: 'Trener ni najden.'});
        }
        const uporabnikId = trener.TK_Uporabnik;
        await trx('Ocena_Trenerja').where({TK_Trener: trenerId}).del();
        await trx('Sportna_Aktivnost').where({TK_Trener: trenerId}).update({TK_Trener: null});
        await trx('Trenerji').where({id: trenerId}).del();
        if (uporabnikId) {
            await trx('osvezilniTokens').where({user_id: uporabnikId}).del();
            await trx('Uporabniki').where({id: uporabnikId}).del();
            console.log(`Povezan uporabniški račun ID ${uporabnikId} izbrisan skupaj s trenerjem ID ${trenerId}.`);
        }
        await trx.commit();
        res.json({message: 'Trener in povezan uporabniški račun (če je obstajal) uspešno izbrisana.'});
    } catch (error) {
        await trx.rollback();
        console.error(`Admin napaka pri brisanju trenerja ${trenerId}:`, error);
        res.status(500).json({message: 'Napaka na strežniku.'});
    }
});


app.listen(PORT, () => {
    console.log(`Strežnik teče na http://localhost:${PORT}`);
    knex.schema.hasTable('osvezilniTokens').then(exists => {
        if (!exists) {
            console.log("Tabela 'osvezilniTokens' ne obstaja, ustvarjam jo...");
            return knex.schema.createTable('osvezilniTokens', table => {
                table.increments('id').primary();
                table.integer('user_id').unsigned().notNullable()
                    .references('id').inTable('Uporabniki').onDelete('CASCADE');
                table.string('hashiranToken').notNullable().unique();
                table.timestamp('expires_at').notNullable();
                table.timestamps(true, true);
            }).then(() => {
                console.log("Tabela 'osvezilniTokens' uspešno ustvarjena.");
            }).catch(err => {
                console.error("Napaka pri ustvarjanju tabele 'osvezilniTokens':", err);
            });
        }
    }).catch(err => {
        console.error("Napaka pri preverjanju tabele 'osvezilniTokens':", err);
    });
    knex.schema.hasColumn('Uporabniki', 'slika').then(exists => {
        if (!exists) {
            console.log("Stolpec 'slika' (LONGBLOB) ne obstaja v tabeli 'Uporabniki', dodajam ga...");
            return knex.schema.alterTable('Uporabniki', table => {
                table.specificType('slika', 'LONGBLOB').nullable().after('JeAdmin');
            }).then(() => {
                console.log("Stolpec 'slika' (LONGBLOB) uspešno dodan.");
                return knex.schema.hasColumn('Uporabniki', 'slika_profila_url');
            }).then(oldColumnExists => {
                if (oldColumnExists) {
                    console.log("Odstranjujem stari stolpec 'slika_profila_url'...");
                    return knex.schema.alterTable('Uporabniki', table => {
                        table.dropColumn('slika_profila_url');
                    }).then(() => {
                        console.log("Stari stolpec 'slika_profila_url' uspešno odstranjen.");
                    });
                }
            }).catch(err => {
                console.error("Napaka pri dodajanju/odstranjevanju stolpca za sliko:", err);
            });
        } else {
            knex.schema.hasColumn('Uporabniki', 'slika_profila_url').then(oldColumnExists => {
                if (oldColumnExists) {
                    console.log("Odstranjujem stari stolpec 'slika_profila_url' (ker 'slika' že obstaja)...");
                    return knex.schema.alterTable('Uporabniki', table => {
                        table.dropColumn('slika_profila_url');
                    }).then(() => {
                        console.log("Stari stolpec 'slika_profila_url' uspešno odstranjen.");
                    }).catch(err => {
                        console.error("Napaka pri odstranjevanju starega stolpca 'slika_profila_url':", err);
                    });
                }
            });
        }
    }).catch(err => {
        console.error("Napaka pri preverjanju stolpca 'slika':", err);
    });
});