import { signAccessToken, verifyAccessToken, hashPassword, verifyPassword, hashToken } from "@/lib/auth-server";

describe("auth-server", () => {
  const payload = { sub: "user-1", tenant_id: "tenant-1", email: "test@hostpro.fr", role: "admin" };

  test("signAccessToken / verifyAccessToken — round trip", () => {
    const token = signAccessToken(payload);
    expect(typeof token).toBe("string");
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  test("verifyAccessToken — token invalide lance une erreur", () => {
    expect(() => verifyAccessToken("invalid.token.here")).toThrow();
  });

  test("hashPassword / verifyPassword — valid", async () => {
    const hash = await hashPassword("mySecretPassword");
    expect(hash).not.toBe("mySecretPassword");
    const valid = await verifyPassword("mySecretPassword", hash);
    expect(valid).toBe(true);
  });

  test("hashPassword / verifyPassword — mauvais mot de passe", async () => {
    const hash = await hashPassword("correct");
    const valid = await verifyPassword("wrong", hash);
    expect(valid).toBe(false);
  });

  test("hashToken — déterministe", () => {
    const token = "my-refresh-token";
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).toHaveLength(64);
    expect(hashToken(token)).not.toBe(hashToken("other-token"));
  });
});
