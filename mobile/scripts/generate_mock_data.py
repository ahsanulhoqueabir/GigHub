#!/usr/bin/env python3
"""Generate comprehensive mock data for Phase 2 development."""

import json

data = {
    "categories": [
        {"id": "cat_1", "name": "Graphics & Design", "slug": "graphics-design", "icon": "palette", "description": "Logo, Branding, Illustration & more", "gigCount": 1240},
        {"id": "cat_2", "name": "Digital Marketing", "slug": "digital-marketing", "icon": "trending_up", "description": "SEO, Social Media, PPC & more", "gigCount": 890},
        {"id": "cat_3", "name": "Writing & Translation", "slug": "writing-translation", "icon": "description", "description": "Articles, Translation, Proofreading & more", "gigCount": 1560},
        {"id": "cat_4", "name": "Video & Animation", "slug": "video-animation", "icon": "movie", "description": "Editing, Motion Graphics, 3D & more", "gigCount": 720},
        {"id": "cat_5", "name": "Programming & Tech", "slug": "programming-tech", "icon": "code", "description": "Web, Mobile, AI, DevOps & more", "gigCount": 2100},
        {"id": "cat_6", "name": "Music & Audio", "slug": "music-audio", "icon": "music_note", "description": "Voice Over, Mixing, Production & more", "gigCount": 480},
        {"id": "cat_7", "name": "Business", "slug": "business", "icon": "business", "description": "Virtual Assistant, Consulting, Finance & more", "gigCount": 650},
        {"id": "cat_8", "name": "Lifestyle", "slug": "lifestyle", "icon": "spa", "description": "Fitness, Wellness, Travel & more", "gigCount": 320},
    ],
    "profiles": [
        {"id": "u_1", "displayName": "Ahsanul Hoque", "username": "ahsanul", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=ahsanul", "role": "seller", "rating": 4.9, "totalReviews": 120, "isOnline": True, "bio": "Full-stack developer & designer with 7+ years of experience", "skills": ["Flutter", "React", "Node.js", "UI/UX Design"], "completedOrders": 210, "memberSince": "2020-01-15T00:00:00Z"},
        {"id": "u_2", "displayName": "John Doe", "username": "johndoe", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe", "role": "buyer", "rating": 4.5, "totalReviews": 15, "isOnline": False, "bio": "Entrepreneur & startup founder", "skills": [], "completedOrders": 3, "memberSince": "2023-06-01T00:00:00Z"},
        {"id": "u_3", "displayName": "Sarah Khan", "username": "sarahkhan", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=sarahkhan", "role": "seller", "rating": 4.7, "totalReviews": 89, "isOnline": True, "bio": "Professional graphic designer & illustrator", "skills": ["Photoshop", "Illustrator", "Figma"], "completedOrders": 156, "memberSince": "2021-03-10T00:00:00Z"},
        {"id": "u_4", "displayName": "Rakib Hasan", "username": "rakibhasan", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=rakibhasan", "role": "seller", "rating": 4.6, "totalReviews": 54, "isOnline": False, "bio": "Video editor & motion graphics artist", "skills": ["Premiere Pro", "After Effects", "DaVinci Resolve"], "completedOrders": 89, "memberSince": "2022-01-20T00:00:00Z"},
        {"id": "u_5", "displayName": "Fatima Ahmed", "username": "fatimaahmed", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=fatimaahmed", "role": "seller", "rating": 5.0, "totalReviews": 200, "isOnline": True, "bio": "Content writer & SEO specialist", "skills": ["Copywriting", "SEO", "Blog Writing"], "completedOrders": 340, "memberSince": "2020-07-05T00:00:00Z"},
        {"id": "u_6", "displayName": "Tanvir Rahman", "username": "tanvirrahman", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=tanvirrahman", "role": "seller", "rating": 4.3, "totalReviews": 32, "isOnline": True, "bio": "Flutter & Android developer", "skills": ["Flutter", "Android", "Kotlin", "Firebase"], "completedOrders": 45, "memberSince": "2023-02-14T00:00:00Z"},
    ],
    "gigs": [
        {
            "id": "gig_1", "title": "I will design a modern minimalist logo for your business", "slug": "design-minimalist-logo",
            "category": {"id": "cat_1", "name": "Graphics & Design", "slug": "graphics-design"},
            "seller": {"id": "u_1", "displayName": "Ahsanul Hoque", "username": "ahsanul", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=ahsanul", "rating": 4.9},
            "thumbnail": "https://images.unsplash.com/photo-1572044162444-ad60f128bde3?w=500",
            "images": ["https://images.unsplash.com/photo-1572044162444-ad60f128bde3?w=800", "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800", "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800"],
            "description": "I will design a professional, modern minimalist logo that perfectly represents your brand identity.",
            "startingPrice": 1500.0, "avgRating": 4.8, "totalReviews": 85, "totalOrders": 210, "status": "active",
            "tags": ["logo", "minimalist", "branding", "corporate"],
            "packages": [
                {"id": "pkg_basic_1", "tier": "basic", "title": "Basic Logo", "description": "One logo concept", "price": 1500.0, "deliveryDays": 2, "revisions": 3, "features": ["1 logo concept", "High-resolution files", "Source file (AI)", "PNG & JPG formats"]},
                {"id": "pkg_standard_1", "tier": "standard", "title": "Standard Logo", "description": "Two concepts with branding kit", "price": 3000.0, "deliveryDays": 4, "revisions": 5, "features": ["2 logo concepts", "All Basic features", "Social media kit", "Brand color palette", "3D mockup", "Business card design"]},
                {"id": "pkg_premium_1", "tier": "premium", "title": "Premium Logo", "description": "Full brand identity package", "price": 6000.0, "deliveryDays": 7, "revisions": 999, "features": ["3 logo concepts", "All Standard features", "Brand guidelines PDF", "Stationery design", "Favicon & app icon", "Unlimited revisions", "Priority support"]}
            ],
            "deliveryDaysMin": 2
        },
        {
            "id": "gig_2", "title": "I will build a fully responsive Flutter mobile app for you", "slug": "flutter-mobile-app",
            "category": {"id": "cat_5", "name": "Programming & Tech", "slug": "programming-tech"},
            "seller": {"id": "u_1", "displayName": "Ahsanul Hoque", "username": "ahsanul", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=ahsanul", "rating": 4.9},
            "thumbnail": "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=500",
            "images": ["https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800", "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800"],
            "description": "I will build a beautiful, high-performance Flutter mobile app for both iOS and Android.",
            "startingPrice": 15000.0, "avgRating": 4.9, "totalReviews": 42, "totalOrders": 65, "status": "active",
            "tags": ["flutter", "mobile app", "firebase", "ios", "android"],
            "packages": [
                {"id": "pkg_basic_2", "tier": "basic", "title": "Basic App", "description": "Simple 3-screen app", "price": 15000.0, "deliveryDays": 7, "revisions": 2, "features": ["Up to 3 screens", "Firebase backend", "Basic UI"]},
                {"id": "pkg_standard_2", "tier": "standard", "title": "Standard App", "description": "Full-featured app", "price": 35000.0, "deliveryDays": 14, "revisions": 4, "features": ["Up to 8 screens", "Custom UI design", "REST API", "Push notifications", "App Store submission"]},
                {"id": "pkg_premium_2", "tier": "premium", "title": "Premium App", "description": "Complex app with all features", "price": 70000.0, "deliveryDays": 30, "revisions": 999, "features": ["Unlimited screens", "All Standard features", "Real-time features", "Payment integration", "Admin dashboard", "6 months support"]}
            ],
            "deliveryDaysMin": 7
        },
        {
            "id": "gig_3", "title": "I will write SEO optimized blog posts for your website", "slug": "seo-blog-posts",
            "category": {"id": "cat_3", "name": "Writing & Translation", "slug": "writing-translation"},
            "seller": {"id": "u_5", "displayName": "Fatima Ahmed", "username": "fatimaahmed", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=fatimaahmed", "rating": 5.0},
            "thumbnail": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500",
            "images": ["https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800", "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800"],
            "description": "I will write engaging, SEO-optimized blog posts that drive traffic and convert readers.",
            "startingPrice": 500.0, "avgRating": 5.0, "totalReviews": 200, "totalOrders": 340, "status": "active",
            "tags": ["blog writing", "SEO", "content writing", "copywriting"],
            "packages": [
                {"id": "pkg_basic_3", "tier": "basic", "title": "Basic Post", "description": "500-word blog post", "price": 500.0, "deliveryDays": 1, "revisions": 1, "features": ["500 words", "SEO optimized", "1 revision", "Meta description"]},
                {"id": "pkg_standard_3", "tier": "standard", "title": "Standard Post", "description": "1000-word article", "price": 1200.0, "deliveryDays": 2, "revisions": 3, "features": ["1000 words", "Advanced SEO", "Keyword research", "3 revisions"]},
                {"id": "pkg_premium_3", "tier": "premium", "title": "Premium Post", "description": "2000-word pillar content", "price": 2500.0, "deliveryDays": 4, "revisions": 999, "features": ["2000 words", "Advanced SEO", "Competitor analysis", "Unlimited revisions", "Social media snippets"]}
            ],
            "deliveryDaysMin": 1
        },
        {
            "id": "gig_4", "title": "I will create an animated explainer video for your product", "slug": "animated-explainer-video",
            "category": {"id": "cat_4", "name": "Video & Animation", "slug": "video-animation"},
            "seller": {"id": "u_4", "displayName": "Rakib Hasan", "username": "rakibhasan", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=rakibhasan", "rating": 4.6},
            "thumbnail": "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=500",
            "images": ["https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800", "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800"],
            "description": "I create stunning animated explainer videos that communicate your product value.",
            "startingPrice": 3000.0, "avgRating": 4.6, "totalReviews": 54, "totalOrders": 89, "status": "active",
            "tags": ["animation", "explainer video", "motion graphics", "after effects"],
            "packages": [
                {"id": "pkg_basic_4", "tier": "basic", "title": "Basic Animation", "description": "30-second 2D animation", "price": 3000.0, "deliveryDays": 3, "revisions": 2, "features": ["30 seconds", "2D animation", "Background music", "HD (1080p)"]},
                {"id": "pkg_standard_4", "tier": "standard", "title": "Standard Animation", "description": "60-second video + voiceover", "price": 6000.0, "deliveryDays": 5, "revisions": 4, "features": ["60 seconds", "Professional voiceover", "Sound effects", "Storyboard", "4K resolution"]},
                {"id": "pkg_premium_4", "tier": "premium", "title": "Premium Animation", "description": "90-second premium video", "price": 12000.0, "deliveryDays": 10, "revisions": 999, "features": ["90 seconds", "All Standard features", "Character animation", "3 social cuts", "Source files", "Priority delivery"]}
            ],
            "deliveryDaysMin": 3
        },
        {
            "id": "gig_5", "title": "I will design a stunning UI/UX for your mobile app", "slug": "ui-ux-mobile-design",
            "category": {"id": "cat_1", "name": "Graphics & Design", "slug": "graphics-design"},
            "seller": {"id": "u_3", "displayName": "Sarah Khan", "username": "sarahkhan", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=sarahkhan", "rating": 4.7},
            "thumbnail": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500",
            "images": ["https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800", "https://images.unsplash.com/photo-1581291518633-83b4eef6d30c?w=800"],
            "description": "I design beautiful, user-friendly mobile app interfaces in Figma.",
            "startingPrice": 5000.0, "avgRating": 4.7, "totalReviews": 89, "totalOrders": 156, "status": "active",
            "tags": ["ui design", "ux", "figma", "mobile app", "prototype"],
            "packages": [
                {"id": "pkg_basic_5", "tier": "basic", "title": "Basic UI", "description": "5-screen mobile UI", "price": 5000.0, "deliveryDays": 3, "revisions": 2, "features": ["5 screens", "Figma file", "Basic prototype", "iOS or Android"]},
                {"id": "pkg_standard_5", "tier": "standard", "title": "Standard UI/UX", "description": "Full app design", "price": 12000.0, "deliveryDays": 7, "revisions": 4, "features": ["Up to 15 screens", "Wireframes", "Interactive prototype", "Design system", "iOS & Android"]},
                {"id": "pkg_premium_5", "tier": "premium", "title": "Premium UX", "description": "Complete UX research + design", "price": 25000.0, "deliveryDays": 14, "revisions": 999, "features": ["Unlimited screens", "User research", "User flows", "All Standard features", "Developer handoff", "2 months support"]}
            ],
            "deliveryDaysMin": 3
        },
        {
            "id": "gig_6", "title": "I will manage your social media marketing for 30 days", "slug": "social-media-marketing",
            "category": {"id": "cat_2", "name": "Digital Marketing", "slug": "digital-marketing"},
            "seller": {"id": "u_3", "displayName": "Sarah Khan", "username": "sarahkhan", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=sarahkhan", "rating": 4.7},
            "thumbnail": "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=500",
            "images": ["https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800"],
            "description": "I will manage your social media accounts for 30 days.",
            "startingPrice": 8000.0, "avgRating": 4.7, "totalReviews": 34, "totalOrders": 52, "status": "active",
            "tags": ["social media", "marketing", "instagram", "facebook", "content"],
            "packages": [
                {"id": "pkg_basic_6", "tier": "basic", "title": "Starter", "description": "2 platforms, 12 posts", "price": 8000.0, "deliveryDays": 30, "revisions": 2, "features": ["2 platforms", "12 posts", "Basic graphics", "Hashtag research"]},
                {"id": "pkg_standard_6", "tier": "standard", "title": "Growth", "description": "3 platforms, 20 posts", "price": 15000.0, "deliveryDays": 30, "revisions": 4, "features": ["3 platforms", "20 posts", "Custom graphics", "Story posts", "Monthly report"]},
                {"id": "pkg_premium_6", "tier": "premium", "title": "Agency", "description": "All platforms + ads", "price": 30000.0, "deliveryDays": 30, "revisions": 999, "features": ["All platforms", "Daily posts", "Reels/TikToks", "Ad management", "Weekly analytics", "Competitor analysis"]}
            ],
            "deliveryDaysMin": 30
        },
    ],
    "jobs": [
        {"id": "job_1", "title": "Need a Flutter developer for a food delivery app", "slug": "flutter-food-app", "description": "Looking for an experienced Flutter developer to build a food delivery app with real-time tracking.", "category": {"id": "cat_5", "name": "Programming & Tech", "slug": "programming-tech"}, "client": {"id": "u_2", "displayName": "John Doe", "username": "johndoe", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe", "rating": 4.5}, "type": "fixed", "budgetMin": 50000.0, "budgetMax": 100000.0, "deadline": "2026-06-15T00:00:00Z", "skillsRequired": ["Flutter", "Dart", "Firebase", "Node.js"], "experienceLevel": "intermediate", "status": "open", "totalProposals": 12, "createdAt": "2026-05-01T10:00:00Z"},
        {"id": "job_2", "title": "Logo designer needed for tech startup rebranding", "slug": "tech-startup-logo", "description": "SaaS startup looking for a modern, tech-forward logo for rebranding.", "category": {"id": "cat_1", "name": "Graphics & Design", "slug": "graphics-design"}, "client": {"id": "u_2", "displayName": "John Doe", "username": "johndoe", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe", "rating": 4.5}, "type": "fixed", "budgetMin": 3000.0, "budgetMax": 8000.0, "deadline": "2026-05-20T00:00:00Z", "skillsRequired": ["Logo Design", "Branding", "Adobe Illustrator", "Figma"], "experienceLevel": "expert", "status": "open", "totalProposals": 8, "createdAt": "2026-05-02T14:00:00Z"},
        {"id": "job_3", "title": "Write 10 SEO blog posts for e-commerce site", "slug": "seo-blog-ecommerce", "description": "Need a content writer for 10 SEO-optimized blog posts, 1000-1500 words each.", "category": {"id": "cat_3", "name": "Writing & Translation", "slug": "writing-translation"}, "client": {"id": "u_2", "displayName": "John Doe", "username": "johndoe", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe", "rating": 4.5}, "type": "fixed", "budgetMin": 5000.0, "budgetMax": 10000.0, "deadline": "2026-05-30T00:00:00Z", "skillsRequired": ["Content Writing", "SEO", "Blog Writing", "Keyword Research"], "experienceLevel": "intermediate", "status": "open", "totalProposals": 20, "createdAt": "2026-05-03T09:00:00Z"},
        {"id": "job_4", "title": "Edit 5 YouTube videos (vlog style) per week", "slug": "youtube-video-editing", "description": "Looking for a video editor to edit 5 vlog-style videos per week.", "category": {"id": "cat_4", "name": "Video & Animation", "slug": "video-animation"}, "client": {"id": "u_2", "displayName": "John Doe", "username": "johndoe", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe", "rating": 4.5}, "type": "hourly", "budgetMin": 500.0, "budgetMax": 1000.0, "deadline": None, "skillsRequired": ["Video Editing", "Premiere Pro", "After Effects", "Color Grading"], "experienceLevel": "intermediate", "status": "open", "totalProposals": 15, "createdAt": "2026-05-04T16:00:00Z"},
        {"id": "job_5", "title": "Build REST API with Node.js and PostgreSQL", "slug": "nodejs-rest-api", "description": "Need a backend developer for a RESTful API with Node.js, Express, PostgreSQL, and JWT.", "category": {"id": "cat_5", "name": "Programming & Tech", "slug": "programming-tech"}, "client": {"id": "u_2", "displayName": "John Doe", "username": "johndoe", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe", "rating": 4.5}, "type": "fixed", "budgetMin": 30000.0, "budgetMax": 60000.0, "deadline": "2026-06-30T00:00:00Z", "skillsRequired": ["Node.js", "Express", "PostgreSQL", "JWT", "Swagger"], "experienceLevel": "expert", "status": "open", "totalProposals": 6, "createdAt": "2026-05-05T08:00:00Z"},
        {"id": "job_6", "title": "Create Facebook & Instagram ad campaigns", "slug": "social-media-ads", "description": "Need a digital marketer to run FB/IG ad campaigns for product launch.", "category": {"id": "cat_2", "name": "Digital Marketing", "slug": "digital-marketing"}, "client": {"id": "u_2", "displayName": "John Doe", "username": "johndoe", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe", "rating": 4.5}, "type": "fixed", "budgetMin": 10000.0, "budgetMax": 20000.0, "deadline": "2026-05-25T00:00:00Z", "skillsRequired": ["Facebook Ads", "Instagram Ads", "Meta Business Suite", "Analytics"], "experienceLevel": "expert", "status": "open", "totalProposals": 9, "createdAt": "2026-05-05T12:00:00Z"},
    ],
    "proposals": [
        {"id": "prop_1", "jobId": "job_1", "freelancer": {"id": "u_1", "displayName": "Ahsanul Hoque", "username": "ahsanul", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=ahsanul", "rating": 4.9}, "coverLetter": "I have extensive experience building food delivery apps with Flutter. I've built similar apps with real-time tracking using Firebase and Google Maps.", "proposedPrice": 75000.0, "estimatedDays": 30, "status": "pending", "createdAt": "2026-05-02T10:00:00Z"},
        {"id": "prop_2", "jobId": "job_1", "freelancer": {"id": "u_6", "displayName": "Tanvir Rahman", "username": "tanvirrahman", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=tanvirrahman", "rating": 4.3}, "coverLetter": "I am a Flutter developer with 3 years of experience. I have built several delivery apps.", "proposedPrice": 60000.0, "estimatedDays": 25, "status": "pending", "createdAt": "2026-05-03T15:00:00Z"},
        {"id": "prop_3", "jobId": "job_2", "freelancer": {"id": "u_3", "displayName": "Sarah Khan", "username": "sarahkhan", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=sarahkhan", "rating": 4.7}, "coverLetter": "I'd love to design your startup's new logo! I have experience with SaaS branding.", "proposedPrice": 5000.0, "estimatedDays": 5, "status": "pending", "createdAt": "2026-05-03T11:00:00Z"},
        {"id": "prop_4", "jobId": "job_3", "freelancer": {"id": "u_5", "displayName": "Fatima Ahmed", "username": "fatimaahmed", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=fatimaahmed", "rating": 5.0}, "coverLetter": "I have 5+ years writing SEO content for e-commerce. I can deliver all 10 posts on time.", "proposedPrice": 8000.0, "estimatedDays": 14, "status": "accepted", "createdAt": "2026-05-04T08:00:00Z"},
        {"id": "prop_5", "jobId": "job_5", "freelancer": {"id": "u_1", "displayName": "Ahsanul Hoque", "username": "ahsanul", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=ahsanul", "rating": 4.9}, "coverLetter": "I have built multiple REST APIs with Node.js and PostgreSQL for marketplace platforms.", "proposedPrice": 45000.0, "estimatedDays": 21, "status": "pending", "createdAt": "2026-05-05T14:00:00Z"},
    ],
    "orders": [
        {"id": "ord_1", "orderNumber": "GH-2026-001", "gig": {"id": "gig_1", "title": "I will design a modern minimalist logo"}, "status": "active", "amount": 2000.0, "deadline": "2026-05-15T18:00:00Z"},
        {"id": "ord_2", "orderNumber": "GH-2026-002", "gig": {"id": "gig_3", "title": "I will write SEO optimized blog posts"}, "status": "completed", "amount": 1200.0, "deadline": "2026-04-28T18:00:00Z"},
        {"id": "ord_3", "orderNumber": "GH-2026-003", "gig": {"id": "gig_2", "title": "I will build a fully responsive Flutter mobile app"}, "status": "active", "amount": 35000.0, "deadline": "2026-06-01T18:00:00Z"},
    ],
    "conversations": [
        {"id": "conv_1", "participant": {"id": "u_1", "displayName": "Ahsanul Hoque", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=ahsanul"}, "lastMessage": {"content": "Sure, I can help with that!", "createdAt": "2026-05-05T15:30:00Z"}, "unreadCount": 2},
        {"id": "conv_2", "participant": {"id": "u_3", "displayName": "Sarah Khan", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=sarahkhan"}, "lastMessage": {"content": "I'll send the design concepts by tomorrow", "createdAt": "2026-05-05T10:00:00Z"}, "unreadCount": 0},
        {"id": "conv_3", "participant": {"id": "u_5", "displayName": "Fatima Ahmed", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=fatimaahmed"}, "lastMessage": {"content": "The first draft of the blog post is ready", "createdAt": "2026-05-04T18:00:00Z"}, "unreadCount": 1},
    ],
}

with open('docs/mock_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f'Written {len(data)} top-level keys to mock_data.json')
"