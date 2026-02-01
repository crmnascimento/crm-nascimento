
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { leadId, tipo, descricao, resultado, proximoStep } = body;

    if (!leadId || !tipo || !descricao) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Verificar se o lead existe e se o usuário tem permissão
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
    }

    if (session.user.role === 'VENDEDOR' && lead.responsavelId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Criar interação
    const interaction = await prisma.interaction.create({
      data: {
        leadId,
        userId: session.user.id,
        tipo,
        descricao,
        resultado,
        proximoStep,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // Atualizar data do último contato do lead
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        dataUltimoContato: new Date(),
      },
    });

    // Registrar atividade
    await prisma.activity.create({
      data: {
        leadId,
        userId: session.user.id,
        tipo: 'INTERACTION_ADDED',
        descricao: `Nova interação adicionada: ${tipo}`,
      },
    });

    return NextResponse.json(interaction);
  } catch (error) {
    console.error('Erro ao criar interação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
