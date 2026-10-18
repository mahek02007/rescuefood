import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

// Haversine formula for distance calculation in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const getDonations = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      status,
      category,
      foodType,
      donorId,
      claimedByNgoId,
      assignedVolunteerId,
      search,
      lat,
      lng,
      radius,
    } = req.query;

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status as string;
    }

    if (category && category !== 'All') {
      where.category = category as string;
    }

    if (foodType && foodType !== 'All') {
      where.foodType = foodType as string;
    }

    if (donorId) {
      where.donorId = donorId as string;
    }

    if (claimedByNgoId) {
      where.claimedByNgoId = claimedByNgoId as string;
    }

    if (assignedVolunteerId) {
      where.assignedVolunteerId = assignedVolunteerId as string;
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { city: { contains: q } },
        { area: { contains: q } },
        { pickupAddress: { contains: q } },
      ];
    }

    let donations = await prisma.donation.findMany({
      where,
      include: {
        timelines: {
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If coordinates are provided, compute distance and optionally filter by radius
    if (lat && lng) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      const maxRadius = radius ? parseFloat(radius as string) : undefined;

      donations = donations
        .map((d: any) => ({
          ...d,
          distanceKm: calculateDistance(userLat, userLng, d.latitude, d.longitude),
        }))
        .filter((d: any) => (maxRadius ? d.distanceKm <= maxRadius : true))
        .sort((a: any, b: any) => a.distanceKm - b.distanceKm);
    }

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error: any) {
    console.error('Fetch donations error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching donations.' });
  }
};

export const getDonationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            organization: true,
            isVerified: true,
            avatar: true,
          },
        },
        claimedByNgo: {
          select: {
            id: true,
            name: true,
            organization: true,
            phone: true,
            isVerified: true,
          },
        },
        assignedVolunteer: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
          },
        },
        timelines: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!donation) {
      res.status(404).json({ success: false, message: 'Donation not found.' });
      return;
    }

    res.status(200).json({ success: true, donation });
  } catch (error: any) {
    console.error('Fetch single donation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching donation.' });
  }
};

export const createDonation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      title,
      category,
      description,
      foodType = 'Vegetarian',
      quantityValue,
      quantityUnit = 'meals',
      estimatedPeopleServed,
      imageUrl,
      preparedDateTime,
      expiryDateTime,
      storageCondition = 'Room Temperature',
      packagingStatus = 'Bulk Containers',
      pickupDate,
      pickupTimeWindow,
      pickupAddress,
      city = 'Metropolis',
      area = 'Downtown',
      pincode = '94103',
      latitude = 37.7749,
      longitude = -122.4194,
      contactPerson,
      contactPhone,
      specialInstructions,
      foodSafetyConfirmed = true,
    } = req.body;

    if (!title || !category || !description || !quantityValue || !expiryDateTime || !pickupAddress) {
      res.status(400).json({ success: false, message: 'Missing required donation fields.' });
      return;
    }

    // Get donor record
    const donor = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!donor) {
      res.status(404).json({ success: false, message: 'Donor account not found.' });
      return;
    }

    const peopleServed = estimatedPeopleServed
      ? parseInt(estimatedPeopleServed)
      : Math.max(1, Math.round(parseFloat(quantityValue) * (quantityUnit === 'kg' ? 3 : 1)));

    const newDonation = await prisma.donation.create({
      data: {
        title: title.trim(),
        category,
        description,
        foodType,
        quantityValue: parseFloat(quantityValue),
        quantityUnit,
        estimatedPeopleServed: peopleServed,
        imageUrl:
          imageUrl ||
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
        preparedDateTime: preparedDateTime ? new Date(preparedDateTime) : null,
        expiryDateTime: new Date(expiryDateTime),
        storageCondition,
        packagingStatus,
        pickupDate: pickupDate || new Date().toISOString().split('T')[0],
        pickupTimeWindow: pickupTimeWindow || '14:00 - 18:00',
        pickupAddress,
        city,
        area,
        pincode,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        contactPerson: contactPerson || donor.name,
        contactPhone: contactPhone || donor.phone,
        specialInstructions,
        foodSafetyConfirmed: Boolean(foodSafetyConfirmed),
        status: 'Available',
        donorId: donor.id,
        donorName: donor.name,
        donorOrg: donor.organization,
        donorVerified: donor.isVerified,
        donorAvatar: donor.avatar,
        timelines: {
          create: {
            status: 'Available',
            description: `Listing created: ${title} (${quantityValue} ${quantityUnit})`,
            actorName: donor.name,
            actorRole: donor.role,
          },
        },
      },
    });

    // Update donor stats
    await prisma.user.update({
      where: { id: donor.id },
      data: { totalDonations: { increment: 1 } },
    });

    // Notify registered NGOs
    await prisma.notification.create({
      data: {
        role: 'ngo',
        title: 'New Food Surplus Available!',
        message: `${donor.organization || donor.name} posted ${title} (${quantityValue} ${quantityUnit}) in ${area}.`,
        type: 'donation',
        donationId: newDonation.id,
        link: `/donations/${newDonation.id}`,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Donation created successfully.',
      donation: newDonation,
    });
  } catch (error: any) {
    console.error('Create donation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error creating donation.' });
  }
};

export const claimDonation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { quantity, peopleToServe, notes } = req.body;

    const donation = await prisma.donation.findUnique({ where: { id } });
    if (!donation) {
      res.status(404).json({ success: false, message: 'Donation not found.' });
      return;
    }

    if (donation.status !== 'Available') {
      res.status(400).json({
        success: false,
        message: `Donation cannot be claimed because its current status is '${donation.status}'.`,
      });
      return;
    }

    const ngoUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!ngoUser) {
      res.status(404).json({ success: false, message: 'NGO user not found.' });
      return;
    }

    const updated = await prisma.donation.update({
      where: { id },
      data: {
        status: 'Claimed',
        claimedByNgoId: ngoUser.id,
        claimedByNgoName: ngoUser.organization || ngoUser.name,
        claimedAt: new Date(),
        ngoRequiredQuantity: quantity ? parseFloat(quantity) : donation.quantityValue,
        ngoPeopleToServe: peopleToServe ? parseInt(peopleToServe) : donation.estimatedPeopleServed,
        ngoPickupNotes: notes || null,
        timelines: {
          create: {
            status: 'Claimed',
            description: `Claimed by ${ngoUser.organization || ngoUser.name}`,
            actorName: ngoUser.name,
            actorRole: ngoUser.role,
          },
        },
      },
    });

    // Notify Donor
    await prisma.notification.create({
      data: {
        userId: donation.donorId,
        title: 'Donation Claimed!',
        message: `${ngoUser.organization || ngoUser.name} has claimed your donation: "${donation.title}".`,
        type: 'claim',
        donationId: donation.id,
        link: `/donations/${donation.id}`,
      },
    });

    // Notify Volunteers that a delivery task is ready for pickup
    await prisma.notification.create({
      data: {
        role: 'volunteer',
        title: 'New Delivery Task Available',
        message: `Pickup needed: "${donation.title}" from ${donation.area} for ${ngoUser.organization || ngoUser.name}.`,
        type: 'claim',
        donationId: donation.id,
        link: `/donations/${donation.id}`,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Donation claimed successfully.',
      donation: updated,
    });
  } catch (error: any) {
    console.error('Claim donation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error claiming donation.' });
  }
};

export const assignVolunteer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const donation = await prisma.donation.findUnique({ where: { id } });

    if (!donation) {
      res.status(404).json({ success: false, message: 'Donation not found.' });
      return;
    }

    if (donation.status !== 'Claimed') {
      res.status(400).json({
        success: false,
        message: 'Only claimed donations can be assigned to a volunteer.',
      });
      return;
    }

    const volunteer = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!volunteer) {
      res.status(404).json({ success: false, message: 'Volunteer not found.' });
      return;
    }

    const updated = await prisma.donation.update({
      where: { id },
      data: {
        status: 'Pickup Scheduled',
        assignedVolunteerId: volunteer.id,
        assignedVolunteerName: volunteer.name,
        volunteerPhone: volunteer.phone,
        acceptedAt: new Date(),
        timelines: {
          create: {
            status: 'Pickup Scheduled',
            description: `Volunteer ${volunteer.name} accepted delivery task`,
            actorName: volunteer.name,
            actorRole: volunteer.role,
          },
        },
      },
    });

    // Notify Donor & NGO
    await prisma.notification.createMany({
      data: [
        {
          userId: donation.donorId,
          title: 'Volunteer Assigned',
          message: `${volunteer.name} will pick up "${donation.title}".`,
          type: 'pickup',
          donationId: donation.id,
        },
        ...(donation.claimedByNgoId
          ? [
              {
                userId: donation.claimedByNgoId,
                title: 'Volunteer Assigned to Your Order',
                message: `${volunteer.name} accepted transport of "${donation.title}".`,
                type: 'pickup',
                donationId: donation.id,
              },
            ]
          : []),
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Delivery task accepted.',
      donation: updated,
    });
  } catch (error: any) {
    console.error('Assign volunteer error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error accepting delivery task.' });
  }
};

export const updateDeliveryStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { status, proofPhoto, receiverName, notes } = req.body;

    if (!['Picked Up', 'Completed'].includes(status)) {
      res.status(400).json({ success: false, message: 'Status must be "Picked Up" or "Completed".' });
      return;
    }

    const donation = await prisma.donation.findUnique({ where: { id } });
    if (!donation) {
      res.status(404).json({ success: false, message: 'Donation not found.' });
      return;
    }

    const actor = await prisma.user.findUnique({ where: { id: req.user.id } });
    const actorName = actor ? actor.name : req.user.name;
    const actorRole = actor ? actor.role : req.user.role;

    const dataToUpdate: any = {
      status,
      ...(status === 'Picked Up' && { pickedUpAt: new Date() }),
      ...(status === 'Completed' && {
        deliveredAt: new Date(),
        deliveryProofPhoto: proofPhoto || null,
        receiverName: receiverName || null,
        deliveryNotes: notes || null,
      }),
      timelines: {
        create: {
          status,
          description:
            status === 'Picked Up'
              ? `Food surplus picked up from location by ${actorName}`
              : `Successfully delivered to destination. Verified by ${receiverName || 'recipient'}.`,
          actorName,
          actorRole,
        },
      },
    };

    const updated = await prisma.donation.update({
      where: { id },
      data: dataToUpdate,
    });

    // If completed, increment stats
    if (status === 'Completed') {
      if (donation.donorId) {
        await prisma.user.update({
          where: { id: donation.donorId },
          data: { totalMealsRescued: { increment: donation.estimatedPeopleServed } },
        });
      }
      if (donation.assignedVolunteerId) {
        await prisma.user.update({
          where: { id: donation.assignedVolunteerId },
          data: { totalDeliveries: { increment: 1 } },
        });
      }
      if (donation.claimedByNgoId) {
        await prisma.user.update({
          where: { id: donation.claimedByNgoId },
          data: { totalMealsRescued: { increment: donation.estimatedPeopleServed } },
        });
      }
    }

    // Notifications
    const notifTitle = status === 'Picked Up' ? 'Food Picked Up' : 'Delivery Complete!';
    const notifMsg =
      status === 'Picked Up'
        ? `Surplus for "${donation.title}" is in transit.`
        : `"${donation.title}" has been successfully delivered and rescued!`;

    const recipients = [donation.donorId, donation.claimedByNgoId].filter(Boolean) as string[];
    for (const rId of recipients) {
      await prisma.notification.create({
        data: {
          userId: rId,
          title: notifTitle,
          message: notifMsg,
          type: status === 'Picked Up' ? 'pickup' : 'delivery',
          donationId: donation.id,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}.`,
      donation: updated,
    });
  } catch (error: any) {
    console.error('Update delivery status error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error updating delivery status.' });
  }
};

export const cancelDonation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { reason } = req.body;

    const donation = await prisma.donation.findUnique({ where: { id } });
    if (!donation) {
      res.status(404).json({ success: false, message: 'Donation not found.' });
      return;
    }

    if (donation.status === 'Completed') {
      res.status(400).json({ success: false, message: 'Completed donations cannot be cancelled.' });
      return;
    }

    const updated = await prisma.donation.update({
      where: { id },
      data: {
        status: 'Cancelled',
        cancellationReason: reason || 'Cancelled by user',
        cancelledAt: new Date(),
        cancelledBy: req.user.name,
        timelines: {
          create: {
            status: 'Cancelled',
            description: `Listing cancelled. Reason: ${reason || 'N/A'}`,
            actorName: req.user.name,
            actorRole: req.user.role,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Donation cancelled.',
      donation: updated,
    });
  } catch (error: any) {
    console.error('Cancel donation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error cancelling donation.' });
  }
};
