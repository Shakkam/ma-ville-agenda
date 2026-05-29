#!/usr/bin/env node

const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'Shakkam';
const REPO = 'ma-ville-agenda';

if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable not set');
  console.error('Set it with: export GITHUB_TOKEN=your_token');
  process.exit(1);
}

const epics = [
  {
    number: 1,
    title: '[EPIC] Backend API Setup',
    body: 'Set up Node.js + Express API with Prisma ORM and Supabase PostgreSQL\n\n## Stories\n- Story 1.1: Initialize Node.js + Express project\n- Story 1.2: Configure Prisma ORM\n- Story 1.3: Set up API structure\n- Story 1.4: Configure environment variables',
    labels: ['epic', 'backend']
  },
  {
    number: 2,
    title: '[EPIC] Mobile App Setup',
    body: 'Initialize React Native + Expo app with navigation and core components\n\n## Stories\n- Story 2.1: Initialize Expo project\n- Story 2.2: Set up navigation\n- Story 2.3: Create app shell and theming\n- Story 2.4: Configure API client',
    labels: ['epic', 'mobile']
  },
  {
    number: 3,
    title: '[EPIC] Backoffice Admin Setup',
    body: 'Initialize Next.js backoffice with authentication and admin pages\n\n## Stories\n- Story 3.1: Initialize Next.js project\n- Story 3.2: Set up authentication\n- Story 3.3: Create admin layout\n- Story 3.4: Configure API routes',
    labels: ['epic', 'backoffice']
  },
  {
    number: 4,
    title: '[EPIC] Event Management',
    body: 'Create, read, filter, and validate events across all platforms\n\n## Stories\n- Story 4.1: Create Event data model\n- Story 4.2: Implement POST /events\n- Story 4.3: Implement GET /events\n- Story 4.4: Implement GET /events/:id\n- Story 4.5-9: UI implementations',
    labels: ['epic', 'feature']
  },
  {
    number: 5,
    title: '[EPIC] Authentication & Security',
    body: 'Implement Supabase Auth, JWT tokens, and secure backoffice access\n\n## Stories\n- Story 5.1: Configure Supabase Auth\n- Story 5.2: JWT token generation\n- Story 5.3: Protect API endpoints\n- Story 5.4: Super-admin login\n- Story 5.5: Session management',
    labels: ['epic', 'security']
  },
  {
    number: 6,
    title: '[EPIC] Image Upload & Processing',
    body: 'Handle image compression client-side and upload to Vercel Blob\n\n## Stories\n- Story 6.1: Configure Vercel Blob\n- Story 6.2: Implement upload endpoint\n- Story 6.3: Client-side compression\n- Story 6.4: Image preview\n- Story 6.5: Image display',
    labels: ['epic', 'feature']
  },
  {
    number: 7,
    title: '[EPIC] Deployment & DevOps',
    body: 'Set up CI/CD, Vercel deployment, Supabase connection, and monitoring\n\n## Stories\n- Story 7.1: GitHub Actions CI/CD\n- Story 7.2: Vercel deployment (backoffice)\n- Story 7.3: Vercel deployment (API)\n- Story 7.4: Environment configuration\n- Story 7.5: Monitoring setup\n- Story 7.6: Expo build',
    labels: ['epic', 'devops']
  },
  {
    number: 8,
    title: '[EPIC] Testing & QA',
    body: 'Implement unit, integration, and E2E tests for all packages\n\n## Stories\n- Story 8.1: Set up testing framework\n- Story 8.2: API unit tests\n- Story 8.3: Component unit tests\n- Story 8.4: Integration tests\n- Story 8.5-6: E2E tests\n- Story 8.7: Coverage reporting',
    labels: ['epic', 'testing']
  }
];

async function createIssue(issue) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      title: issue.title,
      body: issue.body,
      labels: issue.labels
    });

    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${OWNER}/${REPO}/issues`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ma-ville-agenda-setup'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 201) {
            resolve(response);
          } else {
            reject(new Error(`GitHub API error: ${res.statusCode} - ${response.message || data}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log(`Creating ${epics.length} epics on GitHub...\n`);

  for (const epic of epics) {
    try {
      const result = await createIssue(epic);
      console.log(`✅ Created: #${result.number} - ${result.title}`);
      console.log(`   URL: ${result.html_url}\n`);

      // Rate limiting: wait 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Failed to create: ${epic.title}`);
      console.error(`   Error: ${error.message}\n`);
    }
  }

  console.log('Done! All epics created.');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
