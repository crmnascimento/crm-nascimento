
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateDomains() {
  try {
    console.log('🔧 Atualizando domínios de e-mail...\n')
    
    // Atualizar usuários existentes
    const users = await prisma.user.findMany()
    console.log(`👥 Encontrados ${users.length} usuários para atualizar:`)
    
    for (const user of users) {
      const oldEmail = user.email
      const newEmail = oldEmail.replace('@Nascimentoeadvogados.com', '@nascimentoeadvogados.com.br')
      
      if (oldEmail !== newEmail) {
        await prisma.user.update({
          where: { id: user.id },
          data: { email: newEmail }
        })
        console.log(`   ✅ ${oldEmail} → ${newEmail}`)
      } else {
        console.log(`   ⚠️  ${oldEmail} (sem alteração necessária)`)
      }
    }
    
    console.log('\n✅ Domínios atualizados com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao atualizar domínios:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateDomains()
