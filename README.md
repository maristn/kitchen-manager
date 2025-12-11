# Kitchen Manager 🍳

Sistema completo de gerenciamento de cozinha com controle de ingredientes, receitas, lista de compras automática e histórico de preparo.

## 🎯 Funcionalidades

### ✅ Gestão de Ingredientes
- Adicionar, editar e remover ingredientes
- Controle de quantidade e unidade de medida
- Categorias (Vegetais, Frutas, Laticínios, Carnes, etc.)
- Locais de armazenamento (Geladeira, Freezer, Despensa, Bancada)
- Controle de validade com alertas
- Quantidade mínima configurável (para lista de compras)
- Filtros por categoria e local

### 🍲 Gestão de Receitas
- Criar e editar receitas com ingredientes
- Tempo de preparo e cozimento
- Verificação automática de disponibilidade
- Indicador visual de receitas que você pode fazer
- Ajuste de porções ao fazer receita
- Lista de ingredientes faltantes

### 🎨 Fazer Receita (Funcionalidade Principal)
- Modal interativo para fazer receitas
- Ajuste de porções com recálculo automático de quantidades
- Validação de ingredientes disponíveis
- **Dedução automática do estoque** ao confirmar
- **Adição automática à lista de compras** quando ingrediente chega a zero
- Criação automática de registro no histórico
- Notas opcionais

### 🛒 Lista de Compras Automática
- Adiciona automaticamente quando ingrediente vai a zero
- Adiciona quando quantidade fica abaixo do mínimo
- Botão "Verificar Estoque" para adicionar todos os itens baixos
- Marcar como comprado (com opção de adicionar ao estoque)
- Visualização separada: pendentes vs comprados
- Remover itens da lista

### 📊 Histórico
- Registro completo de todas as receitas feitas
- Data, horário e porções
- Notas sobre o preparo
- Estatísticas: total, semana, mês
- Receitas mais feitas
- Filtros por período
- Timeline agrupada por data

### 📈 Dashboard
- Visão geral com estatísticas
- Alertas de ingredientes vencendo
- Alertas de estoque baixo
- Receitas disponíveis para fazer agora
- Atividade recente
- Cards com informações principais

## 🛠️ Tecnologias

### Backend
- **Flask** - Framework web Python
- **SQLAlchemy** - ORM para banco de dados
- **SQLite** - Banco de dados (arquivo local, zero configuração)
- **Flask-CORS** - Suporte CORS para API REST

### Frontend
- **React** - Library JavaScript
- **Vite** - Build tool (rápido e moderno)
- **React Router** - Navegação entre páginas
- **Tailwind CSS** - Framework CSS utility-first
- **Lucide React** - Ícones modernos
- **Axios** - Cliente HTTP

## 📦 Instalação

### Pré-requisitos
- Python 3.8+ 
- Node.js 16+ e npm
- Terminal/Linha de comando

### 1. Clonar/Baixar o Projeto

Se você baixou como ZIP, extraia para uma pasta. Ou clone:

```bash
cd /Users/anacarol/code/german-vibecode
```

### 2. Configurar Backend

```bash
# Entrar na pasta do backend
cd backend

# Criar ambiente virtual Python
python3 -m venv venv

# Ativar ambiente virtual
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt
```

### 3. Configurar Frontend

Abra um **novo terminal** (mantenha o do backend aberto):

```bash
# Entrar na pasta do frontend
cd frontend

# Instalar dependências
npm install
```

## 🚀 Como Executar

Você precisa rodar **dois terminais simultaneamente**: um para o backend e outro para o frontend.

### Terminal 1: Backend (API)

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python app.py
```

O backend estará rodando em: **http://localhost:5000**

Você verá:
```
Kitchen Manager API Server
======================================
Server running on http://localhost:5000
Press CTRL+C to stop
```

### Terminal 2: Frontend (Interface)

```bash
cd frontend
npm run dev
```

O frontend estará rodando em: **http://localhost:5173**

Você verá:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 4. Acessar a Aplicação

Abra seu navegador e acesse: **http://localhost:5173**

## 📖 Como Usar

### 1. Adicionar Ingredientes

1. Clique em "Ingredientes" no menu
2. Clique em "Adicionar Ingrediente"
3. Preencha:
   - Nome (ex: Farinha de Trigo)
   - Quantidade atual (ex: 500)
   - Unidade (ex: g)
   - Quantidade mínima (ex: 100) - para lista de compras
   - Categoria, Local, Validade (opcionais)
4. Clique em "Adicionar Ingrediente"

### 2. Criar Receitas

1. Clique em "Receitas" no menu
2. Clique em "Criar Receita"
3. Preencha:
   - Nome da receita
   - Instruções
   - Porções, tempo de preparo e cozimento
4. Adicione ingredientes:
   - Clique em "+ Adicionar Ingrediente"
   - Selecione o ingrediente
   - Digite a quantidade necessária
   - Digite a unidade
5. Clique em "Criar Receita"

### 3. Fazer uma Receita

1. Entre na receita (clique no card ou vá em Receitas > selecione uma)
2. Veja o status: ✅ Pode fazer ou ⚠️ Faltam ingredientes
3. Clique em "Fazer Receita"
4. No modal:
   - Ajuste o número de porções (recalcula automaticamente)
   - Veja o status de cada ingrediente
   - Adicione notas opcionais
5. Clique em "Fazer Receita"
6. **Automaticamente**:
   - Ingredientes são deduzidos do estoque
   - Se algum chegar a zero, vai para lista de compras
   - Registro criado no histórico

### 4. Gerenciar Lista de Compras

1. Clique em "Lista de Compras"
2. Visualize itens pendentes
3. Opções:
   - **Verificar Estoque**: adiciona todos com estoque baixo
   - **Adicionar Item**: adicionar manualmente
   - **✓ Marcar comprado**: marca como comprado E adiciona ao estoque
   - **X Remover**: remove da lista

### 5. Ver Histórico

1. Clique em "Histórico"
2. Veja:
   - Estatísticas (total, semana, mês)
   - Receitas mais feitas
   - Timeline de receitas por data
3. Filtre por período: últimos 7 dias, 30 dias, todo período

## 🎨 Estrutura do Projeto

```
german-vibecode/
├── backend/
│   ├── app.py                 # Servidor Flask principal
│   ├── models.py              # Modelos do banco de dados
│   ├── routes/
│   │   ├── ingredients.py     # API de ingredientes
│   │   ├── recipes.py         # API de receitas
│   │   ├── shopping.py        # API de lista de compras
│   │   └── history.py         # API de histórico
│   ├── database.db            # Banco SQLite (criado automaticamente)
│   └── requirements.txt       # Dependências Python
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── pages/             # Páginas da aplicação
│   │   ├── services/          # API client (Axios)
│   │   ├── App.jsx            # Componente raiz
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🔄 Fluxo de Dedução Automática

### Exemplo: Fazer Bolo de Chocolate (8 porções)

**Estoque Atual:**
- Farinha: 500g
- Açúcar: 300g
- Chocolate: 30g

**Receita (8 porções):**
- Farinha: 200g
- Açúcar: 100g
- Chocolate: 50g

**Usuário decide fazer 4 porções:**

1. Sistema calcula: 
   - Farinha: 100g (200g / 8 * 4)
   - Açúcar: 50g
   - Chocolate: 25g

2. Sistema verifica:
   - ✅ Farinha: tem 500g, precisa 100g = OK
   - ✅ Açúcar: tem 300g, precisa 50g = OK
   - ❌ Chocolate: tem 30g, precisa 25g, mas estoque mínimo é 50g

3. Usuário confirma (ou ajusta para 2 porções)

4. Sistema executa:
   - Farinha: 500g → 450g
   - Açúcar: 300g → 275g  
   - Chocolate: 30g → 17.5g → **vai para lista de compras** (abaixo do mínimo)
   - Cria histórico: "Bolo de Chocolate - 2 porções - 10/12/2025 15:30"

## 🔧 Solução de Problemas

### Backend não inicia

```bash
# Certifique-se de estar no ambiente virtual
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate

# Reinstale dependências
pip install -r requirements.txt

# Execute novamente
python app.py
```

### Frontend não inicia

```bash
# Limpe cache e reinstale
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Erro de CORS

Certifique-se de que:
1. Backend está rodando em `http://localhost:5000`
2. Frontend está rodando em `http://localhost:5173`
3. Acesse pelo `localhost:5173`, não pelo IP

### Banco de dados corrompido

```bash
cd backend
rm database.db
python app.py  # Recria automaticamente
```

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:
- 💻 Desktop (melhor experiência)
- 📱 Tablet
- 📱 Mobile

## 🎯 Próximas Funcionalidades (Sugestões)

- [ ] Importar/exportar receitas (JSON/CSV)
- [ ] Fotos de receitas
- [ ] Busca avançada de receitas por ingredientes
- [ ] Sugestões de receitas baseadas no estoque
- [ ] Integração com APIs de receitas
- [ ] Modo escuro
- [ ] Impressão de receitas
- [ ] Compartilhamento de receitas
- [ ] Tags/labels para receitas
- [ ] Calculadora nutricional

## 📄 Licença

Projeto pessoal - Use como quiser!

## 🤝 Contribuindo

Este é um projeto pessoal, mas sinta-se livre para fazer fork e adaptar às suas necessidades!

---

**Desenvolvido com ❤️ para facilitar o gerenciamento da sua cozinha!**

Para dúvidas ou problemas, consulte a documentação ou verifique os logs do terminal.
