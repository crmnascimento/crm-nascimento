
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCurrentData() {
  try {
    console.log('=== DADOS ATUAIS DO BANCO ===\n');
    
    // 1. Verificar usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });
    
    console.log('1. USUÁRIOS:');
    users.forEach((user: any) => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });
    
    // 2. Verificar total de leads
    const totalLeads = await prisma.lead.count();
    console.log(`\n2. TOTAL DE LEADS: ${totalLeads}`);
    
    // 3. Verificar total de interações
    const totalInteractions = await prisma.interaction.count();
    console.log(`\n3. TOTAL DE INTERAÇÕES: ${totalInteractions}`);
    
    // 4. Verificar status dos leads
    const leadStatuses = await prisma.lead.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });
    
    console.log('\n4. STATUS DOS LEADS:');
    leadStatuses.forEach((status: any) => {
      console.log(`   - ${status.status}: ${status._count.status} leads`);
    });
    
    // 5. Verificar leads com contratos assinados
    const contratosFechados = await prisma.lead.count({
      where: {
        contratoAssinado: true
      }
    });
    console.log(`\n5. CONTRATOS FECHADOS: ${contratosFechados}`);
    
    // 6. Verificar algumas interações como exemplo
    const sampleInteractions = await prisma.interaction.findMany({
      take: 3,
      include: {
        lead: {
          select: {
            razaoSocial: true
          }
        },
        user: {
          select: {
            name: true
          }
        }
      }
    });
    
    console.log('\n6. EXEMPLOS DE INTERAÇÕES:');
    sampleInteractions.forEach((interaction: any) => {
      console.log(`   - ${interaction.tipo} com ${interaction.lead.razaoSocial} por ${interaction.user.name}`);
    });
    
  } catch (error) {
    console.error('Erro ao consultar dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentData();
