
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'DIRETORIA') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const {
      razaoSocial,
      nomeFantasia,
      telefonePrincipal,
      email,
      valorEstimadoRecuperacao,
      municipio,
      uf,
      prioridade,
      observacoes
    } = body;

    // Validar campos obrigatórios
    if (!razaoSocial) {
      return NextResponse.json(
        { error: 'Razão social é obrigatória' },
        { status: 400 }
      );
    }

    // Buscar um vendedor para atribuir o lead (primeiro vendedor encontrado)
    const vendedor = await prisma.user.findFirst({
      where: {
        role: 'VENDEDOR'
      }
    });

    // Criar novo lead
    const newLead = await prisma.lead.create({
      data: {
        razaoSocial,
        nomeFantasia: nomeFantasia || null,
        telefonePrincipal: telefonePrincipal || null,
        email: email || null,
        valorEstimadoRecuperacao: valorEstimadoRecuperacao || null,
        municipio: municipio || null,
        uf: uf || null,
        prioridade: prioridade || 'MEDIA',
        observacoes: observacoes || null,
        status: 'NAO_CONTATADO', // Status padrão
        responsavelId: vendedor?.id || null, // Atribuir ao vendedor se disponível
      },
      include: {
        responsavel: {
          select: {
            name: true,
          },
        },
      },
    });

    // Converter Decimal para Number na resposta
    const leadResponse = {
      ...newLead,
      valorEstimadoRecuperacao: newLead.valorEstimadoRecuperacao 
        ? Number(newLead.valorEstimadoRecuperacao) 
        : null
    };

    return NextResponse.json(leadResponse, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar lead:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
