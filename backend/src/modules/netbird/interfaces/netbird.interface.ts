export interface NetBirdAccount {
  domain: string;
  domain_category: 'private' | 'public';
  created_at: string;
}

export interface NetBirdUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'user' | 'network_admin';
  type: 'regular' | 'service';
  status: 'active' | 'inactive';
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface NetBirdPeer {
  id: string;
  name: string;
  ip: string;
  connection_ip: string;
  dns_label?: string;
  os: string;
  version: string;
  last_seen: string;
  status: 'connected' | 'disconnected';
  location?: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  ssh_enabled: boolean;
  firewall_enabled: boolean;
  dns_enabled: boolean;
  routing_enabled: boolean;
  client_routing_enabled: boolean;
  server_routing_enabled: boolean;
  groups: string[];
  setup_key?: string;
  last_login?: string;
  login_expires?: string;
}

export interface NetBirdGroup {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  peers_count: number;
  resource_acls_count: number;
  route_resources_count: number;
  integration_peers_count: number;
}

export interface NetBirdPolicy {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  rules: NetBirdPolicyRule[];
}

export interface NetBirdPolicyRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  action: 'accept' | 'drop';
  sources: NetBirdPolicyRuleTarget[];
  destinations: NetBirdPolicyRuleTarget[];
  bidirectional: boolean;
  flow?: string;
}

export interface NetBirdPolicyRuleTarget {
  type: 'group' | 'peer' | 'ip' | 'ip_net' | 'dns_domain' | 'tag';
  id?: string;
  value?: string;
  name?: string;
}

export interface NetBirdSetupKey {
  id: string;
  name: string;
  key: string;
  type: 'one-off' | 'reusable';
  expires_at?: string;
  usage_limit?: number;
  usage_count: number;
  auto_groups: string[];
  created_at: string;
  updated_at: string;
  last_used?: string;
  valid: boolean;
  revoked: boolean;
}

export interface NetBirdEvent {
  id: string;
  activity: string;
  target_id?: string;
  activity_type: string;
  initiated_by: string;
  meta: Record<string, any>;
  timestamp: string;
}

export interface NetBirdNetwork {
  id: string;
  domain: string;
  netbird_version: string;
  auto_update_enabled: boolean;
  setup_keys_required: boolean;
  user_approval_required: boolean;
  peer_login_expiration: number;
  peer_inactive_expiration: number;
  acls_enabled: boolean;
  dns_enabled: boolean;
  group_propagation_enabled: boolean;
  routing_dns_resolver: string;
  peer_login_expiration_enabled: boolean;
  multi_hop_routing: boolean;
  debug: boolean;
}

export interface CreateNetBirdUserDto {
  name: string;
  email: string;
  role: 'admin' | 'user';
  auto_groups?: string[];
}

export interface UpdateNetBirdUserDto {
  name?: string;
  role?: 'owner' | 'admin' | 'user' | 'network_admin';
  status?: 'active' | 'inactive';
  auto_groups?: string[];
}

export interface CreateNetBirdGroupDto {
  name: string;
  description?: string;
  peers?: string[];
}

export interface UpdateNetBirdGroupDto {
  name?: string;
  description?: string;
  peers?: string[];
}

export interface CreateNetBirdPolicyDto {
  name: string;
  description?: string;
  enabled?: boolean;
  rules: Omit<NetBirdPolicyRule, 'id'>[];
}

export interface UpdateNetBirdPolicyDto {
  name?: string;
  description?: string;
  enabled?: boolean;
  rules?: NetBirdPolicyRule[];
}

export interface CreateNetBirdSetupKeyDto {
  name: string;
  type: 'one-off' | 'reusable';
  expires_at?: string;
  usage_limit?: number;
  auto_groups: string[];
}

export interface UpdateNetBirdSetupKeyDto {
  name?: string;
  expires_at?: string;
  usage_limit?: number;
  auto_groups?: string[];
  revoked?: boolean;
}

export interface PlatformPeer extends NetBirdPeer {
  ipAddress: string;
  connectionIp: string;
  operatingSystem: string;
  lastSeen: Date;
  connectionStatus: 'online' | 'offline' | 'expired';
  locationDisplay?: string;
  groupsExpanded?: Array<{
    id: string;
    name: string;
  }>;
}

export interface PlatformUser extends NetBirdUser {
  fullName: string;
  primaryEmail: string;
  roleDisplay: string;
  accountType: string;
  lastSeenFormatted?: string;
}

export interface PlatformGroup extends NetBirdGroup {
  membersDisplay: number;
  resourcesDisplay: number;
  routesDisplay: number;
  integrationsDisplay: number;
}

export interface PlatformPolicy extends NetBirdPolicy {
  statusDisplay: string;
  rulesCount: number;
  rulesExpanded?: Array<{
    id: string;
    name: string;
    action: string;
    bidirectional: boolean;
    sourcesDisplay: string;
    destinationsDisplay: string;
  }>;
}

export interface PlatformSetupKey extends NetBirdSetupKey {
  typeDisplay: string;
  usageDisplay: string;
  expiresDisplay?: string;
  lastUsedDisplay?: string;
  statusDisplay: string;
  autoGroupsDisplay: string[];
}

export interface PlatformEvent extends NetBirdEvent {
  typeDisplay: string;
  actorDisplay: string;
  targetDisplay?: string;
  timestampFormatted: string;
  metadataExpanded?: string[];
}