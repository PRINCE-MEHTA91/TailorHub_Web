import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SECTIONS = {
  'how-it-works': {
    title: 'How TailorHub Works',
    emoji: '⚙️',
    color: '#4f46e5',
    gradient: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)',
    intro: 'TailorHub connects customers directly with skilled tailors in their city — making custom tailoring as easy as placing an online order.',
    items: [
      { q: '1. Create an Account', a: 'Sign up for free as a Customer. Fill in your name, email, and a strong password. Verify your email and you\'re ready to go!' },
      { q: '2. Browse & Discover Tailors', a: 'Use the search bar or browse by category (shirts, suits, blouses, kurtas, etc.). Filter tailors by location, rating, price range, and specialty.' },
      { q: '3. View Tailor Profiles', a: 'Each tailor has a detailed profile: portfolio photos, services offered, pricing lists, customer reviews, and ratings. Compare multiple tailors before deciding.' },
      { q: '4. Book an Appointment', a: 'Select your preferred tailor and click "Book Appointment". Choose your garment type, provide measurements or schedule a measurement visit, set a delivery date, and pay an advance amount.' },
      { q: '5. Track Your Order', a: 'Once your order is placed, you can track it live through stages: Order Placed → Cutting → Stitching → Trial Ready → Completed → Delivered.' },
      { q: '6. Receive & Review', a: 'Get your custom garment delivered or pick it up. After delivery, leave a star rating and written review to help other customers and reward great tailors.' },
    ],
  },
  'payments-pricing': {
    title: 'Payments & Pricing',
    emoji: '💳',
    color: '#0891b2',
    gradient: 'linear-gradient(135deg,#0891b2 0%,#0e7490 100%)',
    intro: 'TailorHub is transparent about pricing. What you see is what you pay — no hidden charges.',
    items: [
      { q: 'How is pricing decided?', a: 'Each tailor sets their own prices based on garment type, complexity, fabric, and finishing. You can view detailed price lists on every tailor\'s profile before booking.' },
      { q: 'What is the advance payment?', a: 'At the time of booking, you pay an advance (usually 30–50% of the total) to confirm the order. The remaining balance is paid on delivery or pickup.' },
      { q: 'What payment methods are accepted?', a: 'We support UPI (Google Pay, PhonePe, Paytm), debit/credit cards, net banking, and cash on delivery (COD) — subject to tailor preference.' },
      { q: 'Are there any platform charges?', a: 'TailorHub does not charge customers any platform fee. The price you see is what the tailor charges. Tailors pay a nominal commission to the platform.' },
      { q: 'Do you offer discounts or coupons?', a: 'Yes! Tailors can publish special offers and coupons. You\'ll see active discounts on the home page and the tailor\'s profile. Apply them at checkout for instant savings.' },
      { q: 'Can I get an invoice?', a: 'Absolutely. After your order is Completed or Delivered, go to My Orders, find the order, and tap "🧾 Invoice" to view and print a professional PDF invoice.' },
    ],
  },
  'cancellation-policy': {
    title: 'Cancellation & Refund Policy',
    emoji: '🔄',
    color: '#d97706',
    gradient: 'linear-gradient(135deg,#d97706 0%,#b45309 100%)',
    intro: 'We want every experience on TailorHub to be great. If something goes wrong, here\'s how cancellations and refunds work.',
    items: [
      { q: 'Can I cancel an order?', a: 'Yes, you can cancel an order within 24 hours of placing it if the tailor has not yet started work (status is "Order Placed"). Go to My Orders → select the order → tap "Cancel Order".' },
      { q: 'What happens to my advance on cancellation?', a: 'If cancelled within 24 hours and work hasn\'t started: 100% refund. If work has started (status = Cutting or beyond): partial refund may apply based on the tailor\'s cancellation terms.' },
      { q: 'How long do refunds take?', a: 'Approved refunds are processed within 3–7 business days back to the original payment method. UPI refunds are usually faster (1–2 days).' },
      { q: 'What if the garment has defects?', a: 'Raise a dispute within 48 hours of delivery by going to My Orders → "Dispute Resolution". TailorHub will mediate between you and the tailor to arrange alterations or a refund.' },
      { q: 'Can a tailor cancel my order?', a: 'In rare cases (illness, unavailability), a tailor may cancel. You will be notified immediately and receive a 100% refund of any advance paid, no questions asked.' },
      { q: 'Is there a no-show policy?', a: 'If you miss a scheduled measurement visit without prior notice, the tailor may charge a nominal no-show fee as stated in their profile terms.' },
    ],
  },
  'faq': {
    title: 'Frequently Asked Questions',
    emoji: '❓',
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg,#7c3aed 0%,#5b21b6 100%)',
    intro: 'Got questions? We\'ve got answers. Here are the most common things customers ask us.',
    items: [
      { q: 'Is TailorHub free for customers?', a: 'Yes! Creating an account and browsing tailors is completely free. You only pay for the tailoring services you book.' },
      { q: 'How do I find tailors near me?', a: 'Allow location access when prompted, or manually enter your city. The app automatically shows tailors closest to you. You can also filter by pincode or city name.' },
      { q: 'Can I chat with a tailor before booking?', a: 'Yes. Each tailor profile shows their WhatsApp number (if shared). You can reach out directly to discuss designs, fabrics, or measurements before placing an order.' },
      { q: 'Do I need to provide my own fabric?', a: 'It depends on the tailor. Some tailors offer stitching-only services (you provide the fabric), while others provide fabric + stitching packages. Check the tailor\'s price listing for details.' },
      { q: 'How are tailors verified?', a: 'Every tailor on TailorHub goes through a basic ID and skill verification process before their profile goes live. Customer ratings and reviews further ensure quality.' },
      { q: 'Can I reorder the same garment?', a: 'Yes! Your order history is saved. Simply contact the same tailor via their profile and reference your previous order details.' },
      { q: 'What cities is TailorHub available in?', a: 'TailorHub is currently available in major Indian cities and expanding rapidly. If your city isn\'t listed, you can register your interest and we\'ll notify you when we launch there.' },
      { q: 'How do I become a tailor on TailorHub?', a: 'Click "Become a Tailor" on the home page, sign up with the "Tailor" role, complete your profile with your specialties and pricing, and start receiving orders!' },
    ],
  },
  'dispute-resolution': {
    title: 'Dispute Resolution',
    emoji: '⚖️',
    color: '#dc2626',
    gradient: 'linear-gradient(135deg,#dc2626 0%,#991b1b 100%)',
    intro: 'We take every dispute seriously. Our goal is a fair, quick resolution for both customers and tailors.',
    items: [
      { q: 'When should I raise a dispute?', a: 'Raise a dispute if: (1) your garment doesn\'t match the agreed design, (2) it has quality defects or stitching issues, (3) delivery was significantly delayed without notice, or (4) the tailor is unresponsive after delivery.' },
      { q: 'How do I raise a dispute?', a: 'Go to My Orders → find the relevant order → tap "Dispute Resolution". Describe the issue, attach photos if possible, and submit. Our team will review it within 24 hours.' },
      { q: 'What happens after I raise a dispute?', a: 'TailorHub notifies the tailor and gives them 48 hours to respond. Both sides share their perspective. Our team mediates and decides on a resolution: free alteration, partial refund, or full refund.' },
      { q: 'Can I escalate if I\'m not satisfied?', a: 'Yes. If you disagree with the initial resolution, you can escalate to TailorHub senior support by emailing support@tailorhub.in with your order ID and dispute reference number.' },
      { q: 'How long does dispute resolution take?', a: 'Most disputes are resolved within 3–5 business days. Complex cases involving quality assessments may take up to 10 business days.' },
      { q: 'Are disputes kept confidential?', a: 'Yes. All dispute communications are strictly between the customer, tailor, and TailorHub support team. Your personal details are never shared publicly.' },
    ],
  },
  'return-refunds': {
    title: 'Return & Refunds',
    emoji: '↩️',
    color: '#059669',
    gradient: 'linear-gradient(135deg,#059669 0%,#065f46 100%)',
    intro: 'Custom-tailored garments are made specifically for you. Here\'s our return and refund policy.',
    items: [
      { q: 'Can I return a custom-tailored garment?', a: 'Since garments are stitched to your personal measurements, standard return-and-replace is not applicable. However, tailors are obligated to offer free alterations if the fit is off.' },
      { q: 'What qualifies for a refund?', a: 'Full refund: order cancelled within 24h before work starts. Partial refund: work started but major defect found. No refund: garment delivered in agreed condition and measurements.' },
      { q: 'How do I request a refund?', a: 'Contact the tailor first via their profile. If unresolved within 48 hours, raise a formal dispute through My Orders. TailorHub support will process approved refunds within 3–7 business days.' },
      { q: 'What if the garment is lost in transit?', a: 'TailorHub holds tailors responsible for delivery. If lost during courier, a full refund is issued automatically. Report the issue within 7 days of the expected delivery date.' },
    ],
  },
  'terms-of-use': {
    title: 'Terms of Use',
    emoji: '📋',
    color: '#374151',
    gradient: 'linear-gradient(135deg,#374151 0%,#111827 100%)',
    intro: 'By using TailorHub, you agree to the following terms. Please read them carefully.',
    items: [
      { q: 'Eligibility', a: 'You must be at least 18 years old to create an account and use TailorHub\'s services. By registering, you confirm that the information you provide is accurate and up to date.' },
      { q: 'Account Responsibility', a: 'You are responsible for maintaining the confidentiality of your login credentials. Any activity under your account is your responsibility. Report unauthorized access immediately to support@tailorhub.in.' },
      { q: 'Prohibited Activities', a: 'You may not: (1) post false information or fake reviews, (2) attempt to circumvent the platform to deal directly and avoid platform terms, (3) harass or abuse tailors or other users, (4) use the platform for illegal activities.' },
      { q: 'Intellectual Property', a: 'All content on TailorHub — logos, design, code, and branding — is the intellectual property of TailorHub Pvt. Ltd. You may not copy, modify, or redistribute it without written permission.' },
      { q: 'Modifications to Terms', a: 'TailorHub reserves the right to update these terms at any time. Continued use of the platform after changes constitutes your acceptance of the revised terms.' },
    ],
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    emoji: '🔒',
    color: '#1d4ed8',
    gradient: 'linear-gradient(135deg,#1d4ed8 0%,#1e3a8a 100%)',
    intro: 'Your privacy is important to us. This policy explains what data we collect, how we use it, and your rights.',
    items: [
      { q: 'What data do we collect?', a: 'We collect: your name, email, phone number, address (for delivery), profile photo, order history, and location data (city-level). Payment details are processed securely by our payment gateway and never stored on our servers.' },
      { q: 'How do we use your data?', a: 'Your data is used to: provide tailoring services, match you with nearby tailors, send order updates and notifications, improve our platform, and comply with legal obligations.' },
      { q: 'Do we share your data with third parties?', a: 'We share your data only with the tailor assigned to your order (name, phone, and delivery address) and with our payment gateway. We do not sell your data to advertisers.' },
      { q: 'How do we protect your data?', a: 'We use industry-standard encryption (HTTPS/TLS) for all data transmission. Passwords are hashed using bcrypt. Servers are protected by firewalls and regular security audits.' },
      { q: 'Can I delete my account?', a: 'Yes. Email support@tailorhub.in with a deletion request. We\'ll remove your personal data within 30 days, except records required by law (e.g., transaction history for tax purposes).' },
      { q: 'Cookies', a: 'TailorHub uses session cookies for authentication and preference cookies to remember your location and settings. You can disable cookies in your browser, but some features may stop working.' },
    ],
  },
  'security': {
    title: 'Security',
    emoji: '🛡️',
    color: '#0f766e',
    gradient: 'linear-gradient(135deg,#0f766e 0%,#134e4a 100%)',
    intro: 'Keeping your account and data safe is our top priority.',
    items: [
      { q: 'How are passwords stored?', a: 'Passwords are never stored in plain text. We use bcrypt hashing with a salt factor of 12, making brute-force attacks computationally impractical.' },
      { q: 'Is my payment information safe?', a: 'Yes. TailorHub does not store any card or UPI details. All payments are processed through PCI-DSS compliant payment gateways. Look for the padlock icon in your browser URL bar.' },
      { q: 'How do I secure my account?', a: 'Use a strong, unique password. Do not share your login credentials with anyone. Log out from shared devices. Enable email notifications so you\'re alerted to any login activity.' },
      { q: 'What if my account is compromised?', a: 'Immediately change your password via "Forgot Password" on the login page. Then email support@tailorhub.in with the subject line "URGENT: Account Compromised" and your registered email.' },
      { q: 'How do you handle security vulnerabilities?', a: 'We run regular security audits and penetration tests. If you discover a security vulnerability, please report it responsibly to security@tailorhub.in. We follow a responsible disclosure policy.' },
    ],
  },
  'contact-us': {
    title: 'Contact Us',
    emoji: '📬',
    color: '#9333ea',
    gradient: 'linear-gradient(135deg,#9333ea 0%,#6b21a8 100%)',
    intro: 'We\'re here to help! Reach out to us through any of the following channels.',
    items: [
      { q: '📧 Email Support', a: 'For general queries, order issues, or account help:\nsupport@tailorhub.in\nWe respond within 24 hours on business days (Mon–Sat).' },
      { q: '📞 Phone Support', a: 'Call us at +91-9999-000-111\nAvailable Monday to Saturday, 9 AM – 7 PM IST.' },
      { q: '💬 WhatsApp Support', a: 'Send us a message on WhatsApp: +91-9999-000-111\nQuick responses during business hours.' },
      { q: '⚖️ Dispute & Escalation', a: 'For unresolved disputes: disputes@tailorhub.in\nPlease include your Order ID and a brief description of the issue.' },
      { q: '🏢 Registered Office', a: 'TailorHub Pvt. Ltd.\nBuilding A, Tech Park, Ring Road\nIndore, Madhya Pradesh – 452001\nIndia' },
      { q: '🕐 Support Hours', a: 'Monday to Saturday: 9:00 AM – 7:00 PM IST\nSunday & Public Holidays: Closed\nEmergency support (account security): 24×7 via email.' },
    ],
  },
};

const NAV_LINKS = [
  { id: 'how-it-works',        label: '⚙️ How It Works' },
  { id: 'payments-pricing',    label: '💳 Payments & Pricing' },
  { id: 'cancellation-policy', label: '🔄 Cancellation Policy' },
  { id: 'faq',                 label: '❓ FAQ' },
  { id: 'dispute-resolution',  label: '⚖️ Dispute Resolution' },
  { id: 'return-refunds',      label: '↩️ Return & Refunds' },
  { id: 'terms-of-use',        label: '📋 Terms of Use' },
  { id: 'privacy-policy',      label: '🔒 Privacy Policy' },
  { id: 'security',            label: '🛡️ Security' },
  { id: 'contact-us',          label: '📬 Contact Us' },
];

const FAQItem = ({ q, a, color, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{
        background: '#fff',
        borderRadius: 16,
        border: `1px solid ${open ? color + '33' : '#f0f0f0'}`,
        marginBottom: 12,
        overflow: 'hidden',
        boxShadow: open ? `0 6px 24px ${color}18` : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '18px 22px',
          background: open ? color + '08' : 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          transition: 'background 0.2s',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 15, color: open ? color : '#111827', lineHeight: 1.4, transition: 'color 0.2s' }}>{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22 }}
          style={{ fontSize: 20, color, flexShrink: 0, lineHeight: 1 }}
        >▾</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '14px 22px 20px',
              fontSize: 14,
              color: '#4b5563',
              lineHeight: 1.8,
              whiteSpace: 'pre-line',
              borderTop: `2px solid ${color}22`,
            }}>
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const HelpPage = () => {
  const { section = 'how-it-works' } = useParams();
  const navigate = useNavigate();
  const data = SECTIONS[section] || SECTIONS['how-it-works'];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [section]);

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fa', fontFamily: "'Inter', sans-serif" }}>

      {/* ── TOP HERO HEADER (full width) ─────────────────────────────────── */}
      <div style={{ background: data.gradient, width: '100%' }}>

        {/* Back button row */}
        <div style={{ padding: '16px 20px 0' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.35)',
              borderRadius: 50,
              padding: '9px 20px',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
              letterSpacing: '0.2px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
          >
            ← Back
          </button>
        </div>

        {/* Hero title */}
        <div style={{ padding: '20px 20px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 10, lineHeight: 1 }}>{data.emoji}</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
            {data.title}
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', margin: '0 auto', maxWidth: 560, lineHeight: 1.7 }}>
            {data.intro}
          </p>
          <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            ✂️ TailorHub Help Center
          </div>
        </div>

        {/* Topic pills nav — scrollable */}
        <div style={{
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          padding: '0 16px 0',
          scrollbarWidth: 'none',
        }}>
          <div style={{ display: 'inline-flex', gap: 8, paddingBottom: 0 }}>
            {NAV_LINKS.map(link => {
              const active = link.id === section;
              return (
                <Link
                  key={link.id}
                  to={`/help/${link.id}`}
                  style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    borderRadius: 50,
                    fontSize: 12,
                    fontWeight: active ? 800 : 600,
                    color: active ? data.color : 'rgba(255,255,255,0.85)',
                    background: active ? '#fff' : 'rgba(255,255,255,0.14)',
                    border: active ? 'none' : '1px solid rgba(255,255,255,0.25)',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                    boxShadow: active ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Wave divider */}
        <svg viewBox="0 0 1440 40" style={{ display: 'block', marginTop: 16 }} preserveAspectRatio="none" height={40} width="100%">
          <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="#f4f6fa" />
        </svg>
      </div>

      {/* ── FULL WIDTH CONTENT ───────────────────────────────────────────── */}
      <div style={{ width: '100%', padding: '0 16px 100px' }}>
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          style={{ maxWidth: 860, margin: '32px auto 0' }}
        >
          {/* Q&A Accordion */}
          {data.items.map((item, i) => (
            <FAQItem key={`${section}-${i}`} q={item.q} a={item.a} color={data.color} index={i} />
          ))}

          {/* Still need help CTA */}
          <div style={{
            marginTop: 36,
            background: '#fff',
            border: '1.5px solid #e5e7eb',
            borderRadius: 20,
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 36 }}>💬</span>
            <div style={{ flex: 1, minWidth: 180 }}>
              <p style={{ fontWeight: 800, color: '#111827', fontSize: 16, margin: '0 0 4px' }}>Still need help?</p>
              <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>Our support team is available Mon–Sat, 9 AM – 7 PM IST</p>
            </div>
            <a
              href="mailto:support@tailorhub.in"
              style={{
                background: data.gradient,
                color: '#fff',
                padding: '12px 24px',
                borderRadius: 50,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                boxShadow: `0 4px 14px ${data.color}44`,
              }}
            >
              Email Us →
            </a>
          </div>

          {/* Other topics row */}
          <div style={{ marginTop: 32 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 14 }}>
              Other Help Topics
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {NAV_LINKS.filter(l => l.id !== section).map(link => (
                <Link
                  key={link.id}
                  to={`/help/${link.id}`}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 50,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#374151',
                    background: '#fff',
                    border: '1.5px solid #e5e7eb',
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = data.color;
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.border = `1.5px solid ${data.color}`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.color = '#374151';
                    e.currentTarget.style.border = '1.5px solid #e5e7eb';
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── BOTTOM NAV (same as customer dashboard) ──────────────────────── */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderTop: '1px solid #f3f4f6',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        zIndex: 50,
        display: 'flex',
      }}>
        {[
          { id: 'home',    label: 'Home',    icon: '🏠' },
          { id: 'tailors', label: 'Tailors', icon: '✂️' },
          { id: 'orders',  label: 'Orders',  icon: '📦' },
          { id: 'profile', label: 'Profile', icon: '👤' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => navigate('/customer/dashboard', { state: { tab: tab.id } })}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 0 8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              gap: 2,
            }}
          >
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', marginTop: 2 }}>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default HelpPage;

