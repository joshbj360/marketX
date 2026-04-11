--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: MediaType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MediaType" AS ENUM (
    'IMAGE',
    'VIDEO',
    'AUDIO'
);


ALTER TYPE public."MediaType" OWNER TO postgres;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'ORDER',
    'REVIEW',
    'PRODUCT',
    'GENERAL',
    'NEW_COMMENT',
    'COMMENT_LIKE',
    'REPLY',
    'PRODUCT_SHARE',
    'NEW_FOLLOWER',
    'NEW_POST',
    'POST_LIKE'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED',
    'CANCELED',
    'PAID',
    'SHIPPED',
    'DELIVERED',
    'RETURNED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'UNPAID',
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: ProductStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProductStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);


ALTER TYPE public."ProductStatus" OWNER TO postgres;

--
-- Name: VerificationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."VerificationStatus" AS ENUM (
    'PENDING',
    'VERIFIED',
    'REJECTED'
);


ALTER TYPE public."VerificationStatus" OWNER TO postgres;

--
-- Name: VisibilityType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."VisibilityType" AS ENUM (
    'PUBLIC',
    'PRIVATE',
    'FOLLOWERS'
);


ALTER TYPE public."VisibilityType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Addresses" (
    id integer NOT NULL,
    "userId" uuid NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    zipcode text NOT NULL,
    country text NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    county text NOT NULL,
    phone text NOT NULL,
    state text NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    label text
);


ALTER TABLE public."Addresses" OWNER TO postgres;

--
-- Name: Addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Addresses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Addresses_id_seq" OWNER TO postgres;

--
-- Name: Addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Addresses_id_seq" OWNED BY public."Addresses".id;


--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuditLog" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type text NOT NULL,
    user_id uuid NOT NULL,
    email text,
    ip_address text,
    user_agent text,
    success boolean NOT NULL,
    reason text,
    metadata jsonb,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO postgres;

--
-- Name: BankAccount; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BankAccount" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "sellerId" uuid NOT NULL,
    "bankName" text NOT NULL,
    "bankCode" text NOT NULL,
    "accountNumber" text NOT NULL,
    "accountName" text NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."BankAccount" OWNER TO postgres;

--
-- Name: CartItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CartItem" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quantity integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" uuid NOT NULL,
    "variantId" integer NOT NULL
);


ALTER TABLE public."CartItem" OWNER TO postgres;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id integer NOT NULL,
    name text NOT NULL,
    "thumbnailCatUrl" text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    slug text NOT NULL
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- Name: Category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Category_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Category_id_seq" OWNER TO postgres;

--
-- Name: Category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Category_id_seq" OWNED BY public."Category".id;


--
-- Name: Comment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Comment" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    text text NOT NULL,
    "authorId" uuid NOT NULL,
    "productId" integer,
    "parentId" uuid,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "postId" uuid
);


ALTER TABLE public."Comment" OWNER TO postgres;

--
-- Name: CommentLike; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CommentLike" (
    "userId" uuid NOT NULL,
    "commentId" uuid NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CommentLike" OWNER TO postgres;

--
-- Name: Conversation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Conversation" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone,
    "participant1Id" uuid NOT NULL,
    "participant2Id" uuid,
    "sellerId" uuid,
    "currentProductId" integer,
    "lastMessageAt" timestamp(6) with time zone
);


ALTER TABLE public."Conversation" OWNER TO postgres;

--
-- Name: EmailVerificationToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EmailVerificationToken" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    used_at timestamp(3) without time zone,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."EmailVerificationToken" OWNER TO postgres;

--
-- Name: FailedLoginAttempt; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FailedLoginAttempt" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text,
    user_id uuid,
    ip_address text,
    user_agent text,
    attempt_count integer DEFAULT 1 NOT NULL,
    locked_until timestamp(3) without time zone,
    last_attempt_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."FailedLoginAttempt" OWNER TO postgres;

--
-- Name: Follow; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Follow" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "followerId" uuid NOT NULL,
    "followingId" uuid NOT NULL,
    "followingType" text DEFAULT 'USER'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Follow" OWNER TO postgres;

--
-- Name: GlobalShippingZone; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."GlobalShippingZone" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    countries text[],
    "baseRate" integer NOT NULL,
    "perKgRate" integer DEFAULT 0 NOT NULL,
    "estimatedDays" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL
);


ALTER TABLE public."GlobalShippingZone" OWNER TO postgres;

--
-- Name: Like; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Like" (
    id integer NOT NULL,
    "userId" uuid NOT NULL,
    "productId" integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Like" OWNER TO postgres;

--
-- Name: Like_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Like_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Like_id_seq" OWNER TO postgres;

--
-- Name: Like_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Like_id_seq" OWNED BY public."Like".id;


--
-- Name: Media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Media" (
    url text NOT NULL,
    type public."MediaType" NOT NULL,
    "productId" integer,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "sellerId" uuid,
    "altText" text,
    metadata jsonb,
    public_id text,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "authorId" uuid NOT NULL,
    "postId" uuid,
    "isBgMusic" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Media" OWNER TO postgres;

--
-- Name: Message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Message" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "conversationId" uuid NOT NULL,
    "senderId" uuid NOT NULL,
    content text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "sentAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isAiResponse" boolean DEFAULT false NOT NULL,
    "productId" integer
);


ALTER TABLE public."Message" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id integer NOT NULL,
    "userId" uuid NOT NULL,
    message text NOT NULL,
    type public."NotificationType" NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "orderId" integer,
    "productId" integer,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    "actorId" uuid,
    "commentId" uuid,
    "postId" uuid
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: Notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Notification_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Notification_id_seq" OWNER TO postgres;

--
-- Name: Notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Notification_id_seq" OWNED BY public."Notification".id;


--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItem" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    quantity integer NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "variantId" integer NOT NULL,
    "affiliateCut" integer DEFAULT 0 NOT NULL,
    price double precision DEFAULT 0 NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO postgres;

--
-- Name: OrderItem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."OrderItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."OrderItem_id_seq" OWNER TO postgres;

--
-- Name: OrderItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."OrderItem_id_seq" OWNED BY public."OrderItem".id;


--
-- Name: Orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Orders" (
    id integer NOT NULL,
    "userId" uuid NOT NULL,
    "stripeId" text NOT NULL,
    "paymentRef" text,
    "paymentStatus" public."PaymentStatus" DEFAULT 'UNPAID'::public."PaymentStatus" NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    zipcode text NOT NULL,
    county text NOT NULL,
    country text NOT NULL,
    "shippingCost" integer DEFAULT 0 NOT NULL,
    "shippingZone" text,
    "estimatedDays" text,
    "totalAmount" integer NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    "paymentMethod" text NOT NULL,
    shipper text,
    "trackingNumber" text,
    "payoutAmount" integer,
    "labelUrl" text,
    "shippingProvider" text,
    "shippedAt" timestamp(3) without time zone,
    "affiliateCut" integer DEFAULT 0 NOT NULL,
    "affiliateUserId" uuid
);


ALTER TABLE public."Orders" OWNER TO postgres;

--
-- Name: Orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Orders_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Orders_id_seq" OWNER TO postgres;

--
-- Name: Orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Orders_id_seq" OWNED BY public."Orders".id;


--
-- Name: PasswordResetToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PasswordResetToken" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    used_at timestamp(3) without time zone,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PasswordResetToken" OWNER TO postgres;

--
-- Name: Payout; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payout" (
    "walletId" uuid NOT NULL,
    amount double precision NOT NULL,
    status text NOT NULL,
    bank_account jsonb NOT NULL,
    transaction_ref text,
    requested_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at timestamp(3) without time zone,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public."Payout" OWNER TO postgres;

--
-- Name: Post; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Post" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "authorId" uuid NOT NULL,
    caption text,
    content text,
    "contentType" text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    visibility public."VisibilityType" DEFAULT 'PUBLIC'::public."VisibilityType",
    "allowComments" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Post" OWNER TO postgres;

--
-- Name: PostLike; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PostLike" (
    "userId" uuid NOT NULL,
    "postId" uuid NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PostLike" OWNER TO postgres;

--
-- Name: ProductCategories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductCategories" (
    "productId" integer NOT NULL,
    "categoryId" integer NOT NULL
);


ALTER TABLE public."ProductCategories" OWNER TO postgres;

--
-- Name: ProductOffer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductOffer" (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    "minQuantity" integer NOT NULL,
    discount double precision NOT NULL,
    label text,
    "isActive" boolean DEFAULT true NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ProductOffer" OWNER TO postgres;

--
-- Name: ProductOffer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ProductOffer_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ProductOffer_id_seq" OWNER TO postgres;

--
-- Name: ProductOffer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ProductOffer_id_seq" OWNED BY public."ProductOffer".id;


--
-- Name: ProductPostTag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductPostTag" (
    "productId" integer NOT NULL,
    "postId" uuid NOT NULL
);


ALTER TABLE public."ProductPostTag" OWNER TO postgres;

--
-- Name: ProductRelation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductRelation" (
    "styledWithId" integer NOT NULL,
    "appearsInId" integer NOT NULL
);


ALTER TABLE public."ProductRelation" OWNER TO postgres;

--
-- Name: ProductTags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductTags" (
    "productId" integer NOT NULL,
    "tagId" integer NOT NULL
);


ALTER TABLE public."ProductTags" OWNER TO postgres;

--
-- Name: ProductVariant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductVariant" (
    id integer NOT NULL,
    size text NOT NULL,
    stock integer NOT NULL,
    price double precision,
    "productId" integer NOT NULL
);


ALTER TABLE public."ProductVariant" OWNER TO postgres;

--
-- Name: ProductVariant_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ProductVariant_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ProductVariant_id_seq" OWNER TO postgres;

--
-- Name: ProductVariant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ProductVariant_id_seq" OWNED BY public."ProductVariant".id;


--
-- Name: Products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Products" (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text,
    price double precision NOT NULL,
    discount double precision,
    status public."ProductStatus" DEFAULT 'DRAFT'::public."ProductStatus",
    "sellerId" uuid NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    "soldCount" integer DEFAULT 0 NOT NULL,
    "averageRating" double precision,
    "totalReviews" integer DEFAULT 0 NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "bannerImageUrl" text,
    "SKU" text,
    "isAccessory" boolean DEFAULT false NOT NULL,
    store_slug text NOT NULL,
    "isThrift" boolean DEFAULT false NOT NULL,
    "affiliateCommission" double precision,
    "socialCaptions" jsonb
);


ALTER TABLE public."Products" OWNER TO postgres;

--
-- Name: Products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Products_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Products_id_seq" OWNER TO postgres;

--
-- Name: Products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Products_id_seq" OWNED BY public."Products".id;


--
-- Name: Profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Profile" (
    id uuid NOT NULL,
    email text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    avatar text,
    username text,
    password_hash text NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    email_verified_at timestamp(6) with time zone,
    email_verified boolean DEFAULT false NOT NULL,
    bio text,
    location text,
    links jsonb,
    "affiliateCode" text
);


ALTER TABLE public."Profile" OWNER TO postgres;

--
-- Name: SavedPost; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SavedPost" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "userId" uuid NOT NULL,
    "postId" uuid NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SavedPost" OWNER TO postgres;

--
-- Name: SellerProfile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SellerProfile" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "profileId" uuid NOT NULL,
    store_name text,
    store_description text,
    store_logo text,
    store_banner text,
    store_location text,
    store_phone text,
    store_website text,
    store_socials jsonb,
    followers_count integer DEFAULT 0 NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    verification_status public."VerificationStatus" DEFAULT 'PENDING'::public."VerificationStatus" NOT NULL,
    verification_reason text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    store_slug text NOT NULL,
    auto_answer_enabled boolean DEFAULT false NOT NULL,
    default_currency text DEFAULT 'NGN'::text NOT NULL,
    "shipFromName" text,
    "shipFromAddress" text,
    "shipFromCity" text,
    "shipFromState" text,
    "shipFromZip" text,
    "shipFromCountry" text DEFAULT 'NG'::text NOT NULL,
    "shipFromPhone" text
);


ALTER TABLE public."SellerProfile" OWNER TO postgres;

--
-- Name: SellerWallet; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SellerWallet" (
    "sellerId" uuid NOT NULL,
    balance double precision DEFAULT 0 NOT NULL,
    pending_balance double precision DEFAULT 0 NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public."SellerWallet" OWNER TO postgres;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "userId" uuid NOT NULL,
    "refreshToken" text NOT NULL,
    ip text,
    "userAgent" text,
    device text,
    country text,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "lastUsedAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "revokedAt" timestamp(3) without time zone,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- Name: Share; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Share" (
    id integer NOT NULL,
    "userId" uuid NOT NULL,
    "productId" integer,
    "postId" uuid,
    platform text,
    "shareUrl" text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Share" OWNER TO postgres;

--
-- Name: Share_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Share_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Share_id_seq" OWNER TO postgres;

--
-- Name: Share_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Share_id_seq" OWNED BY public."Share".id;


--
-- Name: Story; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Story" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "authorId" uuid NOT NULL,
    "productId" integer,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "mediaId" uuid NOT NULL
);


ALTER TABLE public."Story" OWNER TO postgres;

--
-- Name: Tag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Tag" (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL
);


ALTER TABLE public."Tag" OWNER TO postgres;

--
-- Name: Tag_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Tag_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Tag_id_seq" OWNER TO postgres;

--
-- Name: Tag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Tag_id_seq" OWNED BY public."Tag".id;


--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Transaction" (
    "walletId" uuid NOT NULL,
    amount double precision NOT NULL,
    type text NOT NULL,
    "orderId" integer,
    description text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public."Transaction" OWNER TO postgres;

--
-- Name: UserSettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserSettings" (
    user_id uuid NOT NULL,
    email_notifications boolean DEFAULT true NOT NULL,
    push_notifications boolean DEFAULT true NOT NULL,
    private_profile boolean DEFAULT false NOT NULL,
    two_factor_enabled boolean DEFAULT false NOT NULL,
    language text DEFAULT 'en'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    currency text DEFAULT 'NGN'::text NOT NULL,
    theme text DEFAULT 'system'::text NOT NULL,
    text_size text DEFAULT 'medium'::text NOT NULL,
    auto_mute boolean DEFAULT true NOT NULL,
    compact_feed boolean DEFAULT false NOT NULL,
    show_captions boolean DEFAULT true NOT NULL,
    show_like_counts boolean DEFAULT true NOT NULL
);


ALTER TABLE public."UserSettings" OWNER TO postgres;

--
-- Name: VerificationDocument; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."VerificationDocument" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "sellerProfileId" uuid NOT NULL,
    type text NOT NULL,
    url text NOT NULL,
    status public."VerificationStatus" DEFAULT 'PENDING'::public."VerificationStatus" NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL
);


ALTER TABLE public."VerificationDocument" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Addresses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Addresses" ALTER COLUMN id SET DEFAULT nextval('public."Addresses_id_seq"'::regclass);


--
-- Name: Category id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category" ALTER COLUMN id SET DEFAULT nextval('public."Category_id_seq"'::regclass);


--
-- Name: Like id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Like" ALTER COLUMN id SET DEFAULT nextval('public."Like_id_seq"'::regclass);


--
-- Name: Notification id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification" ALTER COLUMN id SET DEFAULT nextval('public."Notification_id_seq"'::regclass);


--
-- Name: OrderItem id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem" ALTER COLUMN id SET DEFAULT nextval('public."OrderItem_id_seq"'::regclass);


--
-- Name: Orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders" ALTER COLUMN id SET DEFAULT nextval('public."Orders_id_seq"'::regclass);


--
-- Name: ProductOffer id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductOffer" ALTER COLUMN id SET DEFAULT nextval('public."ProductOffer_id_seq"'::regclass);


--
-- Name: ProductVariant id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariant" ALTER COLUMN id SET DEFAULT nextval('public."ProductVariant_id_seq"'::regclass);


--
-- Name: Products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products" ALTER COLUMN id SET DEFAULT nextval('public."Products_id_seq"'::regclass);


--
-- Name: Share id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Share" ALTER COLUMN id SET DEFAULT nextval('public."Share_id_seq"'::regclass);


--
-- Name: Tag id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tag" ALTER COLUMN id SET DEFAULT nextval('public."Tag_id_seq"'::regclass);


--
-- Data for Name: Addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Addresses" (id, "userId", name, address, zipcode, country, created_at, updated_at, county, phone, state, "isDefault", label) FROM stdin;
4	e1b39cba-718e-41b0-88bf-6a038e30a211	Joshua	721 Broadway, New York, NY 10003, USA	10003	US	2026-03-16 11:41:25.773+01	2026-03-16 11:41:25.773+01	New York			t	US
5	e1b39cba-718e-41b0-88bf-6a038e30a211	Joshua	number  kissayip newlayout jebbu bassa	930105	NG	2026-03-17 08:51:11.183+01	2026-03-17 08:51:11.183+01	Plateau	+234810725336		f	\N
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AuditLog" (id, event_type, user_id, email, ip_address, user_agent, success, reason, metadata, created_at) FROM stdin;
62abe813-20ce-466b-9e8b-d5055c5d2147	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-14 11:23:10.992+01
e1e451cd-188f-406d-b219-b2a3014acc6c	USER_LOGOUT	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged out	\N	2026-03-14 11:23:24.102+01
50c91e39-820b-4ad5-85d8-1d9477a67b84	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-14 11:25:46.82+01
a4b43c87-abc2-41d0-be13-1cd9691fda17	USER_LOGOUT	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged out	\N	2026-03-14 11:27:17.005+01
86bd6255-b2da-4a4d-abee-cb6ccecb094e	USER_REGISTERED	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User account created	\N	2026-03-14 11:28:02.381+01
c57cefdc-8fe6-43d0-82b4-a6c27cacc007	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-14 11:28:10.122+01
d9a57ac0-e702-49db-82ad-86e907ab8f21	POST_LIKED	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t		{"changes": null, "resource": "Post", "resourceId": "f3788904-5611-450a-952c-0e15dda7f36f"}	2026-03-14 11:28:23.94+01
904f6c3b-dcf2-41e2-bd9c-36a12e661879	USER_FOLLOWED	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Started following user @grandeur	{"changes": "{\\"targetUsername\\":\\"grandeur\\"}", "resource": "Follow", "resourceId": "ad8255a8-58bb-4dfb-8d7d-298219a01c91"}	2026-03-14 11:36:39.067+01
d1b528d3-f0d2-40b5-b27c-47adc6c1b632	CONVERSATION_STARTED	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User started a new chat	{"changes": "{\\"targetId\\":\\"ad8255a8-58bb-4dfb-8d7d-298219a01c91\\"}", "resource": "Conversation", "resourceId": "31c749c3-d3ac-4305-9c63-2267cf195928"}	2026-03-14 11:36:45.938+01
6e5f1e1b-5edb-469d-b4ed-2e70549f5915	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-14 11:44:14.419+01
1479ec84-0a24-4471-83ee-ea0abe99be03	SELLER_FOLLOWED	e1b39cba-718e-41b0-88bf-6a038e30a211		unknown	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Started following store @funmi-thrift-hub	{"changes": "{\\"storeSlug\\":\\"funmi-thrift-hub\\"}", "resource": "Follow", "resourceId": "7e7bdba6-2275-4c7c-9eb4-59a96563e6ba"}	2026-03-14 11:54:53.842+01
dbc7a5fa-e46f-4a24-bd60-7c918005b473	SELLER_FOLLOWED	e1b39cba-718e-41b0-88bf-6a038e30a211		unknown	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Started following store @ada-styles	{"changes": "{\\"storeSlug\\":\\"ada-styles\\"}", "resource": "Follow", "resourceId": "6ec37f21-056a-490c-8e4a-df3c45039e1c"}	2026-03-14 11:55:00.856+01
859ade99-06b1-4edc-b13d-8f60b4c9a6aa	USER_FOLLOWED	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Started following user @bayo_cold	{"changes": "{\\"targetUsername\\":\\"bayo_cold\\"}", "resource": "Follow", "resourceId": "5d330ec2-29f7-478f-8136-16d520bfd297"}	2026-03-14 11:55:20.024+01
0a0a390a-c30f-42f6-af42-36230b492e73	CONVERSATION_STARTED	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User started a new chat	{"changes": "{\\"targetId\\":\\"5d330ec2-29f7-478f-8136-16d520bfd297\\"}", "resource": "Conversation", "resourceId": "597b9774-8f5b-435a-b32b-1fe6286ba4c7"}	2026-03-14 11:55:45.989+01
2800eecc-71c1-44b0-afb3-9ffe0f233462	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-14 12:02:01.805+01
ff5b222f-cd66-4ce1-976a-62f64dbd8aae	SELLER_FOLLOWED	ad8255a8-58bb-4dfb-8d7d-298219a01c91		unknown	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Started following store @funmi-thrift-hub	{"changes": "{\\"storeSlug\\":\\"funmi-thrift-hub\\"}", "resource": "Follow", "resourceId": "7e7bdba6-2275-4c7c-9eb4-59a96563e6ba"}	2026-03-14 12:02:06.099+01
b355ce3d-6a2e-4c03-9ddf-c2e05d3d84d5	SELLER_FOLLOWED	ad8255a8-58bb-4dfb-8d7d-298219a01c91		unknown	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Started following store @swankyshoes	{"changes": "{\\"storeSlug\\":\\"swankyshoes\\"}", "resource": "Follow", "resourceId": "772d0b6e-5fdc-41a8-9317-1ffba3c70e08"}	2026-03-14 12:02:08.109+01
a9b5cf34-ae0a-46bd-b6f3-0f90708c865f	SELLER_FOLLOWED	ad8255a8-58bb-4dfb-8d7d-298219a01c91		unknown	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Started following store @ada-styles	{"changes": "{\\"storeSlug\\":\\"ada-styles\\"}", "resource": "Follow", "resourceId": "6ec37f21-056a-490c-8e4a-df3c45039e1c"}	2026-03-14 12:02:09.191+01
9803fbbd-ef49-4c88-94a1-7d5e66cb2ec0	POST_SAVED	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t		{"changes": null, "resource": "Post", "resourceId": "4aa05e46-030a-4c52-a751-103b8239d05d"}	2026-03-14 12:08:48.911+01
54040218-0afa-43ea-ac15-21adb3329db0	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-14 15:03:53.851+01
701b3500-8e07-4f88-8938-fd2a0f217400	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-14 15:27:44.533+01
1520c855-8714-4e5c-b0f9-ab068b9a1830	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-14 15:43:22.758+01
afe496ac-b2b2-4f66-ab69-c109c691e560	PRODUCT_CREATED	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Created new product	{"changes": "{\\"title\\":\\"Chic African Print Shift Dress\\",\\"status\\":\\"DRAFT\\"}", "resource": "Products", "resourceId": "20"}	2026-03-14 15:45:18.213+01
a759d5e5-48ca-4c2d-9296-6ee2d4b8bc61	PRODUCT_CREATED	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Created new product	{"changes": "{\\"title\\":\\"Vibrant Ankara Midi Dress with Contrast\\",\\"status\\":\\"PUBLISHED\\"}", "resource": "Products", "resourceId": "21"}	2026-03-14 15:50:11.29+01
81341a46-5889-440c-888e-ad1f0a7e2cdc	SELLER_FOLLOWED	ad8255a8-58bb-4dfb-8d7d-298219a01c91		unknown	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Started following store @grandeur-wears-and-abaya	{"changes": "{\\"storeSlug\\":\\"grandeur-wears-and-abaya\\"}", "resource": "Follow", "resourceId": "c4738142-6259-4c5f-96d2-7f770517be3f"}	2026-03-14 15:52:49.165+01
48c68c17-b01a-4c8f-9975-7ae18ff6f07f	CART_ITEM_ADDED	ad8255a8-58bb-4dfb-8d7d-298219a01c91		\N	\N	t	Added variant 57 x1	{"changes": null, "resource": "CartItem", "resourceId": "57"}	2026-03-14 15:55:33.578+01
6bd220f9-50ed-4f15-b6ff-43320000fcce	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-14 16:38:58.137+01
51dfee57-acb4-4450-b675-630aae993ee0	USER_LOGOUT	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged out	\N	2026-03-14 16:41:15.927+01
d7d64509-90d0-415d-8715-65e6ee808ecb	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-14 16:41:19.466+01
490f27ce-1154-4280-891a-a6f72ce11229	CART_ITEM_ADDED	e1b39cba-718e-41b0-88bf-6a038e30a211		\N	\N	t	Added variant 57 x1	{"changes": null, "resource": "CartItem", "resourceId": "57"}	2026-03-14 16:41:28.746+01
9172bdbd-91b9-453a-8e2d-b2a10c0a9b19	USER_LOGOUT	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged out	\N	2026-03-14 16:46:47.305+01
68cef3b1-1318-4078-a5be-3a78571e6e32	USER_LOGOUT	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged out	\N	2026-03-14 16:46:48.748+01
c7840d34-ef9b-447c-8fcc-4271c261edda	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-14 16:50:02.706+01
3d2d3569-d505-42bd-ba4a-13da16db9314	CART_ITEM_ADDED	e1b39cba-718e-41b0-88bf-6a038e30a211		\N	\N	t	Added variant 49 x1	{"changes": null, "resource": "CartItem", "resourceId": "49"}	2026-03-14 16:51:13.294+01
e08d48cc-18e6-4f18-8116-6126c387fec7	CART_ITEM_UPDATED	e1b39cba-718e-41b0-88bf-6a038e30a211		\N	\N	t	Updated variant 49 to qty 2	{"changes": null, "resource": "CartItem", "resourceId": "49"}	2026-03-14 16:51:18.422+01
55f71ba5-3371-4db7-b80c-6eac0c6b39ac	CART_ITEM_UPDATED	e1b39cba-718e-41b0-88bf-6a038e30a211		\N	\N	t	Updated variant 57 to qty 2	{"changes": null, "resource": "CartItem", "resourceId": "57"}	2026-03-14 16:51:20.31+01
e376dfcf-2b56-428e-9cca-15f42ea02408	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-14 17:10:39.437+01
a3ea1ec8-7bb6-4abf-bfee-8e64add4b297	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-14 17:30:13.268+01
1bc12b55-caaf-41dc-ade9-e2c1616b1b96	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-14 17:46:19.94+01
08026b98-c972-4b85-a188-30022b7987ee	ORDER_PLACED	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Placed new order	{"changes": "{\\"totalAmount\\":17670000,\\"itemCount\\":2}", "resource": "Orders", "resourceId": "1"}	2026-03-14 17:48:31.011+01
7ce59c67-c8a5-4b07-97ab-ab9e9d0787e6	USER_LOGOUT	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged out	\N	2026-03-14 17:49:19.712+01
094a0154-0f73-45fc-92c8-833257aa093a	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-14 17:49:24.06+01
fd5e988b-a6e6-4937-8cc9-4fefe373ede9	USER_LOGOUT	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged out	\N	2026-03-14 17:50:09.139+01
d32baeae-c281-477a-85c6-764891288929	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-14 17:50:16.388+01
68e9fbb9-d98c-4e90-ab8d-eb93ca768d3b	STORY_CREATED	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Created new story	{"changes": null, "resource": "Story", "resourceId": "f080dce7-ac6e-4ac1-b90f-74bdff79c584"}	2026-03-14 17:54:58.245+01
a70256b8-f656-4257-8838-436f0c8f86f0	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-15 13:40:05.268+01
eb11a42d-d7e7-4acd-b317-8d8e5f311586	POST_CREATED	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Created new post	{"changes": "{\\"contentType\\":\\"EXPERIENCE\\"}", "resource": "Post", "resourceId": "97b4f3f2-9dbd-4bcc-bb19-10fbb425321b"}	2026-03-15 13:46:06.537+01
18e8be42-1eec-46fa-a0d8-7f4b288ed2ae	POST_LIKED	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t		{"changes": null, "resource": "Post", "resourceId": "97b4f3f2-9dbd-4bcc-bb19-10fbb425321b"}	2026-03-15 13:46:26.205+01
41210c21-67ce-430c-9aaf-e185ac0db66c	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-15 14:04:04.995+01
9b4054f3-8137-4cb0-b7f9-5d7b67089290	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-15 14:35:14.196+01
06fe54bf-751f-4b13-bcd7-07b97e44131a	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-15 15:07:57.73+01
b8c45a5f-06c4-4cd7-be37-ec9dc8ea2670	MESSAGE_SENT	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User sent a chat message	{"changes": null, "resource": "Message", "resourceId": "1fe4e16e-3b36-4952-9903-b127d2093bde"}	2026-03-15 15:14:00.915+01
74d52932-feb5-4d58-af8e-e8031ee73f9e	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	t	User logged in	\N	2026-03-15 15:17:28.81+01
5971db17-20ab-403f-8420-68f5339371b4	MESSAGE_SENT	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	t	User sent a chat message	{"changes": null, "resource": "Message", "resourceId": "799623c5-da86-4ed7-8ca9-23678cf902f1"}	2026-03-15 15:18:54.832+01
927381c5-16c2-4c88-9a8a-a604753b3ee2	MESSAGE_SENT	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User sent a chat message	{"changes": null, "resource": "Message", "resourceId": "ba1aba42-346e-4851-bd2b-a0a9e54e744d"}	2026-03-15 15:22:54.112+01
cc4b290e-0044-4641-b1a9-38358991c77c	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-15 15:57:51.719+01
c54b43ba-15c7-4c44-a72e-3bc60bb13298	USER_LOGOUT	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged out	\N	2026-03-15 16:02:37.535+01
637c9bc4-384c-4c16-a676-bfd5069fae36	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-15 16:03:21.038+01
b1a2dd99-0d12-4f4c-abda-dbb579b3bc96	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	t	User logged in	\N	2026-03-15 16:03:23.33+01
984c9465-ad4a-4bdf-bbea-6c816ad17cf5	USER_LOGOUT	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged out	\N	2026-03-15 16:05:10.162+01
c2303592-3f02-4589-b24a-2d71ca8eec2d	USER_LOGOUT	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	t	User logged out	\N	2026-03-15 16:05:17.666+01
3847e736-33b6-4d74-bf73-1ebf4806b464	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	t	User logged in	\N	2026-03-15 16:05:29.68+01
0dcb99d7-494a-4139-b521-7788f58fe54f	USER_LOGOUT	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	t	User logged out	\N	2026-03-15 16:09:29.234+01
f4bd422f-ab2d-4cff-af18-ae0046eb758c	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	t	User logged in	\N	2026-03-15 16:09:53.944+01
ebedce17-df5d-4a8e-8a92-6fe3ad0d6515	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-15 16:11:05.172+01
4155339d-d094-4509-be72-258d8369904b	USER_LOGOUT	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged out	\N	2026-03-15 16:17:27.599+01
0ca9b724-06a3-4695-ad7e-23fa263ab9af	USER_LOGOUT	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	t	User logged out	\N	2026-03-15 16:17:32.948+01
29a6530e-2825-4245-ab6c-03e25a545dc7	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	t	User logged in	\N	2026-03-15 16:17:48.298+01
1dd16d08-3db6-4363-b995-6ae1cc77f045	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-15 16:17:52.744+01
4fc4e637-8e01-4f77-ba0f-db700d87cd52	MESSAGE_SENT	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User sent a chat message	{"changes": null, "resource": "Message", "resourceId": "281981ed-cdaa-474e-9d50-67f2460d775e"}	2026-03-15 16:27:49.784+01
734d884d-53d7-469e-935e-95ece4303a6b	MESSAGE_SENT	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	t	User sent a chat message	{"changes": null, "resource": "Message", "resourceId": "a48768e1-63d1-42d7-b986-6add71ee699b"}	2026-03-15 16:27:59.537+01
86caee0b-7f55-434b-b8b3-3ce749ea082b	MESSAGE_SENT	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User sent a chat message	{"changes": null, "resource": "Message", "resourceId": "dc4cd7bd-38dd-4597-bf3b-67eecdcedf21"}	2026-03-15 16:28:18.314+01
590c7242-9c37-402b-8950-4b8736e27ff3	MESSAGE_SENT	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User sent a chat message	{"changes": null, "resource": "Message", "resourceId": "84c1f449-9659-42d9-be8f-8605e4e461b6"}	2026-03-15 16:29:26.148+01
49face48-02fd-479c-9aa8-65c48649eef2	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-15 16:47:21.793+01
f2af56e5-87c4-4334-8fb7-7fc29933816a	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-15 17:28:31.923+01
a3e63e69-1419-4479-8673-231517c370d9	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-15 18:42:48.872+01
b3009cc7-dd35-4492-812b-c9a9a1cae6c4	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	t	User logged in	\N	2026-03-16 05:11:35.323+01
a4b86574-8a7a-469b-9173-68aa9672d25c	USER_LOGOUT	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	t	User logged out	\N	2026-03-16 05:13:51.44+01
c49d05b0-319c-4992-ae53-b2c36cb0ab8c	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-16 05:23:03.136+01
e4cb5a3d-3e4e-4277-bd5c-a14d105d19ca	USER_LOGOUT	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged out	\N	2026-03-16 05:23:43.96+01
1bd9ead1-3276-4115-8d93-4f206b8dd97f	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-16 05:23:52.508+01
203575e7-9d20-4b5d-a062-9696bb233a8f	USER_LOGOUT	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged out	\N	2026-03-16 05:27:54.745+01
ed94d54a-1156-45f2-9aa8-136ff9ea658e	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-16 05:28:04.708+01
e21846e4-07c9-4b60-a6ef-8edb16e0f623	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	t	User logged in	\N	2026-03-16 05:42:57.953+01
d748c5a7-5966-4610-8889-95a0fd278291	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	t	User logged in	\N	2026-03-16 05:45:59.151+01
101db559-8086-4447-bd98-76d1dbee8f7c	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	t	User logged in	\N	2026-03-16 05:46:27.642+01
3e977696-c689-42ad-a269-699ca7bcc5ad	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-16 06:03:35.968+01
7bc8dcea-67b7-43c5-bbcb-3350f24c0aaa	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	t	User logged in	\N	2026-03-16 06:05:43.288+01
f387fc0e-bb07-4f1d-936c-d5a3a6139d8a	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	t	User logged in	\N	2026-03-16 06:22:15.183+01
cadaf7ba-64ee-4468-ab4a-6b24d47d9e45	POST_LIKED	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	t		{"changes": null, "resource": "Post", "resourceId": "97b4f3f2-9dbd-4bcc-bb19-10fbb425321b"}	2026-03-16 06:27:52.246+01
44c70efc-6ff4-49c3-b05a-3af55cb7f563	USER_FOLLOWED	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	t	Started following user @justsvy	{"changes": "{\\"targetUsername\\":\\"justsvy\\"}", "resource": "Follow", "resourceId": "e1b39cba-718e-41b0-88bf-6a038e30a211"}	2026-03-16 06:27:56.608+01
224e3d37-baee-4663-a3fe-f44299c31cae	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-16 06:29:14.155+01
7b43ff03-cd82-41a7-af76-b0255b7bf4f2	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-16 07:51:40.366+01
f18bfe7a-c049-4146-aa16-ba959a94cf97	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-16 08:17:24.441+01
dab67f12-6078-45ca-b84c-ce7c36040dd2	CART_ITEM_ADDED	e1b39cba-718e-41b0-88bf-6a038e30a211		\N	\N	t	Added variant 58 x1	{"changes": null, "resource": "CartItem", "resourceId": "58"}	2026-03-16 08:17:49.917+01
08764b57-59ee-41bd-ac9c-eaedfc959cc9	CART_ITEM_ADDED	e1b39cba-718e-41b0-88bf-6a038e30a211		\N	\N	t	Added variant 9 x1	{"changes": null, "resource": "CartItem", "resourceId": "9"}	2026-03-16 08:20:49.623+01
40978d89-c0c7-4a0b-aef8-fdd379e1049f	CART_ITEM_REMOVED	e1b39cba-718e-41b0-88bf-6a038e30a211		\N	\N	t	Removed variant 58	{"changes": null, "resource": "CartItem", "resourceId": "58"}	2026-03-16 08:20:56.721+01
f2a216d1-9804-4a6c-b020-dbdfd1f97ac6	USER_LOGOUT	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged out	\N	2026-03-16 08:23:40.777+01
2571cacd-27e6-4e66-9b2d-faf01cd28a66	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-16 08:23:46.293+01
09864f4b-47bc-423e-b8dd-43c3864bbb3e	PRODUCT_CREATED	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Created new product	{"changes": "{\\"title\\":\\"Vibrant Tribal Print Kaftan Dress\\",\\"status\\":\\"PUBLISHED\\"}", "resource": "Products", "resourceId": "22"}	2026-03-16 08:30:05.281+01
27571d18-b54a-4d03-a6d3-919cadd54ac6	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-16 09:07:47.907+01
837c893f-ad16-45d6-9429-f3790b8fabb6	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-16 09:25:27.537+01
015b2fae-bffc-4cf7-a11b-a30d7d8dddc1	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-16 09:27:20.248+01
10e6e282-cf15-498a-9666-d9d033759a50	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	t	User logged in	\N	2026-03-16 09:46:58.215+01
d24a722e-bed9-42a1-b10b-d40e6b984821	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-16 09:48:09.187+01
27f0b218-a29e-4ecb-8b3f-2634463387dd	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-16 09:56:35.317+01
74ad7f43-8f6f-4b58-940f-f178f74ebb62	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-17 11:41:01.442+01
18bbd216-faf3-4f3e-857f-4470cfb6decc	TOKEN_REFRESHED	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Access token refreshed	\N	2026-03-17 11:41:01.804+01
f7021b49-10c6-4262-9165-e3c13e5bf5b7	PRODUCT_UPDATED	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Updated product	{"changes": "{\\"title\\":\\"Vibrant Tribal Print Kaftan Dress\\",\\"description\\":\\"Step into elegance with this vibrant tribal print kaftan dress, perfect for any casual or festive occasion. Made from premium-quality, breathable cotton, this dress offers both comfort and style. Its flowing silhouette, paired with a striking mix of blue and earthy tones, embraces traditional African aesthetics. The V-neckline and loose fit make it flattering for all body types. Ideal for cultural events, relaxed weekends, or a chic day out.\\",\\"price\\":15000,\\"discount\\":2,\\"status\\":\\"PUBLISHED\\",\\"isFeatured\\":false,\\"isAccessory\\":false,\\"isThrift\\":false,\\"variants\\":[{\\"size\\":\\"UK, US sizes 6, 32\\",\\"stock\\":10},{\\"size\\":\\"UK, US sizes 9, 34\\",\\"stock\\":15}],\\"offers\\":[{\\"minQuantity\\":3,\\"discount\\":10,\\"label\\":\\"Buy 3, get 10% off\\"}],\\"affiliateCommission\\":3000,\\"categoryIds\\":[1],\\"tagNames\\":[]}", "resource": "Products", "resourceId": "22"}	2026-03-16 09:58:22.577+01
b2521c73-b195-44a7-8bce-947fee3a5824	CART_ITEM_ADDED	ad8255a8-58bb-4dfb-8d7d-298219a01c91		\N	\N	t	Added variant 59 x1	{"changes": null, "resource": "CartItem", "resourceId": "59"}	2026-03-16 10:49:50.33+01
dd2be49b-7a44-44cb-81ec-425874a9aaf2	USER_LOGOUT	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged out	\N	2026-03-16 10:56:54.371+01
5d695ef1-739b-4888-a465-3d492369aea3	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-16 10:56:58.244+01
dcb53e6d-2b9e-4a96-af06-b0bba6fa15b6	CART_ITEM_ADDED	e1b39cba-718e-41b0-88bf-6a038e30a211		\N	\N	t	Added variant 58 x1	{"changes": null, "resource": "CartItem", "resourceId": "58"}	2026-03-16 11:16:35.988+01
b5f95aa5-4b78-4011-8cf2-c20484d30f0d	ORDER_PLACED	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Placed new order	{"changes": "{\\"totalAmount\\":8935000,\\"itemCount\\":2}", "resource": "Orders", "resourceId": "2"}	2026-03-16 14:08:47.429+01
7dc2b7d2-ca78-4775-a57b-935170893258	CART_ITEM_ADDED	e1b39cba-718e-41b0-88bf-6a038e30a211		\N	\N	t	Added variant 59 x3	{"changes": null, "resource": "CartItem", "resourceId": "59"}	2026-03-16 14:16:23.934+01
3d0bbc0b-02e8-495a-a628-0128be2ceba1	ORDER_PLACED	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Placed new order	{"changes": "{\\"totalAmount\\":4410000,\\"itemCount\\":1}", "resource": "Orders", "resourceId": "3"}	2026-03-16 15:08:38.844+01
fee239ff-2570-4706-bd9c-1a4a43c49e18	USER_LOGOUT	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged out	\N	2026-03-16 15:09:12.23+01
9a69271a-8f6a-4234-9d11-cbf9075717bf	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-16 15:09:17.599+01
6ab1e89d-3b57-46cf-99f3-fe384c904014	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-16 17:10:20.984+01
6c78333e-8f44-4393-a365-f5dcde067013	USER_LOGOUT	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged out	\N	2026-03-16 20:31:03.14+01
7843a2a2-151b-42fa-9f54-3de95e89ecb3	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-16 20:31:06.72+01
f5862713-d185-4e8c-8387-b58733412334	USER_LOGOUT	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged out	\N	2026-03-16 20:32:05.973+01
75bdaf3a-8611-4d81-b40c-cf65efdc1324	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-16 20:32:11.265+01
67950b51-76ae-4ce7-9694-7f4584ecbe89	AFFILIATE_ENROLL_REQUESTED	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User requested affiliate enrollment	{"changes": null, "resource": "AffiliateProfile", "resourceId": "ad8255a8-58bb-4dfb-8d7d-298219a01c91"}	2026-03-16 20:55:46.49+01
f3b28729-4fde-4ea5-92d4-59069d0d0054	USER_LOGOUT	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged out	\N	2026-03-16 21:09:30.752+01
64b0f358-c83f-4247-93d2-56dcfeec819d	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-16 21:09:36.239+01
6d7b6a23-c888-4fe5-94f0-10b31ed968dd	CART_ITEM_ADDED	e1b39cba-718e-41b0-88bf-6a038e30a211		\N	\N	t	Added variant 60 x1	{"changes": null, "resource": "CartItem", "resourceId": "60"}	2026-03-16 21:09:56.372+01
e94f66ff-24f8-4937-8f11-c0e4adf79fc2	ORDER_PLACED	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Placed new order	{"changes": "{\\"totalAmount\\":1470000,\\"itemCount\\":1}", "resource": "Orders", "resourceId": "4"}	2026-03-16 21:10:16.518+01
665e0337-2cda-44ca-819b-3f55fd63c159	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	t	User logged in	\N	2026-03-16 21:11:16.347+01
81c35310-2860-45f4-8852-a4eee5322796	USER_LOGOUT	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	t	User logged out	\N	2026-03-17 02:15:23.786+01
e6c0e3bd-f137-459d-a04b-203a48f2a17c	USER_LOGOUT	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged out	\N	2026-03-17 02:15:35.617+01
41ddab93-1d76-4235-8db3-28458dd90b18	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-17 02:15:52.064+01
02cdfd29-a1f5-4686-bb15-e511f8ef6c13	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	t	User logged in	\N	2026-03-17 02:16:03.958+01
f5a79b8a-1275-444d-90b7-83c7abbdbc5e	AFFILIATE_ENROLL_REQUESTED	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	t	User requested affiliate enrollment	{"changes": null, "resource": "AffiliateProfile", "resourceId": "ad8255a8-58bb-4dfb-8d7d-298219a01c91"}	2026-03-17 02:48:34.788+01
f5faba76-20c1-43ef-9b86-23312ed35002	CART_ITEM_ADDED	e1b39cba-718e-41b0-88bf-6a038e30a211		\N	\N	t	Added variant 60 x1	{"changes": null, "resource": "CartItem", "resourceId": "60"}	2026-03-17 08:47:08.244+01
2c876c88-e9e9-4bdb-8c67-2d937647f341	ORDER_PLACED	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Placed new order	{"changes": "{\\"totalAmount\\":1470000,\\"itemCount\\":1}", "resource": "Orders", "resourceId": "5"}	2026-03-17 08:51:23.178+01
2c149008-54ab-4bf6-948f-e3cad7b190bb	CART_ITEM_ADDED	e1b39cba-718e-41b0-88bf-6a038e30a211		\N	\N	t	Added variant 57 x2	{"changes": null, "resource": "CartItem", "resourceId": "57"}	2026-03-17 08:59:00.594+01
80f0ff1c-ee8d-44ec-8f2f-c438648a88b2	CART_ITEM_UPDATED	e1b39cba-718e-41b0-88bf-6a038e30a211		\N	\N	t	Updated variant 57 to qty 1	{"changes": null, "resource": "CartItem", "resourceId": "57"}	2026-03-17 08:59:05.1+01
afcc2dfb-ca6e-46f9-ac0d-f55b3172a5c1	CART_ITEM_UPDATED	e1b39cba-718e-41b0-88bf-6a038e30a211		\N	\N	t	Updated variant 57 to qty 2	{"changes": null, "resource": "CartItem", "resourceId": "57"}	2026-03-17 08:59:06.23+01
dd1abb60-e3f5-4487-acf2-5fed00ba4151	ORDER_PLACED	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Placed new order	{"changes": "{\\"totalAmount\\":16170000,\\"itemCount\\":1}", "resource": "Orders", "resourceId": "6"}	2026-03-17 08:59:16.175+01
cced33e3-7415-4b76-aa19-37ab663cdcbf	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-17 11:41:07.764+01
5c54a080-79bc-4cb6-9e37-7c52d5d337b5	TOKEN_REFRESHED	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Access token refreshed	\N	2026-03-17 11:41:08.073+01
4c1a58fe-149e-4803-88a7-6419a48ca65c	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-17 11:41:23.627+01
14163d80-fb40-4d57-8227-d92f9cfa6e70	TOKEN_REFRESHED	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Access token refreshed	\N	2026-03-17 11:41:24.027+01
32d864b1-de79-432c-b34f-1edc286d1455	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-17 11:41:32.912+01
b81607ff-ecbb-4ccf-b2d5-96efe865a22a	TOKEN_REFRESHED	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Access token refreshed	\N	2026-03-17 11:41:33.266+01
39e0f5c8-600d-415c-989f-5adf2cc1dfd9	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-17 11:57:56.378+01
155f6bc1-a1e6-44df-9cf8-67a71fde8fb0	CART_ITEM_ADDED	e1b39cba-718e-41b0-88bf-6a038e30a211		\N	\N	t	Added variant 58 x1	{"changes": null, "resource": "CartItem", "resourceId": "58"}	2026-03-17 11:58:18.358+01
1d2c2013-c3eb-49ae-b5fe-063df1e242b2	CART_ITEM_ADDED	e1b39cba-718e-41b0-88bf-6a038e30a211		\N	\N	t	Added variant 58 x1	{"changes": null, "resource": "CartItem", "resourceId": "58"}	2026-03-17 11:58:19.344+01
55ff78d3-1670-4a3f-a249-1e5352defd96	CART_ITEM_UPDATED	e1b39cba-718e-41b0-88bf-6a038e30a211		\N	\N	t	Updated variant 58 to qty 1	{"changes": null, "resource": "CartItem", "resourceId": "58"}	2026-03-17 11:58:24.162+01
3d50d46f-4680-41ba-b657-f3be132c9b8c	USER_LOGOUT	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged out	\N	2026-03-17 12:34:23.433+01
f14e4545-3c0e-4447-9c09-a90a9373d089	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-17 12:34:35.811+01
c3df3725-c007-4a3d-869e-5bc025bfb1b2	ORDER_PLACED	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	Placed new order	{"changes": "{\\"totalAmount\\":8085000,\\"itemCount\\":1}", "resource": "Orders", "resourceId": "7"}	2026-03-17 14:14:00.971+01
09883d2a-a2a4-4f46-bf28-5ae98b8da748	POST_SAVED	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t		{"changes": null, "resource": "Post", "resourceId": "97b4f3f2-9dbd-4bcc-bb19-10fbb425321b"}	2026-03-18 09:26:13.512+01
f42f1eae-4bdc-49eb-8e9b-917fe10705ad	AFFILIATE_ENROLL_REQUESTED	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User requested affiliate enrollment	{"changes": null, "resource": "AffiliateProfile", "resourceId": "e1b39cba-718e-41b0-88bf-6a038e30a211"}	2026-03-18 09:38:14.593+01
86c1231c-7975-4ac1-8817-440cd5fac0d7	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	t	User logged in	\N	2026-03-18 10:01:09.029+01
4805dcea-697e-4d93-b5e9-aaa883b1b26f	USER_LOGOUT	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	t	User logged out	\N	2026-03-18 10:18:29.132+01
a4a19f34-da9e-4bde-9e46-1248fe44e954	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	t	User logged in	\N	2026-03-18 10:18:52.24+01
f37157dc-f5d6-4991-b0b7-1ffebffdaf7c	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-18 14:55:03.222+01
b0913a0a-98e7-4505-bc86-a96a56133bd1	USER_LOGOUT	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	t	User logged out	\N	2026-03-18 15:00:07.044+01
a57b5523-72ac-48c0-bc06-db12e5d457fc	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	t	User logged in	\N	2026-03-18 15:00:18.857+01
fcd42e74-044d-49ce-a49d-0d5f88e4afb7	USER_LOGOUT	ad8255a8-58bb-4dfb-8d7d-298219a01c91		::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	t	User logged out	\N	2026-03-18 16:20:28.184+01
1cc3f027-dd48-40f4-a5c0-cea60ac0fb50	USER_LOGIN	ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	t	User logged in	\N	2026-03-18 16:20:46.446+01
5260a823-6466-4ada-9807-83a4470d5fb5	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-18 18:37:29.269+01
824fbe06-eb51-4510-b85a-e03fd6a2f551	USER_LOGOUT	e1b39cba-718e-41b0-88bf-6a038e30a211		::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged out	\N	2026-03-18 19:02:33.772+01
174cd802-a20d-43a8-9843-490bef542d55	USER_LOGIN	e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	t	User logged in	\N	2026-03-18 19:03:05.704+01
\.


--
-- Data for Name: BankAccount; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BankAccount" (id, "sellerId", "bankName", "bankCode", "accountNumber", "accountName", "isDefault", created_at) FROM stdin;
4e0f5172-98f5-4d52-891d-b2938495c711	c4738142-6259-4c5f-96d2-7f770517be3f	First City Monument Bank (FCMB)	214	2413814015	Joshua Akibu	t	2026-03-17 09:44:34.251+01
\.


--
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CartItem" (id, quantity, created_at, "userId", "variantId") FROM stdin;
7722220f-8901-4674-b09b-f19cacfd14b4	4	2026-03-14 09:53:55.856	ad8255a8-58bb-4dfb-8d7d-298219a01c91	37
4b217f6d-587f-429d-b9b5-cb19b49b1a7a	1	2026-03-14 09:54:25.735	ad8255a8-58bb-4dfb-8d7d-298219a01c91	34
3460cf52-a2df-40f6-bf7a-987881e33017	1	2026-03-14 10:07:09.691	ad8255a8-58bb-4dfb-8d7d-298219a01c91	50
9fc674e7-fd4b-4cf8-aca9-215f1a4c528c	1	2026-03-14 15:55:33.562	ad8255a8-58bb-4dfb-8d7d-298219a01c91	57
a7fd3ca0-39b8-49bc-add5-b1e91acd66c0	1	2026-03-16 10:49:50.303	ad8255a8-58bb-4dfb-8d7d-298219a01c91	59
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, name, "thumbnailCatUrl", created_at, updated_at, slug) FROM stdin;
1	Women's Fashion	https://images.unsplash.com/photo-1583267702009-a325834bfa47?auto=format&fit=crop&w=800&q=80	2026-03-12 14:30:38.504+01	2026-03-12 14:30:38.504+01	womens-fashion
2	Men's Fashion	https://images.unsplash.com/photo-1516257984-08fe4fad0f76?auto=format&fit=crop&w=800&q=80	2026-03-12 14:30:38.754+01	2026-03-12 14:30:38.754+01	mens-fashion
3	Footwear	https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80	2026-03-12 14:30:38.76+01	2026-03-12 14:30:38.76+01	footwear
4	Bags & Luggage	https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80	2026-03-12 14:30:38.772+01	2026-03-12 14:30:38.772+01	bags-luggage
5	Accessories	https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80	2026-03-12 14:30:38.777+01	2026-03-12 14:30:38.777+01	accessories
6	Beauty & Care	https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80	2026-03-12 14:30:38.783+01	2026-03-12 14:30:38.783+01	beauty-care
7	Jewelry & Watches	https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=800&q=80	2026-03-12 14:30:38.788+01	2026-03-12 14:30:38.788+01	jewelry-watches
8	Kids & Baby	https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80	2026-03-12 14:30:38.793+01	2026-03-12 14:30:38.793+01	kids-baby
9	Sports & Active	https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80	2026-03-12 14:30:38.797+01	2026-03-12 14:30:38.797+01	sports-active
10	Nigerian Heritage	https://images.unsplash.com/photo-1594938298603-3e70e6ccc4c3?auto=format&fit=crop&w=800&q=80	2026-03-12 14:30:38.8+01	2026-03-12 14:30:38.8+01	nigerian-heritage
11	Thrift & Pre-loved	https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80	2026-03-12 14:30:38.803+01	2026-03-12 14:30:38.803+01	thrift-pre-loved
12	Home & Living	https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80	2026-03-12 14:30:38.805+01	2026-03-12 14:30:38.805+01	home-living
\.


--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Comment" (id, text, "authorId", "productId", "parentId", created_at, "postId") FROM stdin;
9c93b81f-ee46-48f2-944f-4c149f3f6a15	This is HEAT 🔥 Does it ship to Abuja?	84cbe55d-f6dd-4d16-9bb6-6ffe1ddc6d3f	1	\N	2026-03-12 14:30:40.341+01	\N
c6da70ab-1533-4d94-86f2-386a69c9c6ac	Cold guy approved ✅ Already ordered mine!	5d330ec2-29f7-478f-8136-16d520bfd297	2	\N	2026-03-12 14:30:40.345+01	\N
e6ff37c8-2889-4960-b7fb-15006d73f4d4	Quality looks amazing, seen it in real life and it slaps 🫶	4e785386-7129-4386-828f-25addc8cc24d	3	\N	2026-03-12 14:30:40.347+01	\N
ffb954a0-3414-40d6-b19f-e39cce132edc	Naija made, globally worn! 🇳🇬 What sizes are left?	bb084c97-1310-4298-bb1c-48c20a697969	4	\N	2026-03-12 14:30:40.35+01	\N
1d813bd1-de07-4536-a9f2-7b73fefa18cf	Naija made, globally worn! 🇳🇬 What sizes are left?	bb084c97-1310-4298-bb1c-48c20a697969	5	\N	2026-03-12 14:30:40.352+01	\N
e32a30df-01a6-41c6-966d-a64d63f4a223	nice	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	\N	2026-03-14 09:57:51.658+01	f3788904-5611-450a-952c-0e15dda7f36f
\.


--
-- Data for Name: CommentLike; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CommentLike" ("userId", "commentId", created_at) FROM stdin;
\.


--
-- Data for Name: Conversation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Conversation" (id, created_at, updated_at, "participant1Id", "participant2Id", "sellerId", "currentProductId", "lastMessageAt") FROM stdin;
605455b5-6143-448e-943a-c10ca8c768ed	2026-03-12 16:30:42.876+01	2026-03-12 16:30:42.876+01	ad8255a8-58bb-4dfb-8d7d-298219a01c91	5f5139e9-e690-4278-87f8-a628ec5a519f	\N	\N	\N
597b9774-8f5b-435a-b32b-1fe6286ba4c7	2026-03-14 11:55:45.986+01	2026-03-14 11:55:45.986+01	e1b39cba-718e-41b0-88bf-6a038e30a211	5d330ec2-29f7-478f-8136-16d520bfd297	\N	\N	\N
31c749c3-d3ac-4305-9c63-2267cf195928	2026-03-14 11:36:45.93+01	2026-03-15 16:29:26.141+01	e1b39cba-718e-41b0-88bf-6a038e30a211	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	\N	2026-03-15 16:29:26.141+01
\.


--
-- Data for Name: EmailVerificationToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EmailVerificationToken" (id, user_id, token, expires_at, used_at, created_at) FROM stdin;
abbc69ac-aeb8-4d60-b6f8-5c464be5f95c	ad8255a8-58bb-4dfb-8d7d-298219a01c91	15b809dca4480b178b2b8b0652b152012182b5aca8bc2d230fd4b77023f84582	2026-03-13 14:37:32.208	\N	2026-03-12 14:37:32.215+01
ba9696bc-150f-4f5e-b76d-4b1d01935fed	e1b39cba-718e-41b0-88bf-6a038e30a211	9579c5888df11f443dd0e61caa13a92de14669108258f43fe16a075e15bc075a	2026-03-15 11:28:01.607	\N	2026-03-14 11:28:01.608+01
\.


--
-- Data for Name: FailedLoginAttempt; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FailedLoginAttempt" (id, email, user_id, ip_address, user_agent, attempt_count, locked_until, last_attempt_at) FROM stdin;
\.


--
-- Data for Name: Follow; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Follow" (id, "followerId", "followingId", "followingType", created_at) FROM stdin;
c8846212-5074-41d0-b423-b572b1d2f220	84cbe55d-f6dd-4d16-9bb6-6ffe1ddc6d3f	c476486e-5234-401b-9461-23c03c8b2c3b	USER	2026-03-12 14:30:40.14
11673416-a2c5-4d0a-becd-7f1e9a4ddee1	84cbe55d-f6dd-4d16-9bb6-6ffe1ddc6d3f	9f666f6a-52a0-4f77-b40c-d849cffffa5d	USER	2026-03-12 14:30:40.146
aa857592-b1fc-4102-8b52-04eecc0c0bd9	84cbe55d-f6dd-4d16-9bb6-6ffe1ddc6d3f	37232cc8-f85e-48d0-b4b3-3cac43305fdc	USER	2026-03-12 14:30:40.151
c70b5641-7f6b-41ba-93e3-86918024dcf2	2b76f00d-ef5a-4cc2-912c-616517d84d90	c476486e-5234-401b-9461-23c03c8b2c3b	USER	2026-03-12 14:30:40.155
e8aeea4c-5384-4473-b40d-bbeef5377207	2b76f00d-ef5a-4cc2-912c-616517d84d90	37232cc8-f85e-48d0-b4b3-3cac43305fdc	USER	2026-03-12 14:30:40.159
ec77dff9-4fcf-4824-80d2-58d85591ac42	2b76f00d-ef5a-4cc2-912c-616517d84d90	5f5139e9-e690-4278-87f8-a628ec5a519f	USER	2026-03-12 14:30:40.171
dea9d30b-2609-493e-b83f-c20cfd8f89fb	bb084c97-1310-4298-bb1c-48c20a697969	9f666f6a-52a0-4f77-b40c-d849cffffa5d	USER	2026-03-12 14:30:40.18
c0375e9a-890d-4de6-982c-f35a9b620e71	bb084c97-1310-4298-bb1c-48c20a697969	c476486e-5234-401b-9461-23c03c8b2c3b	USER	2026-03-12 14:30:40.186
63aa9bd1-1541-4288-94ea-bc1fff00ec3e	4e785386-7129-4386-828f-25addc8cc24d	5f5139e9-e690-4278-87f8-a628ec5a519f	USER	2026-03-12 14:30:40.19
050004c2-3350-4709-a8a0-aeeeba167777	4e785386-7129-4386-828f-25addc8cc24d	37232cc8-f85e-48d0-b4b3-3cac43305fdc	USER	2026-03-12 14:30:40.196
9db0a4d2-5c16-4fc4-809f-7648bd14925e	4e785386-7129-4386-828f-25addc8cc24d	c476486e-5234-401b-9461-23c03c8b2c3b	USER	2026-03-12 14:30:40.201
ecd90caa-8ee9-48b4-bc12-77bc1c7c0721	5d330ec2-29f7-478f-8136-16d520bfd297	9f666f6a-52a0-4f77-b40c-d849cffffa5d	USER	2026-03-12 14:30:40.205
aec96c25-544b-426f-a469-209581b8d822	5d330ec2-29f7-478f-8136-16d520bfd297	84cbe55d-f6dd-4d16-9bb6-6ffe1ddc6d3f	USER	2026-03-12 14:30:40.209
ce0c726d-676c-4696-a606-acee5e346a22	ad8255a8-58bb-4dfb-8d7d-298219a01c91	5d330ec2-29f7-478f-8136-16d520bfd297	USER	2026-03-12 16:30:09.569
7808fef0-afa6-4020-ab61-7777d1ddd57f	ad8255a8-58bb-4dfb-8d7d-298219a01c91	4e785386-7129-4386-828f-25addc8cc24d	USER	2026-03-12 16:30:15.479
aa9304b4-74db-4488-94ba-f6224c186323	ad8255a8-58bb-4dfb-8d7d-298219a01c91	5f5139e9-e690-4278-87f8-a628ec5a519f	USER	2026-03-12 16:30:27.484
1686fcec-1f4a-42ed-b9bf-427900f0c388	e1b39cba-718e-41b0-88bf-6a038e30a211	ad8255a8-58bb-4dfb-8d7d-298219a01c91	USER	2026-03-14 11:36:39.061
ffc39729-127d-477b-9561-b6a5f4f41396	e1b39cba-718e-41b0-88bf-6a038e30a211	7e7bdba6-2275-4c7c-9eb4-59a96563e6ba	SELLER	2026-03-14 11:54:53.838
25b07bc5-19af-4ad9-9f84-6ac0da461c12	e1b39cba-718e-41b0-88bf-6a038e30a211	6ec37f21-056a-490c-8e4a-df3c45039e1c	SELLER	2026-03-14 11:55:00.854
bb78e054-fa18-4ca9-942c-67442f8f88be	e1b39cba-718e-41b0-88bf-6a038e30a211	5d330ec2-29f7-478f-8136-16d520bfd297	USER	2026-03-14 11:55:20.021
f0350b5e-2b65-4537-b38d-126190332acd	ad8255a8-58bb-4dfb-8d7d-298219a01c91	7e7bdba6-2275-4c7c-9eb4-59a96563e6ba	SELLER	2026-03-14 12:02:06.094
cffba02a-57a2-4322-a2e3-3adb079207f9	ad8255a8-58bb-4dfb-8d7d-298219a01c91	772d0b6e-5fdc-41a8-9317-1ffba3c70e08	SELLER	2026-03-14 12:02:08.107
6d5d259a-f08f-42f4-bcf3-5b6bee646c96	ad8255a8-58bb-4dfb-8d7d-298219a01c91	6ec37f21-056a-490c-8e4a-df3c45039e1c	SELLER	2026-03-14 12:02:09.189
ee363280-e008-4131-ae9b-0433e25511b2	ad8255a8-58bb-4dfb-8d7d-298219a01c91	c4738142-6259-4c5f-96d2-7f770517be3f	SELLER	2026-03-14 15:52:49.159
b7ffd31f-b039-477a-be38-0404bee7a550	ad8255a8-58bb-4dfb-8d7d-298219a01c91	e1b39cba-718e-41b0-88bf-6a038e30a211	USER	2026-03-16 06:27:56.602
\.


--
-- Data for Name: GlobalShippingZone; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."GlobalShippingZone" (id, name, countries, "baseRate", "perKgRate", "estimatedDays", "isActive", "sortOrder", created_at, updated_at) FROM stdin;
5b085b98-4e7c-494e-a147-c932b783551b	West Africa	{NG,GH,SN,CI,CM,BJ,TG,ML,BF,NE,GN,SL,LR,GM,GW,CV,MR}	150000	50000	2-4 business days	t	1	2026-03-17 12:30:50.333+01	2026-03-17 12:30:50.333+01
f06a2435-961e-4b51-9a6c-ef4206448fbb	East & Central Africa	{KE,TZ,UG,RW,ET,ZM,ZW,MW,MZ,AO,CD,CG,GA,CF,TD,BI,DJ,ER,SO,SD,SS}	300000	80000	4-7 business days	t	2	2026-03-17 12:30:50.422+01	2026-03-17 12:30:50.422+01
8eda937d-965e-4b00-87bd-050f702165a2	Southern Africa	{ZA,NA,BW,LS,SZ,MG,MU,SC,RE,YT}	350000	80000	4-7 business days	t	3	2026-03-17 12:30:50.426+01	2026-03-17 12:30:50.426+01
b61cf511-4a39-477a-8083-583fb055b5da	North Africa & Middle East	{EG,MA,DZ,TN,LY,AE,SA,QA,KW,BH,OM,JO,LB,IL,IQ,IR,SY,YE}	450000	100000	5-8 business days	t	4	2026-03-17 12:30:50.43+01	2026-03-17 12:30:50.43+01
27fe4a0a-1028-4bcd-befe-6200466e5505	Europe & UK	{GB,FR,DE,IT,ES,NL,BE,PT,IE,SE,NO,DK,FI,PL,CZ,AT,CH,GR,RO,HU,SK,HR,BG,RS,SI,EE,LV,LT,CY,MT,LU,IS,AL,MK,ME,BA,MD,UA,BY,GE,AM,AZ,TR}	550000	120000	6-10 business days	t	5	2026-03-17 12:30:50.433+01	2026-03-17 12:30:50.433+01
febafafb-2d19-4e6a-b7db-947c0a4b4fdb	North America	{US,CA,MX}	600000	130000	7-12 business days	t	6	2026-03-17 12:30:50.436+01	2026-03-17 12:30:50.436+01
e2e5255a-d3b1-4e4a-ab67-1c18340917cd	Asia Pacific	{CN,JP,KR,IN,AU,NZ,SG,MY,TH,ID,PH,VN,PK,BD,LK,NP,MM,KH,LA,BN,MN,TW,HK,MO}	650000	140000	8-14 business days	t	7	2026-03-17 12:30:50.439+01	2026-03-17 12:30:50.439+01
ca1dc248-42d3-4798-bfda-aae2587e6a1d	Rest of World	{}	700000	150000	10-18 business days	t	99	2026-03-17 12:30:50.442+01	2026-03-17 12:30:50.442+01
\.


--
-- Data for Name: Like; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Like" (id, "userId", "productId", created_at) FROM stdin;
1	84cbe55d-f6dd-4d16-9bb6-6ffe1ddc6d3f	1	2026-03-12 14:30:40.22
2	2b76f00d-ef5a-4cc2-912c-616517d84d90	1	2026-03-12 14:30:40.228
3	bb084c97-1310-4298-bb1c-48c20a697969	1	2026-03-12 14:30:40.233
4	84cbe55d-f6dd-4d16-9bb6-6ffe1ddc6d3f	2	2026-03-12 14:30:40.238
5	2b76f00d-ef5a-4cc2-912c-616517d84d90	2	2026-03-12 14:30:40.242
6	bb084c97-1310-4298-bb1c-48c20a697969	2	2026-03-12 14:30:40.246
7	84cbe55d-f6dd-4d16-9bb6-6ffe1ddc6d3f	3	2026-03-12 14:30:40.254
8	2b76f00d-ef5a-4cc2-912c-616517d84d90	3	2026-03-12 14:30:40.266
9	bb084c97-1310-4298-bb1c-48c20a697969	3	2026-03-12 14:30:40.274
10	84cbe55d-f6dd-4d16-9bb6-6ffe1ddc6d3f	4	2026-03-12 14:30:40.281
11	2b76f00d-ef5a-4cc2-912c-616517d84d90	4	2026-03-12 14:30:40.287
12	bb084c97-1310-4298-bb1c-48c20a697969	4	2026-03-12 14:30:40.292
13	84cbe55d-f6dd-4d16-9bb6-6ffe1ddc6d3f	5	2026-03-12 14:30:40.296
14	2b76f00d-ef5a-4cc2-912c-616517d84d90	5	2026-03-12 14:30:40.301
15	bb084c97-1310-4298-bb1c-48c20a697969	5	2026-03-12 14:30:40.304
16	84cbe55d-f6dd-4d16-9bb6-6ffe1ddc6d3f	6	2026-03-12 14:30:40.307
17	2b76f00d-ef5a-4cc2-912c-616517d84d90	6	2026-03-12 14:30:40.31
18	bb084c97-1310-4298-bb1c-48c20a697969	6	2026-03-12 14:30:40.313
19	84cbe55d-f6dd-4d16-9bb6-6ffe1ddc6d3f	7	2026-03-12 14:30:40.317
20	2b76f00d-ef5a-4cc2-912c-616517d84d90	7	2026-03-12 14:30:40.32
21	bb084c97-1310-4298-bb1c-48c20a697969	7	2026-03-12 14:30:40.325
22	84cbe55d-f6dd-4d16-9bb6-6ffe1ddc6d3f	8	2026-03-12 14:30:40.329
23	2b76f00d-ef5a-4cc2-912c-616517d84d90	8	2026-03-12 14:30:40.333
24	bb084c97-1310-4298-bb1c-48c20a697969	8	2026-03-12 14:30:40.336
25	e1b39cba-718e-41b0-88bf-6a038e30a211	19	2026-03-14 11:28:29.083
26	e1b39cba-718e-41b0-88bf-6a038e30a211	21	2026-03-14 17:50:44.4
\.


--
-- Data for Name: Media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Media" (url, type, "productId", created_at, "sellerId", "altText", metadata, public_id, id, "authorId", "postId", "isBgMusic") FROM stdin;
https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80	IMAGE	1	2026-03-12 14:30:39.272+01	\N	\N	\N	seed/adire-tie-dye-maxi-dress-img0	bbd23434-ddc8-4e9d-b50f-47302c2854dc	c476486e-5234-401b-9461-23c03c8b2c3b	\N	f
https://images.unsplash.com/photo-1583744946564-b46b88d4b8d0?auto=format&fit=crop&w=800&q=80	IMAGE	1	2026-03-12 14:30:39.272+01	\N	\N	\N	seed/adire-tie-dye-maxi-dress-img1	24fb89a4-a8e3-4d71-a03d-02ff8aad0f04	c476486e-5234-401b-9461-23c03c8b2c3b	\N	f
https://images.unsplash.com/photo-1590794056226-f6a7c1b70d79?auto=format&fit=crop&w=800&q=80	IMAGE	1	2026-03-12 14:30:39.272+01	\N	\N	\N	seed/adire-tie-dye-maxi-dress-img2	abad698c-4ac2-4476-93c7-500cdb9c8bf1	c476486e-5234-401b-9461-23c03c8b2c3b	\N	f
https://images.unsplash.com/photo-1583267702009-a325834bfa47?auto=format&fit=crop&w=800&q=80	IMAGE	2	2026-03-12 14:30:39.326+01	\N	\N	\N	seed/floral-chiffon-midi-dress-img0	da7f69b9-cdb3-4b0e-9bed-c875b2e1999c	c476486e-5234-401b-9461-23c03c8b2c3b	\N	f
https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80	IMAGE	2	2026-03-12 14:30:39.326+01	\N	\N	\N	seed/floral-chiffon-midi-dress-img1	771fe910-c1a9-49a9-87f7-68ff39015291	c476486e-5234-401b-9461-23c03c8b2c3b	\N	f
https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80	IMAGE	2	2026-03-12 14:30:39.326+01	\N	\N	\N	seed/floral-chiffon-midi-dress-img2	866ab991-f32d-4dfb-9fc1-0968ed85fc93	c476486e-5234-401b-9461-23c03c8b2c3b	\N	f
https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80	IMAGE	3	2026-03-12 14:30:39.358+01	\N	\N	\N	seed/gold-beaded-choker-img0	6aa1771c-a6eb-4a0b-b8a1-899dd797b024	c476486e-5234-401b-9461-23c03c8b2c3b	\N	f
https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=800&q=80	IMAGE	3	2026-03-12 14:30:39.358+01	\N	\N	\N	seed/gold-beaded-choker-img1	0d8b72dd-1905-4fe0-bf4a-1aa11d6ef5ea	c476486e-5234-401b-9461-23c03c8b2c3b	\N	f
https://images.unsplash.com/photo-1594938298603-3e70e6ccc4c3?auto=format&fit=crop&w=800&q=80	IMAGE	4	2026-03-12 14:30:39.373+01	\N	\N	\N	seed/asoke-gele-iro-set-img0	563c29d1-cf28-4266-bb35-c2b0bc09783c	37232cc8-f85e-48d0-b4b3-3cac43305fdc	\N	f
https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80	IMAGE	4	2026-03-12 14:30:39.373+01	\N	\N	\N	seed/asoke-gele-iro-set-img1	26f27b23-0662-486e-a4c0-5ff08ff469b4	37232cc8-f85e-48d0-b4b3-3cac43305fdc	\N	f
https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80	IMAGE	4	2026-03-12 14:30:39.373+01	\N	\N	\N	seed/asoke-gele-iro-set-img2	7631586c-003f-47ad-8487-68133fcee281	37232cc8-f85e-48d0-b4b3-3cac43305fdc	\N	f
https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80	IMAGE	5	2026-03-12 14:30:39.412+01	\N	\N	\N	seed/ankara-wrap-skirt-img0	ebb94685-446c-44f7-ab99-d0f95d1dfed4	37232cc8-f85e-48d0-b4b3-3cac43305fdc	\N	f
https://images.unsplash.com/photo-1583744946564-b46b88d4b8d0?auto=format&fit=crop&w=800&q=80	IMAGE	5	2026-03-12 14:30:39.412+01	\N	\N	\N	seed/ankara-wrap-skirt-img1	96e113b2-43ea-42e3-8e1f-892a2c96a723	37232cc8-f85e-48d0-b4b3-3cac43305fdc	\N	f
https://images.unsplash.com/photo-1590794056226-f6a7c1b70d79?auto=format&fit=crop&w=800&q=80	IMAGE	6	2026-03-12 14:30:39.443+01	\N	\N	\N	seed/custom-asoebi-lace-blouse-img0	a55bd631-aae4-4ca9-8c4b-93aba2a4c53f	37232cc8-f85e-48d0-b4b3-3cac43305fdc	\N	f
https://images.unsplash.com/photo-1583267702009-a325834bfa47?auto=format&fit=crop&w=800&q=80	IMAGE	6	2026-03-12 14:30:39.443+01	\N	\N	\N	seed/custom-asoebi-lace-blouse-img1	41844c34-00e3-4e13-a78a-3f919611e20f	37232cc8-f85e-48d0-b4b3-3cac43305fdc	\N	f
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4	VIDEO	6	2026-03-12 14:30:39.443+01	\N	\N	\N	seed/custom-asoebi-lace-blouse-video	9be9ff66-4179-4129-a4d0-08fdd42707b5	37232cc8-f85e-48d0-b4b3-3cac43305fdc	\N	f
https://images.unsplash.com/photo-1516257984-08fe4fad0f76?auto=format&fit=crop&w=800&q=80	IMAGE	7	2026-03-12 14:30:39.462+01	\N	\N	\N	seed/grand-agbada-3-piece-img0	b0d05a00-fd5f-4859-9ef3-8565ffad553f	9f666f6a-52a0-4f77-b40c-d849cffffa5d	\N	f
https://images.unsplash.com/photo-1551232864-3f0890e1777d?auto=format&fit=crop&w=800&q=80	IMAGE	7	2026-03-12 14:30:39.462+01	\N	\N	\N	seed/grand-agbada-3-piece-img1	7872d213-0328-4ed5-9cf8-30d6a2181431	9f666f6a-52a0-4f77-b40c-d849cffffa5d	\N	f
https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80	IMAGE	7	2026-03-12 14:30:39.462+01	\N	\N	\N	seed/grand-agbada-3-piece-img2	44fb16bc-2263-4f37-ae8c-1642c41bf83c	9f666f6a-52a0-4f77-b40c-d849cffffa5d	\N	f
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4	VIDEO	7	2026-03-12 14:30:39.462+01	\N	\N	\N	seed/grand-agbada-3-piece-video	d52584bb-c0e4-481f-92ef-79cd7c2ea793	9f666f6a-52a0-4f77-b40c-d849cffffa5d	\N	f
https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3	AUDIO	7	2026-03-12 14:30:39.462+01	\N	\N	\N	seed/grand-agbada-3-piece-music	f6039c6e-b7a2-43b6-a04f-e4c131bcdd32	9f666f6a-52a0-4f77-b40c-d849cffffa5d	\N	t
https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80	IMAGE	8	2026-03-12 14:30:39.487+01	\N	\N	\N	seed/mens-ankara-print-shirt-img0	2d9330f0-7920-4406-a97a-b924352b05e3	9f666f6a-52a0-4f77-b40c-d849cffffa5d	\N	f
https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80	IMAGE	8	2026-03-12 14:30:39.487+01	\N	\N	\N	seed/mens-ankara-print-shirt-img1	94c0903c-1ec5-4fc7-b264-dbec5a78bad7	9f666f6a-52a0-4f77-b40c-d849cffffa5d	\N	f
https://images.unsplash.com/photo-1594938298603-3e70e6ccc4c3?auto=format&fit=crop&w=800&q=80	IMAGE	8	2026-03-12 14:30:39.487+01	\N	\N	\N	seed/mens-ankara-print-shirt-img2	a888442e-6088-47f9-9a1b-0636754dcc95	9f666f6a-52a0-4f77-b40c-d849cffffa5d	\N	f
https://images.unsplash.com/photo-1516257984-08fe4fad0f76?auto=format&fit=crop&w=800&q=80	IMAGE	9	2026-03-12 14:30:39.51+01	\N	\N	\N	seed/kaftan-trouser-set-img0	d637d5d1-e67e-47a5-a9fb-f4ca79334022	9f666f6a-52a0-4f77-b40c-d849cffffa5d	\N	f
https://images.unsplash.com/photo-1551232864-3f0890e1777d?auto=format&fit=crop&w=800&q=80	IMAGE	9	2026-03-12 14:30:39.51+01	\N	\N	\N	seed/kaftan-trouser-set-img1	de8612a8-1458-4606-8bd9-03b477969e5c	9f666f6a-52a0-4f77-b40c-d849cffffa5d	\N	f
https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80	IMAGE	10	2026-03-12 14:30:39.543+01	\N	\N	\N	seed/classic-white-sneakers-img0	dfe863cf-a161-4a6a-a72a-06ba46738d54	9f666f6a-52a0-4f77-b40c-d849cffffa5d	\N	f
https://images.unsplash.com/photo-1603808033176-9d134e8e5f2c?auto=format&fit=crop&w=800&q=80	IMAGE	10	2026-03-12 14:30:39.543+01	\N	\N	\N	seed/classic-white-sneakers-img1	c2553da6-7aa0-4e84-9629-36728a45a656	9f666f6a-52a0-4f77-b40c-d849cffffa5d	\N	f
https://images.unsplash.com/photo-1525966222134-84e1f714d36c?auto=format&fit=crop&w=800&q=80	IMAGE	10	2026-03-12 14:30:39.543+01	\N	\N	\N	seed/classic-white-sneakers-img2	c5cc8b88-acc5-4317-b0d0-e79df1c32b0e	9f666f6a-52a0-4f77-b40c-d849cffffa5d	\N	f
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4	VIDEO	10	2026-03-12 14:30:39.543+01	\N	\N	\N	seed/classic-white-sneakers-video	5b390a84-f5b1-403c-8efb-0a1fbdd29c45	9f666f6a-52a0-4f77-b40c-d849cffffa5d	\N	f
https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80	IMAGE	11	2026-03-12 14:30:39.558+01	\N	\N	\N	seed/thrift-levis-501-jeans-img0	1b662504-409b-4aab-8c98-3977906b01ac	bed9f82b-a84c-48e5-8409-75ed43f60db1	\N	f
https://images.unsplash.com/photo-1489987707849-2d0a0b8bcd1e?auto=format&fit=crop&w=800&q=80	IMAGE	11	2026-03-12 14:30:39.558+01	\N	\N	\N	seed/thrift-levis-501-jeans-img1	1f10190d-a106-4ee5-ae8d-7c613571987f	bed9f82b-a84c-48e5-8409-75ed43f60db1	\N	f
https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80	IMAGE	12	2026-03-12 14:30:39.589+01	\N	\N	\N	seed/grade-a-designer-bag-bundle-img0	b4395946-bbe9-4d2f-bc18-92e11a4a97fd	bed9f82b-a84c-48e5-8409-75ed43f60db1	\N	f
https://images.unsplash.com/photo-1548036161-19d3b2bf5c44?auto=format&fit=crop&w=800&q=80	IMAGE	12	2026-03-12 14:30:39.589+01	\N	\N	\N	seed/grade-a-designer-bag-bundle-img1	1ad8f79b-ac76-4514-bd54-171b41da05d8	bed9f82b-a84c-48e5-8409-75ed43f60db1	\N	f
https://images.unsplash.com/photo-1472506753867-c45eed17a166?auto=format&fit=crop&w=800&q=80	IMAGE	12	2026-03-12 14:30:39.589+01	\N	\N	\N	seed/grade-a-designer-bag-bundle-img2	91b26262-1cdc-4f19-9d6f-9dc49ce0f53c	bed9f82b-a84c-48e5-8409-75ed43f60db1	\N	f
https://images.unsplash.com/photo-1489987707849-2d0a0b8bcd1e?auto=format&fit=crop&w=800&q=80	IMAGE	13	2026-03-12 14:30:39.625+01	\N	\N	\N	seed/thrift-puffer-jacket-img0	d78d4607-98d2-46e0-b3b1-a487d8e2ef8d	bed9f82b-a84c-48e5-8409-75ed43f60db1	\N	f
https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80	IMAGE	13	2026-03-12 14:30:39.625+01	\N	\N	\N	seed/thrift-puffer-jacket-img1	6d7ee046-296b-4c58-b8bc-2a75ce331184	bed9f82b-a84c-48e5-8409-75ed43f60db1	\N	f
https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80	IMAGE	14	2026-03-12 14:30:39.652+01	\N	\N	\N	seed/raw-african-shea-butter-1kg-img0	0102b243-76a4-4f08-8ecd-bd405ff0bda4	5f5139e9-e690-4278-87f8-a628ec5a519f	\N	f
https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80	IMAGE	14	2026-03-12 14:30:39.652+01	\N	\N	\N	seed/raw-african-shea-butter-1kg-img1	e7718087-c177-41d3-8da2-d847f03dfed8	5f5139e9-e690-4278-87f8-a628ec5a519f	\N	f
https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80	IMAGE	15	2026-03-12 14:30:39.675+01	\N	\N	\N	seed/nigerian-black-soap-ose-dudu-img0	ec830c41-099e-4845-8b2e-db2b4b401722	5f5139e9-e690-4278-87f8-a628ec5a519f	\N	f
https://images.unsplash.com/photo-1614325498208-f6b62b22c04e?auto=format&fit=crop&w=800&q=80	IMAGE	15	2026-03-12 14:30:39.675+01	\N	\N	\N	seed/nigerian-black-soap-ose-dudu-img1	0e61f782-8c2a-48d0-8259-13c5e743b45d	5f5139e9-e690-4278-87f8-a628ec5a519f	\N	f
https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80	IMAGE	16	2026-03-12 14:30:39.688+01	\N	\N	\N	seed/handmade-nigerian-waist-beads-img0	b79fc903-2fd4-47f1-b422-0616d671d6a6	5f5139e9-e690-4278-87f8-a628ec5a519f	\N	f
https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80	IMAGE	16	2026-03-12 14:30:39.688+01	\N	\N	\N	seed/handmade-nigerian-waist-beads-img1	8c2aac7b-32aa-4cf2-856d-c1e4bf98f798	5f5139e9-e690-4278-87f8-a628ec5a519f	\N	f
https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80	IMAGE	17	2026-03-12 14:30:39.7+01	\N	\N	\N	seed/adire-fabric-tote-bag-img0	4472ac40-cd06-4932-8fa1-e86ff4f43668	5f5139e9-e690-4278-87f8-a628ec5a519f	\N	f
https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80	IMAGE	17	2026-03-12 14:30:39.7+01	\N	\N	\N	seed/adire-fabric-tote-bag-img1	92b5c649-305d-432c-9b7b-a643ffb76069	5f5139e9-e690-4278-87f8-a628ec5a519f	\N	f
https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80	IMAGE	18	2026-03-12 14:30:39.72+01	\N	\N	\N	seed/leather-sandals-aba-made-img0	6c4bb99d-e702-4419-83e5-446502c62c01	5f5139e9-e690-4278-87f8-a628ec5a519f	\N	f
https://images.unsplash.com/photo-1603808033176-9d134e8e5f2c?auto=format&fit=crop&w=800&q=80	IMAGE	18	2026-03-12 14:30:39.72+01	\N	\N	\N	seed/leather-sandals-aba-made-img1	131679e8-62ed-4458-97a5-0c8b11eb97a8	5f5139e9-e690-4278-87f8-a628ec5a519f	\N	f
https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.736+01	\N	\N	\N	seed/post-1773325839731-ktxt9w4bx7g-img0	e58fdee5-e1e3-4187-bfc4-76d625f0b92f	c476486e-5234-401b-9461-23c03c8b2c3b	9a0edad1-68cb-446f-a7d4-d909bd56ce6f	f
https://images.unsplash.com/photo-1583744946564-b46b88d4b8d0?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.736+01	\N	\N	\N	seed/post-1773325839731-446qy51nbsf-img1	ffd37d55-14a1-4358-8899-54a5260a74c3	c476486e-5234-401b-9461-23c03c8b2c3b	9a0edad1-68cb-446f-a7d4-d909bd56ce6f	f
https://images.unsplash.com/photo-1590794056226-f6a7c1b70d79?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.736+01	\N	\N	\N	seed/post-1773325839731-ab2jyds97ra-img2	1b6e5993-278b-4377-997c-db7bc3dc52b5	c476486e-5234-401b-9461-23c03c8b2c3b	9a0edad1-68cb-446f-a7d4-d909bd56ce6f	f
https://images.unsplash.com/photo-1583267702009-a325834bfa47?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.766+01	\N	\N	\N	seed/post-1773325839762-0w0gnpc3bhbn-img0	bc629c04-35b6-4fb8-8909-9396fdd6bb61	c476486e-5234-401b-9461-23c03c8b2c3b	b948af09-fada-46d0-8b46-0b23d0447353	f
https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.766+01	\N	\N	\N	seed/post-1773325839762-4l4rgrj771l-img1	41bcd44f-ef63-432b-8f37-d6bd334e5926	c476486e-5234-401b-9461-23c03c8b2c3b	b948af09-fada-46d0-8b46-0b23d0447353	f
https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.78+01	\N	\N	\N	seed/post-1773325839776-am765nmmq2t-img0	75002811-8023-4227-8241-95e8c8bc4c6a	c476486e-5234-401b-9461-23c03c8b2c3b	0727040c-b4be-4cfe-b42b-2ee8d6bc4c34	f
https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.78+01	\N	\N	\N	seed/post-1773325839776-nz71b3nv1mh-img1	c47ba115-21b8-4c17-b2fe-d402ea92c116	c476486e-5234-401b-9461-23c03c8b2c3b	0727040c-b4be-4cfe-b42b-2ee8d6bc4c34	f
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4	VIDEO	\N	2026-03-12 14:30:39.799+01	\N	\N	\N	seed/post-1773325839790-rd8cda37g4-vid	f3529873-dd10-4884-9415-2ca2714f13ef	c476486e-5234-401b-9461-23c03c8b2c3b	82d31526-d91f-4825-ad37-6b9fa84957c0	f
https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3	AUDIO	\N	2026-03-12 14:30:39.799+01	\N	\N	\N	seed/post-1773325839790-qwc9f3a1m4-mus	9808ef46-c3ee-4412-8950-2e88f5b2803f	c476486e-5234-401b-9461-23c03c8b2c3b	82d31526-d91f-4825-ad37-6b9fa84957c0	t
https://images.unsplash.com/photo-1594938298603-3e70e6ccc4c3?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.811+01	\N	\N	\N	seed/post-1773325839809-bujlq3aveok-img0	940a1411-cb0f-40ef-a378-b9c45a3bb623	37232cc8-f85e-48d0-b4b3-3cac43305fdc	34b99789-4cd7-4f4f-b06c-6925f779f787	f
https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.811+01	\N	\N	\N	seed/post-1773325839809-90w1mut3h3v-img1	57494d10-33e5-4c31-aa61-5fb60f43f9a7	37232cc8-f85e-48d0-b4b3-3cac43305fdc	34b99789-4cd7-4f4f-b06c-6925f779f787	f
https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.824+01	\N	\N	\N	seed/post-1773325839820-yvrszdp95ej-img0	03b76a17-0748-4937-98bc-d67d8f32fa27	37232cc8-f85e-48d0-b4b3-3cac43305fdc	d2be5313-b310-4b5d-a9bf-020c89b0b3e6	f
https://images.unsplash.com/photo-1583744946564-b46b88d4b8d0?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.824+01	\N	\N	\N	seed/post-1773325839820-awep6pfqkgm-img1	e37a2420-5911-4e15-80ab-5f289dbcb2a2	37232cc8-f85e-48d0-b4b3-3cac43305fdc	d2be5313-b310-4b5d-a9bf-020c89b0b3e6	f
https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.849+01	\N	\N	\N	seed/post-1773325839843-thonrud278-img0	ae507e58-e6eb-48f2-b7a3-b3d7af78422e	37232cc8-f85e-48d0-b4b3-3cac43305fdc	fbc0fb3c-8d24-4180-b6f2-cdf1eb687bc5	f
https://images.unsplash.com/photo-1590794056226-f6a7c1b70d79?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.849+01	\N	\N	\N	seed/post-1773325839843-xcl57ydwhjj-img1	1a3567f6-0259-41b1-9447-4996f98218b1	37232cc8-f85e-48d0-b4b3-3cac43305fdc	fbc0fb3c-8d24-4180-b6f2-cdf1eb687bc5	f
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4	VIDEO	\N	2026-03-12 14:30:39.849+01	\N	\N	\N	seed/post-1773325839843-8g4kr2521x5-vid	beaec09d-0faa-4925-8b7b-d02d680b41ff	37232cc8-f85e-48d0-b4b3-3cac43305fdc	fbc0fb3c-8d24-4180-b6f2-cdf1eb687bc5	f
https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3	AUDIO	\N	2026-03-12 14:30:39.849+01	\N	\N	\N	seed/post-1773325839843-taakhpnh8oq-mus	65bcda93-54d8-42bc-894b-637bde2e206b	37232cc8-f85e-48d0-b4b3-3cac43305fdc	fbc0fb3c-8d24-4180-b6f2-cdf1eb687bc5	t
https://images.unsplash.com/photo-1516257984-08fe4fad0f76?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.858+01	\N	\N	\N	seed/post-1773325839857-jf9600cqccp-img0	919fa029-a1da-49e2-9e0e-666a62938ab5	9f666f6a-52a0-4f77-b40c-d849cffffa5d	6327a2f5-2dde-4f0c-897d-cdfc2e68bb46	f
https://images.unsplash.com/photo-1551232864-3f0890e1777d?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.858+01	\N	\N	\N	seed/post-1773325839857-yabvzkhf8r-img1	c378df5a-794a-4a88-ab27-fb0d1148c4e1	9f666f6a-52a0-4f77-b40c-d849cffffa5d	6327a2f5-2dde-4f0c-897d-cdfc2e68bb46	f
https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.858+01	\N	\N	\N	seed/post-1773325839857-nr9h4jaizj9-img2	69c79617-ae92-4d90-b76f-c191f4884825	9f666f6a-52a0-4f77-b40c-d849cffffa5d	6327a2f5-2dde-4f0c-897d-cdfc2e68bb46	f
https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.865+01	\N	\N	\N	seed/post-1773325839864-f9btm1nym3u-img0	4412a4d2-edd1-43f3-ae09-63d7bed89fa4	9f666f6a-52a0-4f77-b40c-d849cffffa5d	8f75c41c-417e-482f-9831-a3efaa3d0620	f
https://images.unsplash.com/photo-1594938298603-3e70e6ccc4c3?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.865+01	\N	\N	\N	seed/post-1773325839864-3rtgwjdyxwp-img1	1d67b919-9cbb-464d-b6b3-c55943258383	9f666f6a-52a0-4f77-b40c-d849cffffa5d	8f75c41c-417e-482f-9831-a3efaa3d0620	f
https://images.unsplash.com/photo-1516257984-08fe4fad0f76?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.872+01	\N	\N	\N	seed/post-1773325839870-qedxrocmcq-img0	4c422a3d-c6aa-44f7-b1f9-d4317eb037b9	9f666f6a-52a0-4f77-b40c-d849cffffa5d	b40eb938-131f-4540-bcd5-cedb697bd94f	f
https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.872+01	\N	\N	\N	seed/post-1773325839870-s2aonrcsl2m-img1	8e64d326-08e8-4d2c-9065-44c3b5c2fd2e	9f666f6a-52a0-4f77-b40c-d849cffffa5d	b40eb938-131f-4540-bcd5-cedb697bd94f	f
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4	VIDEO	\N	2026-03-12 14:30:39.872+01	\N	\N	\N	seed/post-1773325839870-do6y9wvc7y-vid	d1277dfd-0987-43be-8ed3-5513016647aa	9f666f6a-52a0-4f77-b40c-d849cffffa5d	b40eb938-131f-4540-bcd5-cedb697bd94f	f
https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.877+01	\N	\N	\N	seed/post-1773325839876-bvoyfndeq7-img0	53eec633-90c9-4ce5-a2a9-1a4b03a25bc9	bed9f82b-a84c-48e5-8409-75ed43f60db1	f8eaa0a3-610f-4690-9278-76e5c11c95af	f
https://images.unsplash.com/photo-1489987707849-2d0a0b8bcd1e?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.877+01	\N	\N	\N	seed/post-1773325839876-k7lo3tz2vrs-img1	78e397c7-4fa7-49c4-b5f2-5fcf9c1d3c24	bed9f82b-a84c-48e5-8409-75ed43f60db1	f8eaa0a3-610f-4690-9278-76e5c11c95af	f
https://images.unsplash.com/photo-1472506753867-c45eed17a166?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.877+01	\N	\N	\N	seed/post-1773325839876-ftcdcyg17n-img2	dc20c8f1-8510-40c5-8d41-158497600362	bed9f82b-a84c-48e5-8409-75ed43f60db1	f8eaa0a3-610f-4690-9278-76e5c11c95af	f
https://images.unsplash.com/photo-1489987707849-2d0a0b8bcd1e?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.881+01	\N	\N	\N	seed/post-1773325839881-dwqt2pshyt8-img0	d1f9df70-070b-43c8-aae6-728cde9216d8	bed9f82b-a84c-48e5-8409-75ed43f60db1	db418b80-fa67-46fd-a26c-7ff944a2d71e	f
https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.881+01	\N	\N	\N	seed/post-1773325839881-oisuka95e0n-img1	3145f3f6-3809-436f-9e35-be8976db507e	bed9f82b-a84c-48e5-8409-75ed43f60db1	db418b80-fa67-46fd-a26c-7ff944a2d71e	f
https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.893+01	\N	\N	\N	seed/post-1773325839892-x6f5y7j2es-img0	bc117751-d240-4a46-99cb-73cde84e1f5f	5f5139e9-e690-4278-87f8-a628ec5a519f	459f6399-ba6c-40be-9270-8ae3ab5d6d37	f
https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.893+01	\N	\N	\N	seed/post-1773325839892-xm5x2c3fi9p-img1	4d486208-ea56-4c7c-867f-8b028564d72a	5f5139e9-e690-4278-87f8-a628ec5a519f	459f6399-ba6c-40be-9270-8ae3ab5d6d37	f
https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.904+01	\N	\N	\N	seed/post-1773325839903-10xil3fl8vq-img0	e1c42de7-a614-4a93-9dd7-aec15751c16b	5f5139e9-e690-4278-87f8-a628ec5a519f	faae5419-ba84-4297-9e88-2d3b23aaac0a	f
https://images.unsplash.com/photo-1614325498208-f6b62b22c04e?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.904+01	\N	\N	\N	seed/post-1773325839903-oatesqoma5q-img1	2076aee2-2bd1-405d-8166-52ba9dc5dc33	5f5139e9-e690-4278-87f8-a628ec5a519f	faae5419-ba84-4297-9e88-2d3b23aaac0a	f
https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.911+01	\N	\N	\N	seed/post-1773325839911-21ex1gw71a8-img0	83fefb42-6e03-4f64-ba8a-6a7c24ef8d7c	5f5139e9-e690-4278-87f8-a628ec5a519f	28892275-f3d5-4b89-bb22-e27410e4247e	f
https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.911+01	\N	\N	\N	seed/post-1773325839911-dow5ttxoujk-img1	05177e63-532b-4cd7-8e6c-b589e622673b	5f5139e9-e690-4278-87f8-a628ec5a519f	28892275-f3d5-4b89-bb22-e27410e4247e	f
https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.919+01	\N	\N	\N	seed/post-1773325839918-b4vkecv9spp-img0	5f5c8e90-eb1f-4fd4-8a54-993c014fb0e7	5f5139e9-e690-4278-87f8-a628ec5a519f	3dc6fa03-f01b-45d5-9aaf-e233f658fa9c	f
https://images.unsplash.com/photo-1603808033176-9d134e8e5f2c?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.919+01	\N	\N	\N	seed/post-1773325839918-vln0hblbrk-img1	e11d168b-a7ea-4158-b099-e1a73b95bf9b	5f5139e9-e690-4278-87f8-a628ec5a519f	3dc6fa03-f01b-45d5-9aaf-e233f658fa9c	f
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4	VIDEO	\N	2026-03-12 14:30:39.919+01	\N	\N	\N	seed/post-1773325839918-74prrs1qgi7-vid	4e53d6df-8884-41f0-a02e-6aa42ec535c9	5f5139e9-e690-4278-87f8-a628ec5a519f	3dc6fa03-f01b-45d5-9aaf-e233f658fa9c	f
https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.926+01	\N	\N	\N	seed/post-1773325839926-u2nsd1awto-img0	d90b823c-f713-4be4-8d32-e373302e4d00	84cbe55d-f6dd-4d16-9bb6-6ffe1ddc6d3f	3720ddfa-ebee-455b-99ea-f42949d43dab	f
https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.926+01	\N	\N	\N	seed/post-1773325839926-7ccjdc67wfv-img1	b990f3d5-4ac4-40d5-b62a-465c1d2f1552	84cbe55d-f6dd-4d16-9bb6-6ffe1ddc6d3f	3720ddfa-ebee-455b-99ea-f42949d43dab	f
https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.932+01	\N	\N	\N	seed/post-1773325839932-s90m18yd6hl-img0	aeafe14b-3c78-4be1-9080-9ced60c55f3f	2b76f00d-ef5a-4cc2-912c-616517d84d90	c836ae29-7134-4a67-94e4-e656cf2c45ad	f
https://images.unsplash.com/photo-1594938298603-3e70e6ccc4c3?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.932+01	\N	\N	\N	seed/post-1773325839932-f8aq6bphyyr-img1	20941c1c-1b7a-4998-aa26-62f945d3ce2f	2b76f00d-ef5a-4cc2-912c-616517d84d90	c836ae29-7134-4a67-94e4-e656cf2c45ad	f
https://images.unsplash.com/photo-1516257984-08fe4fad0f76?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.94+01	\N	\N	\N	seed/post-1773325839937-6qe5tlgfbpq-img0	30ffcb54-04a4-4187-82a4-27a191e36e8c	bb084c97-1310-4298-bb1c-48c20a697969	3491c52b-b3b4-4cc0-9710-b4cffa5ee2b4	f
https://images.unsplash.com/photo-1551232864-3f0890e1777d?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.94+01	\N	\N	\N	seed/post-1773325839937-o7u7kuqg95b-img1	b5da02ee-6898-459e-8497-541981989bf0	bb084c97-1310-4298-bb1c-48c20a697969	3491c52b-b3b4-4cc0-9710-b4cffa5ee2b4	f
https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.946+01	\N	\N	\N	seed/post-1773325839945-00w5lwxutv7yg-img0	cf332e44-6e6c-4a63-9c74-63ac1dbbdfa6	4e785386-7129-4386-828f-25addc8cc24d	db3a45f5-aa47-4d63-98d7-3cbbe7c707ad	f
https://images.unsplash.com/photo-1614325498208-f6b62b22c04e?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.946+01	\N	\N	\N	seed/post-1773325839945-tw28ekeztc9-img1	c3eac0bb-f6b7-474c-ac3f-14c4ecc5c52c	4e785386-7129-4386-828f-25addc8cc24d	db3a45f5-aa47-4d63-98d7-3cbbe7c707ad	f
https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.952+01	\N	\N	\N	seed/post-1773325839951-fn8b8jmvivg-img0	17bd291d-cec6-4661-a859-83b0e65e05d7	5d330ec2-29f7-478f-8136-16d520bfd297	4aa05e46-030a-4c52-a751-103b8239d05d	f
https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80	IMAGE	\N	2026-03-12 14:30:39.952+01	\N	\N	\N	seed/post-1773325839951-rw4n9fnk0ce-img1	6896360b-2db7-4470-892b-64d2b9b328e7	5d330ec2-29f7-478f-8136-16d520bfd297	4aa05e46-030a-4c52-a751-103b8239d05d	f
https://images.unsplash.com/photo-1583267702009-a325834bfa47?auto=format&fit=crop&w=600&h=1067&q=80	IMAGE	\N	2026-03-12 14:30:39.969+01	\N	\N	\N	seed/story-a751e833-6bd1-4b79-a3e0-89ab46ab3ab4	a751e833-6bd1-4b79-a3e0-89ab46ab3ab4	c476486e-5234-401b-9461-23c03c8b2c3b	\N	f
https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&h=1067&q=80	IMAGE	\N	2026-03-12 14:30:39.98+01	\N	\N	\N	seed/story-d0484f73-fd11-4d21-b483-a5c216bc158f	d0484f73-fd11-4d21-b483-a5c216bc158f	c476486e-5234-401b-9461-23c03c8b2c3b	\N	f
https://images.unsplash.com/photo-1594938298603-3e70e6ccc4c3?auto=format&fit=crop&w=600&h=1067&q=80	IMAGE	\N	2026-03-12 14:30:39.988+01	\N	\N	\N	seed/story-cb002836-ad79-411a-b1fe-6f5422be1bbd	cb002836-ad79-411a-b1fe-6f5422be1bbd	37232cc8-f85e-48d0-b4b3-3cac43305fdc	\N	f
https://images.unsplash.com/photo-1516257984-08fe4fad0f76?auto=format&fit=crop&w=600&h=1067&q=80	IMAGE	\N	2026-03-12 14:30:39.994+01	\N	\N	\N	seed/story-325f40a8-ab94-4d7b-a7c5-ecd2e0409cea	325f40a8-ab94-4d7b-a7c5-ecd2e0409cea	9f666f6a-52a0-4f77-b40c-d849cffffa5d	\N	f
https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&h=1067&q=80	IMAGE	\N	2026-03-12 14:30:40+01	\N	\N	\N	seed/story-0b563716-98dc-426c-a47e-25d4bcaca1e7	0b563716-98dc-426c-a47e-25d4bcaca1e7	bed9f82b-a84c-48e5-8409-75ed43f60db1	\N	f
https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&h=1067&q=80	IMAGE	\N	2026-03-12 14:30:40.109+01	\N	\N	\N	seed/story-dade02d1-8dd2-4510-ac04-55673f720872	dade02d1-8dd2-4510-ac04-55673f720872	5f5139e9-e690-4278-87f8-a628ec5a519f	\N	f
https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&h=1067&q=80	IMAGE	\N	2026-03-12 14:30:40.116+01	\N	\N	\N	seed/story-53e4b0d2-926c-4e93-bfe7-a8169baadbcc	53e4b0d2-926c-4e93-bfe7-a8169baadbcc	84cbe55d-f6dd-4d16-9bb6-6ffe1ddc6d3f	\N	f
https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&h=1067&q=80	IMAGE	\N	2026-03-12 14:30:40.121+01	\N	\N	\N	seed/story-9c653d19-ac6c-4d4d-aa49-e670707d105e	9c653d19-ac6c-4d4d-aa49-e670707d105e	2b76f00d-ef5a-4cc2-912c-616517d84d90	\N	f
https://res.cloudinary.com/dcci05bzj/image/upload/v1773326424/reelshop/chris-hardy-Z1iW6KNf2Yc-unsplash_rosbec.jpg	IMAGE	19	2026-03-12 14:41:54.322+01	\N	\N	\N	reelshop/chris-hardy-Z1iW6KNf2Yc-unsplash_rosbec	34553790-8ca1-48d2-a853-bdbf4ac22758	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	f
https://res.cloudinary.com/dcci05bzj/video/upload/v1773482176/reelshop/Let_s_Talk_About_Shoes_in_60_Seconds___Derby_vs_Oxford_shorts_zgs5ht.mp4	VIDEO	\N	2026-03-14 09:56:16.715+01	\N	\N	\N	reelshop/Let_s_Talk_About_Shoes_in_60_Seconds___Derby_vs_Oxford_shorts_zgs5ht	49904b58-3886-4e77-9e61-cb90b5a67487	ad8255a8-58bb-4dfb-8d7d-298219a01c91	f3788904-5611-450a-952c-0e15dda7f36f	f
https://res.cloudinary.com/dcci05bzj/image/upload/v1773503045/reelshop/abaya13_fxoezo.jpg	IMAGE	20	2026-03-14 15:45:18.163+01	\N	\N	\N	reelshop/abaya13_fxoezo	51c477a5-5627-4492-a265-165156984456	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	f
https://res.cloudinary.com/dcci05bzj/image/upload/v1773503289/reelshop/abaya11_xcpuue.jpg	IMAGE	21	2026-03-14 15:50:11.27+01	\N	\N	\N	reelshop/abaya11_xcpuue	84a75d71-ef33-4f51-b44f-556662779c11	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	f
https://res.cloudinary.com/dcci05bzj/video/upload/v1773510897/reelshop/Omega_Seamaster_Aqua_Terra_Co-Axial_GMT_vkjwox.mp4	VIDEO	\N	2026-03-14 17:54:58.181+01	\N	\N	\N	reelshop/Omega_Seamaster_Aqua_Terra_Co-Axial_GMT_vkjwox	1d48290c-2478-4d60-8cc7-116b8c175ae0	e1b39cba-718e-41b0-88bf-6a038e30a211	\N	f
https://res.cloudinary.com/dcci05bzj/video/upload/v1773582364/reelshop/7251560-uhd_2160_3840_25fps_geeghh.mp4	VIDEO	\N	2026-03-15 13:46:06.507+01	\N	\N	\N	reelshop/7251560-uhd_2160_3840_25fps_geeghh	bf18efe7-0eb5-4111-a22c-37f727f5741c	e1b39cba-718e-41b0-88bf-6a038e30a211	97b4f3f2-9dbd-4bcc-bb19-10fbb425321b	f
https://res.cloudinary.com/dcci05bzj/image/upload/v1773649744/reelshop/NABY5977_fsxajr.jpg	IMAGE	22	2026-03-16 08:30:05.236+01	\N	\N	\N	reelshop/NABY5977_fsxajr	fccaba78-347e-4f9d-bc83-1e8058067218	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	f
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Message" (id, "conversationId", "senderId", content, read, "sentAt", "isAiResponse", "productId") FROM stdin;
37b3f73b-70f5-46c6-8d73-46f2f1c380d5	605455b5-6143-448e-943a-c10ca8c768ed	ad8255a8-58bb-4dfb-8d7d-298219a01c91	H, nice dress	f	2026-03-12 16:30:57.49+01	f	\N
80c7769c-1509-44e1-8f88-32ed7ad88012	605455b5-6143-448e-943a-c10ca8c768ed	ad8255a8-58bb-4dfb-8d7d-298219a01c91	hi	f	2026-03-14 10:14:52.826+01	f	\N
cac27040-1fd3-444d-a6c8-4afa45d6b387	31c749c3-d3ac-4305-9c63-2267cf195928	e1b39cba-718e-41b0-88bf-6a038e30a211	hi	f	2026-03-14 11:36:50.673+01	f	\N
1fe4e16e-3b36-4952-9903-b127d2093bde	31c749c3-d3ac-4305-9c63-2267cf195928	ad8255a8-58bb-4dfb-8d7d-298219a01c91	Hi	f	2026-03-15 15:14:00.901+01	f	\N
799623c5-da86-4ed7-8ca9-23678cf902f1	31c749c3-d3ac-4305-9c63-2267cf195928	ad8255a8-58bb-4dfb-8d7d-298219a01c91	Hi	f	2026-03-15 15:18:54.821+01	f	\N
ba1aba42-346e-4851-bd2b-a0a9e54e744d	31c749c3-d3ac-4305-9c63-2267cf195928	ad8255a8-58bb-4dfb-8d7d-298219a01c91	Nice car	f	2026-03-15 15:22:54.091+01	f	\N
281981ed-cdaa-474e-9d50-67f2460d775e	31c749c3-d3ac-4305-9c63-2267cf195928	e1b39cba-718e-41b0-88bf-6a038e30a211	Do you have a shoe?	f	2026-03-15 16:27:49.765+01	f	\N
a48768e1-63d1-42d7-b986-6add71ee699b	31c749c3-d3ac-4305-9c63-2267cf195928	ad8255a8-58bb-4dfb-8d7d-298219a01c91	yes, what side?	f	2026-03-15 16:27:59.526+01	f	\N
dc4cd7bd-38dd-4597-bf3b-67eecdcedf21	31c749c3-d3ac-4305-9c63-2267cf195928	e1b39cba-718e-41b0-88bf-6a038e30a211	size 45	f	2026-03-15 16:28:18.301+01	f	\N
84c1f449-9659-42d9-be8f-8605e4e461b6	31c749c3-d3ac-4305-9c63-2267cf195928	e1b39cba-718e-41b0-88bf-6a038e30a211	chat is working real time	f	2026-03-15 16:29:26.133+01	f	\N
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, "userId", message, type, read, "orderId", "productId", created_at, updated_at, "actorId", "commentId", "postId") FROM stdin;
1	5d330ec2-29f7-478f-8136-16d520bfd297	Someone started following you	NEW_FOLLOWER	f	\N	\N	2026-03-12 16:30:09.577+01	2026-03-12 16:30:09.577+01	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	\N
2	4e785386-7129-4386-828f-25addc8cc24d	Someone started following you	NEW_FOLLOWER	f	\N	\N	2026-03-12 16:30:15.482+01	2026-03-12 16:30:15.482+01	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	\N
3	5f5139e9-e690-4278-87f8-a628ec5a519f	Someone started following you	NEW_FOLLOWER	f	\N	\N	2026-03-12 16:30:27.488+01	2026-03-12 16:30:27.488+01	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	\N
8	bed9f82b-a84c-48e5-8409-75ed43f60db1	Someone started following your store	NEW_FOLLOWER	f	\N	\N	2026-03-14 11:54:53.846+01	2026-03-14 11:54:53.846+01	e1b39cba-718e-41b0-88bf-6a038e30a211	\N	\N
9	c476486e-5234-401b-9461-23c03c8b2c3b	Someone started following your store	NEW_FOLLOWER	f	\N	\N	2026-03-14 11:55:00.858+01	2026-03-14 11:55:00.858+01	e1b39cba-718e-41b0-88bf-6a038e30a211	\N	\N
10	5d330ec2-29f7-478f-8136-16d520bfd297	Someone started following you	NEW_FOLLOWER	f	\N	\N	2026-03-14 11:55:20.035+01	2026-03-14 11:55:20.035+01	e1b39cba-718e-41b0-88bf-6a038e30a211	\N	\N
11	bed9f82b-a84c-48e5-8409-75ed43f60db1	Someone started following your store	NEW_FOLLOWER	f	\N	\N	2026-03-14 12:02:06.102+01	2026-03-14 12:02:06.102+01	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	\N
13	c476486e-5234-401b-9461-23c03c8b2c3b	Someone started following your store	NEW_FOLLOWER	f	\N	\N	2026-03-14 12:02:09.194+01	2026-03-14 12:02:09.194+01	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	\N
4	ad8255a8-58bb-4dfb-8d7d-298219a01c91	Someone liked your post	POST_LIKE	t	\N	\N	2026-03-14 09:57:19.006+01	2026-03-14 15:53:09.772+01	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	\N
5	ad8255a8-58bb-4dfb-8d7d-298219a01c91	Someone commented on your post	NEW_COMMENT	t	\N	\N	2026-03-14 09:57:51.666+01	2026-03-14 15:53:09.772+01	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	\N
6	ad8255a8-58bb-4dfb-8d7d-298219a01c91	Someone liked your post	POST_LIKE	t	\N	\N	2026-03-14 11:28:23.945+01	2026-03-14 15:53:09.772+01	e1b39cba-718e-41b0-88bf-6a038e30a211	\N	\N
7	ad8255a8-58bb-4dfb-8d7d-298219a01c91	Someone started following you	NEW_FOLLOWER	t	\N	\N	2026-03-14 11:36:39.071+01	2026-03-14 15:53:09.772+01	e1b39cba-718e-41b0-88bf-6a038e30a211	\N	\N
12	ad8255a8-58bb-4dfb-8d7d-298219a01c91	Someone started following your store	NEW_FOLLOWER	t	\N	\N	2026-03-14 12:02:08.114+01	2026-03-14 15:53:09.772+01	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	\N
14	ad8255a8-58bb-4dfb-8d7d-298219a01c91	Someone started following your store	NEW_FOLLOWER	t	\N	\N	2026-03-14 15:52:49.227+01	2026-03-14 15:53:09.772+01	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	\N
19	ad8255a8-58bb-4dfb-8d7d-298219a01c91	New message from justsvy	GENERAL	t	\N	\N	2026-03-15 16:27:49.789+01	2026-03-15 16:30:18.395+01	e1b39cba-718e-41b0-88bf-6a038e30a211	\N	\N
21	ad8255a8-58bb-4dfb-8d7d-298219a01c91	New message from justsvy	GENERAL	t	\N	\N	2026-03-15 16:28:18.318+01	2026-03-15 16:30:18.395+01	e1b39cba-718e-41b0-88bf-6a038e30a211	\N	\N
22	ad8255a8-58bb-4dfb-8d7d-298219a01c91	New message from justsvy	GENERAL	t	\N	\N	2026-03-15 16:29:26.151+01	2026-03-15 16:30:18.395+01	e1b39cba-718e-41b0-88bf-6a038e30a211	\N	\N
15	e1b39cba-718e-41b0-88bf-6a038e30a211	Someone liked your post	POST_LIKE	t	\N	\N	2026-03-15 13:46:26.208+01	2026-03-15 16:30:21.987+01	e1b39cba-718e-41b0-88bf-6a038e30a211	\N	\N
16	e1b39cba-718e-41b0-88bf-6a038e30a211	New message from grandeur	GENERAL	t	\N	\N	2026-03-15 15:14:00.92+01	2026-03-15 16:30:21.987+01	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	\N
17	e1b39cba-718e-41b0-88bf-6a038e30a211	New message from grandeur	GENERAL	t	\N	\N	2026-03-15 15:18:54.835+01	2026-03-15 16:30:21.987+01	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	\N
18	e1b39cba-718e-41b0-88bf-6a038e30a211	New message from grandeur	GENERAL	t	\N	\N	2026-03-15 15:22:54.116+01	2026-03-15 16:30:21.987+01	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	\N
20	e1b39cba-718e-41b0-88bf-6a038e30a211	New message from grandeur	GENERAL	t	\N	\N	2026-03-15 16:27:59.54+01	2026-03-15 16:30:21.987+01	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	\N
23	e1b39cba-718e-41b0-88bf-6a038e30a211	Someone liked your post	POST_LIKE	f	\N	\N	2026-03-16 06:27:52.251+01	2026-03-16 06:27:52.251+01	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	\N
24	e1b39cba-718e-41b0-88bf-6a038e30a211	Someone started following you	NEW_FOLLOWER	f	\N	\N	2026-03-16 06:27:56.612+01	2026-03-16 06:27:56.612+01	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	\N
25	ad8255a8-58bb-4dfb-8d7d-298219a01c91	New order #4 received from justsvy	ORDER	f	\N	\N	2026-03-16 21:10:32.92+01	2026-03-16 21:10:32.92+01	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	\N
26	ad8255a8-58bb-4dfb-8d7d-298219a01c91	Buyer confirmed receipt of order #4. Funds have been released to your wallet.	ORDER	f	\N	\N	2026-03-17 02:46:47.908+01	2026-03-17 02:46:47.908+01	e1b39cba-718e-41b0-88bf-6a038e30a211	\N	\N
27	ad8255a8-58bb-4dfb-8d7d-298219a01c91	Buyer confirmed receipt of order #3. Funds have been released to your wallet.	ORDER	f	\N	\N	2026-03-17 08:44:05.45+01	2026-03-17 08:44:05.45+01	e1b39cba-718e-41b0-88bf-6a038e30a211	\N	\N
28	ad8255a8-58bb-4dfb-8d7d-298219a01c91	New order #5 received from justsvy	ORDER	f	\N	\N	2026-03-17 08:51:33.9+01	2026-03-17 08:51:33.9+01	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	\N
29	e1b39cba-718e-41b0-88bf-6a038e30a211	Your order #5 has been shipped. Funds will be released to the seller in 7 days if not confirmed.	ORDER	f	\N	\N	2026-03-17 08:57:37.764+01	2026-03-17 08:57:37.764+01	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	\N
30	ad8255a8-58bb-4dfb-8d7d-298219a01c91	Buyer confirmed receipt of order #5. Funds have been released to your wallet.	ORDER	f	\N	\N	2026-03-17 08:58:11.317+01	2026-03-17 08:58:11.317+01	e1b39cba-718e-41b0-88bf-6a038e30a211	\N	\N
31	ad8255a8-58bb-4dfb-8d7d-298219a01c91	New order #6 received from justsvy	ORDER	f	\N	\N	2026-03-17 08:59:30.137+01	2026-03-17 08:59:30.137+01	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	\N
32	e1b39cba-718e-41b0-88bf-6a038e30a211	Your order #6 has been shipped. Funds will be released to the seller in 7 days if not confirmed.	ORDER	f	\N	\N	2026-03-17 09:01:22.115+01	2026-03-17 09:01:22.115+01	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N	\N
33	ad8255a8-58bb-4dfb-8d7d-298219a01c91	Buyer confirmed receipt of order #6. Funds have been released to your wallet.	ORDER	f	\N	\N	2026-03-17 09:01:46.447+01	2026-03-17 09:01:46.447+01	e1b39cba-718e-41b0-88bf-6a038e30a211	\N	\N
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItem" (id, "orderId", quantity, created_at, "variantId", "affiliateCut", price) FROM stdin;
7	5	1	2026-03-17 08:51:23.154+01	60	0	0
8	6	2	2026-03-17 08:59:16.16+01	57	0	0
9	7	1	2026-03-17 14:14:00.94+01	58	0	0
\.


--
-- Data for Name: Orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Orders" (id, "userId", "stripeId", "paymentRef", "paymentStatus", name, address, zipcode, county, country, "shippingCost", "shippingZone", "estimatedDays", "totalAmount", status, created_at, updated_at, "paymentMethod", shipper, "trackingNumber", "payoutAmount", "labelUrl", "shippingProvider", "shippedAt", "affiliateCut", "affiliateUserId") FROM stdin;
5	e1b39cba-718e-41b0-88bf-6a038e30a211	order_1773737483137_e1b39cba	indix_5_1773737483181	PAID	Joshua	number  kissayip newlayout jebbu bassa	930105	Plateau	NG	0	\N	\N	1470000	DELIVERED	2026-03-17 08:51:23.154+01	2026-03-17 08:58:11.315+01	card	\N	\N	\N	\N	\N	2026-03-17 08:57:37.761	0	\N
6	e1b39cba-718e-41b0-88bf-6a038e30a211	order_1773737956160_e1b39cba	indix_6_1773737956179	PAID	Joshua	number  kissayip newlayout jebbu bassa	930105	Plateau	NG	0	\N	\N	16170000	DELIVERED	2026-03-17 08:59:16.16+01	2026-03-17 09:01:46.444+01	card	\N	\N	\N	\N	\N	2026-03-17 09:01:22.112	0	\N
7	e1b39cba-718e-41b0-88bf-6a038e30a211	order_1773756840917_e1b39cba	\N	UNPAID	Joshua	721 Broadway, New York, NY 10003, USA	10003	New York	US	0	\N	\N	8085000	PENDING	2026-03-17 14:14:00.94+01	2026-03-17 14:14:00.94+01	paypal	\N	\N	\N	\N	\N	\N	0	\N
\.


--
-- Data for Name: PasswordResetToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PasswordResetToken" (id, user_id, token, expires_at, used_at, created_at) FROM stdin;
\.


--
-- Data for Name: Payout; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payout" ("walletId", amount, status, bank_account, transaction_ref, requested_at, completed_at, id) FROM stdin;
992993c1-643c-4805-880d-ab67fe616977	17640000	PENDING	{"bankCode": "214", "bankName": "First City Monument Bank (FCMB)", "accountId": "4e0f5172-98f5-4d52-891d-b2938495c711", "netAmount": 16753000, "accountName": "Joshua Akibu", "platformFee": 882000, "transferFee": 5000, "accountNumber": "2413814015"}	\N	2026-03-17 10:22:00.002	\N	23ceed13-352c-4550-bbef-1ca64037f6fa
\.


--
-- Data for Name: Post; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Post" (id, "authorId", caption, content, "contentType", created_at, visibility, "allowComments") FROM stdin;
9a0edad1-68cb-446f-a7d4-d909bd56ce6f	c476486e-5234-401b-9461-23c03c8b2c3b	Adire is not just fabric — it is identity. This hand-dyed Adire maxi from our Abeokuta collection is speaking to your an	Adire is not just fabric — it is identity. This hand-dyed Adire maxi from our Abeokuta collection is speaking to your ancestors 🌊 Shop link in bio! #Adire #NigerianFashion #LagosStyle	COMMERCE	2026-03-12 14:30:39.736+01	PUBLIC	t
b948af09-fada-46d0-8b46-0b23d0447353	c476486e-5234-401b-9461-23c03c8b2c3b	New arrival! Floral chiffon midi — wear it to church, owambe, or date night. Works everywhere 🌸 10% off this week only,	New arrival! Floral chiffon midi — wear it to church, owambe, or date night. Works everywhere 🌸 10% off this week only, DM to order!	COMMERCE	2026-03-12 14:30:39.766+01	PUBLIC	t
0727040c-b4be-4cfe-b42b-2ee8d6bc4c34	c476486e-5234-401b-9461-23c03c8b2c3b	Three looks, one bag 👜 Our Adire tote goes from the market to the boardroom. Handmade Lagos. Tag a boss babe who needs 	Three looks, one bag 👜 Our Adire tote goes from the market to the boardroom. Handmade Lagos. Tag a boss babe who needs this!	EXPERIENCE	2026-03-12 14:30:39.78+01	PUBLIC	t
82d31526-d91f-4825-ad37-6b9fa84957c0	c476486e-5234-401b-9461-23c03c8b2c3b	👟 Sneaker unboxing! Kene Threads white sneakers — clean, premium, affordable. Naija quality is not a joke 🔥 Watch the 	👟 Sneaker unboxing! Kene Threads white sneakers — clean, premium, affordable. Naija quality is not a joke 🔥 Watch the reel!	COMMERCE	2026-03-12 14:30:39.799+01	PUBLIC	t
34b99789-4cd7-4f4f-b06c-6925f779f787	37232cc8-f85e-48d0-b4b3-3cac43305fdc	Aso-oke season is here 🥹 This handwoven set from our Iseyin collection took 3 weeks to make. Worth every second. DM "AS	Aso-oke season is here 🥹 This handwoven set from our Iseyin collection took 3 weeks to make. Worth every second. DM "ASO" to order yours 💛 #AsoOke #NigerianWedding #AbujaBrides	COMMERCE	2026-03-12 14:30:39.811+01	PUBLIC	t
d2be5313-b310-4b5d-a9bf-020c89b0b3e6	37232cc8-f85e-48d0-b4b3-3cac43305fdc	Ankara never gets old. Period. 🔥 This wrap skirt goes with a simple white tee and block heels. Effortless Naija energy.	Ankara never gets old. Period. 🔥 This wrap skirt goes with a simple white tee and block heels. Effortless Naija energy.	COMMERCE	2026-03-12 14:30:39.824+01	PUBLIC	t
fbc0fb3c-8d24-4180-b6f2-cdf1eb687bc5	37232cc8-f85e-48d0-b4b3-3cac43305fdc	Custom asoebi orders are open! Send your fabric, we handle the rest 🪡 Blouse + skirt + gele — full package available. D	Custom asoebi orders are open! Send your fabric, we handle the rest 🪡 Blouse + skirt + gele — full package available. DM us!	COMMERCE	2026-03-12 14:30:39.849+01	PUBLIC	t
6327a2f5-2dde-4f0c-897d-cdfc2e68bb46	9f666f6a-52a0-4f77-b40c-d849cffffa5d	Agbada season loading... 👀 This grand brocade Agbada is giving father-of-the-year energy and we are not sorry 👑 Availa	Agbada season loading... 👀 This grand brocade Agbada is giving father-of-the-year energy and we are not sorry 👑 Available in 4 colours. Book yours now! #Agbada #NaijaFashion #KeneThreads	COMMERCE	2026-03-12 14:30:39.858+01	PUBLIC	t
8f75c41c-417e-482f-9831-a3efaa3d0620	9f666f6a-52a0-4f77-b40c-d849cffffa5d	Ankara shirt + white trousers = forever winning formula ✅ Simple, sharp, and deeply Nigerian. Shop our menswear collecti	Ankara shirt + white trousers = forever winning formula ✅ Simple, sharp, and deeply Nigerian. Shop our menswear collection 🔗	COMMERCE	2026-03-12 14:30:39.865+01	PUBLIC	t
b40eb938-131f-4540-bcd5-cedb697bd94f	9f666f6a-52a0-4f77-b40c-d849cffffa5d	The senator is always a safe bet 💼 Kaftan + straight leg trousers, hand-embroidered collar. Made in Lagos. Ships nation	The senator is always a safe bet 💼 Kaftan + straight leg trousers, hand-embroidered collar. Made in Lagos. Ships nationwide in 5 days.	COMMERCE	2026-03-12 14:30:39.872+01	PUBLIC	t
f8eaa0a3-610f-4690-9278-76e5c11c95af	bed9f82b-a84c-48e5-8409-75ed43f60db1	Thrift haul just landed! 🛍️ Grade A okrika straight from UK — Levi's, puffer jackets, designer bags. All under ₦15k. La	Thrift haul just landed! 🛍️ Grade A okrika straight from UK — Levi's, puffer jackets, designer bags. All under ₦15k. Lagos girls wake UP 🔔 DM 'THRIFT' to see inventory!	COMMERCE	2026-03-12 14:30:39.877+01	PUBLIC	t
db418b80-fa67-46fd-a26c-7ff944a2d71e	bed9f82b-a84c-48e5-8409-75ed43f60db1	Sustainable fashion is not a trend in Nigeria — it's survival AND style 💚 You can be fine AND budget-conscious. These L	Sustainable fashion is not a trend in Nigeria — it's survival AND style 💚 You can be fine AND budget-conscious. These Levi's are ₦8,500. Yes, ₦8,500.	INSPIRATION	2026-03-12 14:30:39.881+01	PUBLIC	t
459f6399-ba6c-40be-9270-8ae3ab5d6d37	5f5139e9-e690-4278-87f8-a628ec5a519f	Your skin deserves Nigerian goodness 🌿 Our raw shea butter is hand-extracted by women cooperatives in Kaduna. No chemic	Your skin deserves Nigerian goodness 🌿 Our raw shea butter is hand-extracted by women cooperatives in Kaduna. No chemicals, no nonsense. Just pure African butter that works. DM 'SHEA' to order!	COMMERCE	2026-03-12 14:30:39.893+01	PUBLIC	t
faae5419-ba84-4297-9e88-2d3b23aaac0a	5f5139e9-e690-4278-87f8-a628ec5a519f	Ose Dudu cleared my skin in 3 weeks 🧼✨ Nigerian black soap is not a secret anymore — it is science. Made with cocoa pod	Ose Dudu cleared my skin in 3 weeks 🧼✨ Nigerian black soap is not a secret anymore — it is science. Made with cocoa pod ash and palm kernel oil from Ibadan. Shop below 👇	COMMERCE	2026-03-12 14:30:39.904+01	PUBLIC	t
28892275-f3d5-4b89-bb22-e27410e4247e	5f5139e9-e690-4278-87f8-a628ec5a519f	Waist beads are a love language 💕 Hand-strung with Czech glass beads and real cowrie shells. 12 colour combos available	Waist beads are a love language 💕 Hand-strung with Czech glass beads and real cowrie shells. 12 colour combos available. Your waist will thank you 🙏 #WaistBeads #NigerianJewelry	COMMERCE	2026-03-12 14:30:39.911+01	PUBLIC	t
3dc6fa03-f01b-45d5-9aaf-e233f658fa9c	5f5139e9-e690-4278-87f8-a628ec5a519f	Aba leather is THAT girl 👡 Made by skilled Aba artisans — these sandals are durable, handcrafted, and 100% Naija. Suppo	Aba leather is THAT girl 👡 Made by skilled Aba artisans — these sandals are durable, handcrafted, and 100% Naija. Support local and look better doing it! Reel coming soon 🎥	COMMERCE	2026-03-12 14:30:39.919+01	PUBLIC	t
3720ddfa-ebee-455b-99ea-f42949d43dab	84cbe55d-f6dd-4d16-9bb6-6ffe1ddc6d3f	Lagos fashion is on another level bro 🔥 Shout out to @kene_threads for this fit — Ankara shirt hits different. Naija ma	Lagos fashion is on another level bro 🔥 Shout out to @kene_threads for this fit — Ankara shirt hits different. Naija made, globally worn 🇳🇬 #LagosStreetStyle #NigerianFashion	INSPIRATION	2026-03-12 14:30:39.926+01	PUBLIC	t
c836ae29-7134-4a67-94e4-e656cf2c45ad	2b76f00d-ef5a-4cc2-912c-616517d84d90	POV: Your asoebi just arrived and it is EVERYTHING 🥹💛 Thank you @amara_couture for this masterpiece. The embroidery de	POV: Your asoebi just arrived and it is EVERYTHING 🥹💛 Thank you @amara_couture for this masterpiece. The embroidery details are chef's kiss 😭	EXPERIENCE	2026-03-12 14:30:39.932+01	PUBLIC	t
3491c52b-b3b4-4cc0-9710-b4cffa5ee2b4	bb084c97-1310-4298-bb1c-48c20a697969	Agbada on a Tuesday because why not 😤👑 Naija men, stop sleeping on traditional wear. It is always the right time.	Agbada on a Tuesday because why not 😤👑 Naija men, stop sleeping on traditional wear. It is always the right time.	INSPIRATION	2026-03-12 14:30:39.94+01	PUBLIC	t
db3a45f5-aa47-4d63-98d7-3cbbe7c707ad	4e785386-7129-4386-828f-25addc8cc24d	Black soap + shea butter combo from @temi_beauty changed my skincare routine completely 🌿 Nigerian ingredients for Nige	Black soap + shea butter combo from @temi_beauty changed my skincare routine completely 🌿 Nigerian ingredients for Nigerian skin — makes sense!	EXPERIENCE	2026-03-12 14:30:39.946+01	PUBLIC	t
4aa05e46-030a-4c52-a751-103b8239d05d	5d330ec2-29f7-478f-8136-16d520bfd297	Cold guy certified 🥶 White sneakers from @kene_threads, Ankara shorts from @amara_couture. Whole fit is under ₦50k. Bud	Cold guy certified 🥶 White sneakers from @kene_threads, Ankara shorts from @amara_couture. Whole fit is under ₦50k. Budget fashionista check ✅	INSPIRATION	2026-03-12 14:30:39.952+01	PUBLIC	t
f3788904-5611-450a-952c-0e15dda7f36f	ad8255a8-58bb-4dfb-8d7d-298219a01c91	\N		EDUCATIONAL	2026-03-14 09:56:16.715+01	PUBLIC	t
97b4f3f2-9dbd-4bcc-bb19-10fbb425321b	e1b39cba-718e-41b0-88bf-6a038e30a211	\N		EXPERIENCE	2026-03-15 13:46:06.507+01	PUBLIC	t
\.


--
-- Data for Name: PostLike; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PostLike" ("userId", "postId", created_at) FROM stdin;
ad8255a8-58bb-4dfb-8d7d-298219a01c91	f3788904-5611-450a-952c-0e15dda7f36f	2026-03-14 09:57:18.994
e1b39cba-718e-41b0-88bf-6a038e30a211	f3788904-5611-450a-952c-0e15dda7f36f	2026-03-14 11:28:23.934
e1b39cba-718e-41b0-88bf-6a038e30a211	97b4f3f2-9dbd-4bcc-bb19-10fbb425321b	2026-03-15 13:46:26.2
ad8255a8-58bb-4dfb-8d7d-298219a01c91	97b4f3f2-9dbd-4bcc-bb19-10fbb425321b	2026-03-16 06:27:52.24
\.


--
-- Data for Name: ProductCategories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductCategories" ("productId", "categoryId") FROM stdin;
1	1
1	10
2	1
3	7
4	1
4	10
5	1
5	10
6	1
7	2
7	10
8	2
8	10
9	2
9	10
10	3
11	11
11	2
12	11
12	4
13	11
14	6
15	6
16	5
16	10
17	4
17	10
18	3
18	10
19	2
20	1
21	1
22	1
\.


--
-- Data for Name: ProductOffer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductOffer" (id, "productId", "minQuantity", discount, label, "isActive", created_at) FROM stdin;
1	22	3	10	Buy 3, get 10% off	t	2026-03-16 09:58:22.55+01
\.


--
-- Data for Name: ProductPostTag; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductPostTag" ("productId", "postId") FROM stdin;
1	9a0edad1-68cb-446f-a7d4-d909bd56ce6f
2	b948af09-fada-46d0-8b46-0b23d0447353
4	34b99789-4cd7-4f4f-b06c-6925f779f787
5	d2be5313-b310-4b5d-a9bf-020c89b0b3e6
7	6327a2f5-2dde-4f0c-897d-cdfc2e68bb46
8	8f75c41c-417e-482f-9831-a3efaa3d0620
9	b40eb938-131f-4540-bcd5-cedb697bd94f
11	f8eaa0a3-610f-4690-9278-76e5c11c95af
14	459f6399-ba6c-40be-9270-8ae3ab5d6d37
15	faae5419-ba84-4297-9e88-2d3b23aaac0a
16	28892275-f3d5-4b89-bb22-e27410e4247e
18	3dc6fa03-f01b-45d5-9aaf-e233f658fa9c
19	f3788904-5611-450a-952c-0e15dda7f36f
\.


--
-- Data for Name: ProductRelation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductRelation" ("styledWithId", "appearsInId") FROM stdin;
\.


--
-- Data for Name: ProductTags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductTags" ("productId", "tagId") FROM stdin;
\.


--
-- Data for Name: ProductVariant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductVariant" (id, size, stock, price, "productId") FROM stdin;
1	S	5	\N	1
2	M	8	\N	1
3	L	6	\N	1
4	XL	3	\N	1
5	S	8	\N	2
6	M	12	\N	2
7	L	5	\N	2
8	XL	3	\N	2
10	S/M	4	\N	4
11	L/XL	4	\N	4
12	Custom	10	\N	4
13	S-M	15	\N	5
14	L-XL	12	\N	5
15	Custom	20	\N	6
16	S	3	\N	7
17	M	5	\N	7
18	L	5	\N	7
19	XL	3	\N	7
20	XXL	2	\N	7
21	S	6	\N	8
22	M	10	\N	8
23	L	8	\N	8
24	XL	4	\N	8
25	M	5	\N	9
26	L	7	\N	9
27	XL	4	\N	9
28	XXL	2	\N	9
29	40	4	\N	10
30	41	8	\N	10
31	42	6	\N	10
32	43	3	\N	10
33	44	2	\N	10
34	W30/L30	1	\N	11
35	W32/L32	2	\N	11
36	W34/L32	1	\N	11
37	One Set	8	\N	12
38	M	3	\N	13
39	L	4	\N	13
40	XL	2	\N	13
41	500g	30	2500	14
42	1kg	25	\N	14
43	2kg	10	8500	14
44	150g	50	\N	15
45	300g (2-pack)	30	5000	15
46	S (25-30")	20	\N	16
47	M (31-36")	20	\N	16
48	L (37-42")	15	\N	16
50	37	5	\N	18
51	38	8	\N	18
52	39	10	\N	18
53	40	7	\N	18
54	41	4	\N	18
55	UK sizes 6, 7, 8	20	\N	20
56	US sizes 32, 34, 36	15	\N	20
49	One Size	16	\N	17
9	One Size	24	\N	3
59	UK, US sizes 6, 32	7	\N	22
60	UK, US sizes 9, 34	13	\N	22
57	UK Sizes 6 | 9 | 12	16	\N	21
58	US Sizes 32 | 34 | 36	18	\N	21
\.


--
-- Data for Name: Products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Products" (id, title, slug, description, price, discount, status, "sellerId", created_at, updated_at, "soldCount", "averageRating", "totalReviews", "isFeatured", "bannerImageUrl", "SKU", "isAccessory", store_slug, "isThrift", "affiliateCommission", "socialCaptions") FROM stdin;
1	Adire Tie-Dye Maxi Dress	adire-tie-dye-maxi-dress	Handcrafted Adire fabric maxi dress made by Yoruba artisans in Abeokuta, Ogun State. Each piece is unique — no two are identical. 100% cotton, breathable and perfect for the Lagos heat. Hand-wash recommended.	22000	0	PUBLISHED	6ec37f21-056a-490c-8e4a-df3c45039e1c	2026-03-12 14:30:39.272+01	2026-03-12 14:30:39.272+01	0	\N	0	t	https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80	\N	f	ada-styles	f	2000	\N
2	Floral Chiffon Midi Dress	floral-chiffon-midi-dress	Elegant floral chiffon midi dress. Perfect for owambe, Sunday service, or any formal event. Lined, with invisible zip at back. Machine washable on gentle cycle.	18500	10	PUBLISHED	6ec37f21-056a-490c-8e4a-df3c45039e1c	2026-03-12 14:30:39.326+01	2026-03-12 14:30:39.326+01	0	\N	0	t	https://images.unsplash.com/photo-1583267702009-a325834bfa47?auto=format&fit=crop&w=800&q=80	\N	f	ada-styles	f	1500	\N
3	Gold-Plated Beaded Choker	gold-beaded-choker	18K gold-plated choker with hand-threaded Nigerian trade beads. Hypoallergenic. Adjustable length 30–40cm. Perfect gift. Ships in branded jewel box.	8500	0	PUBLISHED	6ec37f21-056a-490c-8e4a-df3c45039e1c	2026-03-12 14:30:39.358+01	2026-03-12 14:30:39.358+01	0	\N	0	f	https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80	\N	t	ada-styles	f	700	\N
4	Aso-oke Gele & Iro Set	asoke-gele-iro-set	Premium hand-woven Aso-oke 3-piece set (Gele, Iro, Buba) from Iseyin weavers, Oyo State. Available in gold, red, blue, and green. Traditionally worn at Yoruba weddings and naming ceremonies. Made to order — allow 7 days.	55000	0	PUBLISHED	b02a209e-dab7-4888-a0fb-a05924b5d16d	2026-03-12 14:30:39.373+01	2026-03-12 14:30:39.373+01	0	\N	0	t	https://images.unsplash.com/photo-1594938298603-3e70e6ccc4c3?auto=format&fit=crop&w=800&q=80	\N	f	amara-couture	f	5000	\N
5	Ankara Wrap Skirt	ankara-wrap-skirt	Bold 6-yard Ankara print wrap skirt with elastic waistband. One size fits most. Fabric sourced from Balogun Market, Lagos. Pairs perfectly with a plain crop top or fitted blouse.	9500	0	PUBLISHED	b02a209e-dab7-4888-a0fb-a05924b5d16d	2026-03-12 14:30:39.412+01	2026-03-12 14:30:39.412+01	0	\N	0	f	https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80	\N	f	amara-couture	f	800	\N
6	Custom Asoebi Lace Blouse	custom-asoebi-lace-blouse	Tailored Swiss lace blouse with puff sleeves and back zip. Send us your measurements and fabric for a fully custom piece. Ships within 10 working days. Price is for tailoring only — fabric not included.	28000	0	PUBLISHED	b02a209e-dab7-4888-a0fb-a05924b5d16d	2026-03-12 14:30:39.443+01	2026-03-12 14:30:39.443+01	0	\N	0	f	https://images.unsplash.com/photo-1590794056226-f6a7c1b70d79?auto=format&fit=crop&w=800&q=80	\N	f	amara-couture	f	2500	\N
7	Grand Agbada 3-Piece Set	grand-agbada-3-piece	Luxurious Agbada set (Agbada, Sokoto, Buba) in premium brocade fabric with hand embroidery. Available in cream, navy, burgundy, and royal blue. Ideal for weddings, chieftaincy titles, and formal events. Fully tailored to your measurements.	85000	0	PUBLISHED	54bb37d2-f58b-417b-8760-49a4c73aaf65	2026-03-12 14:30:39.462+01	2026-03-12 14:30:39.462+01	0	\N	0	t	https://images.unsplash.com/photo-1516257984-08fe4fad0f76?auto=format&fit=crop&w=800&q=80	\N	f	kene-threads	f	8000	\N
8	Men's Ankara Print Shirt	mens-ankara-print-shirt	Bold Ankara fabric dress shirt with modern slim cut. Suitable for formal and smart-casual events. Made from 100% cotton Ankara fabric sourced from Balogun Market, Lagos. Machine washable, colour-fast.	14000	0	PUBLISHED	54bb37d2-f58b-417b-8760-49a4c73aaf65	2026-03-12 14:30:39.487+01	2026-03-12 14:30:39.487+01	0	\N	0	f	https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80	\N	f	kene-threads	f	1200	\N
9	Kaftan & Trouser Set	kaftan-trouser-set	Premium senator kaftan with matching straight-leg trousers. Embroidered collar and cuffs. Classic Nigerian senator style. Suitable for Eid, Sunday service, or any formal event.	38000	5	PUBLISHED	54bb37d2-f58b-417b-8760-49a4c73aaf65	2026-03-12 14:30:39.51+01	2026-03-12 14:30:39.51+01	0	\N	0	f	https://images.unsplash.com/photo-1516257984-08fe4fad0f76?auto=format&fit=crop&w=800&q=80	\N	f	kene-threads	f	3500	\N
10	Classic White Sneakers	classic-white-sneakers	Clean, minimalist white leather sneakers. Comfortable padded insole for all-day wear. Goes with jeans, chinos, Ankara, or agbada. Genuine leather upper, rubber outsole.	32000	5	PUBLISHED	54bb37d2-f58b-417b-8760-49a4c73aaf65	2026-03-12 14:30:39.543+01	2026-03-12 14:30:39.543+01	0	\N	0	f	https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80	\N	f	kene-threads	f	2500	\N
11	Thrift Levi's 501 Jeans	thrift-levis-501-jeans	Pre-loved Levi's 501 original fit jeans in excellent condition. Grade A okrika. Vintage wash, minimal wear. Sourced from UK. Sustainable fashion at its finest.	8500	0	PUBLISHED	7e7bdba6-2275-4c7c-9eb4-59a96563e6ba	2026-03-12 14:30:39.558+01	2026-03-12 14:30:39.558+01	0	\N	0	f	https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80	\N	f	funmi-thrift-hub	t	\N	\N
12	Grade A Designer Handbag Bundle	grade-a-designer-bag-bundle	Bundle of 2 grade A okrika designer-style handbags. Sourced from Canada. Includes structured tote and crossbody. Perfect condition — no stains, no tears. Sold as a set.	15000	0	PUBLISHED	7e7bdba6-2275-4c7c-9eb4-59a96563e6ba	2026-03-12 14:30:39.589+01	2026-03-12 14:30:39.589+01	0	\N	0	f	https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80	\N	f	funmi-thrift-hub	t	1000	\N
13	Thrift Winter Puffer Jacket	thrift-puffer-jacket	Grade A okrika puffer jacket from US. Heavy insulation — great for harmattan season or UK/Canada diaspora. Available in black and olive. Condition: 9/10.	12000	0	PUBLISHED	7e7bdba6-2275-4c7c-9eb4-59a96563e6ba	2026-03-12 14:30:39.625+01	2026-03-12 14:30:39.625+01	0	\N	0	f	https://images.unsplash.com/photo-1489987707849-2d0a0b8bcd1e?auto=format&fit=crop&w=800&q=80	\N	f	funmi-thrift-hub	t	\N	\N
14	Raw African Shea Butter (1kg)	raw-african-shea-butter-1kg	Unrefined raw shea butter hand-extracted by women cooperatives in Kaduna State, Nigeria. No additives, no fragrance. Rich in Vitamins A, E & F. Excellent for skin, hair, and nails. Free from bleaching agents.	4500	0	PUBLISHED	8dc0e86a-8d52-483c-9cca-f48953bcb190	2026-03-12 14:30:39.652+01	2026-03-12 14:30:39.652+01	0	\N	0	t	https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80	\N	f	temi-beauty	f	400	\N
15	Nigerian Black Soap Bar (Ose Dudu)	nigerian-black-soap-ose-dudu	Authentic Yoruba black soap (Ose Dudu) hand-made with cocoa pod ash, plantain skin ash, palm kernel oil, and shea butter. Excellent for acne, eczema, and hyperpigmentation. Sourced from Ibadan cooperatives.	2800	0	PUBLISHED	8dc0e86a-8d52-483c-9cca-f48953bcb190	2026-03-12 14:30:39.675+01	2026-03-12 14:30:39.675+01	0	\N	0	f	https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80	\N	f	temi-beauty	f	250	\N
16	Handmade Nigerian Waist Beads	handmade-nigerian-waist-beads	Hand-strung traditional Nigerian waist beads made with Czech glass beads and cowrie shells. Available in 12 colour combinations. Tied style — measure your waist and select size. Spiritual and fashion statement in one.	3500	0	PUBLISHED	8dc0e86a-8d52-483c-9cca-f48953bcb190	2026-03-12 14:30:39.688+01	2026-03-12 14:30:39.688+01	0	\N	0	f	https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80	\N	t	temi-beauty	f	300	\N
17	Adire Fabric Tote Bag	adire-fabric-tote-bag	Large canvas tote bag with Adire (Yoruba tie-dye) exterior. Handmade in Lagos. Fully lined, with inner zip pocket. Fits A4 size documents + gym kit. Reinforced handles. Each bag is unique.	7500	0	PUBLISHED	8dc0e86a-8d52-483c-9cca-f48953bcb190	2026-03-12 14:30:39.7+01	2026-03-12 14:30:39.7+01	0	\N	0	f	https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80	\N	f	temi-beauty	f	650	\N
18	Leather Sandals (Aba-made)	leather-sandals-aba-made	Handcrafted genuine leather sandals made by artisans in Aba, Abia State — Nigeria's leather craft capital. Durable, comfortable, and fully adjustable ankle strap. Available in tan and black.	16500	0	PUBLISHED	8dc0e86a-8d52-483c-9cca-f48953bcb190	2026-03-12 14:30:39.72+01	2026-03-12 14:30:39.72+01	0	\N	0	t	https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80	\N	f	temi-beauty	f	1500	\N
19	Chris Hardy Oxford shoes	chris-hardy-oxford-shoes	Oxford shoes are formal, low-heeled lace-up dress shoes defined by a "closed lacing" system, where the shoelace eyelet tabs are stitched underneath the front vamp. Originating from 19th-century university students, they are known for their sleek, elegant, and minimal design, typically made of leather, with common variations including cap-toes, brogues, and wingtips.	150000	0	PUBLISHED	772d0b6e-5fdc-41a8-9317-1ffba3c70e08	2026-03-12 14:41:54.322+01	2026-03-12 14:41:54.322+01	0	\N	0	f	https://res.cloudinary.com/dcci05bzj/image/upload/v1773326424/reelshop/chris-hardy-Z1iW6KNf2Yc-unsplash_rosbec.jpg	\N	f	swankyshoes	f	2000	\N
20	Chic African Print Shift Dress	chic-african-print-shift-dress	Discover elegance and comfort with this vibrant African print shift dress. Crafted from high-quality Ankara fabric, this dress features a bold geometric pattern that's perfect for any occasion. Whether you're attending a casual outing or a sophisticated evening event, this stylish piece offers versatility and flair. The relaxed fit ensures comfort, while the sleek faux leather panel adds a contemporary touch. Step out in style with this must-have wardrobe staple.	82500	0	DRAFT	c4738142-6259-4c5f-96d2-7f770517be3f	2026-03-14 15:45:18.163+01	2026-03-14 15:45:18.163+01	0	\N	0	f	https://res.cloudinary.com/dcci05bzj/image/upload/v1773503045/reelshop/abaya13_fxoezo.jpg	\N	f	grandeur-wears-and-abaya	f	\N	{"facebook": "Ready to turn heads? 🌟 Check out our stunning African print shift dress, perfect for any occasion! This piece not only offers comfort with its relaxed fit but also makes a bold statement with its striking geometric pattern and chic faux leather panel. At just ₦25,000, this fashion staple won't last long. DM to order! Shop Now and embrace your unique style today!", "instagram": "Stand out in stunning style! 🌟 Elevate your wardrobe with our vibrant African print shift dress. Perfect for every occasion, this piece blends tradition with modern trends. 💫 Feel confident and chic wherever you go! ✨🔥 Tap to shop now and make it yours! . . . . . . #AfricanFashion #AnkaraStyle #BoldFashion #WardrobeGoals #FashionInspo #ElevateYourStyle #ChicAndTrendy #VersatileFashion #Fashionista #StyleQueen #TrendyVibes #OutfitOfTheDay #StyleStatement #FashionAddict #FashionForward #DressToImpress #GeometricPrint #ModernElegance #EffortlessStyle #FauxLeather #WeekendVibes", "pinterest": "Embrace bold style with our African print shift dress, featuring a striking geometric design and modern faux leather panel. Perfect for transitional day-to-night looks and a range of occasions. Enhance your wardrobe with this versatile piece. African fashion, Ankara dress, shift dress style, bold prints, geometric patterns, day-to-night fashion, contemporary African wear."}
21	Vibrant Ankara Midi Dress with Contrast	vibrant-ankara-midi-dress-with-contrast	Step out in style with this stunning Ankara midi dress, featuring a vibrant geometric pattern combined with a contrasting black overlay for an eye-catching look. Crafted from high-quality, breathable cotton fabric, it's perfect for any occasion—be it a casual outing or a chic event. The dress boasts a relaxed fit, short sleeves, and hits at the knee, ensuring both comfort and flair. Pair it with your favorite heels and accessories for a complete ensemble that turns heads.	82500	2	PUBLISHED	c4738142-6259-4c5f-96d2-7f770517be3f	2026-03-14 15:50:11.27+01	2026-03-14 15:50:11.27+01	0	\N	0	f	https://res.cloudinary.com/dcci05bzj/image/upload/v1773503289/reelshop/abaya11_xcpuue.jpg	\N	f	grandeur-wears-and-abaya	f	3000	{"facebook": "Looking to refresh your wardrobe with something unique? This vibrant Ankara midi dress is your answer! With its striking pattern and comfortable fit, it's perfect for any occasion. Available for just ₦ inquire about yours today! DM us to order and make your fashion statement.\\nShop now and bring your style to life!", "instagram": "Make a statement! 🌟 Embrace the bold colors and unique design of this Ankara midi dress. Perfect for making an impression no matter where you go! 👜✨ Add it to your wardrobe now and elevate your style game effortlessly. \\n#FashionForward #AnkaraStyle #BoldPatterns #ModernChic #StyleInspo #OutfitGoals #AnkaraFashion #TrendyLook #AfricanFashion #FashionistaLife #ChicOutfit #StyleInspiration", "pinterest": "Discover the allure of African prints with this striking Ankara midi dress. Perfect for both casual outings and special events, its cotton fabric ensures comfort and style. Elevate your fashion game with this must-have piece, embracing bold patterns and elegant design. African fashion, Ankara dress inspiration, vivid style, cotton midi dress, chic and modern."}
22	Vibrant Tribal Print Kaftan Dress	vibrant-tribal-print-kaftan-dress	Step into elegance with this vibrant tribal print kaftan dress, perfect for any casual or festive occasion. Made from premium-quality, breathable cotton, this dress offers both comfort and style. Its flowing silhouette, paired with a striking mix of blue and earthy tones, embraces traditional African aesthetics. The V-neckline and loose fit make it flattering for all body types. Ideal for cultural events, relaxed weekends, or a chic day out.	15000	2	PUBLISHED	c4738142-6259-4c5f-96d2-7f770517be3f	2026-03-16 08:30:05.236+01	2026-03-16 09:58:22.55+01	0	\N	0	f	https://res.cloudinary.com/dcci05bzj/image/upload/v1773649744/reelshop/NABY5977_fsxajr.jpg	\N	f	grandeur-wears-and-abaya	f	3000	{"facebook": "Looking to add a touch of elegance to your wardrobe? This vibrant Tribal Print Kaftan is a must-have! 🌟 Priced at just ₦, it’s the perfect blend of comfort and cultural style. Whether you're heading out for a casual day or a festive event, this dress will make you stand out effortlessly. Shop now and make it yours today! DM to order.", "instagram": "🌟 Elevate your style with our stunning Tribal Print Kaftan! 🌟 Effortless elegance meets cultural richness in this eye-catching piece, perfect for any occasion. 👗👌 Made from premium cotton for ultimate comfort. Get ready to turn heads and embrace the vibrant colors of heritage! 💙✌️ Available now - don't miss out! . . . #AfricanFashion #EthnicWear #StyleInspiration #CulturalElegance #KaftanLove #Fashionista #VibrantColors #AfricanStyles #TrendyLooks #ComfortableChic #FashionGoals #OOTD #StyleStatement #TraditionalVibes #BoldPatterns #FashionForward #TrendingNow #FashionAddict #WardrobeEssentials #ChicOutfits #CulturalStyle #StatementPiece #TrendAlert", "pinterest": "Capture attention with this Vibrant Tribal Print Kaftan Dress, a perfect blend of comfort and cultural flair. Ideal for casual outings or festive events, made from soft cotton. Embrace the trend with this eye-catching pattern. African fashion, tribal print dress, cotton kaftan, casual elegance, festive style, cultural clothing."}
\.


--
-- Data for Name: Profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Profile" (id, email, role, avatar, username, password_hash, created_at, updated_at, email_verified_at, email_verified, bio, location, links, "affiliateCode") FROM stdin;
c476486e-5234-401b-9461-23c03c8b2c3b	ada@peppr.test	user	https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&h=200&q=80	ada_styles	$argon2id$v=19$m=65536,t=3,p=4$ScVAFc5FQ3CSLZXQsgwxjw$BIHg9EsfCNqZWjn+YaRmI61yZDKZ5QKvF86CnEWT6Kc	2026-03-12 14:30:39.034+01	2026-03-12 14:30:39.034+01	2026-03-12 14:30:39.031+01	t	Fashion seller & creator 🛍️ Lagos Island | DM to order	\N	\N	\N
37232cc8-f85e-48d0-b4b3-3cac43305fdc	amara@peppr.test	user	https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80	amara_couture	$argon2id$v=19$m=65536,t=3,p=4$ScVAFc5FQ3CSLZXQsgwxjw$BIHg9EsfCNqZWjn+YaRmI61yZDKZ5QKvF86CnEWT6Kc	2026-03-12 14:30:39.039+01	2026-03-12 14:30:39.039+01	2026-03-12 14:30:39.039+01	t	Abuja's finest womenswear 👗 Custom designs & ready-to-wear	\N	\N	\N
9f666f6a-52a0-4f77-b40c-d849cffffa5d	kene@peppr.test	user	https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80	kene_threads	$argon2id$v=19$m=65536,t=3,p=4$ScVAFc5FQ3CSLZXQsgwxjw$BIHg9EsfCNqZWjn+YaRmI61yZDKZ5QKvF86CnEWT6Kc	2026-03-12 14:30:39.052+01	2026-03-12 14:30:39.052+01	2026-03-12 14:30:39.051+01	t	Premium menswear Lagos 🧔🏾 Agbada | Ankara | Streetwear	\N	\N	\N
bed9f82b-a84c-48e5-8409-75ed43f60db1	funmi@peppr.test	user	https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200&q=80	funmi_thrift	$argon2id$v=19$m=65536,t=3,p=4$ScVAFc5FQ3CSLZXQsgwxjw$BIHg9EsfCNqZWjn+YaRmI61yZDKZ5QKvF86CnEWT6Kc	2026-03-12 14:30:39.061+01	2026-03-12 14:30:39.061+01	2026-03-12 14:30:39.06+01	t	Thrift plug for designer finds 🏷️ Yaba | Lagos | Ship nationwide	\N	\N	\N
5f5139e9-e690-4278-87f8-a628ec5a519f	temi@peppr.test	user	https://images.unsplash.com/photo-1524504388424-b2ef864c4cd5?auto=format&fit=crop&w=200&h=200&q=80	temi_beauty	$argon2id$v=19$m=65536,t=3,p=4$ScVAFc5FQ3CSLZXQsgwxjw$BIHg9EsfCNqZWjn+YaRmI61yZDKZ5QKvF86CnEWT6Kc	2026-03-12 14:30:39.067+01	2026-03-12 14:30:39.067+01	2026-03-12 14:30:39.066+01	t	Natural Nigerian beauty 🌿 Shea | Adire | Handmade jewels	\N	\N	\N
84cbe55d-f6dd-4d16-9bb6-6ffe1ddc6d3f	chidi@peppr.test	user	https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80	chidi_m	$argon2id$v=19$m=65536,t=3,p=4$ScVAFc5FQ3CSLZXQsgwxjw$BIHg9EsfCNqZWjn+YaRmI61yZDKZ5QKvF86CnEWT6Kc	2026-03-12 14:30:39.074+01	2026-03-12 14:30:39.074+01	2026-03-12 14:30:39.073+01	t	Lagos fashion lover 🔥 Street style & culture	\N	\N	\N
2b76f00d-ef5a-4cc2-912c-616517d84d90	sade@peppr.test	user	https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80	sade_vibes	$argon2id$v=19$m=65536,t=3,p=4$ScVAFc5FQ3CSLZXQsgwxjw$BIHg9EsfCNqZWjn+YaRmI61yZDKZ5QKvF86CnEWT6Kc	2026-03-12 14:30:39.08+01	2026-03-12 14:30:39.08+01	2026-03-12 14:30:39.079+01	t	Asoebi goals ✨ Lagos | PHC | Abuja	\N	\N	\N
bb084c97-1310-4298-bb1c-48c20a697969	emeka@peppr.test	user	https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80	emeka_fits	$argon2id$v=19$m=65536,t=3,p=4$ScVAFc5FQ3CSLZXQsgwxjw$BIHg9EsfCNqZWjn+YaRmI61yZDKZ5QKvF86CnEWT6Kc	2026-03-12 14:30:39.085+01	2026-03-12 14:30:39.085+01	2026-03-12 14:30:39.085+01	t	Naija street style 🇳🇬 Agbada on weekends	\N	\N	\N
4e785386-7129-4386-828f-25addc8cc24d	ngozi@peppr.test	user	https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80	ngozi_nneka	$argon2id$v=19$m=65536,t=3,p=4$ScVAFc5FQ3CSLZXQsgwxjw$BIHg9EsfCNqZWjn+YaRmI61yZDKZ5QKvF86CnEWT6Kc	2026-03-12 14:30:39.091+01	2026-03-12 14:30:39.091+01	2026-03-12 14:30:39.089+01	t	Entrepreneur | Style | Inspiration 💫	\N	\N	\N
5d330ec2-29f7-478f-8136-16d520bfd297	bayo@peppr.test	user	https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&h=200&q=80	bayo_cold	$argon2id$v=19$m=65536,t=3,p=4$ScVAFc5FQ3CSLZXQsgwxjw$BIHg9EsfCNqZWjn+YaRmI61yZDKZ5QKvF86CnEWT6Kc	2026-03-12 14:30:39.107+01	2026-03-12 14:30:39.107+01	2026-03-12 14:30:39.105+01	t	Cold guy energy 🥶 Fashion & music	\N	\N	\N
e1b39cba-718e-41b0-88bf-6a038e30a211	justsvy@gmail.com	user	\N	justsvy	$argon2id$v=19$m=19456,t=2,p=1$HgklSrJ5v559/Kt6WZnZ/g$LjQT4ICUJxERMoQ/FZLZcnOvXsdyc+jqtE46H8Hsiks	2026-03-14 11:28:01.605+01	2026-03-18 10:00:12.991+01	\N	f	\N	\N	\N	justsvy_bfed65
ad8255a8-58bb-4dfb-8d7d-298219a01c91	control.grandeur@gmail.com	seller	\N	grandeur	$argon2id$v=19$m=19456,t=2,p=1$rg3vsNqoMcy8ly388ZnNzQ$nHHSsuqSOtMzs7vwGauPXTBAV1xXPgaDvWI8AfQ5Gkc	2026-03-12 14:37:32.199+01	2026-03-18 10:01:19.078+01	\N	f	\N	\N	\N	grandeur_d7ac88
\.


--
-- Data for Name: SavedPost; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SavedPost" (id, "userId", "postId", "createdAt") FROM stdin;
288a356c-f540-4854-b478-331597eb2f82	ad8255a8-58bb-4dfb-8d7d-298219a01c91	4aa05e46-030a-4c52-a751-103b8239d05d	2026-03-14 12:08:48.905+01
8092cc82-7b2a-402a-80c3-69ee5b9d99f8	e1b39cba-718e-41b0-88bf-6a038e30a211	97b4f3f2-9dbd-4bcc-bb19-10fbb425321b	2026-03-18 09:26:13.504+01
\.


--
-- Data for Name: SellerProfile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SellerProfile" (id, "profileId", store_name, store_description, store_logo, store_banner, store_location, store_phone, store_website, store_socials, followers_count, is_verified, is_active, verification_status, verification_reason, created_at, updated_at, store_slug, auto_answer_enabled, default_currency, "shipFromName", "shipFromAddress", "shipFromCity", "shipFromState", "shipFromZip", "shipFromCountry", "shipFromPhone") FROM stdin;
54bb37d2-f58b-417b-8760-49a4c73aaf65	9f666f6a-52a0-4f77-b40c-d849cffffa5d	Kene Threads	Lagos menswear specialists. Agbada, Ankara shirts, Kaftan, streetwear. Ship nationwide.	https://images.unsplash.com/photo-1516257984-08fe4fad0f76?auto=format&fit=crop&w=200&h=200&q=80	https://images.unsplash.com/photo-1594938298603-3e70e6ccc4c3?auto=format&fit=crop&w=1200&h=400&q=80	\N	\N	\N	\N	0	f	t	PENDING	\N	2026-03-12 14:30:39.16+01	2026-03-14 12:01:20.669+01	kene-threads	f	NGN	\N	\N	\N	\N	\N	NG	\N
c4738142-6259-4c5f-96d2-7f770517be3f	ad8255a8-58bb-4dfb-8d7d-298219a01c91	Grandeur Wears and Abaya	"Discover, Share, and Elevate Your Style with Beautiful Styles Magazine !Your fashion journey starts here. 🛍️👠🌟 #FashionInspo #StyleCommunity"	https://res.cloudinary.com/dcci05bzj/image/upload/v1773501071/reelshop/grandior_v2jhtf.png	https://res.cloudinary.com/dcci05bzj/image/upload/v1773501047/reelshop/grandeur-abaya-logo_dqeekd.jpg	Lagos | Abuja | Port Hartcort | Jos | Ibadan	+2349041726817	https://www.grandeurwearsandabaya.com	\N	1	f	f	PENDING	\N	2026-03-14 15:14:57.572+01	2026-03-18 10:27:40.431+01	grandeur-wears-and-abaya	f	NGN	Grandeur Wears and Abaya	Suite 13 Goodwill shopping plaza, Mokola Ibadan	Ibadan	Oyo	200001	NG	+2349041726817
8dc0e86a-8d52-483c-9cca-f48953bcb190	5f5139e9-e690-4278-87f8-a628ec5a519f	Temi Beauty	All-natural Nigerian beauty. Raw shea butter, black soap, Adire accessories & handmade beaded jewelry.	https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=200&h=200&q=80	https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&h=400&q=80	\N	\N	\N	\N	0	t	t	VERIFIED	\N	2026-03-12 14:30:39.188+01	2026-03-14 12:01:20.669+01	temi-beauty	f	NGN	\N	\N	\N	\N	\N	NG	\N
b02a209e-dab7-4888-a0fb-a05924b5d16d	37232cc8-f85e-48d0-b4b3-3cac43305fdc	Amara Couture	Abuja's finest womenswear. Custom Ankara, Aso-oke sets, and ready-to-wear designs. Free alterations.	https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=200&h=200&q=80	https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&h=400&q=80	\N	\N	\N	\N	0	t	t	VERIFIED	\N	2026-03-12 14:30:39.147+01	2026-03-14 12:01:20.669+01	amara-couture	f	NGN	\N	\N	\N	\N	\N	NG	\N
7e7bdba6-2275-4c7c-9eb4-59a96563e6ba	bed9f82b-a84c-48e5-8409-75ed43f60db1	Funmi's Thrift Hub	Grade A thrift clothing sourced from UK, US & Canada. Designer finds at Naija prices. Yaba, Lagos.	https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80	https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&h=400&q=80	\N	\N	\N	\N	2	f	t	PENDING	\N	2026-03-12 14:30:39.174+01	2026-03-14 12:02:06.098+01	funmi-thrift-hub	f	NGN	\N	\N	\N	\N	\N	NG	\N
772d0b6e-5fdc-41a8-9317-1ffba3c70e08	ad8255a8-58bb-4dfb-8d7d-298219a01c91	SwankyShoes	\N	https://res.cloudinary.com/dcci05bzj/image/upload/v1773326378/reelshop/pexels-obviouslyarthur-1102777_kllx9z.jpg	https://res.cloudinary.com/dcci05bzj/image/upload/v1773326351/reelshop/pexels-mansan-1494908-2918534_z5s6tw.jpg	\N	\N	\N	\N	1	f	t	PENDING	\N	2026-03-12 14:39:49.182+01	2026-03-14 12:02:08.109+01	swankyshoes	f	NGN	\N	\N	\N	\N	\N	NG	\N
6ec37f21-056a-490c-8e4a-df3c45039e1c	c476486e-5234-401b-9461-23c03c8b2c3b	Ada Styles	Premium Nigerian fashion — womenswear, menswear, accessories & thrift finds. Based Lagos Island.	https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=200&h=200&q=80	https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&h=400&q=80	\N	\N	\N	\N	2	t	t	VERIFIED	\N	2026-03-12 14:30:39.142+01	2026-03-14 12:02:09.191+01	ada-styles	f	NGN	\N	\N	\N	\N	\N	NG	\N
\.


--
-- Data for Name: SellerWallet; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SellerWallet" ("sellerId", balance, pending_balance, updated_at, id) FROM stdin;
772d0b6e-5fdc-41a8-9317-1ffba3c70e08	0	0	2026-03-17 08:46:02.078	f7213ccf-7eb2-4e5f-9aac-5c9a07eebadd
c4738142-6259-4c5f-96d2-7f770517be3f	0	0	2026-03-17 10:21:59.993	992993c1-643c-4805-880d-ab67fe616977
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Session" (id, "userId", "refreshToken", ip, "userAgent", device, country, "expiresAt", "lastUsedAt", "revokedAt", "createdAt") FROM stdin;
4ddb26ba-638f-4ebb-8a51-5007e7f2ada9	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzMzMjYyNjMsImV4cCI6MTc3MzkzMTA2M30.3kUJbiIOwEpkiieRupSm6KEmUDa8o9lYnTIeEmrR5zU	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-19 14:37:43.187	2026-03-12 14:37:43.187+01	2026-03-12 15:00:48.754	2026-03-12 14:37:43.199+01
a5b8c02a-4099-4fc3-ba76-383ef51a4e76	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzMzMjgxNTIsImV4cCI6MTc3MzkzMjk1Mn0.pyjB0FqGz6DMihjPsUCKy07jW0VEdOxTlvu0W_-wI50	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-19 15:09:12.401	2026-03-12 15:09:12.401+01	\N	2026-03-12 15:09:12.402+01
dbc9789c-9d6b-4537-abc8-dc8c14e4c8aa	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzMzMzI5ODcsImV4cCI6MTc3MzkzNzc4N30.zEhPmgyrclq91Gm0qPSgydyHTiYXpfdMtV69Tp3Oc4c	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-19 16:29:47.574	2026-03-12 16:29:47.575+01	\N	2026-03-12 16:29:47.586+01
c706b185-15e8-4425-ac3f-40ed51c9d99b	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzMzMzc2MzYsImV4cCI6MTc3Mzk0MjQzNn0.NyjEeVACJDFfCx0lA2XzNGp5g9XLuCFQGg-XNgF6XhQ	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-19 17:47:16.949	2026-03-12 17:47:16.949+01	\N	2026-03-12 17:47:16.95+01
da7102cf-8952-4b80-b355-ef1c7cbdfed8	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzMzODg5MjMsImV4cCI6MTc3Mzk5MzcyM30.DXUmr9hSilmFU6yatD677Fpdz6ed2nDIO8U2i3ZdIdE	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-20 08:02:03.217	2026-03-13 08:02:03.217+01	\N	2026-03-13 08:02:03.218+01
1ebed341-91e1-4ce5-9b30-a602d168685e	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM0MDE2MDcsImV4cCI6MTc3NDAwNjQwN30.gJsXmuH1dPE9eWbSY884t0OiP3G876Awo5DYpabuth4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-20 11:33:27.308	2026-03-13 11:33:27.309+01	\N	2026-03-13 11:33:27.309+01
1103e308-723a-4983-a8fc-3126d2ce1168	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM0MDgyMDksImV4cCI6MTc3NDAxMzAwOX0.MHrtbphuTPR_5xq9ifEfXSAjcmRx7seGkWzvm1jJiQY	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-20 13:23:29.098	2026-03-13 13:23:29.098+01	\N	2026-03-13 13:23:29.107+01
b90f8bb1-1383-48ba-b1b3-35852bccbdcd	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM0MTE0ODAsImV4cCI6MTc3NDAxNjI4MH0.-r-ZJ_lEh3TANyzMDb_xnxOky1xiqHZkNUVZ2iX6XA0	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-20 14:18:00.102	2026-03-13 14:18:00.102+01	\N	2026-03-13 14:18:00.103+01
0fce503c-1bb6-473f-9297-fccc3742e336	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM0MTUzOTksImV4cCI6MTc3NDAyMDE5OX0.urLLdjPOEyXzYV79nLEKErQDz6D5BxEhqEi7Tw70pWw	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-20 15:23:19.663	2026-03-13 15:23:19.663+01	\N	2026-03-13 15:23:19.663+01
eb97f365-5c9f-47c4-9893-bde71d8d01e1	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM0MjMyNjMsImV4cCI6MTc3NDAyODA2M30.oMNHSQOd2c7LgcNc0hAE-O-yd4t0lF055wZYrSeBjKk	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-20 17:34:23.858	2026-03-13 17:34:23.858+01	\N	2026-03-13 17:34:23.859+01
563e17a6-08c5-486f-beb1-0339b4f4a500	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM0ODE3NTgsImV4cCI6MTc3NDA4NjU1OH0.zLnyc3PsOpmc-sHjzMnrkQYr-kzMRPpTckf9aTRReso	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-21 09:49:18.04	2026-03-14 09:49:18.04+01	\N	2026-03-14 09:49:18.041+01
5ff54cf9-c571-43a7-ae18-057943661a84	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM0ODI4MDgsImV4cCI6MTc3NDA4NzYwOH0.hYoc9qAds0cR08nYEAf19SZOKlkis8qTpZP9eHf1DcU	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-21 10:06:48.093	2026-03-14 10:06:48.093+01	\N	2026-03-14 10:06:48.093+01
f6136199-7127-48f0-8a61-ecd8b12bc9f5	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM0ODczOTAsImV4cCI6MTc3NDA5MjE5MH0.zxP1oP3Gj1oDcn01U9rs4YskWwrrXIA817JR6vaXqC0	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-21 11:23:10.977	2026-03-14 11:23:10.977+01	2026-03-14 11:23:24.097	2026-03-14 11:23:10.986+01
10fd42d7-49ff-4907-afe9-1a09f4cd3542	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM0ODc1NDYsImV4cCI6MTc3NDA5MjM0Nn0.QTuSF5wqL-sG7ELgFjJ0xnM5zNRFbaeZ3NSh-TiJV5c	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-21 11:25:46.815	2026-03-14 11:25:46.815+01	2026-03-14 11:27:17.002	2026-03-14 11:25:46.816+01
3d778e2d-a76c-46af-922e-30f2f4c30c39	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM0ODc2OTAsImV4cCI6MTc3NDA5MjQ5MH0.G5rYQYyzIwsntOSb2tQ1Rdw3SfV8Qz5RonF9y8NrV2A	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-21 11:28:10.118	2026-03-14 11:28:10.119+01	\N	2026-03-14 11:28:10.119+01
bd02cbcf-ac84-43f0-9f97-c53f7b0d907b	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM0ODg2NTQsImV4cCI6MTc3NDA5MzQ1NH0.q_WZV7aHaji8JWprLeR7rBXvxfMNIy8D0wAp0wj2yqA	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-21 11:44:14.413	2026-03-14 11:44:14.413+01	\N	2026-03-14 11:44:14.414+01
17c657b2-819f-4feb-8b8b-2a2f2e1b0b15	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM0ODk3MjEsImV4cCI6MTc3NDA5NDUyMX0.qE3bnKvzr-GeJIHJyqXU6XRdI2PGVc27CvWz2poKJLQ	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-21 12:02:01.797	2026-03-14 12:02:01.797+01	\N	2026-03-14 12:02:01.801+01
b000a1da-5602-476f-ba82-183296cb7cf2	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM1MDA2MzMsImV4cCI6MTc3NDEwNTQzM30.HF7gc8GoHSPXevqJnlBmIuPrxKpkbA6whaNFJO_3L6s	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-21 15:03:53.836	2026-03-14 15:03:53.837+01	\N	2026-03-14 15:03:53.846+01
ad50a072-8ea2-452c-9b3e-ce8384222ced	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM1MDIwNjQsImV4cCI6MTc3NDEwNjg2NH0.BljgBH4Q7rwTko5YR6jydgNUI1UVqs9TVu8_yasYGlA	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-21 15:27:44.52	2026-03-14 15:27:44.52+01	\N	2026-03-14 15:27:44.526+01
0a5bc001-3f68-4e15-adcc-77cd6ab77561	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM1MDMwMDIsImV4cCI6MTc3NDEwNzgwMn0.oGzjRWbOres47pgAaUquzPTzbCmsVRXcIb3YC170lbs	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-21 15:43:22.728	2026-03-14 15:43:22.728+01	\N	2026-03-14 15:43:22.742+01
8363c794-fd56-42a4-87dd-2302ba40d99c	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM1MDYzMzgsImV4cCI6MTc3NDExMTEzOH0.Xf1X3MYg7E14xA1ZVID6YeQMTfpmO04Nv7HCVstpb8E	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-21 16:38:58.131	2026-03-14 16:38:58.131+01	2026-03-14 16:41:15.924	2026-03-14 16:38:58.132+01
08f9d061-4850-4bf2-a968-b46dfb28aeb1	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM1OTAyNzEsImV4cCI6MTc3NDE5NTA3MX0.VlP1ycESPe7hK1WfMxDTuNQOQPvul070dXHyEe2Exn4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-22 15:57:51.704	2026-03-15 15:57:51.704+01	2026-03-15 16:02:37.53	2026-03-15 15:57:51.712+01
3cf99585-b31c-4338-a5f4-983fd3e75af8	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM1MDY0NzksImV4cCI6MTc3NDExMTI3OX0.ShAIe4zMapAKJUFPO4h9Rk5FhiJ05q92TP4s6kwcT0Y	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-21 16:41:19.464	2026-03-14 16:41:19.464+01	2026-03-14 16:46:48.746	2026-03-14 16:41:19.464+01
1cc883d2-8ec0-4682-92ce-69568be17db4	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM1MDcwMDIsImV4cCI6MTc3NDExMTgwMn0.ffmjMdnLT7jMQ_nF4VsWjCsODTEiiB-1AFtWoef9c_k	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-21 16:50:02.702	2026-03-14 16:50:02.702+01	\N	2026-03-14 16:50:02.702+01
03a4165a-8909-4b05-bed1-a1df9a34c068	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM1MDgyMzksImV4cCI6MTc3NDExMzAzOX0.2ZxTAwmOQ9TRkyPJsNKx3yIqq_2pPOisOrBNIeSsaOI	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-21 17:10:39.424	2026-03-14 17:10:39.424+01	\N	2026-03-14 17:10:39.431+01
aeb09195-64a5-4d17-86f1-7ff809ebbd6a	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM1MDk0MTMsImV4cCI6MTc3NDExNDIxM30.rkyY8W8OfYH7b7TkdM2AYCSqGZblwUQnQXdvFaxHpZM	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-21 17:30:13.221	2026-03-14 17:30:13.222+01	\N	2026-03-14 17:30:13.256+01
7d262809-2d4f-4c7a-8e16-a297ddcd8108	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM1MTAzNzksImV4cCI6MTc3NDExNTE3OX0.Rsz8v9G3suwcaRYSLIRWrrIxXAM5W_ghk8iUN-VaBEo	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-21 17:46:19.932	2026-03-14 17:46:19.932+01	2026-03-14 17:49:19.705	2026-03-14 17:46:19.933+01
e7ba27c9-9be5-4208-ac11-53a262cb72b9	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM1MTA1NjQsImV4cCI6MTc3NDExNTM2NH0.skJXyLBEGj3zn6F_rCjUSZpCYETM5MbL2n086lwuRUI	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-21 17:49:24.053	2026-03-14 17:49:24.053+01	2026-03-14 17:50:09.134	2026-03-14 17:49:24.055+01
0fe47f8e-a182-4d5d-a656-15515c22e11e	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM1MTA2MTYsImV4cCI6MTc3NDExNTQxNn0.DVRqwizmnOtwwE4ZN0qs1ma-P1RXj_hApMQES-jBCC0	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-21 17:50:16.383	2026-03-14 17:50:16.383+01	\N	2026-03-14 17:50:16.384+01
091ffee0-183c-471d-b8c3-433c39e81893	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM1ODIwMDUsImV4cCI6MTc3NDE4NjgwNX0.ZoN5GA3XZLf2Z7NlnjUPUlPfKTuVIWYN9jd24WxjkM4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-22 13:40:05.223	2026-03-15 13:40:05.224+01	\N	2026-03-15 13:40:05.235+01
0cf877e2-405b-439e-b869-e4d77ebdda46	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM1ODM0NDQsImV4cCI6MTc3NDE4ODI0NH0.iYSd5gxZpetkYAzf9BOYsBJnfTjyORuwl1pHvJEdGBY	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-22 14:04:04.99	2026-03-15 14:04:04.99+01	\N	2026-03-15 14:04:04.991+01
2cf45012-7626-4de6-86ce-400585700b29	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM1ODUzMTQsImV4cCI6MTc3NDE5MDExNH0.C6iw9zlMvToIe6IrK7Y-HXoLDrXd59nypt_1O1aWm3E	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-22 14:35:14.18	2026-03-15 14:35:14.18+01	\N	2026-03-15 14:35:14.19+01
24abd760-4833-40d7-b77e-04b59af4b3c6	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM1ODcyNzcsImV4cCI6MTc3NDE5MjA3N30.b5Dy4vpmoi99HuUmC2pVeLacrojZKjbaFggtAhnSAy0	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-22 15:07:57.713	2026-03-15 15:07:57.714+01	\N	2026-03-15 15:07:57.723+01
1c9bb82b-215c-408a-ac79-47ac1ae036bc	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM1ODc4NDgsImV4cCI6MTc3NDE5MjY0OH0.CkprnS4FaVw3SuErr3ZP3NOeAwUsVVEk1M1r7xHAvdM	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	Web	\N	2026-03-22 15:17:28.804	2026-03-15 15:17:28.804+01	\N	2026-03-15 15:17:28.805+01
d336faa6-95f6-4f34-a631-7f3e1ed2cbe6	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM1OTA2MDEsImV4cCI6MTc3NDE5NTQwMX0.Gi0YIGBZB8YPwkg2uTvni6qERk54Y2ytLiQ_x7cHrrg	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-22 16:03:21.034	2026-03-15 16:03:21.034+01	2026-03-15 16:05:10.149	2026-03-15 16:03:21.034+01
e8971943-2b4c-44b8-b913-7032aeb52500	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM1OTA2MDMsImV4cCI6MTc3NDE5NTQwM30.1g2-SrUE4e2lLfC4RJ9XNM5kv5lVNW9TU04a1Ec3YuA	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	Web	\N	2026-03-22 16:03:23.324	2026-03-15 16:03:23.325+01	2026-03-15 16:05:17.664	2026-03-15 16:03:23.325+01
643ac4ef-e075-47d1-b8c6-d747a40d497a	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM1OTA3MjksImV4cCI6MTc3NDE5NTUyOX0.5I39-eRb-7fwbYSORNdQGH84GZUWhGpQAa1CSClnTtk	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	Web	\N	2026-03-22 16:05:29.674	2026-03-15 16:05:29.674+01	2026-03-15 16:09:29.22	2026-03-15 16:05:29.675+01
c3169612-4a91-40c1-9bee-2c24912ff685	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM1OTEwNjUsImV4cCI6MTc3NDE5NTg2NX0.oJ5h29XOmyzGSoz0I0x8b7BIHZrQWzR_fKyizymfl58	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-22 16:11:05.15	2026-03-15 16:11:05.15+01	2026-03-15 16:17:27.587	2026-03-15 16:11:05.159+01
9a5efa91-30b5-4a58-baae-3892f6c26081	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM1OTA5OTMsImV4cCI6MTc3NDE5NTc5M30.irWDrYUSocqmKqLQYD48JiBVpAulscpxERol8-l91co	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	Web	\N	2026-03-22 16:09:53.938	2026-03-15 16:09:53.938+01	2026-03-15 16:17:32.946	2026-03-15 16:09:53.94+01
0160aa12-3cee-4e9b-8c9f-0b34d97bc4c6	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM1OTE0NjgsImV4cCI6MTc3NDE5NjI2OH0.8HpzsV3KZULsIt7WrW0Kn098Q9nqb6pTARuztHA1qtY	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	Web	\N	2026-03-22 16:17:48.285	2026-03-15 16:17:48.285+01	\N	2026-03-15 16:17:48.286+01
380bd11b-2334-4b8d-bd05-e369454dc96c	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM1OTE0NzIsImV4cCI6MTc3NDE5NjI3Mn0.C3yj31bEA2rF3aDsr5fqdMDI2RPjSFmGMRpHzObFuJ4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-22 16:17:52.741	2026-03-15 16:17:52.741+01	\N	2026-03-15 16:17:52.741+01
2ecedc05-de77-4fe4-a486-aaebc2646930	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM1OTMyNDEsImV4cCI6MTc3NDE5ODA0MX0.4NgTBtRqll8uwNctmLv4ZVl_Qa7RQSxq7_NRL6hnrPw	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-22 16:47:21.788	2026-03-15 16:47:21.789+01	\N	2026-03-15 16:47:21.789+01
539e3ecb-09c3-4068-b1ef-07d294311fad	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM1OTU3MTEsImV4cCI6MTc3NDIwMDUxMX0.kDuwEzh8vTxadL61Zu6v6MkJcEoBq6HajwVdfU5NUZs	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-22 17:28:31.9	2026-03-15 17:28:31.9+01	\N	2026-03-15 17:28:31.908+01
c32d6f89-4b75-482f-b84f-9c5751463953	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM2MDAxNjgsImV4cCI6MTc3NDIwNDk2OH0.OAvwRRHzia8K6X0ULmuWB_gokDabty7Ud-o09lBGVY8	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-22 18:42:48.833	2026-03-15 18:42:48.833+01	\N	2026-03-15 18:42:48.834+01
19349905-d40a-40fb-a8ee-0733d2599c66	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM2Mzc4OTUsImV4cCI6MTc3NDI0MjY5NX0.hMUllaSw-5yoBm4AAmpUVyZKeN7RfzTnSuhxCPJF3EQ	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	Web	\N	2026-03-23 05:11:35.301	2026-03-16 05:11:35.301+01	2026-03-16 05:13:51.432	2026-03-16 05:11:35.303+01
b1207ad4-0455-4560-9be1-b3f8d4f2d7e8	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM2Mzg1ODMsImV4cCI6MTc3NDI0MzM4M30.mRiceWy21jjcHxv8YC6WkVUB_9IzHO-eINmUmYA3k64	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-23 05:23:03.072	2026-03-16 05:23:03.072+01	2026-03-16 05:23:43.957	2026-03-16 05:23:03.072+01
dca67af8-c4ec-4c75-a088-396d3b2fdc7d	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM2Mzg2MzIsImV4cCI6MTc3NDI0MzQzMn0.sNBc68OyJrb9ZyxxuKt24R58IVkWZ4Ks4ExY5AShypU	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-23 05:23:52.505	2026-03-16 05:23:52.505+01	2026-03-16 05:27:54.74	2026-03-16 05:23:52.505+01
a3d671c2-0ae9-43d3-b3e7-32d7b5f18200	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM2Mzg4ODQsImV4cCI6MTc3NDI0MzY4NH0.ECiq9Gh9wOcfGszPnRagtkgwSjoLZsLfx906piAEs0A	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-23 05:28:04.705	2026-03-16 05:28:04.705+01	\N	2026-03-16 05:28:04.706+01
3998f29e-326e-402a-9bb8-7973eb7f5422	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM2Mzk3NzcsImV4cCI6MTc3NDI0NDU3N30.uz6hea94E2P6ygKDUd5fLyzpnyqmvsMK9axTSEwaGAk	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	Web	\N	2026-03-23 05:42:57.95	2026-03-16 05:42:57.95+01	\N	2026-03-16 05:42:57.95+01
e577ff2b-d7e7-4d15-9243-47da2525c9da	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM2Mzk5NTksImV4cCI6MTc3NDI0NDc1OX0.ORhKC86h3vB5fFKIv0TQjfWeXl6nD4ZCGGnFST2yu9c	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	Web	\N	2026-03-23 05:45:59.146	2026-03-16 05:45:59.146+01	\N	2026-03-16 05:45:59.146+01
11b2931d-3e05-45a3-9a05-cbd067c9087e	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM2Mzk5ODcsImV4cCI6MTc3NDI0NDc4N30.Bh9tZvDklipC8Gu6O64EKGCrXb-RZbZesFl3QUNWvQY	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	Web	\N	2026-03-23 05:46:27.637	2026-03-16 05:46:27.637+01	\N	2026-03-16 05:46:27.637+01
b57b42ec-f8b1-4d7e-a207-ea008f8d39de	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM2NDEwMTUsImV4cCI6MTc3NDI0NTgxNX0.FUE4Zh84lMdas8dL8kYXCrLgFDqTISqUhOttzrxEn68	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-23 06:03:35.961	2026-03-16 06:03:35.961+01	\N	2026-03-16 06:03:35.962+01
9767dd2c-2942-45fb-8bda-cb91196b09ef	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM2NDExNDMsImV4cCI6MTc3NDI0NTk0M30.GvmZ994E_yZZOBffawhG_r0Y16g7ClmwVXiVrHwujAI	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	Web	\N	2026-03-23 06:05:43.276	2026-03-16 06:05:43.276+01	\N	2026-03-16 06:05:43.276+01
e9e322ff-d221-4d40-9fdc-a6c41152386d	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM2NDIxMzUsImV4cCI6MTc3NDI0NjkzNX0.aiAcWKYIj7oAvOvvDx_cJUyj-Qk5Hz8PCs6xPJINigA	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	Web	\N	2026-03-23 06:22:15.167	2026-03-16 06:22:15.167+01	\N	2026-03-16 06:22:15.167+01
13d1087d-88e6-467e-9291-45001b7fb469	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM2NDI1NTQsImV4cCI6MTc3NDI0NzM1NH0.wURhaSObcaK_3Gexzkg44PQWqclB2-9qNdotpE4z_hs	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-23 06:29:14.15	2026-03-16 06:29:14.15+01	\N	2026-03-16 06:29:14.15+01
72cddbe1-af3a-4d8c-be22-278d95ec749f	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM2NDc1MDAsImV4cCI6MTc3NDI1MjMwMH0.9mbC3Qjmtk5hK5RDSYe201osrl-qPjUJ503QZ0Fp_kk	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-23 07:51:40.226	2026-03-16 07:51:40.226+01	\N	2026-03-16 07:51:40.324+01
bce59857-23fe-4364-a5d2-411dd94b95c3	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM2NDkwNDMsImV4cCI6MTc3NDI1Mzg0M30.ncWa0iSqilK_-te-BaWcL1qRJySYz3Vf-cWj8VAxIlY	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-23 08:17:23.54	2026-03-16 08:17:23.572+01	2026-03-16 08:23:40.772	2026-03-16 08:17:24.226+01
0497af65-252b-4cd9-8aab-7d0b977353d5	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM2NDk0MjYsImV4cCI6MTc3NDI1NDIyNn0.ZkeGT28QBgmiZsy_cBOZo6480EGeZ5sE7CB-KBStmhc	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-23 08:23:46.28	2026-03-16 08:23:46.28+01	\N	2026-03-16 08:23:46.281+01
3dab45f5-b3a0-4ed1-8405-de954d065290	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM2NTIwNjcsImV4cCI6MTc3NDI1Njg2N30.FbxourEDCKtGdAzgphQpbbzR5fDN09VrKm0XHJqMGjs	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-23 09:07:47.893	2026-03-16 09:07:47.893+01	\N	2026-03-16 09:07:47.9+01
82077b12-cc01-47d8-a16a-073a3812fc5c	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM2NTMxMjcsImV4cCI6MTc3NDI1NzkyN30.fJma7VOX-Lt9-EX_7aKZr9XcpRrTkaoR0l3c2caAT_w	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-23 09:25:27.529	2026-03-16 09:25:27.529+01	\N	2026-03-16 09:25:27.53+01
1ee0f9e8-3574-475e-b188-eb2d50ec8027	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM2NTMyNDAsImV4cCI6MTc3NDI1ODA0MH0.m_r4lOIK14kgt15Gtd01dk7hhVHYEMHS6HwuZA6sqC8	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-23 09:27:20.244	2026-03-16 09:27:20.244+01	\N	2026-03-16 09:27:20.244+01
360ff410-bf3d-4752-9005-cdb761f97275	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM2NTQ0MTgsImV4cCI6MTc3NDI1OTIxOH0.UjHc8nGwcKBoZD-3oHkiDdNQJzPD8ERCM0t8v-F5OHU	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	Web	\N	2026-03-23 09:46:58.209	2026-03-16 09:46:58.209+01	\N	2026-03-16 09:46:58.209+01
6d88528d-80f9-44b4-b118-57d4e886745c	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM2NTQ0ODksImV4cCI6MTc3NDI1OTI4OX0.S8j6FErDRvmEc5uViJRkHTwdwQlTBX-fz2C8-y1O4Y4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-23 09:48:09.183	2026-03-16 09:48:09.183+01	\N	2026-03-16 09:48:09.183+01
1dfbb2f6-4342-4360-bcd1-3c9477f6d5e1	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM2NTQ5OTUsImV4cCI6MTc3NDI1OTc5NX0.S9JJ3aRbO5Vv3EEd8FgUZffLiG98ARKNLJIk2lDNdOs	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-23 09:56:35.31	2026-03-16 09:56:35.31+01	2026-03-16 10:56:54.366	2026-03-16 09:56:35.311+01
0ef19696-01f7-46fd-8450-af921dbd85ff	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM2NTg2MTgsImV4cCI6MTc3NDI2MzQxOH0.pvNFNhueYvizLWnjgk5dcwp9FtyyEmMTixdyVQCeuRo	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-23 10:56:58.24	2026-03-16 10:56:58.24+01	2026-03-16 15:09:12.224	2026-03-16 10:56:58.241+01
dd7c4b13-83c0-4038-bf77-348c9906b492	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM2NzM3NTcsImV4cCI6MTc3NDI3ODU1N30.Wjl0BdAmKH19pwq8-Rzd8o4cBgDCx2enl5xVx-6D188	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-23 15:09:17.594	2026-03-16 15:09:17.594+01	\N	2026-03-16 15:09:17.596+01
8140242d-2465-4f32-9acb-c2eaf1e1a1c9	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM2ODEwMjAsImV4cCI6MTc3NDI4NTgyMH0.gSfhMVXm_Tmc6yqFY4OJ0iEYX0uX4FMGi96rk-5snxE	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-23 17:10:20.945	2026-03-16 17:10:20.945+01	2026-03-16 20:31:03.087	2026-03-16 17:10:20.954+01
d9286c2d-8326-4dde-9501-2cb94d6a44a2	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM2OTMwNjYsImV4cCI6MTc3NDI5Nzg2Nn0.GfiX0Nm68NNP8I7gK9OlId5BX8VtixQGBQs2ZpTRwek	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-23 20:31:06.683	2026-03-16 20:31:06.683+01	2026-03-16 20:32:05.959	2026-03-16 20:31:06.686+01
29ba452f-a486-44eb-adcc-e52c5078fa9b	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM2OTMxMzEsImV4cCI6MTc3NDI5NzkzMX0.z0oaz9c-RlSXv8hKiYmfwocUiKhth-dELREKAQHBJ1w	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-23 20:32:11.251	2026-03-16 20:32:11.251+01	2026-03-16 21:09:30.729	2026-03-16 20:32:11.254+01
e1312a14-dadf-48f3-a4cc-065272674962	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM2OTUzNzYsImV4cCI6MTc3NDMwMDE3Nn0.n5Tv4qitytwhCHNqhXety0zIO97FnnyUtFOG2-lE1Kk	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-23 21:09:36.232	2026-03-16 21:09:36.232+01	2026-03-17 02:15:35.614	2026-03-16 21:09:36.234+01
d8338cf0-9874-4fc0-9c13-d27cd420c145	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM2OTU0NzYsImV4cCI6MTc3NDMwMDI3Nn0.ZLw-91GbkJxFjqTXeOwY3wM_UIdX5-RjkjjrPjjRPV8	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	Web	\N	2026-03-23 21:11:16.327	2026-03-16 21:11:16.327+01	2026-03-17 02:15:23.765	2026-03-16 21:11:16.329+01
3316dc9e-0eef-4439-8386-2aee99b8429a	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM3MTM3NTIsImV4cCI6MTc3NDMxODU1Mn0.bmSV6cMtaFn4oNHp-ggNMeVByXH5dGFqM18mTkGf4ec	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-24 02:15:52.051	2026-03-17 02:15:52.051+01	\N	2026-03-17 02:15:52.052+01
d7aad692-252e-4356-ae30-2f1f37731a1c	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM3MTM3NjMsImV4cCI6MTc3NDMxODU2M30.9fwIhozu7_YsHBr-bOotaG_q-UQcUxnW7HsZpn0fVzc	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	Web	\N	2026-03-24 02:16:03.954	2026-03-17 02:16:03.954+01	\N	2026-03-17 02:16:03.954+01
af200a0c-5a2d-4b3a-b51f-e31b995d0aa9	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM3NDc2NjEsImV4cCI6MTc3NDM1MjQ2MX0.Rr5tQuWrSB3O3lQesuFPX-CBv1jfdjkOtA-gkxC00U8	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-24 11:41:01.413	2026-03-17 11:41:01.413+01	\N	2026-03-17 11:41:01.422+01
ceeb1463-c4a0-4a34-b1f3-c6737da96e43	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM3NDc2NjcsImV4cCI6MTc3NDM1MjQ2N30.qATkjrHOjjlPXFQN0Cb9_rRKr2ejm5_7AeYvRdAnCtw	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-24 11:41:07.76	2026-03-17 11:41:07.76+01	\N	2026-03-17 11:41:07.76+01
b1608ff4-3851-4b23-9856-ada5f59a2e0d	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM3NDc2ODMsImV4cCI6MTc3NDM1MjQ4M30.lizRpf5GVzDLwqbXgXfbCZ-Niu42oiQFNM4k9aVd0CY	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-24 11:41:23.619	2026-03-17 11:41:23.619+01	\N	2026-03-17 11:41:23.62+01
6b0cf798-7299-4d55-9ab9-d68071425b64	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM3NDc2OTIsImV4cCI6MTc3NDM1MjQ5Mn0.m2E6U5357tgun2ahjAX3fPE6H-Avr2af3FpbaPSEAjc	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-24 11:41:32.908	2026-03-17 11:41:32.908+01	\N	2026-03-17 11:41:32.908+01
bf17879d-fef0-4eaf-9192-af53883da8b1	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM3NDg2NzYsImV4cCI6MTc3NDM1MzQ3Nn0.OoEJIqfVZJQbufRozGkNFRQbZBr4aeecsU2H1hckdgQ	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-24 11:57:56.365	2026-03-17 11:57:56.365+01	2026-03-17 12:34:23.425	2026-03-17 11:57:56.373+01
71011fca-72e4-4c5a-99ff-a370bfb372ed	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM3NTA4NzUsImV4cCI6MTc3NDM1NTY3NX0.dTDDVtQwGLhC95gqXxVD-9GfieIcXW2zrPYensLal1s	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-24 12:34:35.805	2026-03-17 12:34:35.805+01	\N	2026-03-17 12:34:35.806+01
54a03323-c09a-45d1-bb00-d603d1c949bc	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM4MjgwNjksImV4cCI6MTc3NDQzMjg2OX0.nvnNizCNU1hy6XZITIfguOq5c4GRi0VgLQSFGG3L7XA	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	Web	\N	2026-03-25 10:01:09.011	2026-03-18 10:01:09.011+01	2026-03-18 10:18:29.119	2026-03-18 10:01:09.015+01
77ccf207-0147-4860-b58d-cf366d2b3c9d	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM4NDU3MDMsImV4cCI6MTc3NDQ1MDUwM30.KdnWK4ARZ0XHSKHjpCjZDMtOtBKo7MQ2_JWmyue4gMw	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-25 14:55:03.199	2026-03-18 14:55:03.199+01	\N	2026-03-18 14:55:03.205+01
a48ce188-44cc-49b7-924f-c2754d68bad3	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM4MjkxMzIsImV4cCI6MTc3NDQzMzkzMn0.4HMmVTmIyVkl4DJ8UOuLhxSiqx_1izjN0eweKvleVo8	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	Web	\N	2026-03-25 10:18:52.233	2026-03-18 10:18:52.233+01	2026-03-18 15:00:07.038	2026-03-18 10:18:52.234+01
602a4175-7aa9-4549-8573-05d1f138a4be	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM4NDYwMTgsImV4cCI6MTc3NDQ1MDgxOH0.NrQ4h_i767-53Yj9oTKd1dODoAEY6s2hBCPCvQGvZPA	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	Web	\N	2026-03-25 15:00:18.852	2026-03-18 15:00:18.852+01	2026-03-18 16:20:28.169	2026-03-18 15:00:18.853+01
2335a3aa-de88-44e4-8346-3d084c16f038	ad8255a8-58bb-4dfb-8d7d-298219a01c91	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZDgyNTVhOC01OGJiLTRkZmItOGQ3ZC0yOTgyMTlhMDFjOTEiLCJpYXQiOjE3NzM4NTA4NDYsImV4cCI6MTc3NDQ1NTY0Nn0.ENXrThtP8Rtqat-7ZUaS8feVhfZuTlPK6uP_FPLosYs	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	Web	\N	2026-03-25 16:20:46.443	2026-03-18 16:20:46.443+01	\N	2026-03-18 16:20:46.444+01
169d07ce-0456-45c1-8ff9-3cc3bd8d90b6	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM4NTkwNDksImV4cCI6MTc3NDQ2Mzg0OX0.VHivkxQWqwcvHI-q7x0iOFPT5yZTXetjosCKWyHIxUg	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-25 18:37:29.251	2026-03-18 18:37:29.251+01	2026-03-18 19:02:33.765	2026-03-18 18:37:29.258+01
f3b34242-7b84-41dc-b26a-b0ca30785cd3	e1b39cba-718e-41b0-88bf-6a038e30a211	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIzOWNiYS03MThlLTQxYjAtODhiZi02YTAzOGUzMGEyMTEiLCJpYXQiOjE3NzM4NjA1ODUsImV4cCI6MTc3NDQ2NTM4NX0.kIZ8Ma3SGkB9h1CvVOMrakVFuunt0D62W3ozLdQeeS4	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0	Web	\N	2026-03-25 19:03:05.7	2026-03-18 19:03:05.7+01	\N	2026-03-18 19:03:05.7+01
\.


--
-- Data for Name: Share; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Share" (id, "userId", "productId", "postId", platform, "shareUrl", created_at) FROM stdin;
\.


--
-- Data for Name: Story; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Story" (id, "authorId", "productId", "expiresAt", created_at, "mediaId") FROM stdin;
9c89842e-958c-47c2-93f2-e7c5df768038	c476486e-5234-401b-9461-23c03c8b2c3b	1	2026-03-13 14:30:39.972	2026-03-12 14:30:39.973+01	a751e833-6bd1-4b79-a3e0-89ab46ab3ab4
96987b32-db0b-4d92-acbf-eaec68453a67	c476486e-5234-401b-9461-23c03c8b2c3b	\N	2026-03-13 14:30:39.983	2026-03-12 14:30:39.985+01	d0484f73-fd11-4d21-b483-a5c216bc158f
b5148466-89bd-4aaf-95ce-ec7ea4f9ddfe	37232cc8-f85e-48d0-b4b3-3cac43305fdc	4	2026-03-13 14:30:39.99	2026-03-12 14:30:39.991+01	cb002836-ad79-411a-b1fe-6f5422be1bbd
3673cea3-c017-4db6-aca0-0959c67bacc6	9f666f6a-52a0-4f77-b40c-d849cffffa5d	7	2026-03-13 14:30:39.996	2026-03-12 14:30:39.997+01	325f40a8-ab94-4d7b-a7c5-ecd2e0409cea
cb9c4fb5-64c0-4f78-b929-703bb2d9717e	bed9f82b-a84c-48e5-8409-75ed43f60db1	\N	2026-03-13 14:30:40.005	2026-03-12 14:30:40.005+01	0b563716-98dc-426c-a47e-25d4bcaca1e7
6083c591-4ebf-47a8-8cce-6bdbe6422458	5f5139e9-e690-4278-87f8-a628ec5a519f	14	2026-03-13 14:30:40.112	2026-03-12 14:30:40.112+01	dade02d1-8dd2-4510-ac04-55673f720872
696e0399-f3b0-41f4-8c26-6764d9fb4a29	84cbe55d-f6dd-4d16-9bb6-6ffe1ddc6d3f	\N	2026-03-13 14:30:40.118	2026-03-12 14:30:40.119+01	53e4b0d2-926c-4e93-bfe7-a8169baadbcc
ce57bbb6-be8a-436a-8e19-ceb02d5ce162	2b76f00d-ef5a-4cc2-912c-616517d84d90	\N	2026-03-13 14:30:40.123	2026-03-12 14:30:40.124+01	9c653d19-ac6c-4d4d-aa49-e670707d105e
f080dce7-ac6e-4ac1-b90f-74bdff79c584	e1b39cba-718e-41b0-88bf-6a038e30a211	\N	2026-03-15 17:54:58.192	2026-03-14 17:54:58.204+01	1d48290c-2478-4d60-8cc7-116b8c175ae0
\.


--
-- Data for Name: Tag; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Tag" (id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Transaction" ("walletId", amount, type, "orderId", description, created_at, id) FROM stdin;
992993c1-643c-4805-880d-ab67fe616977	1470000	CREDIT_RELEASED	5	Order #5 — delivered, funds released to balance	2026-03-17 08:51:34.193	c538112e-d23d-44f2-93a4-9a214f9b0515
992993c1-643c-4805-880d-ab67fe616977	16170000	CREDIT_RELEASED	6	Order #6 — delivered, funds released to balance	2026-03-17 08:59:30.147	dcfc31d2-6899-4b8d-9691-7785735524ed
992993c1-643c-4805-880d-ab67fe616977	17640000	DEBIT	\N	Withdrawal request #23ceed13	2026-03-17 10:22:00.009	e0479d69-e2b8-46b5-955e-2c302c3fa0a3
\.


--
-- Data for Name: UserSettings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserSettings" (user_id, email_notifications, push_notifications, private_profile, two_factor_enabled, language, created_at, updated_at, currency, theme, text_size, auto_mute, compact_feed, show_captions, show_like_counts) FROM stdin;
ad8255a8-58bb-4dfb-8d7d-298219a01c91	t	t	f	f	en	2026-03-15 14:35:14.336	2026-03-16 05:46:53.07	NGN	light	medium	t	f	t	t
e1b39cba-718e-41b0-88bf-6a038e30a211	t	t	f	f	en	2026-03-15 16:03:21.113	2026-03-18 18:38:03.326	NGN	dark	medium	t	f	t	t
\.


--
-- Data for Name: VerificationDocument; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."VerificationDocument" (id, "sellerProfileId", type, url, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
da6041c8-81c8-41be-80b9-2cef3c31ee27	58ce6d67f2de3c8740da12b4da913e312d701d50f1ede3f3248d572a60be7139	2026-03-12 15:29:56.951624+01	20260312142955_init	\N	\N	2026-03-12 15:29:55.573269+01	1
f0db1a84-40cf-4cf6-8753-203382e0e07f	12af4a2477d565a049b843dd3879a466084330f723415ad3eec56a40e66e00ed	2026-03-15 16:08:56.380327+01	20260315000001_user_settings_fields	\N	\N	2026-03-15 16:08:56.305576+01	1
88d4de39-2d9d-422e-9e1e-294f2e3ac8fe	28180d4a69136bd0ae3a4225ad0d4ea9eafd6415816d63fa2f6f6dc2d6b7945a	2026-03-16 09:44:22.557675+01	20260315000002_orders_shipping_fields	\N	\N	2026-03-16 09:44:22.516433+01	1
783eb97f-6fb7-4fd9-9def-f087ca68ec91	0154eb09eaec0b9e408c4f1ba7f600285de2269871fdbad755eef455cc7b3807	2026-03-16 09:44:22.706465+01	20260315000003_product_offers	\N	\N	2026-03-16 09:44:22.55863+01	1
2771da96-e08a-47f8-bb98-cea2cef927c8	264c04fda48b10e0061bd495592d0609ae88c2c266517650ee37b2ecd2ff34ff	2026-03-17 03:40:48.477012+01	20260316000001_orders_shipped_at	\N	\N	2026-03-17 03:40:48.412264+01	1
42fa32ad-667d-4300-9958-f738dacb2db8	f9fed650d1d4efb1b3b5147e7f118a4df04c7f076c34d061aba374cd3818b213	2026-03-17 10:17:08.370778+01	20260317000001_bank_accounts	\N	\N	2026-03-17 10:17:08.229867+01	1
736f761d-a3b4-4e71-b774-83eaacfdae35	40f53c6435e8ad91c9b09677add25bc43cbf254b87fb9f0c398d73bcafa738f0	2026-03-17 12:48:50.255461+01	20260317000002_seller_ship_from	\N	\N	2026-03-17 12:48:50.206781+01	1
\.


--
-- Name: Addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Addresses_id_seq"', 5, true);


--
-- Name: Category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Category_id_seq"', 12, true);


--
-- Name: Like_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Like_id_seq"', 26, true);


--
-- Name: Notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Notification_id_seq"', 33, true);


--
-- Name: OrderItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OrderItem_id_seq"', 9, true);


--
-- Name: Orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Orders_id_seq"', 7, true);


--
-- Name: ProductOffer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ProductOffer_id_seq"', 1, true);


--
-- Name: ProductVariant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ProductVariant_id_seq"', 60, true);


--
-- Name: Products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Products_id_seq"', 22, true);


--
-- Name: Share_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Share_id_seq"', 1, false);


--
-- Name: Tag_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Tag_id_seq"', 1, false);


--
-- Name: Addresses Addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Addresses"
    ADD CONSTRAINT "Addresses_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: BankAccount BankAccount_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BankAccount"
    ADD CONSTRAINT "BankAccount_pkey" PRIMARY KEY (id);


--
-- Name: CartItem CartItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: CommentLike CommentLike_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommentLike"
    ADD CONSTRAINT "CommentLike_pkey" PRIMARY KEY ("userId", "commentId");


--
-- Name: Comment Comment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_pkey" PRIMARY KEY (id);


--
-- Name: Conversation Conversation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_pkey" PRIMARY KEY (id);


--
-- Name: EmailVerificationToken EmailVerificationToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailVerificationToken"
    ADD CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY (id);


--
-- Name: FailedLoginAttempt FailedLoginAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FailedLoginAttempt"
    ADD CONSTRAINT "FailedLoginAttempt_pkey" PRIMARY KEY (id);


--
-- Name: Follow Follow_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Follow"
    ADD CONSTRAINT "Follow_pkey" PRIMARY KEY (id);


--
-- Name: GlobalShippingZone GlobalShippingZone_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GlobalShippingZone"
    ADD CONSTRAINT "GlobalShippingZone_pkey" PRIMARY KEY (id);


--
-- Name: Like Like_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Like"
    ADD CONSTRAINT "Like_pkey" PRIMARY KEY (id);


--
-- Name: Media Media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Orders Orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_pkey" PRIMARY KEY (id);


--
-- Name: PasswordResetToken PasswordResetToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY (id);


--
-- Name: Payout Payout_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payout"
    ADD CONSTRAINT "Payout_pkey" PRIMARY KEY (id);


--
-- Name: PostLike PostLike_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PostLike"
    ADD CONSTRAINT "PostLike_pkey" PRIMARY KEY ("userId", "postId");


--
-- Name: Post Post_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_pkey" PRIMARY KEY (id);


--
-- Name: ProductCategories ProductCategories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductCategories"
    ADD CONSTRAINT "ProductCategories_pkey" PRIMARY KEY ("productId", "categoryId");


--
-- Name: ProductOffer ProductOffer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductOffer"
    ADD CONSTRAINT "ProductOffer_pkey" PRIMARY KEY (id);


--
-- Name: ProductPostTag ProductPostTag_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductPostTag"
    ADD CONSTRAINT "ProductPostTag_pkey" PRIMARY KEY ("postId", "productId");


--
-- Name: ProductRelation ProductRelation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductRelation"
    ADD CONSTRAINT "ProductRelation_pkey" PRIMARY KEY ("styledWithId", "appearsInId");


--
-- Name: ProductTags ProductTags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductTags"
    ADD CONSTRAINT "ProductTags_pkey" PRIMARY KEY ("productId", "tagId");


--
-- Name: ProductVariant ProductVariant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_pkey" PRIMARY KEY (id);


--
-- Name: Products Products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_pkey" PRIMARY KEY (id);


--
-- Name: Profile Profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Profile"
    ADD CONSTRAINT "Profile_pkey" PRIMARY KEY (id);


--
-- Name: SavedPost SavedPost_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SavedPost"
    ADD CONSTRAINT "SavedPost_pkey" PRIMARY KEY (id);


--
-- Name: SellerProfile SellerProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerProfile"
    ADD CONSTRAINT "SellerProfile_pkey" PRIMARY KEY (id);


--
-- Name: SellerWallet SellerWallet_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerWallet"
    ADD CONSTRAINT "SellerWallet_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Share Share_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Share"
    ADD CONSTRAINT "Share_pkey" PRIMARY KEY (id);


--
-- Name: Story Story_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Story"
    ADD CONSTRAINT "Story_pkey" PRIMARY KEY (id);


--
-- Name: Tag Tag_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tag"
    ADD CONSTRAINT "Tag_pkey" PRIMARY KEY (id);


--
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: UserSettings UserSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserSettings"
    ADD CONSTRAINT "UserSettings_pkey" PRIMARY KEY (user_id);


--
-- Name: VerificationDocument VerificationDocument_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."VerificationDocument"
    ADD CONSTRAINT "VerificationDocument_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Addresses_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Addresses_userId_idx" ON public."Addresses" USING btree ("userId");


--
-- Name: AuditLog_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_created_at_idx" ON public."AuditLog" USING btree (created_at);


--
-- Name: AuditLog_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_email_idx" ON public."AuditLog" USING btree (email);


--
-- Name: AuditLog_event_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_event_type_idx" ON public."AuditLog" USING btree (event_type);


--
-- Name: AuditLog_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_user_id_idx" ON public."AuditLog" USING btree (user_id);


--
-- Name: CartItem_userId_variantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CartItem_userId_variantId_key" ON public."CartItem" USING btree ("userId", "variantId");


--
-- Name: Category_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_name_key" ON public."Category" USING btree (name);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: Conversation_participant1Id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Conversation_participant1Id_idx" ON public."Conversation" USING btree ("participant1Id");


--
-- Name: Conversation_participant1Id_participant2Id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Conversation_participant1Id_participant2Id_key" ON public."Conversation" USING btree ("participant1Id", "participant2Id");


--
-- Name: Conversation_participant1Id_sellerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Conversation_participant1Id_sellerId_key" ON public."Conversation" USING btree ("participant1Id", "sellerId");


--
-- Name: Conversation_sellerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Conversation_sellerId_idx" ON public."Conversation" USING btree ("sellerId");


--
-- Name: EmailVerificationToken_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmailVerificationToken_token_idx" ON public."EmailVerificationToken" USING btree (token);


--
-- Name: EmailVerificationToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EmailVerificationToken_token_key" ON public."EmailVerificationToken" USING btree (token);


--
-- Name: EmailVerificationToken_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmailVerificationToken_user_id_idx" ON public."EmailVerificationToken" USING btree (user_id);


--
-- Name: FailedLoginAttempt_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "FailedLoginAttempt_email_key" ON public."FailedLoginAttempt" USING btree (email);


--
-- Name: FailedLoginAttempt_ip_address_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FailedLoginAttempt_ip_address_idx" ON public."FailedLoginAttempt" USING btree (ip_address);


--
-- Name: FailedLoginAttempt_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FailedLoginAttempt_user_id_idx" ON public."FailedLoginAttempt" USING btree (user_id);


--
-- Name: Follow_followerId_followingId_followingType_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Follow_followerId_followingId_followingType_key" ON public."Follow" USING btree ("followerId", "followingId", "followingType");


--
-- Name: Follow_followerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Follow_followerId_idx" ON public."Follow" USING btree ("followerId");


--
-- Name: Follow_followingId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Follow_followingId_idx" ON public."Follow" USING btree ("followingId");


--
-- Name: GlobalShippingZone_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "GlobalShippingZone_name_key" ON public."GlobalShippingZone" USING btree (name);


--
-- Name: Like_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Like_productId_idx" ON public."Like" USING btree ("productId");


--
-- Name: Like_userId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Like_userId_productId_key" ON public."Like" USING btree ("userId", "productId");


--
-- Name: Media_public_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Media_public_id_key" ON public."Media" USING btree (public_id);


--
-- Name: Notification_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_userId_idx" ON public."Notification" USING btree ("userId");


--
-- Name: Orders_paymentRef_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Orders_paymentRef_key" ON public."Orders" USING btree ("paymentRef");


--
-- Name: Orders_stripeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Orders_stripeId_key" ON public."Orders" USING btree ("stripeId");


--
-- Name: PasswordResetToken_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PasswordResetToken_token_idx" ON public."PasswordResetToken" USING btree (token);


--
-- Name: PasswordResetToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON public."PasswordResetToken" USING btree (token);


--
-- Name: PasswordResetToken_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PasswordResetToken_user_id_idx" ON public."PasswordResetToken" USING btree (user_id);


--
-- Name: PostLike_postId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PostLike_postId_idx" ON public."PostLike" USING btree ("postId");


--
-- Name: Post_authorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Post_authorId_idx" ON public."Post" USING btree ("authorId");


--
-- Name: ProductOffer_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductOffer_productId_idx" ON public."ProductOffer" USING btree ("productId");


--
-- Name: ProductVariant_productId_size_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductVariant_productId_size_key" ON public."ProductVariant" USING btree ("productId", size);


--
-- Name: Products_SKU_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Products_SKU_key" ON public."Products" USING btree ("SKU");


--
-- Name: Products_sellerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Products_sellerId_idx" ON public."Products" USING btree ("sellerId");


--
-- Name: Products_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Products_slug_key" ON public."Products" USING btree (slug);


--
-- Name: Profile_affiliateCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Profile_affiliateCode_key" ON public."Profile" USING btree ("affiliateCode");


--
-- Name: Profile_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Profile_email_key" ON public."Profile" USING btree (email);


--
-- Name: SavedPost_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SavedPost_userId_idx" ON public."SavedPost" USING btree ("userId");


--
-- Name: SavedPost_userId_postId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SavedPost_userId_postId_key" ON public."SavedPost" USING btree ("userId", "postId");


--
-- Name: SellerProfile_profileId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SellerProfile_profileId_idx" ON public."SellerProfile" USING btree ("profileId");


--
-- Name: SellerProfile_profileId_store_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SellerProfile_profileId_store_slug_key" ON public."SellerProfile" USING btree ("profileId", store_slug);


--
-- Name: SellerProfile_store_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SellerProfile_store_slug_key" ON public."SellerProfile" USING btree (store_slug);


--
-- Name: SellerWallet_sellerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SellerWallet_sellerId_key" ON public."SellerWallet" USING btree ("sellerId");


--
-- Name: Session_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Session_expiresAt_idx" ON public."Session" USING btree ("expiresAt");


--
-- Name: Session_refreshToken_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Session_refreshToken_idx" ON public."Session" USING btree ("refreshToken");


--
-- Name: Session_refreshToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_refreshToken_key" ON public."Session" USING btree ("refreshToken");


--
-- Name: Session_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Session_userId_idx" ON public."Session" USING btree ("userId");


--
-- Name: Share_postId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Share_postId_idx" ON public."Share" USING btree ("postId");


--
-- Name: Share_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Share_productId_idx" ON public."Share" USING btree ("productId");


--
-- Name: Story_mediaId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Story_mediaId_key" ON public."Story" USING btree ("mediaId");


--
-- Name: Tag_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Tag_name_key" ON public."Tag" USING btree (name);


--
-- Name: Addresses Addresses_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Addresses"
    ADD CONSTRAINT "Addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AuditLog AuditLog_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BankAccount BankAccount_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BankAccount"
    ADD CONSTRAINT "BankAccount_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."SellerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItem CartItem_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItem CartItem_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CommentLike CommentLike_commentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommentLike"
    ADD CONSTRAINT "CommentLike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES public."Comment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CommentLike CommentLike_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommentLike"
    ADD CONSTRAINT "CommentLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Comment Comment_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Comment Comment_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Comment"(id) ON UPDATE CASCADE;


--
-- Name: Comment Comment_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Comment Comment_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Conversation Conversation_currentProductId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_currentProductId_fkey" FOREIGN KEY ("currentProductId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Conversation Conversation_participant1Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_participant1Id_fkey" FOREIGN KEY ("participant1Id") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Conversation Conversation_participant2Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_participant2Id_fkey" FOREIGN KEY ("participant2Id") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Conversation Conversation_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."SellerProfile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: EmailVerificationToken EmailVerificationToken_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailVerificationToken"
    ADD CONSTRAINT "EmailVerificationToken_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Follow Follow_followerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Follow"
    ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Like Like_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Like"
    ADD CONSTRAINT "Like_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Like Like_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Like"
    ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Media Media_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Media Media_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Media Media_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Media Media_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."SellerProfile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Message Message_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."Conversation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Message Message_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Message Message_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notification Notification_actorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_commentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES public."Comment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Orders Orders_affiliateUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_affiliateUserId_fkey" FOREIGN KEY ("affiliateUserId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Orders Orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PasswordResetToken PasswordResetToken_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payout Payout_walletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payout"
    ADD CONSTRAINT "Payout_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES public."SellerWallet"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PostLike PostLike_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PostLike"
    ADD CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PostLike PostLike_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PostLike"
    ADD CONSTRAINT "PostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Post Post_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductCategories ProductCategories_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductCategories"
    ADD CONSTRAINT "ProductCategories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductCategories ProductCategories_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductCategories"
    ADD CONSTRAINT "ProductCategories_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductOffer ProductOffer_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductOffer"
    ADD CONSTRAINT "ProductOffer_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductPostTag ProductPostTag_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductPostTag"
    ADD CONSTRAINT "ProductPostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductPostTag ProductPostTag_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductPostTag"
    ADD CONSTRAINT "ProductPostTag_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductRelation ProductRelation_appearsInId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductRelation"
    ADD CONSTRAINT "ProductRelation_appearsInId_fkey" FOREIGN KEY ("appearsInId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductRelation ProductRelation_styledWithId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductRelation"
    ADD CONSTRAINT "ProductRelation_styledWithId_fkey" FOREIGN KEY ("styledWithId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductTags ProductTags_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductTags"
    ADD CONSTRAINT "ProductTags_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductTags ProductTags_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductTags"
    ADD CONSTRAINT "ProductTags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public."Tag"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductVariant ProductVariant_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Products Products_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."SellerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SavedPost SavedPost_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SavedPost"
    ADD CONSTRAINT "SavedPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SavedPost SavedPost_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SavedPost"
    ADD CONSTRAINT "SavedPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SellerProfile SellerProfile_profileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerProfile"
    ADD CONSTRAINT "SellerProfile_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SellerWallet SellerWallet_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerWallet"
    ADD CONSTRAINT "SellerWallet_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."SellerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Share Share_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Share"
    ADD CONSTRAINT "Share_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Share Share_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Share"
    ADD CONSTRAINT "Share_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Share Share_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Share"
    ADD CONSTRAINT "Share_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Story Story_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Story"
    ADD CONSTRAINT "Story_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Story Story_mediaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Story"
    ADD CONSTRAINT "Story_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES public."Media"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Story Story_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Story"
    ADD CONSTRAINT "Story_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Transaction Transaction_walletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES public."SellerWallet"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserSettings UserSettings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserSettings"
    ADD CONSTRAINT "UserSettings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: VerificationDocument VerificationDocument_sellerProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."VerificationDocument"
    ADD CONSTRAINT "VerificationDocument_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES public."SellerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

