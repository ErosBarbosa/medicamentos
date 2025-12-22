const fs = require('fs');
const path = require('path');

const rawPath = path.join(__dirname, 'raw.txt');
const jsonPath = path.join(__dirname, 'data/medicamentos.json');

try {
    const rawData = fs.readFileSync(rawPath, 'utf-8');
    const lines = rawData.split(/\r?\n/).map(l => l.trim()).filter(l => l);

    const medicamentos = [];
    let currentItem = {};

    // Helper to add item
    const addItem = (item) => {
        if (!item.nome || !item.codigo) return;

        // Handle multiple codes: "BR123 (Desc), BR456 (Desc2)"
        // or a single code "BR123"
        // The input format for codes is: "Códigos: BR... (..), BR... (..)" or "Código: BR..."

        const codesStr = item.codigo;
        const codesMatches = [...codesStr.matchAll(/(BR[\w\d-]+)(?:\s*\(([^)]+)\))?/g)];

        if (codesMatches.length > 1) {
            // Multiple variants
            codesMatches.forEach(match => {
                const code = match[1];
                const variant = match[2];
                const name = variant ? `${item.nome} (${variant})` : item.nome;

                medicamentos.push({
                    codigo: code,
                    nome: name,
                    apresentacao: item.apresentacao,
                    categoria: item.categoria
                });
            });
        } else {
            // Single item or simple code
            // If there's a variant in the single code too?
            // E.g. Código: BR0397513 (13x0,45)
            // Even if "Código:" label was used, if it matches the pattern with parens, extract it.

            const singleMatch = codesStr.match(/(BR[\w\d-]+)(?:\s*\(([^)]+)\))?/);
            if (singleMatch) {
                const code = singleMatch[1];
                const variant = singleMatch[2];
                const name = variant ? `${item.nome} (${variant})` : item.nome;

                medicamentos.push({
                    codigo: code,
                    nome: name,
                    apresentacao: item.apresentacao,
                    categoria: item.categoria
                });
            } else {
                // Fallback if no specific code string match (unlikely based on regex)
                medicamentos.push(item);
            }
        }
    };

    let i = 0;
    while (i < lines.length) {
        const line = lines[i];

        // Headers like "A", "B", etc. - ignore single letters or specific headers 
        if (line.length === 1 && line.match(/[A-Z]/)) {
            i++;
            continue;
        }

        // Logic: 
        // 1. Name (uppercase usually, not starting with label)
        // 2. Code/Codes
        // 3. Presentation
        // 4. Category

        // Ensure we are at a name line
        // A name line is followed eventually by a Code line
        if (!line.startsWith('Código:') && !line.startsWith('Códigos:') &&
            !line.startsWith('Apresentação:') && !line.startsWith('Categoria:')) {

            // This assumes a block structure always starts with Name
            currentItem = { nome: line };

            // Look ahead for next props
            let j = i + 1;
            while (j < lines.length) {
                const next = lines[j];

                if (next.startsWith('Código:') || next.startsWith('Códigos:')) {
                    currentItem.codigo = next.replace(/^Códigos?:\s*/, '');
                } else if (next.startsWith('Apresentação:')) {
                    currentItem.apresentacao = next.replace('Apresentação: ', '');
                } else if (next.startsWith('Categoria:')) {
                    currentItem.categoria = next.replace('Categoria: ', '');
                    // End of block, push item
                    addItem(currentItem);
                    i = j; // Move main index to here
                    break;
                }
                j++;
            }
        }
        i++;
    }

    // Sort by name
    medicamentos.sort((a, b) => a.nome.localeCompare(b.nome));

    fs.writeFileSync(jsonPath, JSON.stringify(medicamentos, null, 2), 'utf-8');
    console.log(`Successfully parsed ${medicamentos.length} items.`);

} catch (err) {
    console.error('Error parsing:', err);
}
