-- ============================================================
-- Gighub ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Complete Seed Data Generator
-- ============================================================
-- Generates: gigs, jobs, proposals, orders, escrows, chat rooms,
--            chat messages, wallets, wallet records, reviews
--
-- Uses existing profiles & categories from CSV imports.
-- Ensures no user buys their own gig/job.
-- Every gig has exactly 3 packages (BASIC, STANDARD, PREMIUM).
-- ============================================================

-- ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Helper: generate a unique slug ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Helper: staggered timestamp for realistic seed data ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
-- Each call returns a time progressively further in the past.
-- gig/job counter starts at 0, increments per insert.
CREATE OR REPLACE FUNCTION ts_stagger(p_offset_days INT, p_hour INT, p_min INT DEFAULT 0)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN now() - (p_offset_days || ' days')::INTERVAL + (p_hour || ' hours')::INTERVAL + (p_min || ' minutes')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Helper function to generate order codes ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
CREATE OR REPLACE FUNCTION temp_gen_order_code(p_source TEXT)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_date TEXT;
  v_random TEXT;
BEGIN
  v_prefix := CASE WHEN p_source = 'GIG' THEN 'GG' ELSE 'JB' END;
  v_date := to_char(now(), 'YYMMDD');
  v_random := substring(md5(random()::text) from 1 for 4);
  RETURN v_prefix || '-' || v_date || '-' || v_random;
END;
$$ LANGUAGE plpgsql;

-- ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Seed data starts here ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
DO $$
DECLARE
  -- Profile IDs (from CSV)
  p_mfatin     UUID := '7681f538-b3df-4592-8cc0-002c8f09feb7';
  p_fabiha     UUID := '27d3284c-123f-475c-ab22-138e95e90642';
  p_khusbul    UUID := '7760e9c8-91f5-4c14-b1df-9eeb088512b9';
  p_faria      UUID := '1826cbd2-0832-4c2e-b03f-62ac5eadc89d';
  p_maisha     UUID := '6e93e14f-914c-4e57-b0de-6ac491a16035';
  p_ahmed      UUID := '8bb9fa39-d499-4d66-9ec9-64910608bfc9';

  -- Category IDs (from CSV)
  cat_webdev          UUID := 'fa6dedc2-277e-43bf-a20c-c7aae7cf0ccd';
  cat_frontend        UUID := '36302099-e138-46be-8af4-104a9aa8f847';
  cat_mobile          UUID := 'a76d6496-9851-4dc7-b9b6-a9a4d4091761';
  cat_uiux            UUID := '442c0c15-81a0-4a2c-a9c8-778c584bb517';
  cat_graphic         UUID := '556f863a-3c1b-4d44-b832-8690e8ed4b01';
  cat_video           UUID := '5ab29ce1-602e-46e3-a13e-cad1dde8f563';
  cat_digital_mktg    UUID := 'faaf9327-957d-43ed-a855-b7698355ed42';
  cat_writing         UUID := 'e79fbc02-2e9e-443f-a888-9212347d8106';
  cat_aiml            UUID := 'f7d9d5fe-e766-4e0f-b547-7191c9cf2bcc';
  cat_datascience     UUID := '3a8fc5cc-d389-40ae-9c2c-808451a167a6';
  cat_clouddevops     UUID := '1cc1d14b-b599-4217-9f99-954de6f3dc6e';
  cat_cybersec        UUID := 'e785add7-1b6e-47c7-9607-c8c9ade876fc';
  cat_dbadmin         UUID := 'd2808c46-17f0-4658-9036-438cd7fce5df';
  cat_qatesting       UUID := 'ca0c09d8-a8dd-4c2b-96c9-813b8d401f7a';
  cat_gamedev         UUID := '0858c0c0-6d85-4d8b-8f76-19d595682469';
  cat_ecom            UUID := '75e56ebb-b140-4b56-90f6-6aa5d51063ba';
  cat_wordpress       UUID := '6271568a-644b-424d-9bea-c253afbd1f30';
  cat_blockchain      UUID := '08ce4b23-e70d-420b-90e6-a4ae20fae242';
  cat_desktop         UUID := '9373cb7e-67ba-4dee-85a6-33f379171d61';
  cat_other           UUID := '1c972ec8-f5b8-466a-bd5f-40b20d04c61d';
  cat_businessconsult UUID := '011e9bb3-ce57-4a2a-8bbd-e094a4b2e393';

  -- Variables
  v_gig_id    UUID;
  v_job_id    UUID;
  v_prop_id   UUID;
  v_order_id  UUID;
  v_code      TEXT;
  v_slug      TEXT;
  v_now       TIMESTAMPTZ := now();
  v_ts        TIMESTAMPTZ;
  v_deadline  TIMESTAMPTZ;
  v_price     NUMERIC(12,2);
  v_fee       NUMERIC(12,2);
  v_escrow_id UUID;
  v_wallet_id UUID;
  v_buyer_id  UUID;
  v_seller_id UUID;
  v_title     TEXT;
  v_gig_ids   UUID[] := '{}';
  v_job_ids   UUID[] := '{}';
  v_prop_ids  UUID[] := '{}';
  v_order_ids UUID[] := '{}';
  v_idx       INT;
  v_counter   INT := 0;

  -- Arrays of profile IDs for iteration
  v_profiles UUID[] := ARRAY[
    '7681f538-b3df-4592-8cc0-002c8f09feb7',
    '27d3284c-123f-475c-ab22-138e95e90642',
    '7760e9c8-91f5-4c14-b1df-9eeb088512b9',
    '1826cbd2-0832-4c2e-b03f-62ac5eadc89d',
    '6e93e14f-914c-4e57-b0de-6ac491a16035',
    '8bb9fa39-d499-4d66-9ec9-64910608bfc9'
  ];
  v_pname TEXT[];
BEGIN

-- ============================================================
-- 1. GIGS ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â 5 per profile ÃƒÆ’Ã¢â‚¬â€ 6 profiles = 30 gigs
-- ============================================================

-- ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Mohammad Fatin Nur (full-stack dev, AI) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

-- Gig 1: 5 days ago, 10:00 AM
v_ts := v_now - interval '5 days' + interval '10 hours';
INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_mfatin, cat_webdev, 'Full-Stack Web Application with AI Integration',
  'full-stack-web-application-with-ai-integration-' || to_char(v_ts, 'YYMMDDHH24MISS'),
  'I will build a complete full-stack web application with AI features including chatbots, recommendation engines, and intelligent search. Using React/Next.js frontend with Node.js/Python backend.',
  '{}', ARRAY['react', 'nextjs', 'ai', 'nodejs', 'python', 'fullstack'],
  '[{"title":"Basic Website","tier":"BASIC","description":"5-page responsive website with contact form","price":150,"delivery_days":7,"revisions":2,"features":["5 pages","Responsive design","Contact form","Basic SEO","1 revision"]},{"title":"Standard Web App","tier":"STANDARD","description":"Full-stack web app with database, auth, and AI chatbot","price":350,"delivery_days":14,"revisions":3,"features":["Up to 10 pages","User auth","Database integration","AI chatbot","API endpoints","3 revisions"]},{"title":"Premium AI Platform","tier":"PREMIUM","description":"Enterprise-grade AI-powered web platform with custom ML models","price":800,"delivery_days":30,"revisions":5,"features":["Unlimited pages","Custom AI/ML models","Admin dashboard","Real-time features","Priority support","5 revisions","Deployment"]}]',
  '[{"question":"What technologies do you use?","answer":"React, Next.js, Node.js, Python, PostgreSQL, and various AI/ML frameworks."},{"question":"Do you provide hosting?","answer":"Yes, I can help with deployment on Vercel, AWS, or any cloud platform."}]',
  'ACTIVE', v_ts, v_ts);

-- Gig 2: 4 days ago, 2:30 PM
v_ts := v_now - interval '4 days' + interval '14 hours' + interval '30 minutes';
INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_mfatin, cat_aiml, 'Custom AI Chatbot Development',
  'custom-ai-chatbot-development-' || to_char(v_ts, 'YYMMDDHH24MISS'),
  'Build intelligent chatbots powered by GPT, Claude, or open-source LLMs. Includes training on your data, multi-channel deployment, and analytics dashboard.',
  '{}', ARRAY['chatbot', 'gpt', 'llm', 'ai', 'nlp', 'automation'],
  '[{"title":"Basic Chatbot","tier":"BASIC","description":"Simple rule-based chatbot with FAQ handling","price":100,"delivery_days":5,"revisions":2,"features":["FAQ responses","Basic NLP","Single channel","2 revisions"]},{"title":"Standard AI Chatbot","tier":"STANDARD","description":"AI-powered chatbot with custom training and multi-channel support","price":300,"delivery_days":12,"revisions":3,"features":["GPT integration","Custom training","Web + WhatsApp","Analytics","3 revisions"]},{"title":"Premium Enterprise Bot","tier":"PREMIUM","description":"Full-featured AI assistant with RAG, multi-LLM, and advanced analytics","price":750,"delivery_days":25,"revisions":5,"features":["RAG architecture","Multi-LLM support","All channels","Advanced analytics","Admin panel","5 revisions","SLA support"]}]',
  '[{"question":"Can you train it on my company data?","answer":"Absolutely! I use RAG to train on your documents, FAQs, and knowledge base."},{"question":"Which platforms can it integrate with?","answer":"Web, WhatsApp, Messenger, Slack, Discord, and Telegram."}]',
  'ACTIVE', v_ts, v_ts);

-- Gig 3: 4 days ago, 4:00 PM
v_ts := v_now - interval '4 days' + interval '16 hours';
INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_mfatin, cat_webdev, 'RESTful API Development with Node.js',
  'restful-api-development-with-nodejs-' || to_char(v_ts, 'YYMMDDHH24MISS'),
  'Design and build scalable RESTful APIs using Node.js, Express, and PostgreSQL. Includes authentication, rate limiting, documentation, and testing.',
  '{}', ARRAY['api', 'nodejs', 'express', 'rest', 'backend'],
  '[{"title":"Basic API","tier":"BASIC","description":"Simple CRUD API with 5 endpoints","price":120,"delivery_days":5,"revisions":2,"features":["5 endpoints","Basic auth","Documentation","2 revisions"]},{"title":"Standard API","tier":"STANDARD","description":"Full-featured API with auth, roles, and 15 endpoints","price":300,"delivery_days":10,"revisions":3,"features":["15 endpoints","JWT auth","Role-based access","Swagger docs","Rate limiting","3 revisions"]},{"title":"Premium API Suite","tier":"PREMIUM","description":"Enterprise API with caching, queue, monitoring, and 30+ endpoints","price":650,"delivery_days":20,"revisions":5,"features":["30+ endpoints","Redis caching","Message queue","Monitoring","Auto-scaling","5 revisions","CI/CD setup"]}]',
  '[{"question":"Do you include API testing?","answer":"Yes, I include unit tests and integration tests using Jest."},{"question":"Can you integrate with existing databases?","answer":"Yes, I can work with PostgreSQL, MySQL, MongoDB, or your existing DB."}]',
  'ACTIVE', v_ts, v_ts);

-- Gig 4: 3 days ago, 9:15 AM
v_ts := v_now - interval '3 days' + interval '9 hours' + interval '15 minutes';
INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_mfatin, cat_datascience, 'Data Dashboard & Analytics Platform',
  'data-dashboard-analytics-platform-' || to_char(v_ts, 'YYMMDDHH24MISS'),
  'Build interactive data dashboards with real-time analytics, charts, and export capabilities. Using React, D3.js, and Python backend.',
  '{}', ARRAY['dashboard', 'analytics', 'd3js', 'python', 'visualization'],
  '[{"title":"Basic Dashboard","tier":"BASIC","description":"Static dashboard with 3 charts and CSV upload","price":130,"delivery_days":6,"revisions":2,"features":["3 charts","CSV upload","Basic filters","2 revisions"]},{"title":"Standard Analytics","tier":"STANDARD","description":"Interactive dashboard with 10 charts, filters, and real-time data","price":320,"delivery_days":14,"revisions":3,"features":["10 charts","Real-time updates","Advanced filters","Export PDF/Excel","API integration","3 revisions"]},{"title":"Premium BI Platform","tier":"PREMIUM","description":"Full BI platform with ML insights, role-based access, and automated reports","price":700,"delivery_days":28,"revisions":5,"features":["Unlimited charts","ML-powered insights","Role-based access","Automated reports","Scheduled emails","5 revisions","Custom branding"]}]',
  '[{"question":"Can you connect to my database?","answer":"Yes, I can connect to PostgreSQL, MySQL, MongoDB, or any SQL database."},{"question":"Is it mobile responsive?","answer":"Yes, all dashboards are fully responsive across all devices."}]',
  'ACTIVE', v_ts, v_ts);

-- Gig 5: 3 days ago, 11:45 AM
v_ts := v_now - interval '3 days' + interval '11 hours' + interval '45 minutes';
INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_mfatin, cat_clouddevops, 'CI/CD Pipeline Setup & DevOps Automation',
  'cicd-pipeline-setup-devops-automation-' || to_char(v_ts, 'YYMMDDHH24MISS'),
  'Set up complete CI/CD pipelines, automated deployments, and infrastructure as code. Supporting GitHub Actions, Docker, and cloud platforms.',
  '{}', ARRAY['devops', 'cicd', 'docker', 'github-actions', 'automation'],
  '[{"title":"Basic Pipeline","tier":"BASIC","description":"Simple CI/CD pipeline with automated testing","price":100,"delivery_days":4,"revisions":1,"features":["CI setup","Auto testing","GitHub Actions","1 revision"]},{"title":"Standard DevOps","tier":"STANDARD","description":"Full CI/CD with Docker, staging/prod, and monitoring","price":280,"delivery_days":10,"revisions":2,"features":["CI/CD pipeline","Docker setup","Staging + prod","Basic monitoring","Slack alerts","2 revisions"]},{"title":"Premium Infrastructure","tier":"PREMIUM","description":"Complete DevOps with IaC, k8s, auto-scaling, and 24/7 monitoring","price":600,"delivery_days":21,"revisions":3,"features":["Infrastructure as Code","Kubernetes setup","Auto-scaling","Full monitoring","Disaster recovery","3 revisions","SLA support"]}]',
  '[{"question":"Which cloud providers do you support?","answer":"AWS, Google Cloud, Azure, and DigitalOcean."},{"question":"Do you include security scanning?","answer":"Yes, I include vulnerability scanning and dependency checks in the pipeline."}]',
  'ACTIVE', v_ts, v_ts);

-- ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Fabiha Islam (mobile dev, Flutter) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

-- Gig 6: 5 days ago, 8:30 AM
v_ts := v_now - interval '5 days' + interval '8 hours' + interval '30 minutes';
INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_fabiha, cat_mobile, 'Cross-Platform Mobile App with Flutter',
  'cross-platform-mobile-app-flutter-' || to_char(v_ts, 'YYMMDDHH24MISS'),
  'Build beautiful cross-platform mobile apps for iOS and Android using Flutter & Dart. Includes custom UI, state management, and backend integration.',
  '{}', ARRAY['flutter', 'dart', 'mobile', 'ios', 'android', 'cross-platform'],
  '[{"title":"Basic App","tier":"BASIC","description":"Simple single-screen app with basic UI","price":120,"delivery_days":7,"revisions":2,"features":["Single screen","Basic UI","iOS + Android","2 revisions"]},{"title":"Standard App","tier":"STANDARD","description":"Multi-screen app with API integration and state management","price":350,"delivery_days":15,"revisions":3,"features":["5 screens","API integration","State management","Push notifications","Auth system","3 revisions"]},{"title":"Premium App","tier":"PREMIUM","description":"Full-featured app with custom animations, offline mode, and admin panel","price":800,"delivery_days":30,"revisions":5,"features":["Unlimited screens","Custom animations","Offline mode","Admin panel","Real-time features","Payment integration","5 revisions"]}]',
  '[{"question":"Do you publish to App Store and Play Store?","answer":"Yes, I handle the full deployment process to both stores."},{"question":"Can you integrate Firebase?","answer":"Yes, I use Firebase for auth, database, push notifications, and analytics."}]',
  'ACTIVE', ts_stagger(5, 8, 0), ts_stagger(5, 8, 0));

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_fabiha, cat_mobile, 'React Native App Development',
  'react-native-app-development-' || to_char(v_now, 'YYMMDDHH24MISS') || '07',
  'Develop high-performance mobile apps using React Native with Expo. Features include smooth navigation, native modules, and OTA updates.',
  '{}', ARRAY['react-native', 'expo', 'mobile', 'ios', 'android'],
  '[{"title":"Basic App","tier":"BASIC","description":"Simple React Native app with 2 screens","price":100,"delivery_days":6,"revisions":2,"features":["2 screens","Navigation","iOS + Android","2 revisions"]},{"title":"Standard App","tier":"STANDARD","description":"Feature-rich app with backend, auth, and 8 screens","price":320,"delivery_days":14,"revisions":3,"features":["8 screens","Backend integration","Auth system","Push notifications","Expo updates","3 revisions"]},{"title":"Premium App","tier":"PREMIUM","description":"Enterprise app with native modules, real-time, and analytics","price":700,"delivery_days":28,"revisions":5,"features":["Unlimited screens","Native modules","Real-time sync","Analytics","Payment gateway","5 revisions","App store deploy"]}]',
  '[{"question":"Expo or bare React Native?","answer":"I use Expo by default but can eject to bare workflow if needed."},{"question":"Do you include app store assets?","answer":"Yes, I provide app icons, screenshots, and store descriptions."}]',
  'ACTIVE', ts_stagger(4, 9, 0), ts_stagger(4, 9, 0));

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_fabiha, cat_uiux, 'Mobile App UI/UX Design',
  'mobile-app-ui-ux-design-' || to_char(v_now, 'YYMMDDHH24MISS') || '08',
  'Design stunning mobile app interfaces with pixel-perfect Figma designs. Includes wireframes, prototyping, and design system creation.',
  '{}', ARRAY['ui-design', 'ux-design', 'figma', 'mobile', 'prototyping'],
  '[{"title":"Basic Design","tier":"BASIC","description":"5 screen designs with wireframes","price":80,"delivery_days":4,"revisions":2,"features":["5 screens","Wireframes","Figma source","2 revisions"]},{"title":"Standard Design","tier":"STANDARD","description":"15 screen designs with full prototype and design system","price":200,"delivery_days":8,"revisions":3,"features":["15 screens","Interactive prototype","Design system","Component library","3 revisions"]},{"title":"Premium Design","tier":"PREMIUM","description":"Complete app design with 30+ screens, animations, and brand guide","price":450,"delivery_days":18,"revisions":5,"features":["30+ screens","Micro-animations","Brand guide","Developer handoff","User flow docs","5 revisions","Asset export"]}]',
  '[{"question":"Do you provide developer handoff?","answer":"Yes, I prepare all designs with specs, assets, and Zeplin/Figma dev mode."},{"question":"Can you redesign my existing app?","answer":"Yes, I can audit and redesign your existing app with improved UX."}]',
  'ACTIVE', ts_stagger(4, 11, 15), ts_stagger(4, 11, 15));

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_fabiha, cat_webdev, 'Firebase Backend Integration',
  'firebase-backend-integration-' || to_char(v_now, 'YYMMDDHH24MISS') || '09',
  'Integrate Firebase services into your app: authentication, Firestore database, cloud functions, storage, and analytics.',
  '{}', ARRAY['firebase', 'backend', 'auth', 'cloud-functions', 'firestore'],
  '[{"title":"Basic Setup","tier":"BASIC","description":"Firebase project setup with auth and Firestore","price":90,"delivery_days":3,"revisions":2,"features":["Project setup","Email/password auth","Firestore DB","2 revisions"]},{"title":"Standard Integration","tier":"STANDARD","description":"Full Firebase integration with cloud functions and storage","price":250,"delivery_days":8,"revisions":3,"features":["Auth (all methods)","Firestore + rules","Cloud functions","File storage","Analytics","3 revisions"]},{"title":"Premium Backend","tier":"PREMIUM","description":"Complete Firebase backend with custom functions, security, and monitoring","price":550,"delivery_days":18,"revisions":5,"features":["Custom cloud funcs","Security rules","Push notifications","Performance monitoring","A/B testing","5 revisions","SLA support"]}]',
  '[{"question":"Can you migrate from another backend?","answer":"Yes, I can migrate from any backend to Firebase."},{"question":"Do you set up security rules?","answer":"Yes, I write comprehensive security rules for Firestore and Storage."}]',
  'ACTIVE', ts_stagger(3, 10, 0), ts_stagger(3, 10, 0));

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_fabiha, cat_qatesting, 'Mobile App Testing & QA',
  'mobile-app-testing-qa-' || to_char(v_now, 'YYMMDDHH24MISS') || '10',
  'Comprehensive mobile app testing including manual, automated, and performance testing for both iOS and Android apps.',
  '{}', ARRAY['testing', 'qa', 'mobile', 'automation', 'flutter-test'],
  '[{"title":"Basic Testing","tier":"BASIC","description":"Manual testing with 10 test cases and bug report","price":70,"delivery_days":3,"revisions":1,"features":["10 test cases","Manual testing","Bug report","1 revision"]},{"title":"Standard QA","tier":"STANDARD","description":"Manual + automated testing with 30 test cases","price":180,"delivery_days":7,"revisions":2,"features":["30 test cases","Automated tests","Performance test","Test report","2 revisions"]},{"title":"Premium QA Suite","tier":"PREMIUM","description":"Full QA pipeline with CI integration, 100+ tests, and load testing","price":400,"delivery_days":14,"revisions":3,"features":["100+ test cases","CI/CD integration","Load testing","Security testing","Test documentation","3 revisions","Ongoing support"]}]',
  '[{"question":"Do you test on real devices?","answer":"Yes, I test on real iOS and Android devices in addition to emulators."},{"question":"Can you integrate with my CI pipeline?","answer":"Yes, I can set up automated testing in your CI/CD pipeline."}]',
  'ACTIVE', ts_stagger(2, 11, 0), ts_stagger(2, 11, 0));

-- ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Khusbul Alam (data analyst, ML) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_khusbul, cat_datascience, 'Data Analysis & Visualization Service',
  'data-analysis-visualization-service-' || to_char(v_now, 'YYMMDDHH24MISS') || '11',
  'Transform raw data into actionable insights with comprehensive analysis, beautiful visualizations, and detailed reports using Python.',
  '{}', ARRAY['data-analysis', 'python', 'visualization', 'pandas', 'matplotlib'],
  '[{"title":"Basic Analysis","tier":"BASIC","description":"Basic data analysis with 5 visualizations","price":80,"delivery_days":3,"revisions":2,"features":["Data cleaning","5 visualizations","Summary report","2 revisions"]},{"title":"Standard Analytics","tier":"STANDARD","description":"In-depth analysis with 15 visualizations and insights","price":200,"delivery_days":7,"revisions":3,"features":["Exploratory analysis","15 visualizations","Statistical tests","Insights report","Dashboard","3 revisions"]},{"title":"Premium Data Suite","tier":"PREMIUM","description":"Full data pipeline with ML models, interactive dashboard, and deployment","price":500,"delivery_days":18,"revisions":5,"features":["Data pipeline","ML model building","Interactive dashboard","Automated reporting","API deployment","5 revisions","Ongoing support"]}]',
  '[{"question":"What data formats do you accept?","answer":"CSV, Excel, JSON, SQL databases, and API data sources."},{"question":"Do you provide the code?","answer":"Yes, I provide all code as Jupyter notebooks or Python scripts."}]',
  'ACTIVE', ts_stagger(5, 10, 15), ts_stagger(5, 10, 15));

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_khusbul, cat_aiml, 'Machine Learning Model Development',
  'machine-learning-model-development-' || to_char(v_now, 'YYMMDDHH24MISS') || '12',
  'Build custom ML models for classification, regression, clustering, and time series forecasting. Includes data prep, training, and deployment.',
  '{}', ARRAY['machine-learning', 'python', 'scikit-learn', 'tensorflow', 'mlops'],
  '[{"title":"Basic Model","tier":"BASIC","description":"Simple ML model with basic preprocessing","price":150,"delivery_days":5,"revisions":2,"features":["Data preprocessing","Model training","Accuracy report","2 revisions"]},{"title":"Standard Model","tier":"STANDARD","description":"Optimized ML model with feature engineering and hyperparameter tuning","price":400,"delivery_days":12,"revisions":3,"features":["Feature engineering","Hyperparameter tuning","Cross-validation","Model comparison","API endpoint","3 revisions"]},{"title":"Premium ML Pipeline","tier":"PREMIUM","description":"End-to-end ML pipeline with MLOps, monitoring, and production deployment","price":900,"delivery_days":25,"revisions":5,"features":["Full MLOps pipeline","AutoML comparison","Model monitoring","A/B testing","Production deployment","5 revisions","Documentation"]}]',
  '[{"question":"Which ML frameworks do you use?","answer":"Scikit-learn, TensorFlow, PyTorch, and XGBoost depending on the problem."},{"question":"Can you deploy the model?","answer":"Yes, I deploy as REST API, Docker container, or serverless function."}]',
  'ACTIVE', ts_stagger(4, 15, 30), ts_stagger(4, 15, 30));

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_khusbul, cat_dbadmin, 'SQL Database Design & Optimization',
  'sql-database-design-optimization-' || to_char(v_now, 'YYMMDDHH24MISS') || '13',
  'Design efficient database schemas, write optimized queries, and improve database performance. Supporting PostgreSQL, MySQL, and SQL Server.',
  '{}', ARRAY['sql', 'database', 'postgresql', 'optimization', 'query'],
  '[{"title":"Basic Design","tier":"BASIC","description":"Simple database schema with 5 tables","price":100,"delivery_days":3,"revisions":2,"features":["Schema design","5 tables","Basic queries","2 revisions"]},{"title":"Standard Optimization","tier":"STANDARD","description":"Full database design with optimization, indexing, and 15 tables","price":280,"delivery_days":8,"revisions":3,"features":["15 tables","Indexing strategy","Query optimization","Stored procedures","ER diagram","3 revisions"]},{"title":"Premium Database Suite","tier":"PREMIUM","description":"Enterprise database architecture with replication, sharding, and monitoring","price":600,"delivery_days":20,"revisions":5,"features":["Unlimited tables","Replication setup","Sharding strategy","Performance monitoring","Backup strategy","5 revisions","Migration script"]}]',
  '[{"question":"Can you migrate my database?","answer":"Yes, I handle migrations from any database to another with zero downtime."},{"question":"Do you include backup solutions?","answer":"Yes, I set up automated backup and disaster recovery strategies."}]',
  'ACTIVE', ts_stagger(4, 17, 45), ts_stagger(4, 17, 45));

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_khusbul, cat_webdev, 'Python Web Scraping & Automation',
  'python-web-scraping-automation-' || to_char(v_now, 'YYMMDDHH24MISS') || '14',
  'Build reliable web scrapers and automation scripts using Python. Extract data from websites, APIs, and documents at scale.',
  '{}', ARRAY['web-scraping', 'python', 'automation', 'beautifulsoup', 'selenium'],
  '[{"title":"Basic Scraper","tier":"BASIC","description":"Simple scraper for one website with CSV export","price":80,"delivery_days":3,"revisions":2,"features":["Single website","CSV export","Basic error handling","2 revisions"]},{"title":"Standard Automation","tier":"STANDARD","description":"Multi-page scraper with scheduling and data cleaning","price":220,"delivery_days":7,"revisions":3,"features":["Multiple pages","Data cleaning","Scheduling","JSON/CSV export","Proxy support","3 revisions"]},{"title":"Premium Data Pipeline","tier":"PREMIUM","description":"Enterprise scraping pipeline with anti-bot bypass, cloud deployment, and monitoring","price":500,"delivery_days":16,"revisions":5,"features":["Anti-bot bypass","Cloud deployment","Auto-scaling","Data pipeline","Monitoring alerts","5 revisions","API access"]}]',
  '[{"question":"Is web scraping legal?","answer":"I only scrape publicly available data and follow robots.txt guidelines."},{"question":"Can you handle JavaScript websites?","answer":"Yes, I use Selenium and Playwright for JS-rendered content."}]',
  'ACTIVE', ts_stagger(3, 12, 15), ts_stagger(3, 12, 15));

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_khusbul, cat_businessconsult, 'Data-Driven Business Consulting',
  'data-driven-business-consulting-' || to_char(v_now, 'YYMMDDHH24MISS') || '15',
  'Leverage data analytics to make informed business decisions. Includes market analysis, KPI tracking, and growth strategy recommendations.',
  '{}', ARRAY['consulting', 'business', 'analytics', 'strategy', 'kpi'],
  '[{"title":"Basic Audit","tier":"BASIC","description":"Business data audit with 5 KPI recommendations","price":120,"delivery_days":5,"revisions":2,"features":["Data audit","5 KPI recommendations","Executive summary","2 revisions"]},{"title":"Standard Consulting","tier":"STANDARD","description":"Full business analysis with market research and 15 KPIs","price":350,"delivery_days":14,"revisions":3,"features":["Market research","15 KPIs","Competitor analysis","Growth strategy","Dashboard","3 revisions"]},{"title":"Premium Strategy","tier":"PREMIUM","description":"Complete business transformation with predictive analytics and automation","price":800,"delivery_days":30,"revisions":5,"features":["Predictive analytics","Process automation","ROI forecasting","Team training","Quarterly review","5 revisions","Ongoing support"]}]',
  '[{"question":"What industries do you specialize in?","answer":"E-commerce, SaaS, Education, and Healthcare."},{"question":"Do you provide actionable recommendations?","answer":"Yes, every analysis comes with prioritized, actionable recommendations."}]',
  'ACTIVE', ts_stagger(2, 13, 15), ts_stagger(2, 13, 15));

-- ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Faria Alam (DevOps, cloud) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_faria, cat_clouddevops, 'Kubernetes Cluster Setup & Management',
  'kubernetes-cluster-setup-management-' || to_char(v_now, 'YYMMDDHH24MISS') || '16',
  'Set up production-grade Kubernetes clusters on AWS, GCP, or Azure. Includes networking, security, monitoring, and auto-scaling.',
  '{}', ARRAY['kubernetes', 'k8s', 'devops', 'docker', 'cloud'],
  '[{"title":"Basic Setup","tier":"BASIC","description":"Single-node K8s cluster with basic config","price":150,"delivery_days":5,"revisions":2,"features":["Single node","Basic networking","Dashboard","2 revisions"]},{"title":"Standard Cluster","tier":"STANDARD","description":"Multi-node production cluster with monitoring and CI/CD","price":400,"delivery_days":12,"revisions":3,"features":["Multi-node","Auto-scaling","Monitoring stack","CI/CD integration","Ingress setup","3 revisions"]},{"title":"Premium Enterprise","tier":"PREMIUM","description":"Enterprise K8s with service mesh, GitOps, security, and DR","price":900,"delivery_days":25,"revisions":5,"features":["Multi-cluster","Service mesh","GitOps (ArgoCD)","Security scanning","Disaster recovery","5 revisions","24/7 support"]}]',
  '[{"question":"Which cloud provider do you recommend?","answer":"It depends on your needs. I have experience with AWS EKS, GCP GKE, and Azure AKS."},{"question":"Do you include security hardening?","answer":"Yes, I follow CIS benchmarks for Kubernetes security hardening."}]',
  'ACTIVE', ts_stagger(5, 14, 30), ts_stagger(5, 14, 30));

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_faria, cat_clouddevops, 'Terraform Infrastructure as Code',
  'terraform-infrastructure-as-code-' || to_char(v_now, 'YYMMDDHH24MISS') || '17',
  'Write production-ready Terraform code to manage your cloud infrastructure. Modular, version-controlled, and best-practice compliant.',
  '{}', ARRAY['terraform', 'iac', 'infrastructure', 'cloud', 'automation'],
  '[{"title":"Basic Modules","tier":"BASIC","description":"Basic Terraform setup with 3 modules","price":120,"delivery_days":4,"revisions":2,"features":["3 modules","State management","Basic documentation","2 revisions"]},{"title":"Standard Infrastructure","tier":"STANDARD","description":"Complete infrastructure with 10 modules, remote state, and CI","price":350,"delivery_days":10,"revisions":3,"features":["10 modules","Remote state","CI integration","Multiple environments","Security groups","3 revisions"]},{"title":"Premium Platform","tier":"PREMIUM","description":"Enterprise platform with 20+ modules, policy as code, and DR","price":750,"delivery_days":22,"revisions":5,"features":["20+ modules","Policy as code (Sentinel)","Disaster recovery","Cost estimation","Compliance checks","5 revisions","Team training"]}]',
  '[{"question":"Do you support multi-cloud?","answer":"Yes, I can manage AWS, GCP, and Azure in a single Terraform project."},{"question":"Can you migrate from CloudFormation?","answer":"Yes, I can migrate existing CloudFormation to Terraform."}]',
  'ACTIVE', ts_stagger(4, 9, 0), ts_stagger(4, 9, 0));

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_faria, cat_cybersec, 'Cloud Security Audit & Hardening',
  'cloud-security-audit-hardening-' || to_char(v_now, 'YYMMDDHH24MISS') || '18',
  'Comprehensive cloud security assessment including vulnerability scanning, compliance checks, and security hardening recommendations.',
  '{}', ARRAY['security', 'cloud', 'audit', 'compliance', 'hardening'],
  '[{"title":"Basic Audit","tier":"BASIC","description":"Basic security scan with 10-point checklist","price":100,"delivery_days":3,"revisions":1,"features":["Vulnerability scan","10-point checklist","Report","1 revision"]},{"title":"Standard Security","tier":"STANDARD","description":"Full security audit with 25-point checklist and remediation","price":300,"delivery_days":8,"revisions":2,"features":["25-point audit","Penetration test","Compliance check","Remediation plan","Report","2 revisions"]},{"title":"Premium Security Suite","tier":"PREMIUM","description":"Enterprise security with SOC2 compliance, SIEM setup, and ongoing monitoring","price":700,"delivery_days":20,"revisions":3,"features":["SOC2 readiness","SIEM setup","Threat detection","Incident response","Security training","3 revisions","Monthly audits"]}]',
  '[{"question":"Which compliance standards do you cover?","answer":"SOC2, ISO 27001, HIPAA, GDPR, and PCI DSS."},{"question":"Do you provide remediation?","answer":"Yes, I provide step-by-step remediation for all findings."}]',
  'ACTIVE', ts_stagger(4, 11, 15), ts_stagger(4, 11, 15));

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_faria, cat_clouddevops, 'Docker Containerization Service',
  'docker-containerization-service-' || to_char(v_now, 'YYMMDDHH24MISS') || '19',
  'Containerize your applications with Docker. Includes Dockerfile creation, multi-stage builds, docker-compose, and container orchestration.',
  '{}', ARRAY['docker', 'container', 'devops', 'deployment'],
  '[{"title":"Basic Containerization","tier":"BASIC","description":"Dockerfile for a single service","price":60,"delivery_days":2,"revisions":2,"features":["Dockerfile","Multi-stage build","Documentation","2 revisions"]},{"title":"Standard Setup","tier":"STANDARD","description":"Multi-service containerization with docker-compose","price":180,"delivery_days":5,"revisions":3,"features":["Multi-service","Docker-compose","Volume management","Network config","Health checks","3 revisions"]},{"title":"Premium Orchestration","tier":"PREMIUM","description":"Full container platform with CI/CD, registry, and orchestration","price":450,"delivery_days":14,"revisions":5,"features":["Docker Swarm/K8s","Private registry","CI/CD pipeline","Monitoring","Auto-scaling","5 revisions","Documentation"]}]',
  '[{"question":"Can you optimize my existing Dockerfiles?","answer":"Yes, I optimize for smaller image size, faster builds, and better security."},{"question":"Do you include docker-compose for local dev?","answer":"Yes, I set up docker-compose for local development environments."}]',
  'ACTIVE', ts_stagger(3, 16, 30), ts_stagger(3, 16, 30));

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_faria, cat_clouddevops, 'Cloud Migration Service',
  'cloud-migration-service-' || to_char(v_now, 'YYMMDDHH24MISS') || '20',
  'Migrate your applications and infrastructure from on-premise or between cloud providers. Minimal downtime, comprehensive testing.',
  '{}', ARRAY['cloud-migration', 'aws', 'gcp', 'azure', 'devops'],
  '[{"title":"Basic Migration","tier":"BASIC","description":"Simple lift-and-shift migration for 1 server","price":200,"delivery_days":5,"revisions":2,"features":["1 server migration","Basic testing","Downtime plan","2 revisions"]},{"title":"Standard Migration","tier":"STANDARD","description":"Re-platform migration for up to 5 services","price":500,"delivery_days":15,"revisions":3,"features":["5 services","Re-platform","Load testing","Rollback plan","Documentation","3 revisions"]},{"title":"Premium Migration","tier":"PREMIUM","description":"Full re-architecture migration with hybrid cloud and automation","price":1200,"delivery_days":30,"revisions":5,"features":["Unlimited services","Re-architecture","Hybrid cloud","Auto-scaling","DR setup","5 revisions","Post-migration support"]}]',
  '[{"question":"How do you minimize downtime?","answer":"I use blue-green deployment and DNS switching for near-zero downtime."},{"question":"Do you provide post-migration support?","answer":"Yes, I provide 2 weeks of post-migration monitoring and support."}]',
  'ACTIVE', ts_stagger(2, 17, 30), ts_stagger(2, 17, 30));

-- ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Maisha Binte Monir (UI/UX, frontend) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_maisha, cat_uiux, 'Complete UI/UX Design for Web & Mobile',
  'complete-ui-ux-design-web-mobile-' || to_char(v_now, 'YYMMDDHH24MISS') || '21',
  'End-to-end UI/UX design services from research to pixel-perfect prototypes. Specializing in modern, accessible, and conversion-optimized designs.',
  '{}', ARRAY['ui-design', 'ux-design', 'figma', 'web-design', 'mobile-design'],
  '[{"title":"Basic Design","tier":"BASIC","description":"5 page/screen designs with wireframes","price":100,"delivery_days":4,"revisions":2,"features":["5 screens","Wireframes","Figma file","2 revisions"]},{"title":"Standard Package","tier":"STANDARD","description":"15 screens with full prototype, design system, and user flow","price":280,"delivery_days":10,"revisions":3,"features":["15 screens","Interactive prototype","Design system","User flow","Developer handoff","3 revisions"]},{"title":"Premium Experience","tier":"PREMIUM","description":"30+ screens with research, animations, usability testing, and brand guide","price":600,"delivery_days":21,"revisions":5,"features":["30+ screens","User research","Micro-animations","Usability testing","Brand guide","5 revisions","Asset library"]}]',
  '[{"question":"Do you conduct user research?","answer":"Yes, I conduct user interviews, surveys, and competitive analysis."},{"question":"Can you work with my existing brand?","answer":"Yes, I adapt to your existing brand guidelines or create new ones."}]',
  'ACTIVE', ts_stagger(5, 16, 45), ts_stagger(5, 16, 45));

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_maisha, cat_frontend, 'Responsive React/Next.js Frontend Development',
  'responsive-react-nextjs-frontend-development-' || to_char(v_now, 'YYMMDDHH24MISS') || '22',
  'Build beautiful, responsive frontends using React, Next.js, and Tailwind CSS. Performance-optimized, accessible, and SEO-friendly.',
  '{}', ARRAY['react', 'nextjs', 'tailwind', 'frontend', 'typescript'],
  '[{"title":"Basic Page","tier":"BASIC","description":"Single responsive landing page","price":120,"delivery_days":4,"revisions":2,"features":["1 page","Responsive","SEO basics","2 revisions"]},{"title":"Standard Website","tier":"STANDARD","description":"Multi-page website with 5 pages and animations","price":350,"delivery_days":12,"revisions":3,"features":["5 pages","Responsive","Animations","Contact form","Performance opt","3 revisions"]},{"title":"Premium Application","tier":"PREMIUM","description":"Full frontend application with 15+ pages, state management, and testing","price":750,"delivery_days":25,"revisions":5,"features":["15+ pages","State management","Unit tests","E2E tests","PWA support","5 revisions","Documentation"]}]',
  '[{"question":"Do you use TypeScript?","answer":"Yes, I use TypeScript by default for all projects."},{"question":"Can you integrate with any backend?","answer":"Yes, I can integrate with REST APIs, GraphQL, or any backend."}]',
  'ACTIVE', ts_stagger(4, 15, 30), ts_stagger(4, 15, 30));

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_maisha, cat_graphic, 'Brand Identity & Logo Design',
  'brand-identity-logo-design-' || to_char(v_now, 'YYMMDDHH24MISS') || '23',
  'Create memorable brand identities including logo design, color palette, typography, and brand guidelines. Modern, minimal, and impactful.',
  '{}', ARRAY['logo', 'branding', 'graphic-design', 'identity', 'illustration'],
  '[{"title":"Basic Logo","tier":"BASIC","description":"Simple logo design with 3 concepts","price":60,"delivery_days":3,"revisions":2,"features":["3 concepts","Vector file","PNG + SVG","2 revisions"]},{"title":"Standard Branding","tier":"STANDARD","description":"Complete brand identity with logo, palette, typography, and business cards","price":180,"delivery_days":7,"revisions":3,"features":["5 concepts","Color palette","Typography","Business cards","Brand guide","3 revisions"]},{"title":"Premium Identity","tier":"PREMIUM","description":"Full brand identity system with all assets, mockups, and social media kit","price":400,"delivery_days":14,"revisions":5,"features":["Unlimited concepts","Full brand guide","Social media kit","Stationery set","Mockups","5 revisions","Source files"]}]',
  '[{"question":"What file formats do you provide?","answer":"AI, EPS, PDF, PNG, SVG, and JPG."},{"question":"Can you redesign my existing logo?","answer":"Yes, I can modernize your existing logo while keeping brand recognition."}]',
  'ACTIVE', ts_stagger(4, 17, 45), ts_stagger(4, 17, 45));

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_maisha, cat_webdev, 'Tailwind CSS Website Development',
  'tailwind-css-website-development-' || to_char(v_now, 'YYMMDDHH24MISS') || '24',
  'Build stunning, responsive websites using Tailwind CSS. Custom designs, utility-first approach, and rapid development.',
  '{}', ARRAY['tailwind', 'css', 'responsive', 'web-design'],
  '[{"title":"Basic Page","tier":"BASIC","description":"Single landing page with Tailwind","price":80,"delivery_days":2,"revisions":2,"features":["1 landing page","Fully responsive","Tailwind CSS","2 revisions"]},{"title":"Standard Website","tier":"STANDARD","description":"Multi-page website with 5 pages and custom components","price":250,"delivery_days":7,"revisions":3,"features":["5 pages","Custom components","Dark mode","Animations","Form integration","3 revisions"]},{"title":"Premium Design System","tier":"PREMIUM","description":"Complete design system with 20+ components and full documentation","price":550,"delivery_days":18,"revisions":5,"features":["20+ components","Design system","Storybook docs","Theme support","A11y compliant","5 revisions","Component library"]}]',
  '[{"question":"Can I customize the design?","answer":"Yes, Tailwind is highly customizable. I follow your brand guidelines."},{"question":"Do you include responsive design?","answer":"Yes, all websites are fully responsive across all devices."}]',
  'ACTIVE', ts_stagger(3, 18, 45), ts_stagger(3, 18, 45));

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_maisha, cat_video, 'Explainer Video & Motion Graphics',
  'explainer-video-motion-graphics-' || to_char(v_now, 'YYMMDDHH24MISS') || '25',
  'Create engaging explainer videos and motion graphics for your product, service, or brand. Perfect for marketing and social media.',
  '{}', ARRAY['video', 'motion-graphics', 'animation', 'explainer', 'editing'],
  '[{"title":"Basic Video","tier":"BASIC","description":"30-second simple explainer video","price":80,"delivery_days":4,"revisions":2,"features":["30 seconds","Basic animation","Background music","2 revisions"]},{"title":"Standard Video","tier":"STANDARD","description":"60-second professional explainer with custom graphics","price":200,"delivery_days":8,"revisions":3,"features":["60 seconds","Custom graphics","Voice-over","Sound design","Subtitles","3 revisions"]},{"title":"Premium Production","tier":"PREMIUM","description":"2-minute cinematic video with full production value","price":450,"delivery_days":18,"revisions":5,"features":["2 minutes","Cinematic quality","Custom illustrations","Professional VO","Color grading","5 revisions","Social media cuts"]}]',
  '[{"question":"Do you provide script writing?","answer":"Yes, I include script writing and storyboarding in all packages."},{"question":"Can you use my existing footage?","answer":"Yes, I can incorporate your existing footage and brand assets."}]',
  'ACTIVE', ts_stagger(2, 19, 45), ts_stagger(2, 19, 45));

-- ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Ahmed Bin Mostafa (backend, Go, PostgreSQL) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_ahmed, cat_webdev, 'Go Backend API Development',
  'go-backend-api-development-' || to_char(v_now, 'YYMMDDHH24MISS') || '26',
  'Build high-performance backend APIs using Go. Concurrent, type-safe, and production-ready with full documentation and testing.',
  '{}', ARRAY['go', 'golang', 'api', 'backend', 'microservices'],
  '[{"title":"Basic API","tier":"BASIC","description":"Simple CRUD API in Go with 5 endpoints","price":130,"delivery_days":4,"revisions":2,"features":["5 endpoints","Go CRUD","Basic auth","2 revisions"]},{"title":"Standard API","tier":"STANDARD","description":"Full-featured Go API with middleware, DB, and 15 endpoints","price":350,"delivery_days":10,"revisions":3,"features":["15 endpoints","JWT auth","PostgreSQL","Middleware","Swagger docs","3 revisions"]},{"title":"Premium Microservices","tier":"PREMIUM","description":"Go microservices architecture with gRPC, message queue, and monitoring","price":800,"delivery_days":24,"revisions":5,"features":["Microservices","gRPC + REST","Message queue","Docker/K8s","Monitoring","5 revisions","Load testing"]}]',
  '[{"question":"Why Go over Node.js or Python?","answer":"Go offers better performance, concurrency, and type safety for backend services."},{"question":"Do you include database migrations?","answer":"Yes, I include database schema design and migration scripts."}]',
  'ACTIVE', ts_stagger(5, 8, 0), ts_stagger(5, 8, 0));

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_ahmed, cat_dbadmin, 'PostgreSQL Database Architecture & Optimization',
  'postgresql-database-architecture-optimization-' || to_char(v_now, 'YYMMDDHH24MISS') || '27',
  'Design robust PostgreSQL databases with optimal performance. Includes schema design, indexing, query optimization, and replication.',
  '{}', ARRAY['postgresql', 'database', 'optimization', 'sql', 'architecture'],
  '[{"title":"Basic Setup","tier":"BASIC","description":"PostgreSQL schema design with 5 tables","price":100,"delivery_days":3,"revisions":2,"features":["Schema design","5 tables","Indexes","2 revisions"]},{"title":"Standard Optimization","tier":"STANDARD","description":"Full database optimization with 15 tables and performance tuning","price":300,"delivery_days":8,"revisions":3,"features":["15 tables","Query optimization","Performance audit","Replication setup","Backup config","3 revisions"]},{"title":"Premium Architecture","tier":"PREMIUM","description":"Enterprise PostgreSQL with sharding, partitioning, and high availability","price":650,"delivery_days":20,"revisions":5,"features":["Sharding + partitioning","HA setup","Connection pooling","Monitoring","Disaster recovery","5 revisions","Performance SLA"]}]',
  '[{"question":"Can you optimize my slow queries?","answer":"Yes, I analyze query plans, add indexes, and rewrite inefficient queries."},{"question":"Do you set up monitoring?","answer":"Yes, I set up pg_stat_monitoring, pgBadger, and alerting."}]',
  'ACTIVE', ts_stagger(4, 9, 0), ts_stagger(4, 9, 0));

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_ahmed, cat_clouddevops, 'Docker & Kubernetes Deployment',
  'docker-kubernetes-deployment-' || to_char(v_now, 'YYMMDDHH24MISS') || '28',
  'Deploy your applications using Docker and Kubernetes. Includes containerization, orchestration, monitoring, and CI/CD integration.',
  '{}', ARRAY['docker', 'kubernetes', 'deployment', 'devops', 'containers'],
  '[{"title":"Basic Deployment","tier":"BASIC","description":"Docker deployment for 1 application","price":100,"delivery_days":3,"revisions":2,"features":["Dockerfile","Docker-compose","Deployment guide","2 revisions"]},{"title":"Standard K8s Setup","tier":"STANDARD","description":"Kubernetes deployment with 3 services and monitoring","price":350,"delivery_days":10,"revisions":3,"features":["K8s manifests","3 services","Ingress setup","Helm charts","Monitoring","3 revisions"]},{"title":"Premium Platform","tier":"PREMIUM","description":"Full K8s platform with GitOps, auto-scaling, and service mesh","price":750,"delivery_days":22,"revisions":5,"features":["GitOps (ArgoCD)","Auto-scaling","Service mesh","Canary deploy","Log aggregation","5 revisions","SLA support"]}]',
  '[{"question":"Which cloud K8s service do you recommend?","answer":"I recommend based on your cloud: EKS (AWS), GKE (GCP), or AKS (Azure)."},{"question":"Do you include security best practices?","answer":"Yes, I follow pod security policies, network policies, and secrets management."}]',
  'ACTIVE', ts_stagger(4, 11, 15), ts_stagger(4, 11, 15));

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_ahmed, cat_cybersec, 'Backend Security & API Protection',
  'backend-security-api-protection-' || to_char(v_now, 'YYMMDDHH24MISS') || '29',
  'Secure your backend APIs and services against common vulnerabilities. Includes authentication, rate limiting, encryption, and penetration testing.',
  '{}', ARRAY['security', 'api', 'backend', 'authentication', 'encryption'],
  '[{"title":"Basic Security","tier":"BASIC","description":"API security audit with 10 checks","price":100,"delivery_days":3,"revisions":1,"features":["Security audit","10 checks","Report","1 revision"]},{"title":"Standard Protection","tier":"STANDARD","description":"Full API security implementation with auth, rate limiting, and WAF","price":300,"delivery_days":8,"revisions":2,"features":["JWT/OAuth2","Rate limiting","WAF setup","Input validation","Encryption","2 revisions"]},{"title":"Premium Security","tier":"PREMIUM","description":"Enterprise security with SIEM, DDoS protection, and compliance","price":700,"delivery_days":20,"revisions":3,"features":["SIEM integration","DDoS protection","Compliance (SOC2)","Penetration test","Incident response","3 revisions","Monthly reports"]}]',
  '[{"question":"Do you perform penetration testing?","answer":"Yes, I perform automated and manual penetration testing."},{"question":"Can you help with compliance?","answer":"Yes, I help with SOC2, GDPR, HIPAA, and PCI DSS compliance."}]',
  'ACTIVE', ts_stagger(3, 10, 0), ts_stagger(3, 10, 0));

INSERT INTO gig (seller, category, title, slug, description, images, tags, packages, faq, status, created_at, updated_at)
VALUES (p_ahmed, cat_ecom, 'Custom E-commerce Backend System',
  'custom-ecommerce-backend-system-' || to_char(v_now, 'YYMMDDHH24MISS') || '30',
  'Build a robust e-commerce backend with product management, cart, checkout, payment integration, and order management.',
  '{}', ARRAY['ecommerce', 'backend', 'payment', 'api', 'inventory'],
  '[{"title":"Basic Backend","tier":"BASIC","description":"Basic e-commerce API with product CRUD","price":150,"delivery_days":5,"revisions":2,"features":["Product CRUD","Category mgmt","Basic cart","2 revisions"]},{"title":"Standard Store","tier":"STANDARD","description":"Full e-commerce backend with cart, checkout, and payment","price":400,"delivery_days":14,"revisions":3,"features":["Product + variant","Cart system","Checkout flow","Payment gateway","Order management","3 revisions"]},{"title":"Premium Platform","tier":"PREMIUM","description":"Enterprise e-commerce platform with multi-vendor, inventory, and analytics","price":900,"delivery_days":28,"revisions":5,"features":["Multi-vendor","Inventory mgmt","Analytics","Coupon system","Shipping API","5 revisions","Admin dashboard"]}]',
  '[{"question":"Which payment gateways do you integrate?","answer":"Stripe, PayPal, SSLCommerz, bKash, and Nagad."},{"question":"Do you include inventory management?","answer":"Yes, I include real-time inventory tracking and low-stock alerts."}]',
  'ACTIVE', ts_stagger(2, 11, 0), ts_stagger(2, 11, 0));

-- Collect gig IDs
SELECT array_agg(id) INTO v_gig_ids FROM (SELECT id FROM gig ORDER BY created_at) sub;

-- ============================================================
-- 2. JOBS ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â 5 per profile ÃƒÆ’Ã¢â‚¬â€ 6 profiles = 30 jobs
-- ============================================================

-- ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Mohammad Fatin Nur's jobs ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_mfatin, cat_webdev, 'Need Full-Stack Developer for SaaS Platform',
  'need-fullstack-developer-saas-platform-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j01',
  'Looking for an experienced full-stack developer to build a multi-tenant SaaS platform. Must have experience with React, Node.js, and PostgreSQL. The platform will include user management, subscription billing, and analytics dashboard.',
  'FULLTIME', 'BDT 120000 - 150000', now() + interval '30 days', 'Remote',
  ARRAY['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'AWS'],
  ARRAY['saas', 'fullstack', 'remote', 'react', 'nodejs'],
  'ACTIVE', ts_stagger(6, 10, 0), ts_stagger(6, 10, 0));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_mfatin, cat_aiml, 'AI Model Trainer for NLP Project',
  'ai-model-trainer-nlp-project-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j02',
  'Need an AI/ML specialist to train and fine-tune NLP models for a Bengali language processing project. Experience with transformer models and Hugging Face required.',
  'CONTRACT', 'BDT 80000 - 100000', now() + interval '30 days', 'Remote',
  ARRAY['Python', 'NLP', 'Transformers', 'PyTorch', 'Hugging Face'],
  ARRAY['nlp', 'ai', 'bengali', 'machine-learning'],
  'ACTIVE', ts_stagger(5, 10, 15), ts_stagger(5, 10, 15));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_mfatin, cat_datascience, 'Data Analyst for Market Research',
  'data-analyst-market-research-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j03',
  'Seeking a data analyst to conduct market research and competitive analysis. Must be proficient in Python, SQL, and data visualization tools.',
  'PARTTIME', 'BDT 40000 - 60000', now() + interval '30 days', 'Remote',
  ARRAY['Python', 'SQL', 'Excel', 'Tableau', 'Statistics'],
  ARRAY['data-analysis', 'market-research', 'part-time'],
  'ACTIVE', ts_stagger(5, 14, 30), ts_stagger(5, 14, 30));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_mfatin, cat_clouddevops, 'DevOps Engineer for CI/CD Setup',
  'devops-engineer-cicd-setup-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j04',
  'Looking for a DevOps engineer to set up CI/CD pipelines, containerize our applications, and manage cloud infrastructure on AWS.',
  'CONTRACT', 'BDT 90000 - 120000', now() + interval '30 days', 'Remote',
  ARRAY['Docker', 'Kubernetes', 'AWS', 'Terraform', 'GitHub Actions'],
  ARRAY['devops', 'cicd', 'aws', 'docker'],
  'ACTIVE', ts_stagger(4, 15, 30), ts_stagger(4, 15, 30));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_mfatin, cat_webdev, 'API Developer for Payment Gateway Integration',
  'api-developer-payment-gateway-integration-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j05',
  'Need an experienced API developer to integrate multiple payment gateways (Stripe, PayPal, bKash) into our existing platform.',
  'PARTTIME', 'BDT 50000 - 70000', now() + interval '30 days', 'Remote',
  ARRAY['REST API', 'Node.js', 'Payment Gateway', 'Security'],
  ARRAY['api', 'payment', 'integration', 'part-time'],
  'ACTIVE', ts_stagger(4, 17, 45), ts_stagger(4, 17, 45));

-- ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Fabiha Islam's jobs ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_fabiha, cat_mobile, 'Flutter Developer for Health App',
  'flutter-developer-health-app-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j06',
  'Looking for a Flutter developer to build a cross-platform health tracking app. Features include step counter, diet tracking, and appointment scheduling.',
  'FULLTIME', 'BDT 100000 - 130000', now() + interval '30 days', 'Remote',
  ARRAY['Flutter', 'Dart', 'Firebase', 'REST API', 'Bloc'],
  ARRAY['flutter', 'health-app', 'mobile', 'fulltime'],
  'ACTIVE', ts_stagger(6, 12, 15), ts_stagger(6, 12, 15));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_fabiha, cat_mobile, 'React Native Developer for Social App',
  'react-native-developer-social-app-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j07',
  'Seeking a React Native developer to build a social networking app with real-time messaging, feed, and stories features.',
  'CONTRACT', 'BDT 80000 - 110000', now() + interval '30 days', 'Remote',
  ARRAY['React Native', 'TypeScript', 'Firebase', 'Socket.io'],
  ARRAY['react-native', 'social-app', 'messaging'],
  'ACTIVE', ts_stagger(5, 16, 45), ts_stagger(5, 16, 45));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_fabiha, cat_uiux, 'UI/UX Designer for Mobile App',
  'ui-ux-designer-mobile-app-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j08',
  'Need a UI/UX designer to design a complete mobile app experience. Must have experience with Figma and mobile design patterns.',
  'PARTTIME', 'BDT 35000 - 50000', now() + interval '30 days', 'Remote',
  ARRAY['Figma', 'UI Design', 'UX Research', 'Prototyping'],
  ARRAY['ui-ux', 'mobile-design', 'part-time'],
  'ACTIVE', ts_stagger(5, 8, 0), ts_stagger(5, 8, 0));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_fabiha, cat_qatesting, 'QA Tester for Mobile Applications',
  'qa-tester-mobile-applications-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j09',
  'Looking for a QA tester to test our mobile applications on both iOS and Android. Experience with automated testing frameworks required.',
  'PARTTIME', 'BDT 30000 - 45000', now() + interval '30 days', 'Remote',
  ARRAY['Manual Testing', 'Automation', 'Appium', 'TestRail'],
  ARRAY['qa', 'testing', 'mobile', 'part-time'],
  'ACTIVE', ts_stagger(4, 9, 0), ts_stagger(4, 9, 0));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_fabiha, cat_webdev, 'Firebase Expert for Backend Setup',
  'firebase-expert-backend-setup-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j10',
  'Need a Firebase expert to set up and optimize our Firebase project including Firestore, Cloud Functions, and security rules.',
  'CONTRACT', 'BDT 60000 - 80000', now() + interval '30 days', 'Remote',
  ARRAY['Firebase', 'Cloud Functions', 'Firestore', 'Security Rules'],
  ARRAY['firebase', 'backend', 'contract'],
  'ACTIVE', ts_stagger(3, 12, 15), ts_stagger(3, 12, 15));

-- ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Khusbul Alam's jobs ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_khusbul, cat_datascience, 'Data Scientist for Predictive Analytics',
  'data-scientist-predictive-analytics-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j11',
  'Seeking a data scientist to build predictive models for customer churn analysis and sales forecasting. Experience with time series analysis required.',
  'FULLTIME', 'BDT 110000 - 140000', now() + interval '30 days', 'Remote',
  ARRAY['Python', 'Machine Learning', 'Time Series', 'SQL', 'TensorFlow'],
  ARRAY['data-science', 'predictive', 'fulltime'],
  'ACTIVE', ts_stagger(6, 14, 30), ts_stagger(6, 14, 30));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_khusbul, cat_aiml, 'ML Engineer for Recommendation System',
  'ml-engineer-recommendation-system-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j12',
  'Looking for an ML engineer to build a recommendation system for an e-commerce platform. Experience with collaborative filtering and deep learning required.',
  'CONTRACT', 'BDT 90000 - 120000', now() + interval '30 days', 'Remote',
  ARRAY['Python', 'TensorFlow', 'Recommendation Systems', 'PyTorch'],
  ARRAY['machine-learning', 'recommendation', 'ecommerce'],
  'ACTIVE', ts_stagger(5, 10, 15), ts_stagger(5, 10, 15));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_khusbul, cat_dbadmin, 'Database Administrator for PostgreSQL',
  'database-administrator-postgresql-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j13',
  'Need a PostgreSQL DBA to manage, optimize, and maintain our database infrastructure. Must have experience with replication and performance tuning.',
  'FULLTIME', 'BDT 100000 - 130000', now() + interval '30 days', 'Remote',
  ARRAY['PostgreSQL', 'Replication', 'Performance Tuning', 'Backup'],
  ARRAY['database', 'postgresql', 'dba', 'fulltime'],
  'ACTIVE', ts_stagger(5, 14, 30), ts_stagger(5, 14, 30));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_khusbul, cat_webdev, 'Python Developer for Automation Scripts',
  'python-developer-automation-scripts-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j14',
  'Looking for a Python developer to build automation scripts for data processing, ETL pipelines, and report generation.',
  'PARTTIME', 'BDT 40000 - 55000', now() + interval '30 days', 'Remote',
  ARRAY['Python', 'ETL', 'Automation', 'BeautifulSoup', 'Pandas'],
  ARRAY['python', 'automation', 'etl', 'part-time'],
  'ACTIVE', ts_stagger(4, 11, 15), ts_stagger(4, 11, 15));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_khusbul, cat_businessconsult, 'Business Analyst for Data Strategy',
  'business-analyst-data-strategy-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j15',
  'Seeking a business analyst to help define our data strategy, KPIs, and reporting framework. Must bridge the gap between business and technical teams.',
  'CONTRACT', 'BDT 70000 - 90000', now() + interval '30 days', 'Remote',
  ARRAY['Business Analysis', 'SQL', 'Excel', 'Data Visualization'],
  ARRAY['business-analysis', 'data-strategy', 'consulting'],
  'ACTIVE', ts_stagger(3, 16, 30), ts_stagger(3, 16, 30));

-- ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Faria Alam's jobs ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_faria, cat_clouddevops, 'Cloud Architect for AWS Migration',
  'cloud-architect-aws-migration-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j16',
  'Looking for a cloud architect to lead our migration from on-premise to AWS. Must have experience with large-scale migrations and cloud-native architectures.',
  'FULLTIME', 'BDT 150000 - 200000', now() + interval '30 days', 'Remote',
  ARRAY['AWS', 'Cloud Architecture', 'Terraform', 'Docker', 'Networking'],
  ARRAY['cloud', 'aws', 'migration', 'architecture'],
  'ACTIVE', ts_stagger(6, 16, 45), ts_stagger(6, 16, 45));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_faria, cat_cybersec, 'Security Engineer for Cloud Infrastructure',
  'security-engineer-cloud-infrastructure-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j17',
  'Need a security engineer to perform security audits and implement security best practices across our cloud infrastructure.',
  'CONTRACT', 'BDT 85000 - 110000', now() + interval '30 days', 'Remote',
  ARRAY['Cloud Security', 'Penetration Testing', 'IAM', 'Compliance'],
  ARRAY['security', 'cloud', 'audit', 'contract'],
  'ACTIVE', ts_stagger(5, 16, 45), ts_stagger(5, 16, 45));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_faria, cat_clouddevops, 'Kubernetes Administrator',
  'kubernetes-administrator-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j18',
  'Seeking a Kubernetes administrator to manage our production clusters. Experience with Helm, Istio, and ArgoCD required.',
  'FULLTIME', 'BDT 120000 - 150000', now() + interval '30 days', 'Remote',
  ARRAY['Kubernetes', 'Helm', 'Istio', 'ArgoCD', 'Linux'],
  ARRAY['kubernetes', 'devops', 'admin', 'fulltime'],
  'ACTIVE', ts_stagger(5, 8, 0), ts_stagger(5, 8, 0));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_faria, cat_clouddevops, 'Terraform Module Developer',
  'terraform-module-developer-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j19',
  'Need a Terraform expert to develop reusable modules for our multi-cloud infrastructure. Must follow best practices and include documentation.',
  'PARTTIME', 'BDT 50000 - 70000', now() + interval '30 days', 'Remote',
  ARRAY['Terraform', 'AWS', 'GCP', 'Azure', 'Git'],
  ARRAY['terraform', 'iac', 'cloud', 'part-time'],
  'ACTIVE', ts_stagger(4, 15, 30), ts_stagger(4, 15, 30));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_faria, cat_clouddevops, 'Site Reliability Engineer (SRE)',
  'site-reliability-engineer-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j20',
  'Looking for an SRE to ensure the reliability, scalability, and performance of our cloud infrastructure. Experience with observability tools required.',
  'FULLTIME', 'BDT 130000 - 160000', now() + interval '30 days', 'Remote',
  ARRAY['SRE', 'Prometheus', 'Grafana', 'Kubernetes', 'Automation'],
  ARRAY['sre', 'reliability', 'monitoring', 'fulltime'],
  'ACTIVE', ts_stagger(3, 18, 45), ts_stagger(3, 18, 45));

-- ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Maisha Binte Monir's jobs ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_maisha, cat_uiux, 'Senior UI/UX Designer for SaaS Product',
  'senior-ui-ux-designer-saas-product-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j21',
  'Looking for a senior UI/UX designer to redesign our SaaS product. Must have experience with design systems and user research.',
  'FULLTIME', 'BDT 100000 - 140000', now() + interval '30 days', 'Remote',
  ARRAY['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Accessibility'],
  ARRAY['ui-ux', 'saas', 'design-system', 'fulltime'],
  'ACTIVE', ts_stagger(6, 10, 0), ts_stagger(6, 10, 0));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_maisha, cat_frontend, 'Frontend Developer for Dashboard',
  'frontend-developer-dashboard-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j22',
  'Need a frontend developer to build a complex analytics dashboard using React, TypeScript, and D3.js. Must have experience with data visualization.',
  'CONTRACT', 'BDT 80000 - 100000', now() + interval '30 days', 'Remote',
  ARRAY['React', 'TypeScript', 'D3.js', 'Tailwind CSS', 'Next.js'],
  ARRAY['frontend', 'dashboard', 'react', 'visualization'],
  'ACTIVE', ts_stagger(5, 10, 15), ts_stagger(5, 10, 15));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_maisha, cat_graphic, 'Graphic Designer for Brand Collateral',
  'graphic-designer-brand-collateral-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j23',
  'Seeking a graphic designer to create brand collateral including brochures, social media graphics, and presentation templates.',
  'PARTTIME', 'BDT 25000 - 40000', now() + interval '30 days', 'Remote',
  ARRAY['Adobe Illustrator', 'Photoshop', 'Canva', 'Typography'],
  ARRAY['graphic-design', 'branding', 'part-time'],
  'ACTIVE', ts_stagger(5, 14, 30), ts_stagger(5, 14, 30));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_maisha, cat_video, 'Video Editor for Marketing Content',
  'video-editor-marketing-content-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j24',
  'Looking for a creative video editor to produce marketing videos, reels, and promotional content for social media.',
  'PARTTIME', 'BDT 30000 - 45000', now() + interval '30 days', 'Remote',
  ARRAY['Premiere Pro', 'After Effects', 'Motion Graphics', 'Color Grading'],
  ARRAY['video-editing', 'marketing', 'social-media', 'part-time'],
  'ACTIVE', ts_stagger(4, 17, 45), ts_stagger(4, 17, 45));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_maisha, cat_webdev, 'Next.js Developer for Company Website',
  'nextjs-developer-company-website-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j25',
  'Need a Next.js developer to build our company website with blog, portfolio, and contact sections. Must be proficient with Tailwind CSS.',
  'CONTRACT', 'BDT 60000 - 80000', now() + interval '30 days', 'Remote',
  ARRAY['Next.js', 'React', 'Tailwind CSS', 'TypeScript', 'MDX'],
  ARRAY['nextjs', 'website', 'frontend', 'contract'],
  'ACTIVE', ts_stagger(3, 10, 0), ts_stagger(3, 10, 0));

-- ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Ahmed Bin Mostafa's jobs ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_ahmed, cat_webdev, 'Go Developer for Microservices',
  'go-developer-microservices-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j26',
  'Looking for an experienced Go developer to build microservices for our platform. Experience with gRPC, message queues, and Docker required.',
  'FULLTIME', 'BDT 120000 - 160000', now() + interval '30 days', 'Remote',
  ARRAY['Go', 'gRPC', 'Docker', 'PostgreSQL', 'RabbitMQ'],
  ARRAY['golang', 'microservices', 'backend', 'fulltime'],
  'ACTIVE', ts_stagger(6, 12, 15), ts_stagger(6, 12, 15));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_ahmed, cat_dbadmin, 'PostgreSQL Performance Expert',
  'postgresql-performance-expert-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j27',
  'Need a PostgreSQL expert to optimize our database performance. Must have experience with query optimization, indexing, and partitioning.',
  'CONTRACT', 'BDT 80000 - 100000', now() + interval '30 days', 'Remote',
  ARRAY['PostgreSQL', 'Query Optimization', 'Partitioning', 'Performance Tuning'],
  ARRAY['postgresql', 'database', 'performance', 'contract'],
  'ACTIVE', ts_stagger(5, 16, 45), ts_stagger(5, 16, 45));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_ahmed, cat_cybersec, 'API Security Specialist',
  'api-security-specialist-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j28',
  'Seeking an API security specialist to audit and harden our REST and gRPC APIs. Experience with OAuth2, JWT, and penetration testing required.',
  'CONTRACT', 'BDT 75000 - 95000', now() + interval '30 days', 'Remote',
  ARRAY['API Security', 'OAuth2', 'JWT', 'Penetration Testing', 'WAF'],
  ARRAY['security', 'api', 'pentesting', 'contract'],
  'ACTIVE', ts_stagger(5, 8, 0), ts_stagger(5, 8, 0));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_ahmed, cat_ecom, 'E-commerce Platform Developer',
  'ecommerce-platform-developer-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j29',
  'Looking for a developer to build a multi-vendor e-commerce platform with inventory management, payment integration, and analytics.',
  'FULLTIME', 'BDT 100000 - 140000', now() + interval '30 days', 'Remote',
  ARRAY['Node.js', 'PostgreSQL', 'Redis', 'Payment Gateway', 'Docker'],
  ARRAY['ecommerce', 'fullstack', 'fulltime', 'multi-vendor'],
  'ACTIVE', ts_stagger(4, 9, 0), ts_stagger(4, 9, 0));

INSERT INTO job (owner, category, title, slug, description, type, budget, deadline, location, required_skills, tags, status, created_at, updated_at)
VALUES (p_ahmed, cat_clouddevops, 'Docker/K8s Infrastructure Engineer',
  'docker-k8s-infrastructure-engineer-' || to_char(v_now, 'YYMMDDHH24MISS') || 'j30',
  'Need an infrastructure engineer to manage our Docker and Kubernetes infrastructure. Experience with Helm, monitoring, and CI/CD pipelines required.',
  'FULLTIME', 'BDT 110000 - 150000', now() + interval '30 days', 'Remote',
  ARRAY['Docker', 'Kubernetes', 'Helm', 'Prometheus', 'CI/CD'],
  ARRAY['infrastructure', 'docker', 'kubernetes', 'fulltime'],
  'ACTIVE', ts_stagger(3, 12, 15), ts_stagger(3, 12, 15));

-- Collect job IDs
SELECT array_agg(id) INTO v_job_ids FROM (SELECT id FROM job ORDER BY created_at) sub;

-- ============================================================
-- 3. JOB PROPOSALS ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â cross-profile applications
--    Each job gets 1-3 proposals from different profiles
--    (not the job owner)
-- ============================================================

-- Helper: submit proposal
-- Job 1 (mfatin's job) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by fabiha
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[1], p_fabiha,
  'I have 3 years of experience building SaaS platforms with React and Node.js. I have built similar multi-tenant systems before and can deliver this project efficiently.',
  'APPROVED', ts_stagger(4, 8, 0), ts_stagger(3, 18, 0));

-- Job 1 ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by maisha
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[1], p_maisha,
  'As a full-stack developer with expertise in React and TypeScript, I can contribute significantly to this SaaS platform. I have experience with subscription billing systems.',
  'PENDING', ts_stagger(3, 16, 30), ts_stagger(3, 16, 30));

-- Job 2 (mfatin's AI job) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by khusbul
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[2], p_khusbul,
  'I specialize in NLP and transformer models. I have worked on Bengali language processing projects and can fine-tune models for your requirements.',
  'APPROVED', ts_stagger(4, 9, 15), ts_stagger(2, 18, 0));

-- Job 3 (mfatin's data job) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by faria
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[3], p_faria,
  'I have strong experience in data analysis and market research. I can provide actionable insights using Python, SQL, and Tableau.',
  'PENDING', ts_stagger(3, 18, 45), ts_stagger(3, 18, 45));

-- Job 4 (mfatin's devops job) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by ahmed
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[4], p_ahmed,
  'I have extensive DevOps experience with AWS, Docker, and Kubernetes. I can set up robust CI/CD pipelines for your organization.',
  'APPROVED', ts_stagger(3, 8, 0), ts_stagger(2, 18, 0));

-- Job 5 (mfatin's payment job) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by fabiha
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[5], p_fabiha,
  'I have integrated multiple payment gateways including Stripe, PayPal, and bKash in my previous projects. I can handle this integration smoothly.',
  'PENDING', ts_stagger(2, 13, 15), ts_stagger(2, 13, 15));

-- Job 6 (fabiha's health app) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by mfatin
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[6], p_mfatin,
  'I have built health and fitness apps using Flutter. My experience with Bloc pattern and Firebase makes me a great fit for this project.',
  'APPROVED', ts_stagger(4, 10, 30), ts_stagger(3, 18, 0));

-- Job 6 ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by maisha
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[6], p_maisha,
  'I am a skilled Flutter developer with experience in building cross-platform apps. I can create a beautiful and functional health tracking app.',
  'PENDING', ts_stagger(3, 10, 0), ts_stagger(3, 10, 0));

-- Job 7 (fabiha's social app) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by ahmed
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[7], p_ahmed,
  'I can build the backend for your social networking app using Go and WebSocket for real-time messaging. I have experience with scalable social platforms.',
  'PENDING', ts_stagger(3, 12, 15), ts_stagger(3, 12, 15));

-- Job 8 (fabiha's UI/UX job) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by maisha
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[8], p_maisha,
  'As a UI/UX designer, I can design a beautiful and intuitive mobile app experience. I have extensive Figma experience and a strong portfolio.',
  'APPROVED', ts_stagger(3, 9, 15), ts_stagger(2, 18, 0));

-- Job 9 (fabiha's QA job) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by khusbul
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[9], p_khusbul,
  'I have experience in both manual and automated testing for mobile applications. I can ensure your app is bug-free and performs well.',
  'PENDING', ts_stagger(2, 17, 30), ts_stagger(2, 17, 30));

-- Job 11 (khusbul's data science) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by mfatin
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[11], p_mfatin,
  'I have strong experience in data science and predictive modeling. I can build accurate churn prediction and sales forecasting models.',
  'APPROVED', ts_stagger(4, 11, 45), ts_stagger(3, 18, 0));

-- Job 12 (khusbul's ML job) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by faria
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[12], p_faria,
  'I have built recommendation systems using collaborative filtering and deep learning. I can deliver a robust solution for your e-commerce platform.',
  'PENDING', ts_stagger(3, 16, 30), ts_stagger(3, 16, 30));

-- Job 13 (khusbul's DBA job) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by ahmed
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[13], p_ahmed,
  'As a PostgreSQL expert, I can manage and optimize your database infrastructure. I have experience with replication, partitioning, and performance tuning.',
  'APPROVED', ts_stagger(3, 10, 30), ts_stagger(2, 18, 0));

-- Job 14 (khusbul's Python job) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by fabiha
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[14], p_fabiha,
  'I have strong Python skills and experience building ETL pipelines and automation scripts. I can handle your data processing needs efficiently.',
  'PENDING', ts_stagger(2, 19, 45), ts_stagger(2, 19, 45));

-- Job 16 (faria's cloud architect) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by ahmed
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[16], p_ahmed,
  'I have led multiple cloud migration projects from on-premise to AWS. I can architect a robust migration strategy for your organization.',
  'APPROVED', ts_stagger(4, 12, 0), ts_stagger(3, 18, 0));

-- Job 17 (faria's security) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by khusbul
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[17], p_khusbul,
  'I have experience in cloud security audits and penetration testing. I can identify vulnerabilities and implement security best practices.',
  'PENDING', ts_stagger(3, 18, 45), ts_stagger(3, 18, 45));

-- Job 18 (faria's K8s admin) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by mfatin
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[18], p_mfatin,
  'I have managed production Kubernetes clusters using Helm, Istio, and ArgoCD. I can ensure your clusters are reliable and well-maintained.',
  'PENDING', ts_stagger(3, 10, 0), ts_stagger(3, 10, 0));

-- Job 19 (faria's Terraform) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by ahmed
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[19], p_ahmed,
  'I am a Terraform expert and have developed reusable modules for multi-cloud infrastructure. I follow best practices and include comprehensive documentation.',
  'APPROVED', ts_stagger(3, 11, 45), ts_stagger(2, 18, 0));

-- Job 21 (maisha's UI/UX) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by fabiha
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[21], p_fabiha,
  'I have experience designing SaaS products and creating design systems. I can lead the redesign of your product with user-centered design principles.',
  'APPROVED', ts_stagger(4, 13, 15), ts_stagger(3, 18, 0));

-- Job 22 (maisha's frontend) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by mfatin
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[22], p_mfatin,
  'I specialize in React and TypeScript with experience building complex dashboards and data visualizations using D3.js.',
  'PENDING', ts_stagger(3, 12, 15), ts_stagger(3, 12, 15));

-- Job 23 (maisha's graphic design) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by khusbul
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[23], p_khusbul,
  'I have graphic design experience and can create professional brand collateral including brochures and social media graphics.',
  'PENDING', ts_stagger(2, 11, 0), ts_stagger(2, 11, 0));

-- Job 26 (ahmed's Go microservices) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by faria
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[26], p_faria,
  'I am an experienced Go developer with expertise in microservices architecture, gRPC, and message queues. I can build scalable services for your platform.',
  'APPROVED', ts_stagger(4, 14, 30), ts_stagger(3, 18, 0));

-- Job 27 (ahmed's PostgreSQL) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by khusbul
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[27], p_khusbul,
  'I have deep PostgreSQL expertise including query optimization, indexing strategies, and partitioning. I can significantly improve your database performance.',
  'PENDING', ts_stagger(3, 16, 30), ts_stagger(3, 16, 30));

-- Job 28 (ahmed's API security) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by faria
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[28], p_faria,
  'I specialize in API security with experience in OAuth2, JWT, and penetration testing. I can audit and harden your APIs effectively.',
  'PENDING', ts_stagger(2, 13, 15), ts_stagger(2, 13, 15));

-- Job 29 (ahmed's e-commerce) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ proposal by mfatin
INSERT INTO job_proposal (job, applicant, description, status, created_at, updated_at)
VALUES (v_job_ids[29], p_mfatin,
  'I have built multi-vendor e-commerce platforms with payment integration and inventory management. I can deliver a robust solution for your requirements.',
  'APPROVED', ts_stagger(3, 12, 0), ts_stagger(2, 18, 0));

-- Collect proposal IDs (only APPROVED ones for orders)
SELECT array_agg(id) INTO v_prop_ids FROM (SELECT id FROM job_proposal WHERE status = 'APPROVED' ORDER BY created_at) sub;

-- ============================================================
-- 4. ORDERS
--    Job Orders: from APPROVED proposals
--    Gig Orders: cross-profile (buyer != seller)
-- ============================================================

RAISE NOTICE 'Creating orders...';

-- ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 4a. JOB ORDERS (from APPROVED proposals) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
-- Proposal 1: Job 1 (mfatin) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ fabiha applies ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ order (buyer=fabiha, seller=mfatin)
INSERT INTO "order" (code, buyer, seller, proposal, job, source, total_price, amount, title, status, description, created_at, updated_at)
VALUES (temp_gen_order_code('JOB'), p_fabiha, p_mfatin, v_prop_ids[1], v_job_ids[1], 'JOB', 135000, 1, 'Need Full-Stack Developer for SaaS Platform', 'ACTIVE', 'Accepted proposal for SaaS platform development.', ts_stagger(3, 13, 15), ts_stagger(2, 18, 0));

-- Proposal 2: Job 2 (mfatin) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ khusbul applies ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ order (buyer=khusbul, seller=mfatin)
INSERT INTO "order" (code, buyer, seller, proposal, job, source, total_price, amount, title, status, description, created_at, updated_at)
VALUES (temp_gen_order_code('JOB'), p_khusbul, p_mfatin, v_prop_ids[2], v_job_ids[2], 'JOB', 90000, 1, 'AI Model Trainer for NLP Project', 'ACTIVE', 'Accepted for NLP model training project.', ts_stagger(3, 14, 30), ts_stagger(2, 18, 0));

-- Proposal 3: Job 4 (mfatin) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ ahmed applies ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ order (buyer=ahmed, seller=mfatin)
INSERT INTO "order" (code, buyer, seller, proposal, job, source, total_price, amount, title, status, description, created_at, updated_at)
VALUES (temp_gen_order_code('JOB'), p_ahmed, p_mfatin, v_prop_ids[3], v_job_ids[4], 'JOB', 105000, 1, 'DevOps Engineer for CI/CD Setup', 'PENDING', 'Waiting for acceptance.', ts_stagger(2, 17, 30), ts_stagger(2, 17, 30));

-- Proposal 4: Job 6 (fabiha) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ mfatin applies ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ order (buyer=mfatin, seller=fabiha)
INSERT INTO "order" (code, buyer, seller, proposal, job, source, total_price, amount, title, status, description, created_at, updated_at)
VALUES (temp_gen_order_code('JOB'), p_mfatin, p_fabiha, v_prop_ids[4], v_job_ids[6], 'JOB', 115000, 1, 'Flutter Developer for Health App', 'ACTIVE', 'Started development of health tracking app.', ts_stagger(3, 15, 45), ts_stagger(2, 18, 0));

-- Proposal 5: Job 8 (fabiha) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ maisha applies ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ order (buyer=maisha, seller=fabiha)
INSERT INTO "order" (code, buyer, seller, proposal, job, source, total_price, amount, title, status, description, created_at, updated_at)
VALUES (temp_gen_order_code('JOB'), p_maisha, p_fabiha, v_prop_ids[5], v_job_ids[8], 'JOB', 42500, 1, 'UI/UX Designer for Mobile App', 'ACTIVE', 'Design work in progress.', ts_stagger(2, 8, 0), ts_stagger(1, 16, 0));

-- Proposal 6: Job 11 (khusbul) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ mfatin applies ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ order (buyer=mfatin, seller=khusbul)
INSERT INTO "order" (code, buyer, seller, proposal, job, source, total_price, amount, title, status, description, created_at, updated_at)
VALUES (temp_gen_order_code('JOB'), p_mfatin, p_khusbul, v_prop_ids[6], v_job_ids[11], 'JOB', 125000, 1, 'Data Scientist for Predictive Analytics', 'ACTIVE', 'Predictive model development in progress.', ts_stagger(3, 16, 0), ts_stagger(2, 18, 0));

-- Proposal 7: Job 13 (khusbul) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ ahmed applies ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ order (buyer=ahmed, seller=khusbul)
INSERT INTO "order" (code, buyer, seller, proposal, job, source, total_price, amount, title, status, description, created_at, updated_at)
VALUES (temp_gen_order_code('JOB'), p_ahmed, p_khusbul, v_prop_ids[7], v_job_ids[13], 'JOB', 115000, 1, 'Database Administrator for PostgreSQL', 'PENDING', 'Awaiting acceptance.', ts_stagger(2, 19, 45), ts_stagger(2, 19, 45));

-- Proposal 8: Job 16 (faria) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ ahmed applies ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ order (buyer=ahmed, seller=faria)
INSERT INTO "order" (code, buyer, seller, proposal, job, source, total_price, amount, title, status, description, created_at, updated_at)
VALUES (temp_gen_order_code('JOB'), p_ahmed, p_faria, v_prop_ids[8], v_job_ids[16], 'JOB', 175000, 1, 'Cloud Architect for AWS Migration', 'ACTIVE', 'Cloud migration project started.', ts_stagger(3, 17, 15), ts_stagger(2, 18, 0));

-- Proposal 9: Job 19 (faria) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ ahmed applies ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ order (buyer=ahmed, seller=faria)
INSERT INTO "order" (code, buyer, seller, proposal, job, source, total_price, amount, title, status, description, created_at, updated_at)
VALUES (temp_gen_order_code('JOB'), p_ahmed, p_faria, v_prop_ids[9], v_job_ids[19], 'JOB', 60000, 1, 'Terraform Module Developer', 'PENDING', 'Contract negotiation in progress.', ts_stagger(2, 11, 0), ts_stagger(2, 11, 0));

-- Proposal 10: Job 21 (maisha) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ fabiha applies ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ order (buyer=fabiha, seller=maisha)
INSERT INTO "order" (code, buyer, seller, proposal, job, source, total_price, amount, title, status, description, created_at, updated_at)
VALUES (temp_gen_order_code('JOB'), p_fabiha, p_maisha, v_prop_ids[10], v_job_ids[21], 'JOB', 120000, 1, 'Senior UI/UX Designer for SaaS Product', 'ACTIVE', 'SaaS product redesign in progress.', ts_stagger(3, 18, 30), ts_stagger(2, 18, 0));

-- Proposal 11: Job 26 (ahmed) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ faria applies ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ order (buyer=faria, seller=ahmed)
INSERT INTO "order" (code, buyer, seller, proposal, job, source, total_price, amount, title, status, description, created_at, updated_at)
VALUES (temp_gen_order_code('JOB'), p_faria, p_ahmed, v_prop_ids[11], v_job_ids[26], 'JOB', 140000, 1, 'Go Developer for Microservices', 'ACTIVE', 'Microservices development in progress.', ts_stagger(3, 19, 45), ts_stagger(2, 18, 0));

-- Proposal 12: Job 29 (ahmed) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ mfatin applies ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ order (buyer=mfatin, seller=ahmed)
INSERT INTO "order" (code, buyer, seller, proposal, job, source, total_price, amount, title, status, description, created_at, updated_at)
VALUES (temp_gen_order_code('JOB'), p_mfatin, p_ahmed, v_prop_ids[12], v_job_ids[29], 'JOB', 120000, 1, 'E-commerce Platform Developer', 'PENDING', 'Initial discussion phase.', ts_stagger(2, 13, 15), ts_stagger(2, 13, 15));

-- ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 4b. GIG ORDERS (cross-profile, with escrow) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
-- Gig 1 (mfatin's web app) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by fabiha
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_fabiha, p_mfatin, v_gig_ids[1], 'STANDARD', 'GIG', 350, 1, 'Full-Stack Web Application with AI Integration', 'ACTIVE', 'Need a full-stack web app with AI chatbot.', now() + interval '30 days', ts_stagger(3, 8, 0), ts_stagger(2, 18, 0));

-- Gig 2 (mfatin's chatbot) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by khusbul
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_khusbul, p_mfatin, v_gig_ids[2], 'BASIC', 'GIG', 100, 1, 'Custom AI Chatbot Development', 'ACTIVE', 'Need a basic FAQ chatbot for my website.', now() + interval '30 days', ts_stagger(3, 9, 15), ts_stagger(2, 18, 0));

-- Gig 3 (mfatin's API) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by ahmed
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_ahmed, p_mfatin, v_gig_ids[3], 'PREMIUM', 'GIG', 650, 1, 'RESTful API Development with Node.js', 'PENDING', 'Need an enterprise API suite with monitoring.', now() + interval '30 days', ts_stagger(2, 17, 30), ts_stagger(2, 17, 30));

-- Gig 4 (mfatin's dashboard) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by faria
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_faria, p_mfatin, v_gig_ids[4], 'STANDARD', 'GIG', 320, 1, 'Data Dashboard & Analytics Platform', 'ACTIVE', 'Need an interactive analytics dashboard.', now() + interval '30 days', ts_stagger(2, 9, 15), ts_stagger(1, 16, 0));

-- Gig 5 (mfatin's CI/CD) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by maisha
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_maisha, p_mfatin, v_gig_ids[5], 'STANDARD', 'GIG', 280, 1, 'CI/CD Pipeline Setup & DevOps Automation', 'PENDING', 'Need CI/CD pipeline with Docker setup.', now() + interval '30 days', ts_stagger(1, 16, 0), ts_stagger(1, 16, 0));

-- Gig 6 (fabiha's Flutter) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by mfatin
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_mfatin, p_fabiha, v_gig_ids[6], 'STANDARD', 'GIG', 350, 1, 'Cross-Platform Mobile App with Flutter', 'ACTIVE', 'Need a cross-platform app for my startup.', now() + interval '30 days', ts_stagger(3, 10, 30), ts_stagger(2, 18, 0));

-- Gig 7 (fabiha's React Native) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by ahmed
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_ahmed, p_fabiha, v_gig_ids[7], 'BASIC', 'GIG', 100, 1, 'React Native App Development', 'ACTIVE', 'Need a simple 2-screen React Native app.', now() + interval '30 days', ts_stagger(2, 19, 45), ts_stagger(2, 19, 45));

-- Gig 8 (fabiha's UI/UX) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by maisha
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_maisha, p_fabiha, v_gig_ids[8], 'STANDARD', 'GIG', 200, 1, 'Mobile App UI/UX Design', 'PENDING', 'Need 15 screens designed for my app.', now() + interval '30 days', ts_stagger(1, 16, 0), ts_stagger(1, 16, 0));

-- Gig 9 (fabiha's Firebase) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by khusbul
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_khusbul, p_fabiha, v_gig_ids[9], 'STANDARD', 'GIG', 250, 1, 'Firebase Backend Integration', 'ACTIVE', 'Need Firebase integration for my app.', now() + interval '30 days', ts_stagger(2, 10, 30), ts_stagger(1, 16, 0));

-- Gig 11 (khusbul's data analysis) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by mfatin
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_mfatin, p_khusbul, v_gig_ids[11], 'STANDARD', 'GIG', 200, 1, 'Data Analysis & Visualization Service', 'ACTIVE', 'Need in-depth data analysis for my project.', now() + interval '30 days', ts_stagger(3, 11, 45), ts_stagger(2, 18, 0));

-- Gig 12 (khusbul's ML) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by faria
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_faria, p_khusbul, v_gig_ids[12], 'BASIC', 'GIG', 150, 1, 'Machine Learning Model Development', 'ACTIVE', 'Need a simple ML model for classification.', now() + interval '30 days', ts_stagger(2, 11, 0), ts_stagger(2, 11, 0));

-- Gig 13 (khusbul's DB design) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by ahmed
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_ahmed, p_khusbul, v_gig_ids[13], 'STANDARD', 'GIG', 280, 1, 'SQL Database Design & Optimization', 'PENDING', 'Need database optimization for my platform.', now() + interval '30 days', ts_stagger(1, 16, 0), ts_stagger(1, 16, 0));

-- Gig 14 (khusbul's scraping) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by fabiha
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_fabiha, p_khusbul, v_gig_ids[14], 'STANDARD', 'GIG', 220, 1, 'Python Web Scraping & Automation', 'ACTIVE', 'Need multi-page web scraper with scheduling.', now() + interval '30 days', ts_stagger(2, 11, 45), ts_stagger(1, 16, 0));

-- Gig 16 (faria's K8s) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by mfatin
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_mfatin, p_faria, v_gig_ids[16], 'STANDARD', 'GIG', 400, 1, 'Kubernetes Cluster Setup & Management', 'ACTIVE', 'Need production K8s cluster setup.', now() + interval '30 days', ts_stagger(3, 12, 0), ts_stagger(2, 18, 0));

-- Gig 17 (faria's Terraform) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by ahmed
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_ahmed, p_faria, v_gig_ids[17], 'STANDARD', 'GIG', 350, 1, 'Terraform Infrastructure as Code', 'ACTIVE', 'Need complete infrastructure as code setup.', now() + interval '30 days', ts_stagger(2, 13, 15), ts_stagger(2, 13, 15));

-- Gig 18 (faria's security) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by khusbul
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_khusbul, p_faria, v_gig_ids[18], 'STANDARD', 'GIG', 300, 1, 'Cloud Security Audit & Hardening', 'PENDING', 'Need a full security audit.', now() + interval '30 days', ts_stagger(1, 16, 0), ts_stagger(1, 16, 0));

-- Gig 19 (faria's Docker) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by maisha
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_maisha, p_faria, v_gig_ids[19], 'STANDARD', 'GIG', 180, 1, 'Docker Containerization Service', 'ACTIVE', 'Need multi-service containerization.', now() + interval '30 days', ts_stagger(2, 12, 0), ts_stagger(1, 16, 0));

-- Gig 21 (maisha's UI/UX) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by mfatin
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_mfatin, p_maisha, v_gig_ids[21], 'STANDARD', 'GIG', 280, 1, 'Complete UI/UX Design for Web & Mobile', 'ACTIVE', 'Need complete design for my web platform.', now() + interval '30 days', ts_stagger(3, 13, 15), ts_stagger(2, 18, 0));

-- Gig 22 (maisha's React/Next.js) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by fabiha
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_fabiha, p_maisha, v_gig_ids[22], 'STANDARD', 'GIG', 350, 1, 'Responsive React/Next.js Frontend Development', 'ACTIVE', 'Need a multi-page website with animations.', now() + interval '30 days', ts_stagger(2, 17, 30), ts_stagger(2, 17, 30));

-- Gig 23 (maisha's logo) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by khusbul
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_khusbul, p_maisha, v_gig_ids[23], 'STANDARD', 'GIG', 180, 1, 'Brand Identity & Logo Design', 'PENDING', 'Need complete brand identity for my startup.', now() + interval '30 days', ts_stagger(1, 16, 0), ts_stagger(1, 16, 0));

-- Gig 24 (maisha's Tailwind) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by faria
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_faria, p_maisha, v_gig_ids[24], 'STANDARD', 'GIG', 250, 1, 'Tailwind CSS Website Development', 'ACTIVE', 'Need a multi-page Tailwind website.', now() + interval '30 days', ts_stagger(2, 13, 15), ts_stagger(1, 16, 0));

-- Gig 26 (ahmed's Go API) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by mfatin
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_mfatin, p_ahmed, v_gig_ids[26], 'STANDARD', 'GIG', 350, 1, 'Go Backend API Development', 'ACTIVE', 'Need a full-featured Go API with PostgreSQL.', now() + interval '30 days', ts_stagger(3, 14, 30), ts_stagger(2, 18, 0));

-- Gig 27 (ahmed's PostgreSQL) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by faria
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_faria, p_ahmed, v_gig_ids[27], 'STANDARD', 'GIG', 300, 1, 'PostgreSQL Database Architecture & Optimization', 'ACTIVE', 'Need database optimization for my platform.', now() + interval '30 days', ts_stagger(2, 19, 45), ts_stagger(2, 19, 45));

-- Gig 28 (ahmed's K8s) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by khusbul
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_khusbul, p_ahmed, v_gig_ids[28], 'BASIC', 'GIG', 100, 1, 'Docker & Kubernetes Deployment', 'PENDING', 'Need basic Docker deployment.', now() + interval '30 days', ts_stagger(1, 16, 0), ts_stagger(1, 16, 0));

-- Gig 29 (ahmed's security) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by maisha
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_maisha, p_ahmed, v_gig_ids[29], 'STANDARD', 'GIG', 300, 1, 'Backend Security & API Protection', 'ACTIVE', 'Need API security implementation.', now() + interval '30 days', ts_stagger(2, 14, 30), ts_stagger(1, 16, 0));

-- Gig 30 (ahmed's e-commerce) ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ bought by fabiha
INSERT INTO "order" (code, buyer, seller, gig, package, source, total_price, amount, title, status, description, deadline, created_at, updated_at)
VALUES (temp_gen_order_code('GIG'), p_fabiha, p_ahmed, v_gig_ids[30], 'PREMIUM', 'GIG', 900, 1, 'Custom E-commerce Backend System', 'PENDING', 'Need enterprise e-commerce backend.', now() + interval '30 days', ts_stagger(1, 16, 0), ts_stagger(1, 16, 0));

-- ============================================================
-- 5. CHAT ROOMS (for all orders)
-- ============================================================

RAISE NOTICE 'Creating chat rooms...';

-- Chat rooms for Job Orders (already have entries from RPCs, but we inserted directly so we need them)
INSERT INTO chat_room (title, "order", buyer, seller, created_at, updated_at)
SELECT 'Job Order - ' || o.code, o.id, o.buyer, o.seller, o.created_at, o.updated_at
FROM "order" o WHERE o.source = 'JOB'
AND NOT EXISTS (SELECT 1 FROM chat_room cr WHERE cr."order" = o.id);

-- Chat rooms for Gig Orders
INSERT INTO chat_room (title, "order", buyer, seller, created_at, updated_at)
SELECT g.title || ' - ' || o.code, o.id, o.buyer, o.seller, o.created_at, o.updated_at
FROM "order" o
JOIN gig g ON g.id = o.gig
WHERE o.source = 'GIG'
AND NOT EXISTS (SELECT 1 FROM chat_room cr WHERE cr."order" = o.id);

-- ============================================================
-- 6. CHAT MESSAGES (for some chat rooms)
-- ============================================================

RAISE NOTICE 'Creating chat messages...';

-- Messages for first few active orders
INSERT INTO chat_message (room, sender, content, created_at)
SELECT cr.id, o.buyer, 'Hi, I am interested in this project. Let''s discuss the details.', o.created_at + interval '1 hour'
FROM chat_room cr
JOIN "order" o ON o.id = cr."order"
WHERE o.status = 'ACTIVE'
LIMIT 5;

INSERT INTO chat_message (room, sender, content, created_at)
SELECT cr.id, o.seller, 'Thanks for your interest! I have reviewed the requirements and can start right away.', o.created_at + interval '2 hours'
FROM chat_room cr
JOIN "order" o ON o.id = cr."order"
WHERE o.status = 'ACTIVE'
LIMIT 5;

INSERT INTO chat_message (room, sender, content, created_at)
SELECT cr.id, o.buyer, 'Great! Let me know if you need any additional information from my side.', o.created_at + interval '3 hours'
FROM chat_room cr
JOIN "order" o ON o.id = cr."order"
WHERE o.status = 'ACTIVE'
LIMIT 3;

-- ============================================================
-- 7. ESCROW (for all GIG orders)
-- ============================================================

RAISE NOTICE 'Creating escrow entries...';

INSERT INTO escrow ("order", sender, receiver, amount, platform_fee, status, created_at, updated_at)
SELECT
  o.id,
  o.buyer,
  o.seller,
  o.total_price,
  LEAST(o.total_price * 0.05, 500),
  CASE WHEN o.status = 'ACTIVE' THEN 'PENDING'::record_status ELSE 'PENDING'::record_status END,
  o.created_at,
  o.updated_at
FROM "order" o
WHERE o.source = 'GIG'
AND NOT EXISTS (SELECT 1 FROM escrow e WHERE e."order" = o.id);

-- ============================================================
-- 8. WALLETS (one per profile)
-- ============================================================

RAISE NOTICE 'Creating wallets...';

INSERT INTO wallet (name, "user", balance, currency, created_at, updated_at)
SELECT 'Primary Wallet', p.id,
  CASE
    WHEN p.id = '7681f538-b3df-4592-8cc0-002c8f09feb7' THEN 5000.00
    WHEN p.id = '27d3284c-123f-475c-ab22-138e95e90642' THEN 3000.00
    WHEN p.id = '7760e9c8-91f5-4c14-b1df-9eeb088512b9' THEN 2000.00
    WHEN p.id = '1826cbd2-0832-4c2e-b03f-62ac5eadc89d' THEN 4000.00
    WHEN p.id = '6e93e14f-914c-4e57-b0de-6ac491a16035' THEN 2500.00
    WHEN p.id = '8bb9fa39-d499-4d66-9ec9-64910608bfc9' THEN 3500.00
    ELSE 1000.00
  END,
  'BDT', v_now, v_now
FROM profile p
WHERE NOT EXISTS (SELECT 1 FROM wallet w WHERE w."user" = p.id);

-- ============================================================
-- 9. WALLET RECORDS (for escrow transactions)
-- ============================================================

RAISE NOTICE 'Creating wallet records...';

-- For each escrow, create a DEBIT record for the sender's wallet
INSERT INTO wallet_record (wallet, amount, type, description, "order", escrow, payment_method, created_at, updated_at)
SELECT
  w.id,
  e.amount,
  'DEBIT',
  'Payment held in escrow for order',
  e."order",
  e.id,
  'BALANCE',
  e.created_at,
  e.updated_at
FROM escrow e
JOIN wallet w ON w."user" = e.sender
WHERE NOT EXISTS (SELECT 1 FROM wallet_record wr WHERE wr.escrow = e.id);

-- ============================================================
-- 10. REVIEWS (for completed/delivered orders)
-- ============================================================

RAISE NOTICE 'Creating reviews...';

-- Some reviews for orders that are in active/delivered state
INSERT INTO reviews (reviewer, gig, seller, "order", rating, note, created_at, updated_at)
SELECT
  o.buyer,
  o.gig,
  o.seller,
  o.id,
  5,
  'Excellent work! Very professional and delivered on time.',
  o.created_at + interval '2 days',
  o.created_at + interval '2 days'
FROM "order" o
WHERE o.source = 'GIG' AND o.status = 'ACTIVE'
AND o.gig IS NOT NULL
LIMIT 3;

INSERT INTO reviews (reviewer, gig, seller, "order", rating, note, created_at, updated_at)
SELECT
  o.buyer,
  o.gig,
  o.seller,
  o.id,
  4,
  'Good quality work. Would recommend.',
  o.created_at + interval '2 days',
  o.created_at + interval '2 days'
FROM "order" o
WHERE o.source = 'GIG' AND o.status = 'ACTIVE'
AND o.gig IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r."order" = o.id)
LIMIT 2;

-- ============================================================
-- CLEANUP
-- ============================================================

DROP FUNCTION IF EXISTS temp_gen_order_code(TEXT);
DROP FUNCTION IF EXISTS ts_stagger(INT, INT, INT);

RAISE NOTICE 'ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Seed data generation complete!';
RAISE NOTICE 'Created: 30 gigs, 30 jobs, % proposals, % orders, escrows, wallets, and chat rooms.',
  (SELECT COUNT(*) FROM job_proposal),
  (SELECT COUNT(*) FROM "order");

END $$;

