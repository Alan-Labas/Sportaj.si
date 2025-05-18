const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: 'geslo',
        database: 'sportaj_si',
    }
});

async function napolniBazo() {
    try {
        await knex.schema.dropTableIfExists('Ocena_Sporta');
        await knex.schema.dropTableIfExists('Ocena_Trenerja');
        await knex.schema.dropTableIfExists('Sportna_Aktivnost');
        await knex.schema.dropTableIfExists('Sport');
        await knex.schema.dropTableIfExists('Trenerji');
        await knex.schema.dropTableIfExists('Uporabniki');
    
        await knex.schema.createTable('Uporabniki', (table) => {
            table.increments('id');
            table.string('username').notNullable;
            table.string('geslo').notNullable;
            table.string('email').notNullable;
            table.boolean('JeAdmin').notNullable;
        });

        console.log("Tabela Uporabniki je bila uspešno ustvarjena.");

        const Uporabniki = [
            //trenerji
            {username: 'Marko', geslo: 'geslo123', email: 'markoskace@gmail.com', JeAdmin: 0},
            {username: 'Luka', geslo: 'geslo123', email: 'luka.novak@gmail.com', JeAdmin: 0},
            {username: 'Tina', geslo: 'geslo123', email: 'tina.kovacic@gmail.com', JeAdmin: 0},
            {username: 'Jure', geslo: 'geslo123', email: 'jure.zupancic@gmail.com', JeAdmin: 0},
            {username: 'Maja', geslo: 'geslo123', email: 'maja.jereb@gmail.com', JeAdmin: 0},
            {username: 'Neža', geslo: 'geslo123', email: 'neza.tomic@gmail.com', JeAdmin: 0},
            {username: 'David', geslo: 'geslo123', email: 'david.zajc@gmail.com', JeAdmin: 0},
            {username: 'Katarina', geslo: 'geslo123', email: 'katarina.vidmar@gmail.com', JeAdmin: 0},
            {username: 'Matevž', geslo: 'geslo123', email: 'matevz.kralj@gmail.com', JeAdmin: 0},
            {username: 'Simona', geslo: 'geslo123', email: 'simona.smerdu@gmail.com', JeAdmin: 0},
            //uporabniki
            {username: 'ZupancicN', geslo: 'geslo123', email: 'nina.zupancic@example.com', JeAdmin: 0},
            {username: 'KrajncL', geslo: 'geslo123', email: 'luka.krajnc@example.com', JeAdmin: 0},
            {username: 'TurkS', geslo: 'geslo123', email: 'sara.turk@example.com', JeAdmin: 0},
            {username: 'MlakarJ', geslo: 'geslo123', email: 'jan.mlakar@example.com', JeAdmin: 0},
            {username: 'GolobT', geslo: 'geslo123', email: 'tina.golob@example.com', JeAdmin: 0},
            {username: 'VidmarB', geslo: 'geslo123', email: 'boris.vidmar@example.com', JeAdmin: 0},
            {username: 'LesjakE', geslo: 'geslo123', email: 'eva.lesjak@example.com', JeAdmin: 0},
            //admini
            {username: 'NovakP', geslo: 'geslo123', email: 'peter.novak@admin.com', JeAdmin: 1},
            {username: 'HorvatM', geslo: 'geslo123', email: 'maja.horvat@admin.com', JeAdmin: 1},
            {username: 'KovacA', geslo: 'geslo123', email: 'andrej.kovac@admin.com', JeAdmin: 1},
        ];

        await knex('Uporabniki').insert(Uporabniki);

        console.log("Podatki so bili uspešno dodani v tabelo Uporabniki.");


        
    
    
        await knex.schema.createTable('Trenerji', (table) => {
            table.increments('id');
            table.integer('TK_Uporabnik').unsigned().references('id').inTable('Uporabniki');
            table.string('ime').notNullable;
            table.string('priimek').notNullable;
            table.integer('telefon').notNullable;
            table.string('email').notNullable;
            table.string('urnik').notNullable;
            table.string('OpisProfila');
            table.string('slika').notNullable;
        });

        console.log("Tabela Trenerji je bila uspešno ustvarjena.");

        const Trenerji = [
            {TK_Uporabnik: 1, ime: 'Marko', priimek: 'Skace', telefon: 170176253, email:'markoskace@gmail.com', urnik: 'Pon: 16:00-18:00, Sre: 17:00-19:00, Pet: 16:00-18:00', OpisProfila: 'Izkušen nogometni strateg.', slika: '../slike/trenerji/MarkoSkace.avif' },
            {TK_Uporabnik: 2, ime: 'Luka', priimek: 'Novak', telefon: 141576293, email:'luka.novak@gmail.com', urnik: 'Tor: 18:00-20:00, Čet: 18:00-20:00, Sob: 10:00-12:00', OpisProfila: 'Motivator na košarkarskem igrišču.', slika: '../slike/trenerji/LukaNovak.jpg' },
            {TK_Uporabnik: 3, ime: 'Tina', priimek: 'Kovačič', telefon: 151237458, email:'tina.kovacic@gmail.com', urnik: 'Pon: 17:00-18:30, Sre: 17:00-18:30, Pet: 08:00-09:30', OpisProfila: 'Strokovnjakinja za tekaške discipline.', slika: '../slike/trenerji/LukaNovak.jpg' },
            {TK_Uporabnik: 4, ime: 'Jure', priimek: 'Zupančič', telefon: 140547630, email:'jure.zupancic@gmail.com', urnik: 'Tor: 07:00-09:00 (bazen), Čet: 16:00-18:00 (bazen)', OpisProfila: 'Navdušen učitelj plavalnih tehnik.', slika: '../slike/trenerji/LukaNovak.jpg' },
            {TK_Uporabnik: 5, ime: 'Maja', priimek: 'Jereb', telefon: 170987654, email:'maja.jereb@gmail.com', urnik: 'Pon: 15:00-17:00, Sre: 15:00-17:00, Sob: 09:00-11:00', OpisProfila: 'Specialistka za razvoj teniških talentov.', slika: '	../slike/trenerji/LukaNovak.jpg' },
            {TK_Uporabnik: 6, ime: 'Neža', priimek: 'Tomić', telefon: 131678912, email:'neza.tomic@gmail.net', urnik: 'Tor: 19:00-21:00, Čet: 19:00-21:00', OpisProfila: 'Predana razvoju odbojkarskih veščin.', slika: '../slike/trenerji/LukaNovak.jpg' },
            {TK_Uporabnik: 7, ime: 'David', priimek: 'Zajc', telefon: 141298736, email:'david.zajc@gmail.com', urnik: 'Pon: 18:30-20:00, Sre: 18:30-20:00, Pet: 17:00-18:30', OpisProfila: 'Trener z poudarkom na ekipnem duhu.', slika: '../slike/trenerji/LukaNovak.jpg' },
            {TK_Uporabnik: 8, ime: 'Katarina', priimek: 'Vidmar', telefon: 151823907, email:'katarina.vidmar@gmail.com', urnik: 'Sob: 09:00-13:00 (skupinske vožnje), Ned: po dogovoru (individualno)', OpisProfila: 'Strastna kolesarka in mentorica.', slika: '../slike/trenerji/LukaNovak.jpg' },
            {TK_Uporabnik: 9, ime: 'Matevž', priimek: 'Kralj', telefon: 131235678, email:'matevz.kralj@gmail.si', urnik: 'Tor: 20:00-21:30, Čet: 20:00-21:30, Sob: 11:00-12:30', OpisProfila: 'Učitelj discipline in boksarske tehnike.', slika: '../slike/trenerji/LukaNovak.jpg' },
            {TK_Uporabnik: 10, ime: 'Simona', priimek: 'Smerdu', telefon: 170176253, email:'simona.smerdu@gmail.net', urnik: 'Sre: 10:00-12:00, Pet: 14:00-16:00, Ned: 09:00-11:00 (igrišče)', OpisProfila: 'Izpopolnjevanje vaše golf igre.', slika: '../slike/trenerji/LukaNovak.jpg' },
        ];

        await knex('Trenerji').insert(Trenerji);

        console.log("Podatki so bili uspešno dodani v tabelo Trenerji.");


        
        
        
        await knex.schema.createTable('Sport', (table) => {
            table.increments('id');
            table.string('Sport').notNullable;
        });

        console.log("Tabela Sport je bila uspešno ustvarjena.");

        const Sport = [
            {Sport: 'Nogomet'},
            {Sport: 'Košarka'},
            {Sport: 'Atletika'},
            {Sport: 'Plavanje'},
            {Sport: 'Tenis'},
            {Sport: 'Odbojka'},
            {Sport: 'Rokomet'},
            {Sport: 'Kolesarstvo'},
            {Sport: 'Boks'},
            {Sport: 'Golf'},
        ];

        await knex('Sport').insert(Sport);

        console.log("Podatki so bili uspešno dodani v tabelo Sport.");


        
        

        await knex.schema.createTable('Sportna_Aktivnost', (table) => {
            table.increments('id');
            table.string('Naziv').notNullable;
            table.string('Opis').notNullable;
            table.string('Lokacija').notNullable;
            table.integer('Cena').notNullable;
            table.integer('ProstaMesta').notNullable;
            table.string('slika').notNullable;
            table.integer('TK_TipAktivnosti').unsigned().references('id').inTable('Sport');
            table.integer('TK_Trener').unsigned().references('id').inTable('Trenerji');
        });

        console.log("Tabela Sportna_Aktivnost je bila uspešno ustvarjena.");

        const Sportna_Aktivnost = [
            {Naziv: 'Nogometna tekma', Opis: 'Tekma med ekipama A in B.', Lokacija: 'Igrišče A', Cena: 10, ProstaMesta: 20, slika: '../slike/sporti/nogtekma.jfif', TK_TipAktivnosti: 1, TK_Trener: 1},
            {Naziv: 'Košarkaška tekma', Opis: 'Tekma med ekipama C in D.', Lokacija: 'Igrišče B', Cena: 15, ProstaMesta: 25, slika: '../slike/sporti/kostekma.jfif', TK_TipAktivnosti: 2, TK_Trener: 2},
            {Naziv: 'Atletski trening', Opis: 'Trening za atletske discipline.', Lokacija: 'Atletski stadion', Cena: 12, ProstaMesta: 30, slika: '../slike/sporti/atlettreningjfif', TK_TipAktivnosti: 3, TK_Trener: 3},
            {Naziv: 'Plavalni trening', Opis: 'Trening plavanja za začetnike.', Lokacija: 'Bazen A', Cena: 8, ProstaMesta: 15, slika: '../slike/sporti/plavaltrening.jfif', TK_TipAktivnosti: 4, TK_Trener: 4},
            {Naziv: 'Tenisni trening', Opis: 'Trening tenisa za vse ravni znanja.', Lokacija: 'Tenis igrišče A', Cena: 20, ProstaMesta: 10, slika: '../slike/sporti/tenis.jfif', TK_TipAktivnosti: 5, TK_Trener: 5},
            {Naziv: 'Odbojkarski trening', Opis: 'Trening odbojke za začetnike.', Lokacija: 'Odbojkarso igrišče A', Cena: 10, ProstaMesta: 12, slika: '../slike/sporti/odbojka', TK_TipAktivnosti: 6, TK_Trener: 6},
            {Naziv: 'Rokometna tekma', Opis: 'Tekma med ekipama E in F.', Lokacija: 'Igrišče C', Cena: 10, ProstaMesta: 20, slika: '../slike/sporti/rokomet.jfif', TK_TipAktivnosti: 7, TK_Trener: 7},
            {Naziv: 'Kolesarska tura', Opis: 'Skupinska kolesarska tura.', Lokacija: 'Kolesarska steza A', Cena: 5, ProstaMesta: 8, slika: '../slike/sporti/kolo.jfif', TK_TipAktivnosti: 8, TK_Trener: 8},
            {Naziv: 'Boksarski trening', Opis: 'Trening boksa za vse ravni znanja.', Lokacija: 'Boksarska dvorana A', Cena: 15, ProstaMesta: 10, slika: '../slike/sporti/boks.jfif', TK_TipAktivnosti: 9, TK_Trener: 9},
            {Naziv: 'Golf trening', Opis: 'Trening golfa za začetnike.', Lokacija: 'Golf igrišče A', Cena: 25, ProstaMesta: 5, slika: '../slike/sporti/golf.jfif', TK_TipAktivnosti: 10, TK_Trener: 10},
        ];

        await knex('Sportna_Aktivnost').insert(Sportna_Aktivnost);

        console.log("Podatki so bili uspešno dodani v tabelo Sportna_Aktivnost.");





         await knex.schema.createTable('Ocena_Trenerja', (table) => {
            table.increments('id');
            table.string('Komentar');
            table.integer('Ocena').notNullable;
            table.string('Datum').notNullable;
            table.integer('TK_Trener').unsigned().references('id').inTable('Trenerji');
            table.integer('TK_Uporabnik').unsigned().references('id').inTable('Uporabniki');
        });

        console.log("Tabela Ocena_Trenerja je bila uspešno ustvarjena.");

        const Ocena_Trenerja = [
            {Komentar: 'Odličen trener, zelo prijazen.', Ocena: 5, Datum: '2025-05-10', TK_Trener: 1, TK_Uporabnik: 11},
            {Komentar: 'Super trening, priporočam!', Ocena: 4, Datum: '2025-05-11', TK_Trener: 2, TK_Uporabnik: 12},
            {Komentar: 'Zelo strokoven in prijazen trener.', Ocena: 5, Datum: '2025-05-12', TK_Trener: 3, TK_Uporabnik: 13},
            {Komentar: 'Trening je bil pretežak.', Ocena: 3, Datum: '2025-05-13', TK_Trener: 4, TK_Uporabnik: 14},
            {Komentar: 'Vse pohvale za trening!', Ocena: 5, Datum: '2025-05-14', TK_Trener: 5, TK_Uporabnik: 15},
            {Komentar: 'Zelo prijeten trening.', Ocena: 4, Datum: '2025-05-15', TK_Trener: 6, TK_Uporabnik: 16},
            {Komentar: 'Trener je zelo motiviran.', Ocena: 5, Datum: '2025-05-16', TK_Trener: 7, TK_Uporabnik: 17},
            {Komentar: 'Super izkušnja!', Ocena: 5, Datum: '2025-05-17', TK_Trener: 8, TK_Uporabnik: 18},
            {Komentar: 'Zelo dober trening.', Ocena: 4, Datum: '2025-05-18', TK_Trener: 9, TK_Uporabnik: 19},
            {Komentar: 'Priporočam vsem!', Ocena: 5, Datum: '2025-05-19', TK_Trener: 10, TK_Uporabnik: 20},
        ];

        await knex('Ocena_Trenerja').insert(Ocena_Trenerja);

        console.log("Podatki so bili uspešno dodani v tabelo Ocena_Trenerja.");





        await knex.schema.createTable('Ocena_Sporta', (table) => {
            table.increments('id');
            table.string('Komentar');
            table.integer('Ocena').notNullable;
            table.string('Datum').notNullable;
            table.integer('TK_SportnaAktivnost').unsigned().references('id').inTable('Sportna_Aktivnost');
            table.integer('TK_Uporabnik').unsigned().references('id').inTable('Uporabniki');
        });

        console.log("Tabela Ocena_Sporta je bila uspešno ustvarjena.");

        const Ocena_Sporta = [
            {Komentar: 'Super izkušnja, priporočam!', Ocena: 5, Datum: '2025-05-20', TK_SportnaAktivnost: 1, TK_Uporabnik: 11},
            {Komentar: 'Zelo dober trening.', Ocena: 4, Datum: '2025-05-21', TK_SportnaAktivnost: 2, TK_Uporabnik: 12},
            {Komentar: 'Vse pohvale za trening!', Ocena: 5, Datum: '2025-05-22', TK_SportnaAktivnost: 3, TK_Uporabnik: 13},
            {Komentar: 'Trening je bil pretežak.', Ocena: 3, Datum: '2025-05-23', TK_SportnaAktivnost: 4, TK_Uporabnik: 14},
            {Komentar: 'Odličen trener, zelo prijazen.', Ocena: 5, Datum: '2025-05-24', TK_SportnaAktivnost: 5, TK_Uporabnik: 15},
            {Komentar: 'Zelo strokoven in prijazen trener.', Ocena: 5, Datum: '2025-05-25', TK_SportnaAktivnost: 6, TK_Uporabnik: 16},
            {Komentar: 'Super izkušnja!', Ocena: 5, Datum: '2025-05-26', TK_SportnaAktivnost: 7, TK_Uporabnik: 17},
            {Komentar: 'Zelo dober trening.', Ocena: 4, Datum: '2025-05-27', TK_SportnaAktivnost: 8, TK_Uporabnik: 18},
            {Komentar: 'Priporočam vsem!', Ocena: 5, Datum: '2025-05-28', TK_SportnaAktivnost: 9, TK_Uporabnik: 19},
            {Komentar: 'Zelo prijeten trening.', Ocena: 4, Datum: '2025-05-29', TK_SportnaAktivnost: 10, TK_Uporabnik: 20},
        ];
        
        await knex('Ocena_Sporta').insert(Ocena_Sporta);

        console.log("Podatki so bili uspešno dodani v tabelo Ocena_Sporta.");

        console.log("Vse tabele so bile uspešno ustvarjene in napolnjene s podatki.");

    } catch (error) {
        console.log("Napaka", error);
        throw error;
    } finally {
        knex.destroy();
    }
    
} 

napolniBazo();