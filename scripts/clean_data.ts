
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanData() {
  try {
    console.log('=== INICIANDO LIMPEZA DOS DADOS ===\n');
    
    // 1. Deletar todas as interações fictícias
    console.log('1. Deletando todas as interações fictícias...');
    const deletedInteractions = await prisma.interaction.deleteMany({});
    console.log(`   ✅ ${deletedInteractions.count} interações deletadas\n`);
    
    // 2. Alterar nome do vendedor de "Equipe Comercial" para "Vendedor 01"
    console.log('2. Alterando nome do vendedor...');
    const updatedVendedor = await prisma.user.updateMany({
      where: {
        role: 'VENDEDOR',
        email: 'vendedor@nascimentoeadvogados.com.br'
      },
      data: {
        name: 'Vendedor 01'
      }
    });
    console.log(`   ✅ ${updatedVendedor.count} vendedor(es) atualizado(s)\n`);
    
    // 3. Resetar status de todos os leads para "NAO_CONTATADO"
    console.log('3. Resetando status de todos os leads...');
    const updatedLeads = await prisma.lead.updateMany({
      data: {
        status: 'NAO_CONTATADO',
        dataPrimeiroContato: null,
        dataUltimoContato: null,
        proximaAcao: null,
        dataProximaAcao: null,
        contratoAssinado: false,
        dataAssinatura: null,
        valorContrato: null,
        formaPagamento: null,
        statusProcesso: null,
        valorRecuperado: null,
        comissaoGerada: null
      }
    });
    console.log(`   ✅ ${updatedLeads.count} leads resetados para estado inicial\n`);
    
    // 4. Deletar todas as atividades relacionadas
    console.log('4. Deletando atividades de histórico...');
    const deletedActivities = await prisma.activity.deleteMany({});
    console.log(`   ✅ ${deletedActivities.count} atividades deletadas\n`);
    
    // 5. Deletar todos os lembretes
    console.log('5. Deletando lembretes...');
    const deletedReminders = await prisma.reminder.deleteMany({});
    console.log(`   ✅ ${deletedReminders.count} lembretes deletados\n`);
    
    console.log('=== LIMPEZA CONCLUÍDA COM SUCESSO ===');
    console.log('📊 Resumo das alterações:');
    console.log(`   • ${deletedInteractions.count} interações removidas`);
    console.log(`   • ${updatedVendedor.count} vendedor renomeado para "Vendedor 01"`);
    console.log(`   • ${updatedLeads.count} leads resetados para "NAO_CONTATADO"`);
    console.log(`   • ${deletedActivities.count} atividades removidas`);
    console.log(`   • ${deletedReminders.count} lembretes removidos`);
    console.log('\n✅ Todos os dados fictícios foram removidos!');
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanData();
