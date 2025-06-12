require('dotenv').config();

const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER, // Vaš MySQL uporabnik
        password: process.env.DB_PASSWORD, // Vaše MySQL geslo
        database: process.env.DBDATABASE,
        PORT: process.env.DB_PORT,
        timezone: 'UTC',
    }
});
const fs = require('fs');
const path = require('path');
const { hashiranjeObstojecihGesel } = require('./hashiranje_obsojecih_gesel.js');


async function napolniBazo() {
    try {
        console.log("Začenja se brisanje obstoječih tabel...");
        await knex.schema.dropTableIfExists('PrijaveNaAktivnosti');
        await knex.schema.dropTableIfExists('Sporočila');
        await knex.schema.dropTableIfExists('Ocena_Sporta');
        await knex.schema.dropTableIfExists('Ocena_Trenerja');
        await knex.schema.dropTableIfExists('Komentarji');
        await knex.schema.dropTableIfExists('osvezilniTokens');
        await knex.schema.dropTableIfExists('Klepeti');
        await knex.schema.dropTableIfExists('TrenerSport');
        await knex.schema.dropTableIfExists('Sportna_Aktivnost');
        await knex.schema.dropTableIfExists('Sport');
        await knex.schema.dropTableIfExists('Trenerji');
        await knex.schema.dropTableIfExists('Uporabniki');

        console.log("Obstoječe tabele so bile uspešno pobrisane (če so obstajale).");

        // --- USTVARJANJE TABEL ---

        // Tabela Uporabniki
        await knex.schema.createTable('Uporabniki', (table) => {
            table.increments('id').primary();
            table.string('username').notNullable().unique();
            table.string('geslo').notNullable();
            table.string('email').notNullable().unique();
            table.boolean('JeAdmin').notNullable().defaultTo(0);
            table.boolean('jeTrener').notNullable().defaultTo(0);
            table.specificType('slika', 'LONGBLOB').nullable();
            table.timestamps(true, true);
        });
        console.log("Tabela Uporabniki je bila uspešno ustvarjena.");

        // Tabela osvezilniTokens
        await knex.schema.createTable('osvezilniTokens', table => {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable()
                .references('id').inTable('Uporabniki').onDelete('CASCADE');
            table.string('hashiranToken', 255).notNullable().unique();
            table.timestamp('expires_at').notNullable();
            table.timestamps(true, true);
        });
        console.log("Tabela osvezilniTokens je bila uspešno ustvarjena.");

        // Tabela Trenerji
        await knex.schema.createTable('Trenerji', (table) => {
            table.increments('id').primary();
            table.integer('TK_Uporabnik').unsigned().unique().references('id').inTable('Uporabniki').onDelete('CASCADE');
            table.string('spol').nullable();
            table.string('ime').notNullable();
            table.string('priimek').notNullable();
            table.string('telefon').notNullable();
            table.string('email').notNullable().unique();
            table.text('urnik').notNullable();
            table.text('OpisProfila').nullable();
            table.string('Lokacija', 255).nullable();
            table.timestamps(true, true);
        });
        console.log("Tabela Trenerji je bila uspešno ustvarjena.");

        // Tabela Sport
        await knex.schema.createTable('Sport', (table) => {
            table.increments('id').primary();
            table.string('Sport').notNullable().unique();
            table.text('Opis').nullable();
            table.timestamps(true, true);
        });
        console.log("Tabela Sport je bila uspešno ustvarjena.");

        // Tabela TrenerSport
        await knex.schema.createTable('TrenerSport', table => {
            table.increments('id').primary();
            table.integer('TK_Trener').unsigned().notNullable()
                .references('id').inTable('Trenerji').onDelete('CASCADE');
            table.integer('TK_Sport').unsigned().notNullable()
                .references('id').inTable('Sport').onDelete('CASCADE');
            table.unique(['TK_Trener', 'TK_Sport']);
            table.timestamps(true, true);
        });
        console.log("Tabela TrenerSport je bila uspešno ustvarjena.");

        // Tabela Sportna_Aktivnost
        await knex.schema.createTable('Sportna_Aktivnost', (table) => {
            table.increments('id').primary();
            table.string('Naziv').notNullable();
            table.text('Opis').notNullable();
            table.string('Lokacija').notNullable();
            table.decimal('Cena', 10, 2).notNullable().defaultTo(0.00);
            table.integer('ProstaMesta').notNullable().unsigned();
            table.integer('MaxMesta').unsigned().notNullable().defaultTo(0); // ODSTRANJENA METODA .after()
            table.enum('Nacin_Izvedbe', ['individualno', 'skupinsko']).defaultTo('skupinsko');
            table.specificType('slika', 'LONGBLOB').nullable();
            table.dateTime('Datum_Cas_Izvedbe').notNullable();
            table.integer('TK_TipAktivnosti').unsigned().references('id').inTable('Sport').onDelete('SET NULL');
            table.integer('TK_Trener').unsigned().nullable().references('id').inTable('Trenerji').onDelete('SET NULL');
            table.timestamps(true, true);
        });
        console.log("Tabela Sportna_Aktivnost je bila uspešno ustvarjena.");


        // Tabela Komentarji
        await knex.schema.createTable('Komentarji', (table) => {
            table.increments('id').primary();
            table.text('komentar').notNullable();
            table.timestamp('Datum_Komentarja').defaultTo(knex.fn.now());
            table.integer('TK_Uporabnik').unsigned().references('id').inTable('Uporabniki').onDelete('CASCADE');
            table.integer('TK_Aktivnost').unsigned().references('id').inTable('Sportna_Aktivnost').onDelete('CASCADE');
            table.timestamps(true, true);
        });
        console.log("Tabela Komentarji je bila uspešno ustvarjena.");

        // Tabela Ocena_Trenerja
        await knex.schema.createTable('Ocena_Trenerja', (table) => {
            table.increments('id').primary();
            table.text('Komentar').nullable();
            table.integer('Ocena').notNullable();
            table.timestamp('Datum').defaultTo(knex.fn.now());
            table.integer('TK_Trener').unsigned().references('id').inTable('Trenerji').onDelete('CASCADE');
            table.integer('TK_Uporabnik').unsigned().references('id').inTable('Uporabniki').onDelete('CASCADE');
            table.unique(['TK_Trener', 'TK_Uporabnik']);
            table.timestamps(true, true);
        });
        console.log("Tabela Ocena_Trenerja je bila uspešno ustvarjena.");

        // Tabela Ocena_Sporta (prej Ocena_Aktivnosti)
        await knex.schema.createTable('Ocena_Sporta', (table) => {
            table.increments('id').primary();
            table.text('Komentar').nullable();
            table.integer('Ocena').notNullable();
            table.timestamp('Datum').defaultTo(knex.fn.now());
            table.integer('TK_SportnaAktivnost').unsigned().references('id').inTable('Sportna_Aktivnost').onDelete('CASCADE');
            table.integer('TK_Uporabnik').unsigned().references('id').inTable('Uporabniki').onDelete('CASCADE');
            table.unique(['TK_SportnaAktivnost', 'TK_Uporabnik']);
            table.timestamps(true, true);
        });
        console.log("Tabela Ocena_Sporta je bila uspešno ustvarjena.");

        // Tabela Klepeti
        await knex.schema.createTable('Klepeti', (table) => {
            table.increments('id').primary();
            table.integer('uporabnik_id').unsigned().notNullable().references('id').inTable('Uporabniki').onDelete('CASCADE');
            table.integer('trener_id').unsigned().notNullable().references('id').inTable('Trenerji').onDelete('CASCADE');
            table.unique(['uporabnik_id', 'trener_id']);
            table.timestamps(true, true);
        });
        console.log("Tabela Klepeti je bila uspešno ustvarjena.");

        // Tabela Sporočila
        await knex.schema.createTable('Sporočila', (table) => {
            table.increments('id').primary();
            table.integer('klepet_id').unsigned().notNullable().references('id').inTable('Klepeti').onDelete('CASCADE');
            table.text('vsebina').notNullable();
            table.integer('posiljatelj_id').unsigned().notNullable().references('id').inTable('Uporabniki').onDelete('CASCADE');
            table.string('tip_posiljatelja', 15).notNullable();
            table.timestamp('izbrisano_ob').nullable();
            table.timestamps(true, true);
        });
        console.log("Tabela Sporočila je bila uspešno ustvarjena.");

        // Tabela PrijaveNaAktivnosti
        await knex.schema.createTable('PrijaveNaAktivnosti', (table) => {
            table.increments('id').primary();
            table.integer('TK_Uporabnik').unsigned().notNullable()
                .references('id').inTable('Uporabniki').onDelete('CASCADE');
            table.integer('TK_Aktivnost').unsigned().notNullable()
                .references('id').inTable('Sportna_Aktivnost').onDelete('CASCADE');
            table.timestamp('Datum_Prijave').defaultTo(knex.fn.now());
            table.unique(['TK_Uporabnik', 'TK_Aktivnost']);
            table.timestamps(true, true);
        });
        console.log("Tabela PrijaveNaAktivnosti je bila uspešno ustvarjena.");


        // --- ZDRUŽENI PODATKI IN VSTAVLJANJE ---

        // Vsi uporabniki
        const vsiUporabniki = [
            // Trenerji iz ustvari_tabele.js (10)
            { username: 'MarkoTrener', geslo: 'geslo123', email: 'markoskace@trener.si', JeAdmin: 0, jeTrener: 1 },
            { username: 'LukaTrener', geslo: 'geslo123', email: 'luka.novak@trener.si', JeAdmin: 0, jeTrener: 1 },
            { username: 'TinaTrener', geslo: 'geslo123', email: 'tina.kovacic@trener.si', JeAdmin: 0, jeTrener: 1 },
            { username: 'JureTrener', geslo: 'geslo123', email: 'jure.zupancic@trener.si', JeAdmin: 0, jeTrener: 1 },
            { username: 'MajaTrener', geslo: 'geslo123', email: 'maja.jereb@trener.si', JeAdmin: 0, jeTrener: 1 },
            { username: 'NezaTrener', geslo: 'geslo123', email: 'neza.tomic@trener.si', JeAdmin: 0, jeTrener: 1 },
            { username: 'DavidTrener', geslo: 'geslo123', email: 'david.zajc@trener.si', JeAdmin: 0, jeTrener: 1 },
            { username: 'KatarinaTrener', geslo: 'geslo123', email: 'katarina.vidmar@trener.si', JeAdmin: 0, jeTrener: 1 },
            { username: 'MatevzTrener', geslo: 'geslo123', email: 'matevz.kralj@trener.si', JeAdmin: 0, jeTrener: 1 },
            { username: 'SimonaTrener', geslo: 'geslo123', email: 'simona.smerdu@trener.si', JeAdmin: 0, jeTrener: 1 },
            // Navadni uporabniki iz ustvari_tabele.js (7)
            { username: 'ZupancicN', geslo: 'geslo123', email: 'nina.zupancic@gmail.com', JeAdmin: 0, jeTrener: 0 },
            { username: 'KrajncL', geslo: 'geslo123', email: 'luka.krajnc@gmail.com', JeAdmin: 0, jeTrener: 0 },
            { username: 'TurkS', geslo: 'geslo123', email: 'sara.turk@gmail.com', JeAdmin: 0, jeTrener: 0 },
            { username: 'MlakarJ', geslo: 'geslo123', email: 'jan.mlakar@gmail.com', JeAdmin: 0, jeTrener: 0 },
            { username: 'GolobT', geslo: 'geslo123', email: 'tina.golob@gmail.com', JeAdmin: 0, jeTrener: 0 },
            { username: 'VidmarB', geslo: 'geslo123', email: 'boris.vidmar@gmail.com', JeAdmin: 0, jeTrener: 0 },
            { username: 'LesjakE', geslo: 'geslo123', email: 'eva.lesjak@gmail.com', JeAdmin: 0, jeTrener: 0 },
            // Admini iz ustvari_tabele.js (3)
            { username: 'NovakP', geslo: 'geslo123', email: 'peter.novak@admin.com', JeAdmin: 1, jeTrener: 0 },
            { username: 'HorvatM', geslo: 'geslo123', email: 'maja.horvat@admin.com', JeAdmin: 1, jeTrener: 0 },
            { username: 'KovacA', geslo: 'geslo123', email: 'andrej.kovac@admin.com', JeAdmin: 1, jeTrener: 0 },
            // Uporabniki (ki so tudi trenerji) iz dodajPrimerkeVTabele.js (31) - popravljeno jeTrener: 1
            {username: 'MarkoKrevh', geslo:'geslo123', email:'MarkoKrevh@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'LukaNovak', geslo:'geslo123', email:'LukaNovak@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'AnaKovac', geslo:'geslo123', email:'AnaKovac@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'NinaZupan', geslo:'geslo123', email:'NinaZupan@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'MarkoPotocnik', geslo:'geslo123', email:'MarkoPotocnik@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'SaraHribar', geslo:'geslo123', email:'SaraHribar@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'MatejKrevs', geslo:'geslo123', email:'MatejKrevs@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'KajaKranjc', geslo:'geslo123', email:'KajaKranjc@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'ZigaLogar', geslo:'geslo123', email:'ZigaLogar@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'TinaPetek', geslo:'geslo123', email:'TinaPetek@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'JureBerk', geslo:'geslo123', email:'JureBerk@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'LeaVidmar', geslo:'geslo123', email:'LeaVidmar@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'RokOblak', geslo:'geslo123', email:'RokOblak@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'MajaSever', geslo:'geslo123', email:'MajaSever@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'NejcDolenc', geslo:'geslo123', email:'NejcDolenc@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'JanaRemic', geslo:'geslo123', email:'JanaRemic@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'SimonErjavec', geslo:'geslo123', email:'SimonErjavec@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'EvaMlakar', geslo:'geslo123', email:'EvaMlakar@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'MarkoKralj', geslo:'geslo123', email:'MarkoKralj@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'TjasaZorko', geslo:'geslo123', email:'TjasaZorko@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'MihaZnidarscic', geslo:'geslo123', email:'MihaZnidarscic@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'PetraTurk', geslo:'geslo123', email:'PetraTurk@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'MarkoKne', geslo:'geslo123', email:'MarkoKne@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'AljaRebernik', geslo:'geslo123', email:'AljaRebernik@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'MarkoRupnik', geslo:'geslo123', email:'MarkoRupnik@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'NikaPerko', geslo:'geslo123', email:'NikaPerko@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'AlenFurlan', geslo:'geslo123', email:'AlenFurlan@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'LauraKosir', geslo:'geslo123', email:'LauraKosir@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'IgorKos', geslo:'geslo123', email:'IgorKos@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'ZalaBenko', geslo:'geslo123', email:'ZalaBenko@gmail.com', JeAdmin: 0, jeTrener: 1},
            {username: 'UrosMajer', geslo:'geslo123', email:'UrosMajer@gmail.com', JeAdmin: 0, jeTrener: 1}
        ];
        // Vstavimo uporabnike in shranimo njihove ID-je
        const uporabnikiVstavljeni = await knex('Uporabniki').insert(vsiUporabniki).returning('id');
        console.log(`Podatki so bili uspešno dodani v tabelo Uporabniki (${uporabnikiVstavljeni.length} zapisov).`);

        // Vsi trenerji (s pravilnimi referencami na ID-je uporabnikov)
        const vsiTrenerji = [
            // Trenerji iz ustvari_tabele.js (10) - TK_Uporabnik ostane 1-10
            { TK_Uporabnik: 1, spol: 'm', ime: 'Marko', priimek: 'Skace', telefon: '070111222', email: 'markoskace@trener.si', urnik: 'Pon, Sre, Pet: 16:00-20:00', OpisProfila: 'Izkušen trener nogometa z večletnimi izkušnjami.', Lokacija: 'Maribor Center' },
            { TK_Uporabnik: 2, spol: 'm', ime: 'Luka', priimek: 'Novak', telefon: '070333444', email: 'luka.novak@trener.si', urnik: 'Tor, Čet: 17:00-21:00', OpisProfila: 'Specialist za košarkarske treninge mladih.', Lokacija: 'Dvorana Tabor' },
            { TK_Uporabnik: 3, spol: 'f', ime: 'Tina', priimek: 'Kovacic', telefon: '070555666', email: 'tina.kovacic@trener.si', urnik: 'Pon, Tor, Sre, Čet, Pet: 08:00-12:00', OpisProfila: 'Trenerka atletike in tekaških priprav.', Lokacija: 'Stadion Poljane' },
            { TK_Uporabnik: 4, spol: 'm', ime: 'Jure', priimek: 'Zupancic', telefon: '070777888', email: 'jure.zupancic@trener.si', urnik: 'Po dogovoru', OpisProfila: 'Certificiran inštruktor plavanja za vse starosti.', Lokacija: 'Kopališče Pristan' },
            { TK_Uporabnik: 5, spol: 'f', ime: 'Maja', priimek: 'Jereb', telefon: '070999000', email: 'maja.jereb@trener.si', urnik: 'Vikendi: 10:00-16:00', OpisProfila: 'Profesionalna teniška igralka in trenerka.', Lokacija: 'Tenis Center Branik' },
            { TK_Uporabnik: 6, spol: 'f', ime: 'Neža', priimek: 'Tomic', telefon: '070123456', email: 'neza.tomic@trener.si', urnik: 'Sre, Pet: 18:00-20:00', OpisProfila: 'Trenerka odbojke, osredotočena na timsko delo.', Lokacija: 'OŠ Leona Štuklja' },
            { TK_Uporabnik: 7, spol: 'm', ime: 'David', priimek: 'Zajc', telefon: '070654321', email: 'david.zajc@trener.si', urnik: 'Tor, Čet: 19:00-21:00, Sob: 09:00-11:00', OpisProfila: 'Strokovnjak za rokometne taktike in tehnike.', Lokacija: 'Športna dvorana Ljudski vrt' },
            { TK_Uporabnik: 8, spol: 'f', ime: 'Katarina', priimek: 'Vidmar', telefon: '070112233', email: 'katarina.vidmar@trener.si', urnik: 'Po dogovoru, večinoma zjutraj', OpisProfila: 'Navdušena kolesarka in vodnica kolesarskih tur.', Lokacija: 'Pohorje' },
            { TK_Uporabnik: 9, spol: 'm', ime: 'Matevž', priimek: 'Kralj', telefon: '070445566', email: 'matevz.kralj@trener.si', urnik: 'Pon, Sre: 19:00-21:00', OpisProfila: 'Trener boksa z poudarkom na disciplini in tehniki.', Lokacija: 'Boksarski klub Maribor' },
            { TK_Uporabnik: 10, spol: 'f', ime: 'Simona', priimek: 'Smerdu', telefon: '070778899', email: 'simona.smerdu@trener.si', urnik: 'Vikendi po dogovoru', OpisProfila: 'Golf inštruktorica z mednarodnimi izkušnjami.', Lokacija: 'Golf igrišče Ptuj' },
            // Trenerji iz dodajPrimerkeVTabele.js (31) - TK_Uporabnik popravljen na 21-51
            {TK_Uporabnik:21,spol:'m',ime: 'Marko', priimek: 'Krevh',telefon: '170283948', email:'markokrevh@trener.si', urnik: 'Pon: 16:00-18:00, Sre: 17:00-19:00, Pet: 16:00-18:00',OpisProfila: 'Izkušen nogometni strateg.'},
            {TK_Uporabnik:22,spol:'m',ime: 'Luka', priimek: 'Novak', telefon: '698457223', email:'lukanovak78@trener.si', urnik: 'Pon: 14:00-16:00, Sre: 16:00-18:00', OpisProfila: 'Trener z dolgoletnimi izkušnjami v odbojki.'},
            {TK_Uporabnik:23,spol:'f',ime: 'Ana', priimek: 'Kovač', telefon: '927435180', email:'anakovac53@trener.si', urnik: 'Tor: 17:00-19:00, Čet: 17:00-19:00, Sob: 10:00-12:00', OpisProfila: 'Trener z mednarodno licenco.'},
            {TK_Uporabnik:24,spol:'f',ime: 'Nina', priimek: 'Zupan', telefon: '362842790', email:'ninazupan12@trener.si', urnik: 'Tor: 15:00-17:00, Čet: 18:00-20:00', OpisProfila: 'Tenis trener s fokusom na tehniki.'},
            {TK_Uporabnik:25,spol:'m',ime: 'Marko', priimek: 'Potočnik', telefon: '419826589', email:'markopotocnik63@trener.si', urnik: 'Pon: 18:00-20:00, Sre: 18:00-20:00', OpisProfila: 'Mlad in motiviran fitnes trener.'},
            {TK_Uporabnik:26,spol:'f',ime: 'Sara', priimek: 'Hribar', telefon: '286492041', email:'sarahribar55@trener.si', urnik: 'Pon: 14:00-16:00, Sre: 16:00-18:00', OpisProfila: 'Strokovnjak za ekipni duh in disciplino.'},
            {TK_Uporabnik:27,spol:'m',ime: 'Matej', priimek: 'Krevs', telefon: '963785104', email:'matejkrevs84@trener.si', urnik: 'Tor: 15:00-17:00, Čet: 18:00-20:00', OpisProfila: 'Trener z dolgoletnimi izkušnjami v odbojki.'},
            {TK_Uporabnik:28,spol:'f',ime: 'Kaja', priimek: 'Kranjc', telefon: '325790846', email:'kajakranjc42@outlook.com', urnik: 'Pon: 18:00-20:00, Sre: 18:00-20:00', OpisProfila: 'Izkušen nogometni strateg.'},
            {TK_Uporabnik:29,spol:'m',ime: 'Žiga', priimek: 'Logar', telefon: '523804710', email:'zigalogar90@yahoo.com', urnik: 'Tor: 15:00-17:00, Čet: 18:00-20:00', OpisProfila: 'Strasten učitelj košarke.'},
            {TK_Uporabnik:30,spol:'f',ime: 'Tina', priimek: 'Petek', telefon: '739528163', email:'tinapetek76@gmail.com', urnik: 'Pon: 14:00-16:00, Sre: 16:00-18:00', OpisProfila: 'Zagnan boksarski mentor.'},
            {TK_Uporabnik:31,spol:'m',ime: 'Jure', priimek: 'Berk', telefon: '170536847', email:'jureberk98@gmail.com', urnik: 'Pon: 14:00-16:00, Sre: 16:00-18:00', OpisProfila: 'Specialist za fizično pripravo.'},
            {TK_Uporabnik:32,spol:'f',ime: 'Lea', priimek: 'Vidmar', telefon: '319478205', email:'leavidmar33@gmail.com', urnik: 'Tor: 17:00-19:00, Čet: 17:00-19:00', OpisProfila: 'Trenerka z energijo in znanjem za vse starosti.'},
            {TK_Uporabnik:33,spol:'m',ime: 'Rok', priimek: 'Oblak', telefon: '578320416', email:'rokoblak21@siol.net', urnik: 'Pon: 16:00-18:00, Pet: 18:00-20:00', OpisProfila: 'Nogometni trener z izkušnjami iz tujine.'},
            {TK_Uporabnik:34,spol:'f',ime: 'Maja', priimek: 'Sever', telefon: '860214379', email:'majasever62@gmail.com', urnik: 'Tor: 14:00-16:00, Sre: 17:00-19:00', OpisProfila: 'Strokovnjakinja za vadbo otrok.'},
            {TK_Uporabnik:35,spol:'m',ime: 'Nejc', priimek: 'Dolenc', telefon: '204967583', email:'nejcdolenc12@outlook.com', urnik: 'Sre: 15:00-17:00, Sob: 10:00-12:00', OpisProfila: 'Vedno nasmejan in potrpežljiv košarkarski trener.'},
            {TK_Uporabnik:36,spol:'f',ime: 'Jana', priimek: 'Remic', telefon: '671394820', email:'janaremic55@yahoo.com', urnik: 'Tor: 17:00-19:00, Čet: 17:00-19:00', OpisProfila: 'Fitnes trenerka s poudarkom na rehabilitaciji.'},
            {TK_Uporabnik:37,spol:'m',ime: 'Simon', priimek: 'Erjavec', telefon: '785302196', email:'simonerjavec99@gmail.com', urnik: 'Pon: 18:00-20:00, Sre: 18:00-20:00', OpisProfila: 'Motivator in mentor mladih športnikov.'},
            {TK_Uporabnik:38,spol:'f',ime: 'Eva', priimek: 'Mlakar', telefon: '943120578', email:'evamlakar88@gmail.com', urnik: 'Tor: 14:00-16:00, Pet: 15:00-17:00', OpisProfila: 'Specialistka za gibanje in kondicijo.'},
            {TK_Uporabnik:39,spol:'m',ime: 'Marko', priimek: 'Kralj', telefon: '390458126', email:'markokralj12@gmail.com', urnik: 'Tor: 18:00-20:00, Čet: 18:00-20:00', OpisProfila: 'Nogometni entuziast in strokovnjak za taktike.'},
            {TK_Uporabnik:40,spol:'f',ime: 'Tjaša', priimek: 'Zorko', telefon: '642397158', email:'tjasazorko67@gmail.com', urnik: 'Pon: 16:00-18:00, Sre: 17:00-19:00', OpisProfila: 'Plesna trenerka s srcem za gibanje.'},
            {TK_Uporabnik:41,spol:'m',ime: 'Miha', priimek: 'Žnidaršič', telefon: '132408796', email:'mihaznidar@gmail.com', urnik: 'Pon: 14:00-16:00, Sre: 18:00-20:00', OpisProfila: 'Vedno na voljo za individualni pristop.'},
            {TK_Uporabnik:42,spol:'f',ime: 'Petra', priimek: 'Turk', telefon: '812309456', email:'petraturk55@gmail.com', urnik: 'Tor: 15:00-17:00, Pet: 16:00-18:00', OpisProfila: 'Tenis trenerka z občutkom za napredek.'},
            {TK_Uporabnik:43,spol:'m',ime: 'Marko', priimek: 'Kne', telefon: '904812356', email:'markokne77@siol.net', urnik: 'Sre: 17:00-19:00, Sob: 10:00-12:00', OpisProfila: 'Fizioterapevt in osebni trener.' },
            {TK_Uporabnik:44,spol:'f',ime: 'Alja', priimek: 'Rebernik', telefon: '534982610', email:'aljarebernik33@yahoo.com', urnik: 'Pon: 15:00-17:00, Sre: 16:00-18:00', OpisProfila: 'Strokovnjakinja za vadbo žensk.' },
            {TK_Uporabnik:45,spol:'m',ime: 'Marko', priimek: 'Rupnik', telefon: '421395706', email:'markorupnik@gmail.com', urnik: 'Čet: 17:00-19:00, Sob: 9:00-11:00', OpisProfila: 'Zagrizen športni navdušenec in mentor.'},
            {TK_Uporabnik:46,spol:'f',ime: 'Nika', priimek: 'Perko', telefon: '739541280', email:'nikaperko@gmail.com', urnik: 'Tor: 16:00-18:00, Čet: 16:00-18:00', OpisProfila: 'Trenerka joge in sprostitve.'},
            {TK_Uporabnik:47,spol:'m',ime: 'Alen', priimek: 'Furlan', telefon: '873104592', email:'alenfurlan44@gmail.com', urnik: 'Sre: 17:00-19:00, Pet: 15:00-17:00', OpisProfila: 'Individualni trener z licenco UEFA B.'},
            {TK_Uporabnik:48,spol:'f',ime: 'Laura', priimek: 'Košir', telefon: '248163790', email:'laurakosir84@gmail.com', urnik: 'Pon: 15:00-17:00, Sre: 17:00-19:00', OpisProfila: 'Navdihujoča mentorica z empatijo.'},
            {TK_Uporabnik:49,spol:'m',ime: 'Igor', priimek: 'Kos', telefon: '982745610', email:'igorkos22@gmail.com', urnik: 'Tor: 18:00-20:00, Čet: 18:00-20:00', OpisProfila: 'Strokovnjak za nogometno taktiko.'},
            {TK_Uporabnik:50,spol:'f',ime: 'Zala', priimek: 'Benko', telefon: '312498175', email:'zalabenko76@gmail.com', urnik: 'Pon: 16:00-18:00, Pet: 16:00-18:00', OpisProfila: 'Pilates trenerka z osebnim pristopom.'},
            {TK_Uporabnik:51,spol:'m',ime: 'Uroš', priimek: 'Majer', telefon: '763581029', email:'urosmajer65@gmail.com', urnik: 'Sre: 16:00-18:00, Sob: 10:00-12:00', OpisProfila: 'Košarkarski strateg in motivator.'}
        ];
        await knex('Trenerji').insert(vsiTrenerji);
        console.log(`Podatki so bili uspešno dodani v tabelo Trenerji (${vsiTrenerji.length} zapisov).`);

        // Vsi športi
        const sportData = [
            { Sport: 'Nogomet', Opis: 'Moštveni šport z žogo.' }, // ID: 1
            { Sport: 'Košarka', Opis: 'Dinamičen moštveni šport.' }, // ID: 2
            { Sport: 'Atletika', Opis: 'Različne tekaške, skakalne in metalne discipline.' }, // ID: 3
            { Sport: 'Plavanje', Opis: 'Individualni ali štafetni vodni šport.' }, // ID: 4
            { Sport: 'Tenis', Opis: 'Priljubljen šport z loparjem.' }, // ID: 5
            { Sport: 'Odbojka', Opis: 'Moštveni šport z mrežo.' }, // ID: 6
            { Sport: 'Rokomet', Opis: 'Hiter in fizičen moštveni šport.' }, // ID: 7
            { Sport: 'Kolesarstvo', Opis: 'Vožnja s kolesom po različnih terenih.' }, // ID: 8
            { Sport: 'Boks', Opis: 'Borilni šport.' }, // ID: 9
            { Sport: 'Golf', Opis: 'Precizen šport na prostem.' }, // ID: 10
        ];
        await knex('Sport').insert(sportData);
        console.log("Podatki so bili uspešno dodani v tabelo Sport.");

        // Vse športne aktivnosti
        const sportneAktivnostiData = [
            // Aktivnosti iz ustvari_tabele.js (5)
            {
                Naziv: 'Nogometna tekma U12', Opis: 'Prijateljska tekma med lokalnimi klubi.', Lokacija: 'Igrišče Center', Cena: 0, ProstaMesta: 22, Nacin_Izvedbe: 'skupinsko',
                slikaRelPath: '/slike/sporti/nogtekma.jfif', Datum_Cas_Izvedbe: '2025-06-15 17:00:00', TK_TipAktivnosti: 1, TK_Trener: 1
            },
            {
                Naziv: 'Košarkarski večeri', Opis: 'Rekreativno igranje košarke.', Lokacija: 'Dvorana Tabor', Cena: 5, ProstaMesta: 10, Nacin_Izvedbe: 'skupinsko',
                slikaRelPath: '/slike/sporti/kostekma.jfif', Datum_Cas_Izvedbe: '2025-06-10 20:00:00', TK_TipAktivnosti: 2, TK_Trener: 2
            },
            {
                Naziv: 'Atletski miting Maribor', Opis: 'Tekmovanje v različnih atletskih disciplinah.', Lokacija: 'Stadion Poljane', Cena: 10, ProstaMesta: 100, Nacin_Izvedbe: 'skupinsko',
                slikaRelPath: '/slike/sporti/atlettrening.jfif', Datum_Cas_Izvedbe: '2025-06-20 15:00:00', TK_TipAktivnosti: 3, TK_Trener: 3
            },
            {
                Naziv: 'Plavalni tečaj za odrasle', Opis: 'Izboljšajte svojo plavalno tehniko.', Lokacija: 'Kopališče Pristan', Cena: 75, ProstaMesta: 5, Nacin_Izvedbe: 'individualno',
                slikaRelPath: '/slike/sporti/plavaltrening.jfif', Datum_Cas_Izvedbe: '2025-06-30 09:00:00', TK_TipAktivnosti: 4, TK_Trener: 4
            },
            {
                Naziv: 'Tenis turnir dvojic', Opis: 'Amaterski turnir v dvojicah.', Lokacija: 'Tenis igrišča Branik', Cena: 20, ProstaMesta: 8, Nacin_Izvedbe: 'skupinsko',
                slikaRelPath: '/slike/sporti/tenis.jfif', Datum_Cas_Izvedbe: '2025-06-25 14:00:00', TK_TipAktivnosti: 5, TK_Trener: 5
            },
            // Aktivnosti iz dodajPrimerkeVTabele.js (30) - TK_Trener ID-ji so pravilni glede na združen seznam trenerjev
            {Naziv: 'Košarkarski turnir', Opis:'Turnir med srednjimi šolami', Lokacija: 'Branik', Cena: 0, ProstaMesta: 80, slikaRelPath: '/slike/sporti/kostekma.jfif', Datum_Cas_Izvedbe: '2025-06-15 17:00:00', TK_TipAktivnosti:2, TK_Trener:6},
            {Naziv: 'Nogometni trening A', Opis: 'Trening za začetnike z osnovnimi tehnikami.', Lokacija: 'Ljubljana', Cena: 10, ProstaMesta: 20, slikaRelPath: '/slike/sporti/nogtekma.jfif', Datum_Cas_Izvedbe: '2025-06-15 17:00:00', TK_TipAktivnosti: 1, TK_Trener: 7},
            {Naziv: 'Košarkarski turnir B', Opis: 'Turnir za srednješolce, finalni dvoboji.', Lokacija: 'Maribor', Cena: 0, ProstaMesta: 80, slikaRelPath: '/slike/sporti/kostekma.jfif', Datum_Cas_Izvedbe: '2025-06-15 17:00:00', TK_TipAktivnosti: 2, TK_Trener: 8},
            {Naziv: 'Atletska delavnica C', Opis: 'Delavnica teka in skokov.', Lokacija: 'Celje', Cena: 5, ProstaMesta: 30, slikaRelPath: '/slike/sporti/atlettrening.jfif', Datum_Cas_Izvedbe: '2025-07-13 17:00:00', TK_TipAktivnosti: 3, TK_Trener: 9},
            {Naziv: 'Plavalni izziv D', Opis: 'Preizkusi svoje plavalne sposobnosti!', Lokacija: 'Koper', Cena: 8, ProstaMesta: 25, slikaRelPath: '/slike/sporti/plavaltrening.jfif', Datum_Cas_Izvedbe: '2025-06-19 17:00:00', TK_TipAktivnosti: 4, TK_Trener: 10},
            {Naziv: 'Tenis dvoboj E', Opis: 'Dvoboji za amaterske igralce.', Lokacija: 'Ptuj', Cena: 12, ProstaMesta: 16, slikaRelPath: '/slike/sporti/tenis.jfif', Datum_Cas_Izvedbe: '2025-08-11 17:00:00', TK_TipAktivnosti: 5, TK_Trener: 11},
            {Naziv: 'Odbojkarska liga F', Opis: 'Liga mešanih ekip.', Lokacija: 'Nova Gorica', Cena: 6, ProstaMesta: 40, slikaRelPath: '/slike/sporti/odbojka.jfif', Datum_Cas_Izvedbe: '2025-07-07 17:00:00', TK_TipAktivnosti: 6, TK_Trener: 12},
            {Naziv: 'Rokometna tekma G', Opis: 'Prijateljska tekma med klubi.', Lokacija: 'Novo mesto', Cena: 0, ProstaMesta: 50, slikaRelPath: '/slike/sporti/rokomet.jfif', Datum_Cas_Izvedbe: '2025-06-09 17:00:00', TK_TipAktivnosti: 7, TK_Trener: 13},
            {Naziv: 'Kolesarski vzpon H', Opis: 'Vzpon na Pohorje s časovnim merjenjem.', Lokacija: 'Maribor', Cena: 15, ProstaMesta: 35, slikaRelPath: '/slike/sporti/kolo.jfif', Datum_Cas_Izvedbe: '2025-06-24 17:00:00', TK_TipAktivnosti: 8, TK_Trener: 14},
            {Naziv: 'Boksarska šola I', Opis: 'Tehnični trening za začetnike.', Lokacija: 'Kranj', Cena: 20, ProstaMesta: 10, slikaRelPath: '/slike/sporti/boks.jfif', Datum_Cas_Izvedbe: '2025-06-28 17:00:00', TK_TipAktivnosti: 9, TK_Trener: 15},
            {Naziv: 'Golf dan J', Opis: 'Turnir za začetnike z mentorji.', Lokacija: 'Bled', Cena: 25, ProstaMesta: 15, slikaRelPath: '/slike/sporti/golf.jfif', Datum_Cas_Izvedbe: '2025-07-16 17:00:00', TK_TipAktivnosti: 10, TK_Trener: 16},
            {Naziv: 'Nogometna liga K', Opis: 'Amaterska rekreativna liga.', Lokacija: 'Ljubljana', Cena: 10, ProstaMesta: 22, slikaRelPath: '/slike/sporti/nogtekma.jfif', Datum_Cas_Izvedbe: '2025-08-12 17:00:00', TK_TipAktivnosti: 1, TK_Trener: 17},
            {Naziv: 'Košarkarska šola L', Opis: 'Šola za otroke od 10 do 14 let.', Lokacija: 'Koper', Cena: 5, ProstaMesta: 18, slikaRelPath: '/slike/sporti/kostekma.jfif', Datum_Cas_Izvedbe: '2025-06-13 17:00:00', TK_TipAktivnosti: 2, TK_Trener: 18},
            {Naziv: 'Atletski miting M', Opis: 'Regijsko atletsko tekmovanje.', Lokacija: 'Celje', Cena: 0, ProstaMesta: 60, slikaRelPath: '/slike/sporti/atlettrening.jfif', Datum_Cas_Izvedbe: '2025-06-15 17:00:00', TK_TipAktivnosti: 3, TK_Trener: 19},
            {Naziv: 'Plavalni kamp N', Opis: 'Teden učenja plavanja.', Lokacija: 'Nova Gorica', Cena: 18, ProstaMesta: 20, slikaRelPath: '/slike/sporti/plavaltrening.jfif', Datum_Cas_Izvedbe: '2025-06-15 17:00:00', TK_TipAktivnosti: 4, TK_Trener: 20},
            {Naziv: 'Tenis šola O', Opis: 'Poletna šola tenisa za mladino.', Lokacija: 'Ljubljana', Cena: 13, ProstaMesta: 12, slikaRelPath: '/slike/sporti/tenis.jfif',  Datum_Cas_Izvedbe: '2025-06-15 17:00:00',TK_TipAktivnosti: 5, TK_Trener: 21},
            {Naziv: 'Odbojka na mivki P', Opis: 'Turnir dvojic na prostem.', Lokacija: 'Portorož', Cena: 7, ProstaMesta: 28, slikaRelPath: '/slike/sporti/odbojka.jfif', Datum_Cas_Izvedbe: '2025-08-19 17:00:00', TK_TipAktivnosti: 6, TK_Trener: 22},
            {Naziv: 'Rokometna šola Q', Opis: 'Osnovne veščine rokometa.', Lokacija: 'Trbovlje', Cena: 9, ProstaMesta: 30, slikaRelPath: '/slike/sporti/rokomet.jfif', Datum_Cas_Izvedbe: '2025-09-17 17:00:00', TK_TipAktivnosti: 7, TK_Trener: 23},
            {Naziv: 'Gorsko kolesarstvo R', Opis: 'Pustolovska tura z vodičem.', Lokacija: 'Kamnik', Cena: 20, ProstaMesta: 12, slikaRelPath: '/slike/sporti/kolo.jfif', Datum_Cas_Izvedbe: '2025-09-15 17:00:00', TK_TipAktivnosti: 8, TK_Trener: 24},
            {Naziv: 'Boks za mladostnike S', Opis: 'Trening kondicije in tehnike.', Lokacija: 'Ptuj', Cena: 17, ProstaMesta: 14, slikaRelPath: '/slike/sporti/boks.jfif', Datum_Cas_Izvedbe: '2025-07-26 17:00:00', TK_TipAktivnosti: 9, TK_Trener: 25},
            {Naziv: 'Golf turnir T', Opis: 'Turnir v parih.', Lokacija: 'Bovec', Cena: 30, ProstaMesta: 10, slikaRelPath: '/slike/sporti/golf.jfif', Datum_Cas_Izvedbe: '2025-06-27 17:00:00', TK_TipAktivnosti: 10, TK_Trener: 26},
            {Naziv: 'Nogomet za dekleta U', Opis: 'Nogometna skupina za deklice.', Lokacija: 'Murska Sobota', Cena: 5, ProstaMesta: 20, slikaRelPath: '/slike/sporti/nogtekma.jfif', Datum_Cas_Izvedbe: '2025-07-27 17:00:00', TK_TipAktivnosti: 1, TK_Trener: 27},
            {Naziv: 'Košarkarski kamp V', Opis: 'Poletni kamp za srednješolce.', Lokacija: 'Škofja Loka', Cena: 10, ProstaMesta: 24, slikaRelPath: '/slike/sporti/kostekma.jfif', Datum_Cas_Izvedbe: '2025-08-19 17:00:00', TK_TipAktivnosti: 2, TK_Trener: 28},
            {Naziv: 'Atletski trening W', Opis: 'Trening za šprint in met.', Lokacija: 'Vrhnika', Cena: 6, ProstaMesta: 18, slikaRelPath: '/slike/sporti/atlettrening.jfif', Datum_Cas_Izvedbe: '2025-08-24 17:00:00', TK_TipAktivnosti: 3, TK_Trener: 29},
            {Naziv: 'Plavalni miting X', Opis: 'Tekmovanje za kadete.', Lokacija: 'Ajdovščina', Cena: 0, ProstaMesta: 50, slikaRelPath: '/slike/sporti/plavaltrening.jfif', Datum_Cas_Izvedbe: '2025-09-03 17:00:00', TK_TipAktivnosti: 4, TK_Trener: 30},
            {Naziv: 'Tenis za odrasle Y', Opis: 'Rekreativni večerni termini.', Lokacija: 'Ilirska Bistrica', Cena: 14, ProstaMesta: 8, slikaRelPath: '/slike/sporti/tenis.jfif', Datum_Cas_Izvedbe: '2025-09-02 17:00:00', TK_TipAktivnosti: 5, TK_Trener: 31},
            {Naziv: 'Odbojka z žogo Z', Opis: 'Osnove igre z žogo.', Lokacija: 'Sežana', Cena: 4, ProstaMesta: 30, slikaRelPath: '/slike/sporti/odbojka.jfif', Datum_Cas_Izvedbe: '2025-09-15 17:00:00', TK_TipAktivnosti: 6, TK_Trener: 32},
            {Naziv: 'Rokometni dvoboj Ž', Opis: 'Prijateljska tekma.', Lokacija: 'Postojna', Cena: 3, ProstaMesta: 16, slikaRelPath: '/slike/sporti/rokomet.jfif', Datum_Cas_Izvedbe: '2025-07-17 17:00:00', TK_TipAktivnosti: 7, TK_Trener: 33},
            {Naziv: 'Kolesarski maraton AA', Opis: 'Maraton skozi slovensko podeželje.', Lokacija: 'Grosuplje', Cena: 18, ProstaMesta: 40, slikaRelPath: '/slike/sporti/kolo.jfif', Datum_Cas_Izvedbe: '2025-06-29 17:00:00', TK_TipAktivnosti: 8, TK_Trener: 34},
            {Naziv: 'Boksarska borba AB', Opis: 'Dogodek za napredne boksarje.', Lokacija: 'Zagorje', Cena: 22, ProstaMesta: 6, slikaRelPath: '/slike/sporti/boks.jfif', Datum_Cas_Izvedbe: '2025-06-18 17:00:00', TK_TipAktivnosti: 9, TK_Trener: 35},
            {Naziv: 'Golf tečaj AC', Opis: 'Intenziven vikend program.', Lokacija: 'Rogaška Slatina', Cena: 27, ProstaMesta: 9, slikaRelPath: '/slike/sporti/golf.jfif', Datum_Cas_Izvedbe: '2025-06-21 17:00:00', TK_TipAktivnosti: 10, TK_Trener: 36}
        ];

        const processedAktivnosti = [];
        for (let act of sportneAktivnostiData) {
            let imageBuffer = null;
            const slikaPotCelotna = path.join(__dirname, '..', 'www', act.slikaRelPath);
            if (fs.existsSync(slikaPotCelotna)) {
                imageBuffer = fs.readFileSync(slikaPotCelotna);
            } else {
                console.warn(`Slika ni najdena na poti: ${slikaPotCelotna} za aktivnost "${act.Naziv}"`);
            }

            processedAktivnosti.push({
                Naziv: act.Naziv,
                Opis: act.Opis,
                Lokacija: act.Lokacija,
                Cena: act.Cena,
                ProstaMesta: act.ProstaMesta,
                MaxMesta: act.ProstaMesta,
                Nacin_Izvedbe: act.Nacin_Izvedbe || 'skupinsko',
                slika: imageBuffer,
                Datum_Cas_Izvedbe: act.Datum_Cas_Izvedbe,
                TK_TipAktivnosti: act.TK_TipAktivnosti,
                TK_Trener: act.TK_Trener,
            });
        }

        if (processedAktivnosti.length > 0) {
            await knex('Sportna_Aktivnost').insert(processedAktivnosti);
            console.log(`Podatki so bili uspešno dodani v tabelo Sportna_Aktivnost (${processedAktivnosti.length} zapisov).`);
        }

        // Dinamično generiranje povezav TrenerSport na podlagi aktivnosti
        const trenerSportPari = {};
        sportneAktivnostiData.forEach(act => {
            if (act.TK_Trener && act.TK_TipAktivnosti) {
                const par = `${act.TK_Trener}-${act.TK_TipAktivnosti}`;
                trenerSportPari[par] = { TK_Trener: act.TK_Trener, TK_Sport: act.TK_TipAktivnosti };
            }
        });

        const trenerSportData = Object.values(trenerSportPari);
        if (trenerSportData.length > 0) {
            await knex('TrenerSport').insert(trenerSportData);
            console.log(`Podatki so bili uspešno dodani v tabelo TrenerSport (${trenerSportData.length} zapisov).`);
        }


        // Ocene Trenerjev
        const ocenaTrenerjaData = [
            // Uporabniki 11-17 so navadni uporabniki
            { Komentar: 'Marko je odličen motivator!', Ocena: 5, TK_Trener: 1, TK_Uporabnik: 11 },
            { Komentar: 'Zelo strokoven pristop in prilagojeni treningi. Napredek je viden!', Ocena: 5, TK_Trener: 1, TK_Uporabnik: 12 },
            { Komentar: 'Odlično vzdušje na treningih, vedno pripravljen pomagati.', Ocena: 4, TK_Trener: 1, TK_Uporabnik: 13 },
            { Komentar: 'Luka zna dobro razložiti tehniko.', Ocena: 4, TK_Trener: 2, TK_Uporabnik: 12 },
            { Komentar: 'Tina je zelo strokovna.', Ocena: 5, TK_Trener: 3, TK_Uporabnik: 13 },
            { Komentar: 'Pri Juretu sem se naučil pravilno plavati.', Ocena: 5, TK_Trener: 4, TK_Uporabnik: 14 },
            { Komentar: 'Maja ima super pristop k treningu.', Ocena: 4, TK_Trener: 5, TK_Uporabnik: 15 },
        ];
        await knex('Ocena_Trenerja').insert(ocenaTrenerjaData);
        console.log("Podatki so bili uspešno dodani v tabelo Ocena_Trenerja.");

        // Ocene Športa/Aktivnosti
        const ocenaSportaData = [
            { Komentar: 'Odlična organizacija tekme!', Ocena: 5, TK_SportnaAktivnost: 1, TK_Uporabnik: 11 },
            { Komentar: 'Super vzdušje na košarki.', Ocena: 4, TK_SportnaAktivnost: 2, TK_Uporabnik: 12 },
        ];
        await knex('Ocena_Sporta').insert(ocenaSportaData);
        console.log("Podatki so bili uspešno dodani v tabelo Ocena_Sporta.");

        console.log("Vse tabele so bile uspešno ustvarjene in napolnjene s podatki.");
        console.log("Začenja se hashiranje gesel za vstavljene uporabnike.")
        await hashiranjeObstojecihGesel();
        console.log("Hashiranje gesel je končano");

    } catch (error) {
        console.error("Napaka pri ustvarjanju tabel ali vstavljanju podatkov:", error);
        throw error;
    }
}

async function main() {
    try {
        await napolniBazo();
        console.log('Skripta ustvari_tabele.js je uspešno zaključena, vključno s hashiranjem gesel.');
    } catch (error) {
        console.error("Celotna skripta ustvari_tabele.js ni bila uspešno izvedena:", error.message);
    } finally {
        if (knex && typeof knex.destroy === 'function') {
            await knex.destroy();
            console.log("Povezava z bazo je zaprta.");
        }
    }
}

if (require.main === module) {
    main();
}
