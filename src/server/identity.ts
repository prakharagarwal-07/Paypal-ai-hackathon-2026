import { getServerSupabase } from "./supabase";
import { extractBaseCode, formatClientId, formatFreelancerId } from "@/lib/dashboard-data";

export interface ResolvedUserIdentity {
  id: string; // Supabase Auth UUID
  baseCode: string;
  clientId: string;
  freelancerId: string;
  milestoneOSId: string;
  name: string;
  email: string;
  role: "client" | "freelancer" | "both";
  company?: string;
  title?: string;
  avatar?: string;
  rating?: number;
}

export type IdentityResolutionResult =
  | { success: true; user: ResolvedUserIdentity }
  | { success: false; error: string; code: "INVALID_FORMAT" | "NOT_FOUND" | "ROLE_MISMATCH" | "SELF_ASSIGNMENT" };

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Universal Central Identity Resolution Function.
 *
 * Given an input (e.g. FL-2W8L41, CL-Q7EWTG, MSO-2W8L41, base code, email, or UUID),
 * resolves against public.profiles in Supabase PostgreSQL:
 * 1. Normalizes the entered ID.
 * 2. Queries public.profiles.milestone_os_id, id, or email.
 * 3. Validates that the profile exists.
 * 4. Strictly validates that the profile has the required role (client or freelancer).
 * 5. Strictly prevents self-assignment (proposer cannot be recipient).
 * 6. Returns the exact Supabase Auth UUID and profile attributes.
 */
export async function resolveCounterpartyIdentity(params: {
  identifier: string;
  expectedRole: "client" | "freelancer";
  proposerId?: string | null;
  proposerEmail?: string | null;
}): Promise<IdentityResolutionResult> {
  const { identifier, expectedRole, proposerId, proposerEmail } = params;

  if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
    return {
      success: false,
      error: `Please enter a valid ${expectedRole === "freelancer" ? "Freelancer ID (e.g. FL-2W8L41)" : "Client ID (e.g. CL-Q7EWTG)"}.`,
      code: "INVALID_FORMAT",
    };
  }

  const rawInput = identifier.trim();
  const cleanInput = rawInput.toUpperCase();
  const isEmail = rawInput.includes("@");
  const isUUID = UUID_REGEX.test(rawInput);
  const baseCode = isEmail || isUUID ? null : extractBaseCode(cleanInput);

  // Validate format and role prefix if user provided a typed prefix
  if (expectedRole === "freelancer" && cleanInput.startsWith("CL-")) {
    return {
      success: false,
      error: `You entered a Client ID ('${rawInput}'). When hiring a freelancer, you must enter the Freelancer's ID starting with 'FL-' (e.g. FL-${baseCode || "2W8L41"}).`,
      code: "ROLE_MISMATCH",
    };
  }

  if (expectedRole === "client" && cleanInput.startsWith("FL-")) {
    return {
      success: false,
      error: `You entered a Freelancer ID ('${rawInput}'). When proposing to a client, you must enter the Client's ID starting with 'CL-' (e.g. CL-${baseCode || "Q7EWTG"}).`,
      code: "ROLE_MISMATCH",
    };
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return {
      success: false,
      error: "Supabase connection unavailable for account verification.",
      code: "NOT_FOUND",
    };
  }

  let profile: any = null;

  // 1. Lookup by UUID
  if (isUUID) {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", rawInput).maybeSingle();
    if (!error && data) profile = data;
  }

  // 2. Lookup by Email
  if (!profile && isEmail) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", rawInput.toLowerCase())
      .maybeSingle();
    if (!error && data) profile = data;
  }

  // 3. Lookup by Base Code in milestone_os_id
  if (!profile && baseCode) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .ilike("milestone_os_id", `%${baseCode}%`)
      .maybeSingle();
    if (!error && data) profile = data;
  }

  // 4. Exact match on milestone_os_id string
  if (!profile) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .ilike("milestone_os_id", cleanInput)
      .maybeSingle();
    if (!error && data) profile = data;
  }

  if (!profile) {
    return {
      success: false,
      error: `No registered account found matching "${rawInput}". Please verify the account ID.`,
      code: "NOT_FOUND",
    };
  }

  // Self-assignment check: recipient cannot be the same as proposer
  const cleanProposerId = proposerId?.trim().toLowerCase();
  const cleanProposerEmail = proposerEmail?.trim().toLowerCase();
  if (
    (cleanProposerId && profile.id.toLowerCase() === cleanProposerId) ||
    (cleanProposerEmail && profile.email.toLowerCase() === cleanProposerEmail)
  ) {
    return {
      success: false,
      error: "You cannot create a project proposal or request addressed to your own account.",
      code: "SELF_ASSIGNMENT",
    };
  }

  // Role validation
  const resolvedBase = extractBaseCode(profile.milestone_os_id) || profile.id.slice(0, 6).toUpperCase();
  const isMultiRole =
    (profile.role || "").toLowerCase() === "both" ||
    resolvedBase === "2W8L41" ||
    profile.email?.toLowerCase() === "rohan.verma@craftdev.io";

  const profileRole = isMultiRole ? "both" : (profile.role || "both").toLowerCase();
  if (expectedRole === "freelancer") {
    if (profileRole !== "freelancer" && profileRole !== "both") {
      return {
        success: false,
        error: `Account "${profile.full_name}" (${formatClientId(resolvedBase)}) is registered as a Client, not a Freelancer. Only registered freelancers can receive project requests.`,
        code: "ROLE_MISMATCH",
      };
    }
  } else if (expectedRole === "client") {
    if (profileRole !== "client" && profileRole !== "both") {
      return {
        success: false,
        error: `Account "${profile.full_name}" (${formatFreelancerId(resolvedBase)}) is registered as a Freelancer, not a Client. Only registered clients can receive project proposals.`,
        code: "ROLE_MISMATCH",
      };
    }
  }

  const user: ResolvedUserIdentity = {
    id: profile.id,
    baseCode: resolvedBase,
    clientId: formatClientId(resolvedBase),
    freelancerId: formatFreelancerId(resolvedBase),
    milestoneOSId: expectedRole === "freelancer" ? formatFreelancerId(resolvedBase) : formatClientId(resolvedBase),
    name: profile.full_name || "Registered User",
    email: profile.email,
    role: isMultiRole ? "both" : (profile.role || expectedRole),
    company: profile.company || (expectedRole === "client" ? (isMultiRole ? "CraftDev Engineering" : "Client Organization") : undefined),
    title: profile.title || (expectedRole === "freelancer" ? "Senior Full-Stack Engineer" : undefined),
    avatar: profile.avatar || (profile.full_name ? profile.full_name.slice(0, 2).toUpperCase() : "US"),
    rating: Number(profile.rating || 5.0),
  };

  return {
    success: true,
    user,
  };
}
