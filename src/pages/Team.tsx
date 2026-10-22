import { team } from "../data/sampleData";
import { Avatar } from "../components/Avatar";
import { ProgressBar } from "../components/ProgressBar";
export default function Team() {
  return (
    <div>
      <h1 className="mb-6 text-4xl font-black gradient-text">Team</h1>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {team.map((m) => (
          <div key={m.id} className="soft-card rounded-[2rem] p-6 text-center">
            <div
              className={`mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br ${m.ring} p-1 shadow-xl`}
            >
              <div className="grid h-full w-full place-items-center rounded-full bg-white dark:bg-slate-900">
                <Avatar name={m.avatar} gradient={m.ring} />
              </div>
            </div>
            <h2 className="text-xl font-black">{m.name}</h2>
            <p className="text-sm text-slate-500">{m.role}</p>
            <span
              className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black ${m.online ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
            >
              {m.online ? "Online" : "Offline"}
            </span>
            <div className="mt-5 text-left">
              <div className="mb-2 flex justify-between text-sm font-bold">
                <span>Workload</span>
                <span>{m.workload}%</span>
              </div>
              <ProgressBar value={m.workload} gradient={m.ring} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
