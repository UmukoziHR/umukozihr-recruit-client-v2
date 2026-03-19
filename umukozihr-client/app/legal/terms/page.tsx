import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)" }}>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/auth" className="text-sm font-medium mb-6 inline-block" style={{ color: "var(--color-brand-orange)" }}>&larr; Back</Link>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text)" }}>Terms of Service</h1>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>Last updated: March 19, 2026</p>
        <div className="space-y-6 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          <S t="1. Acceptance of Terms">By accessing or using UmukoziHR Recruit (&quot;the Service&quot;), operated by UmukoziHR (&quot;the Company&quot;, &quot;we&quot;, &quot;us&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</S>
          <S t="2. Description of Service">UmukoziHR Recruit is an AI-powered talent sourcing platform that helps enterprises find, screen, and rank candidates using artificial intelligence, web search, and LinkedIn profile enrichment. The Service includes candidate search, scoring, willingness assessment, and conversational AI assistance.</S>
          <S t="3. Account Registration">You must register for an account to use the Service. You agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</S>
          <S t="4. Credit System and Payments">The Service operates on a credit-based system. Credits are consumed when you perform searches. New accounts receive starter credits. Additional credits can be purchased through our subscription plans. All credit purchases are final and non-refundable (see our <Link href="/legal/refund" className="underline" style={{ color: "var(--color-brand-orange)" }}>No Refund Policy</Link>). We reserve the right to modify pricing and credit costs at any time with reasonable notice.</S>
          <S t="5. Acceptable Use">You agree not to: (a) use the Service for any unlawful purpose; (b) scrape, copy, or redistribute candidate data outside the platform; (c) contact candidates in a harassing or deceptive manner; (d) attempt to circumvent credit limits or usage restrictions; (e) share your account credentials; (f) use the Service to discriminate against candidates based on protected characteristics.</S>
          <S t="6. Data and Privacy">Candidate data displayed in the Service is sourced from publicly available information on the internet, including LinkedIn profiles. We process this data in accordance with our <Link href="/legal/privacy" className="underline" style={{ color: "var(--color-brand-orange)" }}>Privacy Policy</Link>. You are responsible for complying with applicable data protection laws when using candidate information obtained through the Service.</S>
          <S t="7. AI-Generated Content">The Service uses AI models to analyze, score, and rank candidates. AI outputs are probabilistic and may contain inaccuracies. You should independently verify AI-generated assessments before making hiring decisions. We are not liable for decisions made based on AI outputs.</S>
          <S t="8. Intellectual Property">The Service, including its software, design, and AI models, is the intellectual property of UmukoziHR. You are granted a limited, non-exclusive license to use the Service for your internal recruiting purposes.</S>
          <S t="9. Limitation of Liability">TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE COMPANY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM.</S>
          <S t="10. Termination">We may suspend or terminate your account if you violate these Terms. You may terminate your account at any time. Upon termination, unused credits are forfeited and non-refundable.</S>
          <S t="11. Governing Law">These Terms are governed by the laws of the Republic of Ghana. Any disputes shall be resolved in the courts of Accra, Ghana.</S>
          <S t="12. Contact">For questions about these Terms, contact us at <strong>legal@umukozihire.com</strong>.</S>
        </div>
      </div>
    </div>
  );
}

function S({ t, children }: { t: string; children: React.ReactNode }) {
  return (<section><h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>{t}</h2><p>{children}</p></section>);
}
