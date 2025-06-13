"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Heading1,
    Heading2,
    Quote,
} from "lucide-react";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = "Write your content here...",
    minHeight = "200px",
}: RichTextEditorProps) {
    const [editorContent, setEditorContent] = useState(value);
    const editorRef = useRef<HTMLDivElement>(null);

    // Update editor content when value prop changes
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
        const content = e.currentTarget.innerHTML;
        setEditorContent(content);
        onChange(content);
    };

    const execCommand = (command: string, value = "") => {
        // Ensure the editor is focused
        if (editorRef.current) {
            editorRef.current.focus();
        }

        // Execute the command
        document.execCommand(command, false, value);

        // Update content after command execution
        setTimeout(() => {
            if (editorRef.current) {
                const updatedContent = editorRef.current.innerHTML;
                setEditorContent(updatedContent);
                onChange(updatedContent);
            }
        }, 10);
    };

    const formatText = (format: string, value = "") => {
        if (!editorRef.current) return;

        // Special handling for different format types
        switch (format) {
            case "h1":
                execCommand("formatBlock", "<h1>");
                break;
            case "h2":
                execCommand("formatBlock", "<h2>");
                break;
            case "quote":
                execCommand("formatBlock", "<blockquote>");
                break;
            case "unorderedList":
                execCommand("insertUnorderedList");
                break;
            case "orderedList":
                execCommand("insertOrderedList");
                break;
            default:
                execCommand(format, value);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Handle keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case "b":
                    e.preventDefault();
                    formatText("bold");
                    break;
                case "i":
                    e.preventDefault();
                    formatText("italic");
                    break;
            }
        }
    };

    return (
        <div className="border rounded-md overflow-hidden">
            <div className="bg-muted p-2 border-b flex flex-wrap gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText("bold")}
                    className="h-8 w-8 p-0"
                    title="Bold (Ctrl+B)"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText("italic")}
                    className="h-8 w-8 p-0"
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText("h1")}
                    className="h-8 w-8 p-0"
                    title="Heading 1"
                >
                    <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText("h2")}
                    className="h-8 w-8 p-0"
                    title="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText("unorderedList")}
                    className="h-8 w-8 p-0"
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText("orderedList")}
                    className="h-8 w-8 p-0"
                    title="Numbered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText("quote")}
                    className="h-8 w-8 p-0"
                    title="Quote"
                >
                    <Quote className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText("justifyLeft")}
                    className="h-8 w-8 p-0"
                    title="Align Left"
                >
                    <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText("justifyCenter")}
                    className="h-8 w-8 p-0"
                    title="Align Center"
                >
                    <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText("justifyRight")}
                    className="h-8 w-8 p-0"
                    title="Align Right"
                >
                    <AlignRight className="h-4 w-4" />
                </Button>
            </div>
            <div
                ref={editorRef}
                contentEditable
                className="p-3 outline-none text-left prose prose-sm max-w-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                style={{ minHeight, direction: "ltr" }}
                onInput={handleContentChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                suppressContentEditableWarning={true}
            />
            <style jsx>{`
                [contenteditable]:empty:before {
                    content: attr(placeholder);
                    color: #9ca3af;
                    pointer-events: none;
                }

                /* Style the formatted content */
                [contenteditable] h1 {
                    font-size: 2em;
                    font-weight: bold;
                    margin: 0.5em 0;
                }

                [contenteditable] h2 {
                    font-size: 1.5em;
                    font-weight: bold;
                    margin: 0.5em 0;
                }

                [contenteditable] blockquote {
                    border-left: 4px solid #e5e7eb;
                    padding-left: 1em;
                    margin: 1em 0;
                    font-style: italic;
                    color: #6b7280;
                }

                [contenteditable] ul,
                [contenteditable] ol {
                    margin: 1em 0;
                    padding-left: 2em;
                }

                [contenteditable] li {
                    margin: 0.25em 0;
                }
            `}</style>
        </div>
    );
}
