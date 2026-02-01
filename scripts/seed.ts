
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'

const prisma = new PrismaClient()

// Função para converter valor brasileiro para decimal
function convertBrazilianCurrencyToDecimal(value: string): number {
  if (!value || typeof value !== 'string') return 0
  
  // Remove "R$", espaços e pontos (milhares), substitui vírgula por ponto
  const cleanValue = value
    .replace(/R\$\s*/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim()
  
  const numericValue = parseFloat(cleanValue)
  return isNaN(numericValue) ? 0 : numericValue
}

// Mapear status da planilha para status do sistema
function mapStatus(originalStatus: string): string {
  const statusMap: { [key: string]: string } = {
    'Não Contatado': 'NAO_CONTATADO',
    'Potencial': 'POTENCIAL',
    'Em Análise': 'EM_ANALISE',
    'Em análise': 'EM_ANALISE'
  }
  
  return statusMap[originalStatus] || 'NAO_CONTATADO'
}

async function main() {
  console.log('🧹 Limpando banco de dados...')
  
  // Limpar dados existentes
  await prisma.interaction.deleteMany({})
  await prisma.lead.deleteMany({})
  await prisma.user.deleteMany({})
  
  console.log('👥 Criando usuários específicos da equipe...')
  
  // Hash para senhas
  const hashedPassword = await bcrypt.hash('nascimento2025', 10)
  const demoPassword = await bcrypt.hash('johndoe123', 10)
  
  // Criar Lana Pertele - Vendedora
  const lana = await prisma.user.create({
    data: {
      email: 'lana.pertele@nascimentoeadvogados.com.br',
      name: 'Lana Pertele',
      password: hashedPassword,
      role: 'VENDEDOR'
    }
  })
  
  // Criar Heitor - Vendedor
  const heitor = await prisma.user.create({
    data: {
      email: 'heitor@nascimentoeadvogados.com.br', 
      name: 'Heitor Nascimento',
      password: hashedPassword,
      role: 'VENDEDOR'
    }
  })
  
  // Criar Arthur - Vendedor
  const arthur = await prisma.user.create({
    data: {
      email: 'arthur@nascimentoeadvogados.com.br',
      name: 'Arthur Nascimento',
      password: hashedPassword,
      role: 'VENDEDOR'
    }
  })
  
  // Criar Danilo - Vendedor
  const danilo = await prisma.user.create({
    data: {
      email: 'danilo@nascimentoeadvogados.com.br',
      name: 'Danilo Nascimento',
      password: hashedPassword,
      role: 'VENDEDOR'
    }
  })
  
  // Criar Zadir - Diretoria 
  const zadir = await prisma.user.create({
    data: {
      email: 'zadir@nascimentoeadvogados.com.br',
      name: 'Zadir Nascimento',
      password: hashedPassword,
      role: 'DIRETORIA'
    }
  })
  
  // Criar conta demo John Doe - Admin/Diretoria
  const johnDoe = await prisma.user.create({
    data: {
      email: 'john@doe.com',
      name: 'John Doe',
      password: demoPassword,
      role: 'DIRETORIA'
    }
  })
  
  console.log('📊 Carregando dados da planilha original...')
  
  // Carregar dados da planilha original
  const rawData = fs.readFileSync('./scripts/leads_originais.json', 'utf8')
  const leadsData = JSON.parse(rawData)
  
  console.log(`📝 Importando ${leadsData.length} leads da planilha original...`)
  
  // Array com todos os vendedores para distribuição
  const todosVendedores = [lana, heitor, arthur, danilo];
  
  // Importar leads da planilha original
  for (let index = 0; index < leadsData.length; index++) {
    const leadData = leadsData[index];
    const valorEstimado = convertBrazilianCurrencyToDecimal(leadData['Valor Estimado Recuperação'])
    const status = mapStatus(leadData['Status'])
    const prioridade = leadData['Prioridade']?.toLowerCase() === 'alta' ? 'ALTA' : 'MEDIA'
    
    // Distribuir leads entre os vendedores (distribuição mais realista)
    const responsavelVendedor = todosVendedores[index % todosVendedores.length];
    
    // Criar o lead
    const lead = await prisma.lead.create({
      data: {
        razaoSocial: leadData['Razão Social'] || '',
        nomeFantasia: leadData['Nome Fantasia'] || null,
        cnpj: leadData['CNPJ'] || null,
        setor: leadData['Setor'] || null,
        endereco: leadData['Endereço'] || null,
        bairro: leadData['Bairro'] || null,
        municipio: leadData['Município'] || null,
        uf: leadData['UF'] || null,
        cep: leadData['CEP'] || null,
        telefonePrincipal: leadData['Telefone Principal'] || null,
        telefoneSecundario: leadData['Telefone Secundário'] || null,
        email: leadData['E-mail'] || null,
        valorEstimadoRecuperacao: valorEstimado,
        status: status as any,
        prioridade: prioridade as any,
        observacoes: leadData['Observações'] || null,
        observacoesContato: leadData['Observações de Contato'] || null,
        responsavelId: responsavelVendedor.id
      }
    })
    
    // Criar interação inicial se houver observações de contato
    if (leadData['Observações de Contato']) {
      await prisma.interaction.create({
        data: {
          leadId: lead.id,
          userId: responsavelVendedor.id,
          tipo: 'OBSERVACAO',
          descricao: leadData['Observações de Contato']
        }
      })
    }
  }
  
  console.log('✅ Seed executado com sucesso!')
  console.log(`📋 Total de leads importados: ${leadsData.length}`)
  
  // Verificação final
  const totalLeads = await prisma.lead.count()
  const totalUsers = await prisma.user.count()
  
  console.log('\n📊 RESUMO FINAL:')
  console.log(`👥 Usuários criados: ${totalUsers}`)
  console.log(`📝 Leads importados: ${totalLeads}`)
  
  // Calcular valor total
  const leads = await prisma.lead.findMany()
  const valorTotal = leads.reduce((sum: number, lead: any) => sum + (lead.valorEstimadoRecuperacao?.toNumber() || 0), 0)
  
  console.log(`💰 Valor total em negociação: R$ ${valorTotal.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`)
  
  console.log('\n🔐 CREDENCIAIS DE ACESSO:')
  console.log('\n👥 VENDEDORES (Senha: nascimento2025):')
  console.log('• Lana Pertele: lana.pertele@nascimentoeadvogados.com.br')
  console.log('• Heitor: heitor@nascimentoeadvogados.com.br') 
  console.log('• Arthur: arthur@nascimentoeadvogados.com.br')
  console.log('• Danilo: danilo@nascimentoeadvogados.com.br')
  console.log('\n🏢 DIRETORIA (Senha: nascimento2025):')
  console.log('• Zadir: zadir@nascimentoeadvogados.com.br')
  console.log('\n🎭 DEMO ACCOUNT (Senha: johndoe123):')
  console.log('• John Doe: john@doe.com')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
