
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { validatePassword, verifyPassword, hashPassword } from '@/lib/password-utils';

export const dynamic = "force-dynamic";

// POST /api/profile/change-password - Alterar senha do usuário logado
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    // Validações
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Senha atual e nova senha são obrigatórias' },
        { status: 400 }
      );
    }

    // Validar complexidade da nova senha
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { message: 'Nova senha não atende aos requisitos de segurança', errors: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Buscar usuário atual
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { message: 'Senha atual incorreta' },
        { status: 400 }
      );
    }

    // Verificar se a nova senha é diferente da atual
    const isSamePassword = await verifyPassword(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { message: 'A nova senha deve ser diferente da senha atual' },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const hashedNewPassword = await hashPassword(newPassword);

    // Atualizar senha no banco
    await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        password: hashedNewPassword,
        lastPasswordChange: new Date(),
        isTemporaryPassword: false,
        mustChangePassword: false
      }
    });

    // Log de auditoria
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        tipo: 'LEAD_UPDATED', // Usando enum existente, mas representando alteração de senha
        descricao: `Usuário alterou sua própria senha: ${user.name} (${user.email})`,
        metadata: {
          action: 'CHANGE_PASSWORD',
          userId: session.user.id,
          userEmail: session.user.email,
          userName: user.name,
          timestamp: new Date().toISOString(),
          wasTemporary: user.isTemporaryPassword
        }
      }
    });

    return NextResponse.json({
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
