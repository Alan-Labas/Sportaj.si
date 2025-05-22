const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: 'Smetar245',
        database: 'sportaj_si',
    }
});
const {hashiranjeObstojecihGesel} = require('./hashiranje_obsojecih_gesel.js');

async function napolniBazo() {
    try {
        await knex.schema.dropTableIfExists('Ocena_Sporta');
        await knex.schema.dropTableIfExists('Ocena_Trenerja');
        await knex.schema.dropTableIfExists('Sportna_Aktivnost');
        await knex.schema.dropTableIfExists('Sport');
        await knex.schema.dropTableIfExists('Trenerji');
        await knex.schema.dropTableIfExists('osvezilniTokens');
        await knex.schema.dropTableIfExists('Uporabniki');

        await knex.schema.createTable('Uporabniki', (table) => {
            table.increments('id');
            table.string('username').notNullable();
            table.string('geslo').notNullable();
            table.string('email').notNullable().unique();
            table.boolean('JeAdmin').notNullable().defaultTo(0);
            table.specificType('slika', 'LONGBLOB').nullable();
            table.timestamps(true, true);
        });

        console.log("Tabela Uporabniki je bila uspešno ustvarjena.");

        const Uporabniki = [
            //trenerji
            {username: 'MarkoTrener', geslo: 'geslo123', email: 'markoskace@trener.si', JeAdmin: 0},
            {username: 'LukaTrener', geslo: 'geslo123', email: 'luka.novak@trener.si', JeAdmin: 0},
            {username: 'TinaTrener', geslo: 'geslo123', email: 'tina.kovacic@trener.si', JeAdmin: 0},
            {username: 'JureTrener', geslo: 'geslo123', email: 'jure.zupancic@trener.si', JeAdmin: 0},
            {username: 'MajaTrener', geslo: 'geslo123', email: 'maja.jereb@trener.si', JeAdmin: 0},
            {username: 'NezaTrener', geslo: 'geslo123', email: 'neza.tomic@trener.si', JeAdmin: 0},
            {username: 'DavidTrener', geslo: 'geslo123', email: 'david.zajc@trener.si', JeAdmin: 0},
            {username: 'KatarinaTrener', geslo: 'geslo123', email: 'katarina.vidmar@trener.si', JeAdmin: 0},
            {username: 'MatevzTrener', geslo: 'geslo123', email: 'matevz.kralj@trener.si', JeAdmin: 0},
            {username: 'SimonaTrener', geslo: 'geslo123', email: 'simona.smerdu@trener.si', JeAdmin: 0},
            //uporabniki
            {username: 'ZupancicN', geslo: 'geslo123', email: 'nina.zupancic@gmail.com', JeAdmin: 0},
            {username: 'KrajncL', geslo: 'geslo123', email: 'luka.krajnc@gmail.com', JeAdmin: 0},
            {username: 'TurkS', geslo: 'geslo123', email: 'sara.turk@gmail.com', JeAdmin: 0},
            {username: 'MlakarJ', geslo: 'geslo123', email: 'jan.mlakar@gmail.com', JeAdmin: 0},
            {username: 'GolobT', geslo: 'geslo123', email: 'tina.golob@gmail.com', JeAdmin: 0},
            {username: 'VidmarB', geslo: 'geslo123', email: 'boris.vidmar@gmail.com', JeAdmin: 0},
            {username: 'LesjakE', geslo: 'geslo123', email: 'eva.lesjak@gmail.com', JeAdmin: 0},
            //admini
            {username: 'NovakP', geslo: 'geslo123', email: 'peter.novak@admin.com', JeAdmin: 1},
            {username: 'HorvatM', geslo: 'geslo123', email: 'maja.horvat@admin.com', JeAdmin: 1},
            {username: 'KovacA', geslo: 'geslo123', email: 'andrej.kovac@admin.com', JeAdmin: 1},
        ];

        await knex('Uporabniki').insert(Uporabniki);
        console.log("Podatki so bili uspešno dodani v tabelo Uporabniki.");

        await knex.schema.createTable('osvezilniTokens', table => {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable()
                .references('id').inTable('Uporabniki').onDelete('CASCADE');
            table.string('hashiranToken').notNullable().unique();
            table.timestamp('expires_at').notNullable();
            table.timestamps(true, true);
        });
        console.log("Tabela osvezilniTokens je bila uspešno ustvarjena.");

        await knex.schema.createTable('Trenerji', (table) => {
            table.increments('id');
            table.integer('TK_Uporabnik').unsigned().unique().references('id').inTable('Uporabniki').onDelete('SET NULL');
            table.string('ime').notNullable();
            table.string('priimek').notNullable();
            table.string('telefon').notNullable();
            table.string('email').notNullable().unique();
            table.text('urnik').notNullable();
            table.text('OpisProfila').nullable();
        });
        console.log("Tabela Trenerji je bila uspešno ustvarjena.");

        const trenerjiData = [
            {
                TK_Uporabnik: 1,
                ime: 'Marko',
                priimek: 'Skace',
                telefon: '070111222',
                email: 'markoskace@trener.si',
                urnik: 'Pon, Sre, Pet: 16:00-20:00',
                OpisProfila: 'Izkušen trener nogometa z večletnimi izkušnjami.'
            },
            {
                TK_Uporabnik: 2,
                ime: 'Luka',
                priimek: 'Novak',
                telefon: '070333444',
                email: 'luka.novak@trener.si',
                urnik: 'Tor, Čet: 17:00-21:00',
                OpisProfila: 'Specialist za košarkarske treninge mladih.'
            },
            {
                TK_Uporabnik: 3,
                ime: 'Tina',
                priimek: 'Kovacic',
                telefon: '070555666',
                email: 'tina.kovacic@trener.si',
                urnik: 'Pon, Tor, Sre, Čet, Pet: 08:00-12:00',
                OpisProfila: 'Trenerka atletike in tekaških priprav.'
            },
            {
                TK_Uporabnik: 4,
                ime: 'Jure',
                priimek: 'Zupancic',
                telefon: '070777888',
                email: 'jure.zupancic@trener.si',
                urnik: 'Po dogovoru',
                OpisProfila: 'Certificiran inštruktor plavanja za vse starosti.'
            },
            {
                TK_Uporabnik: 5,
                ime: 'Maja',
                priimek: 'Jereb',
                telefon: '070999000',
                email: 'maja.jereb@trener.si',
                urnik: 'Vikendi: 10:00-16:00',
                OpisProfila: 'Profesionalna teniška igralka in trenerka.'
            },
            {
                TK_Uporabnik: 6,
                ime: 'Neža',
                priimek: 'Tomic',
                telefon: '070123456',
                email: 'neza.tomic@trener.si',
                urnik: 'Sre, Pet: 18:00-20:00',
                OpisProfila: 'Trenerka odbojke, osredotočena na timsko delo.'
            },
            {
                TK_Uporabnik: 7,
                ime: 'David',
                priimek: 'Zajc',
                telefon: '070654321',
                email: 'david.zajc@trener.si',
                urnik: 'Tor, Čet: 19:00-21:00, Sob: 09:00-11:00',
                OpisProfila: 'Strokovnjak za rokometne taktike in tehnike.'
            },
            {
                TK_Uporabnik: 8,
                ime: 'Katarina',
                priimek: 'Vidmar',
                telefon: '070112233',
                email: 'katarina.vidmar@trener.si',
                urnik: 'Po dogovoru, večinoma zjutraj',
                OpisProfila: 'Navdušena kolesarka in vodnica kolesarskih tur.'
            },
            {
                TK_Uporabnik: 9,
                ime: 'Matevž',
                priimek: 'Kralj',
                telefon: '070445566',
                email: 'matevz.kralj@trener.si',
                urnik: 'Pon, Sre: 19:00-21:00',
                OpisProfila: 'Trener boksa z poudarkom na disciplini in tehniki.'
            },
            {
                TK_Uporabnik: 10,
                ime: 'Simona',
                priimek: 'Smerdu',
                telefon: '070778899',
                email: 'simona.smerdu@trener.si',
                urnik: 'Vikendi po dogovoru',
                OpisProfila: 'Golf inštruktorica z mednarodnimi izkušnjami.'
            },
        ];

        await knex('Trenerji').insert(trenerjiData);
        console.log("Podatki so bili uspešno dodani v tabelo Trenerji.");

        await knex.schema.createTable('Sport', (table) => {
            table.increments('id');
            table.string('Sport').notNullable();
        });
        console.log("Tabela Sport je bila uspešno ustvarjena.");
        const Sport = [
            {Sport: 'Nogomet'}, {Sport: 'Košarka'}, {Sport: 'Atletika'}, {Sport: 'Plavanje'}, {Sport: 'Tenis'},
            {Sport: 'Odbojka'}, {Sport: 'Rokomet'}, {Sport: 'Kolesarstvo'}, {Sport: 'Boks'}, {Sport: 'Golf'},
        ];
        await knex('Sport').insert(Sport);
        console.log("Podatki so bili uspešno dodani v tabelo Sport.");


        await knex.schema.createTable('Sportna_Aktivnost', (table) => {
            table.increments('id');
            table.string('Naziv').notNullable();
            table.text('Opis').notNullable();
            table.string('Lokacija').notNullable();
            table.decimal('Cena', 10, 2).notNullable().defaultTo(0.00);
            table.integer('ProstaMesta').notNullable().unsigned();
            table.string('slika').nullable();
            table.integer('TK_TipAktivnosti').unsigned().references('id').inTable('Sport').onDelete('SET NULL');
            table.integer('TK_Trener').unsigned().references('id').inTable('Trenerji').onDelete('SET NULL');
            table.timestamps(true, true);
        });
        console.log("Tabela Sportna_Aktivnost je bila uspešno ustvarjena.");
        const Sportna_Aktivnost = [
            {
                Naziv: 'Nogometna tekma U12',
                Opis: 'Prijateljska tekma med lokalnimi klubi.',
                Lokacija: 'Igrišče Center',
                Cena: 0,
                ProstaMesta: 0,
                slika: '/slike/sporti/nogomet.png',
                TK_TipAktivnosti: 1,
                TK_Trener: 1
            },
            {
                Naziv: 'Košarkarski večeri',
                Opis: 'Rekreativno igranje košarke.',
                Lokacija: 'Dvorana Tabor',
                Cena: 5,
                ProstaMesta: 10,
                slika: '/slike/sporti/kosarka.png',
                TK_TipAktivnosti: 2,
                TK_Trener: 2
            },
            {
                Naziv: 'Atletski miting Maribor',
                Opis: 'Tekmovanje v različnih atletskih disciplinah.',
                Lokacija: 'Stadion Poljane',
                Cena: 10,
                ProstaMesta: 100,
                slika: '/slike/sporti/atletika.png',
                TK_TipAktivnosti: 3,
                TK_Trener: 3
            },
            {
                Naziv: 'Plavalni tečaj za odrasle',
                Opis: 'Izboljšajte svojo plavalno tehniko.',
                Lokacija: 'Kopališče Pristan',
                Cena: 75,
                ProstaMesta: 5,
                slika: '/slike/sporti/plavanje.png',
                TK_TipAktivnosti: 4,
                TK_Trener: 4
            },
            {
                Naziv: 'Tenis turnir dvojic',
                Opis: 'Amaterski turnir v dvojicah.',
                Lokacija: 'Tenis igrišča Branik',
                Cena: 20,
                ProstaMesta: 8,
                slika: '/slike/sporti/tenis.png',
                TK_TipAktivnosti: 5,
                TK_Trener: 5
            },
        ];
        await knex('Sportna_Aktivnost').insert(Sportna_Aktivnost);
        console.log("Podatki so bili uspešno dodani v tabelo Sportna_Aktivnost.");


        await knex.schema.createTable('Ocena_Trenerja', (table) => {
            table.increments('id');
            table.text('Komentar').nullable();
            table.integer('Ocena').notNullable();
            table.date('Datum').notNullable();
            table.integer('TK_Trener').unsigned().references('id').inTable('Trenerji').onDelete('CASCADE');
            table.integer('TK_Uporabnik').unsigned().references('id').inTable('Uporabniki').onDelete('CASCADE');
            table.timestamps(true, true);
        });
        console.log("Tabela Ocena_Trenerja je bila uspešno ustvarjena.");
        const Ocena_Trenerja = [
            {Komentar: 'Marko je odličen motivator!', Ocena: 5, Datum: '2025-05-10', TK_Trener: 1, TK_Uporabnik: 11},
            {
                Komentar: 'Luka zna dobro razložiti tehniko.',
                Ocena: 4,
                Datum: '2025-05-11',
                TK_Trener: 2,
                TK_Uporabnik: 12
            },
            {Komentar: 'Tina je zelo strokovna.', Ocena: 5, Datum: '2025-04-15', TK_Trener: 3, TK_Uporabnik: 13},
            {
                Komentar: 'Pri Juretu sem se naučil pravilno plavati.',
                Ocena: 5,
                Datum: '2025-03-20',
                TK_Trener: 4,
                TK_Uporabnik: 14
            },
            {
                Komentar: 'Maja ima super pristop k treningu.',
                Ocena: 4,
                Datum: '2025-05-01',
                TK_Trener: 5,
                TK_Uporabnik: 15
            },
        ];
        await knex('Ocena_Trenerja').insert(Ocena_Trenerja);
        console.log("Podatki so bili uspešno dodani v tabelo Ocena_Trenerja.");

        await knex.schema.createTable('Ocena_Sporta', (table) => {
            table.increments('id');
            table.text('Komentar').nullable();
            table.integer('Ocena').notNullable();
            table.date('Datum').notNullable();
            table.integer('TK_SportnaAktivnost').unsigned().references('id').inTable('Sportna_Aktivnost').onDelete('CASCADE');
            table.integer('TK_Uporabnik').unsigned().references('id').inTable('Uporabniki').onDelete('CASCADE');
            table.timestamps(true, true);
        });
        console.log("Tabela Ocena_Sporta je bila uspešno ustvarjena.");
        const Ocena_Sporta = [
            {
                Komentar: 'Odlična organizacija tekme!',
                Ocena: 5,
                Datum: '2025-05-20',
                TK_SportnaAktivnost: 1,
                TK_Uporabnik: 11
            },
            {
                Komentar: 'Super vzdušje na košarki.',
                Ocena: 4,
                Datum: '2025-05-21',
                TK_SportnaAktivnost: 2,
                TK_Uporabnik: 12
            },
        ];
        await knex('Ocena_Sporta').insert(Ocena_Sporta);
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
        console.error("Napaka v skripti ustvari_tabele.js:", error);
    } finally {
        if (knex && knex.destroy) {
            await knex.destroy();
            console.log("Povezava z bazo je zaprta")
        }
    }
}

if (require.main === module) {
    main();
}