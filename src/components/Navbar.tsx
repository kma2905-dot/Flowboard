import { Kanban } from 'lucide-react'

export function Navbar() {
  return (
    <header className="h-16 w-full border-b border-black/10 bg-white px-6 flex items-center">
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-[10px] bg-[#0369a1]">
          <Kanban className="size-5 text-white" strokeWidth={2} />
        </div>
        <span className="text-base text-[#0a0a0a]">FlowBoard</span>
      </div>
    </header>
  )
}
