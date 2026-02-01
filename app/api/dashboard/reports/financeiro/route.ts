
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'DIRETORIA') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const meses = parseInt(searchParams.get('meses') || '6'); // Padrão: últimos 6 meses

    // Gerar dados dos últimos X meses
    const financeiroData = [];
    const now = new Date();

    for (let i = meses - 1; i >= 0; i--) {
      const dataInicio = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const dataFim = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      // Valor estimado total no mês
      const valorEstimado = await prisma.lead.aggregate({
        where: {
          createdAt: {
            gte: dataInicio,
            lte: dataFim
          }
        },
        _sum: {
          valorEstimadoRecuperacao: true
        }
      });

      // Valor fechado (contratos assinados) no mês
      const valorFechado = await prisma.lead.aggregate({
        where: {
          createdAt: {
            gte: dataInicio,
            lte: dataFim
          },
          contratoAssinado: true
        },
        _sum: {
          valorEstimadoRecuperacao: true
        }
      });

      // Valor perdido (status PERDIDO) no mês
      const valorPerdido = await prisma.lead.aggregate({
        where: {
          createdAt: {
            gte: dataInicio,
            lte: dataFim
          },
          status: 'PERDIDO'
        },
        _sum: {
          valorEstimadoRecuperacao: true
        }
      });

      const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const mes = `${nomesMeses[dataInicio.getMonth()]}/${dataInicio.getFullYear().toString().slice(-2)}`;

      financeiroData.push({
        mes,
        valorEstimado: Number(valorEstimado._sum.valorEstimadoRecuperacao) || 0,
        valorFechado: Number(valorFechado._sum.valorEstimadoRecuperacao) || 0,
        valorPerdido: Number(valorPerdido._sum.valorEstimadoRecuperacao) || 0
      });
    }

    return NextResponse.json(financeiroData);
  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
