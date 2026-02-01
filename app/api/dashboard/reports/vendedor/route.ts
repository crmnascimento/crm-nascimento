
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'DIRETORIA') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Buscar todos os vendedores com suas estatísticas
    const vendedores = await prisma.user.findMany({
      where: {
        role: 'VENDEDOR'
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    const vendedorPerformance = [];

    for (const vendedor of vendedores) {
      // Leads do vendedor
      const totalLeads = await prisma.lead.count({
        where: {
          responsavelId: vendedor.id
        }
      });

      // Leads contatados (não são NAO_CONTATADO)
      const leadsContatados = await prisma.lead.count({
        where: {
          responsavelId: vendedor.id,
          status: {
            not: 'NAO_CONTATADO'
          }
        }
      });

      // Contratos fechados
      const contratosFechados = await prisma.lead.count({
        where: {
          responsavelId: vendedor.id,
          contratoAssinado: true
        }
      });

      // Valor total dos leads do vendedor
      const valorTotal = await prisma.lead.aggregate({
        where: {
          responsavelId: vendedor.id
        },
        _sum: {
          valorEstimadoRecuperacao: true
        }
      });

      // Valor fechado (contratos assinados)
      const valorFechado = await prisma.lead.aggregate({
        where: {
          responsavelId: vendedor.id,
          contratoAssinado: true
        },
        _sum: {
          valorEstimadoRecuperacao: true
        }
      });

      // Interações do vendedor (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const interacoes = await prisma.interaction.count({
        where: {
          userId: vendedor.id,
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      });

      // Última atividade
      const ultimaInteracao = await prisma.interaction.findFirst({
        where: {
          userId: vendedor.id
        },
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          createdAt: true
        }
      });

      // Taxa de conversão
      const taxaConversao = totalLeads > 0 ? (contratosFechados / totalLeads) * 100 : 0;

      vendedorPerformance.push({
        vendedorId: vendedor.id,
        vendedorName: vendedor.name,
        totalLeads,
        leadsContatados,
        contratosFechados,
        valorTotal: Number(valorTotal._sum.valorEstimadoRecuperacao) || 0,
        valorFechado: Number(valorFechado._sum.valorEstimadoRecuperacao) || 0,
        interacoes,
        taxaConversao,
        ultimaAtividade: ultimaInteracao?.createdAt?.toISOString() || new Date().toISOString()
      });
    }

    return NextResponse.json(vendedorPerformance);
  } catch (error) {
    console.error('Erro ao buscar performance do vendedor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
