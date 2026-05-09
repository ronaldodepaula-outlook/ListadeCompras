// Map of Portuguese/English column names to internal field names
const COLUMN_MAP = {
  // name
  nome: 'name', name: 'name', produto: 'name', product: 'name', descricao_curta: 'name',
  // category
  categoria: 'category', category: 'category', cat: 'category', grupo: 'category',
  // brand
  marca: 'brand', brand: 'brand', fabricante: 'brand', manufacturer: 'brand',
  // unit
  unidade: 'unit', unit: 'unit', medida: 'unit', um: 'unit',
  // barcode
  codigo_barras: 'barcode', barcode: 'barcode', ean: 'barcode', codigo: 'barcode',
  gtin: 'barcode', ean13: 'barcode',
  // description
  descricao: 'description', description: 'description', observacao: 'description',
  obs: 'description', detalhe: 'description', detalhes: 'description',
};

const VALID_UNITS = ['un', 'kg', 'g', 'L', 'ml', 'cx', 'pct', 'dz', 'lt', 'mg', 'ton', 'par'];

function normalizeHeader(raw) {
  return raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((ch === ',' || ch === ';') && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function normalizeUnit(raw) {
  if (!raw) return 'un';
  const u = raw.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const unitMap = { litro: 'L', litros: 'L', l: 'L', ml: 'ml', mililitro: 'ml',
    kg: 'kg', quilograma: 'kg', quilo: 'kg', g: 'g', grama: 'g', gramas: 'g',
    un: 'un', und: 'un', unidade: 'un', unidades: 'un', peca: 'un', pecas: 'un',
    cx: 'cx', caixa: 'cx', caixas: 'cx', pct: 'pct', pacote: 'pct', pacotes: 'pct',
    dz: 'dz', duzia: 'dz', dozias: 'dz', par: 'par', pares: 'par',
    mg: 'mg', miligrama: 'mg', ton: 'ton', tonelada: 'ton',
  };
  return unitMap[u] || raw.trim() || 'un';
}

export function parseProductCSV(text) {
  const rawLines = text.split(/\r?\n/);
  const lines = rawLines.filter(l => l.trim().length > 0);

  if (lines.length === 0) {
    return { products: [], errors: ['Arquivo vazio.'], skipped: 0, total: 0 };
  }
  if (lines.length === 1) {
    return { products: [], errors: ['O arquivo só tem cabeçalho, sem dados.'], skipped: 0, total: 0 };
  }

  const rawHeaders = parseCSVLine(lines[0]);
  const normalizedHeaders = rawHeaders.map(normalizeHeader);
  const mappedFields = normalizedHeaders.map(h => COLUMN_MAP[h] || null);

  const nameIdx = mappedFields.indexOf('name');
  if (nameIdx === -1) {
    return {
      products: [],
      errors: [
        `Coluna "nome" não encontrada. Cabeçalhos detectados: ${rawHeaders.join(', ')}`,
        'O CSV precisa ter pelo menos a coluna: nome',
      ],
      skipped: 0,
      total: 0,
    };
  }

  const products = [];
  const errors = [];
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.every(v => v === '')) { skipped++; continue; }

    const row = {};
    mappedFields.forEach((field, idx) => {
      if (field) row[field] = values[idx] || '';
    });

    const name = row.name?.trim();
    if (!name) {
      skipped++;
      errors.push(`Linha ${i + 1}: nome vazio — ignorada.`);
      continue;
    }

    products.push({
      id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      category: (row.category || '').trim(),
      brand: (row.brand || '').trim(),
      unit: normalizeUnit(row.unit),
      barcode: (row.barcode || '').replace(/\D/g, ''),
      description: (row.description || '').trim(),
      createdAt: Date.now(),
      importedAt: Date.now(),
    });
  }

  return { products, errors, skipped, total: lines.length - 1 };
}

export const CSV_TEMPLATE =
`nome,categoria,marca,unidade,codigo_barras,descricao
Leite Integral,Laticínios,Ninho,L,7891000100103,Leite integral UHT 1L
Arroz Branco,Grãos,Tio João,kg,7891234567890,Arroz branco tipo 1 5kg
Feijão Carioca,Grãos,Camil,kg,7896006716476,Feijão carioca tipo 1 1kg
Óleo de Soja,Óleos,Soya,L,7896000596218,Óleo de soja refinado 900ml
Açúcar Cristal,Açúcar,União,kg,7891910000197,Açúcar cristal branco 1kg
Macarrão Espaguete,Massas,Barilla,pct,7896000000001,Macarrão espaguete 500g
Pão de Forma,Padaria,Wickbold,un,7896072300024,Pão de forma integral
Manteiga com Sal,Laticínios,Aviação,un,7891515901011,Manteiga com sal 200g
Café Torrado,Bebidas,Pilão,pct,7896089010079,Café torrado e moído 500g
Detergente Líquido,Limpeza,Ypê,un,7896098900128,Detergente neutro 500ml
Sabão em Pó,Limpeza,Omo,pct,7891152400014,Sabão em pó multiação 1kg
Shampoo,Higiene,Pantene,un,7501007452157,Shampoo hidratação 400ml`;

export const CSV_COLUMNS = [
  { key: 'nome', label: 'Nome', required: true, description: 'Nome do produto' },
  { key: 'categoria', label: 'Categoria', required: false, description: 'Ex: Laticínios, Grãos, Limpeza' },
  { key: 'marca', label: 'Marca', required: false, description: 'Fabricante ou marca' },
  { key: 'unidade', label: 'Unidade', required: false, description: 'un, kg, g, L, ml, cx, pct, dz' },
  { key: 'codigo_barras', label: 'Código de Barras', required: false, description: 'EAN-13 ou similar' },
  { key: 'descricao', label: 'Descrição', required: false, description: 'Detalhes adicionais' },
];
