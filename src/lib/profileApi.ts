import type { UserProfile } from "../components/app/OnboardingFlow";

const API_BASE = "https://sat-salary-api.gabrielaxy.workers.dev";

export async function fetchProfile(
  address: string,
): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/profile/${address.toLowerCase()}`);
    if (res.status === 204 || !res.ok) return null;
    const data = (await res.json()) as UserProfile;
    if (
      (data as { personName?: string }).personName === "_cleared" ||
      !(data as { personName?: string }).personName
    )
      return null;
    return data;
  } catch {
    return null;
  }
}

export async function saveProfileRemote(
  address: string,
  profile: UserProfile,
): Promise<void> {
  try {
    await fetch(`${API_BASE}/profile/${address.toLowerCase()}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
  } catch {}
}
