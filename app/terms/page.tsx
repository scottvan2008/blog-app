import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Terms of Service - InkDrop",
  description: "Terms and conditions for using the InkDrop platform",
}

export default function TermsPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/">← Back to Home</Link>
        </Button>
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using the InkDrop platform, you agree to be bound by these Terms of Service. If you do not
          agree to these terms, please do not use our services.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          InkDrop provides a platform for users to create, publish, and share blog content. We reserve the right to
          modify, suspend, or discontinue any aspect of the service at any time.
        </p>

        <h2>3. User Accounts</h2>
        <p>
          To use certain features of InkDrop, you must create an account. You are responsible for maintaining the
          confidentiality of your account information and for all activities that occur under your account. You agree to
          notify us immediately of any unauthorized use of your account.
        </p>

        <h2>4. User Content</h2>
        <p>
          You retain ownership of the content you post on InkDrop. By posting content, you grant InkDrop a
          non-exclusive, worldwide, royalty-free license to use, display, and distribute your content in connection with
          the service.
        </p>
        <p>
          You are solely responsible for the content you post and must comply with our Content Policy. We reserve the
          right to remove any content that violates our policies.
        </p>

        <h2>5. Prohibited Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe upon the rights of others</li>
          <li>Post unauthorized commercial communications</li>
          <li>Upload viruses or malicious code</li>
          <li>Attempt to access data not intended for you</li>
          <li>Interfere with the proper functioning of the service</li>
        </ul>

        <h2>6. Termination</h2>
        <p>
          We reserve the right to terminate or suspend your account and access to InkDrop at our sole discretion,
          without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us,
          or third parties, or for any other reason.
        </p>

        <h2>7. Disclaimer of Warranties</h2>
        <p>
          InkDrop is provided "as is" without warranties of any kind, either express or implied. We do not warrant that
          the service will be uninterrupted or error-free.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          InkDrop shall not be liable for any indirect, incidental, special, consequential, or punitive damages
          resulting from your use of or inability to use the service.
        </p>

        <h2>9. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms of Service at any time. We will provide notice of significant
          changes by posting the new terms on the platform. Your continued use of InkDrop after such modifications
          constitutes your acceptance of the revised terms.
        </p>

        <h2>10. Governing Law</h2>
        <p>
          These Terms of Service shall be governed by the laws of the jurisdiction in which InkDrop operates, without
          regard to its conflict of law provisions.
        </p>

        <h2>11. Contact Information</h2>
        <p>
          If you have any questions about these Terms of Service, please contact us at{" "}
          <a href="mailto:support@inkdrop.com">support@inkdrop.com</a>.
        </p>
      </div>
    </div>
  )
}
