
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateTemporaryPassword, hashPassword } from '@/lib/password-utils';

export const dynamic = "force-dynamic";

// POST /api/users/[id]/reset-password - Resetar senha de um usuário (apenas DIRETORIA)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'DIRETORIA') {
      return NextResponse.json(
        { message: 'Acesso negado. Apenas a diretoria pode resetar senhas.' },
        { status: 403 }
      );
    }

    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { message: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Gerar nova senha temporária
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await hashPassword(temporaryPassword);

    // Atualizar usuário com senha temporária
    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        password: hashedPassword,
        isTemporaryPassword: true,
        mustChangePassword: true,
        lastPasswordChange: new Date()
      }
    });

    // Log de auditoria
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        tipo: 'LEAD_UPDATED', // Usando enum existente, mas representando reset de senha
        descricao: `Senha resetada para usuário: ${user.name} (${user.email})`,
        metadata: {
          action: 'RESET_PASSWORD',
          targetUserId: user.id,
          targetUserEmail: user.email,
          targetUserName: user.name,
          resetBy: session.user.id,
          resetByEmail: session.user.email,
          timestamp: new Date().toISOString()
        }
      }
    });

    // Retornar a senha temporária (apenas para a diretoria ver)
    return NextResponse.json({
      message: 'Senha resetada com sucesso',
      temporaryPassword,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
