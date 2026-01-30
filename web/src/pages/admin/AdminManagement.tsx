// src/pages/admin/AdminManagement.tsx (or wherever you keep this page)
import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Database,
  Download,
  HardDrive,
  LogOut,
  Monitor,
  MoreHorizontal,
  Power,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserCog,
  UserPlus,
  UserX,
  Users,
  Zap,
  FileText,
} from "lucide-react";

type Tone = "green" | "blue" | "purple" | "orange" | "red" | "gray" | "yellow";

const TONE = {
  green: {
    text: "text-green-700",
    textStrong: "text-green-800",
    chip: "bg-green-50 text-green-700 border-green-100",
    iconBg: "bg-green-100",
    btn: "bg-green-600 hover:bg-green-700",
    bar: "bg-green-500",
  },
  blue: {
    text: "text-blue-700",
    textStrong: "text-blue-800",
    chip: "bg-blue-50 text-blue-700 border-blue-100",
    iconBg: "bg-blue-100",
    btn: "bg-blue-600 hover:bg-blue-700",
    bar: "bg-blue-500",
  },
  purple: {
    text: "text-purple-700",
    textStrong: "text-purple-800",
    chip: "bg-purple-50 text-purple-700 border-purple-100",
    iconBg: "bg-purple-100",
    btn: "bg-purple-600 hover:bg-purple-700",
    bar: "bg-purple-500",
  },
  orange: {
    text: "text-orange-700",
    textStrong: "text-orange-800",
    chip: "bg-orange-50 text-orange-700 border-orange-100",
    iconBg: "bg-orange-100",
    btn: "bg-orange-600 hover:bg-orange-700",
    bar: "bg-orange-500",
  },
  yellow: {
    text: "text-yellow-700",
    textStrong: "text-yellow-800",
    chip: "bg-yellow-50 text-yellow-700 border-yellow-100",
    iconBg: "bg-yellow-100",
    btn: "bg-yellow-600 hover:bg-yellow-700",
    bar: "bg-yellow-500",
  },
  red: {
    text: "text-red-700",
    textStrong: "text-red-800",
    chip: "bg-red-50 text-red-700 border-red-100",
    iconBg: "bg-red-100",
    btn: "bg-red-600 hover:bg-red-700",
    bar: "bg-red-500",
  },
  gray: {
    text: "text-gray-700",
    textStrong: "text-gray-800",
    chip: "bg-gray-50 text-gray-700 border-gray-100",
    iconBg: "bg-gray-100",
    btn: "bg-gray-700 hover:bg-gray-800",
    bar: "bg-gray-500",
  },
} as const satisfies Record<Tone, Record<string, string>>;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

type Metrics = {
  uptime: number; // %
  activeUsers: number;
  apiRequestsM: number; // in millions
  storageGB: number; // GB
};

type Monitoring = {
  cpu: number; // %
  memory: number; // %
  disk: number; // %
  network: number; // %
};

export default function AdminManagement(): JSX.Element {
  const [metrics, setMetrics] = useState<Metrics>({
    uptime: 99.98,
    activeUsers: 2847,
    apiRequestsM: 1.2,
    storageGB: 847,
  });

  const [monitoring, setMonitoring] = useState<Monitoring>({
    cpu: 23,
    memory: 67,
    disk: 42,
    network: 15,
  });

  // Real-time simulation
  useEffect(() => {
    const metricInterval = window.setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        uptime: clamp(prev.uptime + (Math.random() - 0.5) * 0.01, 99, 100),
        activeUsers: Math.max(0, Math.floor(prev.activeUsers + (Math.random() - 0.5) * 10)),
      }));
    }, 5000);

    const monitorInterval = window.setInterval(() => {
      setMonitoring((prev) => ({
        cpu: clamp(prev.cpu + (Math.random() - 0.5) * 10, 5, 95),
        memory: clamp(prev.memory + (Math.random() - 0.5) * 5, 10, 95),
        disk: prev.disk,
        network: clamp(prev.network + (Math.random() - 0.5) * 15, 5, 90),
      }));
    }, 3000);

    return () => {
      window.clearInterval(metricInterval);
      window.clearInterval(monitorInterval);
    };
  }, []);

  const handleDangerAction = (action: string) => {
    const ok = window.confirm(
      `Are you sure you want to perform this action: ${action}?\n\nThis is irreversible.`
    );
    if (ok) alert(`${action} initiated. (Simulation)`);
  };

  const metricCards = useMemo(
    () => [
      {
        title: "System Uptime",
        value: `${metrics.uptime.toFixed(2)}%`,
        sub: "Last 30 days",
        tone: "green" as const,
        icon: <Activity className="w-6 h-6 text-green-700" />,
      },
      {
        title: "Active Users",
        value: metrics.activeUsers.toLocaleString(),
        sub: "+12% from yesterday",
        tone: "blue" as const,
        icon: <Users className="w-6 h-6 text-blue-700" />,
      },
      {
        title: "API Requests",
        value: `${metrics.apiRequestsM}M`,
        sub: "Last 24 hours",
        tone: "purple" as const,
        icon: <Zap className="w-6 h-6 text-purple-700" />,
      },
      {
        title: "Storage Used",
        value: `${metrics.storageGB} GB`,
        sub: "of 2 TB capacity",
        tone: "orange" as const,
        icon: <HardDrive className="w-6 h-6 text-orange-700" />,
      },
    ],
    [metrics]
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* HEADER */}
      <header className="bg-gradient-to-br from-[#0D47A1] to-[#1565C0] text-white shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold">System Administration Console</h1>
                <p className="text-sm text-blue-100">Britium Express Enterprise</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                <span className="text-sm">System Online</span>
              </div>

              <button
                type="button"
                className="flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-red-700"
                onClick={() => alert("Logout clicked (Simulation)")}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* METRICS */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {metricCards.map((m) => (
            <MetricCard
              key={m.title}
              title={m.title}
              value={m.value}
              sub={m.sub}
              tone={m.tone}
              icon={m.icon}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {/* USER MANAGEMENT */}
            <SectionCard
              title="User Management"
              icon={<UserCog className="mr-2 h-5 w-5 text-blue-600" />}
              action={
                <button
                  type="button"
                  className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  onClick={() => alert("Add User (Simulation)")}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </button>
              }
            >
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatBox
                  label="Total Users"
                  value="15,847"
                  tone="gray"
                  icon={<Users className="h-8 w-8 text-gray-400" />}
                />
                <StatBox
                  label="Active Today"
                  value={metrics.activeUsers.toLocaleString()}
                  tone="green"
                  icon={<UserCheck className="h-8 w-8 text-green-500" />}
                />
                <StatBox
                  label="Suspended"
                  value="23"
                  tone="red"
                  icon={<UserX className="h-8 w-8 text-red-500" />}
                />
              </div>

              <div className="space-y-3">
                <UserRow initial="M" tone="blue" email="manager.yangon@britium.com" role="Manager • Yangon Region" />
                <UserRow initial="S" tone="green" email="station.ygn001@britium.com" role="Sub-station • YGN Branch 1" />
              </div>
            </SectionCard>

            {/* DATABASE ADMIN */}
            <SectionCard
              title="Database Administration"
              icon={<Database className="mr-2 h-5 w-5 text-blue-600" />}
            >
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatBox
                  label="Total Records"
                  value="2.4M"
                  tone="blue"
                  icon={<FileText className="h-8 w-8 text-blue-500" />}
                />
                <StatBox
                  label="Query Perf."
                  value="98.5%"
                  tone="green"
                  icon={<Zap className="h-8 w-8 text-green-500" />}
                />
                <StatBox
                  label="Storage"
                  value={`${metrics.storageGB} GB`}
                  tone="orange"
                  icon={<HardDrive className="h-8 w-8 text-orange-500" />}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ActionButton
                  label="Backup Database"
                  tone="blue"
                  icon={<Download className="h-4 w-4" />}
                  onClick={() => alert("Backup Database (Simulation)")}
                />
                <ActionButton
                  label="Optimize Tables"
                  tone="green"
                  icon={<RefreshCw className="h-4 w-4" />}
                  onClick={() => alert("Optimize Tables (Simulation)")}
                />
              </div>
            </SectionCard>
          </div>

          <div className="space-y-8">
            {/* SYSTEM MONITORING */}
            <SectionCard title="System Monitoring" icon={<Monitor className="mr-2 h-5 w-5 text-blue-600" />}>
              <ProgressBar label="CPU Usage" value={monitoring.cpu} barClass={TONE.green.bar} />
              <ProgressBar label="Memory Usage" value={monitoring.memory} barClass={TONE.yellow.bar} />
              <ProgressBar label="Disk Usage" value={monitoring.disk} barClass={TONE.blue.bar} />
              <ProgressBar label="Network Usage" value={monitoring.network} barClass={TONE.purple.bar} />
            </SectionCard>

            {/* DANGER ZONE */}
            <div className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-6">
              <h3 className="mb-4 flex items-center text-lg font-semibold text-red-800">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Danger Zone
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <DangerButton
                  label="Purge Old Data"
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={() => handleDangerAction("Purge Data")}
                />
                <DangerButton
                  label="Reset System"
                  icon={<Power className="h-4 w-4" />}
                  onClick={() => handleDangerAction("Reset System")}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ----------------------------- Subcomponents ----------------------------- */

type MetricCardProps = {
  title: string;
  value: string;
  sub: string;
  tone: "green" | "blue" | "purple" | "orange";
  icon: React.ReactNode;
};

function MetricCard({ title, value, sub, tone, icon }: MetricCardProps) {
  const t = TONE[tone];
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${t.textStrong}`}>{value}</p>
          <p className="text-xs text-gray-500">{sub}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${t.iconBg}`}>{icon}</div>
      </div>
    </div>
  );
}

type SectionCardProps = {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
};

function SectionCard({ title, icon, action, children }: SectionCardProps) {
  return (
    <section className="rounded-xl bg-white p-6 shadow-sm transition-all hover:border-orange-500 border-l-4 border-transparent">
      <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-2">
        <h3 className="flex items-center text-lg font-semibold text-gray-900">
          {icon} {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

type StatBoxProps = {
  label: string;
  value: string;
  tone: "gray" | "green" | "red" | "blue" | "orange";
  icon: React.ReactNode;
};

function StatBox({ label, value, tone, icon }: StatBoxProps) {
  const t = TONE[tone];
  const bg =
    tone === "gray"
      ? "bg-gray-50"
      : tone === "green"
      ? "bg-green-50"
      : tone === "red"
      ? "bg-red-50"
      : tone === "blue"
      ? "bg-blue-50"
      : "bg-orange-50";

  return (
    <div className={`${bg} flex items-center justify-between rounded-lg p-4`}>
      <div>
        <p className={`text-sm ${t.text}`}>{label}</p>
        <p className={`text-xl font-bold ${t.textStrong}`}>{value}</p>
      </div>
      {icon}
    </div>
  );
}

type UserRowProps = {
  initial: string;
  tone: "blue" | "green" | "purple" | "orange" | "gray";
  email: string;
  role: string;
};

function UserRow({ initial, tone, email, role }: UserRowProps) {
  const badge =
    tone === "blue"
      ? "bg-blue-600"
      : tone === "green"
      ? "bg-green-600"
      : tone === "purple"
      ? "bg-purple-600"
      : tone === "orange"
      ? "bg-orange-600"
      : "bg-gray-700";

  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${badge} text-sm font-bold text-white`}>
          {initial}
        </div>
        <div>
          <p className="font-medium text-gray-900">{email}</p>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
      <MoreHorizontal className="h-4 w-4 cursor-pointer text-gray-400" />
    </div>
  );
}

type ActionButtonProps = {
  label: string;
  icon: React.ReactNode;
  tone: "blue" | "green" | "purple" | "orange" | "gray";
  onClick?: () => void;
};

function ActionButton({ label, icon, tone, onClick }: ActionButtonProps) {
  const t = TONE[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium text-white ${t.btn}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

type ProgressBarProps = {
  label: string;
  value: number;
  barClass: string;
};

function ProgressBar({ label, value, barClass }: ProgressBarProps) {
  const pct = clamp(value, 0, 100);
  return (
    <div className="mb-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{Math.round(pct)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div className={`h-2 rounded-full ${barClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

type DangerButtonProps = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
};

function DangerButton({ label, icon, onClick }: DangerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
