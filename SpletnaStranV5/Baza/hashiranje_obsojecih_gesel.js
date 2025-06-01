
const bcrypt = require('bcryptjs'); // Prepričajte se, da je ta vrstica prisotna in pravilna
const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: '', // Prilagodite geslo
        database: 'sportaj_si',
    }
});

const saltKodiranje = 12;

async function hashiranjeObstojecihGesel() {
    console.log("Hashiranje obsojecih gesel...");
    let posodobljeniUporabniki = 0;
    let preskoceniUporabniki = 0;

    try {
        const uporabniki = await knex('Uporabniki').select('id','email', 'geslo');

        if (uporabniki.length === 0) {
            console.log("Noben uporabnik ni bil najden.");
            return;
        }

        for (const uporabnik of uporabniki){ // 'uporabnik' je trenutni objekt v zanki
            if (uporabnik.geslo &&
                !uporabnik.geslo.startsWith('$2a$') &&
                !uporabnik.geslo.startsWith('$2b$') &&
                !uporabnik.geslo.startsWith('$2y$')){

                console.log(`Hashiranje gesla za uporabnika: ${uporabnik.email} (ID: ${uporabnik.id})...`);
                // POPRAVEK: bcrypt namesto bycrypt
                const hashiranoGeslo = bcrypt.hashSync(uporabnik.geslo, saltKodiranje);

                // POPRAVEK: Ime tabele 'Uporabniki' in pogoj where z 'uporabnik.id'
                await knex('Uporabniki')
                    .where({id: uporabnik.id}) // POPRAVEK: uporabnik.id (ednina)
                    .update({geslo: hashiranoGeslo});

                console.log(`Geslo za ${uporabnik.email} (ID: ${uporabnik.id}) je bilo uspešno hashirano.`);
                posodobljeniUporabniki++;

            }else{
                if (uporabnik.geslo){
                    console.log(`Geslo za ${uporabnik.email} (ID: ${uporabnik.id}) je že hashirano.`);
                }else{
                    console.log(`Uporabnik ${uporabnik.email} (ID: ${uporabnik.id}) nima gesla.`);
                }
                preskoceniUporabniki++;
            }
        }
        console.log(`\n--- Zaključeno ---`);
        console.log(`Število uspešno Posodobljenih gesl: ${posodobljeniUporabniki}`);
        console.log(`Preskocena gesla: ${preskoceniUporabniki}`);

    }catch (error){
        console.error('Napaka pri posodabljanju gesel:', error);
    }finally {
        if (knex && knex.destroy) {
            await knex.destroy();
            console.log('Povezava z bazo podatkov zaprta.');
        }
    }
}

module.exports = { hashiranjeObstojecihGesel };

if (require.main === module) {
    console.log("Samostojen zagon skrpite hashiranje_obstojecih_gesel.js");
    hashiranjeObstojecihGesel().catch(err =>{
        console.error('Napaka pri samostojnem zagonu hashiranja:', err);
    });
}