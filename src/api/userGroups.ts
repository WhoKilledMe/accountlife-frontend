import http from "./http";
import type { UserGroupDto } from "../services/types";

export interface PageParams {
  page?: number; // 1-based
  pageSize?: number;
  name?: string;
}

export interface PageResult<T> {
  total: number;
  items: T[];
}

// The backend exposes non-paginated list endpoints; we filter and paginate client-side
export async function listUserGroups(params: PageParams): Promise<PageResult<UserGroupDto>> {
  const resp = await http.get<UserGroupDto[]>("/usergroup");
  const all = resp.data || [];
  const { page = 1, pageSize = 10, name } = params || {};
  const filtered = all.filter((g) => (name ? (g.name || "").includes(name) : true));
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);
  return { total: filtered.length, items };
}

export async function getUserGroup(id: number): Promise<UserGroupDto> {
  const resp = await http.get<UserGroupDto>(`/usergroup/${id}`);
  return resp.data;
}

export async function createUserGroup(payload: Partial<UserGroupDto>): Promise<UserGroupDto> {
  const resp = await http.post<UserGroupDto>("/usergroup", payload);
  return resp.data;
}

export async function updateUserGroup(payload: Partial<UserGroupDto>): Promise<UserGroupDto> {
  const resp = await http.put<UserGroupDto>("/usergroup", payload);
  return resp.data;
}

export async function deleteUserGroup(id: number): Promise<void> {
  await http.delete(`/usergroup/${id}`);
}


