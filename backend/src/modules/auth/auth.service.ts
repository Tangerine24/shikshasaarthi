import { prisma } from '../../lib/prisma';
import { hashPassword, verifyPassword } from './password.utils';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from './jwt.utils';
import { Role } from '../../types';

export const AuthService = {
  async register(data: any) {
    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hashedPassword,
        role: data.role,
      }
    });

    if (data.role === Role.STUDENT) {
      await prisma.studentProfile.create({ data: { userId: user.id, fullName: 'Student', profileCompletePercent: 0 } });
    } else if (data.role === Role.PROVIDER) {
      await prisma.providerProfile.create({ data: { userId: user.id, organizationName: 'Provider' } });
    } else if (data.role === Role.ADMIN) {
      await prisma.adminProfile.create({ data: { userId: user.id, fullName: 'Admin' } });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.id);
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });

    return { user, accessToken, refreshToken };
  },

  async login(email: string, pass: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');
    
    const valid = await verifyPassword(pass, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.id);
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });

    return { user, accessToken, refreshToken };
  }
};
