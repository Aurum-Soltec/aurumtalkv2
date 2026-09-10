import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { useRealtimeChannel } from "@/hooks/realtime/useRealtimeChannel";

const mock = vi.hoisted(() => ({ setAuth: vi.fn(), channel: vi.fn(), removeChannel: vi.fn() }));
vi.mock("@/lib/supabase/browser", () => ({
  createClient: () => ({ realtime: { setAuth: mock.setAuth }, channel: mock.channel,
    removeChannel: mock.removeChannel }),
}));

it("não assina até a callback canônica terminar de autenticar", async () => {
  let resolve!: () => void;
  mock.setAuth.mockReturnValue(new Promise<void>((done) => { resolve = done; }));
  const channel = { subscribe: vi.fn(), on: vi.fn() };
  channel.on.mockReturnValue(channel);
  mock.channel.mockReturnValue(channel);
  const { unmount } = renderHook(() => useRealtimeChannel({ name: "teste", onChange: vi.fn() }));
  expect(channel.subscribe).not.toHaveBeenCalled();
  await act(async () => resolve());
  expect(channel.subscribe).toHaveBeenCalledOnce();
  unmount();
});
