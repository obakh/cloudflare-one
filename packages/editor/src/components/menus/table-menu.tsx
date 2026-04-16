"use client";

/**
 * Table Menu
 *
 * Floating menus for table manipulation.
 */

import {
	Button,
	cn,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@repo/ui";
import type { Editor } from "@tiptap/react";
import type { LucideIcon } from "lucide-react";
import {
	ArrowDownIcon,
	ArrowLeftIcon,
	ArrowRightIcon,
	ArrowUpIcon,
	ColumnsIcon,
	EllipsisIcon,
	EllipsisVerticalIcon,
	RowsIcon,
	TrashIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

type TableMenuItem = {
	name: string;
	command: () => void;
	icon: LucideIcon;
	className?: string;
};

type TableMenuProps = {
	readonly editor: Editor;
};

export const TableMenu = ({ editor }: TableMenuProps) => {
	const [tableLocation, setTableLocation] = useState(0);
	const [columnMenuPosition, setColumnMenuPosition] = useState({
		top: 0,
		left: 0,
	});
	const [rowMenuPosition, setRowMenuPosition] = useState({
		top: 0,
		left: 0,
	});

	const columnMenuItems: TableMenuItem[] = [
		{
			name: "Add column before",
			command: () => editor.chain().focus().addColumnBefore().run(),
			icon: ArrowLeftIcon,
		},
		{
			name: "Add column after",
			command: () => editor.chain().focus().addColumnAfter().run(),
			icon: ArrowRightIcon,
		},
		{
			name: "Delete column",
			command: () => editor.chain().focus().deleteColumn().run(),
			icon: TrashIcon,
			className: "text-destructive",
		},
	];

	const rowMenuItems: TableMenuItem[] = [
		{
			name: "Add row before",
			command: () => editor.chain().focus().addRowBefore().run(),
			icon: ArrowUpIcon,
		},
		{
			name: "Add row after",
			command: () => editor.chain().focus().addRowAfter().run(),
			icon: ArrowDownIcon,
		},
		{
			name: "Delete row",
			command: () => editor.chain().focus().deleteRow().run(),
			icon: TrashIcon,
			className: "text-destructive",
		},
	];

	const globalMenuItems: TableMenuItem[] = [
		{
			name: "Toggle header column",
			command: () => editor.chain().focus().toggleHeaderColumn().run(),
			icon: ColumnsIcon,
		},
		{
			name: "Toggle header row",
			command: () => editor.chain().focus().toggleHeaderRow().run(),
			icon: RowsIcon,
		},
		{
			name: "Delete table",
			command: () => editor.chain().focus().deleteTable().run(),
			icon: TrashIcon,
			className: "text-destructive",
		},
	];

	useEffect(() => {
		const handleSelectionUpdate = () => {
			const selection = window.getSelection();

			if (!(selection && editor.isActive("table"))) {
				return;
			}

			try {
				const range = selection.getRangeAt(0);
				let startContainer = range.startContainer as HTMLElement | string;

				if (!(startContainer instanceof HTMLElement)) {
					startContainer = range.startContainer.parentElement as HTMLElement;
				}

				const tableNode = startContainer.closest("table");

				if (!tableNode) {
					return;
				}

				setTableLocation(tableNode.offsetTop);

				const tableCell = startContainer.closest("td, th");

				if (tableCell) {
					const cellRect = tableCell.getBoundingClientRect();
					const editorRect = editor.view.dom.getBoundingClientRect();

					setColumnMenuPosition({
						top: cellRect.top - (editorRect?.top ?? 0),
						left: cellRect.left + cellRect.width / 2 - (editorRect?.left ?? 0),
					});
				}

				const tableRow = startContainer.closest("tr");

				if (tableRow) {
					const rowRect = tableRow.getBoundingClientRect();
					const editorRect = editor.view.dom.getBoundingClientRect();

					setRowMenuPosition({
						top: rowRect.top + rowRect.height / 2 - (editorRect?.top ?? 0),
						left: rowRect.left - (editorRect?.left ?? 0),
					});
				}
			} catch (error) {
				console.error("Table menu error:", error);
			}
		};

		editor.on("selectionUpdate", handleSelectionUpdate);

		return () => {
			editor.off("selectionUpdate", handleSelectionUpdate);
		};
	}, [editor]);

	if (!editor.isActive("table")) {
		return null;
	}

	return (
		<>
			{/* Column menu */}
			<div
				className="-translate-x-1/2 -translate-y-1/2 absolute flex overflow-hidden rounded-md border border-border/50 bg-background/90 shadow-xl backdrop-blur-lg"
				style={{
					top: columnMenuPosition.top,
					left: columnMenuPosition.left,
				}}
			>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button className="flex h-5 rounded-sm" size="icon" variant="ghost">
							<EllipsisIcon className="text-muted-foreground" size={16} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						{columnMenuItems.map((item) => (
							<DropdownMenuItem key={item.name} onClick={item.command} className={item.className}>
								<item.icon size={16} className="mr-2" />
								{item.name}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Row menu */}
			<div
				className="-translate-x-1/2 -translate-y-1/2 absolute flex overflow-hidden rounded-md border border-border/50 bg-background/90 shadow-xl backdrop-blur-lg"
				style={{
					top: rowMenuPosition.top,
					left: rowMenuPosition.left,
				}}
			>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button className="flex h-9 w-5 rounded-sm" size="icon" variant="ghost">
							<EllipsisVerticalIcon className="text-muted-foreground" size={16} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						{rowMenuItems.map((item) => (
							<DropdownMenuItem key={item.name} onClick={item.command} className={item.className}>
								<item.icon size={16} className="mr-2" />
								{item.name}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Global table menu */}
			<div
				className="absolute left-2/4 flex translate-x-[-50%] overflow-hidden rounded-md border border-border/50 bg-background/90 shadow-xl backdrop-blur-lg"
				style={{
					top: `${tableLocation - 50}px`,
				}}
			>
				{globalMenuItems.map((item) => (
					<Button
						className={cn("flex items-center gap-2", item.className)}
						key={item.name}
						onClick={item.command}
						size="sm"
						variant="ghost"
					>
						<item.icon size={16} />
						<span>{item.name}</span>
					</Button>
				))}
			</div>
		</>
	);
};
