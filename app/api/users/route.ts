
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { validateCorporateEmail, validatePassword, hashPassword } from '@/lib/password-utils';

export const dynamic = "force-dynamic";

// GET /api/users - Listar todos os usuários
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'DIRETORIA') {
      return NextResponse.json(
        { message: 'Acesso negado' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/users - Criar novo usuário
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'DIRETORIA') {
      return NextResponse.json(
        { message: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { name, email, password, role } = await request.json();

    // Validações básicas
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['VENDEDOR', 'DIRETORIA'].includes(role)) {
      return NextResponse.json(
        { message: 'Função inválida' },
        { status: 400 }
      );
    }

    // Validar e-mail corporativo
    if (!validateCorporateEmail(email)) {
      return NextResponse.json(
        { message: 'E-mail deve ser do domínio @nascimentoeadvogados.com.br' },
        { status: 400 }
      );
    }

    // Validar complexidade da senha
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          message: 'Senha não atende aos requisitos de segurança',
          errors: passwordValidation.errors
        },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'E-mail já está em uso' },
        { status: 400 }
      );
    }

    // Hash da senha usando utilitário seguro
    const hashedPassword = await hashPassword(password);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        lastPasswordChange: new Date(),
        isTemporaryPassword: false,
        mustChangePassword: false
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        isTemporaryPassword: true,
        lastPasswordChange: true
      }
    });

    // Log de auditoria
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        tipo: 'LEAD_CREATED', // Usando enum existente, mas representando criação de usuário
        descricao: `Usuário criado: ${user.name} (${user.email}) com função ${role}`,
        metadata: {
          action: 'CREATE_USER',
          targetUserId: user.id,
          targetUserEmail: user.email,
          targetUserRole: role,
          createdBy: session.user.id,
          createdByEmail: session.user.email
        }
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
