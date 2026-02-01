const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpando banco de dados...');
  
  try {
    // Criar usuários
    const hashedPassword = await bcrypt.hash('johndoe123', 10);
    
    const user1 = await prisma.user.create({
      data: {
        email: 'john@doe.com',
        name: 'John Doe',
        password: hashedPassword,
        role: 'DIRETORIA',
      },
    });
    
    console.log('✅ Usuário criado:', user1.email);
    
    const hashedPassword2 = await bcrypt.hash('vendedor123', 10);
    const user2 = await prisma.user.create({
      data: {
        email: 'vendedor@nascimento.com',
        name: 'Vendedor Teste',
        password: hashedPassword2,
        role: 'VENDEDOR',
      },
    });
    
    console.log('✅ Vendedor criado:', user2.email);
    
    // Criar alguns leads de exemplo
    const lead1 = await prisma.lead.create({
      data: {
        nomeCliente: 'Cliente Teste 1',
        emailCliente: 'cliente1@email.com',
        telefoneCliente: '11999999999',
        seguradora: 'Banco XYZ',
        status: 'NOVO',
        prioridade: 'ALTA',
        vendedorId: user2.id,
      },
    });
    
    console.log('✅ Lead criado:', lead1.nomeCliente);
    
    console.log('\n🎉 Banco de dados populado com sucesso!');
    console.log('\n📝 Credenciais de acesso:');
    console.log('  Diretoria: john@doe.com / johndoe123');
    console.log('  Vendedor: vendedor@nascimento.com / vendedor123');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
