import { Menu } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const CategoriesBar = ({ className = "" }: { className?: string }) => {
	return (
		<div className={cn("max-w-7xl w-full", className)}>
			<div className="min-h-8 py-2 w-full overflow-scroll border-t-1 border-b-1 flex flex-row items-center  whitespace-nowrap">
				<Link
					href="#"
					className="px-4 py-2 font-bold flex flex-row items-center"
				>
					<Menu className="inline mr-2" />
					All Categories
				</Link>
				<Link href="#" className="px-4 py-2">
					Category 2
				</Link>
				<Link href="#" className="px-4 py-2">
					Category 3
				</Link>
				<Link href="#" className="px-4 py-2">
					Category 4
				</Link>
				<Link href="#" className="px-4 py-2">
					Category 5
				</Link>
				<Link href="#" className="px-4 py-2">
					Category 6
				</Link>
			</div>
		</div>
	);
};

export default CategoriesBar;
