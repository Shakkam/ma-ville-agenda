import { prisma } from './prisma.js';

const seed = async () => {
  console.log('🌱 Seeding database...');

  // Create super-admin user
  const user = await prisma.user.upsert({
    where: { email: 'admin@ma-ville-agenda.local' },
    update: {},
    create: {
      email: 'admin@ma-ville-agenda.local',
      password: 'admin123', // TODO: Replace with secure password in production
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ User created:', user.email);

  // Seed 7 Léognan events (May 2026)
  const events = [
    {
      title: 'Ciné Europe : Sorda',
      description: 'Film documentaire sur la communauté sourde.',
      category: 'CULTURE' as const,
      location: 'Espace Culturel Georges Brassens',
      startDate: new Date('2026-05-26T20:30:00'),
      endDate: new Date('2026-05-26T22:30:00'),
      imageUrl: null,
    },
    {
      title: 'Ciné Europe : Une Enfance Allemande',
      description: 'Un enfant grandit dans l\'Allemagne divisée.',
      category: 'CULTURE' as const,
      location: 'Espace Culturel Georges Brassens',
      startDate: new Date('2026-05-27T18:10:00'),
      endDate: new Date('2026-05-27T20:00:00'),
      imageUrl: null,
    },
    {
      title: 'Ciné Europe : Au Rythme de Vera',
      description: 'Drame musical inspiré par la vie de Vera Lynn.',
      category: 'CULTURE' as const,
      location: 'Espace Culturel Georges Brassens',
      startDate: new Date('2026-05-27T20:45:00'),
      endDate: new Date('2026-05-27T22:45:00'),
      imageUrl: null,
    },
    {
      title: 'Café linguistique',
      description: 'Échange linguistique convivial en plusieurs langues.',
      category: 'ANIMATION' as const,
      location: 'Espace Culturel Georges Brassens',
      startDate: new Date('2026-05-28T18:30:00'),
      endDate: new Date('2026-05-28T20:00:00'),
      imageUrl: null,
    },
    {
      title: 'Ciné Europe : Vivaldi et moi',
      description: 'Biographie musicale inspirée par le maestro Antonio Vivaldi.',
      category: 'CULTURE' as const,
      location: 'Espace Culturel Georges Brassens',
      startDate: new Date('2026-05-28T20:45:00'),
      endDate: new Date('2026-05-28T22:45:00'),
      imageUrl: null,
    },
    {
      title: 'Ciné Europe : Les Dimanches',
      description: 'Comédie douce-amère sur les rituels familiaux.',
      category: 'CULTURE' as const,
      location: 'Espace Culturel Georges Brassens',
      startDate: new Date('2026-05-29T18:00:00'),
      endDate: new Date('2026-05-29T20:00:00'),
      imageUrl: null,
    },
    {
      title: 'Mes mots pour tes oreilles',
      description: 'Performance d\'art littéraire et musical.',
      category: 'ANIMATION' as const,
      location: 'Espace Culturel Georges Brassens',
      startDate: new Date('2026-05-30T10:00:00'),
      endDate: new Date('2026-05-30T11:30:00'),
      imageUrl: null,
    },
  ];

  for (const eventData of events) {
    await prisma.event.upsert({
      where: { id: eventData.title.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        location: eventData.location,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        imageUrl: eventData.imageUrl,
        status: 'PUBLISHED',
        createdBy: user.id,
      },
    });
  }

  console.log('✅ 7 events seeded');
  console.log('✅ Database seeded successfully!');
};

seed()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
