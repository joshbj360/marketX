<template>
  <HomeLayout :narrow-feed="false">
    <div class="mx-auto max-w-3xl px-4 py-12 pb-24 sm:px-6 lg:px-8">
      <div class="mb-8 border-b border-gray-200 pb-6 dark:border-neutral-800">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-neutral-100">
          Terms of Service
        </h1>
        <p class="mt-2 text-sm text-gray-500 dark:text-neutral-400">
          Effective Date: November 2025 · Last Updated: March 2026
        </p>
      </div>

      <div
        class="space-y-8 text-sm leading-relaxed text-gray-700 dark:text-neutral-300"
      >
        <p>
          These Terms of Service ("Terms") govern your access to and use of
          <strong>{{ config.public.siteName || 'styleX' }}</strong> ("Platform",
          "we", "us"). By creating an account or making a purchase, you agree to
          be bound by these Terms. Please read them carefully.
        </p>

        <!-- 1 -->
        <section>
          <h2
            class="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100"
          >
            1. Eligibility
          </h2>
          <p>
            You must be at least 13 years old to use the Platform. If you are
            under 18, you represent that your parent or legal guardian has
            reviewed and consented to these Terms. By using the Platform you
            represent that all information you provide is accurate.
          </p>
        </section>

        <!-- 2 -->
        <section>
          <h2
            class="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100"
          >
            2. Accounts
          </h2>
          <ul class="list-inside list-disc space-y-2 pl-2">
            <li>
              You are responsible for maintaining the confidentiality of your
              password and for all activity that occurs under your account.
            </li>
            <li>
              Notify us immediately of any unauthorised use of your account.
            </li>
            <li>
              You may not create multiple accounts to circumvent restrictions or
              bans.
            </li>
            <li>
              We reserve the right to suspend or terminate accounts that violate
              these Terms.
            </li>
          </ul>
        </section>

        <!-- 3 -->
        <section>
          <h2
            class="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100"
          >
            3. Seller Responsibilities
          </h2>
          <ul class="list-inside list-disc space-y-2 pl-2">
            <li>
              Sellers must provide accurate product titles, descriptions,
              images, pricing, and stock levels at all times.
            </li>
            <li>
              Products must comply with all applicable Nigerian laws and must
              not be counterfeit, illegal, or hazardous.
            </li>
            <li>
              Sellers are solely responsible for fulfilling orders, shipping
              timelines, and resolving disputes with buyers.
            </li>
            <li>
              Misrepresenting thrift/pre-owned items as new (or vice versa) may
              result in immediate account suspension.
            </li>
            <li>
              Sellers must not use the Platform to conduct transactions
              off-platform in order to avoid fees.
            </li>
          </ul>
        </section>

        <!-- 4 -->
        <section>
          <h2
            class="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100"
          >
            4. Buyer Responsibilities
          </h2>
          <ul class="list-inside list-disc space-y-2 pl-2">
            <li>Provide accurate shipping addresses when placing orders.</li>
            <li>
              Payment must be completed at checkout. Orders not paid within the
              session window will be cancelled automatically.
            </li>
            <li>
              Buyers agree to the seller's return/refund policy before
              completing a purchase.
            </li>
            <li>
              Initiating chargebacks or payment disputes without first
              attempting resolution through our support channel may result in
              account suspension.
            </li>
          </ul>
        </section>

        <!-- 5 -->
        <section>
          <h2
            class="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100"
          >
            5. Payments & Fees
          </h2>
          <p class="mb-3">
            All payments are processed securely by Paystack. By completing a
            purchase, you authorise the transaction amount to be charged to your
            chosen payment method.
          </p>
          <ul class="list-inside list-disc space-y-2 pl-2">
            <li>
              A platform service fee is deducted from each seller payout; the
              current rate is displayed in your Seller Dashboard.
            </li>
            <li>
              Shipping costs are calculated at checkout and are non-refundable
              unless the item is faulty.
            </li>
            <li>
              Payouts to sellers are processed after the buyer confirms receipt
              or after a 3-day dispute window, whichever comes first.
            </li>
          </ul>
        </section>

        <!-- 6 -->
        <section>
          <h2
            class="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100"
          >
            6. Affiliate & Referral Programme
          </h2>
          <p>
            Sellers may offer an affiliate commission on their products.
            Affiliates earn the commission displayed on the product page for
            each verified sale driven through their unique referral link.
            Commission is credited after the buyer's dispute window closes.
            {{ config.public.siteName || 'styleX' }} reserves the right to
            withhold commission for fraudulent or self-referred purchases.
          </p>
        </section>

        <!-- 7 -->
        <section>
          <h2
            class="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100"
          >
            7. Use of AI Tools
          </h2>
          <p>
            Content generated by our AI features (product descriptions, social
            captions, tags) is provided "as is" without warranty of accuracy or
            legal compliance. Sellers must review and approve all AI-generated
            content before publishing. We are not liable for any loss arising
            from reliance on AI-generated content.
          </p>
        </section>

        <!-- 8 -->
        <section>
          <h2
            class="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100"
          >
            8. Intellectual Property
          </h2>
          <p>
            You retain ownership of content you upload (photos, videos,
            descriptions). By uploading, you grant
            {{ config.public.siteName || 'styleX' }} a non-exclusive,
            royalty-free licence to display, reproduce, and distribute that
            content on the Platform and in promotional materials. We will never
            sell your content to third parties.
          </p>
        </section>

        <!-- 9 -->
        <section>
          <h2
            class="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100"
          >
            9. Prohibited Conduct
          </h2>
          <p class="mb-3">You agree not to:</p>
          <ul class="list-inside list-disc space-y-2 pl-2">
            <li>
              Upload malware or engage in any activity that disrupts the
              Platform.
            </li>
            <li>
              Scrape, crawl, or programmatically access the Platform without our
              written consent.
            </li>
            <li>Impersonate another person or entity.</li>
            <li>
              Post content that is defamatory, obscene, or violates third-party
              rights.
            </li>
            <li>
              Use the Platform to launder money or conduct illegal transactions.
            </li>
          </ul>
        </section>

        <!-- 10 -->
        <section>
          <h2
            class="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100"
          >
            10. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by law,
            {{ config.public.siteName || 'styleX' }} is not liable for indirect,
            incidental, or consequential damages arising from your use of the
            Platform. Our total liability to you for any claim shall not exceed
            the total fees paid by you to us in the 3 months preceding the
            claim.
          </p>
        </section>

        <!-- 11 -->
        <section>
          <h2
            class="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100"
          >
            11. Termination
          </h2>
          <p>
            We may suspend or terminate your access at any time if you breach
            these Terms. You may close your account at any time via Account
            Settings. Upon termination, your right to use the Platform ceases
            immediately. Provisions that by their nature should survive
            (including payment obligations and dispute resolution) will do so.
          </p>
        </section>

        <!-- 12 -->
        <section>
          <h2
            class="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100"
          >
            12. Governing Law
          </h2>
          <p>
            These Terms are governed by and construed in accordance with the
            laws of the Federal Republic of Nigeria. Disputes shall be resolved
            through good-faith negotiation first. If unresolved, disputes shall
            be submitted to the jurisdiction of Nigerian courts.
          </p>
        </section>

        <!-- 13 -->
        <section>
          <h2
            class="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100"
          >
            13. Changes to These Terms
          </h2>
          <p>
            We may update these Terms from time to time. Material changes will
            be communicated via email or an in-app notification at least 14 days
            before they take effect. Continued use of the Platform after the
            effective date constitutes acceptance.
          </p>
        </section>

        <!-- Contact -->
        <div
          class="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <h3 class="mb-2 font-bold text-gray-900 dark:text-neutral-100">
            Questions about these Terms?
          </h3>
          <p class="text-sm text-gray-600 dark:text-neutral-400">
            Contact us at
            <a
              :href="`mailto:${config.public.supportEmail || 'legal@stylex.indicestech.com'}`"
              class="font-medium text-brand hover:underline"
              >{{
                config.public.supportEmail || 'legal@stylex.indicestech.com'
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
  title: `Terms of Service · ${useRuntimeConfig().public.siteName || 'styleX'}`,
  description: `Read the terms and conditions governing use of the ${useRuntimeConfig().public.siteName || 'styleX'} platform.`,
})
</script>
