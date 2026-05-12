import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  isVerified?: boolean;
  isAdmin?: boolean;
  rizzScore?: number;
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
  onboardingCompleted?: boolean;
  customStatus?: string | null;
  dnd?: boolean;
  interests?: string[];
  isFollowing?: boolean;
  isFollowingBack?: boolean;
  isBlocked?: boolean;
  isOnline?: boolean;
  lastSeenAt?: string | null;
  topBadge?: Badge | null;
}

export interface Post {
  id: number;
  authorId: string;
  content: string;
  mediaUrl?: string | null;
  tags: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  isLiked: boolean;
  isSaved: boolean;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    isVerified?: boolean;
    topBadge?: Badge | null;
  } | null;
}

export interface Comment {
  id: number;
  postId: number;
  authorId: string;
  content: string;
  createdAt: string;
  author: { id: string; username: string; displayName: string; avatarUrl?: string | null } | null;
}

export interface Story {
  id: number;
  authorId: string;
  mediaUrl: string;
  type: string;
  caption?: string | null;
  textOverlay?: unknown;
  expiresAt: string;
  viewCount: number;
  createdAt: string;
  viewed: boolean;
  author: { id: string; username: string; displayName: string; avatarUrl?: string | null } | null;
}

export interface StoryGroup {
  user: { id: string; username?: string; displayName?: string; avatarUrl?: string | null };
  stories: Story[];
  hasUnviewed: boolean;
}

export interface Conversation {
  id: number;
  createdAt: string;
  participants: { id: string; username: string; displayName: string; avatarUrl?: string | null }[];
  lastMessage: { content: string; createdAt: string; senderId: string } | null;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: string;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  sender: { id: string; username: string; displayName: string; avatarUrl?: string | null } | null;
  reactions: { emoji: string; count: number; users: string[]; hasReacted: boolean }[];
}

export interface Group {
  id: number;
  name: string;
  ownerId: string;
  createdAt: string;
}

export interface Badge {
  id: number;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  createdAt?: string;
  owned?: boolean;
  earnedAt?: string | null;
}

export interface Notification {
  id: number;
  userId: string;
  actorId?: string | null;
  type: string;
  entityId?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
  actor: { id: string; username: string; displayName: string; avatarUrl?: string | null } | null;
}

export interface Server {
  id: number;
  name: string;
  description?: string | null;
  iconUrl?: string | null;
  ownerId: string;
  memberCount: number;
  tags: string[];
  createdAt: string;
}

export interface Channel {
  id: number;
  serverId: number;
  name: string;
  type: string;
}

export function useGetHomeFeed() {
  return useQuery({
    queryKey: ["/api/feed"],
    queryFn: () => apiFetch<{ posts: Post[] }>("/api/feed").then((r) => r.posts),
  });
}

export function useGetSavedPosts() {
  return useQuery({
    queryKey: ["/api/feed/saved"],
    queryFn: () => apiFetch<{ posts: Post[] }>("/api/feed/saved").then((r) => r.posts),
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: string; mediaUrl?: string; tags?: string[] }) =>
      apiFetch<Post>("/api/posts", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/feed"] }); },
  });
}

export function useLikePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) =>
      apiFetch<{ ok: boolean }>(`/api/posts/${postId}/like`, { method: "POST" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/feed"] }); },
  });
}

export function useUnlikePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) =>
      apiFetch<{ ok: boolean }>(`/api/posts/${postId}/unlike`, { method: "POST" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/feed"] }); },
  });
}

export function useSavePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) =>
      apiFetch<{ ok: boolean }>(`/api/posts/${postId}/save`, { method: "POST" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/feed"] }); },
  });
}

export function useUnsavePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) =>
      apiFetch<{ ok: boolean }>(`/api/posts/${postId}/unsave`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/feed"] });
      qc.invalidateQueries({ queryKey: ["/api/feed/saved"] });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) =>
      apiFetch<{ ok: boolean }>(`/api/posts/${postId}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/feed"] }); },
  });
}

export function useGetPostComments(postId: number) {
  return useQuery({
    queryKey: ["/api/posts", postId, "comments"],
    queryFn: () => apiFetch<{ comments: Comment[] }>(`/api/posts/${postId}/comments`).then((r) => r.comments),
    enabled: !!postId,
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, content }: { postId: number; content: string }) =>
      apiFetch<Comment>(`/api/posts/${postId}/comments`, { method: "POST", body: JSON.stringify({ content }) }),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["/api/posts", v.postId, "comments"] }); },
  });
}

export function useListStories() {
  return useQuery({
    queryKey: ["/api/stories"],
    queryFn: () => apiFetch<{ groups: StoryGroup[] }>("/api/stories").then((r) => r.groups),
  });
}

export function useCreateStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { mediaUrl: string; type: string; caption?: string; textOverlay?: unknown }) =>
      apiFetch<Story>("/api/stories", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/stories"] }); },
  });
}

export function useViewStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (storyId: number) =>
      apiFetch<{ ok: boolean }>(`/api/stories/${storyId}/view`, { method: "POST" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/stories"] }); },
  });
}

export function useGetBadges() {
  return useQuery({
    queryKey: ["/api/badges"],
    queryFn: () => apiFetch<{ badges: Badge[] }>("/api/badges").then((r) => r.badges),
  });
}

export function useListNotifications() {
  return useQuery({
    queryKey: ["/api/notifications"],
    queryFn: () => apiFetch<{ notifications: Notification[] }>("/api/notifications").then((r) => r.notifications),
  });
}

export function useListConversations() {
  return useQuery({
    queryKey: ["/api/dm/conversations"],
    queryFn: () => apiFetch<{ conversations: Conversation[] }>("/api/dm/conversations").then((r) => r.conversations),
  });
}

export function useGetDmMessages(conversationId: number) {
  return useQuery({
    queryKey: ["/api/dm/conversations", conversationId, "messages"],
    queryFn: () =>
      apiFetch<{ messages: Message[] }>(`/api/dm/conversations/${conversationId}/messages`).then((r) => r.messages),
    enabled: !!conversationId,
    refetchInterval: 3000,
  });
}

export function useSendDmMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: number; content: string }) =>
      apiFetch<Message>(`/api/dm/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["/api/dm/conversations", v.conversationId, "messages"] });
      qc.invalidateQueries({ queryKey: ["/api/dm/conversations"] });
    },
  });
}

export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      apiFetch<Conversation>("/api/dm/conversations", { method: "POST", body: JSON.stringify({ userId }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/dm/conversations"] }); },
  });
}

export function useListGroups() {
  return useQuery({
    queryKey: ["/api/groups"],
    queryFn: () => apiFetch<{ groups: Group[] }>("/api/groups").then((r) => r.groups),
  });
}

export function useGetGroupMessages(groupId: number) {
  return useQuery({
    queryKey: ["/api/groups", groupId, "messages"],
    queryFn: () =>
      apiFetch<{ messages: Message[] }>(`/api/groups/${groupId}/messages`).then((r) => r.messages),
    enabled: !!groupId,
    refetchInterval: 3000,
  });
}

export function useSendGroupMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, content }: { groupId: number; content: string }) =>
      apiFetch<Message>(`/api/groups/${groupId}/messages`, { method: "POST", body: JSON.stringify({ content }) }),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["/api/groups", v.groupId, "messages"] }); },
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiFetch<Group>("/api/groups", { method: "POST", body: JSON.stringify({ name }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/groups"] }); },
  });
}

export function useSendTypingIndicator() {
  return useMutation({
    mutationFn: (conversationId: number) =>
      apiFetch<{ ok: boolean }>(`/api/dm/conversations/${conversationId}/typing`, { method: "POST" }),
  });
}
