import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding FoodRescue PostgreSQL database...');

  // Hash standard password for seed accounts: "FoodRescue2026!"
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('FoodRescue2026!', salt);

  // 1. Create Users
  const donorUser = await prisma.user.upsert({
    where: { email: 'donor@foodrescue.org' },
    update: {},
    create: {
      name: 'Elena Rostova',
      email: 'donor@foodrescue.org',
      passwordHash,
      phone: '+1 (555) 234-5678',
      role: 'donor',
      organization: 'The Grand Hyatt Bakery & Cafe',
      address: '400 Market Street',
      city: 'Metropolis',
      area: 'Financial District',
      pincode: '94105',
      latitude: 37.7915,
      longitude: -122.3995,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
      isVerified: true,
      verificationStatus: 'verified',
      totalMealsRescued: 420,
      totalDonations: 12,
    },
  });

  const ngoUser = await prisma.user.upsert({
    where: { email: 'ngo@foodrescue.org' },
    update: {},
    create: {
      name: 'Community Hope Kitchen',
      email: 'ngo@foodrescue.org',
      passwordHash,
      phone: '+1 (555) 876-5432',
      role: 'ngo',
      organization: 'Hope Shelter Network',
      address: '750 Mission Boulevard',
      city: 'Metropolis',
      area: 'Mission District',
      pincode: '94110',
      latitude: 37.7612,
      longitude: -122.4185,
      avatar: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=250',
      isVerified: true,
      verificationStatus: 'verified',
      totalMealsRescued: 1850,
      totalDonations: 0,
    },
  });

  const volunteerUser = await prisma.user.upsert({
    where: { email: 'volunteer@foodrescue.org' },
    update: {},
    create: {
      name: 'Marcus Chen',
      email: 'volunteer@foodrescue.org',
      passwordHash,
      phone: '+1 (555) 432-1098',
      role: 'volunteer',
      organization: 'EcoWheels Courier Co.',
      address: '120 Van Ness Ave',
      city: 'Metropolis',
      area: 'Civic Center',
      pincode: '94102',
      latitude: 37.7785,
      longitude: -122.4199,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      isVerified: true,
      verificationStatus: 'verified',
      totalMealsRescued: 340,
      totalDeliveries: 28,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@foodrescue.org' },
    update: {
      name: 'Alexandra Stone',
    },
    create: {
      name: 'Alexandra Stone',
      email: 'admin@foodrescue.org',
      passwordHash,
      phone: '+1 (555) 999-0000',
      role: 'admin',
      organization: 'FoodRescue Platform Directorate',
      address: '100 Metro Avenue, Suite 200',
      city: 'Metropolis',
      area: 'Downtown',
      pincode: '94103',
      latitude: 37.7749,
      longitude: -122.4194,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      isVerified: true,
      verificationStatus: 'verified',
    },
  });

  // 2. Create Sample Donations
  const donation1 = await prisma.donation.create({
    data: {
      title: 'Artisan Pastries & Whole Grain Breads',
      category: 'Bakery',
      description: 'Assorted croissants, brioche buns, and sourdough loaves freshly baked this morning.',
      foodType: 'Vegetarian',
      quantityValue: 45,
      quantityUnit: 'boxes',
      estimatedPeopleServed: 65,
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
      expiryDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      storageCondition: 'Room Temperature',
      packagingStatus: 'Boxes/Crates',
      pickupDate: new Date().toISOString().split('T')[0],
      pickupTimeWindow: '17:00 - 19:30',
      pickupAddress: '400 Market Street',
      city: 'Metropolis',
      area: 'Financial District',
      pincode: '94105',
      latitude: 37.7915,
      longitude: -122.3995,
      contactPerson: 'Elena Rostova',
      contactPhone: '+1 (555) 234-5678',
      foodSafetyConfirmed: true,
      status: 'Available',
      donorId: donorUser.id,
      donorName: donorUser.name,
      donorOrg: donorUser.organization,
      donorVerified: true,
      timelines: {
        create: {
          status: 'Available',
          description: 'Listing published by The Grand Hyatt Bakery',
          actorName: donorUser.name,
          actorRole: donorUser.role,
        },
      },
    },
  });

  const donation2 = await prisma.donation.create({
    data: {
      title: 'Nutritious Steamed Rice & Vegetable Curry',
      category: 'Cooked Meals',
      description: 'Freshly prepared catering surplus: Jasmine rice and mild chickpea vegetable curry in stainless insulated trays.',
      foodType: 'Vegan',
      quantityValue: 80,
      quantityUnit: 'meals',
      estimatedPeopleServed: 80,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
      preparedDateTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      expiryDateTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
      storageCondition: 'Heated/Warm',
      packagingStatus: 'Sealed Trays',
      pickupDate: new Date().toISOString().split('T')[0],
      pickupTimeWindow: '15:00 - 17:00',
      pickupAddress: '250 Howard St',
      city: 'Metropolis',
      area: 'SOMA',
      pincode: '94105',
      latitude: 37.7892,
      longitude: -122.3976,
      contactPerson: 'Chef Marcus',
      contactPhone: '+1 (555) 345-6789',
      foodSafetyConfirmed: true,
      status: 'Claimed',
      donorId: donorUser.id,
      donorName: donorUser.name,
      donorOrg: 'Catering Gourmet',
      donorVerified: true,
      claimedByNgoId: ngoUser.id,
      claimedByNgoName: ngoUser.organization,
      claimedAt: new Date(),
      ngoRequiredQuantity: 80,
      ngoPeopleToServe: 80,
      ngoPickupNotes: 'Shelter van will be ready for pickup promptly.',
      timelines: {
        createMany: {
          data: [
            {
              status: 'Available',
              description: 'Surplus meal batch listed',
              actorName: donorUser.name,
              actorRole: 'donor',
            },
            {
              status: 'Claimed',
              description: `Claimed by ${ngoUser.organization}`,
              actorName: ngoUser.name,
              actorRole: 'ngo',
            },
          ],
        },
      },
    },
  });

  // 3. Create Verification Request
  await prisma.verificationRequest.create({
    data: {
      userId: ngoUser.id,
      organizationName: 'Hope Shelter Network',
      documentUrl: 'https://example.com/docs/501c3_hope_shelter.pdf',
      status: 'verified',
      reviewedAt: new Date(),
      notes: 'IRS 501(c)(3) documentation validated successfully.',
    },
  });

  // 4. Create Notification
  await prisma.notification.createMany({
    data: [
      {
        userId: ngoUser.id,
        title: 'New Donation Alert in Your Area',
        message: 'Artisan Pastries & Whole Grain Breads is available in Financial District.',
        type: 'donation',
        donationId: donation1.id,
        read: false,
      },
      {
        userId: donorUser.id,
        title: 'Your Donation was Claimed!',
        message: `${ngoUser.organization} has claimed the Nutritious Steamed Rice & Vegetable Curry.`,
        type: 'claim',
        donationId: donation2.id,
        read: true,
      },
      {
        userId: volunteerUser.id,
        title: 'Delivery Task Available',
        message: 'Pick up scheduled for Nutritious Steamed Rice & Vegetable Curry in SOMA.',
        type: 'pickup',
        donationId: donation2.id,
        read: false,
      },
    ],
  });

  console.log('✅ Seeding completed successfully!');
  console.log('Users created:');
  console.log('  - Donor:     donor@foodrescue.org     (Pass: FoodRescue2026!)');
  console.log('  - NGO:       ngo@foodrescue.org       (Pass: FoodRescue2026!)');
  console.log('  - Volunteer: volunteer@foodrescue.org (Pass: FoodRescue2026!)');
  console.log('  - Admin:     admin@foodrescue.org     (Pass: FoodRescue2026!)');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
