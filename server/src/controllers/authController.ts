import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'foodrescue_jwt_secret_key_production_ready_2026_super_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'donor', phone, organization, address, city, area, pincode, latitude, longitude, avatar } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const isNgo = role === 'ngo';
    const isVerified = role === 'donor' || role === 'volunteer'; // NGO requires review
    const verificationStatus = isNgo ? 'pending' : 'verified';

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role,
        phone: phone || '+1 (555) 000-0000',
        organization: organization || null,
        address: address || '100 Metro Avenue, Suite 200',
        city: city || 'Metropolis',
        area: area || 'Downtown',
        pincode: pincode || '94103',
        latitude: latitude ? parseFloat(latitude) : 37.7749,
        longitude: longitude ? parseFloat(longitude) : -122.4194,
        avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        isVerified,
        verificationStatus,
      },
    });

    // If NGO, create a verification request record
    if (isNgo && organization) {
      await prisma.verificationRequest.create({
        data: {
          userId: newUser.id,
          organizationName: organization,
          status: 'pending',
          notes: 'Registration verification request for NGO organization status.',
        },
      });
    }

    // Create a welcome notification
    await prisma.notification.create({
      data: {
        userId: newUser.id,
        title: 'Welcome to FoodRescue!',
        message: `Your account as a ${role} has been created successfully. Start making an impact today.`,
        type: 'system',
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    // Strip passwordHash from response
    const { passwordHash: _, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during registration.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    const { passwordHash: _, ...safeUser } = user;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during login.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        _count: {
          select: {
            donationsCreated: true,
            donationsClaimed: true,
            donationsDelivered: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const { passwordHash: _, _count, ...safeUser } = user;

    res.status(200).json({
      success: true,
      user: {
        ...safeUser,
        totalDonations: _count.donationsCreated,
        totalDeliveries: _count.donationsDelivered,
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error fetching user.' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, phone, organization, address, city, area, pincode, latitude, longitude, avatar } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(phone && { phone: phone.trim() }),
        ...(organization !== undefined && { organization }),
        ...(address && { address }),
        ...(city && { city }),
        ...(area && { area }),
        ...(pincode && { pincode }),
        ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
        ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
        ...(avatar && { avatar }),
      },
    });

    const { passwordHash: _, ...safeUser } = updated;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating profile.' });
  }
};
