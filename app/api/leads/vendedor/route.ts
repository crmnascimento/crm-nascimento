
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar leads atribuídos ao vendedor logado
    const leadsData = await prisma.lead.findMany({
      where: {
        responsavelId: session.user.id,
      },
      select: {
        id: true,
        razaoSocial: true,
        nomeFantasia: true,
        telefonePrincipal: true,
        email: true,
        valorEstimadoRecuperacao: true,
        status: true,
        prioridade: true,
        dataProximaAcao: true,
        proximaAcao: true,
        municipio: true,
        uf: true,
        instituicoesFinanceiras: true,
        updatedAt: true,
      },
      orderBy: [
        { prioridade: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    // Converter Decimal para Number para evitar problemas de serialização
    const leads = leadsData.map(lead => ({
      ...lead,
      valorEstimadoRecuperacao: lead.valorEstimadoRecuperacao 
        ? Number(lead.valorEstimadoRecuperacao) 
        : null
    }));

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Erro ao buscar leads do vendedor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
