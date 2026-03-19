import Link from "next/link";

export default function RefundPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)" }}>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/auth" className="text-sm font-medium mb-6 inline-block" style={{ color: "var(--color-brand-orange)" }}>&larr; Back</Link>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text)" }}>No Refund Policy</h1>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>Last updated: March 19, 2026</p>
        <div className="space-y-6 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          <S t="Policy Statement">All purchases made on UmukoziHR Recruit are final and non-refundable. This includes credit purchases, subscription plans, and any other paid features.</S>
          <S t="Why No Refunds?">When you use a credit to perform a search, our platform incurs real costs for AI processing (Google Gemini), web search (Exa API), and LinkedIn profile enrichment (Apify). These costs are incurred immediately and cannot be reversed.</S>
          <S t="Unused Credits">Credits that have been purchased but not yet used are non-refundable. They remain in your account until used or until account termination.</S>
          <S t="Subscription Cancellation">If you cancel a subscription, you retain access to remaining credits until the end of the billing period. No partial refunds are issued.</S>
          <S t="Account Termination">If your account is terminated (by you or by us), any unused credits are forfeited.</S>
          <S t="Exceptions">In rare cases, we may issue credit adjustments (not cash refunds) if: (a) a technical error caused a search to fail without returning results; (b) you were charged incorrectly. Adjustments are at our sole discretion.</S>
          <S t="Free Starter Credits">Complimentary starter credits have no cash value and cannot be transferred or refunded.</S>
          <S t="Disputes">If you believe you were charged in error, contact <strong>billing@umukozihire.com</strong> within 7 days. We will respond within 5 business days.</S>
        </div>
      </div>
    </div>
  );
}

function S({ t, children }: { t: string; children: React.ReactNode }) {
  return (<section><h2 className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>{t}</h2><p>{children}</p></section>);
}
