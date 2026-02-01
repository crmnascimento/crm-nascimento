const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

async function importExcelData() {
  try {
    console.log('Iniciando importação de dados do Excel...');

    // Ler arquivo Excel
    const filePath = path.join(__dirname, '../upload/Base_CRM_.xlsx');
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets['Base_Clientes_CRM'];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Encontrados ${data.length} clientes para importar`);

    // Processar cada cliente
    for (const row of data) {
      try {
        // Criar Lead
        const lead = await prisma.lead.create({
          data: {
            razaoSocial: row['Razão Social'] || 'Sem nome',
            nomeFantasia: row['Nome Fantasia'] || null,
            endereco: row['Endereço Completo'] || null,
            instituicoesFinanceiras: row['Instituição Financeira'] || null,
            contratosBancarios: row['Número do Contrato'] || null,
            valorEstimadoRecuperacao: row['Valor Potencial de Restituição'] ? parseFloat(row['Valor Potencial de Restituição']) : null,
            observacoes: row['Observação Geral'] || null,
            status: 'NAO_CONTATADO',
            prioridade: 'MEDIA',
            responsavelId: null,
          },
        });

        console.log(`✓ Lead criado: ${lead.razaoSocial}`);

        // Adicionar telefones comerciais
        const telefones = [];
        
        if (row['Telefone Comercial 1']) {
          telefones.push({
            numero: row['Telefone Comercial 1'],
            tipo: 'COMERCIAL',
            observacao: row['Obs Telefone Comercial 1'] || null,
          });
        }
        
        if (row['Telefone Comercial 2']) {
          telefones.push({
            numero: row['Telefone Comercial 2'],
            tipo: 'COMERCIAL',
            observacao: row['Obs Telefone Comercial 2'] || null,
          });
        }
        
        if (row['Telefone Comercial 3']) {
          telefones.push({
            numero: row['Telefone Comercial 3'],
            tipo: 'COMERCIAL',
            observacao: row['Obs Telefone Comercial 3'] || null,
          });
        }

        // Criar telefones
        for (const tel of telefones) {
          await prisma.telefone.create({
            data: {
              leadId: lead.id,
              numero: tel.numero,
              tipo: tel.tipo,
              observacao: tel.observacao,
              ativo: true,
            },
          });
        }

        console.log(`  ✓ ${telefones.length} telefone(s) comercial(is) adicionado(s)`);

        // Criar Sócio se houver dados
        if (row['Nome Sócio']) {
          const socio = await prisma.socio.create({
            data: {
              leadId: lead.id,
              nome: row['Nome Sócio'],
              cpf: row['CPF Sócio'] || null,
              dataNascimento: row['Ano Nascimento / Idade'] ? row['Ano Nascimento / Idade'].split(' – ')[0] : null,
              idade: row['Ano Nascimento / Idade'] ? parseInt(row['Ano Nascimento / Idade'].split(' – ')[1]) : null,
            },
          });

          console.log(`  ✓ Sócio criado: ${socio.nome}`);

          // Adicionar telefones do sócio
          const telefoneSocio = [];
          
          if (row['Telefone Sócio 1']) {
            telefoneSocio.push({
              numero: row['Telefone Sócio 1'],
              tipo: 'CELULAR',
              observacao: row['Obs Telefone Sócio 1'] || null,
            });
          }
          
          if (row['Telefone Sócio 2']) {
            telefoneSocio.push({
              numero: row['Telefone Sócio 2'],
              tipo: 'CELULAR',
              observacao: row['Obs Telefone Sócio 2'] || null,
            });
          }
          
          if (row['Telefone Sócio 3']) {
            telefoneSocio.push({
              numero: row['Telefone Sócio 3'],
              tipo: 'CELULAR',
              observacao: row['Obs Telefone Sócio 3'] || null,
            });
          }

          // Criar telefones do sócio
          for (const tel of telefoneSocio) {
            await prisma.telefonescio.create({
              data: {
                socioId: socio.id,
                numero: tel.numero,
                tipo: tel.tipo,
                observacao: tel.observacao,
                ativo: true,
              },
            });
          }

          console.log(`  ✓ ${telefoneSocio.length} telefone(s) do sócio adicionado(s)`);
        }

      } catch (error) {
        console.error(`✗ Erro ao importar cliente: ${error.message}`);
      }
    }

    console.log('\n✅ Importação concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante importação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importExcelData();
