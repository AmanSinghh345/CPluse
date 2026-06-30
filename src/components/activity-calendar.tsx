import type { ActivityDay } from "@/types/codeforces";
import { cn } from "@/lib/utils";

export function ActivityCalendar({ days }: { days: ActivityDay[] }) {
  const recent = days.slice(-182); const weeks: ActivityDay[][] = [];
  for (let i=0;i<recent.length;i+=7) weeks.push(recent.slice(i,i+7));
  return <div className="overflow-x-auto no-scrollbar"><div className="flex min-w-[590px] gap-1 px-5 pb-5 pt-4">{weeks.map((week,i)=><div className="grid gap-1" key={i}>{week.map((day)=><div title={`${day.date}: ${day.count} solved`} key={day.date} className={cn("size-[13px] rounded-[3px]", day.count===0 && "bg-white/5", day.count===1 && "bg-[#36521c]", day.count===2 && "bg-[#638f2d]", day.count>=3 && "bg-[#b7f34a]")}/>)}</div>)}</div></div>;
}
