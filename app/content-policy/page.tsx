import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Content Policy - InkDrop",
  description: "Guidelines for content published on the InkDrop platform",
}

export default function ContentPolicyPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/">← Back to Home</Link>
        </Button>
        <h1 className="text-4xl font-bold mb-2">Content Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h2>1. Introduction</h2>
        <p>
          At InkDrop, we believe in freedom of expression and the power of sharing ideas. However, to ensure our
          platform remains safe, respectful, and valuable for all users, we've established this Content Policy. All
          users must adhere to these guidelines when publishing content on InkDrop.
        </p>

        <h2>2. Prohibited Content</h2>
        <p>The following types of content are not allowed on InkDrop:</p>

        <h3>2.1 Illegal Content</h3>
        <p>
          Content that violates any applicable local, state, national, or international law or regulation is prohibited.
          This includes but is not limited to content that:
        </p>
        <ul>
          <li>Promotes illegal activities</li>
          <li>Violates intellectual property rights</li>
          <li>Contains child exploitation material</li>
          <li>Facilitates illegal transactions</li>
        </ul>

        <h3>2.2 Harmful or Dangerous Content</h3>
        <p>Content that poses a risk of harm to individuals or groups is prohibited, including:</p>
        <ul>
          <li>Instructions for self-harm or suicide</li>
          <li>Promotion of dangerous activities without proper safety precautions</li>
          <li>Medical misinformation that could cause harm</li>
          <li>Content encouraging violence or harm against individuals or groups</li>
        </ul>

        <h3>2.3 Hateful Content</h3>
        <p>
          Content that promotes hatred, discrimination, or violence against individuals or groups based on attributes
          such as:
        </p>
        <ul>
          <li>Race, ethnicity, or national origin</li>
          <li>Religion</li>
          <li>Disability</li>
          <li>Age</li>
          <li>Gender or gender identity</li>
          <li>Sexual orientation</li>
          <li>Veteran status</li>
        </ul>

        <h3>2.4 Harassment and Bullying</h3>
        <p>Content that harasses, intimidates, or bullies others is prohibited, including:</p>
        <ul>
          <li>Personal attacks</li>
          <li>Unwanted sexual content</li>
          <li>Revealing private personal information (doxxing)</li>
          <li>Encouraging others to harass an individual or group</li>
        </ul>

        <h3>2.5 Spam and Deceptive Practices</h3>
        <p>Content that is designed to mislead or deceive users is prohibited, including:</p>
        <ul>
          <li>Misleading metadata or thumbnails</li>
          <li>Scams or fraudulent content</li>
          <li>Artificially inflating engagement metrics</li>
          <li>Excessive promotional content</li>
        </ul>

        <h2>3. Content Moderation</h2>
        <p>
          InkDrop uses a combination of automated systems and human review to identify content that violates our
          policies. We may take one or more of the following actions in response to policy violations:
        </p>
        <ul>
          <li>Remove the violating content</li>
          <li>Issue a warning to the content creator</li>
          <li>Restrict the visibility of the content</li>
          <li>Temporarily suspend the user's account</li>
          <li>Permanently terminate the user's account for severe or repeated violations</li>
        </ul>

        <h2>4. Reporting Violations</h2>
        <p>
          If you encounter content that you believe violates our Content Policy, please report it immediately. To report
          a violation:
        </p>
        <ol>
          <li>Click on the "Report" option associated with the content</li>
          <li>Select the appropriate reason for your report</li>
          <li>Provide any additional information that may help us review the content</li>
        </ol>
        <p>
          We review all reports and take appropriate action based on our Content Policy. We appreciate your help in
          keeping InkDrop a safe and positive environment.
        </p>

        <h2>5. Appeals</h2>
        <p>
          If you believe your content was removed in error or that a decision was made incorrectly, you may appeal the
          decision. To submit an appeal, contact our support team at{" "}
          <a href="mailto:content@inkdrop.com">content@inkdrop.com</a> with the subject line "Content Appeal" and
          include the following information:
        </p>
        <ul>
          <li>Your username</li>
          <li>The title and URL of the removed content</li>
          <li>An explanation of why you believe the decision should be reconsidered</li>
        </ul>

        <h2>6. Changes to This Policy</h2>
        <p>
          We may update our Content Policy from time to time. We will notify users of any significant changes by posting
          the new Content Policy on this page and updating the "Last updated" date.
        </p>

        <h2>7. Contact Us</h2>
        <p>
          If you have any questions about this Content Policy, please contact us at{" "}
          <a href="mailto:content@inkdrop.com">content@inkdrop.com</a>.
        </p>
      </div>
    </div>
  )
}
