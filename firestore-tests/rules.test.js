// Firestore rules tests for guestcam-memories.
//
//   npm test             -> ../firestore.rules in both rollout phases
//                           (whichever phase the file is in)
//   npm run test:deployed -> the ruleset deployed on 2026-08-02 (failures = holes)
//
// Personas: anonymous visitor, event guest, normal customer, event owner, siteAdmin.

import { readFileSync } from 'node:fs';
import { after, afterEach, before, beforeEach, describe, it } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  deleteField,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

const FLAG_ON = 'return true; // CLIENT_SIDE_ACTIVATION';
const FLAG_OFF = 'return false; // CLIENT_SIDE_ACTIVATION';

function loadModes() {
  if (process.env.RULES_FILE) {
    return [
      {
        name: `deployed rules (${process.env.RULES_FILE})`,
        projectId: 'demo-deployed',
        rules: readFileSync(process.env.RULES_FILE, 'utf8'),
        clientActivation: true,
      },
    ];
  }
  // The file may be in either phase; both are always tested.
  const file = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
  if (!file.includes(FLAG_ON) && !file.includes(FLAG_OFF)) {
    throw new Error('rollout switch not found in firestore.rules');
  }
  const rules = file.replace(FLAG_OFF, FLAG_ON);
  console.log(`firestore.rules is currently in phase ${file.includes(FLAG_OFF) ? 2 : 1}`);
  return [
    {
      name: 'phase 1: allowClientSideActivation() = true',
      projectId: 'demo-phase1',
      rules,
      clientActivation: true,
    },
    {
      name: 'phase 2: allowClientSideActivation() = false',
      projectId: 'demo-phase2',
      rules: rules.replace(FLAG_ON, FLAG_OFF),
      clientActivation: false,
    },
  ];
}

const now = () => Timestamp.now();

async function seed(env) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const put = (path, data) => setDoc(doc(db, path), data);
    const user = (role, extra = {}) => ({
      email: 'x@example.test',
      role,
      planId: null,
      subscriptionStatus: null,
      subscribedOn: null,
      demo: false,
      ...extra,
    });
    await Promise.all([
      put('users/admin', user('siteAdmin')),
      put('users/alice', user('owner')),
      put('users/bob', user('owner', { planId: 'basic', subscriptionStatus: 'active' })),
      put('users/olivia', user('owner', { eventId: 'e1' })),
      put('users/carl', user('owner', { planId: 'ghost', subscriptionStatus: 'active' })), // plan points at no product
      put('users/anonhost', user('owner', { planId: 'basic', subscriptionStatus: 'active' })), // signs in anonymously
      put('guests/guest1', { displayName: 'Gus', eventId: 'e1', online: true }),
      put('guests/guest2', { displayName: 'Gia', eventId: 'e1', online: true }),
      put('events/e1', {
        name: 'Wedding', eventName: 'Wedding', createdBy: { id: 'olivia', displayName: 'Olivia' },
        adminId: 'olivia', isPublic: true, plan: 'No Plan', amount: 0, guestBook: [],
        siteStatus: 'Live', siteCloses: Timestamp.fromMillis(Date.now() + 365 * 86400000), createdAt: now(),
      }),
      put('gallery/g1', { eventId: 'e1', userId: 'guest1', url: 'u', filename: 'f.jpg', createdAt: now() }),
      put('videos/v1', { eventId: 'e1', userId: 'guest1', url: 'u', filename: 'f.mp4', createdAt: now() }),
      put('guestbook/gb1', { eventId: 'e1', userId: 'guest1', displayName: 'Gus', type: 'text', createdAt: now() }),
      put('products/basic', { active: true, name: 'Basic' }),
      put('products/basic/prices/p1', { unit_amount: 4900, currency: 'cad' }),
      put('customers/alice/purchases/pa1', { planId: 'basic', price: 49, purchasedAt: now(), status: 'active' }),
      put('customers/bob/purchases/pb1', { planId: 'basic', price: 49, purchasedAt: now(), status: 'active' }),
      put('customers/alice/checkout_sessions/cs1', {
        mode: 'payment',
        metadata: { planId: 'basic', planName: 'Basic', chargedAmount: '49', affiliateCode: 'FRIEND' },
      }),
      put('customers/bob/checkout_sessions/csb', { mode: 'payment', metadata: { planId: 'basic' } }),
      put('customers/alice/payments/pi1', { status: 'succeeded', amount: 4900 }),
      put('coupons/SAVE10', { code: 'SAVE10', type: 'percentage', value: 10, active: true, usedCount: 0 }),
      put('coupons/GIFT', { code: 'GIFT', type: 'free_plan', value: 100, active: true, usedCount: 2 }),
      put('coupons/OFF', { code: 'OFF', type: 'free_plan', value: 100, active: false, usedCount: 0 }),
      put('affiliates/aff1', { name: 'Ann', email: 'ann@example.test', code: 'FRIEND', commissionRate: 20, active: true }),
      put('affiliates/aff2', { name: 'Old', email: 'old@example.test', code: 'OLD', commissionRate: 50, active: false }),
      put('affiliateSales/s1', {
        affiliateId: 'aff1', affiliateCode: 'FRIEND', affiliateName: 'Ann', saleAmount: 49,
        commissionRate: 20, commissionAmount: 9.8, note: 'Basic', status: 'unpaid', payoutId: null, createdAt: now(),
      }),
      put('payouts/po1', { affiliateId: 'aff1', amount: 9.8, status: 'paid', createdAt: now() }),
    ]);
  });
}

// Equivalent of the affiliate sale written by SuccessPage.js / Pricing.js.
const validSale = (over = {}) => ({
  affiliateId: 'aff1',
  affiliateCode: 'FRIEND',
  affiliateName: 'Ann',
  saleAmount: 49,
  commissionRate: 20,
  commissionAmount: (49 * 20) / 100,
  note: 'Basic',
  status: 'unpaid',
  payoutId: null,
  createdAt: new Date(),
  ...over,
});

// Mirrors the transaction in guestcam-static/src/pages/SuccessPage.js.
function successPageTransaction(db, uid, sessionId) {
  const purchasedAt = new Date();
  const end = new Date(purchasedAt);
  end.setFullYear(end.getFullYear() + 1);
  const sessionRef = doc(db, `customers/${uid}/checkout_sessions/${sessionId}`);
  return runTransaction(db, async (tx) => {
    const fresh = await tx.get(sessionRef);
    if (fresh.data()?.processed) return false;
    tx.update(doc(db, `users/${uid}`), {
      planId: 'basic', planName: 'Basic', price: 49,
      subscribedOn: purchasedAt, subscriptionEndDate: end, subscriptionStatus: 'active',
    });
    tx.set(doc(db, `customers/${uid}/purchases/${sessionId}`), {
      planId: 'basic', planName: 'Basic', price: 49, purchasedAt,
      subscriptionEndDate: end, previousPlanId: null, status: 'active', couponCode: null,
    });
    tx.set(doc(db, `affiliateSales/sale_${sessionId}`), validSale({ createdAt: purchasedAt }));
    tx.update(sessionRef, { processed: true, processedAt: new Date() });
    return true;
  });
}

for (const mode of loadModes()) {
  describe(mode.name, () => {
    let env;
    let anon, guest, alice, olivia, admin, newbie;

    before(async () => {
      env = await initializeTestEnvironment({
        projectId: mode.projectId,
        firestore: { rules: mode.rules, host: '127.0.0.1', port: 8085 },
      });
    });
    after(async () => env && env.cleanup());

    beforeEach(async () => {
      await env.clearFirestore();
      await seed(env);
      anon = env.unauthenticatedContext().firestore();
      guest = env.authenticatedContext('guest1').firestore();
      alice = env.authenticatedContext('alice').firestore(); // normal customer
      olivia = env.authenticatedContext('olivia').firestore(); // event owner of e1
      admin = env.authenticatedContext('admin').firestore(); // role: siteAdmin
      newbie = env.authenticatedContext('newbie').firestore(); // signed up, no users doc yet
    });
    afterEach(async () => {
      // nothing: each test reseeds
    });

    /* ------------------------------------------------------------------ */
    describe('issue 2: users cannot make themselves siteAdmin', () => {
      it('customer cannot update own role to siteAdmin', async () => {
        await assertFails(updateDoc(doc(alice, 'users/alice'), { role: 'siteAdmin' }));
      });
      it('customer cannot set role via set(..., {merge: true})', async () => {
        await assertFails(setDoc(doc(alice, 'users/alice'), { role: 'siteAdmin' }, { merge: true }));
      });
      it('event owner cannot set own role to siteAdmin', async () => {
        await assertFails(updateDoc(doc(olivia, 'users/olivia'), { role: 'siteAdmin' }));
      });
      it('customer cannot delete own role field', async () => {
        await assertFails(updateDoc(doc(alice, 'users/alice'), { role: deleteField() }));
      });
      it('new user cannot create own doc with role siteAdmin', async () => {
        await assertFails(setDoc(doc(newbie, 'users/newbie'), { email: 'n@example.test', role: 'siteAdmin' }));
      });
      it('event guest cannot create a users doc with role siteAdmin', async () => {
        await assertFails(setDoc(doc(guest, 'users/guest1'), { role: 'siteAdmin' }));
      });
      it('new user CAN create own doc with the signup payload (useSignup.js)', async () => {
        await assertSucceeds(setDoc(doc(newbie, 'users/newbie'), {
          email: 'n@example.test', online: true, displayName: 'N', photoURL: null,
          role: 'owner', planId: null, subscriptionStatus: null, subscribedOn: null, demo: false,
        }));
      });
      it('new user CAN create own doc with the social-login payload (useLogin.js)', async () => {
        await assertSucceeds(setDoc(doc(newbie, 'users/newbie'), {
          email: 'n@example.test', displayName: 'N', photoURL: null, online: true, role: 'owner', demo: false,
        }, { merge: true }));
      });
      it('customer CAN update online / displayName / eventId (login, logout, create event)', async () => {
        await assertSucceeds(setDoc(doc(alice, 'users/alice'), { online: true }, { merge: true }));
        await assertSucceeds(updateDoc(doc(alice, 'users/alice'), { online: false, displayName: 'Alice' }));
        await assertSucceeds(updateDoc(doc(alice, 'users/alice'), { eventId: 'e9' }));
      });
      it("customer cannot write another user's doc", async () => {
        await assertFails(updateDoc(doc(alice, 'users/bob'), { online: false }));
      });
    });

    /* ------------------------------------------------------------------ */
    describe('issue 1: no blanket read for signed-in users', () => {
      it('customer CAN read own users doc', async () => {
        await assertSucceeds(getDoc(doc(alice, 'users/alice')));
      });
      it("customer cannot read another user's doc", async () => {
        await assertFails(getDoc(doc(alice, 'users/admin')));
      });
      it('customer cannot list the users collection', async () => {
        await assertFails(getDocs(collection(alice, 'users')));
      });
      it('event guest cannot read users docs', async () => {
        await assertFails(getDoc(doc(guest, 'users/alice')));
        await assertFails(getDocs(collection(guest, 'users')));
      });
      it("event guest cannot read another guest's doc", async () => {
        await assertFails(getDoc(doc(guest, 'guests/guest2')));
      });
      it("customer cannot read another customer's purchases / checkout sessions / payments", async () => {
        await assertFails(getDocs(collection(alice, 'customers/bob/purchases')));
        await assertFails(getDoc(doc(alice, 'customers/bob/checkout_sessions/csb')));
        await assertFails(getDoc(doc(guest, 'customers/alice/payments/pi1')));
      });
      it('customer cannot run the collection-group purchases query', async () => {
        await assertFails(getDocs(collectionGroup(alice, 'purchases')));
      });
      it('customer cannot read affiliateSales or payouts', async () => {
        await assertFails(getDocs(collection(alice, 'affiliateSales')));
        await assertFails(getDoc(doc(alice, 'affiliateSales/s1')));
        await assertFails(getDocs(collection(alice, 'payouts')));
      });
      it('customer cannot list all coupons or all affiliates (incl. emails)', async () => {
        await assertFails(getDocs(collection(alice, 'coupons')));
        await assertFails(getDocs(collection(anon, 'coupons')));
        await assertFails(getDocs(collection(alice, 'affiliates')));
      });
      it('customer CAN read own purchases (Pricing.js query) and own checkout session', async () => {
        await assertSucceeds(getDocs(query(
          collection(alice, 'customers/alice/purchases'), orderBy('purchasedAt', 'desc'), limit(1))));
        await assertSucceeds(getDoc(doc(alice, 'customers/alice/checkout_sessions/cs1')));
        await assertSucceeds(getDoc(doc(alice, 'customers/alice/payments/pi1')));
      });
    });

    /* ------------------------------------------------------------------ */
    describe('siteAdmin: admin panel keeps working', () => {
      it('reads own users doc (Login.jsx / ProtectedRoute.jsx)', async () => {
        await assertSucceeds(getDoc(doc(admin, 'users/admin')));
      });
      for (const name of [
        'users', 'events', 'gallery', 'videos', 'guestbook', 'guests', 'products',
        'coupons', 'affiliates', 'affiliateSales', 'payouts',
      ]) {
        it(`lists ${name}`, async () => {
          await assertSucceeds(getDocs(collection(admin, name)));
        });
      }
      it('lists products/{id}/prices (fetchPlans)', async () => {
        await assertSucceeds(getDocs(collection(admin, 'products/basic/prices')));
      });
      it('runs the collection-group purchases query (fetchPurchases)', async () => {
        const snap = await assertSucceeds(getDocs(collectionGroup(admin, 'purchases')));
        if (snap.size !== 2) throw new Error(`expected 2 purchases, got ${snap.size}`);
      });
      it('reads any customer checkout session / payment', async () => {
        await assertSucceeds(getDoc(doc(admin, 'customers/bob/checkout_sessions/csb')));
        await assertSucceeds(getDoc(doc(admin, 'customers/alice/payments/pi1')));
      });
      it('runs count queries (countCollection / countWhere)', async () => {
        await assertSucceeds(getCountFromServer(collection(admin, 'users')));
        await assertSucceeds(getCountFromServer(query(collection(admin, 'gallery'), where('eventId', '==', 'e1'))));
      });
      it('creates, updates and deletes coupons', async () => {
        await assertSucceeds(setDoc(doc(admin, 'coupons/NEW50'), {
          code: 'NEW50', type: 'percentage', value: 50, expiresAt: null, active: true, createdAt: now(),
        }));
        await assertSucceeds(updateDoc(doc(admin, 'coupons/NEW50'), { active: false }));
        await assertSucceeds(deleteDoc(doc(admin, 'coupons/NEW50')));
      });
      it('creates, edits (batch with sales) and deletes affiliates', async () => {
        const ref = doc(collection(admin, 'affiliates'));
        await assertSucceeds(setDoc(ref, {
          name: 'Zed', email: 'z@example.test', code: 'ZED', commissionRate: 10, active: true, createdAt: now(),
        }));
        const batch = writeBatch(admin);
        batch.update(doc(admin, 'affiliates/aff1'), { code: 'FRIEND2' });
        batch.update(doc(admin, 'affiliateSales/s1'), { affiliateCode: 'FRIEND2' });
        await assertSucceeds(batch.commit());
        await assertSucceeds(updateDoc(ref, { active: false }));
        await assertSucceeds(deleteDoc(ref));
      });
      it('records a manual affiliate sale', async () => {
        await assertSucceeds(addDoc(collection(admin, 'affiliateSales'), {
          affiliateId: 'aff1', saleAmount: 100, commissionAmount: 20, status: 'unpaid', payoutId: null, createdAt: now(),
        }));
      });
      it('creates a payout and marks sales paid', async () => {
        const payout = await assertSucceeds(addDoc(collection(admin, 'payouts'), {
          affiliateId: 'aff1', amount: 9.8, createdAt: now(),
        }));
        const batch = writeBatch(admin);
        batch.update(doc(admin, 'affiliateSales/s1'), { status: 'paid', payoutId: payout.id });
        await assertSucceeds(batch.commit());
      });
    });

    /* ------------------------------------------------------------------ */
    describe('issue 3: coupons / affiliates / affiliateSales / payouts are admin-only', () => {
      it('customer cannot create a 100% coupon', async () => {
        await assertFails(setDoc(doc(alice, 'coupons/FREE'), {
          code: 'FREE', type: 'free_plan', value: 100, active: true, createdAt: now(),
        }));
      });
      it('customer cannot change a coupon value / reactivate it / delete it', async () => {
        await assertFails(updateDoc(doc(alice, 'coupons/SAVE10'), { value: 100 }));
        await assertFails(updateDoc(doc(alice, 'coupons/OFF'), { active: true }));
        await assertFails(updateDoc(doc(alice, 'coupons/OFF'), { active: true, usedCount: 1 }));
        await assertFails(updateDoc(doc(alice, 'coupons/SAVE10'), { expiresAt: null }));
        await assertFails(deleteDoc(doc(alice, 'coupons/SAVE10')));
      });
      it('customer cannot create or edit affiliates', async () => {
        await assertFails(addDoc(collection(alice, 'affiliates'), {
          name: 'Me', email: 'me@example.test', code: 'ME', commissionRate: 100, active: true,
        }));
        await assertFails(updateDoc(doc(alice, 'affiliates/aff1'), { commissionRate: 100 }));
        await assertFails(deleteDoc(doc(alice, 'affiliates/aff1')));
      });
      it('customer cannot mark a sale paid, edit or delete it', async () => {
        await assertFails(updateDoc(doc(alice, 'affiliateSales/s1'), { status: 'paid', payoutId: 'x' }));
        await assertFails(updateDoc(doc(alice, 'affiliateSales/s1'), { commissionAmount: 1000 }));
        await assertFails(deleteDoc(doc(alice, 'affiliateSales/s1')));
      });
      it('customer cannot create or edit payouts', async () => {
        await assertFails(addDoc(collection(alice, 'payouts'), { affiliateId: 'aff1', amount: 1000 }));
        await assertFails(updateDoc(doc(alice, 'payouts/po1'), { status: 'paid' }));
      });
      it('customer cannot record a fake sale with inflated commission / inactive or unknown affiliate / as paid', async () => {
        await assertFails(addDoc(collection(alice, 'affiliateSales'), validSale({ commissionAmount: 1000 })));
        await assertFails(addDoc(collection(alice, 'affiliateSales'), validSale({
          affiliateId: 'aff2', affiliateCode: 'OLD', affiliateName: 'Old', commissionRate: 50, commissionAmount: 24.5,
        })));
        await assertFails(addDoc(collection(alice, 'affiliateSales'), validSale({ affiliateId: 'nope' })));
        await assertFails(addDoc(collection(alice, 'affiliateSales'), validSale({ status: 'paid' })));
        await assertFails(addDoc(collection(alice, 'affiliateSales'), validSale({ commissionRate: 90, commissionAmount: 44.1 })));
        await assertFails(addDoc(collection(alice, 'affiliateSales'), validSale({ extra: true })));
      });
      it('anonymous visitor cannot write any of them', async () => {
        await assertFails(setDoc(doc(anon, 'coupons/X'), { code: 'X' }));
        await assertFails(addDoc(collection(anon, 'affiliates'), { code: 'X' }));
        await assertFails(addDoc(collection(anon, 'affiliateSales'), validSale()));
        await assertFails(addDoc(collection(anon, 'payouts'), { amount: 1 }));
      });
    });

    /* ------------------------------------------------------------------ */
    describe('events: only real hosts with a plan create; owners cannot touch plan/ownership', () => {
      // Mirrors the event object built in CreateEvent.js.
      const newEvent = (uid, over = {}) => ({
        category: 'Wedding',
        dateOfEvent: Timestamp.fromDate(new Date('2027-06-01')),
        eventName: 'Our Day',
        eventPageHeader: 'Welcome',
        featureImage: 'https://example.test/cover.jpg',
        location: 'Toronto',
        shareGuestbook: true,
        sharePictures: true,
        siteCloses: Timestamp.fromMillis(Date.now() + 365 * 86400000),
        siteStatus: 'Live',
        welcomeMessage: 'Hi',
        guestList: [],
        createdBy: { displayName: 'Host', photoUrl: null, id: uid },
        adminId: uid,
        plan: 'No Plan',
        amount: 0,
        guestBook: [],
        isPublic: true,
        createdAt: now(),
        ...over,
      });
      const as = (uid, token) => env.authenticatedContext(uid, token).firestore();

      it('host with a plan CAN create an event (CreateEvent.js payload)', async () => {
        await assertSucceeds(addDoc(collection(as('bob'), 'events'), newEvent('bob')));
      });
      it('signed-in user without a plan cannot create an event', async () => {
        await assertFails(addDoc(collection(alice, 'events'), newEvent('alice')));
        await assertFails(addDoc(collection(newbie, 'events'), newEvent('newbie')));
      });
      it('invite-link guest (anonymous sign-in) cannot create an event, even with plan fields', async () => {
        const anonToken = { firebase: { sign_in_provider: 'anonymous' } };
        await assertFails(addDoc(collection(as('guest1', anonToken), 'events'), newEvent('guest1')));
        await assertFails(addDoc(collection(as('anonhost', anonToken), 'events'), newEvent('anonhost')));
        await assertFails(addDoc(collection(anon, 'events'), newEvent('nobody')));
      });
      it('a planId that points at no product does not count as a plan', async () => {
        await assertFails(addDoc(collection(as('carl'), 'events'), newEvent('carl')));
      });
      it('cannot create an event owned by someone else or with a long-lived site', async () => {
        const bob = as('bob');
        await assertFails(addDoc(collection(bob, 'events'), newEvent('bob', { adminId: 'alice' })));
        await assertFails(addDoc(collection(bob, 'events'), newEvent('bob', { createdBy: { id: 'alice' } })));
        await assertFails(addDoc(collection(bob, 'events'), newEvent('bob', { ownerId: 'alice' })));
        await assertFails(addDoc(collection(bob, 'events'), newEvent('bob', {
          siteCloses: Timestamp.fromMillis(Date.now() + 5 * 365 * 86400000),
        })));
      });
      it('owner CAN edit content (EditEvent.js), soft-delete (Event.js) and remove guestbook comments', async () => {
        await assertSucceeds(updateDoc(doc(olivia, 'events/e1'), {
          eventName: 'Our Wedding', eventPageHeader: 'Hello', welcomeMessage: 'Welcome all',
          featureImage: 'https://example.test/new.jpg', category: 'Wedding',
          dateOfEvent: Timestamp.fromDate(new Date('2027-07-01')), location: 'Ottawa',
          sharePictures: false, shareGuestbook: true,
        }));
        await assertSucceeds(updateDoc(doc(olivia, 'events/e1'), { guestBook: [] }));
        await assertSucceeds(updateDoc(doc(olivia, 'events/e1'), {
          deleted: true, deletedAt: new Date(), deletedBy: 'olivia',
        }));
      });
      it('owner cannot change plan, amount, ownership, close date or creation time', async () => {
        const e1 = doc(olivia, 'events/e1');
        await assertFails(updateDoc(e1, { plan: 'Max' }));
        await assertFails(updateDoc(e1, { amount: 165 }));
        await assertFails(updateDoc(e1, { adminId: 'alice' }));
        await assertFails(updateDoc(e1, { ownerId: 'alice' }));
        await assertFails(updateDoc(e1, { createdBy: { id: 'alice' } }));
        await assertFails(updateDoc(e1, { siteCloses: Timestamp.fromMillis(Date.now() + 10 * 365 * 86400000) }));
        await assertFails(updateDoc(e1, { createdAt: now() }));
      });
      it('only the owner can delete the event', async () => {
        await assertFails(deleteDoc(doc(alice, 'events/e1')));
        await assertFails(deleteDoc(doc(guest, 'events/e1')));
        await assertSucceeds(deleteDoc(doc(olivia, 'events/e1')));
      });
    });

    /* ------------------------------------------------------------------ */
    describe('public website keeps working', () => {
      it('anonymous visitor reads products and prices (Pricing.js)', async () => {
        await assertSucceeds(getDocs(collection(anon, 'products')));
        await assertSucceeds(getDocs(collection(anon, 'products/basic/prices')));
      });
      it('anonymous visitor / customer looks up a coupon by code (applyCoupon)', async () => {
        await assertSucceeds(getDocs(query(collection(anon, 'coupons'), where('code', '==', 'SAVE10'), limit(1))));
        await assertSucceeds(getDocs(query(collection(alice, 'coupons'), where('code', '==', 'GIFT'), limit(1))));
      });
      it('looks up a referral code (applyReferral, SuccessPage)', async () => {
        await assertSucceeds(getDocs(query(collection(anon, 'affiliates'), where('code', '==', 'FRIEND'), limit(1))));
        await assertSucceeds(getDocs(query(
          collection(alice, 'affiliates'), where('code', '==', 'FRIEND'), where('active', '==', true), limit(1))));
      });
      it('anyone reads an event, its gallery, videos and guestbook', async () => {
        await assertSucceeds(getDoc(doc(anon, 'events/e1')));
        await assertSucceeds(getDocs(query(collection(anon, 'gallery'), where('eventId', '==', 'e1'))));
        await assertSucceeds(getDocs(query(collection(guest, 'videos'), where('eventId', '==', 'e1'))));
        await assertSucceeds(getDocs(query(collection(guest, 'guestbook'), where('eventId', '==', 'e1'))));
      });
      it('event guest creates and reads own guests doc (useSignup_Guest.js)', async () => {
        const g3 = env.authenticatedContext('guest3').firestore();
        await assertSucceeds(setDoc(doc(g3, 'guests/guest3'), { online: true, displayName: 'G', eventId: 'e1' }, { merge: true }));
        await assertSucceeds(getDoc(doc(g3, 'guests/guest3')));
      });
      it('event guest uploads a photo and signs the guestbook', async () => {
        await assertSucceeds(addDoc(collection(guest, 'gallery'), {
          eventId: 'e1', userId: 'guest1', url: 'u', filename: 'a.jpg', createdAt: new Date(),
        }));
        await assertSucceeds(addDoc(collection(guest, 'guestbook'), {
          eventId: 'e1', userId: 'guest1', displayName: 'Gus', type: 'text', createdAt: new Date(),
        }));
      });
      it('event guest cannot upload as someone else', async () => {
        await assertFails(addDoc(collection(guest, 'gallery'), {
          eventId: 'e1', userId: 'olivia', url: 'u', filename: 'a.jpg', createdAt: new Date(),
        }));
      });
      it('event owner edits own event and deletes a guest photo; others cannot', async () => {
        await assertSucceeds(updateDoc(doc(olivia, 'events/e1'), { name: 'Our Wedding' }));
        await assertFails(updateDoc(doc(alice, 'events/e1'), { name: 'pwned' }));
        await assertFails(updateDoc(doc(guest, 'events/e1'), { name: 'pwned' }));
        await assertSucceeds(deleteDoc(doc(olivia, 'gallery/g1')));
      });
      it('customer creates a Stripe checkout session (Pricing.js handleCheckout)', async () => {
        await assertSucceeds(setDoc(doc(alice, 'customers/alice/checkout_sessions/new1'), {
          sessionId: 'new1', mode: 'payment', automatic_tax: { enabled: true }, price: 'price_1',
          success_url: 'https://guestpov.ca/success?session_id=new1', cancel_url: 'https://guestpov.ca/cancel',
          createdAt: new Date(), metadata: { userId: 'alice', planId: 'basic' },
        }));
      });
      it("customer cannot create a checkout session for someone else", async () => {
        await assertFails(setDoc(doc(alice, 'customers/bob/checkout_sessions/x'), { mode: 'payment' }));
      });
    });

    /* ------------------------------------------------------------------ */
    if (mode.clientActivation) {
      describe('issue 4 (phase 1): browser activation still works, but only in its narrow form', () => {
        it('SuccessPage.js transaction succeeds for the customer', async () => {
          const res = await assertSucceeds(successPageTransaction(alice, 'alice', 'cs1'));
          if (res !== true) throw new Error('transaction did not run');
        });
        it('Pricing.js gift activation succeeds (plan fields, purchase, coupon +1, $0 sale)', async () => {
          await assertSucceeds(setDoc(doc(alice, 'users/alice'), {
            planId: 'basic', planName: 'Basic', price: 0, subscribedOn: new Date(), subscriptionStatus: 'active', gift: true,
          }, { merge: true }));
          await assertSucceeds(setDoc(doc(collection(alice, 'customers/alice/purchases')), {
            planId: 'basic', planName: 'Basic', price: 0, purchasedAt: new Date(), status: 'gift', gift: true, couponCode: 'GIFT',
          }));
          await assertSucceeds(updateDoc(doc(alice, 'coupons/GIFT'), { usedCount: 3 }));
          await assertSucceeds(addDoc(collection(alice, 'affiliateSales'), validSale({
            saleAmount: 0, commissionAmount: 0, note: 'Basic (gift coupon)',
          })));
        });
        it('coupon usedCount can only go up by exactly one', async () => {
          await assertSucceeds(updateDoc(doc(alice, 'coupons/SAVE10'), { usedCount: 1 }));
          await assertFails(updateDoc(doc(alice, 'coupons/SAVE10'), { usedCount: 0 }));
          await assertFails(updateDoc(doc(alice, 'coupons/GIFT'), { usedCount: 10 }));
        });
        it('checkout session: only processed/processedAt may change after creation', async () => {
          await assertSucceeds(updateDoc(doc(alice, 'customers/alice/checkout_sessions/cs1'), {
            processed: true, processedAt: new Date(),
          }));
          await assertFails(updateDoc(doc(alice, 'customers/alice/checkout_sessions/cs1'), {
            'metadata.chargedAmount': '0',
          }));
        });
        it('plan activation still cannot touch role', async () => {
          await assertFails(updateDoc(doc(alice, 'users/alice'), { planId: 'pro', role: 'siteAdmin' }));
        });
      });
    } else {
      describe('issue 4 (phase 2): customers cannot grant themselves a plan', () => {
        it('customer cannot set planId / subscriptionStatus on own doc', async () => {
          await assertFails(updateDoc(doc(alice, 'users/alice'), { planId: 'pro' }));
          await assertFails(updateDoc(doc(alice, 'users/alice'), { subscriptionStatus: 'active' }));
          await assertFails(setDoc(doc(alice, 'users/alice'), { gift: true }, { merge: true }));
          await assertFails(updateDoc(doc(alice, 'users/alice'), { demo: true }));
        });
        it('customer cannot cancel/alter an existing plan either', async () => {
          const bob = env.authenticatedContext('bob').firestore();
          await assertFails(updateDoc(doc(bob, 'users/bob'), { subscriptionStatus: 'canceled' }));
        });
        it('new user cannot create own doc with a plan already granted', async () => {
          await assertFails(setDoc(doc(newbie, 'users/newbie'), {
            email: 'n@example.test', role: 'owner', planId: 'pro', subscriptionStatus: 'active',
          }));
        });
        it('customer cannot create own purchase records', async () => {
          await assertFails(setDoc(doc(collection(alice, 'customers/alice/purchases')), {
            planId: 'pro', price: 0, purchasedAt: new Date(), status: 'gift',
          }));
        });
        it('customer cannot record any affiliate sale or bump coupon usage', async () => {
          await assertFails(addDoc(collection(alice, 'affiliateSales'), validSale()));
          await assertFails(updateDoc(doc(alice, 'coupons/SAVE10'), { usedCount: 1 }));
        });
        it('customer cannot mark a checkout session processed', async () => {
          await assertFails(updateDoc(doc(alice, 'customers/alice/checkout_sessions/cs1'), { processed: true }));
        });
        it('old SuccessPage.js transaction is rejected', async () => {
          await assertFails(successPageTransaction(alice, 'alice', 'cs1'));
        });
        it('customer cannot forge a Stripe payment (it would trigger activation)', async () => {
          await assertFails(setDoc(doc(alice, 'customers/alice/payments/pi_fake'), {
            status: 'succeeded', amount: 4900, amount_received: 4900, currency: 'cad', metadata: { planId: 'basic' },
          }));
          await assertFails(updateDoc(doc(alice, 'customers/alice/payments/pi1'), { amount_received: 999999 }));
        });
        it('paymentActivations: no client access, siteAdmin can read', async () => {
          await env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), 'paymentActivations/pi1'), {
            uid: 'alice', status: 'activated',
          }));
          await assertFails(getDoc(doc(alice, 'paymentActivations/pi1')));
          await assertFails(setDoc(doc(alice, 'paymentActivations/pi_new'), { uid: 'alice', status: 'activated' }));
          await assertSucceeds(getDoc(doc(admin, 'paymentActivations/pi1')));
        });
      });

      describe('phase 2: the new client flow still works', () => {
        it('Pricing.js can still start a checkout (metadata incl. checkoutSessionId)', async () => {
          await assertSucceeds(setDoc(doc(alice, 'customers/alice/checkout_sessions/cs_new'), {
            sessionId: 'cs_new', mode: 'payment', createdAt: new Date(),
            success_url: 'https://guestpov.ca/success?session_id=cs_new',
            metadata: { checkoutSessionId: 'cs_new', userId: 'alice', planId: 'basic', couponCode: '', affiliateCode: '' },
          }));
          await assertSucceeds(getDoc(doc(alice, 'customers/alice/checkout_sessions/cs_new')));
        });
        it('SuccessPage.js can wait on its purchase and on its own user doc', async () => {
          await env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), 'customers/alice/purchases/pi1'), {
            planId: 'basic', price: 49, purchasedAt: now(), status: 'active', checkoutSessionId: 'cs1', paymentId: 'pi1',
          }));
          const snap = await assertSucceeds(getDocs(query(
            collection(alice, 'customers/alice/purchases'), where('checkoutSessionId', '==', 'cs1'), limit(1),
          )));
          if (snap.size !== 1) throw new Error(`expected 1 purchase, got ${snap.size}`);
          await assertSucceeds(getDoc(doc(alice, 'users/alice')));
          await assertSucceeds(getDoc(doc(alice, 'customers/alice/checkout_sessions/cs1')));
        });
        it("SuccessPage.js cannot wait on someone else's purchases", async () => {
          await assertFails(getDocs(query(
            collection(alice, 'customers/bob/purchases'), where('checkoutSessionId', '==', 'csb'), limit(1),
          )));
        });
        it('Pricing.js can still look up a coupon and a referral code', async () => {
          await assertSucceeds(getDocs(query(collection(alice, 'coupons'), where('code', '==', 'GIFT'), limit(1))));
          await assertSucceeds(getDocs(query(collection(alice, 'affiliates'), where('code', '==', 'FRIEND'), limit(1))));
        });
        it('Pricing.js can still read its latest purchase', async () => {
          await assertSucceeds(getDocs(query(
            collection(alice, 'customers/alice/purchases'), orderBy('purchasedAt', 'desc'), limit(1),
          )));
        });
        it('profile fields other than the plan stay editable', async () => {
          await assertSucceeds(updateDoc(doc(alice, 'users/alice'), { displayName: 'Alice', online: true }));
        });
      });
    }
  });
}
