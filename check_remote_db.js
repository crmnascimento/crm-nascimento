const { Client } = require('pg');

const client = new Client({
  host: 'db-11aee655c7.db001.hosteddb.reai.io',
  port: 5432,
  database: '11aee655c7',
  user: 'role_11aee655c7',
  password: 'CAYUs2qSp3cvhLRiPCAeDmo56bDFQy99',
});

async function main() {
  try {
    await client.connect();
    console.log('✅ Conectado ao banco remoto!');
    
    // Verificar quantos leads existem
    const leads = await client.query('SELECT COUNT(*) as count FROM "Lead"');
    console.log(`📊 Total de Leads: ${leads.rows[0].count}`);
    
    // Verificar quantos usuários existem
    const users = await client.query('SELECT COUNT(*) as count FROM "User"');
    console.log(`👥 Total de Usuários: ${users.rows[0].count}`);
    
    // Verificar quantas interações existem
    const interactions = await client.query('SELECT COUNT(*) as count FROM "Interaction"');
    console.log(`💬 Total de Interações: ${interactions.rows[0].count}`);
    
    // Mostrar alguns leads
    if (leads.rows[0].count > 0) {
      console.log('\n📋 Primeiros 5 leads:');
      const leadsList = await client.query('SELECT id, "razaoSocial", "nomeFantasia", email FROM "Lead" LIMIT 5');
      leadsList.rows.forEach((lead, i) => {
        console.log(`  ${i+1}. ${lead.razaoSocial || lead.nomeFantasia} (${lead.email})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

main();
