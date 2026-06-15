// import { CircleHelp, Search } from "lucide-react"
// import { Bell } from "lucide-react"
// export default function TopHeader() {
//     return (
//         <header className="h-16 border-b bg-white px-2  flex items-center justify-end">
//             <div className="flex items-center gap-2 ">
//                 {/*top header   */}
//                 <div className="relative">
//                     <Search
//                         className="absolute left-3 top-1/2 
//                         -translate-y-1/2 text-gray-400"
//                         size={16}
//                     />

//                     <input
//                         type="text" placeholder="Search"
//                         className="w-72 h-10 rounded-lg border pl-8 py-1 pr-2 focus:ring-2 outline-none focus:ring-violet-500"
//                     />
//                 </div>

//                 {/* support */}
//                 <div>
//                     <button className="h-10 w-10 rounded-lg border flex items-center justify-center hover:bg-gray-100">
//                         <CircleHelp size={16} />
//                     </button>
//                 </div>
//                 {/* help */}
//                 <div>
//                     <button className="h-10 w-10 rounded-lg border flex items-center justify-center hover:bg-gray-100">
//                         <Bell size={16} />
//                     </button>
//                 </div>

//             </div>
//         </header>
//     )
// }
import { CircleHelp, Search, Bell } from "lucide-react";

export default function TopHeader() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b bg-white/95 backdrop-blur-xl px-4 shadow-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-end gap-3">
        <div className="relative w-full max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />

          <input
            type="search"
            aria-label="Search tasks"
            placeholder="Search"
            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <button
          type="button"
          aria-label="Help"
          className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
        >
          <CircleHelp size={18} />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}