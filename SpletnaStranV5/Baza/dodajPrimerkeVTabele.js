const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: 'Smetar245',
        database: 'sportaj_si',
        timezone: 'UTC'
    }
});
const fs = require('fs')
const path = require('path')
const { hashiranjeObstojecihGesel } = require('./hashiranje_obsojecih_gesel.js');

async function posodobiBazo(){
    console.log('Začenja se dodajanje primerkov v tabele')
    try{
        console.log('Dodajanje 30 novih uporabnikov')
        await knex('uporabniki').insert([
            {username: 'MarkoKrevh', geslo:'geslo123', email:'MarkoKrevh@gmail.com', JeAdmin: 0},
            {username: 'LukaNovak', geslo:'geslo123', email:'LukaNovak@gmail.com', JeAdmin: 0},
            {username: 'AnaKovac', geslo:'geslo123', email:'AnaKovac@gmail.com', JeAdmin: 0},
            {username: 'NinaZupan', geslo:'geslo123', email:'NinaZupan@gmail.com', JeAdmin: 0},
            {username: 'MarkoPotocnik', geslo:'geslo123', email:'MarkoPotocnik@gmail.com', JeAdmin: 0},
            {username: 'SaraHribar', geslo:'geslo123', email:'SaraHribar@gmail.com', JeAdmin: 0},
            {username: 'MatejKrevs', geslo:'geslo123', email:'MatejKrevs@gmail.com', JeAdmin: 0},
            {username: 'KajaKranjc', geslo:'geslo123', email:'KajaKranjc@gmail.com', JeAdmin: 0},
            {username: 'ZigaLogar', geslo:'geslo123', email:'ZigaLogar@gmail.com', JeAdmin: 0},
            {username: 'TinaPetek', geslo:'geslo123', email:'TinaPetek@gmail.com', JeAdmin: 0},
            {username: 'JureBerk', geslo:'geslo123', email:'JureBerk@gmail.com', JeAdmin: 0},
            {username: 'LeaVidmar', geslo:'geslo123', email:'LeaVidmar@gmail.com', JeAdmin: 0},
            {username: 'RokOblak', geslo:'geslo123', email:'RokOblak@gmail.com', JeAdmin: 0},
            {username: 'MajaSever', geslo:'geslo123', email:'MajaSever@gmail.com', JeAdmin: 0},
            {username: 'NejcDolenc', geslo:'geslo123', email:'NejcDolenc@gmail.com', JeAdmin: 0},
            {username: 'JanaRemic', geslo:'geslo123', email:'JanaRemic@gmail.com', JeAdmin: 0},
            {username: 'SimonErjavec', geslo:'geslo123', email:'SimonErjavec@gmail.com', JeAdmin: 0},
            {username: 'EvaMlakar', geslo:'geslo123', email:'EvaMlakar@gmail.com', JeAdmin: 0},
            {username: 'MarkoKralj', geslo:'geslo123', email:'MarkoKralj@gmail.com', JeAdmin: 0},
            {username: 'TjasaZorko', geslo:'geslo123', email:'TjasaZorko@gmail.com', JeAdmin: 0},
            {username: 'MihaZnidarscic', geslo:'geslo123', email:'MihaZnidarscic@gmail.com', JeAdmin: 0},
            {username: 'PetraTurk', geslo:'geslo123', email:'PetraTurk@gmail.com', JeAdmin: 0},
            {username: 'MarkoKne', geslo:'geslo123', email:'MarkoKne@gmail.com', JeAdmin: 0},
            {username: 'AljaRebernik', geslo:'geslo123', email:'AljaRebernik@gmail.com', JeAdmin: 0},
            {username: 'MarkoRupnik', geslo:'geslo123', email:'MarkoRupnik@gmail.com', JeAdmin: 0},
            {username: 'NikaPerko', geslo:'geslo123', email:'NikaPerko@gmail.com', JeAdmin: 0},
            {username: 'AlenFurlan', geslo:'geslo123', email:'AlenFurlan@gmail.com', JeAdmin: 0},
            {username: 'LauraKosir', geslo:'geslo123', email:'LauraKosir@gmail.com', JeAdmin: 0},
            {username: 'IgorKos', geslo:'geslo123', email:'IgorKos@gmail.com', JeAdmin: 0},
            {username: 'ZalaBenko', geslo:'geslo123', email:'ZalaBenko@gmail.com', JeAdmin: 0},
            {username: 'UrosMajer', geslo:'geslo123', email:'UrosMajer@gmail.com', JeAdmin: 0}
        ]).then(()=>{
            console.log('Uspešno dodanih 30 novih uporabnikov')
        })

        console.log('Dodajanje 30 novih trenerjev')
        await knex('trenerji').insert([
            {TK_Uporabnik:11,spol:'m',ime: 'Marko', priimek: 'Krevh',telefon: 170283948, email:'markokrevh@trener.si', urnik: 'Pon: 16:00-18:00, Sre: 17:00-19:00, Pet: 16:00-18:00',OpisProfila: 'Izkušen nogometni strateg.'},
            {TK_Uporabnik:12,spol:'m',ime: 'Luka', priimek: 'Novak', telefon: 698457223, email:'lukanovak78@trener.si', urnik: 'Pon: 14:00-16:00, Sre: 16:00-18:00', OpisProfila: 'Trener z dolgoletnimi izkušnjami v odbojki.'},
            {TK_Uporabnik:13,spol:'f',ime: 'Ana', priimek: 'Kovač', telefon: 927435180, email:'anakovac53@trener.si', urnik: 'Tor: 17:00-19:00, Čet: 17:00-19:00, Sob: 10:00-12:00', OpisProfila: 'Trener z mednarodno licenco.'},
            {TK_Uporabnik:14,spol:'f',ime: 'Nina', priimek: 'Zupan', telefon: 362842790, email:'ninazupan12@trener.si', urnik: 'Tor: 15:00-17:00, Čet: 18:00-20:00', OpisProfila: 'Tenis trener s fokusom na tehniki.'},
            {TK_Uporabnik:15,spol:'m',ime: 'Marko', priimek: 'Potočnik', telefon: 419826589, email:'markopotocnik63@trener.si', urnik: 'Pon: 18:00-20:00, Sre: 18:00-20:00', OpisProfila: 'Mlad in motiviran fitnes trener.'},
            {TK_Uporabnik:16,spol:'f',ime: 'Sara', priimek: 'Hribar', telefon: 286492041, email:'sarahribar55@trener.si', urnik: 'Pon: 14:00-16:00, Sre: 16:00-18:00', OpisProfila: 'Strokovnjak za ekipni duh in disciplino.'},
            {TK_Uporabnik:17,spol:'m',ime: 'Matej', priimek: 'Krevs', telefon: 963785104, email:'matejkrevs84@trener.si', urnik: 'Tor: 15:00-17:00, Čet: 18:00-20:00', OpisProfila: 'Trener z dolgoletnimi izkušnjami v odbojki.'},
            {TK_Uporabnik:18,spol:'f',ime: 'Kaja', priimek: 'Kranjc', telefon: 325790846, email:'kajakranjc42@outlook.com', urnik: 'Pon: 18:00-20:00, Sre: 18:00-20:00', OpisProfila: 'Izkušen nogometni strateg.'},
            {TK_Uporabnik:19,spol:'m',ime: 'Žiga', priimek: 'Logar', telefon: 523804710, email:'zigalogar90@yahoo.com', urnik: 'Tor: 15:00-17:00, Čet: 18:00-20:00', OpisProfila: 'Strasten učitelj košarke.'},
            {TK_Uporabnik:20,spol:'f',ime: 'Tina', priimek: 'Petek', telefon: 739528163, email:'tinapetek76@gmail.com', urnik: 'Pon: 14:00-16:00, Sre: 16:00-18:00', OpisProfila: 'Zagnan boksarski mentor.'},
            {TK_Uporabnik:21,spol:'m',ime: 'Jure', priimek: 'Berk', telefon: 170536847, email:'jureberk98@gmail.com', urnik: 'Pon: 14:00-16:00, Sre: 16:00-18:00', OpisProfila: 'Specialist za fizično pripravo.'},
            {TK_Uporabnik:22,spol:'f',ime: 'Lea', priimek: 'Vidmar', telefon: 319478205, email:'leavidmar33@gmail.com', urnik: 'Tor: 17:00-19:00, Čet: 17:00-19:00', OpisProfila: 'Trenerka z energijo in znanjem za vse starosti.'},
            {TK_Uporabnik:23,spol:'m',ime: 'Rok', priimek: 'Oblak', telefon: 578320416, email:'rokoblak21@siol.net', urnik: 'Pon: 16:00-18:00, Pet: 18:00-20:00', OpisProfila: 'Nogometni trener z izkušnjami iz tujine.'},
            {TK_Uporabnik:24,spol:'f',ime: 'Maja', priimek: 'Sever', telefon: 860214379, email:'majasever62@gmail.com', urnik: 'Tor: 14:00-16:00, Sre: 17:00-19:00', OpisProfila: 'Strokovnjakinja za vadbo otrok.'},
            {TK_Uporabnik:25,spol:'m',ime: 'Nejc', priimek: 'Dolenc', telefon: 204967583, email:'nejcdolenc12@outlook.com', urnik: 'Sre: 15:00-17:00, Sob: 10:00-12:00', OpisProfila: 'Vedno nasmejan in potrpežljiv košarkarski trener.'},
            {TK_Uporabnik:26,spol:'f',ime: 'Jana', priimek: 'Remic', telefon: 671394820, email:'janaremic55@yahoo.com', urnik: 'Tor: 17:00-19:00, Čet: 17:00-19:00', OpisProfila: 'Fitnes trenerka s poudarkom na rehabilitaciji.'},
            {TK_Uporabnik:27,spol:'m',ime: 'Simon', priimek: 'Erjavec', telefon: 785302196, email:'simonerjavec99@gmail.com', urnik: 'Pon: 18:00-20:00, Sre: 18:00-20:00', OpisProfila: 'Motivator in mentor mladih športnikov.'},
            {TK_Uporabnik:28,spol:'f',ime: 'Eva', priimek: 'Mlakar', telefon: 943120578, email:'evamlakar88@gmail.com', urnik: 'Tor: 14:00-16:00, Pet: 15:00-17:00', OpisProfila: 'Specialistka za gibanje in kondicijo.'},
            {TK_Uporabnik:29,spol:'m',ime: 'Marko', priimek: 'Kralj', telefon: 390458126, email:'markokralj12@gmail.com', urnik: 'Tor: 18:00-20:00, Čet: 18:00-20:00', OpisProfila: 'Nogometni entuziast in strokovnjak za taktike.'},
            {TK_Uporabnik:30,spol:'f',ime: 'Tjaša', priimek: 'Zorko', telefon: 642397158, email:'tjasazorko67@gmail.com', urnik: 'Pon: 16:00-18:00, Sre: 17:00-19:00', OpisProfila: 'Plesna trenerka s srcem za gibanje.'},
            {TK_Uporabnik:31,spol:'m',ime: 'Miha', priimek: 'Žnidaršič', telefon: 132408796, email:'mihaznidar@gmail.com', urnik: 'Pon: 14:00-16:00, Sre: 18:00-20:00', OpisProfila: 'Vedno na voljo za individualni pristop.'},
            {TK_Uporabnik:32,spol:'f',ime: 'Petra', priimek: 'Turk', telefon: 812309456, email:'petraturk55@gmail.com', urnik: 'Tor: 15:00-17:00, Pet: 16:00-18:00', OpisProfila: 'Tenis trenerka z občutkom za napredek.'},
            {TK_Uporabnik:33,spol:'m',ime: 'Marko', priimek: 'Kne', telefon: 904812356, email:'markokne77@siol.net', urnik: 'Sre: 17:00-19:00, Sob: 10:00-12:00', OpisProfila: 'Fizioterapevt in osebni trener.' },
            {TK_Uporabnik:34,spol:'f',ime: 'Alja', priimek: 'Rebernik', telefon: 534982610, email:'aljarebernik33@yahoo.com', urnik: 'Pon: 15:00-17:00, Sre: 16:00-18:00', OpisProfila: 'Strokovnjakinja za vadbo žensk.' },
            {TK_Uporabnik:35,spol:'m',ime: 'Marko', priimek: 'Rupnik', telefon: 421395706, email:'markorupnik@gmail.com', urnik: 'Čet: 17:00-19:00, Sob: 9:00-11:00', OpisProfila: 'Zagrizen športni navdušenec in mentor.'},
            {TK_Uporabnik:36,spol:'f',ime: 'Nika', priimek: 'Perko', telefon: 739541280, email:'nikaperko@gmail.com', urnik: 'Tor: 16:00-18:00, Čet: 16:00-18:00', OpisProfila: 'Trenerka joge in sprostitve.'},
            {TK_Uporabnik:37,spol:'m',ime: 'Alen', priimek: 'Furlan', telefon: 873104592, email:'alenfurlan44@gmail.com', urnik: 'Sre: 17:00-19:00, Pet: 15:00-17:00', OpisProfila: 'Individualni trener z licenco UEFA B.'},
            {TK_Uporabnik:38,spol:'f',ime: 'Laura', priimek: 'Košir', telefon: 248163790, email:'laurakosir84@gmail.com', urnik: 'Pon: 15:00-17:00, Sre: 17:00-19:00', OpisProfila: 'Navdihujoča mentorica z empatijo.'},
            {TK_Uporabnik:39,spol:'m',ime: 'Igor', priimek: 'Kos', telefon: 982745610, email:'igorkos22@gmail.com', urnik: 'Tor: 18:00-20:00, Čet: 18:00-20:00', OpisProfila: 'Strokovnjak za nogometno taktiko.'},
            {TK_Uporabnik:40,spol:'f',ime: 'Zala', priimek: 'Benko', telefon: 312498175, email:'zalabenko76@gmail.com', urnik: 'Pon: 16:00-18:00, Pet: 16:00-18:00', OpisProfila: 'Pilates trenerka z osebnim pristopom.'},
            {TK_Uporabnik:41,spol:'m',ime: 'Uroš', priimek: 'Majer', telefon: 763581029, email:'urosmajer65@gmail.com', urnik: 'Sre: 16:00-18:00, Sob: 10:00-12:00', OpisProfila: 'Košarkarski strateg in motivator.'}
        ]).then(()=>{
            console.log("Uspešno dodanih 30 novih trenerjev")
        })


        const Sportna_Aktivnost =[
            {Naziv: 'Košarkarski turnir', Opis:'Turnir med srednjimi šolami', Lokacija: 'Branik', Cena: 0, ProstaMesta: 80, slika: '/slike/sporti/kostekma.jfif', Datum_Cas_Izvedbe: '2025-06-15 17:00:00', TK_TipAktivnosti:2, TK_Trener:6},
            {Naziv: 'Nogometni trening A', Opis: 'Trening za začetnike z osnovnimi tehnikami.', Lokacija: 'Ljubljana', Cena: 10, ProstaMesta: 20, slika: '/slike/sporti/nogtekma.jfif', Datum_Cas_Izvedbe: '2025-06-15 17:00:00', TK_TipAktivnosti: 1, TK_Trener: 7},
            {Naziv: 'Košarkarski turnir B', Opis: 'Turnir za srednješolce, finalni dvoboji.', Lokacija: 'Maribor', Cena: 0, ProstaMesta: 80, slika: './slike/sporti/kostekma.jfif', Datum_Cas_Izvedbe: '2025-06-15 17:00:00', TK_TipAktivnosti: 2, TK_Trener: 8},
            {Naziv: 'Atletska delavnica C', Opis: 'Delavnica teka in skokov.', Lokacija: 'Celje', Cena: 5, ProstaMesta: 30, slika: '/slike/sporti/atlettrening.jfif', Datum_Cas_Izvedbe: '2025-07-13 17:00:00', TK_TipAktivnosti: 3, TK_Trener: 9},
            {Naziv: 'Plavalni izziv D', Opis: 'Preizkusi svoje plavalne sposobnosti!', Lokacija: 'Koper', Cena: 8, ProstaMesta: 25, slika: '/slike/sporti/plavaltrening.jfif', Datum_Cas_Izvedbe: '2025-06-19 17:00:00', TK_TipAktivnosti: 4, TK_Trener: 10},
            {Naziv: 'Tenis dvoboj E', Opis: 'Dvoboji za amaterske igralce.', Lokacija: 'Ptuj', Cena: 12, ProstaMesta: 16, slika: '/slike/sporti/tenis.jfif', Datum_Cas_Izvedbe: '2025-08-11 17:00:00', TK_TipAktivnosti: 5, TK_Trener: 11},
            {Naziv: 'Odbojkarska liga F', Opis: 'Liga mešanih ekip.', Lokacija: 'Nova Gorica', Cena: 6, ProstaMesta: 40, slika: '/slike/sporti/odbojka.jfif', Datum_Cas_Izvedbe: '2025-07-07 17:00:00', TK_TipAktivnosti: 6, TK_Trener: 12},
            {Naziv: 'Rokometna tekma G', Opis: 'Prijateljska tekma med klubi.', Lokacija: 'Novo mesto', Cena: 0, ProstaMesta: 50, slika: '/slike/sporti/rokomet.jfif', Datum_Cas_Izvedbe: '2025-06-09 17:00:00', TK_TipAktivnosti: 7, TK_Trener: 13},
            {Naziv: 'Kolesarski vzpon H', Opis: 'Vzpon na Pohorje s časovnim merjenjem.', Lokacija: 'Maribor', Cena: 15, ProstaMesta: 35, slika: '/slike/sporti/kolo.jfif', Datum_Cas_Izvedbe: '2025-06-24 17:00:00', TK_TipAktivnosti: 8, TK_Trener: 14},
            {Naziv: 'Boksarska šola I', Opis: 'Tehnični trening za začetnike.', Lokacija: 'Kranj', Cena: 20, ProstaMesta: 10, slika: '/slike/sporti/boks.jfif', Datum_Cas_Izvedbe: '2025-06-28 17:00:00', TK_TipAktivnosti: 9, TK_Trener: 15},
            {Naziv: 'Golf dan J', Opis: 'Turnir za začetnike z mentorji.', Lokacija: 'Bled', Cena: 25, ProstaMesta: 15, slika: '/slike/sporti/golf.jfif', Datum_Cas_Izvedbe: '2025-07-16 17:00:00', TK_TipAktivnosti: 10, TK_Trener: 16},

            {Naziv: 'Nogometna liga K', Opis: 'Amaterska rekreativna liga.', Lokacija: 'Ljubljana', Cena: 10, ProstaMesta: 22, slika: '/slike/sporti/nogtekma.jfif', Datum_Cas_Izvedbe: '2025-08-12 17:00:00', TK_TipAktivnosti: 1, TK_Trener: 17},
            {Naziv: 'Košarkarska šola L', Opis: 'Šola za otroke od 10 do 14 let.', Lokacija: 'Koper', Cena: 5, ProstaMesta: 18, slika: '/slike/sporti/kostekma.jfif', Datum_Cas_Izvedbe: '2025-06-13 17:00:00', TK_TipAktivnosti: 2, TK_Trener: 18},
            {Naziv: 'Atletski miting M', Opis: 'Regijsko atletsko tekmovanje.', Lokacija: 'Celje', Cena: 0, ProstaMesta: 60, slika: '/slike/sporti/atlettrening.jfif', Datum_Cas_Izvedbe: '2025-06-15 17:00:00', TK_TipAktivnosti: 3, TK_Trener: 19},
            {Naziv: 'Plavalni kamp N', Opis: 'Teden učenja plavanja.', Lokacija: 'Nova Gorica', Cena: 18, ProstaMesta: 20, slika: '/slike/sporti/plavaltrening.jfif', Datum_Cas_Izvedbe: '2025-06-15 17:00:00', TK_TipAktivnosti: 4, TK_Trener: 20},
            {Naziv: 'Tenis šola O', Opis: 'Poletna šola tenisa za mladino.', Lokacija: 'Ljubljana', Cena: 13, ProstaMesta: 12, slika: '/slike/sporti/tenis.jfif',  Datum_Cas_Izvedbe: '2025-06-15 17:00:00',TK_TipAktivnosti: 5, TK_Trener: 21},
            {Naziv: 'Odbojka na mivki P', Opis: 'Turnir dvojic na prostem.', Lokacija: 'Portorož', Cena: 7, ProstaMesta: 28, slika: '/slike/sporti/odbojka.jfif', Datum_Cas_Izvedbe: '2025-08-19 17:00:00', TK_TipAktivnosti: 6, TK_Trener: 22},
            {Naziv: 'Rokometna šola Q', Opis: 'Osnovne veščine rokometa.', Lokacija: 'Trbovlje', Cena: 9, ProstaMesta: 30, slika: '/slike/sporti/rokomet.jfif', Datum_Cas_Izvedbe: '2025-09-17 17:00:00', TK_TipAktivnosti: 7, TK_Trener: 23},
            {Naziv: 'Gorsko kolesarstvo R', Opis: 'Pustolovska tura z vodičem.', Lokacija: 'Kamnik', Cena: 20, ProstaMesta: 12, slika: '/slike/sporti/kolo.jfif', Datum_Cas_Izvedbe: '2025-09-15 17:00:00', TK_TipAktivnosti: 8, TK_Trener: 24},
            {Naziv: 'Boks za mladostnike S', Opis: 'Trening kondicije in tehnike.', Lokacija: 'Ptuj', Cena: 17, ProstaMesta: 14, slika: '/slike/sporti/boks.jfif', Datum_Cas_Izvedbe: '2025-07-26 17:00:00', TK_TipAktivnosti: 9, TK_Trener: 25},
            {Naziv: 'Golf turnir T', Opis: 'Turnir v parih.', Lokacija: 'Bovec', Cena: 30, ProstaMesta: 10, slika: '/slike/sporti/golf.jfif', Datum_Cas_Izvedbe: '2025-06-27 17:00:00', TK_TipAktivnosti: 10, TK_Trener: 26},

            {Naziv: 'Nogomet za dekleta U', Opis: 'Nogometna skupina za deklice.', Lokacija: 'Murska Sobota', Cena: 5, ProstaMesta: 20, slika: '/slike/sporti/nogtekma.jfif', Datum_Cas_Izvedbe: '2025-07-27 17:00:00', TK_TipAktivnosti: 1, TK_Trener: 27},
            {Naziv: 'Košarkarski kamp V', Opis: 'Poletni kamp za srednješolce.', Lokacija: 'Škofja Loka', Cena: 10, ProstaMesta: 24, slika: '/slike/sporti/kostekma.jfif', Datum_Cas_Izvedbe: '2025-08-19 17:00:00', TK_TipAktivnosti: 2, TK_Trener: 28},
            {Naziv: 'Atletski trening W', Opis: 'Trening za šprint in met.', Lokacija: 'Vrhnika', Cena: 6, ProstaMesta: 18, slika: '/slike/sporti/atlettrening.jfif', Datum_Cas_Izvedbe: '2025-08-24 17:00:00', TK_TipAktivnosti: 3, TK_Trener: 29},
            {Naziv: 'Plavalni miting X', Opis: 'Tekmovanje za kadete.', Lokacija: 'Ajdovščina', Cena: 0, ProstaMesta: 50, slika: '/slike/sporti/plavaltrening.jfif', Datum_Cas_Izvedbe: '2025-09-03 17:00:00', TK_TipAktivnosti: 4, TK_Trener: 30},
            {Naziv: 'Tenis za odrasle Y', Opis: 'Rekreativni večerni termini.', Lokacija: 'Ilirska Bistrica', Cena: 14, ProstaMesta: 8, slika: '/slike/sporti/tenis.jfif', Datum_Cas_Izvedbe: '2025-09-02 17:00:00', TK_TipAktivnosti: 5, TK_Trener: 31},
            {Naziv: 'Odbojka z žogo Z', Opis: 'Osnove igre z žogo.', Lokacija: 'Sežana', Cena: 4, ProstaMesta: 30, slika: '/slike/sporti/odbojka.jfif', Datum_Cas_Izvedbe: '2025-09-15 17:00:00', TK_TipAktivnosti: 6, TK_Trener: 32},
            {Naziv: 'Rokometni dvoboj Ž', Opis: 'Prijateljska tekma.', Lokacija: 'Postojna', Cena: 3, ProstaMesta: 16, slika: '/slike/sporti/rokomet.jfif', Datum_Cas_Izvedbe: '2025-07-17 17:00:00', TK_TipAktivnosti: 7, TK_Trener: 33},
            {Naziv: 'Kolesarski maraton AA', Opis: 'Maraton skozi slovensko podeželje.', Lokacija: 'Grosuplje', Cena: 18, ProstaMesta: 40, slika: '/slike/sporti/kolo.jfif', Datum_Cas_Izvedbe: '2025-06-29 17:00:00', TK_TipAktivnosti: 8, TK_Trener: 34},
            {Naziv: 'Boksarska borba AB', Opis: 'Dogodek za napredne boksarje.', Lokacija: 'Zagorje', Cena: 22, ProstaMesta: 6, slika: '/slike/sporti/boks.jfif', Datum_Cas_Izvedbe: '2025-06-18 17:00:00', TK_TipAktivnosti: 9, TK_Trener: 35},
            {Naziv: 'Golf tečaj AC', Opis: 'Intenziven vikend program.', Lokacija: 'Rogaška Slatina', Cena: 27, ProstaMesta: 9, slika: '/slike/sporti/golf.jfif', Datum_Cas_Izvedbe: '2025-06-21 17:00:00', TK_TipAktivnosti: 10, TK_Trener: 36}
        ]

        for(let act of Sportna_Aktivnost){
            const slika = act.slika;
            const imageBuffer = fs.readFileSync(path.join(__dirname,'..','www' ,slika))
            act.slika = imageBuffer

        }
        
        console.log('Dodajanje 30 novih dejavnosti')
        await hashiranjeObstojecihGesel();
        await knex('sportna_aktivnost').insert(Sportna_Aktivnost).then(()=>{
            console.log('Uspešno dodanih 30 novih dejavnosti')
        })
    }catch(error){
        console.log('Napaka pri vstavljanju podatkov:' + error)
    }finally{knex.destroy();}
    
}
posodobiBazo();

