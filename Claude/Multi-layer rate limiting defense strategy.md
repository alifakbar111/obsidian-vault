Basic rate limiting: 100 requests per IP per minute. Attacker spins up 1000 IPs. Each sends 99 requests. Here's the complete defense

Layer 1 + Stop trusting IP addresses IP rate limiting alone is dead. Move to identity based limiting + API key rate limiting + User ID rate limiting ⁃ Account level limiting 1000 IPs but one API key? Still rate limited

Layer 2 + Fingerprinting Attackers change IPs. They can't easily change everything Track combinations of:

- User agent
- Accept-Language header + TLS fingerprint (JA3) + Request pattern + timing
- Pavload structure Same fingerprint across different IPs = same attacker. Block the fingerprint.

Laver 3 -+ Behavioral analysis Legitimate users have patterns. Attackers don't Flag accounts that: ⁃ Never pause between requests

- Hit exact rate limit every time + Access endpoints in unusual order
- Have zero failed requests (real users make mistakes Machine behavior human behavior. Detect the difference

Layer 4 + CAPTCHA + challenges Suspected bot? Don't block immediatelv. Challenge them: -+ Invisible CAPTCHA (Google reCAPTCHA v3) -+ Proof of work challenge

- JavaScript execution check(bots often can't run JS) Real users pass. Bots fail silently.

Layer 5 + Geo + ASN blocking 1000 IPs but all from: + Same data center (AWS/Azure/GCP ‣ Same country

- Same ASN (Autonomous Svstem Number) Block the ASN. Not individual IPs. One rule blocks thousands.

Layer 6 + Progressive penalties Don't immediately hard block. Slow down suspicious traffic first ++ Normal user instant response + Suspicious + 2 second delay + More suspicious + 10 second delay ⁃ Confirmed bot + 429 + block Attackers move on. Real users barely notice

Layer 7 -+ WAF + DDoS protection, For production systems: + Cloudflare WAF +‣ AWS WAF + Shield ‣ Akamai Bot Manager These operate at network level. Before requests reach your servers. Industry standard for a reason.

Great topic to dig into — this list is solid, and understanding _why_ each layer exists matters more than memorizing them. Let me give you one mental model first, because it makes all seven click.

Any rate limiter is really three decisions:

1. **What do you count against?** (the "key" — IP, user, fingerprint…)
2. **How do you count?** (the algorithm — token bucket, sliding window…)
3. **What do you do when the limit is hit?** (the response — block, delay, challenge…)

The attack in your example works because the key is _IP_, and IPs are cheap to get 1000 of. So most layers are about finding a **better key** or a **smarter response**. Here's each one.

---

**Layer 1 — Identity-based limiting**

The fix is: stop keying on IP, key on _who they are_. An API key or user ID can't be spun up 1000 times for free the way IPs can. So your counter's key becomes the identity, not the network origin.

In practice you keep several limiters at once, each with its own key and its own budget:

```go
// Gin middleware sketch, using Redis
key := "rl:user:" + userID          // 1000/min
// key := "rl:apikey:" + apiKey     // 5000/min
// key := "rl:ip:" + clientIP       // 100/min (still useful as a floor)

count, _ := rdb.Incr(ctx, key).Result()
if count == 1 {
    rdb.Expire(ctx, key, time.Minute)
}
if count > limit {
    c.AbortWithStatus(429)
    return
}
```

Now "1000 IPs, one API key" trips the API-key limiter regardless of IP. IP limiting doesn't die — it becomes a backstop for _unauthenticated_ traffic where you have no better key.

**Layer 2 — Fingerprinting**

For traffic you _can't_ tie to an identity (login pages, signup, anonymous endpoints), you build a synthetic key from things that stay constant even when the IP changes. The strongest signal is **JA3/JA4** — a hash of the parameters in the TLS handshake (cipher list, extensions, order). A given tool/library produces the same JA3 no matter what IP it comes from.

You combine signals into one fingerprint:

```
fingerprint = hash(JA3 + User-Agent + Accept-Language + header-order)
```

Same fingerprint appearing across 300 different IPs in a minute = one actor. The important caveat for you as a beginner: fingerprints are a _correlation_ signal, not an identity. Thousands of real people run the exact same Chrome version, so you rate-limit or challenge on fingerprint — you rarely hard-block on it alone.

**Layer 3 — Behavioral analysis**

Humans are irregular; bots are suspiciously clean. You track per-account stats over time and flag the outliers. The classic tells:

- Inter-request timing has almost zero variance (humans pause, misclick, get distracted)
- Requests land _exactly_ at the rate limit, every window
- Endpoints hit in a perfect order with no exploratory browsing
- A 0% error rate — real users hit 404s, mistype, abandon forms

Concretely: record timestamps per account and look at the spread. `stddev(intervals) < 50ms` across hundreds of requests is machine-like. This layer is the hardest to get right and usually feeds a _score_ rather than a yes/no.

**Layer 4 — CAPTCHA & challenges**

When something looks suspicious but you're not sure, don't punish — _test_. A challenge lets real users through and quietly fails bots:

- **reCAPTCHA v3** returns a score from 0.0 to 1.0; you decide the threshold (e.g. below 0.3 → block, 0.3–0.7 → extra challenge).
- **Proof of work** — make the client compute a small hash puzzle. Trivial once, expensive at 100k requests.
- **JS execution check** — many scripted clients don't run JavaScript, so a token that only a real browser can generate weeds them out.

The point is graceful handling: a wrongly-flagged real user solves a puzzle and moves on, instead of getting a hard 403.

**Layer 5 — Geo / ASN blocking**

An **ASN** (Autonomous System Number) identifies who owns a block of IPs. Real consumer users come from residential ISP ASNs. If 1000 IPs all belong to AWS (ASN 16509), GCP, OVH, or Hetzner, that's datacenter traffic — normal people don't browse from a server rack. So you block or challenge the _ASN_, and one rule covers thousands of IPs at once.

```
if asn in DATACENTER_ASNS and endpoint == "/signup":
    require_challenge()
```

Caveats worth knowing early: corporate VPNs and some mobile carriers look unusual too, and sophisticated attackers rent _residential_ proxy networks specifically to defeat this. So it's high-value but not airtight.

**Layer 6 — Progressive penalties (tarpitting)**

Instead of flipping straight to 429, you _slow down_ suspicious traffic. This is called tarpitting, and it's clever: latency is nearly free for you but ruinous for an attacker doing volume, while a mistakenly-flagged human barely notices 2 seconds.

```
normal      → respond immediately
suspicious  → sleep 2s, then respond
worse       → sleep 10s
confirmed   → 429 + block
```

Attackers optimizing for throughput give up and move to an easier target; a real person shrugs.

**Layer 7 — WAF & DDoS protection**

Everything above runs _on your servers_, which means the traffic already reached you. At real attack volume (a genuine DDoS), your servers fall over before your clever logic runs. A WAF/edge provider — Cloudflare, AWS WAF + Shield, Akamai — filters traffic **at the network edge**, before it hits your origin. They bring managed bot rules, IP reputation lists, and edge rate limiting, and they can absorb volumetric floods you physically can't handle at the app layer.

This is "industry standard" because you cannot self-host your way out of a 500 Gbps flood — you need someone with a bigger pipe sitting in front of you.

---

**How this fits together, and where to start**

Think of it as defense in depth: each layer catches what the previous one misses, and every layer trades some _false-positive risk_ for coverage. Blocking too aggressively locks out real customers, which is often worse than letting a few bad requests through — that tension is the whole art of it.

If you're building this for the first time, don't do all seven at once. The highest value for the least effort:

1. Put a WAF in front (Layer 7) — Cloudflare's free tier already does a lot.
2. Add identity-based limiting in your app (Layer 1) with Redis.
3. Then add challenges (Layer 4) on your sensitive endpoints (login, signup, password reset).

Layers 2, 3, 5, 6 are refinements you add once you actually see abuse and know what shape it takes.

Since you're on Go/Gin, want me to sketch a fuller Redis-backed rate-limit middleware — say, a proper sliding-window or token-bucket implementation with multiple keys — that you could drop into a service?