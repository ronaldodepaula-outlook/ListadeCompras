# CompraFacil - Documentacao para Desenvolvedores

## 1. Visao geral tecnica

O CompraFacil e um aplicativo mobile em React Native com Expo para criacao de listas de compras, cadastro de lojas, cadastro/importacao de produtos e comparacao de precos por estabelecimento.

O produto funciona com dados locais no dispositivo. A persistencia atual usa `AsyncStorage`, sem backend remoto, autenticacao ou sincronizacao em nuvem. Isso reduz complexidade operacional e permite uso rapido em campo, mas tambem significa que backup, sincronizacao multiusuario e auditoria centralizada ainda nao estao implementados.

## 2. Stack principal

| Camada | Tecnologia |
| --- | --- |
| Runtime mobile | React Native 0.76.9 |
| Plataforma Expo | Expo SDK 52 |
| UI | React Native core components |
| Navegacao | `@react-navigation/native`, bottom tabs e native stack |
| Persistencia local | `@react-native-async-storage/async-storage` |
| Importacao de arquivo | `expo-document-picker` e `expo-file-system` |
| Clipboard | `expo-clipboard` |
| Icones | `@expo/vector-icons` com Ionicons |
| Build Android | Gradle, Kotlin, React Native Gradle Plugin, EAS Build |

## 3. Estrutura do projeto

```text
.
|-- App.js
|-- app.json
|-- eas.json
|-- package.json
|-- android/
|   |-- app/build.gradle
|   |-- build.gradle
|   |-- gradle.properties
|   `-- settings.gradle
|-- assets/
|   `-- modelo_importacao_produtos.csv
`-- src/
    |-- context/
    |   `-- AppContext.js
    |-- screens/
    |   |-- ListsScreen.js
    |   |-- ListDetailScreen.js
    |   |-- CompareScreen.js
    |   |-- StoresScreen.js
    |   `-- ProductsScreen.js
    |-- theme/
    |   `-- index.js
    `-- utils/
        |-- categoryUtils.js
        `-- csvParser.js
```

## 4. Entrada da aplicacao

O arquivo `App.js` monta os providers e a navegacao principal.

Responsabilidades:

- Envolver a aplicacao com `SafeAreaProvider`.
- Envolver o estado global com `AppProvider`.
- Configurar `NavigationContainer`.
- Criar abas principais para Listas, Produtos e Lojas.
- Criar rotas de stack para detalhe da lista e comparacao.

Fluxo de navegacao:

```text
App
`-- NavigationContainer
    `-- Stack.Navigator
        |-- Main
        |   `-- Tab.Navigator
        |       |-- Lists
        |       |-- Products
        |       `-- Stores
        |-- ListDetail
        `-- Compare
```

Rotas com parametros:

| Rota | Parametros | Uso |
| --- | --- | --- |
| `ListDetail` | `{ listId }` | Abre uma lista especifica |
| `Compare` | `{ listId }` | Compara precos dos itens da lista |

## 5. Estado global

O estado central fica em `src/context/AppContext.js`.

Estado base:

```js
{
  stores: [],
  lists: [],
  products: [],
  loading: true
}
```

Chaves de persistencia local:

| Chave | Conteudo |
| --- | --- |
| `@comprafacil:stores` | Estabelecimentos cadastrados |
| `@comprafacil:lists` | Listas de compras e itens |
| `@comprafacil:products` | Catalogo de produtos |

O provider hidrata os dados no carregamento inicial e persiste alteracoes sempre que `stores`, `lists` ou `products` mudam apos a hidratacao.

## 6. Modelos de dominio

### Store

```js
{
  id: "store_...",
  name: "Supermercado Central",
  address: "Rua A, 100",
  createdAt: 1710000000000
}
```

Regras:

- `name` e obrigatorio.
- `address` e opcional.
- Ao excluir uma loja, os precos associados a ela sao removidos de todos os itens de todas as listas.

### Product

```js
{
  id: "prod_...",
  name: "Arroz Branco",
  category: "Graos",
  brand: "Marca Exemplo",
  unit: "kg",
  barcode: "7891234567890",
  description: "Arroz branco tipo 1 5kg",
  createdAt: 1710000000000,
  importedAt: 1710000000000
}
```

Regras:

- `name` e obrigatorio.
- `category`, `brand`, `barcode` e `description` sao opcionais.
- `unit` assume `un` quando nao informada.
- Produtos importados em lote sao adicionados ao catalogo atual.
- Nao ha deduplicacao automatica por nome, marca ou codigo de barras na versao atual.

### ShoppingList

```js
{
  id: "list_...",
  name: "Compras da semana",
  items: [],
  createdAt: 1710000000000
}
```

Regras:

- `name` e obrigatorio.
- A lista pode ser renomeada no cabecalho da tela de detalhe.
- A exclusao remove a lista e seus itens.

### ListItem

```js
{
  id: "item_...",
  name: "Leite Integral",
  quantity: 2,
  unit: "L",
  checked: false,
  prices: []
}
```

Regras:

- `name` e obrigatorio.
- `quantity` e convertida para numero; quando invalida, assume `1`.
- `unit` assume `un` quando nao informada.
- `checked` controla o progresso da compra.

### PriceEntry

```js
{
  storeId: "store_...",
  storeName: "Mercado Bairro",
  price: 6.49
}
```

Regras:

- Preco e unitario.
- Total do item por loja = `price * quantity`.
- Preco vazio, invalido ou menor/igual a zero remove a cotacao daquela loja para o item.

## 7. Telas e responsabilidades

### `ListsScreen`

Responsavel por:

- Exibir listas existentes ordenadas por data de criacao decrescente.
- Criar nova lista.
- Excluir lista com confirmacao.
- Mostrar progresso por itens marcados.
- Mostrar quantidade de itens cotados.

### `ListDetailScreen`

Responsavel por:

- Exibir itens de uma lista.
- Adicionar item manualmente.
- Buscar item no catalogo.
- Usar sugestoes automaticas ao digitar o nome.
- Selecionar unidade de medida.
- Marcar item como comprado.
- Excluir item.
- Renomear lista.
- Registrar ou editar precos por loja.
- Abrir comparacao.

Unidades exibidas no formulario:

```text
un, kg, g, L, ml, cx, pct, dz
```

### `CompareScreen`

Responsavel por:

- Calcular totais por loja.
- Ordenar estabelecimentos por melhor cobertura e menor total.
- Destacar a loja de melhor preco.
- Mostrar economia potencial entre loja mais barata e mais cara.
- Exibir detalhamento por item.
- Informar quando totais sao parciais por falta de cotacao.

Algoritmo de comparacao:

1. Percorre cada loja cadastrada.
2. Para cada item da lista, procura preco da loja.
3. Soma `preco unitario * quantidade` quando houver cotacao.
4. Conta quantos itens tem preco naquela loja.
5. Remove lojas sem nenhum preco.
6. Ordena por maior quantidade de itens cotados.
7. Em caso de empate de cobertura, ordena por menor total.

Observacao importante: uma loja com mais itens cotados pode aparecer antes de uma loja mais barata com menos itens cotados. Essa decisao favorece comparacoes mais completas.

### `StoresScreen`

Responsavel por:

- Listar estabelecimentos em ordem alfabetica.
- Cadastrar loja com nome e endereco opcional.
- Excluir loja com confirmacao.
- Remover automaticamente as cotacoes associadas a uma loja excluida.

### `ProductsScreen`

Responsavel por:

- Listar catalogo de produtos.
- Buscar por nome, marca, codigo de barras e categoria.
- Filtrar por categoria.
- Criar produto manualmente.
- Editar produto.
- Excluir produto.
- Limpar todo o catalogo.
- Importar produtos via CSV.
- Copiar modelo de CSV para area de transferencia.
- Previsualizar importacao antes de confirmar.

## 8. Importacao CSV

Arquivo: `src/utils/csvParser.js`.

O parser aceita separador por virgula ou ponto e virgula, com suporte simples a campos entre aspas. A importacao espera codificacao UTF-8.

Colunas recomendadas:

```csv
nome,categoria,marca,unidade,codigo_barras,descricao
Leite Integral,Laticinios,Ninho,L,7891000100103,Leite integral UHT 1L
```

Coluna obrigatoria:

- `nome`

Colunas opcionais:

- `categoria`
- `marca`
- `unidade`
- `codigo_barras`
- `descricao`

Aliases aceitos:

| Campo interno | Cabecalhos aceitos |
| --- | --- |
| `name` | `nome`, `name`, `produto`, `product`, `descricao_curta` |
| `category` | `categoria`, `category`, `cat`, `grupo` |
| `brand` | `marca`, `brand`, `fabricante`, `manufacturer` |
| `unit` | `unidade`, `unit`, `medida`, `um` |
| `barcode` | `codigo_barras`, `barcode`, `ean`, `codigo`, `gtin`, `ean13` |
| `description` | `descricao`, `description`, `observacao`, `obs`, `detalhe`, `detalhes` |

Normalizacao aplicada:

- Cabecalhos sao convertidos para minusculas.
- Acentos sao removidos.
- Espacos viram `_`.
- Caracteres fora de letras, numeros e `_` sao removidos.
- Codigo de barras remove caracteres nao numericos.
- Linhas com nome vazio sao ignoradas.

## 9. Categorias

Arquivo: `src/utils/categoryUtils.js`.

A aplicacao usa cores e icones por categoria. Existem categorias conhecidas com cor fixa e regras por palavra-chave para categorias novas.

Quando a categoria nao e reconhecida:

- A cor e calculada por hash do texto.
- O icone usa regras por palavra-chave.
- Se nenhuma regra combinar, usa `cube-outline`.

## 10. Tema visual

Arquivo: `src/theme/index.js`.

O tema centraliza:

- Cores.
- Espacamentos.
- Raios de borda.
- Sombras.
- Tipografia.

Antes de alterar estilos de tela, verifique se o token ja existe no tema. Isso preserva consistencia visual e reduz divergencia entre telas.

## 11. Instalacao local

Pre-requisitos:

- Node.js compativel com Expo SDK 52.
- npm.
- Android Studio e SDK Android para execucao nativa.
- EAS CLI para builds em nuvem.

Instalar dependencias:

```powershell
npm install
```

Iniciar o Metro/Expo:

```powershell
npx.cmd expo start
```

Rodar Android local:

```powershell
npx.cmd expo run:android
```

Observacao para Windows: se o PowerShell bloquear `npx.ps1` ou `eas.ps1`, use os binarios `.cmd`, por exemplo `npx.cmd` e `eas.cmd`.

## 12. Scripts disponiveis

Arquivo: `package.json`.

```json
{
  "start": "expo start",
  "android": "expo run:android",
  "ios": "expo run:ios",
  "web": "expo start --web"
}
```

Uso recomendado no Windows:

```powershell
npm run start
npm run android
```

ou:

```powershell
npx.cmd expo start
npx.cmd expo run:android
```

## 13. Build com EAS

Arquivo: `eas.json`.

Perfis atuais:

| Perfil | Distribuicao | Android |
| --- | --- | --- |
| `development` | interna | APK com development client |
| `preview` | interna | APK |
| `production` | producao | APK com `autoIncrement` |

Comandos:

```powershell
eas.cmd build -p android --profile preview
eas.cmd build -p android --profile production
```

Para publicar na Play Store futuramente, avalie trocar o build de producao para `app-bundle`:

```json
{
  "production": {
    "autoIncrement": true,
    "android": {
      "buildType": "app-bundle"
    }
  }
}
```

## 14. Observacao critica sobre a pasta `android/`

O projeto possui uma pasta nativa `android/`. Quando essa pasta existe, o EAS trata o projeto como prebuild/bare para Android e espera encontrar arquivos como:

```text
android/app/build.gradle
```

No estado observado, a pasta `android/` estava nao rastreada no Git. Se o build em nuvem for executado a partir de um pacote ou repositorio que nao contem essa pasta, o EAS pode falhar ao tentar injetar credenciais de assinatura.

Erro relacionado:

```text
Writing secrets to the project's directory
Injecting signing config into build.gradle
ENOENT: no such file or directory, open '/home/expo/workingdir/build/android/app/eas-build-inject-android-credentials.gradle'
```

Acao recomendada:

1. Se o projeto vai manter a pasta nativa, versionar `android/` no Git, exceto artefatos de build e arquivos sensiveis.
2. Garantir que `android/app/build.gradle` exista no pacote enviado ao EAS.
3. Nao versionar keystores privados de producao.
4. Nao criar manualmente o arquivo `eas-build-inject-android-credentials.gradle`; ele e gerado pelo EAS durante o build.

Comando para verificar se `android/` esta rastreado:

```powershell
git status --short --untracked-files=all android
git ls-files android
```

Se `git ls-files android` nao retornar nada, a pasta ainda nao esta versionada.

## 15. Assinatura Android

O `android/app/build.gradle` atual possui apenas `signingConfigs.debug` e usa a assinatura debug tambem em `release`. Em builds EAS, o servico injeta uma configuracao de assinatura de release com credenciais gerenciadas.

Cuidados:

- Mantenha `*.jks`, `*.p8`, `*.p12`, `*.key` e `*.mobileprovision` no `.gitignore`.
- Use credenciais do EAS para release.
- Nao coloque senhas de keystore em arquivos versionados.

## 16. Qualidade e testes manuais

Nao ha suite automatizada configurada no projeto atual. Antes de liberar uma versao, executar roteiro manual:

### Listas

- Criar lista.
- Renomear lista.
- Excluir lista.
- Adicionar item manual.
- Adicionar item usando catalogo.
- Marcar e desmarcar item.
- Excluir item.

### Lojas

- Cadastrar loja com endereco.
- Cadastrar loja sem endereco.
- Excluir loja e confirmar que os precos dela somem dos itens.

### Produtos

- Criar produto manual.
- Editar produto.
- Excluir produto.
- Buscar por nome, marca e codigo.
- Filtrar por categoria.
- Limpar catalogo.

### CSV

- Importar CSV valido.
- Importar CSV com separador `;`.
- Importar CSV sem coluna `nome`.
- Importar CSV com linha de nome vazio.
- Copiar modelo de CSV.

### Comparacao

- Comparar lista sem precos.
- Comparar lista com uma loja.
- Comparar lista com duas ou mais lojas.
- Validar totais com quantidade maior que 1.
- Validar mensagem de total parcial.

## 17. Riscos conhecidos e melhorias futuras

| Tema | Situacao atual | Sugestao |
| --- | --- | --- |
| Persistencia | Local via AsyncStorage | Exportacao/importacao de backup |
| Sincronizacao | Nao existe | Backend ou storage em nuvem |
| Duplicidade de produtos | Nao tratada automaticamente | Deduplicar por codigo de barras ou nome+marca |
| Testes | Sem suite automatizada | Adicionar testes unitarios para parser e comparacao |
| CSV | Parser proprio simples | Cobrir mais cenarios ou usar biblioteca dedicada |
| Monetizacao | Fora do codigo | Separar configuracao comercial do produto |
| Acessibilidade | Parcial | Auditar labels, contraste e leitura por leitor de tela |

## 18. Padroes de contribuicao

Recomendacoes:

- Manter regras de negocio no contexto ou em `utils`, evitando duplicacao entre telas.
- Usar tokens de `src/theme/index.js` para cores, espacos e tipografia.
- Manter nomes de telas coerentes com a navegacao.
- Evitar secrets no repositorio.
- Criar funcoes utilitarias quando uma regra passar a ser compartilhada.
- Ao alterar CSV, atualizar parser, tela de importacao e documentacao operacional.

## 19. Checklist antes de commit

```powershell
git status --short
npx.cmd expo config --type introspect
```

Verificar:

- Nao ha secrets versionados.
- `android/` esta versionada se o build EAS depender dela.
- `package-lock.json` esta coerente com `package.json`.
- O app abre no Expo/Android.
- Fluxos criticos foram testados manualmente.

