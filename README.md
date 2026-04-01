# Guia Municipal de Medicamentos | IntegraFarma Oeiras

O **Guia Municipal de Medicamentos** é um módulo do **IntegraFarma Oeiras**,
criado para qualificar a rotina da assistência farmacêutica municipal e apoiar
o uso do sistema Hórus com mais segurança, rapidez e padronização.

## Objetivo

Facilitar a localização dos medicamentos efetivamente padronizados pela
Secretaria Municipal de Saúde de Oeiras, reduzindo ambiguidades, pedidos
inconsistentes e retrabalho no dia a dia das equipes.

## Problema enfrentado

No uso cotidiano do Hórus, a base ampla de itens e as nomenclaturas
semelhantes podem dificultar a busca rápida pelo medicamento correto. Isso
pode gerar erros de digitação, lentidão no atendimento e inconsistências no
fluxo de trabalho.

## Solucao adotada

Esta aplicação web organiza a lista municipal de medicamentos em uma interface
simples, responsiva e fácil de consultar, com:

- busca por nome ou código;
- filtro por categoria;
- ordenação inteligente;
- visualização do total de itens;
- navegação focada na rotina das equipes.

## Posicionamento da ferramenta

O protagonismo da experiência está na **solução municipal criada por Oeiras**.
O Hórus permanece como sistema oficial de referência, enquanto o Guia
Municipal de Medicamentos atua como ferramenta de apoio para tornar seu uso
mais viável, organizado e sustentável no SUS municipal.

## Estrutura do projeto

- `index.html`: estrutura da interface
- `css/styles.css`: estilos do catalogo
- `js/`: lógica da busca, filtros e renderização
- `data/`: base de medicamentos utilizada no catalogo

## Como executar localmente

1. Clone o repositório:

```bash
git clone https://github.com/ErosBarbosa/medicamentos.git
```

2. Abra o arquivo `index.html` no navegador.

Se preferir, use uma extensão de servidor local, como o Live Server no VS Code.
