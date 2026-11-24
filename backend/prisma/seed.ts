// Données de démonstration : npx prisma db seed
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Password123!', 10);

  // ── Utilisateurs (un par rôle) ──────────────────────────────────────
  // update: {} volontaire — on ne réécrase pas le mot de passe si l'utilisateur
  // l'a changé en base, mais on s'assure que le rôle reste correct.
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cloudops.local' },
    update: { role: Role.ADMIN },
    create: { email: 'admin@cloudops.local', password, firstName: 'Admin', lastName: 'CloudOps', role: Role.ADMIN },
  });
  const devops = await prisma.user.upsert({
    where: { email: 'devops@cloudops.local' },
    update: { role: Role.DEVOPS },
    create: { email: 'devops@cloudops.local', password, firstName: 'Dev', lastName: 'Ops', role: Role.DEVOPS },
  });
  await prisma.user.upsert({
    where: { email: 'viewer@cloudops.local' },
    update: { role: Role.VIEWER },
    create: { email: 'viewer@cloudops.local', password, firstName: 'View', lastName: 'Er', role: Role.VIEWER },
  });

  // ── Équipe ──────────────────────────────────────────────────────────
  const team = await prisma.team.upsert({
    where: { name: 'Équipe Infra' },
    update: {},
    create: { name: 'Équipe Infra' },
  });

  // Membres de l'équipe : on insère uniquement s'ils n'existent pas déjà
  await prisma.teamMember.upsert({
    where: { userId_teamId: { userId: admin.id, teamId: team.id } },
    update: {},
    create: { userId: admin.id, teamId: team.id },
  });
  await prisma.teamMember.upsert({
    where: { userId_teamId: { userId: devops.id, teamId: team.id } },
    update: {},
    create: { userId: devops.id, teamId: team.id },
  });

  // ── Projet ──────────────────────────────────────────────────────────
  const project = await prisma.project.upsert({
    where: { name: 'Boutique en ligne' },
    update: {},
    create: { name: 'Boutique en ligne', description: 'Plateforme e-commerce de démonstration' },
  });

  // Affectation équipe → projet
  await prisma.projectAssignment.upsert({
    where: { projectId_teamId: { projectId: project.id, teamId: team.id } },
    update: {},
    create: { projectId: project.id, teamId: team.id },
  });

  // Environnements : upsert individuel par contrainte unique (projectId, type)
  const devEnv = await prisma.environment.upsert({
    where: { projectId_type: { projectId: project.id, type: 'DEVELOPMENT' } },
    update: {},
    create: { name: 'Développement', type: 'DEVELOPMENT', projectId: project.id },
  });
  const prodEnv = await prisma.environment.upsert({
    where: { projectId_type: { projectId: project.id, type: 'PRODUCTION' } },
    update: {},
    create: { name: 'Production', type: 'PRODUCTION', projectId: project.id },
  });

  // ── Serveur ─────────────────────────────────────────────────────────
  // On upsert sur ipAddress (unique) ET on met à jour le nom si l'IP existe déjà,
  // ce qui évite le doublon sur la contrainte unique ipAddress au re-seed.
  const server = await prisma.server.upsert({
    where: { ipAddress: '10.0.0.10' },
    update: { name: 'web-prod-01', environmentId: prodEnv.id },
    create: {
      name: 'web-prod-01',
      provider: 'AWS',
      region: 'eu-west-3',
      cpuCores: 4,
      ramGb: 8,
      storageGb: 100,
      ipAddress: '10.0.0.10',
      environmentId: prodEnv.id,
    },
  });

  // ── Application ─────────────────────────────────────────────────────
  await prisma.application.upsert({
    where: { name_serverId: { name: 'shop-frontend', serverId: server.id } },
    update: { environmentId: prodEnv.id },
    create: { name: 'shop-frontend', version: '1.0.0', serverId: server.id, environmentId: prodEnv.id },
  });

  // ── Seuils globaux par défaut ────────────────────────────────────────
  if ((await prisma.alertThreshold.count()) === 0) {
    await prisma.alertThreshold.createMany({
      data: [
        { metricType: 'CPU', value: 85, severity: 'WARNING' },
        { metricType: 'CPU', value: 95, severity: 'CRITICAL' },
        { metricType: 'RAM', value: 90, severity: 'WARNING' },
      ],
    });
  }

  // ── Métriques simulées (seulement au premier seed) ───────────────────
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

  // Référence à devEnv utilisée pour éviter l'avertissement "variable non utilisée"
  void devEnv;

  console.log('Seed terminé.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
