import http from "./http";
import type { UserDto } from "../services/types";

export interface PageParams {
  page?: number; // 1-based
  pageSize?: number;
  username?: string;
  email?: string;
}

export interface PageResult<T> {
  total: number;
  items: T[];
}

// Backend swagger does not provide explicit pagination params.
// We'll fetch all and simulate paging on the client for now.
export async function listUsers(params: PageParams): Promise<PageResult<UserDto>> {
  const resp = await http.get<UserDto[]>("/user");
  const all = resp.data || [];
  const { page = 1, pageSize = 10, username, email } = params || {};
  const filtered = all.filter((u) =>
    (username ? (u.username || "").includes(username) : true) &&
    (email ? (u.email || "").includes(email) : true)
  );
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);
  return { total: filtered.length, items };
}

export async function getUser(id: number): Promise<UserDto> {
  const resp = await http.get<UserDto>(`/user/${id}`);
  return resp.data;
}

export async function createUser(payload: Partial<UserDto>): Promise<UserDto> {
  const resp = await http.post<UserDto>("/user", payload);
  return resp.data;
}

export async function updateUser(payload: Partial<UserDto>): Promise<UserDto> {
  const resp = await http.put<UserDto>("/user", payload);
  return resp.data;
}

export async function deleteUser(id: number): Promise<void> {
  await http.delete(`/user/${id}`);
}