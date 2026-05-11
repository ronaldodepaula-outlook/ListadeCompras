# CompraFacil - Documentacao do Fluxo Operacional

## 1. Objetivo

Este documento descreve como operar o CompraFacil no dia a dia: preparar cadastros, montar listas, registrar precos, comparar lojas e manter a qualidade dos dados.

Ele deve ser usado por operadores, compradores, consultores e usuarios responsaveis por executar cotacoes ou compras recorrentes.

## 2. Visao geral do fluxo

```text
1. Cadastrar lojas
2. Cadastrar ou importar produtos
3. Criar lista de compras
4. Adicionar itens a lista
5. Registrar precos por loja
6. Comparar totais
7. Executar compra
8. Manter cadastros atualizados
```

## 3. Papeis operacionais sugeridos

| Papel | Responsabilidades |
| --- | --- |
| Operador de catalogo | Cadastra produtos, categorias, marcas e unidades |
| Comprador | Cria listas, registra precos e compara lojas |
| Responsavel comercial | Usa os resultados para orientar decisao de compra |
| Auditor interno ou consultor | Confere padronizacao, qualidade dos dados e oportunidades de melhoria |

Em uso individual, a mesma pessoa pode cumprir todos os papeis.

## 4. Preparacao inicial

Antes da primeira comparacao:

1. Abrir o app.
2. Acessar a aba `Lojas`.
3. Cadastrar os estabelecimentos que serao comparados.
4. Acessar a aba `Produtos`.
5. Cadastrar produtos manualmente ou importar via CSV.
6. Validar se nomes, categorias, marcas e unidades estao padronizados.

Resultado esperado:

- Lojas disponiveis para receber cotacoes.
- Catalogo pronto para acelerar a montagem de listas.

## 5. Cadastro de lojas

### Quando cadastrar

Cadastre uma loja sempre que ela puder receber cotacao de produtos.

Exemplos:

- Supermercado Central
- Mercado do Bairro
- Atacadao
- Fornecedor de limpeza
- Distribuidor local

### Campos

| Campo | Obrigatorio | Orientacao |
| --- | --- | --- |
| Nome do estabelecimento | Sim | Usar nome claro e reconhecivel |
| Endereco | Nao | Usar quando houver mais de uma unidade ou filial |

### Como cadastrar

1. Abrir a aba `Lojas`.
2. Tocar no botao `+`.
3. Informar o nome do estabelecimento.
4. Informar endereco, se necessario.
5. Tocar em `Cadastrar`.

### Como excluir

1. Abrir a aba `Lojas`.
2. Localizar a loja.
3. Tocar no icone de lixeira.
4. Confirmar exclusao.

Atencao: ao excluir uma loja, todos os precos registrados para ela sao removidos das listas.

## 6. Cadastro de produtos

### Quando cadastrar

Cadastre produtos quando eles forem usados com frequencia ou quando voce quiser padronizar nomes na montagem das listas.

### Campos

| Campo | Obrigatorio | Exemplo | Orientacao |
| --- | --- | --- | --- |
| Nome | Sim | Leite Integral | Nome claro do produto |
| Categoria | Nao | Laticinios | Usar categorias consistentes |
| Marca | Nao | Ninho | Preencher quando a marca alterar a comparacao |
| Unidade | Nao | L | Selecionar unidade coerente com a compra |
| Codigo de barras | Nao | 7891000100103 | Usar EAN/GTIN quando disponivel |
| Descricao | Nao | UHT 1L | Detalhes que evitem ambiguidade |

### Como cadastrar manualmente

1. Abrir a aba `Produtos`.
2. Tocar no botao `+`.
3. Preencher os campos.
4. Selecionar a unidade.
5. Tocar em `Adicionar`.

### Como editar

1. Abrir a aba `Produtos`.
2. Tocar no produto desejado.
3. Alterar os campos.
4. Tocar em `Salvar`.

### Como excluir

1. Abrir a aba `Produtos`.
2. Localizar o produto.
3. Tocar na lixeira.
4. Confirmar exclusao.

Excluir produto do catalogo nao remove automaticamente itens ja adicionados em listas existentes, pois listas guardam seus proprios itens.

## 7. Importacao de produtos via CSV

### Quando usar

Use importacao CSV quando houver muitos produtos ou quando o cliente ja possuir uma base em planilha.

### Formato recomendado

```csv
nome,categoria,marca,unidade,codigo_barras,descricao
Leite Integral,Laticinios,Ninho,L,7891000100103,Leite integral UHT 1L
Arroz Branco,Graos,Tio Joao,kg,7891234567890,Arroz branco tipo 1 5kg
```

### Colunas

| Coluna | Obrigatoria | Descricao |
| --- | --- | --- |
| `nome` | Sim | Nome do produto |
| `categoria` | Nao | Grupo do produto |
| `marca` | Nao | Marca ou fabricante |
| `unidade` | Nao | Unidade de medida |
| `codigo_barras` | Nao | EAN, GTIN ou codigo similar |
| `descricao` | Nao | Detalhes adicionais |

### Regras do arquivo

- Usar codificacao UTF-8.
- Separador pode ser virgula ou ponto e virgula.
- A primeira linha deve conter cabecalhos.
- O arquivo precisa ter pelo menos a coluna `nome`.
- Linhas sem nome sao ignoradas.
- Codigo de barras fica somente com numeros.

### Como importar

1. Abrir a aba `Produtos`.
2. Tocar no icone de importacao no cabecalho.
3. Selecionar `Escolher arquivo CSV`.
4. Escolher o arquivo no dispositivo.
5. Conferir a pre-visualizacao.
6. Verificar produtos validos, ignorados e avisos.
7. Confirmar a importacao.

### Como obter modelo

1. Abrir a aba `Produtos`.
2. Tocar no icone de importacao.
3. Selecionar `Ver modelo do CSV`.
4. Tocar em `Copiar modelo`.
5. Colar em uma planilha ou editor de texto.

## 8. Criacao de listas

### Quando criar uma lista

Crie uma lista para cada compra ou cotacao independente.

Exemplos:

- Compra semanal
- Compra mensal
- Reposicao limpeza
- Cotacao fornecedores maio
- Compra churrasco

### Como criar

1. Abrir a aba `Listas`.
2. Tocar no botao `+`.
3. Informar o nome da lista.
4. Tocar em `Criar Lista`.

Apos criar, o app abre automaticamente o detalhe da lista.

### Como renomear

1. Abrir a lista.
2. Tocar no nome da lista no cabecalho.
3. Digitar o novo nome.
4. Confirmar pelo teclado ou sair do campo.

### Como excluir

1. Abrir a aba `Listas`.
2. Tocar na lixeira da lista.
3. Confirmar exclusao.

## 9. Inclusao de itens na lista

### Opcoes de inclusao

O usuario pode:

- Digitar o produto manualmente.
- Usar sugestoes do catalogo durante a digitacao.
- Navegar pelo catalogo e selecionar um produto.

### Como adicionar item manual

1. Abrir a lista.
2. Tocar em `+`.
3. Informar nome do produto.
4. Informar quantidade.
5. Selecionar unidade.
6. Tocar em `Adicionar`.

### Como adicionar item do catalogo

1. Abrir a lista.
2. Tocar em `+`.
3. Digitar parte do nome para ver sugestoes ou tocar em `Buscar no catalogo`.
4. Selecionar o produto.
5. Ajustar quantidade e unidade, se necessario.
6. Tocar em `Adicionar`.

### Boas praticas

- Usar nomes especificos quando marca ou embalagem importarem.
- Conferir unidade antes de registrar preco.
- Evitar misturar unidades diferentes para o mesmo item.
- Exemplo bom: `Leite Integral 1L`.
- Exemplo ruim: `Leite`, quando existem varios tipos ou tamanhos.

## 10. Registro de precos

### O que registrar

Registrar o preco unitario do item em cada loja.

Exemplo:

- Item: Arroz Branco
- Quantidade: 2 kg
- Preco informado: R$ 5,99 por kg ou unidade comparavel
- Total calculado no comparativo: R$ 11,98

### Como registrar

1. Abrir a lista.
2. Localizar o item.
3. Tocar em `Preco` ou `Editar`.
4. Informar o preco unitario para cada loja.
5. Tocar em `Salvar Precos`.

### Regras

- Campo vazio remove o preco da loja naquele item.
- Valor zero ou invalido remove o preco.
- Use virgula ou ponto como separador decimal conforme o teclado permitir.
- O app mostra o total do item por loja dentro da tela de preco.

### Cuidados

- Verificar se a unidade do item corresponde ao preco coletado.
- Se a loja vende embalagem diferente, padronizar antes de comparar.
- Quando nao houver preco confiavel, deixar em branco.

## 11. Marcacao de itens comprados

Use a marcacao para acompanhar a execucao da compra.

Como usar:

1. Abrir a lista.
2. Tocar no circulo ao lado do item.
3. O item marcado aparece com texto riscado e menor destaque.

O progresso aparece no cartao da lista na tela inicial.

## 12. Comparacao de precos

### Pre-condicoes

Antes de comparar:

- A lista deve ter itens.
- Deve existir pelo menos uma loja cadastrada.
- Pelo menos um item deve ter preco registrado em alguma loja.

### Como comparar

1. Abrir a lista.
2. Tocar em `Comparar`.
3. Analisar o resumo por loja.
4. Conferir o detalhamento por item.
5. Observar avisos de total parcial.

### Como interpretar

| Elemento | Significado |
| --- | --- |
| Melhor preco | Loja no topo do ranking da comparacao |
| Total | Soma dos itens cotados naquela loja |
| Cobertura | Quantos itens da lista possuem preco naquela loja |
| Total parcial | Existem itens sem preco naquela loja |
| Economia potencial | Diferenca entre maior e menor total exibido |
| Detalhamento por item | Tabela de precos unitarios entre lojas |

### Regra de ordenacao

A comparacao prioriza lojas com mais itens cotados. Quando duas lojas possuem a mesma cobertura, a mais barata aparece primeiro.

Isso evita favorecer uma loja que parece barata apenas porque tem poucos itens cotados.

## 13. Decisao de compra

A partir da tela de comparacao, o comprador pode:

- Escolher a loja com melhor total e boa cobertura.
- Dividir a compra entre lojas usando o detalhamento por item.
- Voltar para cotar itens faltantes.
- Remover itens irrelevantes da lista.
- Ajustar quantidades e comparar novamente.

## 14. Rotina operacional recomendada

### Antes da cotacao

- Conferir lojas cadastradas.
- Conferir catalogo.
- Criar lista com nome padronizado.
- Adicionar todos os itens.
- Revisar quantidades e unidades.

### Durante a cotacao

- Coletar precos por loja.
- Registrar somente precos confiaveis.
- Deixar em branco itens sem informacao.
- Revisar valores digitados.

### Depois da cotacao

- Abrir comparacao.
- Avaliar cobertura por loja.
- Verificar totais parciais.
- Decidir onde comprar.
- Marcar itens comprados durante a execucao.

### Periodicamente

- Limpar produtos duplicados.
- Corrigir categorias inconsistentes.
- Remover lojas desativadas.
- Atualizar base CSV quando houver mudancas.

## 15. Padronizacao de dados

### Nomes de produtos

Use um padrao consistente:

```text
[Produto] [Tipo/Variacao] [Volume/Peso quando relevante]
```

Exemplos:

- Leite Integral 1L
- Arroz Branco Tipo 1 5kg
- Detergente Neutro 500ml
- Cafe Torrado e Moido 500g

### Categorias

Escolha poucas categorias claras:

- Laticinios
- Graos
- Limpeza
- Higiene
- Bebidas
- Hortifruti
- Padaria
- Carnes

Evite cadastrar a mesma categoria com grafias diferentes.

### Unidades

Unidades mais usadas:

- `un`: unidade
- `kg`: quilograma
- `g`: grama
- `L`: litro
- `ml`: mililitro
- `cx`: caixa
- `pct`: pacote
- `dz`: duzia

## 16. Tratamento de erros comuns

| Situacao | Causa provavel | Acao |
| --- | --- | --- |
| Nao consigo comparar | Lista sem itens ou sem precos | Adicionar itens e registrar precos |
| Loja nao aparece na comparacao | Nenhum item tem preco nessa loja | Registrar pelo menos um preco |
| Total parece baixo | Existem itens sem preco | Conferir aviso de total parcial |
| Produto nao aparece na busca | Nome, marca ou categoria diferente | Ajustar busca ou cadastrar produto |
| CSV nao importa | Cabecalho incorreto ou sem `nome` | Corrigir arquivo e tentar novamente |
| Muitos produtos duplicados | Importacoes repetidas | Revisar catalogo antes de nova importacao |
| Preco sumiu apos excluir loja | Regra esperada | Precos da loja excluida sao removidos |

## 17. Checklist de qualidade da cotacao

Antes de usar o resultado para decisao:

- Todos os itens importantes estao na lista.
- Quantidades estao corretas.
- Unidades estao coerentes.
- Lojas relevantes foram cadastradas.
- Precos foram digitados como valores unitarios.
- Itens sem preco foram revisados.
- Totais parciais foram considerados.
- A decisao final levou em conta custo, distancia, disponibilidade e conveniencia.

## 18. Limitacoes operacionais atuais

Na versao atual:

- Os dados ficam no dispositivo.
- Nao existe sincronizacao entre usuarios.
- Nao existe backup automatico.
- Nao existe consulta automatica de precos na internet.
- Nao existe historico analitico por periodo.
- Nao existe exportacao de relatorios.

Essas limitacoes devem ser consideradas em operacoes com varios usuarios ou necessidade de auditoria formal.

## 19. Indicadores que podem ser acompanhados manualmente

Mesmo sem relatorios automaticos, a operacao pode observar:

- Diferenca entre loja mais barata e mais cara por lista.
- Percentual de itens cotados por loja.
- Itens com maior variacao de preco.
- Produtos mais recorrentes.
- Lojas mais competitivas para determinadas categorias.
- Frequencia de listas criadas.

## 20. Procedimento de encerramento da compra

Ao concluir a compra:

1. Marcar todos os itens comprados.
2. Revisar itens nao comprados.
3. Manter a lista como historico local ou excluir se nao for mais necessaria.
4. Atualizar produtos do catalogo se algum nome, marca ou unidade estava incorreto.
5. Atualizar lojas se houve alteracao de endereco ou estabelecimento.

## 21. Fluxo rapido para treinamento

Para treinar um novo operador:

1. Mostrar as tres abas principais: Listas, Produtos e Lojas.
2. Cadastrar uma loja.
3. Cadastrar um produto.
4. Criar uma lista.
5. Adicionar o produto a lista.
6. Registrar preco.
7. Abrir comparacao.
8. Explicar total parcial e cobertura.
9. Excluir loja para mostrar remocao de cotacoes.
10. Importar um CSV pequeno de exemplo.

Tempo estimado de treinamento: 20 a 30 minutos.

