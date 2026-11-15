// Storage rules tests for guestcam-memories.firebasestorage.app.
//
//   npm run test:storage            -> ../storage.rules
//   npm run test:storage:deployed   -> the ruleset live since 2026-01-05 (failures = holes)
//
// Personas: anonymous visitor (not signed in), invite-link guest (anonymous
// auth), customer, event owner.

import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, it } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';

const RULES = process.env.STORAGE_RULES_FILE
  ? readFileSync(process.env.STORAGE_RULES_FILE, 'utf8')
  : readFileSync(new URL('../storage.rules', import.meta.url), 'utf8');

const MB = 1024 * 1024;
const bytes = (n = 16) => new Uint8Array(n).fill(7);
const jpeg = (uid, extra = {}) => ({
  contentType: 'image/jpeg',
  customMetadata: { userId: uid, eventId: 'e1', ...extra },
});
const mp4 = (uid) => ({
  contentType: 'video/mp4',
  customMetadata: { userId: uid, eventId: 'e1' },
});

describe(`storage rules (${process.env.STORAGE_RULES_FILE || 'storage.rules'})`, () => {
  let env;
  let anon, guest, guest2, alice, olivia;

  before(async () => {
    env = await initializeTestEnvironment({
      projectId: 'demo-guestcam-storage',
      storage: { rules: RULES, host: '127.0.0.1', port: 9199 },
    });
  });
  after(async () => env && env.cleanup());

  beforeEach(async () => {
    await env.clearStorage();
    await env.withSecurityRulesDisabled(async (ctx) => {
      const s = ctx.storage();
      await s.ref('gallery/e1/g1').put(bytes(), jpeg('guest2'));
      await s.ref('gallery/e1/mine').put(bytes(), jpeg('guest1'));
      await s.ref('videos/e1/v1').put(bytes(), mp4('guest2'));
      await s.ref('guestbook/e1/images/1_gb.jpg').put(bytes(), { contentType: 'image/jpeg' });
      await s.ref('guestbook/e1/old.png').put(bytes(), { contentType: 'image/png' });
      await s.ref('thumbnails/alice/me.jpg').put(bytes(), { contentType: 'image/jpeg' });
      await s.ref('thumbnails/e1/v1.jpg').put(bytes(), { contentType: 'image/jpeg' });
      await s.ref('previews/e1/v1.mp4').put(bytes(), { contentType: 'video/mp4' });
      await s.ref('featureImages/olivia/cover.jpg').put(bytes(), { contentType: 'image/jpeg' });
      await s.ref('videos/root-level.mp4').put(bytes(), { contentType: 'video/mp4' });
    });
    anon = env.unauthenticatedContext().storage();
    const anonToken = { firebase: { sign_in_provider: 'anonymous' } };
    guest = env.authenticatedContext('guest1', anonToken).storage();
    guest2 = env.authenticatedContext('guest2', anonToken).storage();
    alice = env.authenticatedContext('alice').storage();
    olivia = env.authenticatedContext('olivia').storage(); // owns event e1
  });

  /* ---------------------------------------------------------------- */
  describe('event gallery (gallery/{eventId}/{id})', () => {
    it('guest CAN upload a photo tagged with their uid (useGalleryUpload)', async () => {
      await assertSucceeds(guest.ref('gallery/e1/new').put(bytes(), jpeg('guest1')));
    });
    it('anyone CAN read and list an event gallery (album ZIP download)', async () => {
      await assertSucceeds(anon.ref('gallery/e1/g1').getMetadata());
      await assertSucceeds(anon.ref('gallery/e1').listAll());
    });
    it('not-signed-in visitor cannot upload', async () => {
      await assertFails(anon.ref('gallery/e1/x').put(bytes(), jpeg('nobody')));
    });
    it('upload must be tagged with the uploader (no tag / someone else)', async () => {
      await assertFails(guest.ref('gallery/e1/x').put(bytes(), { contentType: 'image/jpeg' }));
      await assertFails(guest.ref('gallery/e1/y').put(bytes(), jpeg('olivia')));
    });
    it('cannot upload HTML, scripts or other non-images', async () => {
      await assertFails(guest.ref('gallery/e1/x.html').put(bytes(), { ...jpeg('guest1'), contentType: 'text/html' }));
      await assertFails(guest.ref('gallery/e1/x.js').put(bytes(), { ...jpeg('guest1'), contentType: 'application/javascript' }));
      await assertFails(guest.ref('gallery/e1/x.mp4').put(bytes(), mp4('guest1')));
    });
    it('cannot upload a photo over 50 MB', async () => {
      await assertFails(guest.ref('gallery/e1/huge').put(bytes(51 * MB), jpeg('guest1')));
    });
    it("cannot overwrite anyone's photo, including their own", async () => {
      await assertFails(guest.ref('gallery/e1/g1').put(bytes(), jpeg('guest1')));
      await assertFails(guest.ref('gallery/e1/mine').put(bytes(), jpeg('guest1')));
    });
    it('uploader CAN delete own photo; others (incl. event owner) cannot', async () => {
      await assertFails(guest.ref('gallery/e1/g1').delete());
      await assertFails(olivia.ref('gallery/e1/g1').delete());
      await assertFails(anon.ref('gallery/e1/g1').delete());
      await assertSucceeds(guest.ref('gallery/e1/mine').delete());
    });
  });

  /* ---------------------------------------------------------------- */
  describe('event videos (videos/{eventId}/{id})', () => {
    it('guest CAN upload a tagged video, including a large one (60 MB)', async () => {
      await assertSucceeds(guest.ref('videos/e1/new').put(bytes(), mp4('guest1')));
      await assertSucceeds(guest.ref('videos/e1/big').put(bytes(60 * MB), mp4('guest1')));
    });
    it('cannot upload images or other types as videos', async () => {
      await assertFails(guest.ref('videos/e1/x').put(bytes(), jpeg('guest1')));
      await assertFails(guest.ref('videos/e1/y').put(bytes(), { ...mp4('guest1'), contentType: 'application/zip' }));
    });
    it("cannot overwrite or delete someone else's video", async () => {
      await assertFails(guest.ref('videos/e1/v1').put(bytes(), mp4('guest1')));
      await assertFails(guest.ref('videos/e1/v1').delete());
      await assertSucceeds(guest2.ref('videos/e1/v1').delete());
    });
    it('function-written files at videos/{file} are not client-readable', async () => {
      await assertFails(anon.ref('videos/root-level.mp4').getMetadata());
    });
  });

  /* ---------------------------------------------------------------- */
  describe('guestbook media (guestbook/{eventId}/{images|videos}/{file})', () => {
    it('guest CAN add a guestbook photo or video', async () => {
      await assertSucceeds(guest.ref('guestbook/e1/images/2_me.jpg').put(bytes(), { contentType: 'image/jpeg' }));
      await assertSucceeds(guest.ref('guestbook/e1/videos/2_me.mov').put(bytes(), { contentType: 'video/quicktime' }));
    });
    it('cannot add non-media files or oversized photos', async () => {
      await assertFails(guest.ref('guestbook/e1/images/x.html').put(bytes(), { contentType: 'text/html' }));
      await assertFails(guest.ref('guestbook/e1/images/huge.jpg').put(bytes(51 * MB), { contentType: 'image/jpeg' }));
    });
    it('nobody can overwrite or delete guestbook media from a browser', async () => {
      await assertFails(guest.ref('guestbook/e1/images/1_gb.jpg').put(bytes(), { contentType: 'image/jpeg' }));
      await assertFails(guest.ref('guestbook/e1/images/1_gb.jpg').delete());
      await assertFails(olivia.ref('guestbook/e1/images/1_gb.jpg').delete());
      await assertFails(guest.ref('guestbook/e1/old.png').delete());
    });
    it('signed-in users CAN read; not-signed-in visitors cannot', async () => {
      await assertSucceeds(guest.ref('guestbook/e1/images/1_gb.jpg').getMetadata());
      await assertSucceeds(guest.ref('guestbook/e1/old.png').getMetadata());
      await assertFails(anon.ref('guestbook/e1/images/1_gb.jpg').getMetadata());
    });
  });

  /* ---------------------------------------------------------------- */
  describe('profile photos (thumbnails/{uid}/{file})', () => {
    it('user CAN upload and replace own profile photo (signup)', async () => {
      await assertSucceeds(alice.ref('thumbnails/alice/new.jpg').put(bytes(), { contentType: 'image/png' }));
      await assertSucceeds(alice.ref('thumbnails/alice/me.jpg').put(bytes(), { contentType: 'image/jpeg' }));
    });
    it("cannot write another user's folder or a video thumbnail written by processVideo", async () => {
      await assertFails(guest.ref('thumbnails/alice/me.jpg').put(bytes(), { contentType: 'image/jpeg' }));
      await assertFails(alice.ref('thumbnails/e1/v1.jpg').put(bytes(), { contentType: 'image/jpeg' }));
      await assertFails(alice.ref('thumbnails/e1/v1.jpg').delete());
    });
    it('profile photo must be an image under 20 MB', async () => {
      await assertFails(alice.ref('thumbnails/alice/x.html').put(bytes(), { contentType: 'text/html' }));
      await assertFails(alice.ref('thumbnails/alice/big.jpg').put(bytes(21 * MB), { contentType: 'image/jpeg' }));
    });
    it('anyone CAN read profile photos', async () => {
      await assertSucceeds(anon.ref('thumbnails/alice/me.jpg').getMetadata());
    });
  });

  /* ---------------------------------------------------------------- */
  describe('event cover images (featureImages/{uid}/{file})', () => {
    it('owner CAN upload, replace and read own cover image (Create/EditEvent)', async () => {
      await assertSucceeds(olivia.ref('featureImages/olivia/new.jpg').put(bytes(), { contentType: 'image/jpeg' }));
      await assertSucceeds(olivia.ref('featureImages/olivia/cover.jpg').put(bytes(), { contentType: 'image/webp' }));
      await assertSucceeds(olivia.ref('featureImages/olivia/cover.jpg').getMetadata());
    });
    it("others cannot read or write someone's cover images", async () => {
      await assertFails(alice.ref('featureImages/olivia/cover.jpg').getMetadata());
      await assertFails(alice.ref('featureImages/olivia/x.jpg').put(bytes(), { contentType: 'image/jpeg' }));
    });
    it('cover image must be an image', async () => {
      await assertFails(olivia.ref('featureImages/olivia/x.svg.html').put(bytes(), { contentType: 'text/html' }));
    });
  });

  /* ---------------------------------------------------------------- */
  describe('function-only and other paths', () => {
    it('previews are public to read but never client-writable', async () => {
      await assertSucceeds(anon.ref('previews/e1/v1.mp4').getMetadata());
      await assertFails(guest.ref('previews/e1/x.mp4').put(bytes(), { contentType: 'video/mp4' }));
      await assertFails(guest.ref('previews/e1/v1.mp4').delete());
    });
    it('anything outside the known folders is denied', async () => {
      await assertFails(guest.ref('random/file.jpg').put(bytes(), { contentType: 'image/jpeg' }));
      await assertFails(guest.ref('index.html').put(bytes(), { contentType: 'text/html' }));
    });
  });
});
