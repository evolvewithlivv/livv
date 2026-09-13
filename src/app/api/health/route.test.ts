import { GET } from "./route";

describe("GET /api/health", () => {
  it("returns a non-cached public health signal without sensitive data", async () => {
    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true, service: "livv" });
    expect(body).not.toHaveProperty("env");
    expect(body).not.toHaveProperty("supabase");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-robots-tag")).toContain("noindex");
  });
});
