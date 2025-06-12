// Ta datoteka je namenjena samo za diagnozo težav pri objavi na Railway.
// Začasno jo uporabite namesto vaše glavne datoteke server.js.

const express = require('express');
const knexDriver = require('knex');

// Poskusimo naložiti spremenljivke iz .env datoteke (za lokalni razvoj)
// V produkciji na Railwayu ta korak ni nujno potreben, a ne škodi.
try {
    require('dotenv').config();
    console.log('[DEBUG] Datoteka .env uspešno naložena (če obstaja).');
} catch(e) {
    console.log('[DEBUG] Modul dotenv ni na voljo, nadaljujem brez njega.');
}

const app = express();
const PORT = process.env.PORT || 3000;

console.log('--- [DIAGNOZA] Branje okoljskih spremenljivk ---');
console.log(`[DEBUG] process.env.DB_HOST: ${process.env.DB_HOST}`);
console.log(`[DEBUG] process.env.DB_USER: ${process.env.DB_USER}`);
console.log(`[DEBUG] process.env.DB_DATABASE: ${process.env.DB_DATABASE}`);
console.log(`[DEBUG] process.env.DB_PORT: ${process.env.DB_PORT}`);
// Gesla namerno ne izpisujemo v loge iz varnostnih razlogov
console.log(`[DEBUG] process.env.DB_PASSWORD: ${process.env.DB_PASSWORD ? '***NASTAVLJENO***' : '!!! NI NASTAVLJENO !!!'}`);
console.log(`[DEBUG] process.env.JWT_SECRET: ${process.env.JWT_SECRET ? '***NASTAVLJENO***' : '!!! NI NASTAVLJENO !!!'}`);
console.log(`[DEBUG] process.env.EMAIL_USER: ${process.env.EMAIL_USER}`);
console.log(`[DEBUG] process.env.EMAIL_PASS: ${process.env.EMAIL_PASS ? '***NASTAVLJENO***' : '!!! NI NASTAVLJENO !!!'}`);
console.log('--------------------------------------------------');

const knex = knexDriver({
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT || 3306
    },
    pool: { min: 0, max: 7 }
});

app.get('/', (req, res) => {
    res.send('Diagnostični strežnik teče. Preverite loge za status povezave z bazo.');
});

async function preveriPovezavoZBazo() {
    console.log('\n--- [DIAGNOZA] Poskušam se povezati z bazo podatkov... ---');
    try {
        await knex.raw('SELECT 1+1 as result');
        console.log('✅✅✅ USPEH: Povezava z bazo podatkov je bila uspešno vzpostavljena!');
        
        // Če je povezava uspešna, zaženemo strežnik
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`\n[INFO] Diagnostični strežnik posluša na vratih ${PORT}. Aplikacija je pripravljena.`);
        });

    } catch (error) {
        console.error('❌❌❌ NAPAKA: Povezave z bazo podatkov NI BILO MOGOČE vzpostaviti.');
        console.error('Podrobnosti napake:', error.message);
        console.error('\n[NASVET] Preverite, ali so okoljske spremenljivke (DB_HOST, DB_USER, itd.) v zavihku "Variables" na Railwayu pravilno nastavljene in se ujemajo s podatki iz zavihka "Connect" vaše MySQL baze.');
        // Strežnika namerno ne zaženemo, da se proces konča in Railway javi napako.
        process.exit(1);
    }
}

preveriPovezavoZBazo();
