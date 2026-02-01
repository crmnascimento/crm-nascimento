
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCurrentState() {
  try {
    console.log('🔍 Verificando estado atual do banco de dados...\n')
    
    // Verificar usuários
    const users = await prisma.user.findMany()
    console.log(`👥 USUÁRIOS (${users.length}):`)
    users.forEach((user: any) => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`)
    })
    
    // Verificar leads
    const leads = await prisma.lead.findMany({
      include: {
        responsavel: true,
        interactions: true,
        activities: true
      }
    })
    console.log(`\n📊 LEADS (${leads.length}):`)
    leads.slice(0, 5).forEach((lead: any) => {
      console.log(`   - ${lead.razaoSocial} - Status: ${lead.status} - Responsável: ${lead.responsavel?.name || 'Não atribuído'}`)
    })
    if (leads.length > 5) {
      console.log(`   ... e mais ${leads.length - 5} leads`)
    }
    
    // Verificar interactions
    const interactions = await prisma.interaction.findMany()
    console.log(`\n💬 INTERAÇÕES (${interactions.length}):`)
    interactions.slice(0, 3).forEach((interaction: any) => {
      console.log(`   - ${interaction.tipo} - ${interaction.descricao.substring(0, 50)}...`)
    })
    if (interactions.length > 3) {
      console.log(`   ... e mais ${interactions.length - 3} interações`)
    }
    
    // Verificar activities
    const activities = await prisma.activity.findMany()
    console.log(`\n📝 ATIVIDADES (${activities.length}):`)
    activities.slice(0, 3).forEach((activity: any) => {
      console.log(`   - ${activity.tipo} - ${activity.descricao}`)
    })
    if (activities.length > 3) {
      console.log(`   ... e mais ${activities.length - 3} atividades`)
    }
    
    // Estatísticas por status
    const statusStats = await prisma.lead.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })
    console.log(`\n📈 LEADS POR STATUS:`)
    statusStats.forEach((stat: any) => {
      console.log(`   - ${stat.status}: ${stat._count.id}`)
    })
    
    console.log('\n✅ Verificação concluída!')
    
  } catch (error) {
    console.error('❌ Erro ao verificar estado:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCurrentState()
