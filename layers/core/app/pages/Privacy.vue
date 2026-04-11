<template>
  <HomeLayout :narrow-feed="false">
    <div class="mx-auto max-w-3xl px-4 py-12 pb-24 sm:px-6 lg:px-8">
      <div class="mb-8 border-b border-gray-200 pb-6 dark:border-neutral-800">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-neutral-100">
          Privacy Policy
        </h1>
        <p class="mt-2 text-sm text-gray-500 dark:text-neutral-400">
          Effective Date: November 2025 · Last Updated: March 2026
        </p>
      </div>

      <div
        class="space-y-8 text-sm leading-relaxed text-gray-700 dark:text-neutral-300"
      >
        <p>
          Welcome to <strong>{{ config.public.siteName || 'styleX' }}</strong
          >. Your privacy matters to us. This policy explains what data we
          collect, why we collect it, and how you can control it. By using our
          platform you agree to the practices described here.
        </p>

        <!-- 1 -->
        <section>
          <h2
            class="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100"
          >
            1. Information We Collect
          </h2>
          <p class="mb-3">We collect information in three ways:</p>
          <ul class="list-inside list-disc space-y-2 pl-2">
            <li>
              <strong>Account data</strong> — name, email address, username,
              password hash, and profile photo when you register.
            </li>
            <li>
              <strong>Transactional data</strong> — shipping address, order
              history, and payment references (we never store raw card numbers;
              payments are processed by Paystack).
            </li>
            <li>
              <strong>Usage data</strong> — pages visited, search queries,
              product interactions, and device/browser information collected via
              standard server logs to improve the service.
            </li>
            <li>
              <strong>Seller data</strong> — store name, logo, product listings,
              bank account details (for payouts), and any media you upload.
            </li>
          </ul>
        </section>

        <!-- 2 -->
        <section>
          <h2
            class="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100"
          >
            2. How We Use Your Information
          </h2>
          <ul class="list-inside list-disc space-y-2 pl-2">
            <li>Process and fulfil orders between buyers and sellers.</li>
            <li>
              Personalise your feed, discovery recommendations, and search
              results.
            </li>
            <li>
              Send transactional emails (order confirmations, shipping updates).
            </li>
            <li>
              Detect and prevent fraudulent activity or policy violations.
            </li>
            <li>
              Improve our AI-powered product discovery engine using anonymised
              interaction signals.
            </li>
            <li>
              Comply with legal obligations (tax records, fraud investigations)
              where required by Nigerian law.
            </li>
          </ul>
          <p class="mt-3">
            We do <strong>not</strong> sell your personal data to third-party
            advertisers.
          </p>
        </section>

        <!-- 3 -->
        <section>
          <h2
            class="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100"
          >
            3. Sharing of Data
          </h2>
          <p class="mb-3">We share data only where necessary:</p>
          <ul class="list-inside list-disc space-y-2 pl-2">
            <li>
              <strong>Between buyers and sellers</strong> — buyers' shipping
              addresses and contact information are shared with the seller for
              the specific order.
            </li>
            <li>
              <strong>Payment processors</strong> — Paystack receives
              transaction amounts and references to process payments.
            </li>
            <li>
              <strong>Infrastructure providers</strong> — Cloudinary (media
              hosting), and our cloud server provider store data on our behalf
              under strict data-processing agreements.
            </li>
            <li>
              <strong>Legal compliance</strong> — we may disclose data if
              required by a court order or applicable law.
            </li>
          </ul>
        </section>

        <!-- 4 -->
        <section>
          <h2
            class="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100"
          >
            4. Cookies & Tracking
          </h2>
          <p>
            We use essential cookies to keep you logged in and remember your
            preferences (e.g., language, dark mode). We do not use third-party
            advertising cookies. You can clear cookies at any time through your
            browser settings; however, doing so will log you out.
          </p>
        </section>

        <!-- 5 -->
        <section>
          <h2
            class="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100"
          >
            5. Data Retention
          </h2>
          <p>
            We retain your account data for as long as your account is active.
            If you delete your account, your personal information is removed
            within 30 days, except where we are required to retain it for legal
            or financial compliance purposes (e.g., order receipts for 7 years
            under Nigerian tax law).
          </p>
        </section>

        <!-- 6 -->
        <section>
          <h2
            class="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100"
          >
            6. Your Rights
          </h2>
          <p class="mb-3">You have the right to:</p>
          <ul class="list-inside list-disc space-y-2 pl-2">
            <li>
              <strong>Access</strong> — request a copy of the data we hold about
              you.
            </li>
            <li>
              <strong>Correction</strong> — update inaccurate profile or account
              data at any time via Settings.
            </li>
            <li>
              <strong>Deletion</strong> — request account deletion from Account
              Settings.
            </li>
            <li>
              <strong>Portability</strong> — request an export of your data in a
              machine-readable format.
            </li>
            <li>
              <strong>Objection</strong> — opt out of non-essential
              communications at any time.
            </li>
          </ul>
          <p class="mt-3">
            To exercise any right, contact us at
            <a
              :href="`mailto:${config.public.supportEmail || 'privacy@stylex.indicestech.com'}`"
              class="font-medium text-brand hover:underline"
              >{{
                config.public.supportEmail || 'privacy@stylex.indicestech.com'
              }}</a
            >.
          </p>
        </section>

        <!-- 7 -->
        <section>
          <h2
            class="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100"
          >
            7. Security
          </h2>
          <p>
            Passwords are hashed using bcrypt and never stored in plain text.
            All data transmission is encrypted via HTTPS/TLS. Payment
            credentials are handled exclusively by Paystack and are never stored
            on our servers.
          </p>
        </section>

        <!-- 8 -->
        <section>
          <h2
            class="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100"
          >
            8. Children's Privacy
          </h2>
          <p>
            Our platform is not directed to children under the age of 13. We do
            not knowingly collect personal information from children. If you
            believe a child has provided us with their data, please contact us
            and we will delete it promptly.
          </p>
        </section>

        <!-- 9 -->
        <section>
          <h2
            class="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100"
          >
            9. Changes to This Policy
          </h2>
          <p>
            We may update this policy periodically. When we do, we will revise
            the "Last Updated" date above and, where changes are significant,
            notify you via email or an in-app banner. Your continued use of the
            platform after changes constitutes acceptance of the new policy.
          </p>
        </section>

        <!-- Contact -->
        <div
          class="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <h3 class="mb-2 font-bold text-gray-900 dark:text-neutral-100">
            Questions about your privacy?
          </h3>
          <p class="text-sm text-gray-600 dark:text-neutral-400">
            Reach out to our privacy team at
            <a
              :href="`mailto:${config.public.supportEmail || 'privacy@stylex.indicestech.com'}`"
              class="font-medium text-brand hover:underline"
              >{{
                config.public.supportEmail || 'privacy@stylex.indicestech.com'
              }}</a
            >.
          </p>
        </div>
      </div>
    </div>

    <template #right-sidebar>
      <RightSideNavLinks />
    </template>
  </HomeLayout>
</template>

<script setup lang="ts">
import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'
import RightSideNavLinks from '~~/layers/core/app/layouts/children/RightSideNavLinks.vue'

const config = useRuntimeConfig()

useSeoMeta({
  title: `Privacy Policy · ${useRuntimeConfig().public.siteName || 'styleX'}`,
  description: `Learn how ${useRuntimeConfig().public.siteName || 'styleX'} collects, uses, and protects your personal data.`,
})
</script>
