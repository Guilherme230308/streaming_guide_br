import { describe, it, expect } from "vitest";

describe("VAPID Push Notification Keys", () => {
  it("should have VAPID_PUBLIC_KEY set in environment", () => {
    const key = process.env.VAPID_PUBLIC_KEY;
    expect(key).toBeDefined();
    expect(key!.length).toBeGreaterThan(20);
  });

  it("should have VAPID_PRIVATE_KEY set in environment", () => {
    const key = process.env.VAPID_PRIVATE_KEY;
    expect(key).toBeDefined();
    expect(key!.length).toBeGreaterThan(10);
  });

  it("should have VITE_VAPID_PUBLIC_KEY set for frontend", () => {
    const key = process.env.VITE_VAPID_PUBLIC_KEY;
    expect(key).toBeDefined();
    expect(key!.length).toBeGreaterThan(20);
  });

  it("VITE_VAPID_PUBLIC_KEY should match VAPID_PUBLIC_KEY", () => {
    expect(process.env.VITE_VAPID_PUBLIC_KEY).toBe(process.env.VAPID_PUBLIC_KEY);
  });
});
