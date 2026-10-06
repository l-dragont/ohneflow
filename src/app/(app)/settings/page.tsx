import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { db } from "@/lib/db";
import { SettingsForms } from "@/components/settings-forms";

export default async function SettingsPage() {
  const u = await db.user.findUniqueOrThrow({ where: { id: (await getServerSession(authOptions))!.user.id }, select: { name: true, email: true, timezone: true } });
  return (<div className="space-y-4"><h1 className="text-2xl font-semibold">Settings</h1><SettingsForms name={u.name} email={u.email} timezone={u.timezone} /></div>);
}
