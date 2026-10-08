import { PrismaClient, ProjectStatus, TaskPriority, TaskStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('✅ Starting Taskora database seeding...');

  // 1. Remove all old Taskforge demo/test accounts
  await prisma.user.deleteMany({
    where: {
      email: {
        endsWith: '@taskforge.io',
      },
    },
  });
  console.log('🧹 Cleaned up all old demo/test users (@taskforge.io)');

  // 2. Define the new demo user
  const plainPassword = 'Taskora@123';
  const passwordHash = await bcrypt.hash(plainPassword, 10);
  const demoEmail = 'demo@taskora.app';

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: { passwordHash, fullName: 'Mohit Sharma' },
    create: {
      fullName: 'Mohit Sharma',
      email: demoEmail,
      passwordHash,
    },
  });

  console.log(`👤 Seeded User: ${user.fullName} (${user.email})`);

  // Clear existing projects for clean idempotency for this user
  await prisma.project.deleteMany({
    where: { ownerId: user.id },
  });

  // 3. Create Projects and Tasks
  
  // Project 1: Website Redesign
  await prisma.project.create({
    data: {
      ownerId: user.id,
      name: 'Website Redesign',
      description: 'Redesign the company website with a modern, responsive user experience.',
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date('2026-09-15'),
      endDate: new Date('2026-11-05'),
      tasks: {
        create: [
          {
            name: 'Design Homepage UI',
            description: 'Create the new homepage interface and visual system.',
            priority: TaskPriority.HIGH,
            status: TaskStatus.COMPLETED,
            dueDate: new Date('2026-09-25'),
          },
          {
            name: 'Create Responsive Layout',
            description: 'Implement responsive layouts for desktop, tablet and mobile.',
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.COMPLETED,
            dueDate: new Date('2026-09-30'),
          },
          {
            name: 'Implement Navigation',
            description: 'Build and integrate the main website navigation.',
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.IN_PROGRESS,
            dueDate: new Date('2026-10-15'),
          },
          {
            name: 'Perform UI Testing',
            description: 'Test the redesigned interface across supported screen sizes.',
            priority: TaskPriority.LOW,
            status: TaskStatus.PENDING,
            dueDate: new Date('2026-10-30'),
          },
        ],
      },
    },
  });

  // Project 2: Mobile App MVP
  await prisma.project.create({
    data: {
      ownerId: user.id,
      name: 'Mobile App MVP',
      description: 'Build the first version of the Taskora mobile application.',
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-12-10'),
      tasks: {
        create: [
          {
            name: 'Setup React Native Project',
            description: 'Initialize the mobile project and configure the development environment.',
            priority: TaskPriority.HIGH,
            status: TaskStatus.COMPLETED,
            dueDate: new Date('2026-10-05'),
          },
          {
            name: 'Implement Authentication',
            description: 'Implement login, registration and logout using the shared backend.',
            priority: TaskPriority.HIGH,
            status: TaskStatus.COMPLETED,
            dueDate: new Date('2026-10-12'),
          },
          {
            name: 'Build Project Screens',
            description: 'Create project listing, project details and task screens.',
            priority: TaskPriority.HIGH,
            status: TaskStatus.IN_PROGRESS,
            dueDate: new Date('2026-10-25'),
          },
          {
            name: 'Add Pull to Refresh',
            description: 'Implement pull-to-refresh for synchronizing mobile data.',
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.IN_PROGRESS,
            dueDate: new Date('2026-11-02'),
          },
        ],
      },
    },
  });

  // Project 3: CRM Integration
  await prisma.project.create({
    data: {
      ownerId: user.id,
      name: 'CRM Integration',
      description: 'Integrate CRM APIs and synchronize customer information.',
      status: ProjectStatus.NOT_STARTED,
      startDate: new Date('2026-10-20'),
      endDate: new Date('2026-11-30'),
      tasks: {
        create: [
          {
            name: 'Analyze CRM API',
            description: 'Review available CRM endpoints and integration requirements.',
            priority: TaskPriority.HIGH,
            status: TaskStatus.IN_PROGRESS,
            dueDate: new Date('2026-10-22'),
          },
          {
            name: 'Implement API Authentication',
            description: 'Configure secure authentication for CRM API communication.',
            priority: TaskPriority.HIGH,
            status: TaskStatus.PENDING,
            dueDate: new Date('2026-10-28'),
          },
          {
            name: 'Build Customer Sync',
            description: 'Implement synchronization between Taskora and the CRM.',
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.PENDING,
            dueDate: new Date('2026-11-10'),
          },
          {
            name: 'Test CRM Integration',
            description: 'Validate API integration and synchronization flows.',
            priority: TaskPriority.LOW,
            status: TaskStatus.PENDING,
            dueDate: new Date('2026-11-20'),
          },
        ],
      },
    },
  });

  // Project 4: Marketing Campaign
  await prisma.project.create({
    data: {
      ownerId: user.id,
      name: 'Marketing Campaign',
      description: 'Plan and execute the product launch marketing campaign.',
      status: ProjectStatus.COMPLETED,
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-09-20'),
      tasks: {
        create: [
          {
            name: 'Create Campaign Strategy',
            description: 'Define campaign goals, audience and execution strategy.',
            priority: TaskPriority.HIGH,
            status: TaskStatus.COMPLETED,
            dueDate: new Date('2026-08-10'),
          },
          {
            name: 'Design Social Media Assets',
            description: 'Prepare creative assets for social media promotion.',
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.COMPLETED,
            dueDate: new Date('2026-08-20'),
          },
          {
            name: 'Prepare Email Campaign',
            description: 'Create email content and configure campaign sequences.',
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.COMPLETED,
            dueDate: new Date('2026-09-01'),
          },
          {
            name: 'Launch Campaign',
            description: 'Publish the campaign across the selected channels.',
            priority: TaskPriority.HIGH,
            status: TaskStatus.COMPLETED,
            dueDate: new Date('2026-09-15'),
          },
        ],
      },
    },
  });

  // Project 5: Analytics Dashboard
  await prisma.project.create({
    data: {
      ownerId: user.id,
      name: 'Analytics Dashboard',
      description: 'Build analytics and reporting dashboards for product metrics.',
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date('2026-09-25'),
      endDate: new Date('2026-10-30'),
      tasks: {
        create: [
          {
            name: 'Design Analytics UI',
            description: 'Design the dashboard layout and analytics components.',
            priority: TaskPriority.HIGH,
            status: TaskStatus.COMPLETED,
            dueDate: new Date('2026-09-30'),
          },
          {
            name: 'Create KPI Cards',
            description: 'Implement KPI cards for projects and task statistics.',
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.COMPLETED,
            dueDate: new Date('2026-10-05'),
          },
          {
            name: 'Implement Charts',
            description: 'Implement charts for project progress and task distribution.',
            priority: TaskPriority.HIGH,
            status: TaskStatus.IN_PROGRESS,
            dueDate: new Date('2026-10-15'),
          },
          {
            name: 'Add Export Reports',
            description: 'Add the ability to export analytics reports.',
            priority: TaskPriority.LOW,
            status: TaskStatus.PENDING,
            dueDate: new Date('2026-10-25'),
          },
        ],
      },
    },
  });

  console.log('🎉 Seeding completed successfully!');
  console.log(`\nDemo Credentials:\nEmail: ${demoEmail}\nPassword: ${plainPassword}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
