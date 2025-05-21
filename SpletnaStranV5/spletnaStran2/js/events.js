const events = [
    {
        id:1,
        name:"Street Basket Turnir",
        location: "Evropark, Maribor",
        date: "24/06/2025",
        price: "free",
        time: "16.00",
        slika: "../slike/basket.png"
    },
    {
    id: 2,
    name: "Jutranji Tek ",
    location: "Tivoli Park, Ljubljana",
    date: "15/07/2025",
    price: "free",
    time: "08.00",
    slika: "../slike/running.png"
    },
    {
    id: 3,
    name: "Tenis Open ",
    location: "Športni park Koper",
    date: "02/08/2025",
    price: "10 EUR",
    time: "10.00",
    slika: "../slike/tenis.png"
    },
    {
    id: 4,
    name: "Odbojkarski turnir za otroke",
    location: "Športna dvorana Maribor",
    date: "12/09/2025",
    price: "free",
    time: "09.30",
    slika: "../slike/volleyball.png"
    },
    {
    id: 5,
    name: "Košarkarski kamp ",
    location: "Športni center Celje",
    date: "05/10/2025",
    price: "25 EUR",
    time: "14.00",
    slika: "../slike/basket.png"
    },
    {
    id: 6,
    name: "Nočni Tek ",
    location: "Mestni trg, Ptuj",
    date: "20/07/2025",
    price: "3 EUR",
    time: "21.00",
    slika: "../slike/running.png"
},
{
    id: 7,
    name: "Maraton ",
    location: "Center mesta, Ljubljana",
    date: "18/09/2025",
    price: "15 EUR",
    time: "09.00",
    slika: "../slike/running.png"
},
{
    id: 8,
    name: "Plavalni tečaj ",
    location: "Zunanje kopališče Maribor",
    date: "01/06/2025",
    price: "20 EUR",
    time: "10.00",
    slika: "../slike/swimming.png"
},
{
    id: 9,
    name: "Nogometni turnir mladincev",
    location: "Športni park Kranj",
    date: "11/08/2025",
    price: "free",
    time: "13.00",
    slika: "../slike/football.png"
},
{
    id: 10,
    name: "Trening boksanja ",
    location: "Boksarski klub Ljubljana",
    date: "25/05/2025",
    price: "10 EUR",
    time: "18.00",
    slika: "../slike/boxing.png"
},
{
    id: 11,
    name: "Kolesarski vzpon na Pohorje",
    location: "Maribor - Pohorje",
    date: "10/07/2025",
    price: "5 EUR",
    time: "07.30",
    slika: "../slike/cycling.png"
},
{
    id: 12,
    name: "Joga v parku",
    location: "Park Tivoli, Ljubljana",
    date: "03/06/2025",
    price: "free",
    time: "08.00",
    slika: "../slike/yoga.png"
},
{
    id: 13,
    name: "Tek za zdravje ",
    location: "Ljudski vrt, Maribor",
    date: "28/07/2025",
    price: "free",
    time: "17.00",
    slika: "../slike/running.svg"
},
{
    id: 14,
    name: "Tenis turnir za začetnike",
    location: "Tenis klub Ptuj",
    date: "22/08/2025",
    price: "8 EUR",
    time: "15.00",
    slika: "../slike/tenis.png"
},
{
    id: 15,
    name: "Kamp odbojke na mivki",
    location: "Plaža Portorož",
    date: "05/09/2025",
    price: "30 EUR",
    time: "10.00",
    slika: "../slike/volleyball.png"
},
{
    id: 16,
    name: "Otroški plavalni turnir",
    location: "Notranji bazen Ljubljana",
    date: "30/06/2025",
    price: "free",
    time: "12.00",
    slika: "../slike/swimming.png"
},
{
    id: 17,
    name: "Pohodniški izlet",
    location: "Kamniške Alpe",
    date: "14/08/2025",
    price: "free",
    time: "09.00",
    slika: "../slike/walking.png"
},
{
    id: 18,
    name: "Nordijska hoja",
    location: "Pohorska cesta, Maribor",
    date: "19/06/2025",
    price: "5 EUR",
    time: "10.30",
    slika: "../slike/walking.png"
},
{
    id: 19,
    name: "Basket turnir za odrasle",
    location: "Osnovna šola Ljubljana",
    date: "12/07/2025",
    price: "free",
    time: "08.00",
    slika: "../slike/basket.png"
},
{
    id: 20,
    name: "Kolesarski maraton Kranj",
    location: "Športni park Kranj",
    date: "29/09/2025",
    price: "20 EUR",
    time: "07.00",
    slika: "../slike/cycling.png"
},
{
    id: 21,
    name: "Tenis trening za otroke",
    location: "Tenis klub Maribor",
    date: "17/06/2025",
    price: "12 EUR",
    time: "16.00",
    slika: "../slike/tenis.png"
},
{
    id: 22,
    name: "Košarkarski trening za mlade",
    location: "Športna dvorana Celje",
    date: "21/07/2025",
    price: "free",
    time: "18.30",
    slika: "../slike/basket.png"
},
{
    id: 23,
    name: "Tek ob Dravi",
    location: "Spodnja dravska cesta, Maribor",
    date: "27/08/2025",
    price: "5 EUR",
    time: "19.00",
    slika: "../slike/running.svg"
},
{
    id: 24,
    name: "Otroški košarkarski turnir",
    location: "Športni park Ljubljana",
    date: "10/10/2025",
    price: "free",
    time: "10.00",
    slika: "../slike/basket.png"
},
{
    id: 25,
    name: "Fitnes na prostem",
    location: "Park Tabor, Maribor",
    date: "05/07/2025",
    price: "free",
    time: "07.00",
    slika: "../slike/fitnes.png"
},
{
    id: 26,
    name: "Odbojkarski trening za začetnike",
    location: "Športna dvorana Ptuj",
    date: "13/06/2025",
    price: "8 EUR",
    time: "17.00",
    slika: "../slike/volleyball.png"
},
{
    id: 27,
    name: "Tek za dobrodelnost",
    location: "Mestni park Ljubljana",
    date: "08/09/2025",
    price: "10 EUR",
    time: "09.00",
    slika: "../slike/running.png"
},
{
    id: 28,
    name: "Plavalni trening za odrasle",
    location: "Zunanje kopališče Koper",
    date: "15/07/2025",
    price: "15 EUR",
    time: "18.00",
    slika: "../slike/swimming.png"
},
{
    id: 29,
    name: "PingPong turnir športnikov",
    location: "Športni klub Maribor",
    date: "24/08/2025",
    price: "free",
    time: "14.00",
    slika: "../slike/pingpong.png"
},
{
    id: 30,
    name: "Nogometni trening za otroke",
    location: "Športni park Ljubljana",
    date: "02/10/2025",
    price: "free",
    time: "16.00",
    slika: "../slike/football.png"
},
{
    id: 31,
    name: "Jutranja joga ",
    location: "Ljudski vrt, Maribor",
    date: "10/06/2025",
    price: "free",
    time: "07.30",
    slika: "../slike/yoga.png"
},
{
    id: 32,
    name: "Košarkarski turnir za amaterje",
    location: "Športni center Celje",
    date: "20/08/2025",
    price: "free",
    time: "17.00",
    slika: "../slike/basket.png"
},
{
    id: 33,
    name: "Otroški nogometni turnir",
    location: "Mestni stadion Koper",
    date: "18/07/2025",
    price: "free",
    time: "11.00",
    slika: "../slike/football.png"
},
{
    id: 34,
    name: "Plavalni maraton ",
    location: "Notranji bazen Ljubljana",
    date: "28/09/2025",
    price: "20 EUR",
    time: "08.00",
    slika: "../slike/swimming.png"
},
{
    id: 35,
    name: "Tekmovalni teniški turnir",
    location: "Tenis klub Maribor",
    date: "04/10/2025",
    price: "30 EUR",
    time: "13.00",
    slika: "../slike/tenis.png"
}
]

sessionStorage.setItem("events", JSON.stringify(events));