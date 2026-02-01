
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

// GET /api/profile - Obter detalhes do perfil do usuário logado
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastPasswordChange: true,
        isTemporaryPassword: true,
        mustChangePassword: true,
        _count: {
          select: {
            leads: true,
            interactions: true
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
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
