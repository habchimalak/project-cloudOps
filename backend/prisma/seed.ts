// Données de démonstration : npx prisma db seed
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Password123!', 10);

  // Utilisateurs (un par rôle)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cloudops.local' },
    update: {},
    create: { email: 'admin@cloudops.local', password, firstName: 'Admin', lastName: 'CloudOps', role: Role.ADMIN },
  });
  const devops = await prisma.user.upsert({
    where: { email: 'devops@cloudops.local' },
    update: {},
    create: { email: 'devops@cloudops.local', password, firstName: 'Dev', lastName: 'Ops', role: Role.DEVOPS },
  });
  await prisma.user.upsert({
    where: { email: 'viewer@cloudops.local' },
    update: {},
    create: { email: 'viewer@cloudops.local', password, firstName: 'View', lastName: 'Er', role: Role.VIEWER },
  });

  // Équipe et projet
  const team = await prisma.team.upsert({
    where: { name: 'Équipe Infra' },
    update: {},
    create: {
      name: 'Équipe Infra',
      members: { create: [{ userId: admin.id }, { userId: devops.id }] },
    },
  });

  const project = await prisma.project.upsert({
    where: { name: 'Boutique en ligne' },
    update: {},
    create: {
      name: 'Boutique en ligne',
      description: 'Plateforme e-commerce de démonstration',
      assignments: { create: [{ teamId: team.id }] },
      environments: {
        create: [
          { name: 'Développement', type: 'DEVELOPMENT' },
          { name: 'Production', type: 'PRODUCTION' },
        ],
      },
    },
    include: { environments: true },
  });
  const prod = project.environments.find((e) => e.type === 'PRODUCTION')!;

  // Serveur et application
  const server = await prisma.server.upsert({
    where: { name: 'web-prod-01' },
    update: {},
    create: {
      name: 'web-prod-01',
      provider: 'AWS',
      region: 'eu-west-3',
      cpuCores: 4,
      ramGb: 8,
      storageGb: 100,
      ipAddress: '10.0.0.10',
      environmentId: prod.id,
    },
  });

  await prisma.application.upsert({
    where: { name_serverId: { name: 'shop-frontend', serverId: server.id } },
    update: {},
    create: { name: 'shop-frontend', version: '1.0.0', serverId: server.id, environmentId: prod.id },
  });

  // Seuils globaux par défaut
  if ((await prisma.alertThreshold.count()) === 0) {
    await prisma.alertThreshold.createMany({
      data: [
        { metricType: 'CPU', value: 85, severity: 'WARNING' },
        { metricType: 'CPU', value: 95, severity: 'CRITICAL' },
        { metricType: 'RAM', value: 90, severity: 'WARNING' },
      ],
    });
  }

  // Quelques mesures simulées sur la dernière heure
  if ((await prisma.metric.count()) === 0) {
    const now = Date.now();
    await prisma.metric.createMany({
      data: Array.from({ length: 12 }, (_, i) => ({
        serverId: server.id,
        cpuUsage: Math.round(20 + Math.random() * 60),
        ramUsage: Math.round(30 + Math.random() * 50),
        recordedAt: new Date(now - (11 - i) * 5 * 60 * 1000),
      })),
    });
  }

  console.log('Seed terminé.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
