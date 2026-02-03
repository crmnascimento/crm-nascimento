# CRM Nascimento & Advogados

Sistema de Gestão de Leads para Recuperação de Seguro Prestamista

## Sobre o Projeto

O CRM Nascimento é um sistema web desenvolvido para gerenciar leads de clientes potenciais para recuperação de seguro prestamista. O sistema permite o cadastro, acompanhamento e gestão de leads por vendedores, com supervisão da diretoria.

## Tecnologias Utilizadas

- **Frontend:** Next.js 14, React 18, TypeScript
- **Estilização:** Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes
- **Banco de Dados:** PostgreSQL com Prisma ORM
- **Autenticação:** NextAuth.js
- **Hospedagem:** Vercel

## Funcionalidades

- ✅ Autenticação de usuários (NextAuth.js)
- ✅ Dashboard executivo para diretoria
- ✅ Painel do vendedor
- ✅ Gestão completa de leads (CRUD)
- ✅ Gerenciamento de usuários
- ✅ Filtros por status e prioridade
- ✅ Busca de leads
- ✅ Importação de planilha Excel

## Instalação Local

```bash
# 1. Clonar o repositório
git clone https://github.com/crmnascimento/crm-nascimento.git
cd crm-nascimento

# 2. Instalar dependências
yarn install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com as credenciais corretas

# 4. Gerar cliente Prisma
npx prisma generate

# 5. Iniciar servidor de desenvolvimento
yarn dev
```

## Deploy

O sistema está configurado para deploy automático na Vercel. Qualquer push para a branch `main` dispara um novo deploy.

## Estrutura do Projeto

```
crm-nascimento/
├── app/                    # Páginas e rotas Next.js
├── components/             # Componentes React
├── lib/                    # Utilitários e configurações
├── prisma/                 # Schema do banco de dados
├── public/                 # Arquivos estáticos
└── scripts/                # Scripts de manutenção
```

## Variáveis de Ambiente

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://seu-dominio.vercel.app"
NEXTAUTH_SECRET="sua-chave-secreta"
```

## Licença

Propriedade de Nascimento & Advogados. Todos os direitos reservados.

---

**Última atualização:** Fevereiro 2026
