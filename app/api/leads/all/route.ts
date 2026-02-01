
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

    // Buscar todos os leads com dados do responsável
    const leadsData = await prisma.lead.findMany({
      select: {
        id: true,
        razaoSocial: true,
        nomeFantasia: true,
        email: true,
        valorEstimadoRecuperacao: true,
        status: true,
        prioridade: true,
        municipio: true,
        uf: true,
        createdAt: true,
        responsavel: {
          select: {
            name: true,
          },
        },
        telefones: {
          select: {
            numero: true,
            tipo: true,
          },
          take: 1,
        },
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
    });

    // Converter Decimal para Number para evitar problemas de serialização
    const leads = leadsData.map((lead: any) => ({
      ...lead,
      valorEstimadoRecuperacao: lead.valorEstimadoRecuperacao 
        ? Number(lead.valorEstimadoRecuperacao) 
        : null
    }));

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Erro ao buscar todos os leads:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
