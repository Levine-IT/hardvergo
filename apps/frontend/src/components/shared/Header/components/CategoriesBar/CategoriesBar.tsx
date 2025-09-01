import { Menu } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const CategoriesBar = ({ className = "" }: { className?: string }) => {
	return (
		<div className={cn("w-full max-w-7xl", className)}>
			<div className="flex min-h-8 w-full flex-row items-center overflow-scroll border-t-1 border-b-1 py-2 whitespace-nowrap">
				<Link
					href="#"
					className="flex flex-row items-center px-4 py-2 font-bold"
				>
					<Menu className="mr-2 inline" />
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
