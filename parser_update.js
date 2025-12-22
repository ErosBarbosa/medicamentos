const fs = require('fs');
const path = require('path');

const rawPath = path.join(__dirname, 'raw_update.txt');
const jsonPath = path.join(__dirname, 'data/medicamentos.json');

// Copied map from previous session to maintain category improvements
const categoryMap = [
    { key: ['ÁCIDO ACETILSALICÍLICO', 'DIPIRONA', 'PARACETAMOL'], cat: 'Analgésico e Antitérmico' },
    { key: ['ÁCIDO FÓLICO', 'SULFATO FERROSO', 'CARBONATO DE CÁLCIO', 'VITAMINA', 'POLIVITAMÍNICO'], cat: 'Suplemento / Vitamina' },
    { key: ['ÁCIDO VALPRÓICO', 'FENITOÍNA', 'FENOBARBITAL', 'CARBAMAZEPINA', 'CLONAZEPAM', 'DIAZEPAM'], cat: 'Anticonvulsivante / Controlado' },
    { key: ['ALBENDAZOL', 'MEBENDAZOL', 'SECNIDAZOL', 'METRONIDAZOL', 'IVERMECTINA'], cat: 'Anti-helmíntico / Antiparasitário' },
    { key: ['AMOXICILINA', 'AMPICILINA', 'AZITROMICINA', 'BENZILPENICILINA', 'CEFALEXINA', 'CIPROFLOXACINO', 'SULFAMETOXAZOL', 'NEOMICINA', 'GENTAMICINA'], cat: 'Antibiótico / Antimicrobiano' },
    { key: ['ANLODIPINO', 'ATENOLOL', 'CAPTOPRIL', 'ENALAPRIL', 'HIDROCLOROTIAZIDA', 'LOSARTANA', 'METILDOPA', 'PROPRANOLOL', 'ESPIRONOLACTONA', 'FUROSEMIDA'], cat: 'Anti-hipertensivo / Diurético' },
    { key: ['ALPRAZOLAM', 'BROMAZEPAM', 'LORAZEPAM', 'FLUOXETINA', 'SERTRALINA', 'AMITRIPTILINA', 'ESCITALOPRAM', 'CITALOPRAM', 'PAROXETINA'], cat: 'Saúde Mental' },
    { key: ['AMBROXOL', 'LORATADINA', 'PROMETAZINA', 'DEXCLORFENIRAMINA'], cat: 'Antialérgico / Expectorante' },
    { key: ['ATORVASTATINA', 'SINVASTATINA'], cat: 'Hipolipemiante' },
    { key: ['CETOCONAZOL', 'FLUCONAZOL', 'MICONAZOL', 'NISTATINA'], cat: 'Antifúngico' },
    { key: ['DEXAMETASONA', 'PREDNISOLONA', 'PREDNISONA', 'HIDROCORTISONA', 'BETAMETASONA'], cat: 'Corticosteroide' },
    { key: ['GLIBENCLAMIDA', 'METFORMINA', 'INSULINA', 'GLICLAZIDA'], cat: 'Antidiabético' },
    { key: ['IBUPROFENO', 'DICLOFENACO', 'NIMESULIDA', 'NAPROXENO'], cat: 'Anti-inflamatório' },
    { key: ['LEVONORGESTREL', 'MEDROXIPROGESTERONA', 'NORETISTERONA', 'ESTRADIOL', 'CICLO 21'], cat: 'Hormonal / Contraceptivo' },
    { key: ['OMEPRAZOL', 'HIDRÓXIDO DE ALUMÍNIO', 'RANITIDINA', 'PANTOPRAZOL'], cat: 'Antiácido / Protetor Gástrico' },
    { key: ['METOCLOPRAMIDA', 'ONDANSETRONA', 'DIMENIDRATO', 'DOMPERIDONA'], cat: 'Antiemético' },
    { key: ['SALBUTAMOL', 'IPRATRÓPIO'], cat: 'Broncodilatador' },
    { key: ['TIMOLOL', 'BRIMONIDINA'], cat: 'Oftalmológico' },
    { key: ['AGULHA', 'SERINGA', 'ESCALPE', 'EQUIPO', 'CATETER', 'SONDA', 'LUVAS', 'MÁSCARA', 'AVENTAL', 'TOUCA', 'ATADURA', 'ESPARADRAPO', 'COMPRESSA', 'GAZE', 'ALGODÃO', 'LANCETA', 'TIRA REAGENTE', 'COLETOR', 'LÂMINA', 'ESPÁTULA', 'ESPÉCULO', 'FITA AUTOCLAVE'], cat: 'Material Médico / Hospitalar' },
    { key: ['ÁLCOOL', 'CLOREXIDINA', 'IODOPOVIDONA', 'ÁGUA DESTILADA', 'CLORETO DE SÓDIO', 'GLICOSE', 'SOLUÇÃO', 'GEL CONDUTOR'], cat: 'Soluções / Antissépticos' }
];

try {
    const rawContent = fs.readFileSync(rawPath, 'utf-8');
    const lines = rawContent.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

    const medicamentos = [];
    let currentMed = {};

    // Helper to check if a line is a header value
    const isCode = l => l.startsWith('Código:');
    const isPres = l => l.startsWith('Apresentação:');
    const isCat = l => l.startsWith('Categoria:');
    // Helper to check if a line is an alphabet header like "A", "B"
    const isAlphaHeader = l => l.length === 1 && /[A-Z]/.test(l);

    // Reconstruct items
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        if (isAlphaHeader(line)) continue;

        if (isCode(line)) {
            currentMed.codigo = line.replace('Código:', '').trim();
            // The item name is usually the line(s) before. 
            // In this specific format, the name was likely the PREVIOUS line 
            // OR the one before that if everything is pushed.
            // But since we are iterating, we need to capture name differently.
            // Let's assume the Name is the line that DOES NOT start with Code, Pres, Cat and is not Single Char.
        } else if (isPres(line)) {
            currentMed.apresentacao = line.replace('Apresentação:', '').trim();
        } else if (isCat(line)) {
            currentMed.categoria = line.replace('Categoria:', '').trim();

            // Refine Category using map
            const nameUpper = (currentMed.nome || '').toUpperCase();
            const match = categoryMap.find(mapping =>
                mapping.key.some(keyword => nameUpper.includes(keyword))
            );
            if (match) {
                currentMed.categoria = match.cat;
            }

            // Push and reset
            if (currentMed.nome && currentMed.codigo) {
                medicamentos.push({ ...currentMed });
            }
            currentMed = {};
        } else {
            // Likely the name.
            // If we have a currentMed that is empty, this is the name.
            if (!currentMed.codigo) {
                currentMed.nome = line;
            }
        }
    }

    // Sort alphabetically
    medicamentos.sort((a, b) => a.nome.localeCompare(b.nome));

    fs.writeFileSync(jsonPath, JSON.stringify(medicamentos, null, 2), 'utf-8');
    console.log(`Successfully parsed ${medicamentos.length} medications.`);

} catch (err) {
    console.error('Error parsing:', err);
}
