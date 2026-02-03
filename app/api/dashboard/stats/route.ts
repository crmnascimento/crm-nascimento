
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

    // Estatísticas gerais
    const totalLeads = await prisma.lead.count();
    
    const totalValue = await prisma.lead.aggregate({
      _sum: {
        valorEstimadoRecuperacao: true,
      },
    });

    const leadsPerStatus = await prisma.lead.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const leadsPerPriority = await prisma.lead.groupBy({
      by: ['prioridade'],
      _count: {
        prioridade: true,
      },
    });

    const leadsPerBank = await prisma.lead.groupBy({
      by: ['instituicoesFinanceiras'],
      _count: {
        instituicoesFinanceiras: true,
      },
      where: {
        instituicoesFinanceiras: {
          not: null,
        },
      },
      orderBy: {
        _count: {
          instituicoesFinanceiras: 'desc',
        },
      },
      take: 10,
    });

    // Conversão rate (contratos assinados / total de leads)
    const contractedLeads = await prisma.lead.count({
      where: {
        contratoAssinado: true,
      },
    });

    const conversionRate = totalLeads > 0 ? (contractedLeads / totalLeads) * 100 : 0;

    // Leads criados nos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentLeads = await prisma.lead.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Interações dos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentInteractions = await prisma.interaction.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    return NextResponse.json({
      totalLeads,
      totalValue: totalValue._sum.valorEstimadoRecuperacao 
        ? Number(totalValue._sum.valorEstimadoRecuperacao) 
        : 0,
      conversionRate,
      contractedLeads,
      recentLeads,
      recentInteractions,
      leadsPerStatus: leadsPerStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      leadsPerPriority: leadsPerPriority.map(item => ({
        priority: item.prioridade,
        count: item._count.prioridade,
      })),
      leadsPerBank: leadsPerBank.map(item => ({
        bank: item.instituicoesFinanceiras,
        count: item._count.instituicoesFinanceiras,
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
