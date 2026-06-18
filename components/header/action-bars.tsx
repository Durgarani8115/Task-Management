import { members } from "../data/members";
import { Button } from "../ui/button";
import { Users, Share2, Filter } from "lucide-react";

export default function MemberGroup() {
    const visibleMembers = members.slice(0, 4);

    const remainingMembers = members.length - visibleMembers.length;

    return (


        <div className="flex items-center ">
            {visibleMembers.map((member, index) => (
                <div
                    key={member.id}
                    className={`w-9 h-9 rounded-full bg-violet-500 text-white font-semibold flex items-center justify-center border-2 border-white ${index !== 0 ? "-ml-2" : ""
                        }`}
                >
                    {member.name.charAt(0).toUpperCase()}
                </div>
            ))}

            {remainingMembers > 0 && (
                <div className="-ml-2 w-9 h-9 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-sm">
                    +{remainingMembers}
                </div>
            )}




            <div className="flex flex-wrap items-center gap-2">
                <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                    <Users size={16} /> Invite
                </button>
                <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                    <Share2 size={16} /> Share
                </button>
            </div>

            
        </div>


    );
}