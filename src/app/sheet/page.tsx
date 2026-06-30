"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUpRight, BookOpen, Check, CheckCircle2, ChevronDown, Circle, Code2, FileText, Folder, FolderOpen, HelpCircle, Lightbulb, ListChecks, Search, Sparkles, Target, X } from "lucide-react";
import { dsaSheet, sheetQuestions, type CategoryFolder as CategoryFolderType, type PatternSubtopic, type Question, type TheoryBlock, type TopicFolder as TopicFolderType } from "@/data/dsaSheet";
import { Badge, Card, Empty } from "@/components/ui";
import { cn } from "@/lib/utils";

type Progress = Record<string, { done: boolean; note: string }>;

function questionKey(topic: string, category: string | undefined, subtopic: string, question: Question) {
  return [topic, category ?? "root", subtopic, question.title].join("::");
}

function countQuestions(topic: TopicFolderType) {
  return (topic.subtopics ?? []).reduce((sum, subtopic) => sum + subtopic.questions.length, 0) + (topic.categories ?? []).reduce((sum, category) => sum + category.subtopics.reduce((inner, subtopic) => inner + subtopic.questions.length, 0), 0);
}

function isQuestionDone(progress: Progress, key: string, question: Question) {
  return progress[key]?.done ?? question.status === "done";
}

function countCompletedInSubtopic(progress: Progress, topic: string, category: string | undefined, subtopic: PatternSubtopic) {
  return subtopic.questions.filter((question) => isQuestionDone(progress, questionKey(topic, category, subtopic.name, question), question)).length;
}

function countCompletedInCategory(progress: Progress, topic: string, category: CategoryFolderType) {
  return category.subtopics.reduce((sum, subtopic) => sum + countCompletedInSubtopic(progress, topic, category.name, subtopic), 0);
}

function countCompletedInTopic(progress: Progress, topic: TopicFolderType) {
  return (topic.subtopics ?? []).reduce((sum, subtopic) => sum + countCompletedInSubtopic(progress, topic.topic, undefined, subtopic), 0) + (topic.categories ?? []).reduce((sum, category) => sum + countCompletedInCategory(progress, topic.topic, category), 0);
}

function ProgressCount({ completed, total }: { completed: number; total: number }) {
  return <span className="shrink-0 font-mono text-xs font-semibold"><span className="text-[#b7f34a]">{completed}</span><span className="px-1 text-zinc-600">/</span><span className="text-zinc-400">{total}</span></span>;
}

function ProgressCheckbox({ done, onToggle }: { done: boolean; onToggle: () => void }) {
  return <button onClick={onToggle} aria-label={done ? "Mark incomplete" : "Mark complete"} className={cn("grid size-5 place-items-center rounded border transition", done ? "border-[#b7f34a] bg-[#b7f34a] text-black" : "border-white/12 text-transparent hover:border-[#b7f34a]/60")}>{done ? <Check size={12}/> : <Circle size={9}/>}</button>;
}

function TheoryCard({ block }: { block: TheoryBlock }) {
  const Icon = block.type === "template" ? Code2 : block.type === "pattern" ? Lightbulb : FileText;
  const isNotes = block.type === "notes";
  return <div className={cn("rounded-md border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.035)]", isNotes ? "border-[#b7f34a]/25 bg-[#b7f34a]/8" : "border-violet-400/20 bg-violet-500/[.075]")}>
    <div className={cn("flex items-center gap-2 text-xs font-semibold", isNotes ? "text-[#b7f34a]" : "text-violet-300")}><Icon size={14}/>{block.title}</div>
    {block.description && <p className="mt-3 text-sm leading-6 text-zinc-300">{block.description}</p>}
    {block.points?.length ? <ul className="mt-3 grid gap-1 text-sm text-zinc-500 sm:grid-cols-2">{block.points.map((point) => <li key={point} className="flex gap-2"><span className="mt-2 size-1 rounded-full bg-[#b7f34a]"/><span>{point}</span></li>)}</ul> : null}
    {block.code && <pre className="mt-3 overflow-x-auto rounded-lg border border-white/8 bg-black/30 p-3 text-xs leading-5 text-zinc-300"><code>{block.code}</code></pre>}
    {block.references?.length ? <div className="mt-4 border-t border-white/8 pt-3"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-zinc-600">References</p><div className="mt-2 flex flex-wrap gap-2">{block.references.map((reference) => <a key={reference.url} href={reference.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-zinc-300 hover:border-[#b7f34a]/30 hover:text-[#b7f34a]">{reference.title}<ArrowUpRight size={10}/></a>)}</div></div> : null}
  </div>;
}

function QuestionRow({ question, done, hasNote, onToggle, onNote }: { question: Question; done: boolean; hasNote: boolean; onToggle: () => void; onNote: () => void }) {
  return <article className={cn("group grid gap-3 border-b border-white/6 px-3 py-2.5 transition last:border-0 hover:bg-white/[.035] md:grid-cols-[36px_minmax(220px,1fr)_150px_38px] md:items-center", done && "opacity-55")}>
    <ProgressCheckbox done={done} onToggle={onToggle}/>
    <div className="min-w-0">
      {question.url ? <a href={question.url} target="_blank" rel="noopener noreferrer" className={cn("flex items-center gap-2 text-sm font-medium hover:text-[#b7f34a]", done && "line-through")}>{question.title}<ArrowUpRight size={12} className="opacity-0 transition group-hover:opacity-100"/></a> : <span className={cn("block text-sm font-medium text-zinc-300", done && "line-through")}>{question.title}</span>}
      <p className="mt-1 text-[10px] text-zinc-700 md:hidden">{question.source ?? "Source pending"}</p>
    </div>
    <span className="hidden text-xs text-zinc-500 md:block">{question.source ?? "Source pending"}</span>
    <button onClick={onNote} aria-label={`Note for ${question.title}`} className={cn("ml-auto grid size-8 place-items-center rounded-lg border transition", hasNote ? "border-[#b7f34a]/25 bg-[#b7f34a]/8 text-[#b7f34a]" : "border-white/8 text-zinc-600 hover:text-white")}><FileText size={14}/></button>
  </article>;
}

function SubtopicFolder({ topic, category, subtopic, open, progress, onToggleOpen, onToggleQuestion, onOpenNote }: { topic: string; category?: string; subtopic: PatternSubtopic; open: boolean; progress: Progress; onToggleOpen: () => void; onToggleQuestion: (key: string) => void; onOpenNote: (key: string) => void }) {
  const completed = countCompletedInSubtopic(progress, topic, category, subtopic);

  return <div className="relative ml-4 border-l border-white/10 pl-3 before:absolute before:left-0 before:top-6 before:h-px before:w-3 before:bg-white/10 sm:ml-8 sm:pl-4">
    <button onClick={onToggleOpen} aria-expanded={open} className={cn("flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left transition", open ? "border-violet-400/18 bg-[#11151b]" : "border-white/8 bg-[#0d1117] hover:border-white/14 hover:bg-[#10151b]")}>
      <span className={cn("grid size-8 place-items-center rounded-md border", open ? "border-violet-400/20 bg-violet-500/10 text-violet-300" : "border-cyan-400/15 bg-cyan-400/7 text-cyan-300")}><BookOpen size={15}/></span>
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-zinc-200">{subtopic.name}</p><p className="mt-1 hidden text-[10px] text-zinc-600 sm:block">Theory cards and question rows</p></div>
      <ProgressCount completed={completed} total={subtopic.questions.length}/>
      <ChevronDown size={16} className={cn("shrink-0 text-zinc-500 transition", open && "rotate-180 text-[#b7f34a]")}/>
    </button>
    {open && <div className="ml-4 border-l border-white/8 py-4 pl-3 sm:ml-6 sm:pl-4">
      {subtopic.theory?.length ? <div className="mb-4"><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-violet-300"><BookOpen size={12}/>Theory</div><div className="grid gap-3">{subtopic.theory.map((block) => <TheoryCard key={`${block.title}-${block.type}`} block={block}/>)}</div></div> : null}
      {subtopic.questions.length ? <div><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#b7f34a]"><HelpCircle size={12}/>Questions</div><div className="overflow-hidden rounded-md border border-white/7 bg-[#0b0f14]">{subtopic.questions.map((question) => {
        const key = questionKey(topic, category, subtopic.name, question);
        const done = isQuestionDone(progress, key, question);
        return <QuestionRow key={key} question={question} done={done} hasNote={Boolean(progress[key]?.note?.trim())} onToggle={() => onToggleQuestion(key)} onNote={() => onOpenNote(key)}/>;
      })}</div></div> : <Empty>Content will be added soon.</Empty>}
    </div>}
  </div>;
}

function CategoryFolder({ topic, category, open, openSubtopics, progress, onToggleOpen, onToggleSubtopic, onToggleQuestion, onOpenNote }: { topic: string; category: CategoryFolderType; open: boolean; openSubtopics: Record<string, boolean>; progress: Progress; onToggleOpen: () => void; onToggleSubtopic: (key: string) => void; onToggleQuestion: (key: string) => void; onOpenNote: (key: string) => void }) {
  const questionCount = category.subtopics.reduce((sum, subtopic) => sum + subtopic.questions.length, 0);
  const completed = countCompletedInCategory(progress, topic, category);
  return <div className="relative ml-3 border-l border-white/10 pl-3 before:absolute before:left-0 before:top-7 before:h-px before:w-3 before:bg-white/10 sm:ml-5 sm:pl-4">
    <button onClick={onToggleOpen} aria-expanded={open} className={cn("flex w-full items-center gap-3 rounded-md border px-4 py-4 text-left transition", open ? "border-[#b7f34a]/18 bg-[#10151a]" : "border-white/8 bg-[#0c1016] hover:border-white/14 hover:bg-[#10151a]")}>
      <span className="grid size-9 place-items-center rounded-md border border-[#b7f34a]/15 bg-[#b7f34a]/8 text-[#b7f34a]">{open ? <FolderOpen size={16}/> : <Folder size={16}/>}</span>
      <div className="min-w-0 flex-1"><h4 className="truncate text-sm font-semibold">{category.name}</h4><p className="mt-1 hidden text-[10px] text-zinc-600 sm:block">Pattern folders and concepts</p></div>
      <ProgressCount completed={completed} total={questionCount}/>
      <ChevronDown size={16} className={cn("shrink-0 text-zinc-500 transition", open && "rotate-180 text-[#b7f34a]")}/>
    </button>
    {open && <div className="grid gap-2 pb-3">{category.subtopics.length ? category.subtopics.map((subtopic) => {
      const key = `${topic}::${category.name}::${subtopic.name}`;
      return <SubtopicFolder key={key} topic={topic} category={category.name} subtopic={subtopic} open={Boolean(openSubtopics[key])} progress={progress} onToggleOpen={() => onToggleSubtopic(key)} onToggleQuestion={onToggleQuestion} onOpenNote={onOpenNote}/>;
    }) : <div className="ml-4 border-l border-white/8 pl-3"><Empty>Content will be added soon.</Empty></div>}</div>}
  </div>;
}

function TopicFolder({ item, open, openCategories, openSubtopics, progress, onToggleOpen, onToggleCategory, onToggleSubtopic, onToggleQuestion, onOpenNote }: { item: TopicFolderType; open: boolean; openCategories: Record<string, boolean>; openSubtopics: Record<string, boolean>; progress: Progress; onToggleOpen: () => void; onToggleCategory: (key: string) => void; onToggleSubtopic: (key: string) => void; onToggleQuestion: (key: string) => void; onOpenNote: (key: string) => void }) {
  const questionCount = countQuestions(item);
  const completed = countCompletedInTopic(progress, item);

  return <Card className={cn("overflow-hidden border-white/8 bg-[#090d12]", open && "border-[#b7f34a]/15")}>
    <button onClick={onToggleOpen} aria-expanded={open} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-white/[.025]">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#b7f34a]/15 bg-[#b7f34a]/8 text-[#b7f34a]">{open ? <FolderOpen size={18}/> : <Folder size={18}/>}</span>
      <div className="min-w-0 flex-1"><h3 className="truncate text-base font-semibold text-zinc-100">{item.topic}</h3><p className="mt-1 hidden text-[10px] text-zinc-600 sm:block">Master topic with pattern-wise questions</p></div>
      <ProgressCount completed={completed} total={questionCount}/>
      <ChevronDown size={18} className={cn("shrink-0 text-zinc-500 transition", open && "rotate-180 text-[#b7f34a]")}/>
    </button>
    {open && <div className="grid gap-2 border-t border-white/7 px-4 py-3">
      {item.categories?.length ? item.categories.map((category) => {
        const key = `${item.topic}::${category.name}`;
        return <CategoryFolder key={key} topic={item.topic} category={category} open={Boolean(openCategories[key])} openSubtopics={openSubtopics} progress={progress} onToggleOpen={() => onToggleCategory(key)} onToggleSubtopic={onToggleSubtopic} onToggleQuestion={onToggleQuestion} onOpenNote={onOpenNote}/>;
      }) : item.subtopics?.length ? item.subtopics.map((subtopic) => {
        const key = `${item.topic}::root::${subtopic.name}`;
        return <SubtopicFolder key={key} topic={item.topic} subtopic={subtopic} open={Boolean(openSubtopics[key])} progress={progress} onToggleOpen={() => onToggleSubtopic(key)} onToggleQuestion={onToggleQuestion} onOpenNote={onOpenNote}/>;
      }) : <div className="ml-3 border-l border-white/10 pl-3"><Empty>No subtopics added yet.</Empty></div>}
    </div>}
  </Card>;
}

export default function SheetPage() {
  const [progress, setProgress] = useState<Progress>({});
  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>({});
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [openSubtopics, setOpenSubtopics] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [noteFor, setNoteFor] = useState<string>();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cpulse-sheet") ?? "{}");
      queueMicrotask(() => setProgress(saved));
    } catch {}
  }, []);

  function save(next: Progress) {
    setProgress(next);
    localStorage.setItem("cpulse-sheet", JSON.stringify(next));
  }

  function toggleQuestion(key: string) {
    save({ ...progress, [key]: { note: progress[key]?.note ?? "", done: !progress[key]?.done } });
  }

  function note(key: string, value: string) {
    save({ ...progress, [key]: { done: progress[key]?.done ?? false, note: value } });
  }

  function toggleTopic(key: string) {
    setOpenTopics((current) => current[key] ? {} : { [key]: true });
    setOpenCategories({});
    setOpenSubtopics({});
  }

  function toggleCategory(key: string) {
    setOpenCategories((current) => current[key] ? {} : { [key]: true });
    setOpenSubtopics({});
  }

  function toggleSubtopic(key: string) {
    setOpenSubtopics((current) => current[key] ? {} : { [key]: true });
  }

  const filteredTopics = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return dsaSheet;
    return dsaSheet.filter((item) => item.topic.toLowerCase().includes(normalized));
  }, [query]);

  const activeQuestion = useMemo(() => {
    if (!noteFor) return undefined;
    for (const topic of dsaSheet) {
      for (const category of topic.categories ?? []) for (const subtopic of category.subtopics) for (const question of subtopic.questions) {
        const key = questionKey(topic.topic, category.name, subtopic.name, question);
        if (key === noteFor) return { key, topic: topic.topic, category: category.name, subtopic: subtopic.name, question };
      }
      for (const subtopic of topic.subtopics ?? []) for (const question of subtopic.questions) {
        const key = questionKey(topic.topic, undefined, subtopic.name, question);
        if (key === noteFor) return { key, topic: topic.topic, category: undefined, subtopic: subtopic.name, question };
      }
    }
  }, [noteFor]);

  const completed = sheetQuestions.filter((question) => question.status === "done").length + Object.values(progress).filter((item) => item.done).length;
  const percent = sheetQuestions.length ? Math.round((completed / sheetQuestions.length) * 100) : 0;
  const subtopicCount = dsaSheet.reduce((sum, topic) => sum + (topic.subtopics?.length ?? 0) + (topic.categories ?? []).reduce((inner, category) => inner + category.subtopics.length, 0), 0);

  return <main className="sheet-page min-h-screen overflow-hidden">
    <section className="sheet-hero relative border-b border-white/8 px-5 py-20 sm:py-28">
      <div className="sheet-orbit sheet-orbit-one"/><div className="sheet-orbit sheet-orbit-two"/>
      <div className="relative mx-auto max-w-7xl"><div className="grid gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-center"><div><div className="sheet-reveal inline-flex items-center gap-2 rounded-full border border-[#b7f34a]/20 bg-[#b7f34a]/7 px-3 py-1.5 text-xs text-[#caff70]"><Sparkles size={13}/>Arrays content loaded</div><h1 className="sheet-reveal sheet-delay-1 mt-7 max-w-4xl text-6xl font-semibold leading-[.9] tracking-[-.065em] sm:text-8xl">Open the<br/><span className="sheet-outline">folders.</span><br/><span className="text-[#b7f34a]">Follow patterns.</span></h1><p className="sheet-reveal sheet-delay-2 mt-7 max-w-xl text-base leading-7 text-zinc-400">The sheet now supports topic folders, category folders, pattern folders, theory cards, and progress-ready question rows.</p><a href="#topics" className="sheet-reveal sheet-delay-3 mt-8 inline-flex items-center gap-3 rounded-xl bg-[#b7f34a] px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.03]">Open sheet <ArrowDown size={16} className="sheet-bounce"/></a></div>
      <div className="sheet-reveal sheet-delay-2 relative mx-auto w-full max-w-md"><div className="sheet-float card relative z-10 p-6"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-zinc-600">Your momentum</p><p className="mt-2 text-5xl font-semibold tracking-[-.05em]">{percent}<span className="text-xl text-[#b7f34a]">%</span></p></div><div className="grid size-16 place-items-center rounded-full border border-[#b7f34a]/25 bg-[#b7f34a]/5"><Target className="text-[#b7f34a]"/></div></div><div className="mt-6 h-2 overflow-hidden rounded-full bg-white/6"><div className="h-full rounded-full bg-[#b7f34a] transition-[width] duration-700" style={{width:`${percent}%`}}/></div><div className="mt-5 grid grid-cols-3 gap-2 text-center"><div className="rounded-lg bg-white/3 p-3"><p className="text-lg font-semibold">{dsaSheet.length}</p><p className="text-[9px] uppercase tracking-wider text-zinc-600">Topics</p></div><div className="rounded-lg bg-white/3 p-3"><p className="text-lg font-semibold">{subtopicCount}</p><p className="text-[9px] uppercase tracking-wider text-zinc-600">Patterns</p></div><div className="rounded-lg bg-white/3 p-3"><p className="text-lg font-semibold">{sheetQuestions.length}</p><p className="text-[9px] uppercase tracking-wider text-zinc-600">Questions</p></div></div></div><div className="absolute -right-5 -top-5 size-28 rounded-full bg-[#b7f34a]/10 blur-3xl"/></div></div></div>
      <div className="sheet-marquee absolute bottom-0 left-0 flex w-max border-t border-white/6 py-3 text-[10px] font-bold uppercase tracking-[.28em] text-zinc-700">{[1,2].map(i=><span key={i} className="whitespace-nowrap">ARRAYS + STRINGS&nbsp;&nbsp;·&nbsp;&nbsp;ARRAYS&nbsp;&nbsp;·&nbsp;&nbsp;PREFIX SUM&nbsp;&nbsp;·&nbsp;&nbsp;KADANE&nbsp;&nbsp;·&nbsp;&nbsp;BINARY SEARCH&nbsp;&nbsp;·&nbsp;&nbsp;MATRIX&nbsp;&nbsp;·&nbsp;&nbsp;</span>)}</div>
    </section>

    <section id="topics" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#b7f34a]">Main topic folders</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.04em]">{filteredTopics.length} folders ready</h2></div><div className="flex min-w-56 items-center rounded-lg border border-white/10 bg-[#101318] px-3"><Search size={15} className="text-zinc-600"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search folders" className="w-full bg-transparent px-3 py-2.5 text-xs outline-none"/></div></div>
      <div className="mt-7 grid gap-3">{filteredTopics.map((item) => <TopicFolder key={item.topic} item={item} open={Boolean(openTopics[item.topic])} openCategories={openCategories} openSubtopics={openSubtopics} progress={progress} onToggleOpen={() => toggleTopic(item.topic)} onToggleCategory={toggleCategory} onToggleSubtopic={toggleSubtopic} onToggleQuestion={toggleQuestion} onOpenNote={setNoteFor}/>)}
      {!filteredTopics.length && <Card><Empty>No folders match that search.</Empty></Card>}</div>
    </section>

    {activeQuestion&&<div className="fixed inset-0 z-[100] grid place-items-end bg-black/70 p-4 backdrop-blur-sm sm:place-items-center" onMouseDown={e=>{if(e.target===e.currentTarget)setNoteFor(undefined)}}><div className="card w-full max-w-lg p-5 shadow-2xl"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] text-[#b7f34a]">{activeQuestion.topic}{activeQuestion.category ? ` / ${activeQuestion.category}` : ""}</p><h3 className="mt-1 font-semibold">Note for {activeQuestion.question.title}</h3><p className="mt-1 text-xs text-zinc-600">{activeQuestion.subtopic}</p></div><button onClick={()=>setNoteFor(undefined)} className="grid size-8 place-items-center rounded-lg border border-white/8 text-zinc-500 hover:text-white"><X size={15}/></button></div><textarea autoFocus value={progress[activeQuestion.key]?.note??""} onChange={e=>note(activeQuestion.key, e.target.value)} placeholder="Pattern, mistake, edge case, or the one insight you want to remember..." className="mt-5 min-h-40 w-full resize-none rounded-xl border border-white/10 bg-[#090b0e] p-4 text-sm leading-6 text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-[#b7f34a]/40"/><div className="mt-4 flex items-center justify-between"><p className="text-[10px] text-zinc-600">Saved automatically on this device</p><button onClick={()=>setNoteFor(undefined)} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black"><CheckCircle2 size={14}/>Done</button></div></div></div>}
  </main>;
}
