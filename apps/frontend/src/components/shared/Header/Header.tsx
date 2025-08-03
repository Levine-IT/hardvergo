"use client";

import { Bell, Menu, MessageCircle, Search, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CategoriesBar from "./components/CategoriesBar";

const Header = () => {
	const [isMobileSearchBarOpen, setIsMobileSearchBarOpen] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	return (
		<header
			className="w-full px-4 py-2 flex flex-col items-center justify-items-center"
			data-testid="header"
		>
			<div className="flex flex-row items-center w-full max-w-7xl">
				<div className="flex">
					<Link href="/">
						<span className="text-xl font-bold bg-gradient-to-r from-primary to-stone-600 bg-clip-text text-transparent">
							HardverGo
						</span>
					</Link>
				</div>
				<div className="md:flex-1 flex flex-row ml-auto md:ml-4 lg:ml-8">
					<Button
						variant="outline"
						className="md:hidden"
						size="icon"
						onClick={() => setIsMobileSearchBarOpen(!isMobileSearchBarOpen)}
					>
						<Search className="h-16" />
					</Button>

					<div className="hidden md:flex flex-row items-center flex-1">
						<Input
							type="search"
							placeholder="Search for electronics, fashion, home & garden..."
							className="w-full sm:max-w-sm md:max-w-md"
						/>
						<Button type="button" className="ml-2">
							Search
						</Button>
					</div>
				</div>

				<div className="hidden flex-row ml-auto md:flex">
					<Button
						variant="ghost"
						className="md:flex md:items-center"
						aria-label="Messages"
					>
						<MessageCircle className="mr-2" />
						<span className="hidden md:inline">Messages</span>
					</Button>
					<Button
						variant="ghost"
						className="md:flex md:items-center ml-2 lg:ml-3 xl:ml-4"
						aria-label="Alerts"
					>
						<Bell className="mr-2" />
						<span className="hidden md:inline">Alerts</span>
					</Button>
					<Button
						variant="outline"
						className="md:flex md:items-center ml-2 lg:ml-3 xl:ml-4"
						aria-label="Sign In"
					>
						<User className="md:mr-2" />
						<span className="hidden md:inline">Sign In</span>
					</Button>
					<Button
						variant="default"
						className="md:flex md:items-center ml-2 lg:ml-3 xl:ml-4"
						aria-label="Sell Item"
					>
						<span className="md:inline">Sell Item</span>
					</Button>
				</div>

				<Button
					variant="ghost"
					size="default"
					className="flex ml-2 md:hidden"
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
				>
					<Menu className="w-8 h-8" />
				</Button>
			</div>
			{(isMobileSearchBarOpen || isMobileMenuOpen) && (
				<div className="flex items-center gap-x-2 w-full mt-3 md:hidden">
					<Input type="search" placeholder="Search..." className="w-full" />
					<Button type="button" variant="default">
						Search
					</Button>
				</div>
			)}
			{isMobileMenuOpen && (
				<div className="md:hidden w-full">
					<div className="flex flex-row items-center w-full mt-3">
						<Button variant="outline" className="w-1/2">
							<User className="mr-2" />
							<span>Sign In</span>
						</Button>
						<Button variant="default" className="ml-2 w-1/2">
							<span>Sell Item</span>
						</Button>
					</div>
					<div className="w-full mt-3 flex flex-col items-center">
						<Link href="#" className="w-full mb-2 text-left">
							<span className="font-bold">All Categories</span>
						</Link>
						<Link href="#" className="w-full mb-2">
							<span>Electronics</span>
						</Link>
						<Link href="#" className="w-full mb-2">
							<span>Fashion</span>
						</Link>
						<Link href="#" className="w-full mb-2">
							<span>Home & Garden</span>
						</Link>
						<Link href="#" className="w-full mb-2">
							<span>Sports & Outdoors</span>
						</Link>
						<Link href="#" className="w-full mb-2">
							<span>Toys & Hobbies</span>
						</Link>
						<Link href="#" className="w-full mb-2">
							<span>Automotive</span>
						</Link>
					</div>
				</div>
			)}
			<CategoriesBar className="mt-2 hidden md:block" />
		</header>
	);
};

export default Header;
