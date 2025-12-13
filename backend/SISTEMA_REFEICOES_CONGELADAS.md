# 🧊 Sistema de Controle de Refeições Congeladas

## 📋 Visão Geral

Sistema completo para rastrear receitas prontas que foram congeladas e armazenadas no freezer.

## 🎯 Funcionalidades

### ✅ Controle Completo
- **Registrar congelamento**: Quando você congela porções de uma receita
- **Rastrear porções**: Quantas porções foram congeladas e quantas restam
- **Validade automática**: Data de validade padrão de 3 meses (configurável)
- **Consumir porções**: Registrar quando você descongela e consome
- **Alertas**: Avisos para refeições vencendo ou vencidas

### 📊 Informações Rastreadas
- Receita congelada
- Quantidade de porções congeladas
- Data de congelamento
- Data de validade (padrão: 3 meses)
- Porções já consumidas
- Porções restantes
- Status (congelado, descongelado, consumido)
- Notas sobre o preparo/congelamento

## 🔌 API Endpoints

### Listar todas as refeições congeladas
```bash
GET /api/frozen-meals
```

**Query params opcionais:**
- `status`: Filtrar por status (frozen, thawed, consumed)
- `expired_only`: true/false - Mostrar apenas vencidas

**Exemplo:**
```bash
curl http://localhost:5000/api/frozen-meals
curl http://localhost:5000/api/frozen-meals?status=frozen
curl http://localhost:5000/api/frozen-meals?expired_only=true
```

### Obter detalhes de uma refeição
```bash
GET /api/frozen-meals/<id>
```

### Congelar porções de uma receita
```bash
POST /api/frozen-meals
Content-Type: application/json

{
  "recipe_id": 1,
  "portions": 4,
  "notes": "Congelado em potes individuais",
  "expiry_date": "2026-03-11"  // Opcional, padrão: 3 meses
}
```

### Consumir porções
```bash
POST /api/frozen-meals/<id>/consume
Content-Type: application/json

{
  "portions": 2
}
```

### Atualizar refeição congelada
```bash
PUT /api/frozen-meals/<id>
Content-Type: application/json

{
  "portions": 6,
  "notes": "Atualizado",
  "status": "thawed"
}
```

### Deletar refeição congelada
```bash
DELETE /api/frozen-meals/<id>
```

### Estatísticas
```bash
GET /api/frozen-meals/stats
```

**Retorna:**
- Total de refeições congeladas
- Total de porções congeladas
- Total de porções consumidas
- Total de porções restantes
- Contagem por status
- Refeições vencidas
- Refeições vencendo em breve (próximos 7 dias)

## 📝 Exemplo de Uso

### 1. Congelar porções de uma receita

Você fez molho de tomate e congelou 4 porções:

```bash
curl -X POST http://localhost:5000/api/frozen-meals \
  -H "Content-Type: application/json" \
  -d '{
    "recipe_id": 1,
    "portions": 4,
    "notes": "Congelado em potes de vidro de 250ml cada"
  }'
```

### 2. Ver todas as refeições congeladas

```bash
curl http://localhost:5000/api/frozen-meals
```

### 3. Consumir 2 porções

```bash
curl -X POST http://localhost:5000/api/frozen-meals/1/consume \
  -H "Content-Type: application/json" \
  -d '{"portions": 2}'
```

### 4. Ver estatísticas

```bash
curl http://localhost:5000/api/frozen-meals/stats
```

## 🗄️ Estrutura do Banco de Dados

### Tabela: `frozen_meals`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | Integer | ID único |
| recipe_id | Integer | ID da receita (FK) |
| portions | Integer | Quantidade de porções congeladas |
| frozen_at | DateTime | Data/hora do congelamento |
| expiry_date | Date | Data de validade (padrão: 3 meses) |
| consumed_at | DateTime | Quando foi consumido (se já foi) |
| consumed_portions | Integer | Porções já consumidas |
| notes | Text | Notas sobre preparo/congelamento |
| status | String | frozen, thawed, consumed |

## 💡 Casos de Uso

### Caso 1: Congelar sobras
Você fez uma receita grande e congelou as sobras:
- Registre o congelamento com a quantidade de porções
- O sistema calcula automaticamente a validade (3 meses)
- Você pode adicionar notas sobre como congelou

### Caso 2: Preparação em lote
Você preparou várias porções para congelar:
- Registre cada lote separadamente
- Cada lote tem sua própria data de validade
- Consuma porções conforme necessário

### Caso 3: Controle de validade
- O sistema alerta sobre refeições vencendo em breve
- Você pode ver todas as vencidas
- Consuma antes de vencer!

## 🔄 Integração com Outros Sistemas

### Com Histórico de Preparo
Quando você faz uma receita e congela porções:
1. A receita é registrada no histórico (como sempre)
2. Você pode então registrar o congelamento das porções
3. Ambos ficam vinculados à mesma receita

### Com Dashboard
O dashboard pode mostrar:
- Quantas refeições congeladas você tem
- Quais estão vencendo em breve
- Estatísticas de consumo

## ✅ Vantagens

1. **Organização**: Nunca mais esqueça o que tem no freezer
2. **Controle de validade**: Evite desperdício
3. **Planejamento**: Saiba quantas refeições prontas você tem
4. **Rastreabilidade**: Saiba quando cada coisa foi congelada
5. **Flexibilidade**: Consuma porções individuais conforme necessário

## 🎨 Próximos Passos (Frontend)

Para uma experiência completa, seria interessante criar:
- Página de "Refeições Congeladas" no frontend
- Cards mostrando cada refeição congelada
- Alertas visuais para vencendo/vencidas
- Botão para consumir porções
- Gráficos de estatísticas
