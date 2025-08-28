import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="bg-white min-h-screen p-4 sm:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto prose prose-lg">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        
        <p>This is a placeholder for your Privacy Policy. In a real application, you should replace this with a comprehensive policy that covers your data collection, usage, and protection practices.</p>

        <h2>1. Introduction</h2>
        <p>Welcome to Marketing OS. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.</p>

        <h2>2. Information We Collect</h2>
        <p>We collect personal information that you voluntarily provide to us when you register on the application, express an interest in obtaining information about us or our products and services, when you participate in activities on the application or otherwise when you contact us.</p>
        <p>The personal information that we collect depends on the context of your interactions with us and the application, the choices you make and the products and features you use. The personal information we collect may include the following: name, email address, job title, and company information.</p>

        <h2>3. How We Use Your Information</h2>
        <p>We use personal information collected via our application for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
        <ul>
            <li>To facilitate account creation and logon process.</li>
            <li>To post testimonials with your consent.</li>
            <li>To manage user accounts.</li>
            <li>To send administrative information to you.</li>
        </ul>

        <h2>4. Will Your Information Be Shared With Anyone?</h2>
        <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.</p>
        
        <h2>5. How Long Do We Keep Your Information?</h2>
        <p>We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law (such as tax, accounting or other legal requirements).</p>
        
        <h2>6. How Do We Keep Your Information Safe?</h2>
        <p>We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.</p>
        
        <h2>7. Do We Collect Information From Minors?</h2>
        <p>We do not knowingly solicit data from or market to children under 18 years of age. By using the application, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent’s use of the application.</p>
        
        <h2>8. What Are Your Privacy Rights?</h2>
        <p>In some regions (like the European Economic Area), you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time.</p>
        
        <h2>9. Controls for Do-Not-Track Features</h2>
        <p>Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track (“DNT”) feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage, no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online.</p>
        
        <h2>10. How Can You Contact Us About This Policy?</h2>
        <p>If you have questions or comments about this policy, you may email us at a placeholder address: privacy@marketingos.com</p>

      </div>
    </div>
  );
}