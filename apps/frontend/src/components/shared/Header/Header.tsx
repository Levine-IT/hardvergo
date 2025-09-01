"use client"

import { Bell, Menu, MessageCircle, Search, User } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CategoriesBar from "./components/CategoriesBar"

const Header = () => {
	const [isMobileSearchBarOpen, setIsMobileSearchBarOpen] = useState(false)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	return (
		<header
			className="flex w-full flex-col items-center justify-items-center px-4 py-2"
			data-testid="header"
		>
			<div className="flex w-full max-w-7xl flex-row items-center">
				<div className="flex">
					<Link href="/">
						<span className="from-primary bg-gradient-to-r to-stone-600 bg-clip-text text-xl font-bold text-transparent">
							HardverGo
						</span>
					</Link>
				</div>
				<div className="ml-auto flex flex-row md:ml-4 md:flex-1 lg:ml-8">
					<Button
						variant="outline"
						className="md:hidden"
						size="icon"
						onClick={() =>
							setIsMobileSearchBarOpen(!isMobileSearchBarOpen)
						}
					>
						<Search className="h-16" />
					</Button>

					<div className="hidden flex-1 flex-row items-center md:flex">
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

				<div className="ml-auto hidden flex-row md:flex">
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
						className="ml-2 md:flex md:items-center lg:ml-3 xl:ml-4"
						aria-label="Alerts"
					>
						<Bell className="mr-2" />
						<span className="hidden md:inline">Alerts</span>
					</Button>
					<Button
						variant="outline"
						className="ml-2 md:flex md:items-center lg:ml-3 xl:ml-4"
						aria-label="Sign In"
					>
						<User className="md:mr-2" />
						<span className="hidden md:inline">Sign In</span>
					</Button>
					<Button
						variant="default"
						className="ml-2 md:flex md:items-center lg:ml-3 xl:ml-4"
						aria-label="Sell Item"
					>
						<span className="md:inline">Sell Item</span>
					</Button>
				</div>

				<Button
					variant="ghost"
					size="default"
					className="ml-2 flex md:hidden"
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
				>
					<Menu className="h-8 w-8" />
				</Button>
			</div>
			{(isMobileSearchBarOpen || isMobileMenuOpen) && (
				<div className="mt-3 flex w-full items-center gap-x-2 md:hidden">
					<Input
						type="search"
						placeholder="Search..."
						className="w-full"
					/>
					<Button type="button" variant="default">
						Search
					</Button>
				</div>
			)}
			{isMobileMenuOpen && (
				<div className="w-full md:hidden">
					<div className="mt-3 flex w-full flex-row items-center">
						<Button variant="outline" className="w-1/2">
							<User className="mr-2" />
							<span>Sign In</span>
						</Button>
						<Button variant="default" className="ml-2 w-1/2">
							<span>Sell Item</span>
						</Button>
					</div>
					<div className="mt-3 flex w-full flex-col items-center">
						<Link href="#" className="mb-2 w-full text-left">
							<span className="font-bold">All Categories</span>
						</Link>
						<Link href="#" className="mb-2 w-full">
							<span>Electronics</span>
						</Link>
						<Link href="#" className="mb-2 w-full">
							<span>Fashion</span>
						</Link>
						<Link href="#" className="mb-2 w-full">
							<span>Home & Garden</span>
						</Link>
						<Link href="#" className="mb-2 w-full">
							<span>Sports & Outdoors</span>
						</Link>
						<Link href="#" className="mb-2 w-full">
							<span>Toys & Hobbies</span>
						</Link>
						<Link href="#" className="mb-2 w-full">
							<span>Automotive</span>
						</Link>
					</div>
				</div>
			)}
			<CategoriesBar className="mt-2 hidden md:block" />
		</header>
	)
}

export default Header
