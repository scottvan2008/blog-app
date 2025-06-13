import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Privacy Policy - InkDrop",
  description: "Privacy policy for the InkDrop platform",
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/">← Back to Home</Link>
        </Button>
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h2>1. Introduction</h2>
        <p>
          At InkDrop, we respect your privacy and are committed to protecting your personal data. This Privacy Policy
          explains how we collect, use, and safeguard your information when you use our platform.
        </p>

        <h2>2. Information We Collect</h2>
        <h3>2.1 Personal Information</h3>
        <p>We may collect the following personal information:</p>
        <ul>
          <li>Account information (name, email address, profile picture)</li>
          <li>Content you create, publish, or share on our platform</li>
          <li>Communications between you and InkDrop</li>
          <li>Authentication information when you sign in with third-party services</li>
        </ul>

        <h3>2.2 Usage Information</h3>
        <p>We automatically collect certain information when you use InkDrop:</p>
        <ul>
          <li>Log data (IP address, browser type, pages visited, time spent)</li>
          <li>Device information (device type, operating system)</li>
          <li>Cookies and similar tracking technologies</li>
          <li>User interactions (posts viewed, links clicked, features used)</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Process and complete transactions</li>
          <li>Send you technical notices, updates, and support messages</li>
          <li>Respond to your comments, questions, and requests</li>
          <li>Monitor and analyze trends, usage, and activities</li>
          <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
          <li>Personalize your experience on our platform</li>
        </ul>

        <h2>4. Information Sharing and Disclosure</h2>
        <p>We may share your information with:</p>
        <ul>
          <li>Service providers who perform services on our behalf</li>
          <li>Third parties if we believe disclosure is necessary to comply with the law</li>
          <li>Other users, according to your privacy settings</li>
          <li>Business partners, with your consent</li>
        </ul>

        <h2>5. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information. However, no method of
          transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute
          security.
        </p>

        <h2>6. Your Rights</h2>
        <p>Depending on your location, you may have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Correct inaccurate or incomplete information</li>
          <li>Delete your personal information</li>
          <li>Restrict or object to our processing of your information</li>
          <li>Data portability</li>
          <li>Withdraw consent</li>
        </ul>

        <h2>7. Children's Privacy</h2>
        <p>
          Our services are not intended for children under 13 years of age. We do not knowingly collect personal
          information from children under 13. If we learn we have collected personal information from a child under 13,
          we will delete that information.
        </p>

        <h2>8. Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
          Privacy Policy on this page and updating the "Last updated" date.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at{" "}
          <a href="mailto:privacy@inkdrop.com">privacy@inkdrop.com</a>.
        </p>
      </div>
    </div>
  )
}
