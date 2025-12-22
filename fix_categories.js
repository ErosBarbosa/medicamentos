const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'data/medicamentos.json');

// Mapeamento de palavras-chave para categorias farmacológicas
const categoryMap = [
    { key: ['ÁCIDO ACETILSALICÍLICO', 'DIPIRONA', 'PARACETAMOL'], cat: 'Analgésico e Antitérmico' },
    { key: ['ÁCIDO FÓLICO', 'SULFATO FERROSO', 'CARBONATO DE CÁLCIO'], cat: 'Suplemento / Vitamina' },
    { key: ['ÁCIDO VALPRÓICO', 'FENITOÍNA', 'FENOBARBITAL', 'CARBAMAZEPINA'], cat: 'Anticonvulsivante' },
    { key: ['ALBENDAZOL', 'MEBENDAZOL', 'SECNIDAZOL'], cat: 'Anti-helmíntico' },
    { key: ['AMOXICILINA', 'AMPICILINA', 'AZITROMICINA', 'BENZILPENICILINA', 'CEFALEXINA', 'CIPROFLOXACINO', 'METRONIDAZOL', 'SULFAMETOXAZOL', 'NEOMICINA', 'GENTAMICINA'], cat: 'Antibiótico / Antimicrobiano' },
    { key: ['ANLODIPINO', 'ATENOLOL', 'CAPTOPRIL', 'ENALAPRIL', 'HIDROCLOROTIAZIDA', 'LOSARTANA', 'METILDOPA', 'PROPRANOLOL', 'ESPIRONOLACTONA', 'FUROSEMIDA'], cat: 'Anti-hipertensivo / Diurético' },
    { key: ['ALPRAZOLAM', 'BROMAZEPAM', 'CLONAZEPAM', 'DIAZEPAM', 'LORAZEPAM'], cat: 'Ansiolítico / Benzodiazepínico' },
    { key: ['AMITRIPTILINA', 'ESCITALOPRAM', 'FLUOXETINA', 'SERTRALINA'], cat: 'Antidepressivo' },
    { key: ['AMBROXOL', 'LORATADINA', 'PROMETAZINA'], cat: 'Antialérgico / Expectorante' },
    { key: ['ATORVASTATINA', 'SINVASTATINA'], cat: 'Hipolipemiante' },
    { key: ['CETOCONAZOL', 'FLUCONAZOL', 'MICONAZOL', 'NISTATINA'], cat: 'Antifúngico' },
    { key: ['DEXAMETASONA', 'PREDNISOLONA', 'PREDNISONA', 'HIDROCORTISONA'], cat: 'Corticosteroide' },
    { key: ['GLIBENCLAMIDA', 'METFORMINA', 'INSULINA', 'GLICLAZIDA'], cat: 'Antidiabético' },
    { key: ['IBUPROFENO', 'DICLOFENACO', 'NIMESULIDA'], cat: 'Anti-inflamatório' },
    { key: ['LEVONORGESTREL', 'MEDROXIPROGESTERONA', 'NORETISTERONA', 'ESTRADIOL'], cat: 'Hormonal / Contraceptivo' },
    { key: ['OMEPRAZOL', 'HIDRÓXIDO DE ALUMÍNIO', 'RANITIDINA'], cat: 'Antiácido / Protetor Gástrico' },
    { key: ['METOCLOPRAMIDA', 'ONDANSETRONA', 'DIMENIDRATO'], cat: 'Antiemético' },
    { key: ['SALBUTAMOL', 'IPRATRÓPIO'], cat: 'Broncodilatador' },
    { key: ['TIMOLOL', 'BRIMONIDINA'], cat: 'Oftalmológico' },
    { key: ['AGULHA', 'SERINGA', 'ESCALPE', 'EQUIPO', 'CATETER', 'SONDA', 'LUVAS', 'MÁSCARA', 'AVENTAL', 'TOUCA', 'ATADURA', 'ESPARADRAPO', 'COMPRESSA', 'GAZE', 'ALGODÃO', 'LANCETA', 'TIRA REAGENTE', 'COLETOR'], cat: 'Material Médico / Hospitalar' },
    { key: ['ÁLCOOL', 'CLOREXIDINA', 'IODOPOVIDONA', 'ÁGUA DESTILADA', 'CLORETO DE SÓDIO', 'GLICOSE', 'SOLUÇÃO', 'GEL CONDUTOR'], cat: 'Soluções / Antissépticos' }
];

try {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    let updatedCount = 0;

    data.forEach(item => {
        const nameUpper = item.nome.toUpperCase();

        // Find matching category
        const match = categoryMap.find(mapping =>
            mapping.key.some(keyword => nameUpper.includes(keyword))
        );

        if (match) {
            item.categoria = match.cat;
            updatedCount++;
        } else {
            // Keep generic or mark for review?
            // If it contains "BR" code it's likely a Medicine or Material.
            // Let's rely on the map for now.
        }
    });

    // Sort again
    data.sort((a, b) => a.nome.localeCompare(b.nome));

    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Updated categories for ${updatedCount} items.`);

} catch (err) {
    console.error('Error:', err);
}
