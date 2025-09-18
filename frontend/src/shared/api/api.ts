import User from "../interface/User.js";
import Message from "../interface/Message.js";

async function fetchWithLog(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const url = typeof input === "string" ? input : input.url;
  const method = init?.method || "GET";
  console.log("[FETCH]", method, url);

  const response = await fetch(input, init);

  if (!response.ok) {
    const status = response.status;
    const logMethod = status >= 400 && status < 600 ? console.warn : console.error;

    // Try to extract error message for clarity
    let message = '';
    try {
      const data = await response.clone().json();
      message = data?.message || data?.error || '';
    } catch {
      message = response.statusText;
    }

    logMethod(`[FETCH WARNING] ${status} ${method} ${url} - ${message}`);
  }

  return response;
}

// =============================================================================
// User Context:
// =============================================================================

async function fetchUsers(): Promise<User[]> {
  const response = await fetchWithLog("/api/user/all-users");
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }
  return response.json();
}

async function fetchOnlineUsers(): Promise<number[]> {
  const response = await fetchWithLog("/api/user/online-users", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch online users");
  }
  return response.json();
}

async function register(
  username: string,
  password: string,
): Promise<{ message: string }> {
  const response = await fetchWithLog("/api/user/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Registration failed");
  }
  return data;
}

async function login(
  username: string,
  password: string,
): Promise<{ message: string }> {
  const response = await fetchWithLog("/api/user/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Login failed");
  }

  return data;
}

async function logout(): Promise<{ message: string }> {
  const response = await fetchWithLog("/api/user/logout", {
    method: "POST",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Logout has failed");
  }

  return data;
}

// api.ts
async function updateUser(userId: number, key: string, newValue: string) {
  const response = await fetchWithLog(`/api/user/${userId}/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ [key]: newValue }),
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    // Don't throw — let caller handle
    return { ok: false, status: response.status, message: data.message || "Update failed" };
  }

  return { ok: true, data };
}

async function getCurrentUser() {
  try {
    const response = await fetchWithLog("/api/user/current-user", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Not logged in");
    const user: User = await response.json();
    window.app.state.user = user ?? null;
  } catch {
    console.warn("No logged-in user found");
    window.app.state.user = null;
  }
}

async function fetchUserStats(userId: number) {
  const response = await fetchWithLog(`/api/match/stats/${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.error || `Failed to get match stats for user ${userId}`,
    );
  }

  return data;
}

async function fetchUsername(userId: number) {
  try {
    const response = await fetchWithLog(`/api/user/username/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      console.error(`fetchUsername: Failed to fetch username for ${userId}`);
      return null;
    }

    const data = await response.json();
    console.log(`fetchUsername: Successfully fetched username for ${userId}: ${data.username}`);
    return data.username;
  } catch (error) {
    console.error("fetchUsername: Error fetching username: ", error);
    return null;
  }
}

async function fetchAlias(userId: number) {
  try {
    const response = await fetchWithLog(`/api/tournament/alias/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      console.error(`fetchAlias: Failed to fetch alias for ${userId}`);
      return null;
    }

    const data = await response.json();
    console.log(`fetchAlias: Successfully fetched alias for ${userId}: ${data.alias}`);
    return data.alias;
  } catch (error) {
    console.error("fetchAlias: Error fetching alias: ", error);
    return null;
  }
}

async function uploadAvatar(file: File): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetchWithLog("/api/user/avatar", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to upload avatar");
  }

  return data;
}

// =============================================================================
// Chat Context:
// =============================================================================

async function fetchChatHistory(recipientId: number): Promise<Message[]> {
  const response = await fetchWithLog(`/api/chat/private-messages/${recipientId}`);
  if (!response.ok) {
    throw new Error("Failed to fetchChatHistory");
  }
  return response.json();
}

async function fetchChatPartners(): Promise<User[]> {
  const response = await fetchWithLog("/api/chat/conversations", {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetchChatPartners");
  }

  return response.json();
}

// =============================================================================
// Friendship Context:
// =============================================================================

async function requestFriendship(
  recipientIds?: number[],
): Promise<{ message: string; status?: string }> {
  const response = await fetchWithLog("/api/invitations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ recipientIds, type: "friendship" }),
  });

  console.log(
    "sending friendship request, recipient id passed to requestFriendship: ",
    recipientIds,
  );

  let data;
  try {
    data = await response.json();
  } catch (e) {
    console.error("Error parsing JSON from server:", e);
    throw new Error("Failed to parse server response.");
  }

  if (!response.ok && !data.status) {
    throw new Error(data.message || "Failed to send friend request");
  }

  return data;
}


async function removeFriendship(user2Id?: number): Promise<{ message: string }>
{
const response = await fetchWithLog("/api/friendship/remove", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ user2Id: user2Id }),
  });
  if (!response.ok) {
    let errorMessage = "Failed to remove friendship";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      console.error("Error parsing error response", e);
    }
    throw new Error(errorMessage);
  }
  const data = await response.json();
  return data;
}

async function acceptInvitation(
  invitationId?: string,
): Promise<{ message: String }> {
  const response = await fetchWithLog(`/api/invitations/${invitationId}/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ recipientId: String(window.app.state.user?.id) }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw {
      status: response.status,
      message: errorData.error || "Failed to accept invitation",
    };
  }
  const data = await response.json();
  return data;
}

async function declineInvitation(
  invitationId?: String,
): Promise<{ message: String }> {
  const response = await fetchWithLog(`/api/invitations/${invitationId}/decline`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ recipientId: String(window.app.state.user?.id) }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw {
      status: response.status,
      message: errorData.error || "Failed to accept invitation",
    };
  }
  const data = await response.json();
  return data;
}

async function fetchFriends() {
  const response = await fetchWithLog("/api/friends", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch friends");
  return response.json(); 
}

async function fetchSentInvitations() {
  const response = await fetchWithLog("/api/invitations/user", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch invitations");
  return response.json();
}


// =============================================================================
// Match Context:
// =============================================================================

async function fetchMatchHistory(userId: number) {
  const response = await fetchWithLog(`/api/match/${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.error || `Failed to get match history for user ${userId}`,
    );
  }
  return data;
}

// =============================================================================
// Block Context:
// =============================================================================

async function blockUser(blockedId: number): Promise<boolean> {
  try {
    const response = await fetchWithLog(`/api/block/blockUser/${blockedId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      console.error(`Failed to block user ${blockedId}`);
      return false;
    }
    console.log("blocking user ", blockedId);
    return true;
  } catch (error) {
    console.error("Failed to block user: ", error);
    return false;
  }
}

async function unblockUser(blockedId: number): Promise<boolean> {
  try {
    const response = await fetchWithLog(`/api/block/unblockUser/${blockedId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      console.error(`Failed to unblock user ${blockedId}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to unblock user: ", error);
    return false;
  }
}

async function fetchBlockedUsers(): Promise<User[]> {
  try {
    const response = await fetchWithLog(`/api/block/fetchBlockedUsers`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      console.error(`Failed to get blocked users: api response not ok`);
      console.log(response);
      return [];
    }

    const data = await response.json();
    console.log("🚀🚀🚀🚀🚀 fetch blocked usersdata", data);
    return data;
  } catch (error) {
    console.error("Failed to get blocked users");
    return [];
  }
}


async function fetchAllBlockedUsers(): Promise<User[]> {
  try {
    const response = await fetchWithLog(`/api/block/fetchAllBlockedUsers`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      console.error(`Failed to get all blocked users: api response not ok`);
      console.log(response);
      return [];
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Failed to get all blocked users");
    return [];
  }
}

async function isBlocked(blockedId: number): Promise<boolean> {
  try {
    const response = await fetchWithLog(`/api/block/isBlocked/${blockedId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      console.error(`Failed to see if user ${blockedId} is blocked`);
      return false;
    }

    const data = await response.json();
    return data.isBlocked === true;
  } catch (error) {
    console.error("Failed to check if isBlocked: ", error);
    return false;
  }
}

// =============================================================================
// Notification Context:
// =============================================================================
async function deleteNotifForMutualInvitation(currentUserId: number | undefined, otherUserId: number): Promise<boolean> {
  try {
      const response = await fetch(`/api/notifications/delete/mutual-invitation`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({userAId: currentUserId, userBId: otherUserId }),
    });

    if (!response.ok) {
      console.error(`Failed to delete handled-invitation-related notifications`);
      return false;
    }

    //const data = await response.json();
    return true;
  } catch (error) {
    console.error("Failed to delete handled-invitation-related notifications ", error);
    return false;
}
}

async function deleteMutualInvitation(currentUserId: number | undefined, otherUserId: number) {
  try {
      const response = await fetch(`/api/invitations/delete/mutual-invitation`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({userAId: currentUserId, userBId: otherUserId }),
    });

    if (!response.ok) {
      console.error(`Failed to delete mutual invitation`);
      return false;
    }

    const data = await response.json();
  } catch (error) {
    console.error("Failed to delete mutual invitation", error);
    return false;
}
}

async function deleteHandledNotif(notifId: number, currentUserId: number | undefined) {
  if (!notifId)
    return;
  try {
      const response = await fetch(`/api/notifications/delete/handled`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ notifId: notifId, recipientId: currentUserId }),
    });

    if (!response.ok) {
      console.error(`Failed to delete handled notifications`);
      return false;
    }

    //const data = await response.json();
  } catch (error) {
    console.error("Failed to delete handled notifications ", error);
    return false;
}
}
// =============================================================================
// Exports:
// =============================================================================

const api = {
  fetchUsers,
  fetchAlias,
  fetchOnlineUsers,
  register,
  requestFriendship,
  removeFriendship,
  fetchFriends,
  fetchSentInvitations,
  login,
  logout,
  fetchChatHistory,
  fetchChatPartners,
  updateUser,
  getCurrentUser,
  fetchUserStats,
  fetchMatchHistory,
  fetchUsername,
  blockUser,
  unblockUser,
  fetchBlockedUsers,
  fetchAllBlockedUsers,
  isBlocked,
  uploadAvatar,
  acceptInvitation,
  declineInvitation,
  deleteNotifForMutualInvitation,
  deleteMutualInvitation,
  deleteHandledNotif,
};

export default api;
