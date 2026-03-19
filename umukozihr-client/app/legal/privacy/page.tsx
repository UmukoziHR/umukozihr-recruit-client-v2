import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)" }}>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/auth" className="text-sm font-medium mb-6 inline-block" style={{ color: "var(--color-brand-orange)" }}>&larr; Back</Link>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text)" }}>Privacy Policy</h1>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>Last updated: March 19, 2026</p>
        <div className="space-y-6 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          <S t="1. Information We Collect"><strong>Account Information:</strong> Name, email, company name, job title. <strong>Usage Data:</strong> Search queries, candidate interactions, feature usage. <strong>Payment Information:</strong> Processed by Paystack; we do not store card details. <strong>Company Profile:</strong> Optional company details to improve candidate matching.</S>
          <S t="2. How We Use Your Information">We use your information to: (a) provide and improve the Service; (b) personalize search results; (c) process payments; (d) communicate about your account; (e) analyze usage to improve AI models; (f) comply with legal obligations.</S>
          <S t="3. Candidate Data">Candidate data is sourced from publicly available information via Exa web search and LinkedIn profile enrichment through Apify. We do not collect private or restricted data. Profiles are processed by AI to extract professional attributes.</S>
          <S t="4. Third-Party Services">We use: <strong>Google Gemini</strong> (AI processing), <strong>Exa</strong> (neural web search), <strong>Apify</strong> (LinkedIn enrichment), <strong>Paystack</strong> (payments), <strong>Neon</strong> (database hosting). Each has its own privacy policy.</S>
          <S t="5. Data Retention">Account data is retained while your account is active. Search results are retained for 12 months. You may request deletion at any time.</S>
          <S t="6. Data Security">We implement encryption in transit (TLS), hashed passwords (bcrypt), and secure database hosting. No system is 100% secure.</S>
          <S t="7. Your Rights">You have the right to: (a) access your data; (b) correct inaccuracies; (c) request deletion; (d) export your data; (e) withdraw consent. Contact <strong>privacy@umukozihire.com</strong>.</S>
          <S t="8. Cookies">We use essential cookies for authentication only. No tracking or advertising cookies.</S>
          <S t="9. International Transfers">Your data may be processed in servers outside your country. By using the Service, you consent to such transfers.</S>
          <S t="10. Children">The Service is not intended for individuals under 18. We do not knowingly collect data from minors.</S>
          <S t="11. Changes">We may update this policy periodically and will notify you of material changes via email or in-app notification.</S>
          <S t="12. Contact">For privacy inquiries: <strong>privacy@umukozihire.com</strong>.</S>
        </div>
      </div>
    </div>
  );
}

function S({ t, children }: { t: string; children: React.ReactNode }) {
  return (<section><h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>{t}</h2><div>{children}</div></section>);
}
