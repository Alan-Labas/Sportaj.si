const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: '127.0.0.1',
        user: 'root', // Vaš MySQL uporabnik
        password: 'Smetar245', // Vaše MySQL geslo
        database: 'sportaj_si',
        timezone: 'UTC', // Dodano za konsistentnost datumov
    }
});
const fs = require('fs');
const path = require('path');
// Prepričajte se, da je pot do te datoteke pravilna glede na vašo strukturo projekta
const { hashiranjeObstojecihGesel } = require('./hashiranje_obsojecih_gesel.js');


async function napolniBazo() {
    try {
        // --- POPRAVLJENO: Brisanje obstoječih tabel v pravilnem vrstnem redu ---
        // Najprej brišemo tabele, ki so najbolj odvisne (imajo tuje ključe na druge tabele).
        // Nato brišemo tabele, na katere so se prve sklicevale.

        console.log("Začenja se brisanje obstoječih tabel...");

        // 1. Nivo odvisnosti: te tabele se sklicujejo na druge, a se nobena ne sklicuje nanje (razen morda posredno).
        await knex.schema.dropTableIfExists('PrijaveNaAktivnosti');
        await knex.schema.dropTableIfExists('Sporočila');
        // Napaka omenja 'Ocena_Aktivnosti'. Verjetno gre za staro ime tabele. Brišemo obe možni imeni za vsak slučaj.
        await knex.schema.dropTableIfExists('Ocena_Aktivnosti');
        await knex.schema.dropTableIfExists('Ocena_Sporta');
        await knex.schema.dropTableIfExists('Ocena_Trenerja');
        await knex.schema.dropTableIfExists('Komentarji');
        await knex.schema.dropTableIfExists('osvezilniTokens');

        // 2. Nivo odvisnosti: Na te tabele so se sklicevale nekatere iz prejšnje skupine.
        await knex.schema.dropTableIfExists('Klepeti');
        await knex.schema.dropTableIfExists('TrenerSport');

        // 3. Nivo odvisnosti: Na te tabele so se sklicevale mnoge prejšnje.
        await knex.schema.dropTableIfExists('Sportna_Aktivnost');

        // 4. Nivo odvisnosti: "Starševske" tabele, ki so blizu korena odvisnosti.
        await knex.schema.dropTableIfExists('Sport');
        await knex.schema.dropTableIfExists('Trenerji');

        // 5. Končna, osnovna tabela, od katere so odvisne skoraj vse ostale.
        await knex.schema.dropTableIfExists('Uporabniki');

        console.log("Obstoječe tabele so bile uspešno pobrisane (če so obstajale).");


        // --- USTVARJANJE TABEL IN VSTAVLJANJE PODATKOV (ostaja enako) ---

        // Ustvarjanje tabele Uporabniki
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

        const Uporabniki = [
            //trenerji
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
            //uporabniki
            { username: 'ZupancicN', geslo: 'geslo123', email: 'nina.zupancic@gmail.com', JeAdmin: 0, jeTrener: 0 },
            { username: 'KrajncL', geslo: 'geslo123', email: 'luka.krajnc@gmail.com', JeAdmin: 0, jeTrener: 0 },
            { username: 'TurkS', geslo: 'geslo123', email: 'sara.turk@gmail.com', JeAdmin: 0, jeTrener: 0 },
            { username: 'MlakarJ', geslo: 'geslo123', email: 'jan.mlakar@gmail.com', JeAdmin: 0, jeTrener: 0 },
            { username: 'GolobT', geslo: 'geslo123', email: 'tina.golob@gmail.com', JeAdmin: 0, jeTrener: 0 },
            { username: 'VidmarB', geslo: 'geslo123', email: 'boris.vidmar@gmail.com', JeAdmin: 0, jeTrener: 0 },
            { username: 'LesjakE', geslo: 'geslo123', email: 'eva.lesjak@gmail.com', JeAdmin: 0, jeTrener: 0 },
            //admini
            { username: 'NovakP', geslo: 'geslo123', email: 'peter.novak@admin.com', JeAdmin: 1, jeTrener: 0 },
            { username: 'HorvatM', geslo: 'geslo123', email: 'maja.horvat@admin.com', JeAdmin: 1, jeTrener: 0 },
            { username: 'KovacA', geslo: 'geslo123', email: 'andrej.kovac@admin.com', JeAdmin: 1, jeTrener: 0 },
        ];
        await knex('Uporabniki').insert(Uporabniki);
        console.log("Podatki so bili uspešno dodani v tabelo Uporabniki.");

        // Ustvarjanje tabele osvezilniTokens
        await knex.schema.createTable('osvezilniTokens', table => {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable()
                .references('id').inTable('Uporabniki').onDelete('CASCADE');
            table.string('hashiranToken', 255).notNullable().unique();
            table.timestamp('expires_at').notNullable();
            table.timestamps(true, true);
        });
        console.log("Tabela osvezilniTokens je bila uspešno ustvarjena.");

        // Ustvarjanje tabele Trenerji
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

        const trenerjiData = [
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
        ];
        await knex('Trenerji').insert(trenerjiData);
        console.log("Podatki so bili uspešno dodani v tabelo Trenerji.");

        // Ustvarjanje tabele Sport
        await knex.schema.createTable('Sport', (table) => {
            table.increments('id').primary();
            table.string('Sport').notNullable().unique();
            table.text('Opis').nullable();
            table.timestamps(true, true);
        });
        console.log("Tabela Sport je bila uspešno ustvarjena.");

        const SportData = [
            { Sport: 'Nogomet', Opis: 'Moštveni šport z žogo.' },
            { Sport: 'Košarka', Opis: 'Dinamičen moštveni šport.' },
            { Sport: 'Atletika', Opis: 'Različne tekaške, skakalne in metalne discipline.' },
            { Sport: 'Plavanje', Opis: 'Individualni ali štafetni vodni šport.' },
            { Sport: 'Tenis', Opis: 'Priljubljen šport z loparjem.' },
            { Sport: 'Odbojka', Opis: 'Moštveni šport z mrežo.' },
            { Sport: 'Rokomet', Opis: 'Hiter in fizičen moštveni šport.' },
            { Sport: 'Kolesarstvo', Opis: 'Vožnja s kolesom po različnih terenih.' },
            { Sport: 'Boks', Opis: 'Borilni šport.' },
            { Sport: 'Golf', Opis: 'Precizen šport na prostem.' },
        ];
        await knex('Sport').insert(SportData);
        console.log("Podatki so bili uspešno dodani v tabelo Sport.");

        // Ustvarjanje tabele TrenerSport
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

        const trenerSportData = [];
        for (let i = 0; i < trenerjiData.length; i++) {
            if (trenerjiData[i].TK_Uporabnik <= SportData.length) {
                const trenerZapis = await knex('Trenerji').where({TK_Uporabnik: trenerjiData[i].TK_Uporabnik}).first();
                const sportZapis = await knex('Sport').where({Sport: SportData[i % SportData.length].Sport}).first();

                if(trenerZapis && sportZapis){
                    trenerSportData.push({ TK_Trener: trenerZapis.id, TK_Sport: sportZapis.id });
                }
            }
        }
        if (trenerSportData.length > 0) {
            await knex('TrenerSport').insert(trenerSportData);
            console.log("Podatki so bili uspešno dodani v tabelo TrenerSport.");
        }


        // Ustvarjanje tabele Sportna_Aktivnost
        await knex.schema.createTable('Sportna_Aktivnost', (table) => {
            table.increments('id').primary();
            table.string('Naziv').notNullable();
            table.text('Opis').notNullable();
            table.string('Lokacija').notNullable();
            
            table.decimal('Cena', 10, 2).notNullable().defaultTo(0.00);
            table.integer('ProstaMesta').notNullable().unsigned();
            table.enum('Nacin_Izvedbe', ['individualno', 'skupinsko']).defaultTo('skupinsko')
            table.specificType('slika', 'LONGBLOB').nullable();
            table.dateTime('Datum_Cas_Izvedbe').notNullable();
            table.integer('TK_TipAktivnosti').unsigned().references('id').inTable('Sport').onDelete('SET NULL');
            table.integer('TK_Trener').unsigned().nullable().references('id').inTable('Trenerji').onDelete('SET NULL');
            table.timestamps(true, true);
        });
        console.log("Tabela Sportna_Aktivnost je bila uspešno ustvarjena.");

        const sportneAktivnostiData = [
            {
                Naziv: 'Nogometna tekma U12', Opis: 'Prijateljska tekma med lokalnimi klubi.', Lokacija: 'Igrišče Center', Cena: 0, ProstaMesta: 22, Nacin_Izvedbe: 'skupinsko',
                slikaRelPath: '/slike/sporti/nogtekma.jfif', Datum_Cas_Izvedbe: '2025-06-15 17:00:00', TK_TipAktivnosti: 1, TK_Trener: 1
            },
            {
                Naziv: 'Košarkarski večeri', Opis: 'Rekreativno igranje košarke.', Lokacija: 'Dvorana Tabor', Cena: 5, ProstaMesta: 10, Nacin_Izvedbe: 'supinsko',
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
            }
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
            const sportZapis = await knex('Sport').where({id: act.TK_TipAktivnosti}).first();
            const trenerZapis = await knex('Trenerji').where({id: act.TK_Trener}).first();

            processedAktivnosti.push({
                Naziv: act.Naziv, Opis: act.Opis, Lokacija: act.Lokacija, Cena: act.Cena, ProstaMesta: act.ProstaMesta,
                slika: imageBuffer, Datum_Cas_Izvedbe: act.Datum_Cas_Izvedbe,
                TK_TipAktivnosti: sportZapis ? sportZapis.id : null,
                TK_Trener: trenerZapis ? trenerZapis.id : null,
            });
        }

        if (processedAktivnosti.length > 0) {
            await knex('Sportna_Aktivnost').insert(processedAktivnosti);
            console.log("Podatki so bili uspešno dodani v tabelo Sportna_Aktivnost (s slikami kot Buffer).");
        }


        // Ustvarjanje tabele Komentarji
        await knex.schema.createTable('Komentarji', (table) => {
            table.increments('id').primary();
            table.text('komentar').notNullable();
            table.timestamp('Datum_Komentarja').defaultTo(knex.fn.now());
            table.integer('TK_Uporabnik').unsigned().references('id').inTable('Uporabniki').onDelete('CASCADE');
            table.integer('TK_Aktivnost').unsigned().references('id').inTable('Sportna_Aktivnost').onDelete('CASCADE');
            table.timestamps(true, true);
        });
        console.log("Tabela Komentarji je bila uspešno ustvarjena.");


        // Ustvarjanje tabele Ocena_Trenerja
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

        const Ocena_Trenerja = [
            { Komentar: 'Marko je odličen motivator!', Ocena: 5, TK_Trener: 1, TK_Uporabnik: 11 },
            { Komentar: 'Zelo strokoven pristop in prilagojeni treningi. Napredek je viden!', Ocena: 5, TK_Trener: 1, TK_Uporabnik: 12 },
            { Komentar: 'Odlično vzdušje na treningih, vedno pripravljen pomagati.', Ocena: 4, TK_Trener: 1, TK_Uporabnik: 13 },
            { Komentar: 'Luka zna dobro razložiti tehniko.', Ocena: 4, TK_Trener: 2, TK_Uporabnik: 12 },
            { Komentar: 'Tina je zelo strokovna.', Ocena: 5, TK_Trener: 3, TK_Uporabnik: 13 },
            { Komentar: 'Pri Juretu sem se naučil pravilno plavati.', Ocena: 5, TK_Trener: 4, TK_Uporabnik: 14 },
            { Komentar: 'Maja ima super pristop k treningu.', Ocena: 4, TK_Trener: 5, TK_Uporabnik: 15 },
        ];
        await knex('Ocena_Trenerja').insert(Ocena_Trenerja);
        console.log("Podatki so bili uspešno dodani v tabelo Ocena_Trenerja.");

        // Ustvarjanje tabele Ocena_Sporta
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

        const Ocena_Sporta = [
            { Komentar: 'Odlična organizacija tekme!', Ocena: 5, TK_SportnaAktivnost: 1, TK_Uporabnik: 11 },
            { Komentar: 'Super vzdušje na košarki.', Ocena: 4, TK_SportnaAktivnost: 2, TK_Uporabnik: 12 },
        ];
        await knex('Ocena_Sporta').insert(Ocena_Sporta);
        console.log("Podatki so bili uspešno dodani v tabelo Ocena_Sporta.");

        // Ustvarjanje tabele Klepeti
        await knex.schema.createTable('Klepeti', (table) => {
            table.increments('id').primary();
            table.integer('uporabnik_id').unsigned().notNullable().references('id').inTable('Uporabniki').onDelete('CASCADE');
            table.integer('trener_id').unsigned().notNullable().references('id').inTable('Trenerji').onDelete('CASCADE');
            table.unique(['uporabnik_id', 'trener_id']);
            table.timestamps(true, true);
        });
        console.log("Tabela Klepeti je bila uspešno ustvarjena.");

        // Ustvarjanje tabele Sporočila
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

        // Ustvarjanje tabele PrijaveNaAktivnosti
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