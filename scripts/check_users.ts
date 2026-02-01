
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuários no banco...')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })
    
    console.log(`📊 Total de usuários: ${users.length}`)
    console.log('\n👥 Usuários encontrados:')
    users.forEach((user: any, index: number) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`)
    })
    
    const leads = await prisma.lead.count()
    console.log(`\n📋 Total de leads: ${leads}`)

    // Verificar se são os usuários específicos solicitados
    const usuariosEsperados = [
      'lana.pertele@nascimentoeadvogados.com.br',
      'heitor@nascimentoeadvogados.com.br',
      'arthur@nascimentoeadvogados.com.br', 
      'danilo@nascimentoeadvogados.com.br',
      'zadir@nascimentoeadvogados.com.br',
      'john@doe.com' // Demo account
    ];

    console.log('\n=== VERIFICAÇÃO DOS USUÁRIOS ESPERADOS ===');
    usuariosEsperados.forEach((email: string) => {
      const user = users.find((u: any) => u.email === email);
      if (user) {
        console.log(`✅ ${email} - ENCONTRADO (${user.name}, ${user.role})`);
      } else {
        console.log(`❌ ${email} - NÃO ENCONTRADO`);
      }
    });

    console.log('\n=== USUÁRIOS INCORRETOS (devem ser removidos) ===');
    users.forEach((user: any) => {
      if (!usuariosEsperados.includes(user.email)) {
        console.log(`⚠️  ${user.email} - ${user.name} (${user.role}) - DEVE SER REMOVIDO`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
