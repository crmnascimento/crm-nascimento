
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

// GET /api/users/[id] - Buscar usuário específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'DIRETORIA') {
      return NextResponse.json(
        { message: 'Acesso negado' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            leads: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Atualizar usuário
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'DIRETORIA') {
      return NextResponse.json(
        { message: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { name, email, role } = await request.json();

    // Validações
    if (!name || !email || !role) {
      return NextResponse.json(
        { message: 'Nome, email e função são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['VENDEDOR', 'DIRETORIA'].includes(role)) {
      return NextResponse.json(
        { message: 'Função inválida' },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se email já está em uso por outro usuário
    if (email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email }
      });

      if (emailInUse) {
        return NextResponse.json(
          { message: 'E-mail já está em uso por outro usuário' },
          { status: 400 }
        );
      }
    }

    // Atualizar usuário
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        name,
        email,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Excluir usuário
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'DIRETORIA') {
      return NextResponse.json(
        { message: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            leads: true
          }
        }
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Impedir que o usuário delete a si mesmo
    if (session.user.id === params.id) {
      return NextResponse.json(
        { message: 'Você não pode excluir sua própria conta' },
        { status: 400 }
      );
    }

    // Verificar se o usuário tem leads atribuídos
    if (existingUser._count.leads > 0) {
      return NextResponse.json(
        { message: `Não é possível excluir usuário com ${existingUser._count.leads} leads atribuídos` },
        { status: 400 }
      );
    }

    // Excluir usuário
    await prisma.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json(
      { message: 'Usuário excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
