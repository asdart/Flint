/**
 * Legal pages copy (Privacy Policy, Terms of Service), copied verbatim from the live site
 * (withflint.com, effective date Sept 15, 2025) by script. The wording is never edited here: only
 * the structure is rebuilt (headings, paragraphs, lists). This is page text, not editor content
 * (rule 9): it changes with a legal review, not as a repeating CMS item.
 */

/** An inline run: plain text, a bold sentence, or the support mailbox (a `mailto:` link, same text). */
export type LegalInline = string | { strong: string } | { mail: string };

export type LegalBlock =
  | { type: "h2"; text: string }
  | { type: "p"; content: LegalInline[] }
  | { type: "ul"; items: LegalInline[][] };

export type LegalPage = {
  title: string;
  /** Shown under the hero title as a plain line, e.g. "Sept 15, 2025". */
  effectiveDate: string;
  /** Company / Address / Contact lines, one paragraph with line breaks. */
  intro: LegalInline[][];
  blocks: LegalBlock[];
};

export const privacyPolicy: LegalPage = {
  title: "Privacy Policy",
  effectiveDate: "Sept 15, 2025",
  intro: [
    ["Company: Flint Healthcare, Inc. (“Flint,” “we,” “us,” or “our”)"],
    ["Address: 140 Scott Drive, Menlo Park, CA 94025"],
    ["Contact: ", { mail: "support@withflint.com" }],
  ],
  blocks: [
    { type: "h2", text: "1) Scope" },
    { type: "p", content: ["This Privacy Policy explains how we collect, use, and share information when you use our website, apply to job opportunities, communicate with us, or opt in to receive SMS/text messages."] },
    { type: "h2", text: "2) Information we collect" },
    {
      type: "ul",
      items: [
        ["Contact & identifiers: name, email, phone number, postal address."],
        ["Professional info: resume/CV, work history, credentials, preferences."],
        ["Immigration-related info: only as voluntarily provided for sponsorship workflows."],
        ["Device & usage info: IP address, pages viewed, timestamps, cookies/analytics."],
        ["Messaging data: opt-in status, timestamps, message content/metadata, delivery and response logs (e.g., HELP/STOP)."],
        ["Communications: emails, calls, and chat transcripts."],
      ],
    },
    { type: "h2", text: "3) How we use information" },
    {
      type: "ul",
      items: [
        ["Evaluate and match candidates to roles; schedule interviews; manage onboarding."],
        ["Send transactional and informational messages (email/SMS) such as status updates, reminders, and document requests."],
        ["Send optional promotional communications about Flint services (only if permitted by law and, for SMS, only with your express consent)."],
        ["Operate, secure, and improve our website and analytics."],
        ["Comply with legal, regulatory, and carrier/10DLC requirements and to maintain records of consent."],
      ],
    },
    { type: "h2", text: "4) SMS-specific privacy commitments (10DLC/CTIA/TCPA)" },
    {
      type: "ul",
      items: [
        ["No sale or marketing sharing: We do not sell SMS consent data or share it with third parties for their marketing or promotional purposes."],
        ["Vendors as processors: We may share phone numbers and messaging metadata with service providers (e.g., messaging platforms, carriers) solely to deliver and support our messaging program and to satisfy compliance obligations."],
        ["Your choices: You may opt out at any time by texting STOP. Text HELP for help. You may also email ", { mail: "support@withflint.com" }, " to revoke consent or request deletion."],
      ],
    },
    { type: "h2", text: "5) Legal bases (where applicable)" },
    { type: "p", content: ["Where required (e.g., in the EEA/UK), we process personal data based on consent, performance of a contract, legitimate interests (e.g., recruiting operations, fraud prevention), and legal obligations."] },
    { type: "h2", text: "6) Retention" },
    { type: "p", content: ["We retain personal data only as long as necessary for recruiting operations, record-keeping, and legal/compliance purposes (including 10DLC consent records). When no longer needed, we delete or de-identify it."] },
    { type: "h2", text: "7) Your rights" },
    { type: "p", content: ["Depending on your location, you may have rights to access, correct, delete, or port your data, and to object to or restrict certain processing. To exercise rights, contact ", { mail: "support@withflint.com" }, ". We will not discriminate against you for exercising privacy rights."] },
    { type: "h2", text: "8) Cookies & analytics" },
    { type: "p", content: ["We use cookies and similar technologies to operate the site and understand usage. You can control cookies through your browser settings; some features may not function without them."] },
    { type: "h2", text: "9) Children" },
    { type: "p", content: ["Our services are not directed to children under 13. We do not knowingly collect personal data from children."] },
    { type: "h2", text: "10) Security" },
    { type: "p", content: ["We use administrative, technical, and physical safeguards designed to protect personal data. No method of transmission or storage is 100% secure."] },
    { type: "h2", text: "11) Sharing" },
    { type: "p", content: ["We share data:"] },
    {
      type: "ul",
      items: [
        ["With service providers that perform services for us (hosting, messaging, analytics, background checks) under contracts that restrict use to providing those services."],
        ["With employers/clients when you apply or we present you for a role (only relevant information)."],
        ["When required by law or to protect rights, safety, and security."],
      ],
    },
    { type: "p", content: [{ strong: "We do not sell personal information, and we do not share SMS consent data with third parties for their marketing purposes." }] },
    { type: "h2", text: "12) International transfers" },
    { type: "p", content: ["We may process information in the U.S. and other countries. Where required, we use appropriate safeguards for cross-border transfers."] },
    { type: "h2", text: "13) Changes & contact" },
    { type: "p", content: ["We may update this Policy; the “Effective date” will change accordingly. Questions or requests: ", { mail: "support@withflint.com" }, "."] },
  ],
};

export const termsOfService: LegalPage = {
  title: "Terms of Service",
  effectiveDate: "Sept 15, 2025",
  intro: [
    ["Company: Flint Healthcare, Inc. (“Flint,” “we,” “us,” or “our”)"],
    ["Address: 140 Scott Drive, Menlo Park, CA 94025"],
    ["Contact: ", { mail: "support@withflint.com" }],
  ],
  blocks: [
    { type: "h2", text: "1) Your agreement" },
    { type: "p", content: ["By accessing our website, applying to job opportunities, or opting in to receive messages from us (including SMS/text), you agree to these Terms of Service (“Terms”). If you do not agree, do not use our site or opt in to messaging. We may update these Terms at any time; the “Effective date” shows when they last changed."] },
    { type: "h2", text: "2) Our services" },
    { type: "p", content: ["We connect healthcare professionals with U.S. employers and provide information about immigration-related sponsorship programs (e.g., EB-3), interviews, scheduling, documentation, and related updates."] },
    { type: "h2", text: "3) Eligibility" },
    { type: "p", content: ["You must be 18 or older (or the age of majority in your jurisdiction) to use our site or to opt in to SMS. You represent that the information you provide is accurate and that you are authorized to receive messages at the phone number you provide."] },
    { type: "h2", text: "4) Accounts, submissions, and acceptable use" },
    { type: "p", content: ["You are responsible for information you provide and for complying with applicable laws. Do not misuse the site (e.g., attempt to interfere with its operation, post unlawful content, or infringe others’ rights)."] },
    { type: "h2", text: "5) SMS/Text Messaging Program (10DLC-Compliant)" },
    { type: "p", content: ["Program name: Flint Healthcare UpdatesMessage types: Application status, interview scheduling and reminders, document requests, onboarding steps, compliance notices, and occasional informational or promotional updates relevant to Flint’s services.Frequency: Message frequency varies.Cost: Msg & data rates may apply.Opt-in: You may opt in via our web forms, by checking an explicit consent box, by texting a keyword we provide, or by providing your number to a Flint representative and verbally confirming consent. Consent is not a condition of purchase or employment.Opt-out: Text STOP to end. We also honor END, CANCEL, UNSUBSCRIBE, and QUIT. After you send STOP, we may send one final message to confirm you’ve been unsubscribed.Help: Text HELP for help, or contact us at ", { mail: "support@withflint.com" }, ".One-to-one and bulk: These SMS Terms apply to both one-to-one conversations with our team and to automated/bulk messages sent via our approved 10DLC numbers.Carriers: Message delivery may be delayed or undelivered; carriers are not liable for delayed or undelivered messages.Changes: We may change short/long codes or sending numbers and will communicate any material changes."] },
    { type: "h2", text: "6) Consent & records" },
    { type: "p", content: ["By opting in, you authorize us to use an automated system to send text messages to the mobile number you provide. We retain records of consent and messaging activity to comply with CTIA/TCPA/10DLC requirements."] },
    { type: "h2", text: "7) Data practices" },
    { type: "p", content: ["Our collection and use of personal data (including phone numbers and SMS consent data) are described in our Privacy Policy. We do not sell SMS consent data or share it with third parties for their marketing purposes."] },
    { type: "h2", text: "8) Third-party services" },
    { type: "p", content: ["We may use service providers (e.g., messaging platforms) to deliver SMS and site features. They act on our behalf and may only use your data to provide those services to us."] },
    { type: "h2", text: "9) Disclaimers" },
    { type: "p", content: ["Our site and communications are provided “as is.” We do not guarantee uninterrupted or error-free service, nor employment outcomes."] },
    { type: "h2", text: "10) Limitation of liability" },
    { type: "p", content: ["To the maximum extent permitted by law, Flint and its affiliates will not be liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, revenues, or data, arising from or related to your use of the site or SMS."] },
    { type: "h2", text: "11) Indemnification" },
    { type: "p", content: ["You agree to indemnify and hold Flint harmless from claims arising out of your misuse of the site or violation of these Terms."] },
    { type: "h2", text: "12) Governing law; venue" },
    { type: "p", content: ["These Terms are governed by the laws of the State of California (without regard to conflicts of laws). Courts located in Santa Clara County, California shall have exclusive jurisdiction."] },
    { type: "h2", text: "13) Changes and contact" },
    { type: "p", content: ["We may modify these Terms. Continued use after changes means you accept the updated Terms. Questions? Contact ", { mail: "support@withflint.com" }] },
  ],
};
