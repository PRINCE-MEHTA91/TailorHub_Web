import sys
import re
import os

def clean_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        return 0
        
    orig = content
    
    # Replace block headers like:
    # // ═══════════════════════════════════════════════════════════════
    # // TEXT
    # // ═══════════════════════════════════════════════════════════════
    # with: // TEXT
    pattern_block = r'^[ \t]*//[ \t]*[═=─\-]{10,}\s*\n^[ \t]*//[ \t]*(.*?)\s*\n^[ \t]*//[ \t]*[═=─\-]{10,}\s*\n'
    content = re.sub(pattern_block, r'// \1\n', content, flags=re.MULTILINE)
    
    # Replace single line padded headers like:
    # // ── Profile / gallery / pricing image upload — memory storage only ───────────
    # with: // Profile / gallery / pricing image upload — memory storage only
    pattern_single = r'^[ \t]*//[ \t]*[═=─\-]+[ \t]*(.*?)[ \t]*[═=─\-]+\s*\n'
    content = re.sub(pattern_single, r'// \1\n', content, flags=re.MULTILINE)
    
    # Also if there are remaining trailing dashes:
    # // Text ──────
    pattern_trailing = r'^[ \t]*//[ \t]*(.*?)[ \t]*[═=─\-]{5,}\s*\n'
    content = re.sub(pattern_trailing, r'// \1\n', content, flags=re.MULTILINE)

    # Clean up excessive newlines (more than 2 consecutive newlines -> 2 newlines)
    # This also helps "remove extra line use for comment"
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    if content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return 1
    return 0

files = [
    'client/src/components/ActiveOffers.js',
    'client/src/components/FeaturedPricing.js',
    'client/src/components/Header.js',
    'client/src/components/HeightInput.js',
    'client/src/components/ImageUpload.js',
    'client/src/components/LocationModal.js',
    'client/src/components/SearchResults.js',
    'client/src/components/TailorConnect.js',
    'client/src/context/AuthContext.js',
    'client/src/pages/AiRecommendationsPage.js',
    'client/src/pages/ArrivalsAndTrendingPage.js',
    'client/src/pages/BodyMeasurement.js',
    'client/src/pages/BookingPage.js',
    'client/src/pages/BrowseTailorsDealsPage.js',
    'client/src/pages/ChatPage.js',
    'client/src/pages/CompletedOrdersPage.js',
    'client/src/pages/CustomerDashboardPage.js',
    'client/src/pages/EarningsPage.js',
    'client/src/pages/ForgotPasswordPage.js',
    'client/src/pages/HelpPage.js',
    'client/src/pages/LoginPage.js',
    'client/src/pages/NotificationsPage.js',
    'client/src/pages/PendingJobsPage.js',
    'client/src/pages/ResetPasswordPage.js',
    'client/src/pages/SignupPage.js',
    'client/src/pages/TailorDashboardPage.js',
    'client/src/pages/TailorDetailsPage.js',
    'client/src/services/measurementApi.js',
    'client/src/index.js',
    'server/controllers/ai.controller.js',
    'server/prompts/outfitPrompt.js',
    'server/routes/ai.routes.js',
    'server/services/gemini.service.js',
    'server/check-offers.js',
    'server/diag2.js',
    'server/full-describe.js',
    'server/init_feedback_db.js',
    'server/recreate-users.js',
    'server/server.js',
    'python/body_measure.py',
    'python/measure_server.py'
]

mod = 0
for f in files:
    mod += clean_file(f)
print(f'Final aesthetic cleanup modified {mod} files')
