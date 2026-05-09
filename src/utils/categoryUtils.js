const CATEGORY_COLORS = {
  'Laticínios':  '#1565C0',
  'Grãos':       '#558B2F',
  'Óleos':       '#E65100',
  'Açúcar':      '#6A1B9A',
  'Massas':      '#AD1457',
  'Padaria':     '#795548',
  'Bebidas':     '#00838F',
  'Limpeza':     '#0277BD',
  'Higiene':     '#283593',
  'Carnes':      '#B71C1C',
  'Hortifruti':  '#2E7D32',
  'Frios':       '#37474F',
  'Snacks':      '#F57C00',
  'Matinal':     '#F9A825',
  'Temperos':    '#BF360C',
  'Conservas':   '#4527A0',
  'Congelados':  '#006064',
  'Farináceos':  '#827717',
  'Condimentos': '#33691E',
  'Bebê':        '#C62828',
};

const CATEGORY_ICONS = {
  'Laticínios':  'water',
  'Grãos':       'nutrition',
  'Óleos':       'flask',
  'Açúcar':      'ice-cream',
  'Massas':      'restaurant',
  'Padaria':     'pizza',
  'Bebidas':     'cafe',
  'Limpeza':     'sparkles',
  'Higiene':     'body',
  'Carnes':      'nutrition',
  'Hortifruti':  'leaf',
  'Frios':       'snow',
  'Snacks':      'fast-food',
  'Matinal':     'sunny',
  'Temperos':    'flame',
  'Conservas':   'archive',
  'Congelados':  'snow',
  'Farináceos':  'restaurant',
  'Condimentos': 'restaurant',
  'Bebê':        'happy',
};

// Keyword rules for dynamic category matching (unknown/custom categories)
const KEYWORD_RULES = [
  { re: /carne|frango|peixe|atum|proteina|bovina|suina/i,                    icon: 'nutrition'      },
  { re: /limpeza|detergente|desinfet|amaciante|sanitari|sabao.po|agua.sanit/i, icon: 'sparkles'     },
  { re: /higiene|shampoo|sabonete|desodor|pasta.dente|cosmet|perfume/i,       icon: 'body'           },
  { re: /bebida|suco|refriger|agua|cafe|cha|energetico|cerveja|vinho|leite/i, icon: 'cafe'           },
  { re: /frut|veget|legum|hortifruti|verdura|salada|plantio|organico/i,       icon: 'leaf'           },
  { re: /laticin|queijo|iogurt|manteiga|margarina|creme.leite/i,              icon: 'water'          },
  { re: /padaria|pao|bolo|confeit|biscoito.artesanal/i,                       icon: 'pizza'          },
  { re: /doce|chocolate|sobremesa|sorvete|gelado|candy/i,                     icon: 'ice-cream'      },
  { re: /congelad|gelad|frio/i,                                               icon: 'snow'           },
  { re: /tempero|condiment|molho|ketchup|mostarda|pimenta|sal$/i,             icon: 'flame'          },
  { re: /conserva|enlat|envasd|sardinha/i,                                    icon: 'archive'        },
  { re: /grao|arroz|feijao|lentilha|leguminosa|ervilha|soja/i,               icon: 'nutrition'      },
  { re: /massa|macarrao|espaguete|farinha|trigo|cereal/i,                     icon: 'restaurant'     },
  { re: /snack|biscoito|salgad|bala|chips|amendoim/i,                         icon: 'fast-food'      },
  { re: /bebe|fralda|infantil|mamad|pediatr/i,                                icon: 'happy'          },
  { re: /pet|animal|racao|cachorro|gato|aquario/i,                            icon: 'paw'            },
  { re: /eletron|pilha|bateria|eletro/i,                                      icon: 'flash'          },
  { re: /papel|escritorio|papelaria/i,                                        icon: 'document-text'  },
  { re: /farmac|remedio|medicament|vitamina|suplemento|saude/i,               icon: 'medkit'         },
  { re: /oleo|azeite|gordura/i,                                               icon: 'flask'          },
  { re: /matinal|aveia|granola/i,                                             icon: 'sunny'          },
  { re: /acucar|mel|geleia|doce/i,                                            icon: 'ice-cream'      },
  { re: /roupa|vestuario|calcado|tenis|camiseta/i,                            icon: 'shirt'          },
  { re: /jardinagem|planta|vaso|adubo|semente/i,                              icon: 'flower'         },
  { re: /ferramenta|construcao|parafuso|cimento/i,                            icon: 'construct'      },
  { re: /livro|revista|educacao|estudo/i,                                     icon: 'book'           },
  { re: /sport|esporte|academia|fitness/i,                                    icon: 'barbell'        },
];

const FALLBACK_COLORS = [
  '#1565C0', '#558B2F', '#E65100', '#6A1B9A', '#AD1457',
  '#795548', '#00838F', '#0277BD', '#283593', '#B71C1C',
  '#00838F', '#F57C00', '#827717', '#33691E', '#BF360C',
];

function stringHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (s.charCodeAt(i) + ((h << 5) - h)) | 0;
  return Math.abs(h);
}

function normalizeStr(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function getCategoryColor(cat) {
  if (!cat) return FALLBACK_COLORS[0];
  return CATEGORY_COLORS[cat] || FALLBACK_COLORS[stringHash(cat) % FALLBACK_COLORS.length];
}

export function getCategoryIcon(cat) {
  if (!cat) return 'cube-outline';
  if (CATEGORY_ICONS[cat]) return CATEGORY_ICONS[cat] + '-outline';
  const norm = normalizeStr(cat);
  for (const { re, icon } of KEYWORD_RULES) {
    if (re.test(norm)) return icon + '-outline';
  }
  return 'cube-outline';
}
