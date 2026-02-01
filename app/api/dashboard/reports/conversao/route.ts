
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

    // Buscar distribuição por status
    const statusCount = await prisma.lead.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const totalLeads = await prisma.lead.count();

    const conversaoData = statusCount.map((item: any) => {
      const count = item._count.status;
      const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
      
      let statusText = '';
      switch (item.status) {
        case 'NAO_CONTATADO':
          statusText = 'Não Contatado';
          break;
        case 'POTENCIAL':
          statusText = 'Contato Realizado';
          break;
        case 'EM_ANALISE':
          statusText = 'Qualificação';
          break;
        case 'PROCESSO_INICIADO':
          statusText = 'Proposta Enviada';
          break;
        case 'VALOR_RECUPERADO':
          statusText = 'Negociação';
          break;
        case 'CONTRATO_ASSINADO':
          statusText = 'Fechado Ganho';
          break;
        case 'PERDIDO':
          statusText = 'Fechado Perdido';
          break;
        default:
          statusText = item.status;
      }

      return {
        status: statusText,
        count,
        percentage
      };
    });

    return NextResponse.json(conversaoData);
  } catch (error) {
    console.error('Erro ao buscar dados de conversão:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
