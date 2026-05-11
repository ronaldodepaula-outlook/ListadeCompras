# CompraFacil

Aplicativo mobile para organizar listas de compras, registrar precos por loja e comparar onde uma compra tende a sair mais economica.

## O que e

O CompraFacil transforma uma lista comum de compras em uma ferramenta de decisao. O usuario cadastra estabelecimentos, monta um catalogo de produtos, cria listas, informa precos unitarios por loja e visualiza uma comparacao com total estimado, cobertura de itens e economia potencial.

## Para quem e

- Consumidores que querem comparar supermercados.
- Familias que buscam controle de gastos.
- Pequenos negocios que cotam itens recorrentes.
- Consultores que apoiam clientes em organizacao de compras.
- Equipes que ainda usam papel, mensagens ou planilhas simples para comparar precos.

## Principais recursos

- Criacao e gestao de listas de compras.
- Cadastro de lojas e estabelecimentos.
- Catalogo de produtos com categorias, marcas, unidades e codigo de barras.
- Importacao de produtos via CSV.
- Busca e filtro de produtos.
- Sugestoes do catalogo ao adicionar itens na lista.
- Registro de precos por loja e por item.
- Comparacao de totais por estabelecimento.
- Destaque de melhor preco.
- Aviso de totais parciais quando faltam cotacoes.
- Checklist de itens comprados.
- Persistencia local no dispositivo.

## Como funciona

```text
Cadastre lojas -> Cadastre ou importe produtos -> Crie uma lista -> Adicione itens -> Registre precos -> Compare lojas
```

## Beneficios comerciais

| Beneficio | Impacto |
| --- | --- |
| Organizacao de listas | Reduz esquecimentos e retrabalho |
| Catalogo reutilizavel | Acelera compras recorrentes |
| Cotacao por loja | Centraliza informacoes de preco |
| Comparacao visual | Facilita decisao de onde comprar |
| Total parcial sinalizado | Evita conclusoes enganosas |
| Uso mobile | Permite cotar e comprar em campo |

## Exemplo de uso

1. Cadastre lojas como `Mercado Bairro`, `Atacado Central` e `Supermercado Sul`.
2. Importe um CSV com produtos recorrentes.
3. Crie a lista `Compra semanal`.
4. Adicione itens como arroz, leite, cafe e detergente.
5. Informe o preco de cada item nas lojas pesquisadas.
6. Abra a tela de comparacao para ver o ranking por loja.

## Documentacao

- [Documentacao para desenvolvedores](docs/documentacao-desenvolvedores.md)
- [Documentacao para consultores comerciais](docs/documentacao-consultores-comerciais.md)
- [Documentacao do fluxo operacional](docs/documentacao-fluxo-operacional.md)

## Stack tecnica

- React Native
- Expo SDK 52
- React Navigation
- AsyncStorage
- Expo Document Picker
- Expo File System
- Expo Clipboard
- Ionicons
- EAS Build

## Instalacao

```powershell
npm install
```

## Execucao local

```powershell
npx.cmd expo start
```

Para Android:

```powershell
npx.cmd expo run:android
```

No Windows, use `npx.cmd` ou `eas.cmd` caso o PowerShell bloqueie a execucao de scripts `.ps1`.

## Build Android com EAS

Build de preview:

```powershell
eas.cmd build -p android --profile preview
```

Build de producao:

```powershell
eas.cmd build -p android --profile production
```

Observacao: como o projeto possui pasta `android/`, ela deve estar presente no pacote enviado ao EAS. Se o build falhar ao injetar credenciais em `android/app/eas-build-inject-android-credentials.gradle`, verifique se `android/app/build.gradle` existe e se a pasta `android/` esta versionada/enviada corretamente.

## Importacao CSV

Modelo basico:

```csv
nome,categoria,marca,unidade,codigo_barras,descricao
Leite Integral,Laticinios,Ninho,L,7891000100103,Leite integral UHT 1L
Arroz Branco,Graos,Tio Joao,kg,7891234567890,Arroz branco tipo 1 5kg
```

A coluna `nome` e obrigatoria. As demais sao opcionais.

## Status do produto

Versao atual com foco em uso local:

- Sem login.
- Sem backend remoto.
- Sem sincronizacao entre dispositivos.
- Sem consulta automatica de precos online.
- Dados persistidos localmente via AsyncStorage.

## Proximas evolucoes sugeridas

- Backup/exportacao de dados.
- Deduplicacao de produtos por codigo de barras.
- Historico de precos por periodo.
- Relatorios de economia.
- Sincronizacao em nuvem.
- Usuarios e perfis de acesso.
- Divisao otimizada de compra entre lojas.

## Licenca

Definir politica de licenciamento antes de distribuicao publica ou comercial.

