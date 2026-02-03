const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Populando banco de dados com dados de teste...\n');
  
  try {
    // Buscar usuários existentes
    let user2 = await prisma.user.findUnique({
      where: { email: 'vendedor@nascimento.com' }
    });
    
    if (!user2) {
      const hashedPassword2 = await bcrypt.hash('vendedor123', 10);
      user2 = await prisma.user.create({
        data: {
          email: 'vendedor@nascimento.com',
          name: 'Vendedor Teste',
          password: hashedPassword2,
          role: 'VENDEDOR',
        },
      });
    }
    
    console.log('✅ Usuário vendedor verificado');
    
    // Dados de leads para teste
    const leadsData = [
      {
        razaoSocial: 'Banco Bradesco S.A.',
        nomeFantasia: 'Bradesco',
        cnpj: '60.746.948/0001-12',
        setor: 'Financeiro',
        porte: 'Grande',
        endereco: 'Av. Paulista, 1000',
        municipio: 'São Paulo',
        uf: 'SP',
        cep: '01311-100',
        telefonePrincipal: '11 3001-1000',
        email: 'contato@bradesco.com.br',
        status: 'POTENCIAL',
        prioridade: 'ALTA',
        valorEstimadoRecuperacao: 500000.00,
      },
      {
        razaoSocial: 'Itaú Unibanco S.A.',
        nomeFantasia: 'Itaú',
        cnpj: '60.872.504/0001-23',
        setor: 'Financeiro',
        porte: 'Grande',
        endereco: 'Av. Getúlio Vargas, 1345',
        municipio: 'São Paulo',
        uf: 'SP',
        cep: '01310-100',
        telefonePrincipal: '11 3003-1000',
        email: 'contato@itau.com.br',
        status: 'POTENCIAL',
        prioridade: 'ALTA',
        valorEstimadoRecuperacao: 750000.00,
      },
      {
        razaoSocial: 'Caixa Econômica Federal',
        nomeFantasia: 'Caixa',
        cnpj: '04.823.979/0001-14',
        setor: 'Financeiro',
        porte: 'Grande',
        endereco: 'SCES Trecho 2, Bloco P',
        municipio: 'Brasília',
        uf: 'DF',
        cep: '70200-002',
        telefonePrincipal: '61 3206-1111',
        email: 'contato@caixa.gov.br',
        status: 'EM_ANALISE',
        prioridade: 'ALTA',
        valorEstimadoRecuperacao: 1000000.00,
      },
      {
        razaoSocial: 'Banco do Brasil S.A.',
        nomeFantasia: 'Banco do Brasil',
        cnpj: '00.000.000/0001-91',
        setor: 'Financeiro',
        porte: 'Grande',
        endereco: 'Setor Bancário Sul, Quadra 3',
        municipio: 'Brasília',
        uf: 'DF',
        cep: '70070-900',
        telefonePrincipal: '61 3310-1111',
        email: 'contato@bb.com.br',
        status: 'NAO_CONTATADO',
        prioridade: 'MEDIA',
        valorEstimadoRecuperacao: 600000.00,
      },
      {
        razaoSocial: 'Santander Brasil S.A.',
        nomeFantasia: 'Santander',
        cnpj: '90.360.305/0001-04',
        setor: 'Financeiro',
        porte: 'Grande',
        endereco: 'Rua Bandeira, 702',
        municipio: 'São Paulo',
        uf: 'SP',
        cep: '01310-100',
        telefonePrincipal: '11 3553-1000',
        email: 'contato@santander.com.br',
        status: 'EM_ANALISE',
        prioridade: 'ALTA',
        valorEstimadoRecuperacao: 800000.00,
      },
      {
        razaoSocial: 'Empresa XYZ Serviços Ltda',
        nomeFantasia: 'XYZ Serviços',
        cnpj: '12.345.678/0001-90',
        setor: 'Serviços',
        porte: 'Médio',
        endereco: 'Rua das Flores, 456',
        municipio: 'Rio de Janeiro',
        uf: 'RJ',
        cep: '20000-000',
        telefonePrincipal: '21 3333-4444',
        email: 'contato@xyz.com.br',
        status: 'POTENCIAL',
        prioridade: 'MEDIA',
        valorEstimadoRecuperacao: 150000.00,
      },
      {
        razaoSocial: 'Comércio ABC S.A.',
        nomeFantasia: 'ABC Comércio',
        cnpj: '98.765.432/0001-10',
        setor: 'Comércio',
        porte: 'Pequeno',
        endereco: 'Av. Principal, 789',
        municipio: 'Belo Horizonte',
        uf: 'MG',
        cep: '30000-000',
        telefonePrincipal: '31 2222-3333',
        email: 'contato@abc.com.br',
        status: 'NAO_CONTATADO',
        prioridade: 'BAIXA',
        valorEstimadoRecuperacao: 50000.00,
      },
      {
        razaoSocial: 'Indústria Moderna Ltda',
        nomeFantasia: 'Indústria Moderna',
        cnpj: '55.555.555/0001-55',
        setor: 'Indústria',
        porte: 'Grande',
        endereco: 'Estrada Industrial, 1000',
        municipio: 'Campinas',
        uf: 'SP',
        cep: '13000-000',
        telefonePrincipal: '19 4444-5555',
        email: 'contato@moderna.com.br',
        status: 'POTENCIAL',
        prioridade: 'ALTA',
        valorEstimadoRecuperacao: 300000.00,
      },
    ];
    
    // Criar leads
    console.log('\n📊 Criando leads...');
    const createdLeads = [];
    for (const leadData of leadsData) {
      const lead = await prisma.lead.create({
        data: {
          ...leadData,
          responsavelId: user2.id,
        },
      });
      createdLeads.push(lead);
      console.log(`  ✓ ${lead.razaoSocial}`);
    }
    
    // Criar interações para alguns leads
    console.log('\n💬 Criando interações...');
    const tiposInteracao = ['LIGACAO', 'EMAIL', 'WHATSAPP', 'REUNIAO', 'PROPOSTA'];
    
    for (let i = 0; i < Math.min(5, createdLeads.length); i++) {
      const lead = createdLeads[i];
      const numInteracoes = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < numInteracoes; j++) {
        const tipo = tiposInteracao[Math.floor(Math.random() * tiposInteracao.length)];
        const dataContato = new Date();
        dataContato.setDate(dataContato.getDate() - Math.floor(Math.random() * 30));
        
        await prisma.interaction.create({
          data: {
            leadId: lead.id,
            tipo,
            descricao: `Contato via ${tipo} - Discussão sobre recuperação de valores`,
            dataContato,
            userId: user2.id,
          },
        });
      }
      console.log(`  ✓ ${numInteracoes} interação(ões) para ${lead.razaoSocial}`);
    }
    
    console.log('\n🎉 Dados de teste populados com sucesso!');
    console.log(`\n📈 Resumo:`);
    console.log(`  • ${createdLeads.length} leads criados`);
    console.log(`  • Valores totais em negociação: R$ ${leadsData.reduce((sum, l) => sum + (l.valorEstimadoRecuperacao || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    console.log(`  • Interações criadas para análise`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
