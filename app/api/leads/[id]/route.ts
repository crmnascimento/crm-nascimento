
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        responsavel: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        interactions: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        reminders: {
          where: {
            concluido: false,
          },
          orderBy: {
            dataHora: 'asc',
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
    }

    // Verificar se o usuário tem permissão para ver este lead
    if (session.user.role === 'VENDEDOR' && lead.responsavelId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Erro ao buscar lead:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      status, 
      proximaAcao, 
      dataProximaAcao, 
      observacoesContato,
      valorEstimadoRecuperacao,
      ...otherFields 
    } = body;

    // Verificar se o lead existe e se o usuário tem permissão
    const existingLead = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
    }

    if (session.user.role === 'VENDEDOR' && existingLead.responsavelId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Atualizar o lead
    const updatedLead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(proximaAcao && { proximaAcao }),
        ...(dataProximaAcao && { dataProximaAcao: new Date(dataProximaAcao) }),
        ...(observacoesContato && { observacoesContato }),
        ...(valorEstimadoRecuperacao && { valorEstimadoRecuperacao }),
        ...otherFields,
        dataUltimoContato: new Date(),
      },
    });

    // Registrar atividade
    await prisma.activity.create({
      data: {
        leadId: params.id,
        userId: session.user.id,
        tipo: 'LEAD_UPDATED',
        descricao: `Lead ${existingLead.razaoSocial} foi atualizado`,
        metadata: {
          changes: body,
        },
      },
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error('Erro ao atualizar lead:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
