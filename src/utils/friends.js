import { supabase } from "./supabase";

// Search users by username
export async function searchUsers(query) {
  if (!query.trim()) return [];
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_color, list_public")
    .ilike("username", `%${query}%`)
    .limit(10);
  return data || [];
}

// Get user profile by username
export async function getProfileByUsername(username) {
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_color, list_public")
    .eq("username", username)
    .single();
  return data;
}

// Get user's public list
export async function getUserList(userId) {
  const { data } = await supabase
    .from("media_list")
    .select("*")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });
  return data || [];
}

// Send friend request
export async function sendFriendRequest(requesterId, addresseeId) {
  const { error } = await supabase
    .from("friendships")
    .insert({ requester_id: requesterId, addressee_id: addresseeId, status: "pending" });
  return { error };
}

// Accept friend request
export async function acceptFriendRequest(friendshipId) {
  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId);
  return { error };
}

// Reject/remove friend
export async function removeFriend(friendshipId) {
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);
  return { error };
}

// Get all friendships for current user
export async function getFriendships(userId) {
  const { data } = await supabase
    .from("friendships")
    .select("*, requester:requester_id(id, username, display_name, avatar_color), addressee:addressee_id(id, username, display_name, avatar_color)")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
  return data || [];
}

// Get friendship status between two users
export async function getFriendshipStatus(userId, otherId) {
  const { data } = await supabase
    .from("friendships")
    .select("*")
    .or(`and(requester_id.eq.${userId},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${userId})`)
    .single();
  return data;
}
