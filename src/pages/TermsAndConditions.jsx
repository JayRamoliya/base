import React from 'react';

export default function TermsAndConditions() {
  return (
    <div className="bg-white min-h-screen p-4 sm:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto prose prose-lg">
        <h1>Terms and Conditions</h1>
        <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        
        <p>This is a placeholder for your Terms and Conditions. It's crucial to have a legally sound document prepared by a professional for your real application.</p>

        <h2>1. Agreement to Terms</h2>
        <p>By using our application, Marketing OS, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the application.</p>

        <h2>2. Intellectual Property Rights</h2>
        <p>Unless otherwise indicated, the application is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.</p>
        
        <h2>3. User Representations</h2>
        <p>By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Terms and Conditions; (4) you are not a minor in the jurisdiction in which you reside; (5) you will not access the Site through automated or non-human means, whether through a bot, script or otherwise.</p>
        
        <h2>4. User Registration</h2>
        <p>You may be required to register with the Site. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.</p>
        
        <h2>5. Prohibited Activities</h2>
        <p>You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.</p>
        
        <h2>6. Term and Termination</h2>
        <p>These Terms and Conditions shall remain in full force and effect while you use the Site. WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS AND CONDITIONS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SITE (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON.</p>

        <h2>7. Governing Law</h2>
        <p>These conditions are governed by and interpreted following the laws of the jurisdiction in which the company is based, and the use of the United Nations Convention of Contracts for the International Sale of Goods is expressly excluded.</p>

        <h2>8. Disclaimer</h2>
        <p>THE SITE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SITE AND OUR SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SITE AND YOUR USE THEREOF.</p>

        <h2>9. Contact Us</h2>
        <p>In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: legal@marketingos.com</p>

      </div>
    </div>
  );
}